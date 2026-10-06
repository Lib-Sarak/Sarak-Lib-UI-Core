---
tipo: "arquitetura"
titulo: "Build, empacotamento e distribuição"
dominio: "Arquitetura / Build / Empacotamento"
status: "🟢 Vigente"
tags: ["arquitetura", "build", "tsup", "empacotamento", "css", "cli", "distribuicao"]
relacionados: ["[[03-superficie-publica]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[007-distribuicao-por-git]]"]
---

# 1. Propósito

Como o artefato é **produzido** e o que ele **contém**. Este documento cobre o mecanismo; a *política* de número de versão é da spec de versionamento, e a decisão de distribuir por Git está em [[007-distribuicao-por-git]].

# 2. O pipeline `npm run build`, na ordem exata

**A lista exata e a ordem são as do script `build` do `package.json`** — é a fonte, e cresce a cada gate
novo. Esta tabela agrupa as etapas por **fase**, que é o que não muda: cada fase depende do que a anterior
produziu ou validou.

| Fase | Etapas | O que faz | Por que aqui |
| --- | --- | --- | --- |
| 1 · Gates de fonte | `token-types:check`, `catalog:check`, `barrel:check`, `zero-brand:check`, `guide:check`, `deep-import:check` | Leem `src/`, o schema, o kit e o `package.json`; regenerar e comparar, divergência = `exit 1` | Antes de compilar: empacotar um barril incompleto ou um kit defasado é custo desperdiçado |
| 2 · `build:js` | `generate-build-info.mjs --prepare` → `tsup src/index.ts` (ESM + CJS + DTS, `--shims --clean --minify`) | O `--prepare` calcula a **tríade de build** (`libVersion`, `baseCommitShort`, `builtAt`) e a grava em `src/core/Provider/buildInfo.ts` e `src/buildInfo.ts`; o tsup empacota esses arquivos junto com o resto (§6) | A tríade tem de existir **antes** do empacotamento, ou o bundle não a carrega |
| 3 · Gates do artefato | `public-types:check`, `prefix:check`, `kit-names:check` | Leem `dist/index.d.ts` | Só têm o que ler depois da fase 2 |
| 4 · CSS | `build:css` → `build:css:scoped` → `copy-base-css.mjs` | Tailwind CLI → `dist/sarak.css`; lightningcss reescreve seletores → `dist/sarak-scoped.css` (**lê `dist/sarak.css`** e aborta se ele não existir); `src/styles/` inteiro → `dist/styles/`, para o export `./sarak-base.css` resolver dentro de `dist/` | — |
| 5 · `inject-css.mjs` | — | Substitui o placeholder pelo CSS real em **todo** `.js`/`.cjs` de `dist/` | Precisa dos bundles (2) **e** do CSS (4) |
| 6 · `generate-build-info.mjs` | — | Grava `dist/BUILD_INFO.json` **lendo** o `buildInfo.ts` da fase 2 — não recalcula a tríade | Última de propósito: carimba o `dist/` já finalizado, com os mesmos valores do bundle |

> **Os gates de fonte rodam ANTES de compilar, e isso é intencional.** Um build vermelho por documentação defasada não é inconveniência — é o desenho. Significa que **é impossível publicar uma versão cujo catálogo ou kit não bata com a API**.

`package:check` **não** está no `build` — ele roda em `prepublishOnly`, junto com o build completo, e exige `dist/` já construído.

## 2.1 A armadilha MEDIDA do tsup

A flag `--external` do `build:js` lista **17 libs**, e todas as 17 são `peerDependencies`. Duas peers (`axios` e `tailwindcss`) **não** estão na flag. E as 3 `dependencies` reais — `@phosphor-icons/react`, `@tabler/icons-react`, `dompurify` — **também não estão**, porque não precisam:

> ⚠️ **O tsup externaliza `dependencies` sozinho, independentemente da flag.** Um harness de medição que só espelha a lista `--external` **MENTE** sobre o que está no bundle. Foi exatamente essa suposição que produziu uma hipótese refutada sobre o peso do bundle ([[03-superficie-publica]] §7). **Meça o `dist/`, não a flag.**

# 3. O contrato do pacote

**Metadados de saída:**

| Campo | Valor |
| --- | --- |
| `main` | `./dist/index.cjs` |
| `module` | `./dist/index.js` |
| `types` | `./dist/index.d.ts` |
| `style` | `./dist/sarak.css` |
| `bin` | `{ "sarak-ui": "./bin/sarak-ui.mjs" }` |

**`files`:** `dist`, `bin` (com `!bin/**/__tests__/**`), `docs`, `sarak-ui`.

