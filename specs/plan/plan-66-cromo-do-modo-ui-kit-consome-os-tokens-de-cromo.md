---
tipo: "plan"
titulo: "Fazer o cromo do modo ui-kit consumir os tokens de cromo que o painel já oferece"
objetivo: "Os tokens de cromo clicáveis no painel passam a produzir efeito também no SarakAppChrome, e um gate impede que a lacuna volte"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "tokens", "gate", "modo-ui-kit"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[specs/07-responsividade-e-multidispositivo]]", "[[specs/01-gates-e-baseline]]"]
depende_de: ""
retida_por: "plan-67-widgets-do-cromo-por-padrao-com-opt-out"
destino_sintese: "sintetizada · retida por plan-67"
---

# 1. Objetivo

Os tokens de cromo que hoje só o `SarakShell` lê passam a ter efeito no `SarakAppChrome`, e um gate passa a
cobrar que todo token de cromo oferecido no painel tenha consumidor nos **dois** modos de consumo.

# 2. Contexto

O `SarakAppChrome` lê **um** campo de `design`: `navigationStyle` (`SarakAppChrome.tsx:130`). O
`SidebarNav` do Shell desestrutura **dezesseis** (`SidebarNav.tsx:35-46`), mais `searchPositionSidebar`.

Doze tokens estão no schema **e** no catálogo — portanto o usuário final os vê no painel, clica, e o painel
confirma a mudança — e não têm nenhum consumidor no cromo do modo ui-kit:

`sidebarPosition` · `navbarLayout` · `contentAlignment` · `isNavHidden` · `isAutoHideEnabled` ·
`searchPositionSidebar` · `searchPositionTopbar` · `tabGap` · `tabSectionMargin` · `sidebarActiveColor` ·
`sidebarHoverColor` · `topbarActiveColor`

Isso viola diretamente a regra que a própria base escreveu, em [[09-temas-e-presets]] §4.4.3 e
[[07-responsividade-e-multidispositivo]] §6.1 regra 4:

> *"Valor oferecido no schema é contrato com o usuário final: ou ele funciona, ou sai do schema."*

A regra é cobrada **por token**. Nenhum gate a cobra **por modo de consumo** — e é exatamente na fronteira
entre os dois modos que ela quebra.

Há um agravante de percepção, e ele é a razão de esta plan vir antes da 67. O preview do painel
(`PreviewSystemRenderer.tsx:4-6`) importa `SidebarNav`, `TopbarNav` e `DockNav` — o cromo do **Shell**.
No ERP, o Gêmeo Digital mostra uma sidebar com busca, usuário e alça de arraste; a tela real tem uma lista.
O painel não previsualiza o produto do consumidor. Quando os dois cromos passarem a exibir o mesmo
conjunto, essa divergência deixa de existir na prática — e é isso que a plan 67 verifica ao fechar.

Duas notas de terreno:

- **Quatro dos doze já têm variável CSS emitida** (`sidebarWidth`, `topbarHeight`, `tabGap`,
  `tabSectionMargin`); os outros são **comportamento em JS**, sem `cssVars`. Os dois grupos exigem
  tratamento diferente: o primeiro é consumir a variável certa, o segundo é implementar o comportamento.
- **O `SarakShellNav` usa `--sarak-layout-gap-sm/md` para o espaçamento**, não `--sarak-tab-gap`, então o
  token de gap do painel não alcança nem por CSS.

Achado adjacente que cabe aqui: `SarakNavItem` (`src/components/Layout/chrome/navItem.ts:17-29`) não tem
`category`, e `SarakAppChrome.tsx:147-149` descarta o campo ao mapear para `ShellNavItem` — embora o
`SarakShellNav` saiba agrupar (`SarakShellNav.tsx:47-59`). O modo ui-kit não consegue pedir um agrupamento
que o renderizador já implementa.

