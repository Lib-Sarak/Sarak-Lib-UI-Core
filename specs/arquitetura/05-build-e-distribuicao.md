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

Dez etapas, e **a ordem não é arbitrária** — cada uma depende do que a anterior produziu ou validou:

| # | Etapa | O que faz | Por que aqui |
| --- | --- | --- | --- |
| 1 | `catalog:check` | Regenera `docs/component-catalog.{json,md}` por AST e compara com o commitado; divergência = `exit 1` | Primeiro porque é a fonte que a etapa 4 reusa |
| 2 | `barrel:check` | Confere que todo componente consumidor-facing e seu `<Nome>Props` estão em `src/index.ts` | Antes de compilar: empacotar um barril incompleto é custo desperdiçado |
| 3 | `zero-brand:check` | Varre `src/` por AST buscando literais de marca da lib fora da allowlist | Antes do bundle, para marca não vazar para o código publicado |
| 4 | `guide:check` | Regenera o kit `sarak-ui/` e compara; arquivo defasado = `exit 1` | Depois da 1: reusa o mesmo pipeline de AST já validado |
| 5 | `build:js` | `tsup src/index.ts` — ESM + CJS + DTS, com `--shims --clean --minify` | Só depois de os 4 gates passarem |
| 6 | `build:css` | Tailwind CLI sobre `src/styles/sarak-base.css` → `dist/sarak.css` (minificado) | — |
| 7 | `build:css:scoped` | lightningcss reescreve os seletores → `dist/sarak-scoped.css` | **Lê `dist/sarak.css`**; aborta com `exit 1` se ele não existir |
| 8 | `copy-base-css.mjs` | Copia `src/styles/` **inteiro** para `dist/styles/` | Preserva a cadeia de `@import` dos parciais, para o export `./sarak-base.css` resolver dentro de `dist/` sem expor `src/` |
| 9 | `inject-css.mjs` | Substitui o placeholder pelo CSS real em **todo** `.js`/`.cjs` de `dist/` | Precisa dos bundles (5) **e** do CSS (6) |
| 10 | `generate-build-info.mjs` | Grava `dist/BUILD_INFO.json` | Última de propósito: carimba o `dist/` já finalizado |

> **Os 4 gates rodam ANTES de compilar, e isso é intencional.** Um build vermelho por documentação defasada não é inconveniência — é o desenho. Significa que **é impossível publicar uma versão cujo catálogo ou kit não bata com a API**.

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

`scripts/check-package-contents.mjs` roda `npm pack --dry-run --json` e lê a lista real de arquivos do tarball. Ele cobra **duas coisas**, e a segunda é a que costuma ser esquecida:

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

# 7. O CLI `bin/sarak-ui.mjs`

Três subcomandos, delegando para módulos que já existiam:

| Comando | O que faz |
| --- | --- |
| `init` | Gera o starter padrão (Provider + Shell + módulo de exemplo, Vite puro, sem backend), grava as peerDependencies e copia o kit `sarak-ui/` |
| `check` | Diz se a lib instalada está atualizada. Funciona em monorepo (sobe a árvore atrás do lockfile) e em dependência local (`file:`/`link:`). Com `--notify`, imprime só se houver atualização e sai sempre com 0 |
| `refresh` | Re-sincroniza o kit e as cópias movidas depois de atualizar a lib |

Comando desconhecido imprime `comando desconhecido: "X"` **e a lista de comandos válidos** antes do help, e sai com 1 — antes ele despejava só a ajuda do `init`, sem dizer o motivo. Sem terminal interativo e sem `--yes` nem flags suficientes, o `init` falha com código 1 em vez de sair em silêncio sem escrever nada.

O fluxo do consumidor ponta a ponta é assunto da spec de instalação e atualização.
