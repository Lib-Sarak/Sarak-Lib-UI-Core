---
tipo: "plan"
titulo: "Dar ao layout ocupação de coluna, abas com rota, densidade de cartão e altura de página"
objetivo: "Fazer a tela do importador se compor sem classe utilitária nem cálculo de altura: SarakGridItem com span por dispositivo, SarakGrid com colunas declarativas, SarakTabs com rota, contador e painel ligado, SarakCard com densidade sm/md/lg e página que ocupa a altura que o cromo deixa"
dominio: "Layout / Cromo"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "layout", "cromo", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[02-design-engine]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md"
---

# 1. Objetivo

Itens Layout 1–4 do contrato entregues, com `SarakGridItem` e `SarakTabPanel` públicos e a altura de página sem cálculo no importador.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §0 (valor por dispositivo), §1.1, §1.3, §2.7, §4. **Nomes,
tipos e padrões de lá são lei.**

O que a leitura revelou: o formato por dispositivo é `SarakResponsiveValue` (`src/core/Design/types.ts:9`); `SarakGrid`
(`src/components/atomic/Layouts/SarakGrid.tsx`) já aceita `templateColumns` responsivo e colapsa para 1 coluna no celular; o
dispositivo vem de `useSarakDevice()` (`core/Provider/DeviceProvider`), que lê os breakpoints do tema — use-o, porque classe
`@min-[768px]` não lê token (`00-contexto` §8). As classes `col-span-1/2/6/full` são contrato travado por teste (backlog 57, C5 da
`plan-119`) e **continuam**. `SarakTabs` (`src/components/atomic/UX/SarakTabs.tsx`) tem item só com `id`, `label`, `icon`,
`disabled`. `SarakCard` (`src/components/atomic/Cards/SarakCard.tsx`) não tem densidade; só existe `--sarak-card-padding-md`.
O cromo **já** tem `height: 100dvh` (`src/components/Layout/SarakAppChrome.tsx:197`); o `<main>` está em
`src/components/Layout/chrome/ChromeContentRegion.tsx:31`. `SarakAnalyticalPage` usa as variáveis legadas `--border-color` e
`--color-theme-card` (`src/components/Layout/SarakAnalyticalPage.tsx`).

**A demanda 12 do ERP** diz que, sem `height: 100%` em `html/body/#root`, o conteúdo rola a janela sob a topbar. Com o `100dvh`, isso
não deveria acontecer: **meça primeiro** (caso de navegador) e só corrija se reproduzir.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Layouts/` — `SarakGridItem.tsx` (novo, com teste) e `SarakGrid.tsx` (`columns`).
- `src/components/atomic/UX/SarakTabs.tsx` e `SarakTabPanel.tsx` (novo, com teste).
- `src/components/atomic/Cards/SarakCard.tsx` (`density`) e onde o motor emite `--sarak-card-padding-md` (para derivar `-sm`/`-lg`).
- `src/components/Layout/SarakAnalyticalPage.tsx` (`sidePanelWidth`, `fillHeight`, troca das variáveis legadas pelas `--sarak-*`).
- `src/components/Layout/chrome/ChromeContentRegion.tsx` e o CSS do `<main>` (coluna flexível, `min-height: 0`, classe `sarak-fill-height`).
- `browser-tests/` — um caso: página mais alta que a janela, sem a cadeia de altura no host: topbar fixa, rolagem só no `<main>`.
- Registro dos componentes novos onde a skill `ui-novo-componente` manda (paridade e barril).
- `src/core/i18n/catalogEntries.layout.ts` · `src/index.ts` (acréscimo) · `docs/migracoes.md` (uma subseção na `## 8.0.0`).