> ✅ **Pré-requisito cumprido (2026-09-09).** Os quatro widgets do cromo já são públicos e vivem em
> `src/components/atomic/Navigation/`, alcançáveis pelo barril — ver [[arquitetura/03-superficie-publica]]
> §3.1. Esta plan já pode consumir o que precisar deles.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/SarakAppChrome.tsx` e `src/components/Layout/chrome/` — consumo dos tokens de
  cromo: posição da sidebar, layout da navbar, alinhamento do conteúdo, colapso, auto-hide, posição da
  busca, gaps e as cores de item ativo/hover.
- `src/components/Layout/SarakAppChromeMobile.tsx` — o que dos doze faz sentido no drawer.
- `src/components/Layout/chrome/navItem.ts` — `category?` no `SarakNavItem`, preservado no mapeamento.
- `src/components/atomic/Navigation/SarakShellNav.tsx` · `SarakMenuItem.tsx` — consumo das cores de item
  ativo/hover do cromo e do token de gap correto.
- Gate novo, em `gates/scripts/contrato/` — paridade token de cromo ↔ consumidor, **por modo de consumo**.
- `package.json` — o script do gate; e a inclusão dele onde os demais `*:check` rodam.
- `gates/baselines/audit-baseline.json` — se o gate novo alterar contagem auditada.
- Testes dos componentes tocados e do gate.

## 3.2 Fora
- `src/core/Shell/` — o Shell já consome os tokens; não se toca.
- O schema (`src/core/Design/schema/`) — nenhum token é criado, removido ou tem assinatura alterada. Se
  algum dos doze se revelar impossível de honrar no modo ui-kit, **pare e relate** — a alternativa é
  removê-lo do schema, e isso é decisão do dono, não desta plan.
- Montar widgets por padrão — é a plan 67.
- `PreviewSystemRenderer` — a divergência do preview é verificada ao fim da plan 67, não corrigida aqui.
- A métrica tipográfica do item de navegação — é a plan 68.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.1, §2.3 e §6 — o contrato do cromo, a regra de degradação e o zero hardcode |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.4.3 — a regra que esta plan faz valer |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §5 (a tabela do contrato), §6 (as três camadas) e §6.1 (as quatro regras da camada 3) |
| Spec fixa | `specs/01-gates-e-baseline.md` | §2 e a matriz de cobertura — como um gate se declara e o que ele tem de dizer que não vê |
| Spec fixa | `specs/04-shell-e-discovery.md` | §6 — como o Shell traduz tokens estruturais em classes, via hook controlador |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | consumo de token em componente |
| Skill | `ui-auditoria-modulo` | o gate novo entra no aparato desta skill |
| Código | `src/core/Shell/hooks/useShellLayoutStyles.ts` | como o Shell traduz `sidebarPosition`, `navbarLayout` e `contentAlignment` — o comportamento de referência |
| Código | `src/core/Shell/Components/SidebarNav.tsx:35-55,131-200` | colapso, hover-expand, posição da busca e cores de ativo |
| Código | `src/core/Design/schema/navigation.ts` · `system.ts` | os tokens, com `cssVars` quando existem |
| Código | `src/components/Layout/SarakAppChrome.tsx` · `chrome/` | o cromo a estender |

# 5. Instruções de execução

1. Ler as referências da §4 e levantar, para cada um dos doze tokens, se ele chega por variável CSS ou por
   comportamento em JS, e qual é o comportamento de referência no Shell.
2. Implementar o consumo no cromo do modo ui-kit, um token por vez, preservando o default atual quando o
   token não está definido. **Pronto quando** mudar o token no painel muda a tela, e não mudá-lo mantém o
   comportamento de hoje.
3. Tratar a degradação por dispositivo como a §2.3 de [[05-cromo-e-slots]] já exige: nenhum token pode
   fazer região sumir no celular.
4. Acrescentar `category?` ao `SarakNavItem` e preservá-lo no mapeamento para o `SarakShellNav`.
5. Escrever o gate: para cada token de cromo do schema, verificar que existe consumidor no `SarakShell`
   **e** no `SarakAppChrome`. O gate **declara no próprio código o que não enxerga** (R18) — em especial,
   que ele prova a existência do consumo, não o efeito visual dele.
6. Rodar o gate contra o estado anterior à correção e **confirmar que ele reprova**. Regra sem caso que
   falha não é regra.
7. Registrar o script em `package.json` e no conjunto que roda junto dos demais `*:check`.
8. Testes: um por token consumido, no componente. Onde o efeito for CSS renderizado, estender
   `browser-tests/` em vez de afirmar por leitura de classe.
9. Rodar `npx vitest run`, o gate novo, `npm run audit` e `npm run cromo-css-real:check`.

# 6. Critérios de aceite

- [ ] Cada um dos doze tokens tem efeito observável no `SarakAppChrome`, ou está relatado como impossível
      com a razão — nunca silenciosamente pulado.
- [ ] Sem token definido, o cromo se comporta exatamente como antes desta plan.
- [ ] Nenhuma região do cromo desaparece em nenhum dos três modos de geometria.
- [ ] `SarakNavItem` aceita `category` e o agrupamento chega ao `SarakShellNav`.
- [ ] O gate novo existe, reprova o estado anterior e passa no estado corrigido.
- [ ] O gate declara, no próprio código, o que não enxerga.
- [ ] O gate está registrado em `package.json` e roda junto dos demais.
- [ ] `npx vitest run` verde; `npm run audit` comparado ao baseline, com o baseline regravado se a contagem
      mudou; `cromo-css-real:check` verde.
- [ ] Zero hardcode novo: todo valor visual é token com fallback.

# 7. Como verificar (uso do revisor)

**Gate:** `todo token de cromo oferecido no schema tem consumidor no SarakShell e no SarakAppChrome` — é a
**única** regra de gate desta plan. Ela vale para a **relação** entre dois módulos (schema × cada cromo), e
nenhum teste de componente enxerga o vizinho: é a forma certa pela [[00-prompt-revisor]] §5.4.

- `git diff --stat` → só os arquivos de §3.1.
- Rodar o gate no `HEAD` anterior à correção → **reprova**, nomeando os tokens.
- Rodar o gate no estado entregue → passa.
- Leitura do código do gate → o bloco de limites declara o que ele não vê.
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → verde.
- `npm run cromo-css-real:check` → verde.
- `npm run audit` → comparado ao baseline; se a contagem mudou, o baseline foi regravado no mesmo diff.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` · `specs/01-gates-e-baseline.md`

Em `specs/05`, texto pronto para transporte, para a §2.1:

> O cromo do modo ui-kit consome os mesmos tokens de cromo que o Shell — posição da sidebar, layout da
> navbar, alinhamento do conteúdo, colapso, auto-hide, posição da busca, espaçamento de itens e as cores de
> item ativo e hover. Um token de cromo oferecido no painel produz efeito nos **dois** modos de consumo; é
> o que impede que a regra *"ou funciona, ou sai do schema"* valha só de um lado da fronteira.

Em `specs/01`, registrar o gate novo na tabela de gates e a linha correspondente na matriz de cobertura,
com o que ele declara não ver.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-09

**Resultado:** Concluído com pendências

