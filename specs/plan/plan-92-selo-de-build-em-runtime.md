---
tipo: "plan"
titulo: "Expor em runtime o selo do build, e deixar a instalação honesta"
objetivo: "Permitir responder em um olhar qual build da lib o navegador executa, e fazer a instalacao pedir so o que o consumidor usa, com as tres camadas de cache e o kit documentados como sao"
dominio: "Sarak-Lib-UI-Core / Build e distribuição / Identidade de build"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "build", "identidade-de-build", "consumidor", "cache"]
relacionados: ["[[13-instalacao-e-atualizacao]]", "[[05-build-e-distribuicao]]", "[[03-superficie-publica]]", "[[08-identidade-do-host-e-zero-marca]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/13-instalacao-e-atualizacao.md + arquitetura/05-build-e-distribuicao.md + arquitetura/03-superficie-publica.md + specs/12-kit-do-consumidor.md + specs/03-versionamento-e-release.md"
---

# 1. Objetivo

Com a lib montada numa página, uma pessoa (pelo inspetor do navegador) ou um agente (por uma leitura do
`document`) vê **qual build o navegador está executando** — versão, commit-base e data — e consegue comparar
com o build que está instalado em disco.

# 2. Contexto

Entre o `dist/` da lib e a tela do consumidor há duas camadas de cache, e as duas falham em silêncio
([[13-instalacao-e-atualizacao]] §9.1). A segunda — o pré-bundle do bundler — re-otimiza por lockfile, versão
e config, **nunca por conteúdo**: com dependência local, o dev server segue servindo o build anterior.

**Nada na lib diz, em runtime, qual build está no ar.** Os sinais que existem respondem outra pergunta:
`sarak-ui check` compara o **pacote**; `dist/BUILD_INFO.json` descreve o **artefato em disco**. Medir contra
código velho é indistinguível de defeito da lib — já custou dois ciclos de diagnóstico, e três rodadas de
investigação numa lib que estava certa.

**Por que agora:** a próxima etapa do repositório é validar a lib em sistemas que a aplicam, alguns em
versões anteriores. *"Que build este sistema está executando?"* passa a ser a primeira pergunta de toda
medição, e hoje ela não tem resposta na página.

**O que existe para aproveitar.** `scripts/generate-build-info.mjs` já calcula `libVersion`,
`baseCommitShort` e `builtAt` e os grava em `dist/BUILD_INFO.json` — como **último** passo do `npm run build`,
depois de o JavaScript já ter sido empacotado. O `build-info:check` confere o arquivo.

⚠️ **Três armadilhas conhecidas:**

- **O selo tem de estar dentro do bundle**, não ser lido do `BUILD_INFO.json` em runtime. A pergunta é sobre
  o código que o navegador executa; um arquivo ao lado responderia sobre o disco de novo.
- **`baseCommit` é sempre um commit atrás** ([[13-instalacao-e-atualizacao]] §10) — o hash de um commit não
  contém a si mesmo. O selo identifica o **build**; não responde *"estou atualizado?"*, que continua sendo do
  `sarak-ui check`.
- **Valor injetado em tempo de build pode ser dobrado pelo empacotador.** Comparar o valor injetado com um
  literal igual vira constante, e o ramo morto é apagado em silêncio. O selo deve ser **lido**, não
  comparado, dentro da lib.

**Lote 2 — a instalação, medida nos consumidores (2026-10-02):**

| Fato | Onde |
|---|---|
| **Há uma terceira camada de cache, e a spec diz que ela não existe.** O Vite serve a dependência pré-empacotada com `cache-control: max-age=31536000,immutable`, sob uma chave `?v=` calculada do lockfile, da config e dos **caminhos** das dependências — nunca do conteúdo. Refazer o pré-bundle não muda a chave, então o navegador normal segue com o bundle antigo por um ano, e a aba anônima recebe o novo. Foi o "versões diferentes em navegadores diferentes" do ERP: três builds da lib em jogo, todos `6.3.0`. A `13-instalacao` §9.1 afirma que *"recarregar, hard-refresh ou guia anônima não alcançam"* — está errada | `vite@5.4.21` (`getOptimizedBrowserHash`, `depsFromOptimizedDepInfo`); `specs/specs/13-instalacao-e-atualizacao.md` §9.1 |
| **Os 19 peers são obrigatórios** (sem `peerDependenciesMeta`): o `login-completo` instalou `echarts`, `pdfjs-dist`, `reactflow`, `react-grid-layout` e `react-markdown` para uma tela de login; o Cripto não instala (Tailwind 3 e `date-fns` 2 contra as faixas) | `package.json` (`peerDependencies`) |
| **O kit tem seis demandas abertas do ERP** desde 2026-08-29, todas conferidas em 2026-10-02 e ainda válidas: (1) o modo "apontar" para o kit não é oficial no `START-HERE`; (2) a instalação pressupõe a topologia 1 — em monorepo a raiz que importou não é a do repositório; (3) `docs/migracoes.md` não viaja no kit; (4) `VERSION` é `chave=valor` ad hoc; (5) `templates/README.md` manda copiar para `packages/ui-kit/themes.ts` quando um pacote real precisa de `src/` e `package.json`; (6) o catálogo não lista variáveis que os componentes da lib usam e o consumidor acaba consumindo — nove nomes `--sarak-*` emitidos ficam fora de `tokens.cssVars`, e `--color-theme-card`, `--border-color`, `--theme-title` não têm equivalente público | `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\packages\ui-kit\DEMANDAS.md` (só leitura) · `sarak-ui/START-HERE.md` · `sarak-ui/VERSION` · `sarak-ui/templates/README.md` · `sarak-ui/catalog.json` |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `scripts/generate-build-info.mjs` e o teste dele em `scripts/__tests__/` — a tríade passa a ter fonte
  única para o bundle e para o `BUILD_INFO.json`, e o `--check` passa a conferir os dois.
- `package.json` — **só** os scripts `build` e `build:js`, no que for necessário para a tríade existir antes
  do empacotamento, **e a lista de `git add` do script `version`**: a tríade vive em arquivos gerados e
  rastreados em `src/`, e o gancho `version` que regenera o build precisa levá-los ao mesmo commit da tag.
  *(Ampliado em 2026-10-04 pelo revisor: sem isso o release deixa a árvore suja e a tag com `src/` diferente
  do `dist/`.)*
- `src/` — o ponto que carrega o selo e o ponto que o expõe na página, mais o barril (`src/index.ts`) se o
  selo for exportado.
- Testes ao lado do que mudou (`__tests__/`).
- `.agents/skills/ui-integra-consumidor/` — onde o kit do consumidor ensina a ler o selo. O arquivo aparece
  duas vezes no `git status` (`.claude/skills` é symlink rastreado sob os dois prefixos): é esperado.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — regenerados. Nunca à mão.

**Lote 2 — instalação e kit**
- `package.json` — `peerDependenciesMeta` (optional) para todo peer que só um motor lazy importa; `engines`, se faltar.
- `sarak-ui/START-HERE.md` e `sarak-ui/templates/README.md` — prosa fora dos marcadores: o modo "apontar", as topologias, o caminho real do pacote `ui-kit`.
- `scripts/consumer-kit/**` — `VERSION` em JSON (ou o carimbo dentro de `catalog.json`), `docs/migracoes.md` copiado para o kit, e `tokens.cssVars` listando toda variável `--sarak-*` que a lib emite.
- `.agents/skills/ui-integra-consumidor/**` — o kit ensina as três camadas de cache e o que fazer em consumo por `file:`.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Qualquer texto visível na interface do host.** O selo é atributo ou valor legível por inspeção, nunca
  conteúdo renderizado — é a R12.
- **Qualquer elemento que não seja da lib, no modo embarcado.** Lá a lib é hóspede.
- `bin/` — o `sarak-ui check` e o aviso de cache ficam como estão.
- O formato e as chaves de `dist/BUILD_INFO.json`.
- A lista de `--external` do `build:js`.
- `browser-tests/` — as plans 89 e 90 mexem ali.
- Renomear as variáveis legadas (`--theme-*`, `--color-theme-*`) que os componentes da lib usam por dentro: fica declarado que não são contrato; a renomeação é trabalho próprio, se um dia valer.
- Qualquer plugin de Vite ou código que leia o cache do bundler do consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | §9.1 (as duas camadas de cache e o procedimento) e §10 (a armadilha do `BUILD_INFO`) |
| Spec fixa | `specs/arquitetura/05-build-e-distribuicao.md` | §2 (o pipeline do build, na ordem exata), §2.1 (a armadilha medida do tsup) e §6 (identidade de build) |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §4 e §4.3 — barril, e a convenção de prefixo por espécie de nome |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | o que conta como marca vazando para o host |
| Spec fixa | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | o modo embarcado — onde a lib pode e não pode escrever |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R12, R24, R29 (todo artefato gerado bate com a fonte), R34 e R37 |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | de onde o kit do consumidor é gerado |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler os gates que o `build` roda |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes |
| **Skill** | `ui-integra-consumidor` | é a fonte do kit do consumidor — e é editada aqui |
| Código | `scripts/generate-build-info.mjs` | o cabeçalho explica `baseCommit` e os limites do `--check` |
| Código | `package.json` | os scripts `build` e `build:js` |
| Código | `src/core/Provider/SarakUIProvider.tsx` | o ponto de montagem da lib |
| Código | `src/core/Design/components/DesignScope.tsx` | o elemento de escopo do modo embarcado |

# 5. Instruções de execução

1. **Fonte única da tríade.** `libVersion`, `baseCommitShort` e `builtAt` são calculados **uma vez** por
   build, antes do empacotamento, e são os mesmos no bundle e em `dist/BUILD_INFO.json`.
2. **O selo dentro do bundle**, nos dois formatos (ESM e CJS).
3. **O selo na página.** Com a lib montada, um elemento **da lib** carrega um atributo com a tríade. No modo
   de aplicação e no embarcado; no embarcado, nunca num elemento do host. Registre no resumo qual elemento e
   por quê.
4. **O selo no código.** Se ele for exportado pelo barril, o nome segue a convenção de prefixo da espécie
   dele, e entra no catálogo.
5. **O `build-info:check` passa a conferir o bundle.** Reprova quando o selo dentro de `dist/index.js` não
   bate com `dist/BUILD_INFO.json`. Caso que falha, por fixture: um `dist/` sintético com as duas metades
   divergentes. O cabeçalho de limites do script (R18) acompanha.
6. **Testes:** a lib montada expõe o atributo, nos dois modos; sem Provider, nada quebra (R34); em ambiente
   sem `document`, nada quebra.
7. **O kit do consumidor** passa a ensinar a leitura: como ver o selo na página, e como compará-lo com
   `node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json`. Iguais: o navegador executa o que está instalado.
   Diferentes: a segunda camada de cache está defasada, e o procedimento é o da
   [[13-instalacao-e-atualizacao]] §9.1.
8. `npm run guide`, `npm run build`, `npm run build-info:check`, `npm run dev-kit`.
9. `npm run zero-brand:check` → verde. `npx tsc --noEmit` → zero erros. `npx vitest run` →
   verde. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — instalação e kit**

10. **Peers opcionais.** Todo peer que só um motor carregado sob demanda importa fica `optional` em
    `peerDependenciesMeta`; o que o barril importa eager continua obrigatório. Registre no resumo a lista
    com o motivo de cada um. O `package:check` e o job `install-sha` continuam verdes.
11. **As três camadas de cache.** A skill fonte (e por ela o kit) descreve as três — store do gerenciador,
    pré-bundle do bundler, cache do navegador com `immutable` — e o procedimento para consumo por `file:`:
    o selo do lote 1 é o que diz em qual camada se está. Nada de plugin: é instrução.
12. **As seis demandas do kit:** o `START-HERE` passa a ter o modo "apontar" como oficial e as topologias
    (a raiz é a do pacote que importou); `docs/migracoes.md` entra no kit; `VERSION` vira JSON ou carimbo em
    `catalog.json` (com teste); `templates/README.md` aponta o caminho de um pacote real; `tokens.cssVars` lista
    toda variável `--sarak-*` emitida (medida pelo mesmo registro que o `auditor_ghostvars` usa), e a spec
    passa a declarar que `--theme-*`/`--color-theme-*` são internas.
13. `npm run guide` · `npm run guide:check` · `npm run package:check` · `npx vitest run` → verdes. verde.

# 6. Critérios de aceite

- [ ] Depois de `npm run build`, o selo dentro de `dist/index.js` e de `dist/index.cjs` traz a mesma tríade
      de `dist/BUILD_INFO.json`.
- [ ] Com a lib montada, `document.querySelector` pelo atributo do selo devolve um elemento **da lib**, cujo
      valor contém versão, commit-base e data — nos dois modos.
- [ ] No modo embarcado, nenhum elemento fora do escopo da lib recebe o atributo.
- [ ] `npm run build-info:check` reprova um `dist/` de fixture com bundle e `BUILD_INFO.json` divergentes, e
      aprova o real.
- [ ] Nenhum texto do selo é renderizado como conteúdo; `npm run zero-brand:check` verde.
- [ ] O kit do consumidor regenerado ensina a ler o selo e a compará-lo com o `BUILD_INFO.json` instalado.
- [ ] `npm run build` verde — inclusive `barrel:check`, `public-types:check`, `prefix:check` e
      `catalog:check`, se o selo for exportado.
- [ ] `npx tsc --noEmit` com zero erros; suíte verde.
- [ ] **Lote 2:** `peerDependenciesMeta` cobre os peers de motor lazy; `npm run package:check` verde.
- [ ] O kit descreve as três camadas de cache e o procedimento por `file:`; a `13` §9.1 deixa de afirmar que
      aba anônima não alcança.
- [ ] As seis demandas do kit estão fechadas, cada uma com a evidência no resumo; `tokens.cssVars` contém
      os nove nomes que o ERP consome e o catálogo não listava.

# 7. Como verificar (uso do revisor)

**Gate:** `--check` do gerador — o `build-info:check` passa a cobrar que o selo embutido no bundle bate com
`dist/BUILD_INFO.json`. É a forma certa porque o selo é **arquivo derivado** de outra fonte.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- `npm run build`, e então:
  - `grep -c "<valor de builtAt do BUILD_INFO.json>" dist/index.js dist/index.cjs` → presente nos dois;
  - `npm run build-info:check` → verde.
- Mutação por fixture, sem tocar o worktree: chamar a função do `--check` com um `dist/` sintético divergente
  → reprova.
- **O selo denuncia build velho?** Buildar, guardar o valor, buildar de novo → o `builtAt` do bundle mudou
  junto com o do `BUILD_INFO.json`.
- Leitura do diff de `src/` → o selo é lido, nunca comparado com literal; nenhum texto renderizado.
- `npm run zero-brand:check` · `npx tsc --noEmit` · `npx vitest run` → verde, 0 erros, verde.
- Leitura do kit regenerado em `sarak-ui/` → a instrução de leitura existe.

# 8. Destino da síntese

**Destino:** `specs/13-instalacao-e-atualizacao.md + arquitetura/05-build-e-distribuicao.md + arquitetura/03-superficie-publica.md + specs/03-versionamento-e-release.md`

- **`03-versionamento-e-release`** §6 — o gancho `version` leva também os dois arquivos gerados do selo ao
  commit da tag; sem eles a tag sairia com `src/` diferente do `dist/`.

- **`13-instalacao-e-atualizacao`** §9.1 — o parágrafo *"nenhum sinal existente responde a essa pergunta
  sozinho"* deixa de ser verdade: o selo em runtime responde **qual build o navegador executa**, e a
  comparação com o `BUILD_INFO.json` instalado é o teste da segunda camada. **§10** — as três perguntas e
  quem responde cada uma: *estou atualizado?* (`sarak-ui check`), *o que está instalado?* (`BUILD_INFO.json`),
  *o que está executando?* (o selo).
- **`05-build-e-distribuicao`** §2 e §6 — onde a tríade nasce no pipeline, e que ela tem fonte única.
- **`03-superficie-publica`** — o nome exportado, se houver.
- **`12-kit-do-consumidor`** — o modo "apontar", as topologias, `VERSION`, `migracoes.md` no kit, o
  catálogo de variáveis (as emitidas são contrato; as legadas são internas).
- **`13-instalacao-e-atualizacao`** §2.3 e §9.1 — peers opcionais; a **terceira** camada de cache, com o
  mecanismo (`?v=` por lockfile, config e caminhos) e a correção da frase sobre a aba anônima.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-10-04

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```text
 M specs/00-backlog.md
?? .claude/settings.local.json
```

**O que foi feito**
- Gerei a identidade do build antes do `tsup` e reutilizei essa fonte para `BUILD_INFO.json`; o checker compara a trinca nos bundles ESM e CJS (`scripts/generate-build-info.mjs:54-69,92-95,136-185`, `package.json:22`).
- Expus `SARAK_BUILD_INFO` no barril público e o atributo JSON no `<style>` gerido pela lib em App e na raiz `.sarak-scope` em Embedded (`src/index.ts:38`, `src/core/Provider/SarakUIProvider.tsx:150-155`, `src/core/Provider/components/SarakScopeRoot.tsx:39-46`).
- Acrescentei testes para os dois modos, a ausência de atributo no host embarcado, SSR sem `document` e rejeição por fixture divergente (`src/core/Provider/__tests__/EmbeddedMode.test.tsx:60-73,193-205`, `src/core/Design/components/__tests__/DesignScope.ssr.test.tsx:10-18`, `scripts/__tests__/generate-build-info.check.test.mjs:61-81`).
- Atualizei a skill fonte e regenerei o kit para ensinar a ler o atributo e compará-lo com `node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json` (`.agents/skills/ui-integra-consumidor/SKILL.md:321-328`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `scripts/generate-build-info.mjs` | alterado | Prepara uma fonte única antes do bundle e confere a trinca em `src/`, `dist/BUILD_INFO.json`, `dist/index.js` e `dist/index.cjs`. |
| `scripts/__tests__/generate-build-info.check.test.mjs` | alterado | Adiciona fixture ESM/CJS divergente e limpeza do diretório temporário. |
| `package.json` | alterado | Executa `--prepare` antes do `tsup` em `build:js`. |
| `src/core/Provider/buildInfo.ts`, `src/buildInfo.ts` | gerados | Guardam a identidade interna completa e a trinca pública do build. |
| `src/core/Provider/buildSeal.ts` | criado | Serializa os três campos para o atributo DOM. |
| `src/core/Provider/SarakUIProvider.tsx`, `src/core/Provider/components/SarakScopeRoot.tsx` | alterados | Selam nós existentes da lib em App e Embedded, sem escrever atributo no host embarcado. |
| `src/index.ts` | alterado | Exporta `SARAK_BUILD_INFO`, prefixado e incluído no catálogo público. |
| `src/core/Provider/__tests__/EmbeddedMode.test.tsx`, `src/core/Design/components/__tests__/DesignScope.ssr.test.tsx` | alterados/criado | Cobrem os dois modos e a renderização sem `document`. |
| `.agents/skills/ui-integra-consumidor/SKILL.md`, `.claude/skills/ui-integra-consumidor/SKILL.md` | alterados | Atualizam a fonte da skill; o caminho `.claude` é a duplicação rastreada prevista na plan. |
| `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/START-HERE.md`, `sarak-ui/VERSION`, `sarak-ui/catalog.json`, `sarak-ui/skill/SKILL.md` | gerados | Regeneram o kit e seu catálogo após a mudança na skill e no barril. |
| `dist/BUILD_INFO.json`, `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, `dist/index.d.cts`, `dist/*.js` | gerados | Atualizam metadados, bundle e tipos; chunks ESM com hashes antigos foram substituídos pelos hashes do build atual. |
| `specs/plan/plan-92-selo-de-build-em-runtime.md` | alterado | Acrescenta este resumo e move o status para `🟠 Em revisão`. |

**Verificações executadas**
- `npm.cmd run guide` → gerou 102 componentes, 427 tokens e 100 ícones.
- `npm.cmd run build` → passou duas vezes; `builtAt` mudou de `2026-10-04T15:53:28.454Z` para `2026-10-04T15:55:07.948Z`; gates de catálogo, barril, marca, tipos públicos, prefixo, CSS e demais etapas do build passaram.
- `npm.cmd run build-info:check` → passou no artefato gerado.
- `npm.cmd run dev-kit` → gerou 96 componentes públicos, 427 tokens e 28 gates.
- `npm.cmd run zero-brand:check` → 434 arquivos verificados, zero marcas fora da allowlist.
- `npm.cmd run guide:check` → kit em dia, 6 arquivos.
- `npx.cmd tsc --noEmit` → zero erros.
- `npx.cmd vitest run` → 408/408 arquivos e 2140/2140 testes passaram; a rodada final durou 521,59 s.
- Suíte focada dos fluxos do selo → 3/3 arquivos e 21/21 testes passaram.
- `git diff --check -- . ':!dist/**'` → passou. `git diff --check` completo aponta trailing whitespace em `dist/index.cjs:3`, no bundle minificado gerado.

**Critérios de aceite**
- [x] `dist/index.js` e `dist/index.cjs` carregam a trinca de `dist/BUILD_INFO.json` — build-info:check passou após a geração.
- [x] App e Embedded expõem o selo em nó da lib; Embedded não marca `body` nem `documentElement` — testes em `EmbeddedMode.test.tsx` passaram.
- [x] Fixture divergente reprova e o artefato real passa — teste do checker e `npm.cmd run build-info:check` passaram.
- [x] O selo não vira texto visível; `zero-brand:check` passou.
- [x] Kit ensina leitura e comparação com o `BUILD_INFO.json` instalado — skill fonte e kit regenerado.
- [x] Build, tipos públicos, prefixo, catálogo e TypeScript passaram.
- [x] Suíte completa passou: 2140 testes.
- [ ] Lote 2 — peers opcionais e demais demandas de cache/kit aguardam o veredito do Lote 1, conforme §5, item 9.

**Decisões e suposições**
- No modo App, usei o elemento de stylesheet que a lib já injeta; em Embedded, usei `.sarak-scope`, único escopo DOM criado pela lib nesse modo. Assim o selo não modifica nenhum nó do host embarcado.
- O export público segue a convenção `SARAK_`; mantive somente os três campos necessários em runtime e preservei o formato completo de `BUILD_INFO.json`.
- Encerrei no checkpoint do Lote 1 definido pela §5, item 9; Lote 2 não foi iniciado.

**Achados fora do escopo (não corrigidos)**
- Nenhum achado de código fora do escopo foi identificado nesta execução.

**Pendências / riscos**
- Lote 2 permanece para etapa posterior ao veredito, conforme a plan.
- `git diff --check` aponta trailing whitespace em `dist/index.cjs:3`, artefato minificado gerado; as fontes fora de `dist/` passam no mesmo gate.
- Após restaurar o conteúdo original, `git status --short` ainda marca `src/effects/NoiseOverlay.tsx`; `git diff` para esse caminho é vazio e `git hash-object` coincide com o blob do `HEAD` (`36d7a0f24cdb3f7f1f96aea0940dd1c736b14fe9`).

---

## Resumo da execução — correção do veredito de 2026-10-04

**Resultado:** os quatro achados foram tratados; execução pronta para revisão. A motivação do toque transitório em `NoiseOverlay.tsx` não pôde ser recuperada do estado disponível.

**Escopo:** somente os quatro achados numerados no veredito da §10. A ampliação da §3.1 foi seguida. O lote 2 não foi iniciado.

**Estado do worktree ao iniciar esta correção**
```text
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-6FWWFAPT.js
 D dist/SarakChartEngine-YEEMZKRR.js
 D dist/SarakChatEngine-LLY76F4K.js
 D dist/SarakDataTableImpl-SDX5HIAW.js
 D dist/SarakFlowEngine-BPYJC7BY.js
 D dist/SarakMarkdownRendererImpl-UJWC2YON.js
 D dist/SarakPDFViewerImpl-TNFAWBLL.js
 D dist/chunk-2FJ52KWL.js
 D dist/chunk-3FPBADA7.js
 D dist/chunk-4262J5ZV.js
 D dist/chunk-INI3Q5HB.js
 D dist/chunk-NFUZXTUI.js
 D dist/chunk-X6DPFAQ7.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/skill/SKILL.md
 M scripts/__tests__/generate-build-info.check.test.mjs
 M scripts/generate-build-info.mjs
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-92-selo-de-build-em-runtime.md
 M src/core/Provider/SarakUIProvider.tsx
 M src/core/Provider/__tests__/EmbeddedMode.test.tsx
 M src/core/Provider/components/SarakScopeRoot.tsx
 M src/effects/NoiseOverlay.tsx
 M src/index.ts
?? .claude/settings.local.json
?? dist/CustomizationPanelImpl-4WGTCDMT.js
?? dist/SarakChartEngine-QGKQNXK2.js
?? dist/SarakChatEngine-RQ45MD44.js
?? dist/SarakDataTableImpl-D4UYBCDY.js
?? dist/SarakFlowEngine-62IWK7RQ.js
?? dist/SarakMarkdownRendererImpl-4C7QEAHR.js
?? dist/SarakPDFViewerImpl-F5LDQ5AS.js
?? dist/chunk-E6V3Q2JM.js
?? dist/chunk-FKGH2TBB.js
?? dist/chunk-K3FQA5EQ.js
?? dist/chunk-N5462TJ6.js
?? dist/chunk-SS4YYEPN.js
?? dist/chunk-YUD3K4YU.js
?? src/buildInfo.ts
?? src/core/Design/components/__tests__/DesignScope.ssr.test.tsx
?? src/core/Provider/buildInfo.ts
?? src/core/Provider/buildSeal.ts
```

`specs/00-backlog.md` já estava modificado nesta fotografia e foi preservado sem edição nesta correção.

**O que foi corrigido**

1. Extraí o efeito App de selo e injeção de estilos para `useSarakBuildSeal`, com testes de App, Embedded e SSR. `SarakUIProvider.tsx` voltou a ficar abaixo do limite R9. A chamada foi composta ao fim de `useSarakStylesheetGuard`, preservando as guardas de Embedded e a ordem dos efeitos. O `check-audit-baseline --with-tsc` não detectou regressões.
2. Acrescentei `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` à lista `git add` do script `version`. O gerador exporta a lista real de saídas de `--prepare`; o teste lê essa lista e prova que remover qualquer saída da lista de inclusão falha.
3. Ampliei o cabeçalho R18 de `generate-build-info.mjs`: declara que o checker compara as fontes geradas com `dist/BUILD_INFO.json`, não com `HEAD`; que bundle é verificado por substrings separadas nos arquivos `index.js` e `index.cjs`; e que ele não comprova o objeto completo nem lê o chunk ESM que escreve o atributo.
4. Registrei a decisão dos dois arquivos TypeScript gerados em `src/`: são entradas compiláveis importadas pelo runtime/export e mantêm a mesma identidade usada pelo artefato; precisam permanecer rastreados porque o clone precisa deles para compilar e o build os atualiza. Esta implementação mantém a fonte de runtime partilhada, em vez de usar uma constante `--define` ou o placeholder aplicado posteriormente por `inject-css.mjs`. Sobre `NoiseOverlay.tsx`, o veredito e o worktree apenas registram que foi tocado e restaurado; o diff está vazio e o hash atual coincide com `HEAD` (`36d7a0f24cdb3f7f1f96aea0940dd1c736b14fe9`). Não há evidência que explique a motivação transitória, portanto não a inferi nem alterei o arquivo.

**Arquivos alterados nesta correção**

| Arquivo | Alteração |
|---|---|
| `src/core/Provider/SarakUIProvider.tsx` | Removido o efeito inline do selo para manter o componente dentro do limite R9. O arquivo agora coincide com `HEAD`. |
| `src/core/Provider/hooks/useSarakBuildSeal.ts` | Novo hook com o efeito extraído. |
| `src/core/Provider/hooks/useSarakStylesheetGuard.ts` | Compõe o hook do selo após as guardas existentes. |
| `src/core/Provider/hooks/__tests__/useSarakBuildSeal.test.ts` e `useSarakBuildSeal.ssr.test.tsx` | Cobrem App, Embedded e SSR sem `document`. |
| `package.json` | Inclui as duas fontes geradas no `git add` do script `version`. |
| `scripts/generate-build-info.mjs` | Documenta limites R18 e exporta as saídas concretas de `--prepare`. |
| `scripts/__tests__/version-hook-build-info.test.mjs` | Confere a lista do `version` e inclui mutações que removem cada saída. |
| `specs/plan/plan-92-selo-de-build-em-runtime.md` | Acrescenta este bloco e muda o status para revisão. |

**Verificações executadas nesta correção**

- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → passou; baseline de 2026-08-11 sem regressões, TypeScript incluído.
- `npx.cmd vitest run` → **411/411 arquivos e 2146/2146 testes passaram**, 409,00 s.
- Suíte focada dos novos testes e do checker → 4/4 arquivos e 10/10 testes passaram.
- `npm run gate-limits:check` → passou; 40 scripts declararam os limites.
- `npm run build-info:check` → passou.
- O validador AST de `code-auditoria-padrao` não apontou violações nos novos arquivos. Também reportou no hook existente de guarda de stylesheet uma função de 47 linhas e três chamadas de `console`; são achados preexistentes dessa rotina, fora dos quatro itens e sem regressão no baseline auditado.

**Pendências e limites**

- A motivação do toque/restauração de `NoiseOverlay.tsx` permanece desconhecida; o arquivo está sem diff e com hash idêntico a `HEAD`.
- `specs/00-backlog.md` foi preservado como estava no início. Nenhuma operação de checkout, restore ou stash foi usada.
- O lote 2 continua pendente do veredito do lote 1, conforme a plan.

---

## Resumo da execução (correção 2) — 2026-10-04

**Resultado:** Concluído

**Escopo:** exclusivamente o achado 1 do veredito da 2.ª rodada — gerar novamente `dist/` a partir do `src/` atual e entregar com os gates do build verdes.

**Estado do worktree ao iniciar**
```text
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-6FWWFAPT.js
 D dist/SarakChartEngine-YEEMZKRR.js
 D dist/SarakChatEngine-LLY76F4K.js
 D dist/SarakDataTableImpl-SDX5HIAW.js
 D dist/SarakFlowEngine-BPYJC7BY.js
 D dist/SarakMarkdownRendererImpl-UJWC2YON.js
 D dist/SarakPDFViewerImpl-TNFAWBLL.js
 D dist/chunk-2FJ52KWL.js
 D dist/chunk-3FPBADA7.js
 D dist/chunk-4262J5ZV.js
 D dist/chunk-INI3Q5HB.js
 D dist/chunk-NFUZXTUI.js
 D dist/chunk-X6DPFAQ7.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/skill/SKILL.md
 M scripts/__tests__/generate-build-info.check.test.mjs
 M scripts/generate-build-info.mjs
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-92-selo-de-build-em-runtime.md
 M src/core/Provider/__tests__/EmbeddedMode.test.tsx
 M src/core/Provider/components/SarakScopeRoot.tsx
 M src/core/Provider/hooks/useSarakStylesheetGuard.ts
 M src/effects/NoiseOverlay.tsx
 M src/index.ts
?? .claude/settings.local.json
?? dist/CustomizationPanelImpl-4WGTCDMT.js
?? dist/SarakChartEngine-QGKQNXK2.js
?? dist/SarakChatEngine-RQ45MD44.js
?? dist/SarakDataTableImpl-D4UYBCDY.js
?? dist/SarakFlowEngine-62IWK7RQ.js
?? dist/SarakMarkdownRendererImpl-4C7QEAHR.js
?? dist/SarakPDFViewerImpl-F5LDQ5AS.js
?? dist/chunk-E6V3Q2JM.js
?? dist/chunk-FKGH2TBB.js
?? dist/chunk-K3FQA5EQ.js
?? dist/chunk-N5462TJ6.js
?? dist/chunk-SS4YYEPN.js
?? dist/chunk-YUD3K4YU.js
?? scripts/__tests__/version-hook-build-info.test.mjs
?? src/buildInfo.ts
?? src/core/Design/components/__tests__/DesignScope.ssr.test.tsx
?? src/core/Provider/buildInfo.ts
?? src/core/Provider/buildSeal.ts
?? src/core/Provider/hooks/__tests__/useSarakBuildSeal.ssr.test.tsx
?? src/core/Provider/hooks/__tests__/useSarakBuildSeal.test.ts
?? src/core/Provider/hooks/useSarakBuildSeal.ts
```

`specs/00-backlog.md` já estava modificado nesta fotografia e foi preservado sem edição.

**O que foi feito**
- Regenerei os bundles, tipos e CSS de `dist/` a partir do `src/` presente no worktree. O `build:js` também atualizou as duas fontes geradas do selo em `src/` antes do `tsup`.
- O build produziu a identidade `baseCommitShort` `9117ece`, `builtAt` `2026-10-04T20:25:31.126Z` e versão `7.0.0`; o `build-info:check` confirmou que as fontes geradas, os bundles e `dist/BUILD_INFO.json` estão coerentes.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `dist/` | regenerado | Bundles ESM/CJS, declarações DTS, chunks ESM e metadados foram reconstruídos do `src/` atual; o CSS também percorreu as etapas do build. |
| `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerados/atualizados | Fonte única do selo atualizada antes do empacotamento, com a identidade desta compilação. |
| `specs/plan/plan-92-selo-de-build-em-runtime.md` | alterado | Acrescentado este resumo; status movido para `🟠 Em revisão`. |

**Verificações executadas**
- `npm.cmd run build` (primeira tentativa no sandbox) → os gates anteriores ao `tsup` passaram; ESM/CJS falharam em `build:js` com `Acesso negado` ao percorrer diretório ancestral/resolver os shims de `tsup`. O `tsup --clean` deixou `dist/` parcialmente refeito.
- `npm.cmd run build` (repetido com acesso de leitura apropriado para o subprocesso) → **exit 0**. Passaram `token-types:check` (427 tokens), `catalog:check`, `barrel:check` (96 componentes, 0 faltas), `zero-brand:check` (435 arquivos, 0 violações), `guide:check` (6 arquivos), `deep-import:check`, `public-types:check`, `prefix:check` (332 nomes), ESM/CJS, DTS (171,46 KB), CSS Tailwind, CSS escopado, cópia de estilos, injeção de CSS e geração de `BUILD_INFO.json`.
- `npm.cmd run build-info:check` → passou: `[OK] dist/BUILD_INFO.json íntegro (chaves presentes, libVersion em dia).`

**Critérios de aceite**
- [x] `dist/` foi gerado depois da extração do selo e a partir do `src/` atual — ESM, CJS e DTS terminaram com sucesso; os gates do build passaram.
- [x] A tríade gerada coincide com `dist/BUILD_INFO.json` — `build-info:check` passou (`baseCommit` `9117ece34c5f3a4adfb89aef78c3115dc67131fe`; `builtAt` `2026-10-04T20:25:31.126Z`; `libVersion` `7.0.0`).

**Decisões e suposições**
- A primeira execução confirmou uma restrição do subprocesso esbuild no sandbox, não uma falha do código. Repeti o mesmo comando com o acesso de leitura necessário para a compilação; nenhuma configuração de build foi alterada.

**Achados fora do escopo (não corrigidos)**
- Nenhum adicional investigado; a correção ficou restrita ao único achado do veredito da 2.ª rodada.

**Pendências / riscos**
- Nenhuma pendência no achado corrigido. O lote 2 continua fora desta rodada, como já registrado no veredito.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-04 — 🔴 Reprovado (lote 1)

**Antes de gravar:** a §10 foi relida no disco e estava vazia — nenhum bloco de outra sessão de revisor. O
escopo deste veredito é o **lote 1**; o lote 2 não foi iniciado, como a §5 item 9 manda.

**O que está certo, e foi verificado por mim.**

- `dist/index.js` e `dist/index.cjs` carregam a tríade de `dist/BUILD_INFO.json` (`builtAt` 2026-10-04T15:55:07.948Z,
  `baseCommitShort` `9117ece`, `libVersion` 7.0.0); a chave `data-sarak-build-info` está no `.cjs` e no chunk ESM
  que monta o selo. O `d.ts` traz `SARAK_BUILD_INFO` e o catálogo do kit também.
- App: o atributo vai no `<style id="sarak-ui-core-styles">` que a lib já injeta, e **só nele** (teste:
  exatamente 1 elemento). Embarcado: vai na `div.sarak-scope`, e `body` e `documentElement` não o recebem. Nenhum
  texto do selo é renderizado; o `zero-brand:check` está verde. SSR sem `document` está coberto.
- Escopo: só a §3.1 e os gerados. O `src/effects/NoiseOverlay.tsx` aparece em `git status`, mas o `git diff` dele
  é vazio e o blob bate com o `HEAD` — resíduo de `stat`, não de conteúdo. Os arquivos fora de escopo da §3.2
  (`bin/`, o formato de `BUILD_INFO.json`, a lista `--external`) não mudaram.
- `npx tsc --noEmit` → 0. `npx vitest run` → **408 arquivos, 2140 testes verdes** (707 s).
- Verdes: `build-info`, `zero-brand`, `guide`, `catalog`, `barrel`, `prefix` (332 nomes), `public-types`,
  `token-types`, `dev-kit`, `trail-citation`, `gate-limits`, `section-pointers`, `deep-import`.

**Achados — a correção é exclusivamente estes:**

1. **O baseline do `run_audit` regrediu: `auditor_cleancode.violacoes` foi de 0 para 1.**
   `src/core/Provider/SarakUIProvider.tsx` tem **257 linhas**, e o teto da R9 é 250 (a execução acrescentou o
   `useEffect` do selo e o import). O Anel 2 do `pre-commit` **bloqueia** esse commit
   (`node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → REGRESSÃO). Critério violado: R9 e
   R20. O resumo não menciona o `audit`, e a plan o inclui entre as verificações do repositório. Extraia o efeito
   do selo para um hook próprio, com teste, sem mudar o comportamento, e rode o `check-audit-baseline` antes
   de entregar.
2. **O gancho `version` do release não leva ao commit da tag os dois arquivos gerados do selo.** A tríade agora
   vive em `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts`, que são **rastreados** e **regravados a cada
   build**. O script `version` (`package.json`) regenera o build e só faz
   `git add package.json package-lock.json dist sarak-ui sarak-dev`. Efeito: depois do `npm version` a árvore
   fica suja, a tag aponta para um `src/` com `builtAt` e `baseCommit` diferentes dos do `dist/`, e o **próximo**
   `npm version` aborta com *"Git working directory not clean"*. A §3.1 não listava o script `version`
   — **defeito da plan, já corrigido**: o escopo agora o admite, só para a lista de `git add`. Faça: (a)
   acrescentar os dois arquivos à lista; (b) um teste em `scripts/__tests__/` que lê o `package.json` e afirma
   que **todo arquivo escrito pelo `--prepare`** está na lista de `git add` do `version`, e que **falha** ao
   se retirar um deles (mutação por fixture).
3. **O cabeçalho de limites (R18) do `generate-build-info.mjs` não declara o que o novo `--check` não vê** — e a
   plan o pede (§5 item 5). Declare, no mínimo: o selo é conferido por **substring**, cada valor em qualquer
   lugar do arquivo, sem provar que os três formam o objeto do selo; só `dist/index.js` e `dist/index.cjs`
   são varridos — **no ESM, o código que escreve o atributo mora num `chunk-*.js` com hash**, que o `--check` não
   abre; e o `--check` compara os arquivos de `src/` com o `BUILD_INFO.json`, não com o `HEAD`. Critério
   violado: §5 item 5 e R18.
4. **O resumo omite a decisão de maior consequência e uma ação fora de escopo.** Faltou dizer que o selo vem de
   **dois arquivos gerados que precisam ser commitados**, não ignorados, e que mudam a cada build (o executor
   escolheu isso no lugar de injetar o valor com `--define` ou pelo placeholder do `inject-css.mjs`; o motivo da
   escolha entra no resumo). Também não explica por que `src/effects/NoiseOverlay.tsx` foi tocado e restaurado. A
   correção entra como bloco novo na §9, com **Estado do worktree ao iniciar**.

**Para o dono, sem reprovar:** os dois arquivos gerados em `src/` são **untracked** — o `git add src` os leva, e é
obrigatório levá-los: o barril importa `./buildInfo`, e um clone sem eles não compila. A cada `npm run build`
eles mudam de novo (`builtAt`, `baseCommit`), então o commit de um lote que reconstrói o `dist/` os inclui.

## Veredito — 2026-10-04 (2.ª rodada) — 🔴 Reprovado (lote 1)

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação desta mesma data, escrito nesta conversa.

**Os quatro achados anteriores, um a um:**

| # | Achado | Evidência |
|---|---|---|
| 1 | `SarakUIProvider.tsx` acima de 250 linhas | O efeito saiu para `hooks/useSarakBuildSeal.ts`, composto ao fim de `useSarakStylesheetGuard`; o Provider voltou ao conteúdo do `HEAD` (249 linhas). `check-audit-baseline --with-tsc` rodado por mim → **igual ao baseline**. Dois testes novos (App carimba o `<style>`, Embarcado não carimba) e um de SSR sem `document`. |
| 2 | `version` não leva os arquivos gerados | `package.json` → `git add … src/buildInfo.ts src/core/Provider/buildInfo.ts`. A lista de saídas do `--prepare` é **exportada pelo próprio gerador** (`BUILD_INFO_PREPARE_OUTPUT_PATHS`, derivada dos escritores reais), e `scripts/__tests__/version-hook-build-info.test.mjs` prova que **retirar qualquer uma** do `git add` falha. |
| 3 | Cabeçalho R18 | Declara: o `--check` compara `src/` com `BUILD_INFO.json` e não com o `HEAD`; confere o bundle por substring, sem provar que os três valores formam o objeto; abre só `index.js` e `index.cjs`; e o código ESM que escreve o atributo fica num `chunk-*.js` que ele não lê. |
| 4 | Resumo | Bloco novo na §9, com a decisão dos dois arquivos gerados e rastreados (e por que não `--define` nem o placeholder) e uma resposta honesta sobre o `NoiseOverlay.tsx`: a motivação não foi recuperada. |

**Regressão, rodada por mim:** `tsc` → 0 · `npx vitest run` → **411 arquivos, 2146 testes verdes** (429 s) · verdes:
`build-info`, `zero-brand`, `guide`, `catalog`, `barrel`, `prefix`, `public-types`, `token-types`, `dev-kit`,
`trail-citation`, `gate-limits`, `section-pointers`, `deep-import`. Escopo: só a §3.1 ampliada e os gerados.

**Achado novo, de procedimento — a correção é exclusivamente este:**

1. **O `dist/` não foi regenerado depois do refactor do achado 1.** `dist/index.js` é de 12:55; os arquivos de
   produção que a correção tocou (`useSarakBuildSeal.ts`, `useSarakStylesheetGuard.ts` e o `SarakUIProvider.tsx`
   restaurado) são de 14:18. O chunk ESM e o `.cjs` ainda carregam o efeito **inline** de antes da extração.
   O comportamento é equivalente, mas o artefato que o consumidor instala **não é gerado do `src/` entregue**, e
   todo gate que lê o `dist/` — `public-types`, `prefix`, `build-info`, que eu mesmo rodei — mediu o passado. O
   resumo da correção não lista `npm run build` entre as verificações. Critério violado: §6 (*"`npm run build`
   verde"*, sobre o código final) e R29 (todo artefato gerado bate com a fonte). Rode `npm run build` e entregue
   o resultado com os gates do próprio build verdes; o `builtAt` e o `baseCommit` dos dois arquivos de `src/` e do
   `BUILD_INFO.json` mudam juntos, e o `build-info:check` tem de seguir verde.

**Para o dono, sem reprovar:** os arquivos `src/effects/NoiseOverlay.tsx` (13:03:29) e
`src/core/Design/components/DesignScope.tsx` (13:03:50) têm data de modificação **posterior ao build** e conteúdo
idêntico ao `HEAD` — foram regravados pelo executor e restaurados. Sem diff, sem efeito; só o `git status` pode
continuar mostrando o `NoiseOverlay.tsx` até o índice ser atualizado.

## Veredito — 2026-10-04 (3.ª rodada) — 🟢 Aprovado (lote 1 — liberação parcial)

**Antes de gravar:** a §10 foi relida no disco: só os dois blocos de reprovação desta data, escritos nesta conversa.

**O achado da 2.ª rodada — o `dist/` não era gerado do `src/` entregue — fechou:**

- `dist/index.js` é das **17:25** e **nenhum** arquivo de produção do `src/` é mais novo que ele (antes, o refactor
  era das 14:18 e o bundle das 12:55).
- A tríade bate nos quatro lugares: `dist/BUILD_INFO.json`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` e
  os bundles — `builtAt` 2026-10-04T20:25:31.126Z, `baseCommitShort` `9117ece`, `libVersion` 7.0.0. O valor está em
  `index.js` (×1), `index.cjs` (×2) e no chunk ESM `chunk-X7D42LWO.js`, que é o que escreve o atributo.
- **O selo denuncia build velho:** o `builtAt` mudou de `15:55:07.948Z` para `20:25:31.126Z` no `BUILD_INFO.json` e
  nos bundles ao mesmo tempo, e nenhum chunk do build anterior sobrou em `dist/`.
- O resumo é honesto sobre a primeira tentativa de build: o sandbox bloqueou o `esbuild`, o `tsup --clean`
  deixou o `dist/` parcial, e o mesmo comando repetido terminou com `exit 0`.

**Regressão, rodada por mim sobre o `dist/` novo:** `tsc` → 0 · `check-audit-baseline --with-tsc` → **igual ao
baseline** · `npx vitest run` → **411 arquivos, 2146 testes verdes** (586 s) · verdes: `build-info`, `package`
(94 arquivos no tarball), `zero-brand` (435 arquivos), `guide`, `catalog`, `barrel` (96), `prefix` (332),
`public-types`, `token-types`, `dev-kit`, `trail-citation`, `gate-limits` (40), `section-pointers`,
`deep-import`. Desta vez os gates que leem o `dist/` mediram o artefato certo.

**Critérios do lote 1, com a evidência acumulada nas três rodadas:** selo em `dist/index.js` e `dist/index.cjs`;
atributo num elemento da lib nos dois modos (App: o `<style id="sarak-ui-core-styles">`; Embarcado: a
`.sarak-scope`) e em nenhum elemento do host; `build-info:check` reprova a fixture divergente e aprova o real;
nenhum texto do selo renderizado; kit regenerado ensina a ler e a comparar com o `BUILD_INFO.json` instalado;
`build`, `tsc` e suíte verdes; o `version` leva os arquivos gerados ao commit da tag, com teste.

**Liberação parcial.** O lote 1 está aprovado e **pode ser commitado**. A plan **não** está concluída: o lote 2
(§5 itens 10 a 13) não foi iniciado. O `status` volta a `🟡 Em execução`, e a síntese e a remoção só acontecem
depois do veredito do lote 2.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