## 3.2 Fora
- Token novo no schema do painel (os de padding são derivados — contrato §4).
- `SarakAppChrome` além do `<main>`, salvo se a medição do passo 2 reproduzir o defeito (aí o conserto entra, declarado no resumo).
- O guia do kit (é da `plan-119`, lote 8). Arquivos gerados.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §0, §1.1, §1.3, §2.7, §4, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/05-cromo-e-slots.md` · `specs/07-responsividade-e-multidispositivo.md` | cromo e regra por dispositivo |
| Spec fixa | `arquitetura/02-design-engine.md` §10 | variável com um dono, reserva igual ao padrão (R41–R43) |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | padrão ARIA de abas e de navegação |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-novo-componente` · `ui-arquitetura-design` | sempre · componente novo com paridade · CSS por token |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Escreva o caso de navegador da demanda 12 e diga no resumo se reproduz na rc.3. Reproduziu: corrija o cromo e diga onde.
3. `SarakGridItem` e `SarakGrid.columns` (§1.1, §2.7), pelo `useSarakDevice()`; no celular, `span` maior que as colunas vira `full`.
4. `SarakTabs` + `SarakTabPanel` (§1.3, §2.7): sem `href`, padrão `tablist`/`tab`/`tabpanel` com setas; com `href`, `<nav>` de links
   com `aria-current="page"` e `onNavigate` que impede a recarga; `count` dentro do nome acessível.
5. `SarakCard density` e `--sarak-card-padding-sm`/`-lg` derivados do `md`, com um dono só (R42).
6. `SarakAnalyticalPage`: `sidePanelWidth`, `fillHeight`, variáveis legadas trocadas.
7. Subseção em `docs/migracoes.md`; `npm run barrel:check`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] `SarakGridItem`: `grid-column` certo em `mob`, `tab` e `desk` (dispositivo simulado) — teste.
- [ ] Abas sem `href`: `aria-controls` ↔ `id` do painel, `aria-labelledby` de volta, setas mudam a aba — teste por papel.
- [ ] Abas com `href`: `role="navigation"`, link com `aria-current="page"`, `onNavigate` chamado e recarga impedida — teste.
- [ ] `SarakCard density="sm"|"lg"` lê `--sarak-card-padding-sm|lg`, e o padrão `md` não muda — teste.
- [ ] Caso de navegador escrito; resultado da rc.3 relatado.
- [ ] `SarakAnalyticalPage` sem `--border-color` nem `--color-theme-card` (grep colado).
- [ ] Sem prop nova, comportamento da rc.3 (testes existentes passam sem alteração).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste de componente e por um caso de navegador.

- `npx vitest run SarakGrid SarakTabs SarakTabPanel SarakCard SarakAnalyticalPage ChromeContentRegion SarakAppChrome src/core/i18n` — uma vez.
- O caso de navegador roda **no fechamento**, dentro do `cromo-css-real:check` único da campanha (contrato §9); a aprovação desta
  plan fica condicionada a ele.
- Diff lido contra o contrato; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` + `specs/07-responsividade-e-multidispositivo.md` — textos prontos:

> **05:** O cromo tem altura própria (`100dvh`) e não depende de `html/body/#root`; o `<main>` é coluna flexível com `min-height: 0`;
> o filho que enche a altura usa `fillHeight` ou `sarak-fill-height`.
>
> **07:** Ocupação de coluna por dispositivo é `SarakGridItem span` (`SarakResponsiveValue`), resolvida pelo `DeviceProvider`; as
> classes `col-span-*` seguem suportadas.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-28

**Resultado:** Concluído (o caso de navegador foi escrito e passou contra o `dist/` da rc.3; a bateria do fechamento é do revisor).

**Estado do worktree ao iniciar**
(limpo) — `HEAD` = `b5bf7667`. Durante a execução apareceram arquivos de outras plans em voo (128–135: tabela, gráficos, paleta, formulário), que **não toquei**.