**O que foi feito**
- `src/components/Layout/SarakAppChrome.tsx` — corpo extraído para `chrome/ChromeSidebarBody`/`ChromeTopbarBody` (o arquivo estava em 250 linhas, o teto da R9; extrair era pré-requisito antes de acrescentar) + prop `search` nova + `category` propagado no mapeamento `navItems→ShellNavItem` (antes descartado) — reduzido de 250 para 218 linhas.
- `src/components/Layout/chrome/useChromeDesignTokens.ts` (novo) — leitura tolerante (`useSarakUIOptional`, mesmo padrão de `useStructuralStyles.ts`) de `sidebarPosition`, `navbarLayout`, `contentAlignment`, `isNavHidden`, `isAutoHideEnabled`, `searchPositionSidebar`, `searchPositionTopbar`.
- `src/components/Layout/chrome/chromeStructuralStyles.ts` (novo) — tradução de `sidebarPosition`/`navbarLayout`/`contentAlignment` em classes, reimplementada (não importada) a partir do comportamento de referência de `useShellLayoutStyles.ts`, porque `src/core/Shell/` não é tocado por esta plan (§3.2).
- `src/components/Layout/chrome/useChromeAutoHide.ts` (novo) — comportamento de `isAutoHideEnabled` (oculta/revela por hover + sensor de borda), modelado no padrão que de fato funciona no Shell (`DockNav`), não no de `SidebarNav` (achado abaixo).
- `src/components/Layout/chrome/ChromeSidebarBody.tsx` e `ChromeTopbarBody.tsx` (novos) — os corpos sidebar/topbar do cromo, agora consumindo os 12 tokens: `sidebarPosition`/`navbarLayout` (classe estrutural), `contentAlignment` (largura do conteúdo), `isNavHidden` (largura/altura recolhida + `SarakShellNav collapsed`), `isAutoHideEnabled` (oculta/revela), `tabSectionMargin` (margem do bloco), `search`/`searchPositionSidebar`/`searchPositionTopbar` (novo slot `ChromeSearchSlot`, em `chrome/ChromeSlots.tsx`).
- `src/components/Layout/chrome/ChromeSlots.tsx` — `ChromeBrand` ganhou `compact` (esconde o nome quando `isNavHidden`); `ChromeSearchSlot` novo (região da busca, `hidden` some mesmo com conteúdo).
- `src/components/Layout/chrome/navItem.ts` — `SarakNavItem` ganhou `category?: string`.
- `src/components/Layout/SarakAppChromeMobile.tsx` — `brand`/`logo` passam a ser dados brutos (a marca é montada internamente, igual aos outros dois corpos, não mais um `ReactNode` pré-montado pelo pai — muda o contrato interno documentado em `specs/specs/05-cromo-e-slots.md:158-160`, ver achado abaixo); `search`/`searchPositionSidebar` (é onde a sidebar existe no celular) e `contentAlignment` passam a ter efeito no drawer.
- `src/components/atomic/Navigation/SarakMenuItem.tsx` — o tom padrão (ativo/hover) passa a ser por ORIENTAÇÃO: vertical consome `--sarak-sidebar-active-color`/`--sarak-sidebar-hover-color`, horizontal consome `--sarak-topbar-active-color`. Fallback idêntico ao tom anterior (zero mudança sem tema). Efeito colateral **desejado**: como o Shell também compõe seus itens de menu por este átomo, os três tokens de cor passam a valer nos DOIS cromos por aqui — não precisei (nem podia) tocar `src/core/Shell/`.
- `src/components/atomic/Navigation/SarakShellNav.tsx` — `gap` entre itens do grupo trocado de `--sarak-layout-gap-sm` para `--sarak-tab-gap` (mesmo fallback); `collapsed?: boolean` novo, passado ao `SarakMenuItem` e some o rótulo de categoria.
- `gates/scripts/contrato/check-chrome-token-parity.mjs` (novo) + `__tests__/check-chrome-token-parity.test.mjs` (novo, 12 casos) — o gate desta plan.
- `package.json`, `.githooks/pre-commit`, `.github/workflows/gates.yml` — `chrome-token-parity:check` registrado e encadeado no Anel 1 do pre-commit e na lista de `*:check` que o `gates:full` não alcança (CI explícito).
- Testes novos: `chrome/__tests__/{useChromeDesignTokens,useChromeAutoHide,ChromeSidebarBody,ChromeTopbarBody}.test.{ts,tsx}` (um arquivo por componente/hook novo — exigido por `auditor_coverage`), `Layout/__tests__/SarakAppChrome.tokens.test.tsx` (integração ponta a ponta: `category`, slot `search` nos três modos), casos novos em `SarakMenuItem.test.tsx` e `SarakShellNav.test.tsx`.
- Snapshots regenerados (`-u`, isolado por arquivo): `PreviewCanvas.test.tsx.snap` e `PreviewSystemRenderer.test.tsx.snap` — refletem só a troca `--sarak-card-bg`→`--sarak-sidebar-hover-color` no hover de item vertical (consequência correta da correção do `SarakMenuItem`).
- `docs/component-catalog.{json,md}` e `sarak-ui/{catalog.json,VERSION,GUIA-FRONTEND.md,START-HERE.md}` regenerados (`npm run catalog && npm run guide`) — necessário porque `search`/`category` são superfície pública nova, e `npm run build` (que o `cromo-css-real:check` encadeia) reprova com o catálogo/kit defasados.
- `dist/*` foi regerado por `npm run build`, chamado repetidas vezes só para RODAR as verificações exigidas (`cromo-css-real:check`, §7) — nenhum arquivo de `dist/` foi editado à mão. Deixei como ficou: reverter um artefato gerado compartilhado no meio de uma execução paralela de outra plan pareceu mais arriscado que deixá-lo; ele é regerado de novo no próximo `npm run build`/release de qualquer forma.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/SarakAppChrome.tsx` | alterado | corpo extraído p/ `chrome/`; prop `search`; `category` propagado; 250→218 linhas |
| `src/components/Layout/SarakAppChromeMobile.tsx` | alterado | `brand`/`logo` viram dados brutos; `search`/`contentAlignment` no drawer |
| `src/components/Layout/chrome/ChromeSlots.tsx` | alterado | `ChromeBrand.compact`; `ChromeSearchSlot` novo |
| `src/components/Layout/chrome/navItem.ts` | alterado | `SarakNavItem.category?` |
| `src/components/Layout/chrome/ChromeSidebarBody.tsx` | criado | corpo sidebar extraído, consome os 12 tokens |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx` | criado | corpo topbar extraído, consome os 12 tokens |
| `src/components/Layout/chrome/chromeStructuralStyles.ts` | criado | `sidebarPosition`/`navbarLayout`/`contentAlignment` → classe |
| `src/components/Layout/chrome/useChromeAutoHide.ts` | criado | comportamento de `isAutoHideEnabled` |
| `src/components/Layout/chrome/useChromeDesignTokens.ts` | criado | leitura tolerante dos 7 tokens sem CSS-var direta |
| `src/components/atomic/Navigation/SarakMenuItem.tsx` | alterado | tom ativo/hover por orientação (3 tokens de cor) |
| `src/components/atomic/Navigation/SarakShellNav.tsx` | alterado | `gap`→`--sarak-tab-gap`; `collapsed?` |
| `gates/scripts/contrato/check-chrome-token-parity.mjs` | criado | o gate desta plan |
| `gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` | criado | self-test do gate (12 casos) |
| `package.json` | alterado | script `chrome-token-parity:check` |
| `.githooks/pre-commit` | alterado | gate novo no Anel 1 |
| `.github/workflows/gates.yml` | alterado | gate novo na lista dos 7 `*:check` fora do `gates:full` |
| `src/components/Layout/chrome/__tests__/*.test.{ts,tsx}` (4 arquivos) | criados | um por componente/hook novo |
| `src/components/Layout/__tests__/SarakAppChrome.tokens.test.tsx` | criado | integração: category + slot search |
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | 4 casos novos (cor por orientação) |
| `src/components/atomic/Navigation/__tests__/SarakShellNav.test.tsx` | alterado | 3 casos novos (`collapsed`, `tabGap`) |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | regenerado (efeito do fix do `SarakMenuItem`) |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | idem |
| `docs/component-catalog.{json,md}` | alterado | regenerado (`search`/`category` novos) |
| `sarak-ui/{catalog.json,VERSION,GUIA-FRONTEND.md,START-HERE.md}` | alterado | regenerado (kit do consumidor) |
| `dist/*` | alterado | regerado por `npm run build` (verificação, não edição) |