**`exports`:** a raiz (`.`, com `types`/`import`/`require`), mais `./sarak.css`, `./sarak-scoped.css` e `./sarak-base.css` — cada um também na forma `./dist/…` para compatibilidade com quem já importava pelo caminho literal. Não há `typesVersions`.

## 3.1 O gate `package:check`

`gates/scripts/contrato/check-package-contents.mjs` roda `npm pack --dry-run --json` e lê a lista real de arquivos do tarball. Ele cobra **duas coisas**, e a segunda é a que costuma ser esquecida:

**PROIBIDOS** — por prefixo: `src/` (**sem exceção**), `specs/`, `playwright/`, `__snapshots__/`, `Template-Ts/`. Por nome ou sufixo: `vitest.config.ts`, `.test.mjs`, `.test.ts`, `.test.tsx`.

**OBRIGATÓRIOS** — 31 caminhos, agrupados em três famílias:

- **O artefato:** `dist/index.{js,cjs,d.ts}`, `dist/sarak.css`, `dist/styles/sarak-base.css`, `dist/BUILD_INFO.json`.
- **O CLI que o consumidor executa:** `bin/sarak-ui.mjs` e os 11 módulos de `bin/scaffold/` que `init`/`check`/`refresh` carregam em runtime.
- **O kit do consumidor:** os 12 caminhos de `sarak-ui/` (guia, START-HERE, skill, catálogo, carimbo, templates) e os 2 do refresher.

> **Por que ausência é tão grave quanto excesso.** Um `src/` vazado é ruído e superfície indevida. Mas um `bin/scaffold/*.mjs` faltando **quebra o CLI do consumidor em runtime**, e um `sarak-ui/` faltando significa publicar a biblioteca **sem as instruções de uso** — o consumidor instala e não tem como saber o que existe. Os dois lados derrubam o gate.

O tarball tem hoje **77 arquivos** (779,6 KB comprimido / 3,8 MB descompactado).

# 4. Dependências: 3 contra 19

| Tipo | Quais | Por quê |
| --- | --- | --- |
| **`dependencies`** (3) | `@phosphor-icons/react`, `@tabler/icons-react`, `dompurify` | São **implementação interna** que o consumidor não escolhe: as duas famílias de ícone que o `IconMap` curado resolve, e o sanitizador que é o canal único de conteúdo rico. Se fossem peers, o consumidor teria de instalá-las sem nunca importá-las. |
| **`peerDependencies`** (19) | React, React DOM, `tailwindcss`, `framer-motion`, `lucide-react`, `recharts`, `echarts`(+`-for-react`), `reactflow`, `react-grid-layout`, `react-markdown`, `react-syntax-highlighter`, `react-dropzone`, `pdfjs-dist`, `clsx`, `tailwind-merge`, `date-fns`, `@tanstack/react-virtual`, `axios` | São **do aplicativo**, não da lib. Duplicar React ou Tailwind quebra; e as libs pesadas só fazem sentido se o consumidor as controlar (versão, configuração, e a decisão de nem instalá-las se não usar o componente que as exige). |

A divisão segue uma pergunta: *o consumidor pode ter uma opinião sobre esta versão?* Se sim, é peer.

**Peer obrigatória × opcional.** Peer que o barril ou código eager importa é **obrigatória**; peer que só um
motor carregado sob demanda importa — ou que nenhum código alcançável importa em runtime — é **opcional**,
declarada em `peerDependenciesMeta`. O consumidor que não usa o motor não a instala. A lista de cada lado está
em [[13-instalacao-e-atualizacao]] §2.3. O `package.json` declara também `engines.node`.

# 5. CSS zero-config — é contrato, não conveniência

**Sem a injeção automática de CSS, os componentes não têm forma geométrica.** O Tailwind interno da lib não é processado no build do consumidor; se o stylesheet não chegar, os componentes renderizam sem geometria. Por isso a injeção é **parte do contrato público**, não uma comodidade.

O mecanismo tem duas metades:

**Em build time:** `src/core/Provider/__sarakCss.ts:8` exporta `SARAK_CSS = '__SARAK_CSS_PLACEHOLDER__'`. A etapa 9 do pipeline substitui esse literal pelo CSS real em **todos** os `.js`/`.cjs` de `dist/` — varre o diretório inteiro por causa do code-splitting do ESM, e aborta se nenhuma ocorrência for substituída. Em desenvolvimento e em teste, rodando de `src/`, o placeholder permanece.

**Em runtime:** `injectSarakStyles(SARAK_CSS)` é chamado no **topo do módulo** (`SarakUIProvider.tsx:11`), fora de qualquer componente — roda **na importação**, antes de o primeiro Provider montar, para não haver flash de conteúdo sem estilo. A função é SSR-safe, idempotente por `id` da tag, e no-op quando o documento está marcado como embarcado.