**O que foi feito**
- `SarakGridItem` novo (`Layouts/SarakGridItem.tsx`): `span` (número, `'full'` ou `{mob,tab,desk}`), `rowSpan`, `as`; dispositivo por `useSarakDevice()`. Span maior que as colunas do grid vira `1 / -1`; no celular sem `columns` declarado, `span > 1` vira linha toda.
- `SarakGrid.columns` (`SarakGrid.tsx`): número ou por dispositivo → `repeat(N, minmax(0, 1fr))`; vence `templateColumns`; número fixo colapsa para 1 no celular (como `templateColumns` string). `gridColumnsContext.ts` passa as colunas resolvidas ao item.
- `SarakTabs`: `href` (lista vira `<nav>` de `SarakLink` com `aria-current="page"`), `onNavigate`, `count` (dentro do nome acessível), `panelId`, `idPrefix` (gerado por `useId`), `onChange` opcional; abas sem `href` ganham `id` e `aria-controls`. Estilos extraídos para `tabsStyling.tsx` (classes Tailwind seguem literais) e ids para `tabIds.ts`.
- `SarakTabPanel` novo: `role="tabpanel"`, `id` = `aria-controls` da aba, `aria-labelledby` de volta.
- `SarakCard density` (`SarakCard.tsx`) → atributo `data-sx-card-density` (ausente no `md`). `_card-defaults.css` declara `--sarak-card-padding-sm|lg` em `:where(:root, .sarak-design-scope)`, derivados do `md` (×0,6667 / ×1,3333), com especificidade zero para o importador sobrescrever; um dono só (R42).
- `SarakAnalyticalPage`: `sidePanelWidth`, `fillHeight`; `--border-color`/`--color-theme-card` trocados por `--sarak-card-border-color`/`--sarak-card-bg`.
- `ChromeContentRegion`: `<main>` ganha `flex flex-col min-h-0`; classe pública `.sarak-fill-height` em `_utilities.css`.
- Barril: `SarakGridItem`/`SarakGridItemProps` em `src/index.ts`; `SarakTabPanel` sai por `UX/index.ts` (já exportado por `export *`).
- `docs/migracoes.md`: subseção dentro da `## 8.0.0`.