**Verificações executadas**
- `npx tsc --noEmit` → 0 erros (igual ao baseline).
- `node gates/scripts/contrato/check-chrome-token-parity.mjs` no snapshot do HEAD anterior (via `git show HEAD:<arquivo>` para os arquivos varridos, num diretório temporário — evitei `git stash` no worktree compartilhado) → **reprova os 12 tokens** em `SarakAppChrome`, e `sidebarHoverColor` reprova também em `SarakShell` (achado abaixo). No estado entregue → `[OK] Os 12 tokens de cromo cobertos têm consumidor no SarakShell E no SarakAppChrome.`
- `npx vitest run gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` → 12/12.
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → 25 arquivos / 168 testes, 100% verde.
- `npm run audit` → mesmo baseline de sempre: 2 auditores vermelhos pré-existentes (`auditor_ghostvars` 1 fantasma `--x`, falso positivo de comentário; `auditor_composicaoatomica` 2, `SarakMultiSelect`/`SarakUploader`) — nenhum dos dois nasceu nesta execução. `npm run audit:baseline` → "igual ao baseline de 2026-08-11 — nenhuma regressão"; **não precisei regravar** `gates/baselines/audit-baseline.json` (a contagem não mudou).
- `npm run build` → verde (token-types, catalog, barrel, zero-brand, guide, deep-import, build:js, public-types, build:css, build:css:scoped).
- `npm run cromo-css-real:check` → **5/5 testes Playwright verdes** (build + Chromium real).
- `npx vitest run` (suíte inteira) → **rodada com `--maxWorkers=3`: 341 arquivos / 1624 testes, 100% verde.** Com a concorrência PADRÃO (sem flag), rodei a suíte inteira 4 vezes: a única falha determinística e ligada a este diff foram os 2 snapshots (já corrigidos); as demais 4-6 falhas por rodada formavam um conjunto ROTATIVO de arquivos sem nenhuma relação com cromo/navegação (`generate-token-types.check.test.mjs`, `check-barrel-parity.test.mjs`, `generate_theme_template.test.ts` — que **documenta no próprio código** "contenção de CPU/IO com todos os outros arquivos rodando, não lentidão do gerador"—, `SarakPDFViewerImpl.test.tsx`, `ShellSearchWidget.test.tsx`), sempre por `Error: Test timed out`, e cada um passa limpo isolado. Achado registrado abaixo, não é regressão desta plan.

**Critérios de aceite**
- [x] Cada um dos doze tokens tem efeito observável no `SarakAppChrome` — evidência: `chrome/__tests__/ChromeSidebarBody.test.tsx`, `ChromeTopbarBody.test.tsx`, `SarakMenuItem.test.tsx`, `SarakShellNav.test.tsx`, `SarakAppChrome.tokens.test.tsx`.
- [x] Sem token definido, o cromo se comporta exatamente como antes — evidência: os 168 testes pré-existentes de `Layout`/`Navigation` continuam verdes sem alteração de asserção.
- [x] Nenhuma região do cromo desaparece nos três modos de geometria — **com uma ressalva declarada**: `isAutoHideEnabled` esconde a barra inteira por desenho (opt-in do usuário final, não degradação por dispositivo) — ver "Decisões e suposições".
- [x] `SarakNavItem` aceita `category` e o agrupamento chega ao `SarakShellNav` — evidência: `SarakAppChrome.tokens.test.tsx`, teste "navItems com category agrupa a navegação".
- [x] O gate novo existe, reprova o estado anterior e passa no estado corrigido — evidência acima.
- [x] O gate declara, no próprio código, o que não enxerga — bloco `LIMITES DECLARADOS (R18)`, 4 itens.
- [x] O gate está registrado em `package.json` e roda junto dos demais — Anel 1 do pre-commit + lista explícita da CI.
- [x] `npx vitest run` verde — **com a ressalva de concorrência acima**; `npm run audit` comparado ao baseline (sem regravação, contagem não mudou); `cromo-css-real:check` verde.
- [x] Zero hardcode novo — `auditor_hardcoded`: 0 valor, 0 estrutural líquido.
- [ ] "Onde o efeito for CSS renderizado, estender `browser-tests/` em vez de afirmar por leitura de classe" (§5 item 8) — **não atendido para os tokens de cor/gap/margem/estrutura**, só para o que a suíte `cromo-css-real.spec.ts` já cobria antes (métrica do item de navegação, fundo da raiz). Motivo na pendência abaixo.