**A exceção SSR/Next:** a injeção por JS só acontece depois de o bundle do cliente executar, o que pode gerar FOUC durante SSR. O consumidor **pode** importar `@sarak/lib-ui-core/sarak.css` manualmente no ponto de entrada renderizado no servidor. É opcional e existe só para esse caso.

**Quando falha, a lib avisa.** Em desenvolvimento, `useSarakStylesheetGuard` verifica via uma custom property se o CSS certo carregou, e emite `console.error` distinto para cada modo — apontando o import manual como correção no modo app, e o `sarak-scoped.css` no embarcado.

## 5.1 A variante escopada

`scripts/build-scoped-css.mjs` usa o `transform` do lightningcss com um visitor de **`Selector`** para reescrever todo seletor exigindo `.sarak-scope`.

Dois detalhes registrados no próprio script:

- **O visitor é de `Selector`, não de `Rule`** — o de `Rule` não conseguia round-tripar o `dist/sarak.css` real.
- **`@keyframes`, `@font-face` e `@property` permanecem globais de propósito**: são registros sem seletor e não alteram nenhum elemento do host por si só.

A classe tem de casar com `SARAK_SCOPE_CLASS` do runtime ([[01-forma-do-produto-e-modos-de-consumo]] §5).

# 6. Identidade de build

`dist/BUILD_INFO.json` traz `baseCommit`, `baseCommitShort`, `builtAt`, `libVersion` e um campo `note` autoexplicativo.

> ⚠️ **`baseCommit` é SEMPRE um commit atrás, e isso é estrutural.** O `dist/` — incluindo o próprio `BUILD_INFO.json` — é commitado **depois** de gerado, e o hash de um commit depende do seu conteúdo: gravar dentro dele o próprio hash é auto-referência circular. O SHA lido no build é sempre o commit **anterior** ao que publica. O campo se chamava `commit` e produziu um **falso negativo real** num consumidor recém-atualizado.
>
> **Para saber se está atualizado, use `sarak-ui check` ou o `resolved` do lockfile. NUNCA o `BUILD_INFO`.**

**O selo de build — a mesma tríade, dentro do bundle.** `libVersion`, `baseCommitShort` e `builtAt` têm
**fonte única** por build: o `generate-build-info.mjs --prepare` os calcula uma vez, antes do tsup, e os grava
em dois arquivos gerados e rastreados — `src/core/Provider/buildInfo.ts` (a tríade mais `baseCommit` e `note`,
para uso interno) e `src/buildInfo.ts` (só a tríade, exportada pelo barril como `SARAK_BUILD_INFO`). O último
passo do build lê o primeiro deles para gravar o `BUILD_INFO.json`, de modo que bundle e arquivo em disco
carregam os mesmos valores. Na página, a tríade aparece no atributo `data-sarak-build-info` de um elemento
**da lib**: no modo de aplicação, o `<style id="sarak-ui-core-styles">` que a lib injeta; no embarcado, a raiz
`.sarak-scope` — nunca um elemento do host, e nunca como texto renderizado (R12). O selo é **lido**, nunca
comparado com um literal dentro da lib: comparação com valor de build vira constante no empacotador.

**O `build-info:check` confere as duas metades:** o `BUILD_INFO.json` contra os dois `buildInfo.ts` e contra
`dist/index.js` e `dist/index.cjs`. O limite está no cabeçalho do script (R18): nos bundles a conferência é por
substring, e o chunk ESM que escreve o atributo tem nome com hash e não é lido.

As três perguntas e quem responde cada uma — *estou atualizado?*, *o que está instalado?*, *o que a página
executa?* — estão em [[13-instalacao-e-atualizacao]] §10.

# 7. O CLI `bin/sarak-ui.mjs`

Três subcomandos, delegando para módulos que já existiam:

| Comando | O que faz |
| --- | --- |
| `init` | Gera o starter padrão (Provider + Shell + módulo de exemplo, Vite puro, sem backend), grava as peerDependencies e copia o kit `sarak-ui/` |
| `check` | Diz se a lib instalada está atualizada. Funciona em monorepo (sobe a árvore atrás do lockfile) e em dependência local (`file:`/`link:`). Com `--notify`, imprime só se houver atualização e sai sempre com 0 |
| `refresh` | Re-sincroniza o kit e as cópias movidas depois de atualizar a lib |

Comando desconhecido imprime `comando desconhecido: "X"` **e a lista de comandos válidos** antes do help, e sai com 1 — antes ele despejava só a ajuda do `init`, sem dizer o motivo. Sem terminal interativo e sem `--yes` nem flags suficientes, o `init` falha com código 1 em vez de sair em silêncio sem escrever nada.

O fluxo do consumidor ponta a ponta é assunto da spec de instalação e atualização.