**Demanda 12 (altura do cromo) — medido, NÃO reproduz na rc.3.** Caso `browser-tests/altura-do-cromo.spec.ts` (topbar, 1280×600, página de 3000 px, sem cadeia de altura no host) rodado contra o `dist/` existente (26/10, rc.3): o `main` rola (`scrollHeight > clientHeight`), `window.scrollY = 0`, o documento não passa da janela, a topbar não se move. Nenhum conserto de altura no cromo foi necessário. A 1ª versão do spec afirmava `headerTop ≈ 0`; a topbar tem 16 px de folga própria — corrigi a asserção para comparar antes/depois da rolagem.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Layouts/SarakGridItem.tsx` | criado | item de grid com span/rowSpan por dispositivo |
| `src/components/atomic/Layouts/gridColumnsContext.ts` | criado | colunas resolvidas do grid pai |
| `src/components/atomic/Layouts/SarakGrid.tsx` | alterado | `columns` + provider |
| `src/components/atomic/Layouts/index.ts` | alterado | exporta o item |
| `src/components/atomic/UX/SarakTabs.tsx` | alterado | href/nav, onNavigate, count, panelId, idPrefix, onChange opcional |
| `src/components/atomic/UX/SarakTabPanel.tsx`, `tabIds.ts`, `tabsStyling.tsx` | criados | painel, ids, estilos extraídos |
| `src/components/atomic/UX/index.ts` | alterado | exporta o painel |
| `src/components/atomic/Cards/SarakCard.tsx` | alterado | `density` |
| `src/styles/_card-defaults.css` | alterado | `-sm`/`-lg` derivados + regras por atributo |
| `src/styles/_utilities.css` | alterado | `.sarak-fill-height` |
| `src/components/Layout/SarakAnalyticalPage.tsx` | alterado | `sidePanelWidth`, `fillHeight`, variáveis trocadas |
| `src/components/Layout/chrome/ChromeContentRegion.tsx` | alterado | `<main>` coluna flexível |
| `src/index.ts` | alterado (acréscimo) | exports do item |
| `docs/migracoes.md` | alterado (acréscimo) | subseção da plan |
| `browser-tests/altura-do-cromo.spec.ts`, `browser-tests/fixtures/altura-do-cromo-entry.tsx` | criados | caso de navegador da demanda 12 |
| `SarakGridItem.test.tsx`, `SarakTabPanel.test.tsx`, `SarakCard.density.test.tsx` | criados | testes dos componentes novos |
| `SarakAnalyticalPage.test.tsx`, `ChromeContentRegion.test.tsx` | alterados (acréscimo) | casos novos, sem mexer nos existentes |

**Verificações executadas**
- `npx vitest run SarakGridItem SarakTabPanel SarakCard SarakAnalyticalPage ChromeContentRegion SarakAppChrome SarakGrid SarakTabs src/core/i18n` → 25 arquivos, 203 testes, todos passam. (Uma rodada anterior falhou ao carregar 18 arquivos porque a plan 133 em voo importava `./contrast` ainda inexistente; repetida depois que o arquivo existiu.)
- `npm run barrel:check` → 109 componentes, 0 faltas.
- `npx tsx gates/scripts/contrato/check-variable-contract.ts` → as 2 leituras sem dono de `--sarak-card-padding-sm|lg` sumiram; resta só `SarakDataTableSkeleton.tsx:23` (outra plan).
- `npm run verify -- --tier=quick` → Anel 0: 0 achados. Falhas restantes, **todas fora da minha §3.1**: `tsc` (`gates/scripts/audit/verify_contrast.ts`, `CalendarPanel.tsx`, paleta/Select de outras plans) e `audit:baseline --with-tsc` (reflexo do `tsc`); `catalog:check`/`guide:check`/`dev-kit:check` (gerados, por desenho); `theme-completeness:check` (`colorPalette`, plans 133–134); `variable-contract:check` (Skeleton da tabela); `plan-index:check` (plans 119 e 130). Nenhuma aponta Layout/UX/Cards/estilos desta plan.
- `npx playwright test --config=browser-tests/playwright.config.ts altura-do-cromo` → 1 passou (1,3 s) contra o `dist/` da rc.3.

**Critérios de aceite**
- [x] `SarakGridItem` em `mob`/`tab`/`desk` — `SarakGridItem.test.tsx` › "em %s resolve o span responsivo" (3 casos).
- [x] Abas sem `href`: `aria-controls`↔`id`, `aria-labelledby`, setas — `SarakTabPanel.test.tsx` › "aria-controls da aba…" e "seta para a direita…".
- [x] Abas com `href`: `navigation`, `aria-current`, `onNavigate`, recarga impedida — `SarakTabPanel.test.tsx` › bloco "abas com href" (`fireEvent.click` devolve `false`).
- [x] `SarakCard density` lê `--sarak-card-padding-sm|lg`; `md` não muda — `SarakCard.density.test.tsx` (a leitura é provada **no texto do CSS**: jsdom não calcula `padding`; o efeito em pixel não foi medido em navegador).
- [x] Caso de navegador escrito; rc.3 não reproduz (acima).
- [x] `SarakAnalyticalPage` sem as variáveis legadas — teste "não usa as variáveis legadas" (só no ramo mobile) e `Grep` de `--border-color|--color-theme-card` em `SarakAnalyticalPage.tsx` → vazio.
- [x] Sem prop nova, comportamento da rc.3 — os testes existentes de Grid, Tabs, Card, AnalyticalPage e Chrome passam **sem alteração** (só acrescentei casos).
- [x] Tabela item → teste (abaixo).

| Item do contrato | Teste (arquivo) |
|---|---|
| §1.1 `SarakGridItem` span/rowSpan/as | `SarakGridItem.test.tsx` › 6 casos |
| §2.7 `SarakGrid.columns` | `SarakGridItem.test.tsx` › "columns declarativo" (3 + vence `templateColumns`) |
| §1.3 `SarakTabPanel` | `SarakTabPanel.test.tsx` › "aria-controls…", "seta…" |
| §2.7 `href`/`onNavigate`/`count`/`panelId`/`idPrefix` | `SarakTabPanel.test.tsx` › "contador…", "panelId…", "sem idPrefix…", bloco `href` |
| §2.7 `onChange` opcional | `SarakTabPanel.test.tsx` (usa `SarakTabs` sem `onChange`) |
| §2.7 `SarakCard density` / §4 | `SarakCard.density.test.tsx` › 3 casos |
| §2.7 `sidePanelWidth`, `fillHeight` | `SarakAnalyticalPage.test.tsx` › "largura do painel e altura" |
| §4 `<main>` coluna flexível | `ChromeContentRegion.test.tsx` › "o main é coluna flexível…" |
| §4 altura do cromo (demanda 12) | `browser-tests/altura-do-cromo.spec.ts` |

**Decisões e suposições**
- Padding `sm`/`lg` declarado em `:where(:root, .sarak-design-scope)` (não como fallback na regra do cartão): o gate `variable-contract` acusa leitura sem dono, e o seletor é o mesmo onde o motor escreve o `md`. Consequência: um `--sarak-card-padding-md` sobrescrito num elemento interno **não** propaga ao `sm`/`lg` daquela subárvore.
- Fatores 2/3 e 4/3 (0,6667 / 1,3333): a plan não os fixou.
- Em modo navegação, aba com `href` e `disabled` cai no botão desabilitado (sem link); aba sem `href` na mesma lista vira botão sem `role="tab"`.
- `SarakTabPanel` sem `idPrefix` usa `sarak-tabs`, mas `SarakTabs` sem `idPrefix` gera `useId`: só casam quando o `idPrefix` é passado nos dois (está no JSDoc).
- `catalogEntries.layout.ts` não foi tocado: nenhum texto novo da lib foi necessário (o `<nav>` das abas não tem `aria-label`).
- Registro de paridade: `barrel:check` verde; não havia outro ponto de registro a editar para os dois componentes novos.

**Achados fora do escopo (não corrigidos)**
- `SarakDataTableSkeleton.tsx:23` — reserva `rgba(255,255,255,0.06)` ≠ padrão do token (`variable-contract`).
- `gates/scripts/audit/verify_contrast.ts:102-107,295` e `CalendarPanel.tsx:198` — erros de `tsc` do `quick`.
- `SarakInput.paddingToken.test.tsx:24` — `SarakSelect` sem `label` (Q1, plan 132).

**Pendências / riscos**
- `<main>` agora é coluna flexível: filho direto com `margin: 0 auto` e sem largura própria encolhe ao conteúdo (documentado na migração). Não medi isso em navegador com telas reais.
- O caso de navegador mediu só a topbar; sidebar e celular não.
- O browser-test usou o `dist/` que já existia; no fechamento ele roda contra o build novo dentro do `cromo-css-real:check`.

---

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado (2 achados)

**Medido por mim**, pelo protocolo do contrato §9: o filtro da §7 rodou uma vez — **176/176 verdes**. A demanda 12 foi medida em
navegador e **não reproduz** na rc.3 (aceito; a I40 da `plan-119` pode seguir). `SarakGridItem`, `SarakGrid.columns`, densidade do
cartão (derivada do `md`, com um dono só) e `SarakAnalyticalPage` conferem com o contrato.

**Achado 1 — o `<main>` flexível encolhe o conteúdo centralizado (o erro nasceu no contrato §4, escrito pelo revisor).** Com
`display: flex; flex-direction: column`, filho com `margin: 0 auto` deixa de esticar e fica do tamanho do conteúdo. **Medido em
Chromium:** um filho `max-width: 1000px; margin: 0 auto` num `<main>` de 1200 px ocupa **1000 px** em bloco (rc.3) e **33 px** com a
mudança desta plan. O padrão `max-w-* mx-auto` é comum nas telas do ERP. **Correção (o contrato §4 já foi corrigido):** o `<main>`
volta ao bloco da rc.3; `fillHeight` e `.sarak-fill-height` passam a `min-height: 100%` do `<main>` (que tem altura definida dentro do
cromo). **Prova em navegador**, no caso `altura-do-cromo` (ou irmão): o filho centralizado mantém a largura máxima, e o filho com
`sarak-fill-height` tem a altura do `<main>`. Cole os números.

**Achado 2 — `aria-controls` aponta para um painel que pode não existir.** `SarakTabs.tsx:131` emite `aria-controls` sempre, com o
prefixo gerado por `useId`; o `SarakTabPanel` sem `idPrefix` usa `sarak-tabs` (`tabIds.ts:1`). Sem `idPrefix` nos dois — ou com abas e
o painel do próprio consumidor —, a referência fica pendurada (ARIA inválido, e a rc.3 não tinha esse defeito). **Correção (contrato
§1.3 e §2.7 já corrigidos):** `SarakTabs` só emite `aria-controls` com `idPrefix` ou `panelId` informados; `SarakTabPanel.idPrefix`
passa a obrigatório. Teste: sem `idPrefix`, nenhum `aria-controls`; com ele, o par casa.

**Observação (não bloqueia):** com `href`, o `<nav>` das abas não tem nome; numa página com a navegação do cromo, são dois `navigation`
sem distinção. Fica para o lote 2, se o ERP pedir um rótulo.

**Status: 🔵 Em correção.**

---

## Resumo da execução (correção 1) — 2026-10-28

**Achado 1 — `<main>` volta ao bloco; `sarak-fill-height` = `min-height: 100%`.**
- `ChromeContentRegion.tsx`: removido `flex flex-col min-h-0` (o `<main>` é a classe que o cromo passa, como na rc.3). `_utilities.css`: `.sarak-fill-height { min-height: 100% }`. `SarakAnalyticalPage.tsx`: `fillHeight` usa só `sarak-fill-height`.
- Teste: `ChromeContentRegion.test.tsx` agora exige que o `main` **não** tenha `flex`/`flex-col`.
- **Navegador** (`altura-do-cromo.spec.ts`, 2º caso, fixture `altura-do-cromo-filho-entry.tsx`; código-fonte + CSS gerado agora em pasta temporária, `dist/` intocado; 1440×800, topbar):
  `MEDIDO {"display":"block","mainContentHeight":640,"mainContentWidth":1232,"centeredWidth":1000,"fillHeight":640}`
  → filho `max-width:1000; margin:0 auto` ocupa **1000 px** (era 33 px em coluna flexível); filho `sarak-fill-height` tem **640 px = altura útil do `<main>`**. O 1º caso (página alta) segue passando.
- `docs/migracoes.md`: trecho "Altura do cromo" reescrito (bloco, `min-height: 100%`), sem o aviso de `width: 100%`.

**Achado 2 — `aria-controls` só com destino.**
- `SarakTabs.tsx`: `aria-controls` = `tab.panelId`, ou `${idPrefix}-panel-${id}` **só se `idPrefix` foi passado**; senão ausente. O `id` da aba segue sempre emitido.
- `SarakTabPanel.tsx`: `idPrefix` obrigatório; removido `DEFAULT_TABS_ID_PREFIX` (`tabIds.ts`).
- Testes (`SarakTabPanel.test.tsx`): novo "sem idPrefix nem panelId, a aba não emite aria-controls"; o par com `idPrefix` continua provado. Migração atualizada.

**Verificações**
- `npx vitest run tabsStyling SarakTabs SarakTabPanel ChromeContentRegion SarakAnalyticalPage` → 6 arquivos, 42 testes verdes.
- `npx playwright test … altura-do-cromo` → 2 passaram (números acima).
- `npm run verify -- --tier=quick` → Anel 0: 0 achados; `barrel:check` ok; sobram `catalog`/`guide`/`dev-kit` (gerados), `token-types:check` (design-token-docs defasado, outra plan) e `audit:baseline --with-tsc` (regressão em `SarakSelect`, `CalendarPanel`, `useDatePickerController`, `SarakMaskedInput`, `SarakChartEngine`, `seriesModel`, `SarakMultiSelect`, `SarakUploader` — fora da §3.1).

**Fora do pedido, mas era meu:** o `quick` acusava `tabsStyling.tsx` sem teste 1:1 (órfão da execução original). Criei `UX/__tests__/tabsStyling.test.tsx`; o órfão sumiu do `run_audit`.

**Observação do veredito (nav sem nome):** não tratada, como instruído.

## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovada

**Achado 1 fechado.** O `<main>` voltou ao bloco (`ChromeContentRegion.tsx`), `.sarak-fill-height` é `min-height: 100%`, e o teste exige
que o `main` não seja flexível. Os números de navegador colados conferem com a minha medição do veredito anterior: filho centralizado
com **1000 px**, filho `sarak-fill-height` com **640 px = altura útil do `<main>`**. **Achado 2 fechado:** `aria-controls` só com
`idPrefix` ou `panelId`; `SarakTabPanel.idPrefix` obrigatório; teste do caso sem prefixo. O teste 1:1 de `tabsStyling.tsx`, órfão da
execução original, foi criado. **Medido por mim:** `SarakTabs SarakTabPanel ChromeContentRegion SarakAnalyticalPage tabsStyling`, uma
vez, verdes; o `audit:baseline` do worktree não aponta arquivo desta plan. O caso de navegador volta a rodar no fechamento, contra o
build novo.

**Status: 🟢 Aprovada.** A I40 da `plan-119` (lote 8.5) pode seguir: a demanda 12 não reproduz. Síntese em [[05-cromo-e-slots]] e
[[07-responsividade-e-multidispositivo]] — o texto da §8 muda: o `<main>` **continua em bloco**; o filho que enche a altura usa
`fillHeight`/`sarak-fill-height` (`min-height: 100%`).