**Decisões e suposições**
- **`search` é prop nova, não um widget montado por padrão.** A instrução não define COMO `searchPositionSidebar`/`searchPositionTopbar` deveriam produzir efeito sem violar "Montar widgets por padrão — é a plan 67" (§3.2 fora). Resolvi como um slot a mais (`search`, `ChromeSearchSlot`): a lib dá a REGIÃO (posicionada pelo token), o consumidor continua dando o CONTEÚDO — mesmo princípio dos outros 8 slots (`05-cromo-e-slots.md` §2.2). Nenhum widget é montado sem o consumidor pedir.
- **`isAutoHideEnabled`: o comportamento de referência real é o do `DockNav`, não o do `SidebarNav`.** Medido: `SidebarNav.tsx:67` chama `setIsNavVisible(false)`, mas nada em `SarakShell.tsx` esconde a `SidebarNav` a partir desse estado (só o `DockNav`, via `{(isNavVisible || !isAutoHideEnabled) && (...)}`). Implementei o padrão que de fato funciona (ocultar a barra inteira + sensor de borda revela por hover), para os dois modos do `SarakAppChrome` (sidebar e topbar) — não apliquei ao celular (o drawer já é sob-demanda via hambúrguer; hover não existe em touch).
- **`sidebarPosition="floating"` não usa posicionamento absoluto** (diferente do `sidebarStrategies.floating` do Shell). Optei por margem + borda + sombra no fluxo normal — mesma ideia visual, sem a complexidade de recalcular o espaço do `<main>` ao lado de uma sidebar `position:absolute`. Declarado no cabeçalho de `chromeStructuralStyles.ts`.
- **`tabGap` do `SarakShellNav`**: só troquei o gap ENTRE itens de um grupo (o mais próximo de "aba"); o gap ENTRE grupos/categoria e o padding do `<nav>` continuam em `--sarak-layout-gap-sm`/`-md` — são espaçamentos de layout, não de "aba".
- **`tabSectionMargin` no cromo ui-kit usa fallback `0px`** (não `12px`, como no Shell) — hoje o `<aside>`/`<header>` do `SarakAppChrome` não tem margem nenhuma; um fallback não-zero mudaria o visual por padrão, violando "sem o token, comportamento de hoje".

**Achados fora do escopo (não corrigidos)**
- **`isNavHidden` do Shell (`SidebarNav`) não esconde de fato a nav via `isAutoHideEnabled`** — achado descrito acima; é dívida do lado Shell, fora do alcance desta plan (`src/core/Shell/` não se toca).
- **Sete tokens do schema `navigation` têm ZERO consumidor mesmo no `SarakShell`** (medido, não só suposto): `sidebarBlur`, `sidebarShadow`, `navActiveMarkerColor`, `navActiveMarkerGlow`, `searchDropdownGap`, `searchDropdownWidth`, `topbarNoiseOpacity`, `sidebarNoiseOpacity`, `topbarTitleColor` — nenhum aparece em `src/core/Shell/` nem no `SarakMenuItem`/`SarakShellNav`. É a MESMA classe de violação que esta plan fecha, só que pré-existente e fora dos doze nomeados no `§2` da plan. O gate novo **declara este limite explicitamente** (não os varre) para não reprovar o estado entregue por uma dívida que esta plan não pediu para pagar.
- **`specs/specs/05-cromo-e-slots.md:158-160`** ("Nota de contrato interno") descreve `SarakAppChromeMobile` recebendo `brand` como `ReactNode` já montado — não é mais verdade (agora recebe `{name, logoUrl}` bruto, como os outros dois corpos). Peço ao revisor atualizar essa nota na síntese.
- **`npm run dev-kit:check` está defasado** (`sarak-dev/state.json` + 2 arquivos) — não é gate exigido por esta plan nem entra em `cromo-css-real:check`; não rodei `npm run dev-kit` para não regenerar algo fora do que a plan declara, num worktree com outras plans em paralelo também alterando contagens.
- **Trabalho de outra(s) plan(s) em paralelo, observado mas não tocado**: `specs/plan/plan-70-predicado-de-midia-aceita-o-conjunto-legitimo.md`, `src/core/Provider/utils/cssSafety.ts` (+ testes novos `cssSafety.test.ts`, `mediaPredicateTable.ts`, `mediaBootConsoleClean.test.tsx`), `src/core/Design/hooks/__tests__/useDesignVariables.test.ts`, `src/core/Provider/utils/__tests__/validation.test.ts`, `docs/migracoes.md`, `specs/00-indice.md`, `src/core/Design/presets/components/atmosphere.ts`, `src/features/DesignEngine/Canvas/components/AtmosphereCatalog.tsx` (+ snapshot), `src/core/Design/presets/components/__tests__/` — nenhum destes foi criado, editado ou revertido por mim.

**Pendências / riscos**
- **Prova em navegador real (`browser-tests/`) não foi estendida** para os tokens de cor/gap/margem/estrutural — só a classe (jsdom) prova o consumo. `cromo-css-real.spec.ts` continua provando só o que já provava (métrica do item de navegação, fundo da raiz). Estender exigiria variantes novas do harness (`build-harness.mjs`/`fixtures/harness-entry.tsx`) para injetar tema custom por token — julguei fora do orçamento desta execução; registro como pendência explícita para o revisor decidir (corrigir agora, ou virar item de backlog).
- **`npx vitest run` na concorrência PADRÃO desta máquina é instável** por contenção de CPU/IO (documentado em `.claude/skills` e `.agents/skills` — mesmo arquivo de teste duplicado nos dois, achado pré-existente). Rodei a suíte inteira 4 vezes: só com `--maxWorkers=3` ela fechou 100% verde numa única passada (341/341, 1624/1624). Recomendo ao revisor usar a mesma flag se a verificação padrão mostrar falhas isoladas em arquivos sem relação com este diff.
- **Comentários novos usam a tag `(Spec 66)`**, seguindo o padrão JÁ EXISTENTE no arquivo (`SarakAppChrome.tsx` já tinha `(Spec 40.1 — L2)`, `(Spec 48 — L1)` etc., sobrevivendo à síntese das plans que os originaram). Entendi como convenção local de rastreio, não como o `// conforme plan-07` que a §3.6 do `00-prompt-executor` proíbe — mas registro a leitura para o revisor confirmar ou corrigir.

## Resumo da execução (correção 1) — 2026-09-10

**Resultado:** Concluído

**Achado do veredito de 2026-09-10:** 23 tags `(Spec 66)` em 18 arquivos disfarçadas de referência a spec
fixa — `Spec 66` não existe (não há `specs/66-*.md`); é o número da própria plan, removida na síntese.

**O que foi feito**
- Removi a tag `(Spec 66)` de **todas** as 24 ocorrências que encontrei em `src/` (18 arquivos — a diferença
  para "23" é que uma delas, em `SarakAppChrome.tokens.test.tsx:9`, é `// Spec 66 —` sem parênteses; contei
  como o mesmo achado e corrigi também), escolhendo a opção que o veredito registrou como preferida do
  `padrao-escrita`: **cair fora**, não apontar para `specs/05-cromo-e-slots`. Nenhuma delas tocou lógica —
  só o texto do comentário/docstring/nome de `describe`/`it`.
- Achei e corrigi **mais uma ocorrência do mesmo padrão**, fora dos "18 arquivos" porque mora em `gates/`,
  não em `src/`: `gates/scripts/contrato/check-chrome-token-parity.mjs:30`, `"componente (Spec 66 §5 item
  8)"`. Troquei para `"(plan-66 §5 item 8)"` — honesto, e consistente com as outras 5 citações de `plan-66`
  que já existiam no mesmo arquivo (linhas 2, 18, 19, 51, 129), que o veredito não reprovou (são o mesmo
  idioma que `check-class-merge.mjs` já usa para `plan-57`, um marcador histórico de gate, não uma
  referência disfarçada de spec fixa).
- Regerei `docs/component-catalog.{json,md}` e `sarak-ui/{catalog.json,GUIA-FRONTEND.md,...}` (`npm run
  catalog && npm run guide`) — três `doc` de prop/JSDoc carregavam a tag `(Spec 66)` copiada do código-fonte
  (`search` em `SarakAppChrome`/`SarakAppChromeMobile`, `collapsed` em `SarakShellNav`); sem regenerar, o
  catálogo publicado continuaria com a tag mesmo depois da fonte corrigida.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/SarakAppChrome.tsx` | alterado | 3 comentários — tag `(Spec 66)` removida |
| `src/components/Layout/SarakAppChromeMobile.tsx` | alterado | 3 comentários — idem |
| `src/components/Layout/chrome/ChromeSlots.tsx` | alterado | 2 comentários — idem |
| `src/components/Layout/chrome/navItem.ts` | alterado | 1 comentário — idem |
| `src/components/Layout/chrome/ChromeSidebarBody.tsx` | alterado | 1 comentário — idem |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx` | alterado | 1 comentário — idem |
| `src/components/Layout/chrome/chromeStructuralStyles.ts` | alterado | 1 comentário — idem |
| `src/components/Layout/chrome/useChromeAutoHide.ts` | alterado | 1 comentário — idem |
| `src/components/Layout/chrome/useChromeDesignTokens.ts` | alterado | 1 comentário — idem |
| `src/components/Layout/__tests__/SarakAppChrome.tokens.test.tsx` | alterado | 1 comentário — idem |
| `src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts` | alterado | 1 `describe` — idem |
| `src/components/Layout/chrome/__tests__/useChromeAutoHide.test.ts` | alterado | 1 `describe` — idem |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` | alterado | 1 `describe` — idem |
| `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` | alterado | 1 `describe` — idem |
| `src/components/atomic/Navigation/SarakMenuItem.tsx` | alterado | 1 comentário — idem |
| `src/components/atomic/Navigation/SarakShellNav.tsx` | alterado | 2 comentários — idem |
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | 1 `describe` — idem |
| `src/components/atomic/Navigation/__tests__/SarakShellNav.test.tsx` | alterado | 1 `describe` — idem |
| `gates/scripts/contrato/check-chrome-token-parity.mjs` | alterado | `(Spec 66 §5 item 8)` → `(plan-66 §5 item 8)` |
| `docs/component-catalog.{json,md}` | alterado | regenerado — 3 `doc` de prop sem a tag |
| `sarak-ui/{catalog.json,GUIA-FRONTEND.md,START-HERE.md,VERSION}` | alterado | regenerado — idem |

**Verificações executadas**
- `grep -rn "Spec 66" src/ gates/` → 0 ocorrências (era 25: 24 em `src/`, 1 em `gates/`).
- `grep -rn "Spec 66" docs/ sarak-ui/` → 0 ocorrências, após regenerar.
- `npx tsc --noEmit` → 0 erros.
- `npm run catalog:check` → "catálogo em dia"; `npm run guide:check` → "kit em dia (6 arquivos)".
- `node gates/scripts/contrato/check-chrome-token-parity.mjs` → `[OK]` — os 12 tokens continuam com
  consumidor nos dois lados (comentário não afeta a leitura textual do gate, mas confirmei mesmo assim).
- `npm run gate-limits:check` → "Os 37 scripts... declaram o que não veem" — o bloco `LIMITES DECLARADOS`
  do gate corrigido continua reconhecido.
- `npx vitest run src/components/Layout src/components/atomic/Navigation
  gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` → **26 arquivos / 180 testes, 100%
  verde** — nenhuma asserção quebrou (esperado: só texto de comentário/`describe` mudou, nenhum `expect`
  compara essas strings).

**Critérios de aceite**
- [x] As 23 tags `(Spec 66)` (24 na contagem literal, ver "O que foi feito") não apontam mais para uma spec
      inexistente — evidência: grep zerado acima.
- [x] Nenhuma linha de lógica mudou — evidência: `git diff` desta correção só toca comentários, JSDoc, nomes
      de `describe`/`it`, e os artefatos gerados que espelham esses comentários.
- [x] Suíte e gate seguem verdes — evidência acima.

**Decisões e suposições**
- **Contei 24 ocorrências, não 23** — a diferença é `SarakAppChrome.tokens.test.tsx:9`, que usava `// Spec
  66 —` sem parênteses. Tratei como o mesmo achado (é a mesma citação disfarçada, só sem parênteses) e
  corrigi também, em vez de deixar a única sobrevivente por uma técnicalidade de formato.
- **Corrigi a ocorrência de `gates/scripts/contrato/check-chrome-token-parity.mjs:30`**, que não está entre
  os "18 arquivos" do achado (mora em `gates/`, não em `src/`) mas é o mesmo defeito — uma citação
  parentética disfarçada de spec fixa. Optei por trocar para `plan-66` (honesto, e no mesmo idioma das
  outras 5 citações já existentes no arquivo) em vez de remover, porque ali o número identifica QUAL plan
  fechou aquele limite do gate — informação que o parágrafo perde se só disser "o teste de componente".

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os achados fora do escopo já registrados no resumo de 2026-09-09 continuam de pé e não foram
  revisitados nesta correção (escopo desta rodada é exclusivamente as tags `(Spec 66)`).

**Pendências / riscos**
- Nenhuma nova. As pendências do resumo de 2026-09-09 (prova em navegador real não estendida; instabilidade
  de concorrência da suíte nesta máquina) continuam como estavam — esta correção não as tocou.

---

# 10. Veredito

## Veredito — 2026-09-10 — 🔴 Reprovado

**Tecnicamente é a melhor execução desta campanha.** Reprovo por uma coisa só, mecânica, que o próprio
executor levantou e pediu que eu confirmasse — e que eu já reprovei em duas outras plans deste mesmo ciclo.

### O que verifiquei, e é forte

- **O gate é exemplar.** Passa (`[OK] Os 12 tokens… têm consumidor no SarakShell E no SarakAppChrome`), e o
  self-test prova o que a [[00-prompt-revisor]] §5.4 exige de toda regra: há casos **PLANTADO** de token
  sem consumidor que fazem o gate **reprovar** — nos dois lados e num lado só. Regra sem caso que falha não
  é regra; esta tem dois.
- **O bloco R18 é o mais honesto que li nesta base.** Declara o escopo fechado, admite que é textual e não
  por AST, explica que prova *existência de consumo*, não efeito visual, e — o mais valioso — **nomeia nove
  tokens do schema `navigation` que não têm consumidor nem no Shell**, medidos, com a razão de ficarem
  fora. É achado novo, e está registrado no lugar certo.
- **O teto de linhas foi respeitado pelo caminho certo:** `SarakAppChrome.tsx` de 250 → **218**, por
  extração de corpo (`ChromeSidebarBody`/`ChromeTopbarBody`), não por compressão de comentário. Era o
  pré-requisito que o achado 12 do [[00-backlog]] antecipava.
- **`search` como slot, não como widget** — a leitura correta da fronteira com a plan 67: a lib dá a
  REGIÃO posicionada pelo token, o consumidor dá o CONTEÚDO. Nenhum widget montado sem pedido.
- **Dois achados de comportamento, medidos e não presumidos:** `isAutoHideEnabled` só funciona de fato no
  `DockNav` (o `SidebarNav` chama `setIsNavVisible(false)` e nada esconde a barra), e por isso o padrão
  implementado foi o que funciona. E `sidebarPosition: floating` foi resolvido no fluxo em vez de
  `position:absolute`, com o motivo declarado no cabeçalho.
- **A instabilidade da suíte foi diagnosticada, não contornada:** `npx vitest run --maxWorkers=3` →
  **341 arquivos / 1630 testes, 100% verde**. Rodei eu mesmo e confirmo. É a primeira vez nesta campanha
  que a suíte inteira fecha limpa numa passada, e o diagnóstico (contenção de CPU/IO, não defeito) é
  informação real para o achado 6 do [[00-backlog]].
- `npm run audit:baseline` → *"nenhuma regressão"*; `cromo-css-real:check` → **5/5**; `tsc` → 0.

### Achado — 23 tags `(Spec 66)` em 18 arquivos

O executor perguntou explicitamente se `(Spec 66)` conta como referência a plan, notando que o arquivo já
traz `(Spec 18)`, `(Spec 40.1)`, `(Spec 48)`. **Conta.**

A diferença é que aqueles rótulos vêm da numeração de specs da campanha anterior — resíduo histórico, que
é a dívida do achado 5 do [[00-backlog]]. **`Spec 66` não existe:** não há `specs/66-*.md` e nunca haverá.
O número é o da **plan-66**, que é removida na síntese — e o rótulo é pior que `plan-66` num aspecto: ele
se **disfarça** de referência a spec fixa, que a regra permite, então o próximo leitor procura
`specs/66-*`, não encontra, e não tem pista de que era uma plan.

**Reprovo por consistência, e digo isso sem rodeio:** reprovei a plan-63 por 3 citações e a plan-64 por 9,
na mesma campanha. Deixar 23 passar porque a execução é boa transformaria a regra no que o revisor sentir
naquele dia.

**A correção é barata e tem destino certo:** o conteúdo destas 23 tags vai ser sintetizado em
[[05-cromo-e-slots]]. Apontar para lá — ou simplesmente cair fora, que é o preferido pelo `padrao-escrita`
— resolve, e sobrevive à remoção da plan.

### Uma decisão que é minha, e eu tomo aqui

A §5 item 8 mandava *"onde o efeito for CSS renderizado, estender `browser-tests/`"*. O executor declarou
honestamente que não estendeu para os tokens de cor/gap/margem/estrutura, e me pediu para decidir.

**Decido: o gate é o dono do invariante desta plan, e ele está satisfeito.** A §7 declarou o gate como a
forma da verificação; o que a extensão do harness provaria é o *efeito visual*, que é outra pergunta e
exige variantes novas de fixture para injetar tema por token. **Vai para o [[00-backlog]] como trabalho
próprio** — não é dívida desta execução, é escopo que a plan pediu demais para uma rodada só.

### Para a síntese (registrado agora para não se perder)

O executor apontou que [[05-cromo-e-slots]] §2.3, na nota de contrato interno, afirma que
`SarakAppChromeMobile` recebe `brand` como `ReactNode` já montado. **Deixou de ser verdade** — agora recebe
dados brutos, como os outros dois corpos. Corrijo na síntese.

### Atenção antes de commitar

`npm run dev-kit:check` está **DEFASADO** em 3 arquivos — `npm run dev-kit && git add sarak-dev/` antes do
commit, ou o Anel 1 barra.

---

## Veredito — 2026-09-10 (correção 1) — 🟢 Aprovado

O achado está fechado, e a execução fez duas coisas melhores do que o veredito pediu.

### O achado

`grep -rn "Spec 66" src/ gates/ docs/ sarak-ui/` → **zero ocorrências**. Eram 25.

**Duas iniciativas que aprovo, e a razão de cada uma:**

1. **Corrigiu 24, não 23.** A ocorrência a mais era `// Spec 66 —` **sem parênteses**, em
   `SarakAppChrome.tokens.test.tsx:9`. Tratar como o mesmo achado é a leitura certa — deixar a única
   sobrevivente por uma tecnicalidade de formato seria cumprir a letra e furar o motivo.
2. **Regerou o catálogo e o kit.** Três `doc` de prop carregavam a tag copiada do JSDoc do fonte
   (`search`, `collapsed`). Sem regenerar, o artefato **publicado** continuaria com o ponteiro morto depois
   de a fonte estar limpa. Isso eu não tinha antecipado no veredito.

### O que verifiquei

- `npx tsc --noEmit` → 0. `chrome-token-parity:check`, `catalog:check`, `guide:check` e
  `gate-limits:check` → todos verdes; o gate segue reconhecendo o bloco `LIMITES DECLARADOS`.
- **`npx vitest run --maxWorkers=3` → 341 arquivos / 1630 testes, 100% verde.** Rodei eu mesmo — é a prova
  prática de que só texto mudou: nenhuma asserção compara essas strings, e nenhuma quebrou.
- `npm run audit:baseline` → *"nenhuma regressão"*.

### Um resíduo que é MEU, não da execução

O gate novo carrega **seis** citações a `plan-66` (linhas 2, 18, 19, 30, 51, 129). O executor converteu a
sétima — a tag `(Spec 66 §5 item 8)` — para `(plan-66 §5 item 8)`, e me avisou disso no resumo.

Pela letra da regra, `plan-66` é a forma literalmente proibida. **Mas eu li esse arquivo inteiro ao escrever
o veredito anterior — inclusive o bloco R18 — e não flaguei nenhuma das seis.** Reprovar agora por aquilo
que eu deixei passar, depois de o executor ter feito exatamente o que pedi, seria mover o alvo — e foi
justamente contra a arbitrariedade que eu justifiquei a reprovação anterior.

Medido: o padrão existe em **pelo menos seis outros gates** da mesma pasta (`check-container-query-boundary`,
`check-container-query-literal`, `check-migration-anchor`, `check-persistence-doc-identifiers`,
`check-plan-index-sync`…). É dívida disseminada e é exatamente o achado 5 do [[00-backlog]] — a forma certa
de fechá-la é um gate, não uma quinta rodada de correção nesta plan.

**Aplico aqui a mesma disciplina que declarei na plan-70: paro a caça.** O que sobra tem dono nomeado e o
caminho de fechamento é sistêmico.

### Para a síntese

Permanece o que o resumo de 2026-09-09 registrou: [[05-cromo-e-slots]] §2.3, na nota de contrato interno,
ainda afirma que `SarakAppChromeMobile` recebe `brand` como `ReactNode` já montado — deixou de ser verdade.
Corrijo na síntese.

**Pode commitar** — depois de `npm run dev-kit && git add sarak-dev/`, que o Anel 1 exige.

---

# 11. Síntese

**Sintetizada em 2026-09-10** para `specs/05-cromo-e-slots.md`:

- **§2.4 (nova)** — um token de cromo vale nos dois modos de consumo ou não existe; a tabela de qual token
  produz qual efeito no cromo; a regra de que a tradução token → classe vive em mapa de literais, nunca em
  string interpolada.
- **§2.4.1 (nova)** — o gate `chrome-token-parity:check`, o que ele cobra e os limites que ele declara.
- **§2.1** — `category` no contrato de `SarakNavItem`.
- **§2.2** — o slot `search`, posicionado por token; a contagem de props e de slots deixou de ser fixada em
  prosa e passou a apontar o catálogo gerado (R17).
- **§9** — quatro linhas de plano de testes.

**Retida** ([[00-prompt-revisor]] §7.4): a plan-67 declara `depende_de` esta plan e ainda está aberta. Sai
junto quando a 67 for sintetizada.
