---
tipo: "plan"
titulo: "Fechar as pendencias do arsenal do Design Engine antes de os temas serem refeitos"
objetivo: "Resolver, antes de os temas embarcados serem refeitos, tudo que o arsenal do Design Engine oferece e nao entrega: ligar os tokens que nao desenham, retirar os redundantes e manter aqui o registro vivo das pendencias que a plan-110 for achando"
dominio: "Design Engine / Arsenal / Tokens"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "design-engine", "tokens", "arsenal", "temas", "pendencias"]
relacionados: ["[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[00-regras-e-invariantes]]"]
depende_de: "—"
retida_por: "plan-110"
destino_sintese: "sintetizada · retida por plan-110"
---

# 1. Objetivo

Antes de refazer os 19 temas, **o arsenal que eles vão usar entrega o que promete**: todo token que o schema (e o
painel) oferece muda a tela, ou sai do schema. Esta plan é também o **registro vivo** das pendências do arsenal que a
`plan-110` for descobrindo: cada achado entra na tabela da §3, é resolvido em lote aqui, e só então os temas são
ajustados.

# 2. Contexto

O lote 1 da `plan-110` (2026-10-15) abriu os 120 tokens de cartões, sobreposições e tabelas, um a um, no leitor e no
navegador, e encontrou **sete que o schema e o painel oferecem e nada desenha** (anexo
`plan-110-tokens-funcionais.md` §4; hoje na exceção `achado-lote-1` do gate de documentação e no GUIA §6.4). O dono
decidiu (2026-10-15): **ligar cinco e retirar dois**, e anotar aqui as próximas pendências, resolvendo-as antes de
ajustar os temas. O dono valida só no importador, no fim (`8.0.0-rc.1`), então cada ligação precisa se provar sozinha.

**Medido no lote 1 da `plan-110`, conferido pelo revisor (2026-10-15):**

| Token | Hoje | Decisão |
|---|---|---|
| `cardActionClickScale` | `SarakActionCard.tsx:59` calcula `clickScale` e não o usa | **ligar** |
| `imageCardHoverZoom` | o `whileHover` está na camada da imagem; o véu e o conteúdo, por cima, recebem o ponteiro: a camada nunca é "hovered" | **ligar** |
| `cardSpotlightOpacity` | 4 cartões escrevem `data-spotlight` e `.spotlight-effect`; nenhuma regra CSS os lê | **ligar** |
| `borderBeamEnabled` | `.border-beam-effect` sem regra; `@keyframes beam-rotate` e `@property --beam-angle` existem em `_animations.css:21-30` | **ligar** |
| `cardSearchBorderBeamActive` | idem, no cartão de busca em foco | **ligar** |
| `cardContentAlignment` | só o `getCardStyles` morto o lê; ligá-lo com o padrão `start` agruparia o conteúdo no topo de todo cartão (hoje `cardTextAlign` já decide: `left` → `justify-between`) | **retirar** |
| `tableActionPosition` | `useTableLayoutStyles` calcula e ninguém consome; a `SarakTable` não tem coluna de ações nem API para ela | **retirar** |

**Decisão de desenho registrada (a confirmar pelo executor contra o código):** o spotlight **segue o cursor** — um
hook compartilhado pelos quatro cartões grava `--sarak-spot-x`/`--sarak-spot-y` no cartão (ponteiro fino; em toque ou
sem movimento, o gradiente cai no centro). Sem o hook, a descrição do token mente.

**Efeito sobre quem já consome:** spotlight (padrão 0,1), zoom (1,05), escala do clique (0,96) e o beam do campo de
busca (`true`) passam a **desenhar por padrão**. É mudança visível, vai na nota MAJOR da `## 8.0.0`, e o
`sarak-sovereign` (lote 6 da `plan-110`) fixa os valores padrão estéticos — por isso esta plan **não** altera
nenhum `defaultValue`.

# 3. Escopo

## 3.1 Dentro
- **Ligar:** `src/components/atomic/Cards/` (`SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`) e
  `src/components/atomic/Templates/` (`SarakCoreCard`, `SarakImageCard`); o hook novo do spotlight junto deles;
  `src/styles/` (`_cards.css` e/ou `_animations.css`, a regra do `.spotlight-effect` e do `.border-beam-effect`).
- **Retirar:** `src/core/Design/schema/{cards,tables}.ts`, `src/core/Design/catalog/partitions/` e
  `theme_table_mapping.json` (paridade), `src/core/Provider/generated/` (por `npm run token-types`),
  `src/core/Provider/utils/removedTokenKeys.ts`, os tipos extras em `src/core/Provider/types.ts` /
  `payloadExtraKeys.ts`, e o código morto (`getCardStyles` em `useStructuralStyles.ts`, `actionColumnAlignmentClass`
  em `useTableLayoutStyles.ts`) — pela skill `ui-refatorar-componente`.
- **Documentar:** o `usage`/`kind`/`modeDependent`/`interactsWith` dos cinco ligados no schema, e a saída deles da
  exceção `achado-lote-1` (`gates/allowlists/tokenDocumentationPending.json`); `sarak-ui/GUIA-FRONTEND.md` (§6.4 e o
  mapa) e `.agents/skills/ui-integra-consumidor/`; `docs/migracoes.md` (`## 8.0.0`).
- **Lote 4 (P10–P13):** `src/components/atomic/Templates/SarakCatalogGrid.tsx` e `src/components/atomic/Buttons/SarakButton.tsx`
  (P10); `src/core/Design/hooks/useDesignVariables.ts`, `src/core/Design/schema/colors.ts` e, se retirar, as mesmas portas
  da retirada do lote 3 (P11); `src/components/engines/charts/SubEngines/builders/{advancedCharts,types}.ts`, os
  `optionBuilders.ts`/`axisOptions.ts` ao lado e `src/core/Design/schema/data.ts` (P12);
  `src/components/atomic/Inputs/SarakRangeSlider.tsx`, `src/styles/_utilities.css` e `src/core/Design/schema/inputs.ts`
  (P13); `src/core/Design/schema/buttons.ts` (P10).
- **Provar:** testes de componente, o caso de navegador (`browser-tests/`, cena nova no harness) e o gate de leitor.
- `specs/plan/anexos/plan-110-tokens-funcionais.md` — acrescentar o desfecho dos sete (o executor).

## 3.2 Fora
- Qualquer `defaultValue` (é o lote 5/6 da `plan-110`) e qualquer tema.
- Token novo, opção nova de token existente, ou qualquer funcionalidade que não seja o desenho prometido pelo
  próprio token (ex.: **não** criar API de ações de linha na `SarakTable`).
- Specs em `specs/` (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/02-design-engine.md` (§9, §10.2, §10.6, §10.8-§10.11) | como o motor emite e como o componente lê; cascata e variável com dono |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | a paridade que a retirada de token respeita |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §2.4 | movimento reduzido e toque |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R33, R40-R44) | contrato público, token sem leitor, cascata, variável, cor fixa |
| Anexo | `specs/plan/anexos/plan-110-tokens-funcionais.md` §4 | a medição que originou a plan |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-arquitetura-design` · `ui-refatorar-componente` · `ui-novo-componente` | CSS do motor, remoção de token sem quebrar paridade |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/components/atomic/Cards/SarakActionCard.tsx` · `src/components/atomic/Cards/SarakSearchCard.tsx` · `src/components/atomic/Cards/SarakTitleCard.tsx` · `src/components/atomic/Templates/SarakImageCard.tsx` · `src/components/atomic/Templates/components/SarakCoreCard.tsx` · `src/styles/_animations.css` · `src/core/Provider/manifest.ts` | os leitores e as variáveis emitidas |
| Código (lote 4) | `src/components/atomic/Templates/SarakCatalogGrid.tsx` · `src/components/atomic/Buttons/SarakButton.tsx` · `src/core/Design/schema/buttons.ts` (P10) · `src/core/Design/hooks/useDesignVariables.ts` · `src/core/Design/schema/colors.ts` · `src/core/Provider/utils/removedTokenKeys.ts` (P11) · `src/components/engines/charts/SubEngines/builders/advancedCharts.ts` · `src/components/engines/charts/SubEngines/builders/types.ts` · `src/components/engines/charts/SubEngines/optionBuilders.ts` · `src/components/engines/charts/SubEngines/axisOptions.ts` · `src/core/Design/schema/data.ts` (P12) · `src/components/atomic/Inputs/SarakRangeSlider.tsx` · `src/styles/_utilities.css` · `src/core/Design/schema/inputs.ts` (P13) | os leitores e os schemas dos quatro achados; a medição que os originou está no resumo do lote 2 da `plan-110` (tabela por token) |
| Navegador | `browser-tests/fixtures/harness-entry.tsx` · `browser-tests/cartao-que-se-move.spec.ts` (o molde de caso e cena) · `PLAYWRIGHT_BROWSERS_PATH` = caminho absoluto de `node_modules/.cache/ms-playwright` do repositório, `chromium.launch()` sem `executablePath` | provar cada token por diferença de estilo computado |
| Skill (se existir na sessão) | `dataviz` | só para P12; nenhuma paleta de gráfico muda — sem a skill, siga sem ela e diga no resumo |
| Código | `gates/allowlists/tokenDocumentationPending.json` · `gates/scripts/contrato/check-token-documentation.ts` · `gates/scripts/contrato/check-token-reader.mjs` | a exceção que esvazia e o gate de leitor |

# 5. Instruções de execução

## 5.1 O registro vivo das pendências

> **Regra de entrada:** só o **revisor** acrescenta linha, entre lotes, quando a `plan-110` (ou outra) achar algo do
> arsenal que o schema/painel oferece e não entrega, ou que o importador precisa e não existe. Cada linha tem
> **decisão** (ligar · retirar · documentar · aceitar) e **lote**. Item sem decisão do dono fica como *candidata*.
> A plan só fecha (🟢) com a tabela sem linha aberta.

| # | Pendência | Origem | Decisão | Lote | Estado |
|---|---|---|---|---|---|
| P1 | `cardActionClickScale` — ligar o escalonamento do botão de ação ao clicar | plan-110 lote 1 | ligar | 1 | fechada |
| P2 | `imageCardHoverZoom` — o zoom da imagem de capa no hover nunca dispara | plan-110 lote 1 | ligar | 1 | fechada |
| P3 | `cardSpotlightOpacity` — o spotlight que segue o cursor não tem regra CSS | plan-110 lote 1 | ligar | 1 | fechada |
| P4 | `borderBeamEnabled` — o traço luminoso na borda do cartão não tem regra CSS | plan-110 lote 1 | ligar | 2 | fechada |
| P5 | `cardSearchBorderBeamActive` — o traço no cartão de busca em foco | plan-110 lote 1 | ligar | 2 | fechada |
| P6 | `cardContentAlignment` — redundante com `cardTextAlign`; ligá-lo regride o layout | plan-110 lote 1 | retirar | 3 | fechada |
| P7 | `tableActionPosition` — a tabela não tem coluna de ações | plan-110 lote 1 | retirar | 3 | fechada |
| P8 | `getCardStyles` morto e `structuralConsumer` de `cardImagePosition`/`cardContentAlignment` o citando; `cardVariant` com `axis: 'texture'` | plan-110 lote 1 (backlog 34) | retirar/corrigir | 3 | fechada |
| P9 | `cardImagePosition` — a opção `top` (o padrão) não tem leitor; o código morto escondia isso (`token-reader:check` vermelho; R40 exige `ALLOWLIST` vazia) | plan-117 lote 3 | retirar | 3 (correção) | fechada |
| P10 | `actionGlowShadowOffsetY`/`Blur`/`Spread` — o único leitor é o `style` inline do botão da categoria selecionada em `SarakCatalogGrid.tsx:110`, com cor a 5% de opacidade; variar os três não muda `box-shadow` computado nem pixel (plan-110 lote 2, medido no navegador) | plan-110 lote 2 | investigar a causa; **ligar** se o efeito for alcançável (a sombra de destaque dos botões de ação desenha de verdade) ou **retirar** os três | 4 | aberta |
| P11 | `colorDepth`/`colorVariation` — moldam `--sarak-primary-color-hover`/`-active` (`useDesignVariables.ts:67-70`), que **nenhum CSS ou componente lê** (`git grep`) | plan-110 lote 2 | **retirar** (regra "muda a tela ou sai"; o hover já tem tokens próprios) — o dono pode preferir **ligar** ao hover/pressionado | 4 | aberta, decisão do dono |
| P12 | `chartType`: `radar` quebra o ECharts (`axisPointer` lê `type` de eixo que não existe) e `heatmap` (`Heatmap on cartesian must have two category axes`) — `advancedCharts.ts:21,107`; opções que o painel oferece e derrubam o gráfico | plan-110 lote 2 | **corrigir** os builders para o dado padrão do gráfico; se uma opção não for viável com dado genérico, retirar a opção (valor salvo cai no padrão, com aviso) | 4 | aberta |
| P13 | `rangeActiveColor` — pinta só o polegar; o trilho ativo usa a constante `ACTIVE` (`SarakRangeSlider.tsx:27`), então "cor ativa" não colore o que o nome promete | plan-110 lote 2 | **ligar** o trilho ativo ao token (e ajustar o `usage`) | 4 | aberta |
| P14 | `motionEaseIn` — a curva de saída das sobreposições tem leitor (`useMotionTokens.ts:48`, `SarakModal`, `SarakSearch`), mas a medição no navegador não viu efeito (plan-110 lote 3) | plan-110 lote 3 | achar a causa (a saída não usa a curva? o `AnimatePresence` a ignora?) e **ligar** de fato, ou **retirar** | 5 | aberta |
| P15 | `matrixGap` — `SarakExpandableMatrix.tsx:125` define `--matrix-gap` a partir do token e **nada lê `--matrix-gap`** (`git grep`) | plan-110 lote 3 | **ligar** o espaçamento entre os itens da matriz ao token, ou **retirar** | 5 | aberta |
| P16 | `contentAlignment` — o estilo em linha de `resolveChromeContentStyle` (`maxWidth`, `marginInline`, `width`, `padding`) vence a classe `max-w-7xl mx-auto w-full px-*` que `chromeStructuralStyles.ts:37` põe no mesmo elemento; o token não muda nada (plan-110 lote 4) | plan-110 lote 4 | **ligar** (a classe e o estilo deixam de disputar o mesmo elemento) ou **retirar** | 5 | aberta |
| P17 | `sidebarCollapsedWidth` — `ChromeSidebarBody.tsx:107` lê o token, mas `min-width: var(--sidebar-min-width, 150px)` (`:111`) vence: o recolhido mede 200 px; o piso do `sidebarMinWidth` (150) é maior que o teto do token (100) | plan-110 lote 4 | **ligar** (o recolhido ignora o piso da largura aberta) ou **retirar** | 5 | aberta |
| P18 | `borderRadius`: `SarakAccordion.tsx` usa `(design?.borderRadius) \|\| 'var(--sarak-card-radius,12px)'`; `0` é falso e o raio fica em 12 px | plan-110 lote 4 | **corrigir** (`??`/checagem de ausência) | 5 | aberta |
| P19 | `switchLabelPosition` não chega a `SarakCheckbox` nem `SarakRadio`, que leem `useStructuralStyles` (`getCheckboxLayoutStyles`, `getRadioLayoutStyles`): nenhuma propriedade mudou nos dois | plan-110 lote 4 | **ligar** nos dois ou **declarar** o alcance só do alternador (renomear o `usage`) | 5 | aberta |
| P20 | `searchPositionTopbar: center` — `mx-auto` (`ChromeTopbarBody.tsx:112`) não se distingue de `left` quando a navegação tem `flex-1` (o caso com itens) | plan-110 lote 4 | **ligar** o centro de fato ou **retirar** a opção | 5 | aberta |
| P21 | aviso de console "Function components cannot be given refs" em todas as variantes da cena estrutural (componente não identificado: `SarakSplitPane`, `SarakCatalogGrid`, `SarakCheckbox`, `SarakRadio` ou outro) | plan-110 lote 4 | **identificar e corrigir** (`forwardRef` ou remover a `ref`) | 5 | aberta |
| C1 | *(candidata)* fontes só pelo Google Fonts: offline cai na fonte de reserva (achado A11 do anexo de direção) | plan-110 lote 0 | embarcar fontes (decisão do dono, 2026-10-15) | plan-118 | fechada |
| C2 | *(candidata)* 7 `tokenId` duplicados e 28 entradas sem leitor nas partições do catálogo (backlog 7) | plan-88 | a triar | — | candidata |
| C3 | *(candidata)* `--sarak-font-size` emitida em runtime e fora de `tokens.cssVars` (backlog 6) | plan-88 | a triar | — | candidata |

## 5.2 Os lotes

**Em todo lote:** cada token é aberto no leitor e **conferido no navegador por diferença de estilo computado**, como
no lote 1 da `plan-110`; o valor devolvido não prova a tela. Cor sempre de token (a primária ou o brilho do cartão),
**nenhum valor fixo** (R43); nenhum `!important` em seletor amplo (R41); a variável emitida tem um dono (R42).
**Movimento reduzido** (`reducedMotion` do token e `prefers-reduced-motion`) zera spotlight animado, zoom, escala e
beam. Nada carrega informação só pelo efeito. Nota na `## 8.0.0`; gerados regenerados (`guide`/`dev-kit` por último).

**Lote 1 — P1, P2, P3 (movimento do cartão).**
1. P1: o botão de ação do `SarakActionCard` encolhe a `cardActionClickScale` no clique/toque (`whileTap`); o
   `whileTap={{ scale: 0.95 }}` fixo da linha 134 passa a ler o mesmo token se for o mesmo elemento, ou fica
   justificado.
2. P2: o zoom vale ao passar o ponteiro sobre **o cartão inteiro** (`whileHover`/variants no pai, não na camada que
   nunca recebe o ponteiro); `imageCardHoverZoom` 1 = sem zoom; o `SarakImageCard` e o que o reutiliza.
3. P3: a regra `.spotlight-effect` desenha o gradiente radial da primária do tema com a opacidade do token (0 =
   nada); o hook compartilhado segue o cursor nos quatro cartões (e a `SarakCoreCard`); **sem custo quando o token é
   0** (o hook não registra listener).
4. `usage`/`kind`/`modeDependent`/`interactsWith` dos três no schema; saem da exceção do gate.

**Lote 2 — P4, P5 (o traço luminoso).**
5. A regra `.border-beam-effect` desenha um anel de gradiente cônico que gira com `--beam-angle` (a animação e o
   `@property` já existem), mascarado para ocupar só a borda; cor da primária do tema; **o raio acompanha o raio do
   cartão** (`--sarak-card-radius`).
6. `borderBeamEnabled` liga em qualquer cartão; `cardSearchBorderBeamActive` desenha só com o campo em foco.
   Desligado, nenhuma animação roda e nenhum nó extra pesa. Custo medido: o executor reporta o impacto de ter
   dezenas de cartões com o beam ligado e registra o aviso no `usage`.
7. Documentar (schema, GUIA); sair da exceção.

**Lote 3 — P6, P7, P8 (retirada) e fechamento da tabela.**
8. Retirar `cardContentAlignment` e `tableActionPosition` do schema, das partições do catálogo, do mapeamento de
   tema, dos tipos gerados e dos tipos extras, **com** a entrada em `REMOVED_TOKEN_KEYS` (o valor salvo cai no
   padrão, com aviso) — pela `ui-refatorar-componente`, mantendo a paridade 1:1:1 verde.
9. Apagar o código morto (P8) e corrigir o `axis` de `cardVariant`.
10. Nota MAJOR (retirada de chave do payload) em `## 8.0.0`; GUIA §6.4 e o mapa do kit atualizados; as sete
    entradas `achado-lote-1` somem da exceção do gate.
11. Conferir as **candidatas** da §5.1: o executor lê C1–C3 e relata o estado atual de cada uma (achado, não
    correção); o revisor decide.

**Lote 4 — P10, P11, P12, P13 (achados da medição do lote 2 da `plan-110`).**
12. Cada token é aberto no leitor e **conferido no navegador por diferença de estilo computado** (par valor padrão ×
    extremo; para os gráficos, `canvas` e erro de console), antes e depois. P10: dizer **por que** o `box-shadow` não muda
    (a ordem do `style`, a cor a 5%, o `SarakButton`) e então ligar ou retirar os três como um bloco. P11: retirar os dois
    tokens (schema, partições, mapeamento, tipos, `REMOVED_TOKEN_KEYS` e a variável derivada que ninguém lê), salvo
    decisão do dono por ligar. P12: cada opção de `chartType` renderiza sem erro de console com o dado padrão
    (`area`, `bar`, `pie`, `scatter`, `gauge`, `radar`, `heatmap`), com um caso de navegador por opção. P13: o trilho
    ativo do `SarakRangeSlider` usa o token.
13. Nenhum `defaultValue` muda por conta própria; nota MAJOR para o que for retirado; metadados do schema e o GUIA
    (§6.4) atualizados; `usage` fiel ao que o código faz.

**Verificação otimizada (decisão do dono, 2026-10-17):** o executor roda só os testes dos arquivos que tocou. O revisor
roda `verify --tier=quick` (`tsc`, baseline, Anel 1, R36), o vitest **só dos arquivos tocados e dos que os importam**
(`vitest related`) e, no navegador, **só as specs da área** (gráfico, faixa, botão, catálogo) contra um `build` — a suíte
inteira e a bateria completa do navegador rodam **uma vez**, no fechamento da plan, junto com o último lote.

**Lotes seguintes:** abertos pelo revisor quando a tabela da §5.1 ganhar linha. Cada novo lote repete o método.

# 6. Critérios de aceite

- [ ] P1–P5: cada token muda o estilo computado no navegador (par valor-padrão × extremo, em repouso, hover, foco e
  pressionado conforme o caso); testes de componente e **caso de navegador** novo com mutação.
- [ ] Movimento reduzido zera os cinco efeitos; token em zero/desligado não registra listener nem anima.
- [ ] P6–P8: os dois tokens fora do schema, das partições, do mapeamento e dos tipos; entrada em
  `REMOVED_TOKEN_KEYS`; tema salvo com a chave não quebra (aviso e padrão); paridade 1:1:1, `token-reader:check` e
  `token-types:check` verdes; código morto removido.
- [ ] `usage` dos cinco ligados no schema; exceção `achado-lote-1` vazia; GUIA §6.4 sem os sete.
- [ ] Nenhum `defaultValue` alterado; nenhum tema alterado; nenhuma cor fixa.
- [ ] Tabela da §5.1 sem linha aberta (candidatas decididas pelo dono ou movidas para o backlog).
- [ ] Suíte completa verde numa passada; `tsc` 0; `audit:baseline` sem regressão; Anel 1; `cromo-css-real:check`;
  catálogo, kit e barril em dia; Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- Cada token ligado: ler o leitor no diff e **medir a diferença de estilo computado** no navegador, fora do resumo;
  mutação (remover a regra/o `whileTap` derruba o teste/caso).
- Retirada: `grep` do id em `src/`, `sarak-ui/`, `docs/` (só `removedTokenKeys` e a nota restam); carregar um
  payload com a chave e ver o aviso.
- `git diff --stat` → só a §3.1 e os gerados. Nenhum `defaultValue`.
- `npm run build` + `npm run cromo-css-real:check` · `npx vitest run` · `npx tsc --noEmit` ·
  `npm run audit:baseline -- --with-tsc` · Anel 1 · Anel 0.

# 8. Destino da síntese

**Destino:** `specs/arquitetura/02-design-engine.md + specs/arquitetura/04-contrato-de-tokens-e-paridade.md + specs/09-temas-e-presets.md`

- **`02` §10:** o que o spotlight, o traço luminoso, o zoom e a escala do clique desenham, e o que cada um lê.
- **`04`:** os dois tokens retirados e a regra "token oferecido muda a tela ou sai" como fato do contrato.
- **`09`:** os efeitos de cartão como alavancas disponíveis a tema.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido nem reescrito. -->

## Resumo da execução (lote 1: P1, P2, P3) — 2026-10-15

**Resultado:** Concluído com pendências (o caso de navegador não foi executado contra o `dist/` — ver Pendências; foi medido contra um build fora do repositório).

**Estado do worktree ao iniciar**
```
 M package-lock.json
 M package.json
 M specs/00-indice.md
 M specs/plan/plan-117-pendencias-do-arsenal.md
 M specs/plan/plan-118-fontes-embarcadas.md
```
(Arquivos da plan-118 e `package*.json` não foram tocados por mim.)

**O que foi feito**
- P3 — `src/components/atomic/Cards/hooks/useSpotlightPointer.ts` (novo): hook compartilhado. Registra `pointermove`/`pointerleave` na raiz do cartão só com `cardSpotlightOpacity > 0`, `reducedMotion !== true` e `(hover: hover) and (pointer: fine)`; grava `--sarak-spot-x/y` no `style` da raiz num `requestAnimationFrame` (um quadro agendado por vez, sem `setState`); `pointerleave` remove as variáveis (volta ao centro); `pointerType: 'touch'` é ignorado. Devolve também `data-spotlight`.
- P3 — ligado em `SarakActionCard`, `SarakSearchCard`, `SarakTitleCard` e `SarakCoreCard` (`ref` + `data-spotlight`).
- P3 — `src/styles/_cards.css`: `.sarak-card { --sarak-spot-x/y: 50% }` (centro, dono declarado) e `.sarak-card[data-spotlight="1"] > .spotlight-effect` com `radial-gradient` de `color-mix(var(--sarak-primary-color, var(--theme-primary)) calc(var(--spotlight-opacity, 0.1) * 100%), transparent)`; reserva 0,1 = `defaultValue`.
- P1 — `src/styles/_cards.css`: `.sarak-card-action-btn:active { transform: none; scale: var(--sarak-card-action-click-scale, 0.96) }`; `SarakActionCard.tsx`: removido o `clickScale` morto (antiga linha 59). O botão de ação é um `SarakButton` (não é `motion`), por isso a regra é CSS; `transform: none` tira o aperto de elemento (`btnActiveScale`) e `scale` vence o `active:scale-[0.98]` do átomo, para a escala do token ser a única em jogo.
- P1 — o `whileTap={{ scale: 0.95 }}` fixo do `SarakActionCard` **não é o mesmo elemento**: é o gatilho do painel expansível (chevron), não o botão de ação. Mantido como estava.
- P2 — `SarakImageCard.tsx`: `variants={{ hover: resolveCardHoverMotion(design) }}` + `whileHover="hover"` na raiz; a camada da imagem tem só `variants={{ hover: { scale: hoverZoom } }}`. Zoom vale 1 com `reducedMotion` do token ou `useReducedMotion()` (preferência do sistema).
- Reduzido: `_cards.css` esconde `.spotlight-effect` e zera `scale` do botão sob `:root[data-sx-reduced-motion="true"]` e `@media (prefers-reduced-motion: reduce)`.
- Documentação: `kind: 'aesthetic'`, `modeDependent` (spotlight `true`; zoom e clique `false`), `usage`, `interactsWith` dos três em `schema/cards.ts` e `schema/card-action.ts`; saída de `achado-lote-1` de `tokenDocumentationPending.json`; `npm run token-types` regenerou `design-token-docs.json`; GUIA §6.4 (três saem da lista; frase dos valores padrão); `docs/migracoes.md` (`## 8.0.0`: nova nota dos três e correção do parágrafo "sete tokens" para quatro); anexo `plan-110-tokens-funcionais.md` §4.1 (desfecho); `npm run guide` e `npm run dev-kit` regenerados.
- `.agents/skills/ui-integra-consumidor/` não cita os três tokens: nada a mudar.
- Provas: cena `cartao-movimento` + recortes `cartao-*` em `browser-tests/fixtures/harness-entry.tsx`; `browser-tests/cartao-que-se-move.spec.ts` (13 casos); testes de componente e do hook.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Cards/hooks/useSpotlightPointer.ts` | criado | hook do spotlight que segue o cursor |
| `src/components/atomic/Cards/hooks/__tests__/useSpotlightPointer.test.tsx` | criado | 8 testes do hook |
| `src/components/atomic/Cards/SarakActionCard.tsx` | alterado | hook, `ref`, `data-spotlight`; `clickScale` morto removido |
| `src/components/atomic/Cards/SarakSearchCard.tsx` · `SarakTitleCard.tsx` | alterado | hook, `ref`, `data-spotlight` |
| `src/components/atomic/Templates/components/SarakCoreCard.tsx` | alterado | idem |
| `src/components/atomic/Templates/SarakImageCard.tsx` | alterado | hover na raiz por variantes; zoom 1 em movimento reduzido |
| `src/styles/_cards.css` | alterado | regras do spotlight, do aperto e do movimento reduzido |
| `src/core/Design/schema/cards.ts` · `card-action.ts` | alterado | documentação dos três tokens |
| `gates/allowlists/tokenDocumentationPending.json` | alterado | −3 entradas `achado-lote-1` |
| `src/core/Provider/generated/design-token-docs.json` | alterado (gerado) | `token-types` |
| `browser-tests/fixtures/harness-entry.tsx` · `browser-tests/cartao-que-se-move.spec.ts` | alterado · criado | cena e caso de navegador |
| `src/components/atomic/Cards/__tests__/SarakActionCard.test.tsx` · `Templates/__tests__/SarakImageCard.test.tsx` | alterado | testes de P1/P3 e P2 |
| `docs/migracoes.md` · `sarak-ui/GUIA-FRONTEND.md` | alterado | notas |
| `sarak-ui/*` (`catalog.json`, `docs/migracoes.md`, `START-HERE.md`, `VERSION`) | alterado (gerado) | `npm run guide` |
| `specs/plan/anexos/plan-110-tokens-funcionais.md` | alterado | §4.1 desfecho (declarado na §3.1) |

**Verificações executadas**
- `npx vitest run` (completa, 1 passada, sem timeout) → 3479/3479 testes, 0 falha, 1394 suítes.
- `npx tsc --noEmit` → 0 erros.
- `npm run audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão" (uma regressão `ghostvars` 0→2 nas variáveis do spotlight apareceu na 1ª tentativa e foi consertada declarando `--sarak-spot-x/y` em CSS).
- Anel 1: `barrel`, `catalog`, `zero-brand`, `deep-import`, `gate-limits`, `container-query`, `container-query-boundary`, `persistence-doc`, `class-merge`, `icon-port`, `chrome-token-parity`, `token-reader`, `css-important`, `fixed-translucent`, `trail-citation`, `token-types`, `variable-contract`, `channel-dispute`, `token-docs` (116/402 documentados), `panel-contract`, `kit-names` → todos OK; `guide:check` e `dev-kit:check` OK depois de regenerar (por último). `plan-index:check` FALHA por divergência da `plan-118` (índice 🟡 × frontmatter 🟠) — não é minha.
- Caso de navegador contra um build **fora do repositório** (esbuild com alias para `src/index.ts` + Tailwind CLI para a pasta temporária do scratchpad; `dist/` intocado): `cartao-que-se-move.spec.ts` → 13/13. Medido: spotlight padrão alfa 0,1 e extremo 1; centro do gradiente 40,30 → 200,60 px nos três cartões; token 0 → `background-image: none` e 0 listeners; padrão → 1 listener por cartão e `--sarak-spot-x` some ao sair; aperto pressionado `scale` 0,96 / 0,8 / 1, em repouso `none`; zoom 1,05 / 1,5 / 1 com o ponteiro no centro do cartão; movimento reduzido (token e `emulateMedia`) zera os três.
- Mutação: sem a regra do spotlight → 3 casos caem; sem a regra do aperto → 2 caem; `whileHover` de volta na camada da imagem → o caso do zoom cai e o teste de componente do zoom cai.
- `coverage:check` iniciado e **não aguardado** (estourou o prazo da chamada); sem resultado.
- Anel 0 simulado sobre as linhas adicionadas e os 3 arquivos novos (padrões de chave/segredo): 0. R36 (`plan-NN`, "veredito", "achado N") em linha adicionada de código: 0.

**Critérios de aceite (lote 1)**
- [x] P1–P3 mudam o estilo computado no navegador (padrão × extremo; repouso, hover, pressionado) — evidência: a medição acima. Falta rodar contra o `dist/` (revisor).
- [x] Movimento reduzido zera os três; token 0 não registra listener — evidência: casos 4, 6, 7, 10, 13 e testes do hook.
- [x] `usage` dos três no schema; saem da exceção — `token-docs:check` OK.
- [x] Nenhum `defaultValue`, tema, token novo ou opção nova alterados.
- [ ] Executar `cartao-que-se-move.spec.ts` contra o `dist/` — motivo: `npm run build` proibido neste lote; fica para o revisor.

**Custo do hook do spotlight**
Dois listeners (`pointermove`, `pointerleave`) por cartão, **somente** quando o token é > 0, o movimento não está reduzido e o ponteiro é fino; token 0 não registra nenhum (medido: `window.__cardPointerListeners === 0`). Cada movimento agenda no máximo um `requestAnimationFrame` e faz uma leitura de `getBoundingClientRect` e duas escritas de variável; nenhum `setState`/re-render. Desmontar remove os listeners.

**Decisões e suposições**
- `kind: 'aesthetic'` para os três; `modeDependent: true` só no spotlight (luz sobre o fundo, como `cardGlowIntensity`).
- `interactsWith`: spotlight→`primaryColor`; zoom→`imageCardOverlayOpacity`; clique→`cardActionBtnPrimaryBg`.
- O aperto é por CSS (`scale`) e não por `whileTap`, porque o botão de ação é o `SarakButton` (DOM `<button>` sem framer); o expansor mantém o `whileTap` fixo (outro elemento).
- Nas outras variantes do `SarakCoreCard` (que delegam para outros cartões) o hook é chamado e não registra nada (sem `ref` ligado).
- O `SarakImageCard` não tem camada de spotlight (fora do que o token declara nos quatro cartões).
- O parágrafo "sete tokens" da nota de migração já existente foi corrigido para quatro (divergência de prosa consertada na hora).

**Achados fora do escopo (não corrigidos)**
- `npm run plan-index:check` falha por `plan-118` (frontmatter 🟠 × índice 🟡): é da outra execução/revisor.
- `src/components/atomic/Cards/hooks/__tests__/useExpandableCard.test.ts` ainda tem `// TODO` pré-existente.

**Pendências / riscos**
- O revisor precisa rodar `npm run build` e `npm run cromo-css-real:check`; só então o caso novo roda contra o `dist/`.
- `coverage:check` concluiu depois do resumo, rodando sob a carga das duas execuções: 1 teste falhou de 3479 (arquivo não identificado: só a cauda da saída foi lida); a suíte completa avulsa, antes, deu 3479/3479. Provável *timeout* de carga; o revisor deve repetir.
- O impacto de dezenas de cartões com o spotlight ligado não foi medido além da contagem de listeners.


## Resumo da execução (correção 1) — 2026-10-15

**Resultado:** Concluído

**Achado 1 — a declaração de `--sarak-spot-x/y` em `_cards.css` casava a expressão do teste de cessão à classe**
- `src/styles/_card-defaults.css`: `--sarak-spot-x: 50%` e `--sarak-spot-y: 50%` declaradas no bloco `.sarak-card` da caixa do cartão (logo após `box-shadow`), com comentário que aponta para a regra do spotlight.
- `src/styles/_cards.css`: removido o bloco `.sarak-card { --sarak-spot-x/y }` que eu havia posto; o comentário do spotlight passou a citar `_card-defaults.css`. Mantidas a regra `.sarak-card[data-spotlight="1"] > .spotlight-effect` e as de movimento reduzido.
- A declaração segue em CSS, então o `ghostvars` continua satisfeito (conferido abaixo).

**Verificações (resultado visto)**
- `npx vitest run src/styles/__tests__/cartaoQueCedeAClasse.test.ts` → 1 arquivo, 22/22 testes, 0 falha.
- `npx vitest run` completa, sozinha, depois do último conserto → 495 arquivos, 1394 suítes, 3479/3479 testes, 0 falha, nenhum *timeout*.
- `npx tsc --noEmit` → 0 erros.
- `npm run audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".
- `npm run guide:check` → kit em dia (7 arquivos); `npm run dev-kit:check` → kit em dia (3 arquivos, 0 ponteiros mortos); `variable-contract` → OK (um dono por variável).
- `npm run build` não foi rodado.

**Arquivos alterados nesta rodada:** `src/styles/_card-defaults.css`, `src/styles/_cards.css` (e este resumo e o `status`). Nada mais foi tocado.

**Pendências:** o caso de navegador novo não foi reexecutado após a mudança de lugar da declaração (nenhum `dist/` meu; o revisor já rodou o build). O efeito esperado é idêntico: a variável continua com 50% por padrão e o cartão a sobrescreve no `style`.


## Resumo da execução (correção 2) — 2026-10-15

**Resultado:** Concluído

**Achado 1 — `browser-tests/cartao-que-se-move.spec.ts`: o cartão se movia enquanto `pointAt` o media**
- Nova `waitUntilStill`: espera a caixa do cartão idêntica por 5 `requestAnimationFrame` seguidos e nenhuma animação do elemento em `running` (prazo de 5 s, falha explícita).
- `pointAt` agora: entra no cartão → espera parar → relê a caixa assentada → posiciona o ponteiro em (dx, dy) contra ela → espera parar de novo → espera o quadro que grava as variáveis. As asserções do caso (centro dentro de 2 px, alfa, `none` com token 0) ficaram como estavam.
- Evidência: 5 execuções isoladas seguidas do arquivo (config com o `global-setup.mjs` real, contra o `dist/` reconstruído pelo revisor) → 13 passed nas cinco (1,0 / 1,4 / 1,7 / 1,2 / 1,2 min).

**Achado 2 — três testes de `DesignEngine` estouravam prazo sob carga**
- `Canvas/__tests__/PreviewCanvas.test.tsx` e `Canvas/components/__tests__/PresetsCatalog.test.tsx`: `waitFor(..., { timeout: 10000 })` no que espera `[aria-busy="true"]` sumir, com comentário do motivo.
- `hooks/__tests__/useDesignDraft.undoIntegration.test.tsx`: o teste do desfazer ganhou `, 30000` (o que espera 1,6 s de salvamento atrasado), com comentário do motivo.
- Nenhuma asserção mudou. Evidência: os 3 arquivos isolados → 3 arquivos, 11/11 testes.

**Verificações (resultado visto)**
- `npx vitest run` completa, sozinha, depois do último conserto → 495 arquivos, 1394 suítes, 3479/3479 testes, 0 falha, nenhum *timeout*.
- `npx tsc --noEmit` → 0 erros.
- `npm run audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".
- `npm run guide:check` → em dia (7 arquivos); `npm run dev-kit:check` → em dia (3 arquivos, 0 ponteiros mortos).
- `npm run build` não foi rodado.

**Escopo:** nenhum `src/` de produto, nem `_card-defaults.css`, nem `_cards.css` foram tocados nesta rodada; só o spec de navegador e os três testes acima.

## Resumo da execução (lote 2: P4, P5) — 2026-10-16

**Resultado:** Concluído com pendências (o caso de navegador foi medido contra um build **fora do repositório**, não contra o `dist/`; `build`, `verify` e o caso contra o `dist/` ficam para o revisor).

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-117-pendencias-do-arsenal.md
 M specs/plan/plan-118-fontes-embarcadas.md
```
(Durante a execução apareceram, vindos da execução paralela da plan-118 e não tocados por mim: `.githooks/pre-commit`, `.github/workflows/gates.yml`, `package.json`, `src/core/Design/schema/typography.ts`, `src/core/Provider/utils/googleFontsUrl*`, `dist/fonts/`, `scripts/embed-fonts.ts`, `scripts/fonts/`, `gates/scripts/contrato/check-fonts*`, e 21 linhas de `docs/migracoes.md` de outra subseção.)

**O que foi feito**
- P4/P5 — `src/styles/_cards.css`: a regra que faltava. `.sarak-card > .border-beam-effect { display: none }`; com `data-border-beam="1"` na raiz, a camada vira um anel: `conic-gradient(from var(--beam-angle), transparent 0–70%, var(--beam-color))`, `padding` = largura da borda (`--beam-width: var(--sarak-card-border-width, 1px)`), máscara de duas camadas (`content-box` × caixa inteira) com `mask-composite: exclude` e `-webkit-mask-composite: xor`, `border-radius: inherit` (acompanha o raio do cartão, canto a canto, inclusive o que uma classe do consumidor troca), cor `var(--sarak-primary-color, var(--theme-primary))`, `animation: beam-rotate calc(var(--duration-slow, 0.6s) * 5) linear infinite` (usa o `@keyframes` e o `@property --beam-angle` que já existiam). `--beam-width` e `--beam-color` declaradas na própria regra (um dono). Nada voltou para a regra-base de `.sarak-card`.
- P5 — `SarakSearchCard.tsx`: `beamOn = borderBeamEnabled === true || (focused && cardSearchBorderBeamActive !== false)`; a raiz escreve `data-border-beam={beamOn ? '1' : '0'}`; a camada `.border-beam-effect` passou a existir sempre (antes saía com o token `false`) e perdeu o `style={{opacity}}` inline. Resultado: o traço do campo de busca só acende com o campo em foco; `borderBeamEnabled` o mantém aceso.
- P4 — `SarakActionCard`, `SarakTitleCard`, `SarakCoreCard` já escreviam `data-border-beam` e a camada; só ganharam o hook abaixo (sem outra mudança).
- Custo — `src/components/atomic/Cards/hooks/usePauseBeamOffscreen.ts` (novo): com o traço aceso, um `IntersectionObserver` marca a raiz com `data-border-beam-paused="1"` fora da tela (atributo gravado direto, sem `setState`); `_cards.css`: `.sarak-card[data-border-beam-paused="1"] > .border-beam-effect { animation-play-state: paused }`. Ligado nos quatro cartões; traço apagado = nenhum observador.
- Movimento reduzido — `_cards.css`: sob `:root[data-sx-reduced-motion="true"]` e `@media (prefers-reduced-motion: reduce)` a camada é `display: none` (junto do spotlight). **Escolha: apagar, não deixar o anel parado** — um arco congelado num ângulo arbitrário não é um estado reconhecível e pareceria defeito; nada depende do efeito (o foco do campo tem o próprio estilo de foco do `SarakInput`).
- Documentação — `schema/cards.ts` (`borderBeamEnabled`) e `schema/card-search.ts` (`cardSearchBorderBeamActive`): `kind: 'aesthetic'`, `modeDependent: false`, `usage` (com o aviso de custo) e `interactsWith`; as duas entradas `achado-lote-1` saíram de `gates/allowlists/tokenDocumentationPending.json` (edição pontual); `npm run token-types` regenerou só `design-token-docs.json`; `sarak-ui/GUIA-FRONTEND.md` §6.4 (texto-fonte; o gerador **não** foi rodado); `docs/migracoes.md` (`## 8.0.0`): nova subseção do traço luminoso (MAJOR: o do campo de busca passa a desenhar por padrão; `borderBeamEnabled` é opt-in) e o parágrafo "quatro tokens" da subseção de documentação corrigido para dois; `specs/plan/anexos/plan-110-tokens-funcionais.md` §4.1 (desfecho dos dois).
- Provas — `browser-tests/cartao-que-se-move.spec.ts` (+11 casos, de 13 para 24) e recortes/cena em `browser-tests/fixtures/harness-entry.tsx` (`cartao-beam`, `cartao-beam-busca-desligado`, `cartao-beam-raio`, `cartao-beam-reduzido`; cena `cartao-beam-grade` com 48 cartões). `waitUntilStill` passou a ignorar a animação `beam-rotate` (ela gira para sempre e não move a caixa; sem isso o cartão "nunca parava").

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_cards.css` | alterado | regra do anel, pausa fora da tela, movimento reduzido |
| `src/components/atomic/Cards/SarakSearchCard.tsx` | alterado | `beamOn`, `data-border-beam` por foco, camada sempre presente, hook de pausa |
| `src/components/atomic/Cards/SarakActionCard.tsx` · `SarakTitleCard.tsx` · `Templates/components/SarakCoreCard.tsx` | alterado | só o hook de pausa (import + 1 linha) |
| `src/components/atomic/Cards/hooks/usePauseBeamOffscreen.ts` | criado | pausa o giro fora da tela |
| `src/components/atomic/Cards/hooks/__tests__/usePauseBeamOffscreen.test.tsx` | criado | 3 testes do hook |
| `src/components/atomic/Cards/__tests__/SarakSearchCard.test.tsx` · `SarakActionCard.test.tsx` | alterado | testes de `data-border-beam` (foco, token falso, opt-in, camada presente) |
| `src/components/atomic/Cards/__tests__/__snapshots__/SarakSearchCard.test.tsx.snap` | alterado | some o `style="opacity: 0.4;"` da camada (o único diff) |
| `src/core/Design/schema/cards.ts` · `card-search.ts` | alterado | documentação dos dois tokens |
| `gates/allowlists/tokenDocumentationPending.json` | alterado | −2 entradas `achado-lote-1` |
| `src/core/Provider/generated/design-token-docs.json` | alterado (gerado) | `token-types` |
| `browser-tests/cartao-que-se-move.spec.ts` · `fixtures/harness-entry.tsx` | alterado | 11 casos novos; recortes e cena |
| `sarak-ui/GUIA-FRONTEND.md` · `docs/migracoes.md` · `specs/plan/anexos/plan-110-tokens-funcionais.md` | alterado | notas |

**Verificações executadas** (só o que eu escrevi ou toquei; sem `build`, sem `guide`/`dev-kit`, sem suíte completa)
- `npx vitest run src/components/atomic/Cards src/components/atomic/Templates/components src/styles/__tests__/cartaoQueCedeAClasse.test.ts` → 26 arquivos, 120/120 testes, 0 falha (inclui `cartaoQueCedeAClasse`, que cobra a base do cartão fora de `_cards.css`). Antes disso, uma rodada mais larga (`Cards`, `Templates`, `styles`: 74 arquivos) acusou 1 snapshot (o `style` removido, atualizado só neste arquivo e conferido no diff) e 2 testes do hook por eu ter mockado o `IntersectionObserver` sem classe; corrigidos e repetidos.
- Navegador, contra um build **fora do repositório** (esbuild com alias para `src/index.ts` + Tailwind CLI, em pasta do scratchpad; `dist/` intocado; config do Playwright minimal apontando para o spec real) → `cartao-que-se-move.spec.ts` **24/24** (13 do lote 1 + 11 novos). Medido: desligado = `display: none` e 0 `beam-rotate` rodando nos três cartões; ligado = `display: block`, `background-image` com `conic-gradient` contendo a cor computada de `--sarak-primary-color`, `mask-composite: exclude, exclude`, `padding-top` = largura da borda do cartão, `border-top-left-radius` = o do cartão (e 30 px = 30 px quando o tema troca o raio), `animation-name: beam-rotate`, `infinite`, e `--beam-angle` diferente 400 ms depois; busca com padrão `true`: `none` em repouso, `block` com o campo em foco (1 animação), `none` de novo ao sair; token `false`: nunca; `borderBeamEnabled` liga a busca sem foco; movimento reduzido (token e `emulateMedia`) = `none` e 0 animações, mesmo com o campo em foco.
- Mutação: trocar o seletor `[data-border-beam="1"]` da regra do anel por `"9"` e reconstruir o CSS → **6 dos 10** casos de traço caem (anel dos três cartões, raio, padrão da busca em foco, `borderBeamEnabled` na busca); os 4 que passam são os de "desligado/nenhum" (esperado: sem a regra, nada aparece). `_cards.css` restaurado idêntico (diffstat conferido).
- Inspeção da imagem (`screenshot` da grade com o traço): o anel aparece só na borda, com os cantos arredondados do cartão, miolo vazio — o que o teste não prova por pixel (declarado nos limites do spec).
- `npm run token-types` → 402 tokens; `token-types:check` OK; `token-docs:check` → 118 de 402 documentados (eram 116), 284 em exceção; `token-reader:check`, `css-important:check`, `variable-contract:check`, `fixed-translucent:check`, `barrel:check` → todos OK.
- `npx tsc --noEmit -p .` filtrado por `Cards/`, `usePauseBeam`, `SarakCoreCard` → 0 linhas (não li o total do projeto: não é meu).
- Anel 0 / R36: não rodados por mim (do revisor).

**Custo medido** (cena `cartao-beam-grade`, 48 `SarakTitleCard`, 42 deles visíveis na janela 1280×900; Chromium headless **sem GPU**, que é pessimista; quadros de `requestAnimationFrame` em 3 s e CDP `Performance.getMetrics`)
| Situação | animações `beam-rotate` correndo | quadros em 3 s | estilo recalculado |
|---|---|---|---|
| traço desligado (padrão) | 0 | 182 (~61/s) | 0 |
| ligado, 48 cartões | 48 | 32 (~11/s) | 0,059 s/s |
| ligado, 48 cartões, **depois da pausa fora da tela** | 42 | 33 | 0,065 s/s |
- Onde está o custo: tirar o `backdrop-filter` do cartão (padrão `cardBackdropBlur` 12) leva ligado de 32 para 140 quadros — o giro repinta o cartão e o desfoque do fundo é refeito a cada quadro; tirar a máscara quase não muda (52). `will-change: transform` no anel rendeu só 54 quadros (não adotado).
- Fora da tela: com 480 cartões clonados no DOM o recálculo de estilo subiu para 0,45 s/s (as animações fora da janela custam estilo mesmo sem pintar), o que justifica a **pausa por `IntersectionObserver`**; o caso de navegador novo prova que, com 48 cartões numa grade mais alta que a janela, só os visíveis giram (`running + paused = 48`, `paused > 0`) e que rolar troca quais. (A medição de 480 não vale como número do hook: os clones não têm efeito React; o número só mostra o custo sem pausa.)
- **Escolha dita:** pausar fora da viewport (feito) e **não** limitar a hover/foco, porque o token promete um traço contínuo; o custo **dentro** da janela continua e está registrado no `usage` dos dois tokens e na nota de migração ("use em poucos cartões de destaque"). O padrão de `borderBeamEnabled` é `false`, então só quem opta paga.

**Critérios de aceite (lote 2)**
- [x] P4/P5 mudam o estilo computado no navegador (ligado × desligado; repouso e foco), com caso novo e mutação — evidência: os 11 casos e a mutação acima. Falta rodar contra o `dist/` (revisor).
- [x] Movimento reduzido apaga o traço; token desligado não anima nem registra observador — evidência: casos de movimento reduzido e `usePauseBeamOffscreen.test.tsx` ("traço apagado: não observa nada").
- [x] `usage`/`kind`/`modeDependent`/`interactsWith` dos dois; saem da exceção — `token-docs:check` OK (118).
- [x] Nenhum `defaultValue`, tema, token novo ou opção nova alterados — `git diff` de `schema/` mostra só os campos de documentação.
- [x] Cor de token, sem `!important` novo, uma variável um dono, base do cartão fora de `_cards.css` — `fixed-translucent`, `css-important`, `variable-contract` e `cartaoQueCedeAClasse` verdes.
- [ ] Executar o caso novo contra o `dist/` e a verificação completa — motivo: `npm run build` e `npm run verify` não são meus; o `dist/` atual é anterior ao meu CSS.

**Decisões e suposições**
- Movimento reduzido **apaga** o anel (ver acima), em vez de deixá-lo estático.
- A camada `.border-beam-effect` do `SarakSearchCard` passa a existir sempre (antes só com o token `!== false`), porque `borderBeamEnabled` precisa acendê-la mesmo com `cardSearchBorderBeamActive: false`; "nenhum nó extra" vale para o que o CSS desenha (`display: none` = sem animação, sem pintura), não para o `<div>` vazio, que os outros três cartões já tinham.
- O foco que acende o traço é o estado `focused` que o componente já tinha (`onFocus`/`onBlur` do campo), não `:focus-within` — assim vale também para o teste de componente em jsdom.
- `modeDependent: false` nos dois (são booleanos; a cor vem da primária, que já tem a própria contraparte). `interactsWith`: `primaryColor`, `cardBorderRadius`, `cardBorderWidth` (o anel segue cor, raio e largura) e, na busca, `borderBeamEnabled`.
- `mask: linear-gradient(black 0 0)` — a máscara só usa alfa; `fixed-translucent:check` não acusou.
- O hook de pausa não foi pedido literalmente: a instrução o autoriza ("prefira pausar fora da viewport ... e diga a escolha") e a medição o justifica.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. (`useExpandableCard.test.ts` com `// TODO` pré-existente, já anotado no lote 1.)

**Pendências / riscos**
- O revisor precisa de `npm run build` e do caso contra o `dist/`; o CSS do `dist/` atual não tem a regra.
- O custo dentro da janela existe (ver tabela): numa grade inteira com `borderBeamEnabled` e cartões com desfoque de fundo o giro derruba a taxa de quadros; está avisado no `usage` e na nota de migração, mas não foi mitigado por limite de hover/foco (decisão acima).
- `npm run guide` e `npm run dev-kit` não foram rodados (instrução): `sarak-ui/catalog.json` e o `GUIA` gerado só refletem o `usage` novo depois que o revisor regenerar; `guide:check` pode acusar divergência até lá (o `GUIA-FRONTEND.md` foi editado à mão apenas no §6.4).
- Não conferido por pixel no spec: o miolo do cartão vazio (inspeção visual da captura, manual).

## Resumo da execução (lote 3: P6, P7, P8) — 2026-10-16

**Resultado:** Concluído com pendências (o `token-reader` acusa uma opção sem leitor que o código morto mascarava — ver Pendências; precisa de decisão).

**Estado do worktree ao iniciar**
```
(limpo)
```
(O `status` da plan estava `🔴 A executar` ao chegar, não `🟡`; segui o despacho do prompt. Durante a execução apareceram, da `plan-118` em paralelo e não tocados por mim: `browser-tests/fixtures/harness-entry.tsx`, `browser-tests/fontes-embarcadas.spec.ts`, `gates/scripts/contrato/check-fonts*.ts`, `package.json`, `scripts/__tests__/generate-font-manifest.test.ts`, `scripts/fonts/runtimeManifest.ts`, `scripts/generate-font-manifest.ts`, `src/core/Provider/{SarakUIProvider.tsx,providerProps.ts,types.ts,fontLoader.ts}`, `src/core/Provider/__tests__/{EmbeddedMode,SarakUIProvider,fontLoader}.test.tsx`, `src/core/Provider/hooks/{useSarakUIEffects.ts,useSarakFonts.ts}` e o teste dele, `src/core/Provider/generated/font-manifest.ts`, `src/core/Provider/utils/fontSelection.ts`.)

**O que foi feito**
- P6/P7 (pela `ui-refatorar-componente`) — `cardContentAlignment` saiu de `src/core/Design/schema/cards.ts`, de `catalog/partitions/cards_engine.json` e de `theme_table_mapping.json`; `tableActionPosition` saiu de `schema/tables.ts`, de `partitions/components_base.json` e de `theme_table_mapping.json`. Nenhum tema/preset os carregava; nenhum CSS lia `--sarak-card-content-alignment`. `types.ts`/`payloadExtraKeys.ts` não citavam os ids: não foram tocados.
- `npm run token-types` → 400 tokens (eram 402): regenerou `design-token-ids.ts` e `design-token-docs.json`.
- `src/core/Provider/utils/removedTokenKeys.ts`: os dois ids entram em `REMOVED_TOKEN_KEYS`, com o motivo em comentário.
- `gates/allowlists/tokenDocumentationPending.json`: −2 entradas; **a exceção `achado-lote-1` ficou vazia** (0 ocorrências).
- P8 — `useStructuralStyles.ts`: apagados `getCardStyles` (e o bloco "EIXO 3") e a chave no retorno; confirmado antes que nenhum arquivo chamava `getCardStyles` (grep em `src/`, `gates/`, `scripts/`: só a definição, o retorno e o `structuralConsumer`/`consumerHook`). `schema/cards.ts` e `cards_engine.json`: `cardImagePosition` fica com o leitor `useCardLayoutStyles` só. `useTableLayoutStyles.ts`: apagados `actionColumnAlignmentClass` (interface e retorno), `actionAlignmentMap` e a leitura de `tableActionPosition` (inclusive da lista de dependências do `useMemo`); o único consumidor (`useSarakTableViewModel.ts:36`) só usa `cellDensityClass`.
- P8 — `cardVariant`: **`axis` retirado** (não trocado). O `axis` de `types.ts:48-53` é "eixo visual, usado para medir a completude de um tema", e diz que "tokens estruturais/não-visuais (ex: `mode`, `navigationStyle`) podem não ter eixo"; `navigationStyle` (a "estrutura" de navegação) não tem. `cardVariant` é `kind: 'functional'`, escolha de componente que o tema não declara: nenhum dos seis eixos (`color`, `geometry`, `elevation`, `texture`, `density`, `motion`) o descreve. Nenhum código lê o `axis` do token (os eixos de `themeAxes.ts` são um mapa próprio), então a retirada não muda comportamento.
- Testes dos trechos mortos: nenhum teste exercitava `getCardStyles` nem `actionColumnAlignmentClass` (o `useTableLayoutStyles.test.ts` só confere que o módulo existe); nada a remover, nenhum `skip`.
- Teste novo `src/core/Provider/utils/__tests__/removedTokenKeys.test.ts` (2 casos, módulo novo a cada caso por causa do aviso único por sessão): `validateDesign` com `cardContentAlignment`/`tableActionPosition` descarta a chave, avisa uma vez com o nome entre aspas e "removido do schema", mantém o token vizinho (`cardTextAlign`/`tableDensity`), e a mescla com `sarakGetDefaultDesignState()` não traz a chave (cai no padrão).
- Documentação: `docs/migracoes.md` `## 8.0.0` — subseção nova MAJOR *"`cardContentAlignment` e `tableActionPosition` saem do schema"* (antes/depois, o que fazer) e o parágrafo da subseção de documentação que dizia "continuam no schema" passou a apontar para ela; `sarak-ui/GUIA-FRONTEND.md` §6.4 (texto-fonte): lista de "não mudam a tela" → "Nenhum.", parágrafo reescrito sem citar os ids; `specs/plan/anexos/plan-110-tokens-funcionais.md` §4.1: desfecho dos dois e a exceção vazia; `.agents/skills/ui-integra-consumidor/SKILL.md:419-421`: a frase "Sete tokens do schema não mudam a tela hoje" estava falsa e passou a apontar os efeitos que desenham (`.claude/skills` é o mesmo arquivo, symlink).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/cards.ts` | alterado | −`cardContentAlignment`; `cardImagePosition` sem `getCardStyles`; `cardVariant` sem `axis` |
| `src/core/Design/schema/tables.ts` | alterado | −`tableActionPosition` |
| `src/core/Design/catalog/partitions/cards_engine.json` · `components_base.json` | alterado | −1 entrada cada; `consumerHook` de `cardImagePosition` |
| `src/core/Design/catalog/theme_table_mapping.json` | alterado | −2 ids |
| `src/core/Provider/generated/design-token-ids.ts` · `design-token-docs.json` | alterado (gerado) | `token-types` |
| `src/core/Provider/utils/removedTokenKeys.ts` | alterado | +2 ids |
| `src/core/Provider/utils/__tests__/removedTokenKeys.test.ts` | criado | 2 casos |
| `src/components/atomic/hooks/useStructuralStyles.ts` | alterado | −`getCardStyles` |
| `src/components/atomic/Tables/hooks/useTableLayoutStyles.ts` | alterado | −`actionColumnAlignmentClass` e o que só ele usava |
| `gates/allowlists/tokenDocumentationPending.json` | alterado | −2 entradas (exceção vazia) |
| `docs/migracoes.md` · `sarak-ui/GUIA-FRONTEND.md` · `specs/plan/anexos/plan-110-tokens-funcionais.md` · `.agents/skills/ui-integra-consumidor/SKILL.md` | alterado | notas |

**Verificações executadas**
- `npx vitest run src/core/Provider/utils/__tests__/removedTokenKeys.test.ts` → 2/2 (a 1ª tentativa morreu com `Timeout waiting for worker to respond` sob carga, sem rodar teste; repetida, passou). **Mutação:** tirar `tableActionPosition` do `Set` → o caso dele cai (1 falha, 1 passa); restaurado (diff conferido).
- `npx vitest run src/core/Design src/core/Provider src/components/atomic gates/scripts/audit gates/scripts/contrato scripts` (45 min, sob a carga da execução paralela) → **343 arquivos, 2399 testes: 2396 passaram, 3 falharam**:
  1. `gates/scripts/contrato/__tests__/check-token-reader.test.mjs:614` — **meu**: `open` = `[{ kind: 'option', tokenId: 'cardImagePosition', value: 'top' }]` (ver Pendências).
  2. `src/core/Provider/__tests__/SarakUIProvider.test.tsx:131` — padrão `bundled` de fontes: `expected 0 to be greater than 0`. Arquivo e código (`SarakUIProvider.tsx`, `fontLoader.ts`) da `plan-118` em execução; não tocados por mim.
  3. `src/core/Provider/hooks/__tests__/useSarakUIEffects.test.ts:42` — `document.title`: `'Título do Host'` ≠ `'Sistema do Cliente'`. Arquivo e hook modificados pela `plan-118`; não tocados por mim.
- `grep` dos dois ids em `src/`, `docs/`, `sarak-ui/`, `.agents/`: sobram `removedTokenKeys.ts` (+ o teste dele), `docs/migracoes.md` e, gerados (o revisor regenera), `sarak-ui/catalog.json` e `sarak-ui/docs/migracoes.md`. `sarak-ui/GUIA-FRONTEND.md` não os cita mais. `getCardStyles`/`actionColumnAlignmentClass` em `src/`: 0.
- Não rodei: `guide`, `dev-kit`, `build`, suíte completa, `tsc`, baseline, Anel 0/1, navegador.

**Critérios de aceite (lote 3)**
- [x] Os dois tokens fora do schema, das partições, do mapeamento e dos tipos — `design-token-ids.ts` com 400; grep acima.
- [x] Entrada em `REMOVED_TOKEN_KEYS`; tema salvo com a chave não quebra (aviso e padrão) — `removedTokenKeys.test.ts` 2/2, com mutação.
- [x] Código morto removido; `cardVariant` sem `axis 'texture'` — diff de `useStructuralStyles.ts`, `useTableLayoutStyles.ts`, `cards.ts`.
- [x] Exceção `achado-lote-1` vazia; GUIA §6.4 sem os sete — `tokenDocumentationPending.json`, GUIA.
- [x] Nenhum `defaultValue`, tema, token novo ou opção nova.
- [ ] `token-reader:check` verde — motivo: o achado de `cardImagePosition: 'top'` (Pendências), que pede decisão.
- [ ] Tabela da §5.1 sem linha aberta — C1–C3 relatadas abaixo; decisão do dono/revisor.

**Candidatas C1–C3 (achado, não correção — estado em 2026-10-16)**
- **C1 — fontes só pelo Google Fonts.** Em tratamento pela `plan-118` (lotes 1, 1b e 2 aprovados; lote 3 em execução agora): `dist/fonts/` existe com 62 arquivos (woff2 + `THIRD-PARTY-FONTS`), e há carregador em curso (`src/core/Provider/fontLoader.ts`, `hooks/useSarakFonts.ts`, `utils/fontSelection.ts`, não rastreados). `src/core/Provider/utils/googleFontsUrl.ts:52` ainda monta `https://fonts.googleapis.com/css2?…`. O teste do padrão `bundled` (`SarakUIProvider.test.tsx:131`) falhava no momento da minha bateria. Sugestão: a C1 se fecha com a `plan-118`.
- **C2 — catálogo.** Medido nas 6 partições: **400 entradas, 400 `tokenId` únicos, 0 duplicados** (nenhum `name` com "Duplicado"; os 7 duplicados do backlog 7 já não existem — o commit `e9dd00a5` trouxe o teste de unicidade); toda entrada tem token no schema (0 fora dos tipos). **26 entradas sem `name` nem `tags`** (eram 28), todas em `components_base.json` — de `tableZebraStriping` (`:1489`) a `rangeActiveColor` (`:1860`): `tableZebraStriping`, `tableBorderRadius`, `inputPadding`, `inputBorderType`, `inputBackdropBlur`, `inputShadow`, `inputIconColor`, `inputErrorColor`, `iconButtonGlowBlurSm/Md/Lg`, `iconButtonFrostedShadowOffsetY`, `iconButtonFrostedShadowBlur`, `actionGlowShadowOffsetY/Blur/Spread`, `kanbanHeaderPaddingY`, `kanbanHeaderTracking`, `kanbanCardRadius`, `toastMinWidth`, `toastMaxWidth`, `toastAccentWidth`, `contextMenuMinWidth`, `multiSelectInputMinWidth`, `searchBackdropBlur`, `rangeActiveColor`. (A plan diz "sem leitor"; o backlog 7 diz "sem `name` nem `tags`" — medi o do backlog.)
- **C3 — `--sarak-font-size`.** A emissão em CSS do backlog 6 (`_typography.css:14-18`, `[data-font-scale]`) **não existe mais** (0 ocorrências em `src/**/*.css`; `data-font-scale` 0 fora de testes). O nome sobrevive só em `src/core/Provider/manifest.ts:153` (`fontScale.vars`, junto de `--sarak-font-scale`, `--font-size-factor`, `--theme-font-size-base`); o manifesto é importado só por `validation.ts:36` (chaves aceitas) e exportado no barril (`SARAK_DESIGN_MANIFEST`), não é emissor. `fontScale` não é token do schema (está em `payloadExtraKeys.ts:20`) e `overlayPreferences.ts:7-10` o chama de "legado e não emite nada". Nenhum leitor de `--sarak-font-size` em `src/` (CSS/TS), 0 ocorrências em `sarak-ui/catalog.json`. Dos seis nomes do backlog 6: `--sarak-palette` saiu do manifesto; `--sarak-error-color`, `--sarak-success-color`, `--sarak-warning-color`, `--sarak-font-scale` seguem no manifesto sem leitor CSS em `src/styles`/`src/components`; `--sarak-card-border` tem 18 arquivos leitores. Ou seja: hoje a C3 é "nome anunciado no manifesto público sem emissor", não "emitida fora de `tokens.cssVars`".

**Decisões e suposições**
- `cardVariant` sem `axis` (justificativa acima), em vez de `geometry`.
- Atualizei a frase da skill `ui-integra-consumidor` (§3.1 da plan a inclui em "Documentar"); estava falsa ("sete tokens").
- Não declarei o achado do `token-reader` na `ALLOWLIST`: seria silenciar um gate por conta própria.

**Achados fora do escopo (não corrigidos)**
- `useCardLayoutStyles.ts:28` — o padrão interno de `cardImagePosition` é `'none'`, o do schema é `'top'`; e `left` só "tem leitor" para o gate porque o literal `'left'` aparece na tabela de `cardTextAlign` (`alignStrats`, `:14`), coincidência textual (limite 2 do gate).

**Pendências / riscos**
- **`token-reader:check` vermelho por `cardImagePosition: 'top'`.** O único "leitor" da opção `top` (o padrão do token) era o `getCardStyles` morto; sem ele o gate vê a verdade que o anexo já registrava ("`left`, `top` e `none` não mudam nada"). Opções: (a) entrada na `ALLOWLIST` de `check-token-reader.mjs` com o motivo (parcialidade já documentada no `usage`) e uma linha nova na §5.1 para decidir o token; (b) retirar as opções sem efeito — mexe no `defaultValue` (`top`), fora desta plan; (c) fazer `top`/`left` desenharem — funcionalidade nova, fora desta plan. **Recomendo (a)**, com a decisão de fundo para o dono.
- As 2 falhas de Provider são da `plan-118` em voo; a verificação conjunta do revisor dirá se persistem.
- `sarak-ui/catalog.json`, `sarak-ui/docs/migracoes.md` e o apêndice do GUIA ainda trazem os ids até o revisor rodar `guide`/`dev-kit`.

## Resumo da execução (correção 1) — 2026-10-16

**Resultado:** Concluído

**Estado do worktree ao iniciar:** os arquivos do lote 3 (meus) mais os da `plan-118` e do revisor: `dist/` reconstruído (chunks trocados), `sarak-ui/*` e `sarak-dev/*` regenerados, `specs/00-{backlog,indice,prompt-executor}.md`, `scripts/verify-changes*.mjs`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` e os de fontes já listados no resumo do lote 3. Nada disso foi tocado por mim nesta rodada, exceto `sarak-ui/GUIA-FRONTEND.md` (texto-fonte, por substituição exata).

**Achado 1 (P9) — `cardImagePosition` retirado** (pela `ui-refatorar-componente`)
- `src/core/Design/schema/cards.ts`: o token saiu; `cardLayoutDirection` perdeu o `interactsWith: ['cardImagePosition']` (o campo é opcional; não pus outro id no lugar).
- `catalog/partitions/cards_engine.json`: −a entrada; `relatedTokens` de `cardLayoutDirection` sem o id. `theme_table_mapping.json`: −o id.
- `npm run token-types` → **399 tokens** (eram 400).
- `src/core/Provider/utils/removedTokenKeys.ts`: + `'cardImagePosition'`, com o motivo. `__tests__/removedTokenKeys.test.ts`: + o caso (`right` salvo com `cardLayoutDirection: 'row'` → chave descartada, aviso que a nomeia, `cardLayoutDirection` mantido, padrão sem a chave).
- `src/components/atomic/Cards/hooks/useCardLayoutStyles.ts`: sai a leitura de `cardImagePosition` e o ramo `flex-row-reverse`; `containerClass = direction === 'row' ? 'flex flex-row' : 'flex flex-col'` (const, sem o `.trim()` que já não tinha o que aparar); dependências do `useMemo` sem o id; JSDoc sem "Posição de Imagem". `__tests__/useCardLayoutStyles.test.ts`: o caso do `row-reverse` saiu; o caso de `row` passou a afirmar `containerClass` exato (`'flex flex-row'`).
- Nenhum tema/preset declarava o id (`grep` em `src/core/Design/presets`: 0). Nenhuma opção nova; `check-token-reader.mjs` e a `ALLOWLIST` intocados.
- `docs/migracoes.md`: a subseção do lote 3 virou *"`cardContentAlignment`, `tableActionPosition` e `cardImagePosition` saem do schema"* (o ponteiro na subseção de documentação acompanha): 402 → 399, linha de antes/depois de `right` em linha (`flex-row-reverse` → `flex-row`), e o que fazer: `className="flex-row-reverse"` no cartão. **Medido** antes de escrever (`compile` do `tailwindcss` 4.2.2 instalado): `.flex-row-reverse` é emitida depois de `.flex-row`, então vence na concatenação do `className` com o `containerClass` na raiz.
- `sarak-ui/GUIA-FRONTEND.md` (texto-fonte, antes do apêndice): o item dos tokens de direção perdeu `cardImagePosition` e ganhou a dica do `className`; §6.4 cobre "os que não mudavam (ou só mudavam com um valor)". As 3 citações restantes estão no apêndice gerado (linhas 861, 896, 899).
- `specs/plan/anexos/plan-110-tokens-funcionais.md` §4.1: desfecho de `cardImagePosition`.

**Achado 2 — snapshots**
- `PreviewCanvas.test.tsx.snap`: 22 linhas saem, 16 entram. Conferido por script sobre o `git diff -U0`: 6 das removidas são os atributos `data-sx-card-content-alignment` / `data-sx-table-action-position` / `data-sx-card-image-position`; nas outras 16, apagar `--sarak-card-content-alignment`, `--sarak-table-action-position` e `--sarak-card-image-position` da linha antiga dá exatamente a nova (**0 diferenças além disso**).
- `PresetCard.test.tsx.snap`: 1 linha ↔ 1 linha; as mesmas três variáveis e mais nada (0 diferenças).
- Nenhum outro `.snap` mudou (`git diff --stat -- '*.snap'`: só esses dois).

**Verificações executadas**
- `npx vitest run` dos 3 arquivos tocados (`removedTokenKeys`, `useCardLayoutStyles`, `check-token-reader.test.mjs`) → 3 arquivos, 52/52.
- `node gates/scripts/contrato/check-token-reader.mjs` → `[OK] Todo valor emitido tem leitor.` (ALLOWLIST vazia).
- `npx vitest run -u …PreviewCanvas.test.tsx` → 4/4, 1 snapshot atualizado.
- `npx vitest run -u …PresetCard.test.tsx` → por algum motivo **rodou a suíte inteira** (502 arquivos), não só o arquivo: 3535/3536, 1 snapshot atualizado (o do `PresetCard`); a falha é `check-public-types-parity.test.mjs` (abaixo). Registro porque não era o pedido; o `-u` só reescreveu esse snapshot.
- `npm run verify -- --tier=quick` → `tsc` OK, `audit:baseline --with-tsc` OK, Anel 1 OK (inclusive `token-reader`, `token-types`, `token-docs`, `catalog`, `barrel`, `variable-contract`), Anel 0 simulado 0 achados; **3 FAIL que não são desta correção**: `plan-index:check` (`plan-118`: índice 🔵 × frontmatter 🟠), `guide:check` (5 arquivos de `sarak-ui/` defasados) e `dev-kit:check` (3 de `sarak-dev/`) — regeneração do revisor.
- `npx vitest run src/core/Design src/core/Provider src/components/atomic src/features/DesignEngine gates/scripts/audit gates/scripts/contrato scripts` → **432 arquivos, 2862 testes: 2861 passaram, 1 falhou** — `check-public-types-parity.test.mjs:127`: `SarakFontSource`, `SarakFontsOption`, `SarakFontsOptions` declarados no `dist/index.d.ts` sem export (tipos da `plan-118`, cuja correção mexe em `src/index.ts`).
- Não rodei: `guide`, `dev-kit`, `build`, navegador.

**Critérios**
- [x] `cardImagePosition` fora do schema, das partições, do mapeamento e dos tipos — 399 tokens; `grep` em `src/`, `docs/`, `sarak-ui/`, `.agents/`: sobram `removedTokenKeys.ts` (+ teste), `docs/migracoes.md` e os gerados (`sarak-ui/catalog.json`, apêndice do GUIA).
- [x] `REMOVED_TOKEN_KEYS` + teste — 3/3 casos.
- [x] `token-reader:check` e `check-token-reader.test.mjs` verdes com a `ALLOWLIST` vazia.
- [x] Snapshots atualizados com só as três variáveis.
- [x] Nenhum `defaultValue`, tema, token ou opção novos.

**Decisões e suposições**
- `interactsWith` de `cardLayoutDirection` removido em vez de apontado para outro token: nenhum outro token muda o efeito da direção.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-15 — lote 1 — 🔴 Reprovado (1 achado)

**Conferido no worktree:** `npm run build` OK e **`cromo-css-real:check` 337/337**, com os 13 casos de
`cartao-que-se-move.spec.ts` contra o `dist/` (o que o executor não podia rodar); `tsc` 0; `audit:baseline --with-tsc`
igual ao baseline; `token-docs` (116 documentados, 286 em exceção), `token-types`, `guide`, `dev-kit`, `catalog`,
`barrel`, `css-important`, `fixed-translucent`, `token-reader`, `variable-contract`, `kit-names` e R36 verdes. O código
é o desenho pedido: hook `useSpotlightPointer` (listeners só com token > 0, sem movimento reduzido e ponteiro fino;
`rAF`, sem `setState`), zoom no pai por variantes, aperto por CSS (`scale`) no botão de ação, movimento reduzido zerando
os três, nenhum `defaultValue` tocado.

**Achado:**

1. **`src/styles/_cards.css` — a regra `.sarak-card { --sarak-spot-x: 50%; --sarak-spot-y: 50%; }` volta a pôr uma
   regra-base de `.sarak-card` em `_cards.css`**, e a suíte completa **falha** em
   `src/styles/__tests__/cartaoQueCedeAClasse.test.ts` — *"`_cards.css` não tem mais a regra-base do cartão"*
   (`expect(cards).not.toMatch(/^\.sarak-card(?:,\s*\.[\w-]+)*\s*\{/m)`). A base do cartão mora na camada de baixo
   (`_card-defaults.css`) para a classe do consumidor vencer sem `!important` (`02` §9.1, R41). O resumo afirma
   3479/3479 verdes; o teste falha deterministicamente (reproduzido isolado). Critério violado: a trava de cascata
   (R41) e "suíte completa verde numa passada".
   **Correção:** declarar `--sarak-spot-x`/`--sarak-spot-y` (o centro, `50%`) no bloco `.sarak-card` de
   `_card-defaults.css`, onde já vivem as variáveis do cartão, e tirar o bloco de `_cards.css`; manter
   `.sarak-card[data-spotlight="1"] > .spotlight-effect` e as regras de movimento reduzido onde estão (não casam a
   expressão). O `ghostvars` continua satisfeito (a declaração segue em CSS). Repetir a suíte completa e declarar o
   resultado como visto.

Segundo ponto de atenção (não reprova): `useDesignDraft.undoIntegration.test.tsx` e `coverage:check` foram vistos com
*timeout* sob carga; isolado, o primeiro passa (23/23 do par de arquivos). Nada a corrigir.

**Status: 🔵 Em correção.** O resto da entrega está aprovado como está.

## Veredito — 2026-10-15 — correção 1 — 🔴 Reprovado (2 achados, ambos de robustez)

**Conferido no worktree, depois da correção:** o conserto pedido está certo — `--sarak-spot-x/y` em `_card-defaults.css`,
bloco removido de `_cards.css`, `cartaoQueCedeAClasse.test.ts` verde. Reconstruí (`npm run build` OK) e rodei no
navegador `cartao-que-se-move`, `tema-sob-demanda`, `cartao-cede-a-classe` e `cascata-que-cede`: **40 passaram e 2
falharam**; `tsc` 0, baseline igual; suíte completa **495 arquivos, 3477/3479, 2 falhas**.

**Achados:**

1. **`browser-tests/cartao-que-se-move.spec.ts:120-123` — o caso do spotlight é intermitente.** Falhou 2 de 2 casos
   (`cartao-titulo`, `cartao-busca`) na bateria e 1 de 3 execuções isoladas seguintes, com o centro do gradiente 2,7 e
   4,8 px fora do esperado em Y (`Expected: < 2`). Causa: `pointAt` lê a caixa do cartão **antes** de o ponteiro
   pousar, mas o cartão tem `whileHover` (`resolveCardHoverMotion`, o *lift*) e a entrada `initial`/`animate`: ao ser
   medido, o cartão ainda se move, e `SETTLE_MS` é curto para a animação terminar. É a classe de defeito do item 15 do
   backlog. **Correção:** esperar o cartão **parar** antes de medir (caixa estável em dois quadros seguidos, ou as
   animações do elemento terminadas) e medir a posição esperada **contra a caixa lida depois do hover**, não antes;
   o caso tem de passar 5 execuções seguidas.
2. **Dois testes da suíte completa estouram tempo sob carga e sujam "verde numa passada"** (passam isolados, 6/6):
   `PreviewCanvas.test.tsx` — o `waitFor` que espera os temas chegarem (`[aria-busy="true"]` nulo) usa o prazo padrão de
   1 s e falhou com *"expected … to be null"*; e `useDesignDraft.undoIntegration.test.tsx` estoura os 5 s do vitest.
   **Correção:** prazo explícito e folgado nos dois (`waitFor(..., { timeout: 10000 })` no primeiro e `it(..., 30000)`
   no segundo, com o comentário do motivo, como o resto da suíte já faz), sem mexer no que os testes afirmam. O
   `PresetsCatalog.test.tsx` tem o mesmo `waitFor`: aplicar o mesmo prazo.

**Status: 🔵 Em correção.** O código de produto (P1, P2, P3) está aprovado como está.

## Veredito — 2026-10-16 — correção 2 (lote 1) — 🟢 Aprovado

**Conferido no worktree, pelo revisor:**
- **Achado 1:** `pointAt` espera o cartão parar (`waitUntilStill`: caixa idêntica por 5 quadros e nenhuma animação em
  curso), relê a caixa assentada e só então posiciona o ponteiro; as asserções não mudaram. Rodei o arquivo **5
  vezes isoladas contra o `dist/` reconstruído: 13/13 nas cinco** (a falha anterior era 2 de 13 na bateria e 1 de 3
  isoladas).
- **Achado 2:** `waitFor(..., { timeout: 10000 })` nos dois testes que esperam os temas e `, 30000` no teste de
  desfazer, cada um com o motivo; nenhuma asserção mudou.
- **Suíte completa, sozinha na árvore:** **495 arquivos, 3479/3479 testes, 0 falha**, numa passada.
- `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; `guide:check`, `dev-kit:check`, `token-docs` (116 de 402
  documentados, 286 em exceção) e `kit-names` verdes. Anteriores desta rodada: `cromo-css-real` 337/337, build OK.

**Lote 1 da `plan-117` (P1, P2, P3) fechado.** P1–P3 mudam o estilo computado no navegador (par padrão × extremo),
movimento reduzido zera os três, token 0 não registra listener, a base do cartão voltou para a camada de baixo, nenhum
`defaultValue` nem tema tocado.

**Status: 🔴 A executar (lote 2: P4, P5 — o traço luminoso).** Os lotes 2 e 3 seguem a §5.2.

## Veredito — 2026-10-16 — lote 2 (P4, P5) — 🟢 Aprovado

**Conferido pelo revisor:**
- **Diff:** a regra do anel em `_cards.css` (cônico mascarado só na borda, `border-radius: inherit`, cor da primária,
  `display: none` quando apagado), o `beamOn` do `SarakSearchCard` (aceso por foco ou por `borderBeamEnabled`), o hook
  `usePauseBeamOffscreen` (observador só com o traço aceso; atributo gravado direto, sem `setState`) e o movimento
  reduzido **apagando** o anel — escolha justificada e aceita (um arco congelado num ângulo arbitrário pareceria defeito).
  Base do cartão fora de `_cards.css`, cor de token, sem `!important` novo.
- **Verificação conjunta com a `plan-118`** (regenerei `token-types`/`guide`/`dev-kit`): `npm run build` OK;
  `verify --tier=full`: `tsc`, **suíte completa sem falha**, baseline com `tsc`, Anel 1 inteiro (incluindo
  `token-docs` 118 de 402, `variable-contract`, `css-important`, `fixed-translucent`, `token-reader`), R36 e Anel 0 verdes.
- **Navegador contra o `dist/` real:** bateria inteira **346/348**; os **24 casos de `cartao-que-se-move`** (13 do
  lote 1 + 11 novos, o spotlight robusto) e `tema-sob-demanda` passaram. As 2 falhas não são desta entrega: o caso
  `isSplitViewEnabled responde à largura da região…` é a intermitência registrada no backlog 15, e o caso do tablet
  caiu com `page.goto: browser has been closed` depois de a bateria ter medido **10,3 h** (o computador suspendeu no
  meio); **os dois passam isolados, 2 de 2**.
- **Custo medido** (48 cartões, headless sem GPU): ligado, o giro derruba a taxa de quadros (11/s contra 61/s);
  a causa é o `backdrop-filter` do cartão repintado a cada quadro. A mitigação (pausa fora da viewport) está feita,
  e o custo dentro da janela está avisado no `usage` e na nota de migração; `borderBeamEnabled` é opt-in. Aceito.

**Lote 2 da `plan-117` fechado (P4, P5).** Faltam P6–P8 (retirada, lote 3) e as candidatas C1–C3 a decidir.

**Status: 🔴 A executar (lote 3).**

## Veredito — 2026-10-16 — lote 3 (P6, P7, P8) — 🔴 Reprovado (2 achados)

**O que está certo (conferido):** os dois tokens saíram do schema, das partições e do mapeamento (400 tokens, antes 402),
estão em `REMOVED_TOKEN_KEYS` com teste (aviso nomeando a chave, padrão no lugar, mutação provada), a exceção
`achado-lote-1` ficou **vazia**, `getCardStyles` e `actionColumnAlignmentClass` saíram, `cardVariant` ficou sem `axis`
(a justificativa é correta: nenhum dos seis eixos o descreve), nota MAJOR e GUIA §6.4 reescritos. As candidatas C1–C3
foram relatadas como achado, sem correção, como a plan manda: **C2** (os 7 `tokenId` duplicados não existem mais; sobram
26 entradas sem `name`/`tags` em `components_base.json`) e **C3** (`--sarak-font-size` já não é emitida) estão
**desatualizadas no backlog** — vou atualizar os itens 6 e 7; **C1** fecha com a `plan-118`.

**Verificação conjunta com a `plan-118` — o que quebrou nesta plan:**

1. **`token-reader:check` vermelho** (`cardImagePosition = "top"`; também `check-token-reader.test.mjs`). O único
   "leitor" de `top` era o `getCardStyles` morto: o código morto escondia que a opção não é lida por ninguém
   (`useCardLayoutStyles` só age em `right` com direção em linha). A R40 exige a `ALLOWLIST` **vazia**, então a
   opção (a) do resumo (entrada na `ALLOWLIST`) não é permitida, e (b)/(c) mexem em `defaultValue` ou criam
   funcionalidade. **Decisão do revisor (P9): retirar `cardImagePosition`** pelo mesmo caminho de P6/P7: nenhum tema o
   declara, o efeito era a inversão da ordem dos blocos num cartão em linha, e "token oferecido muda a tela ou sai" é a
   regra do dono para esta plan. **Correção:** retirar do schema, das partições, do mapeamento e dos tipos
   (`npm run token-types`); entrada em `REMOVED_TOKEN_KEYS` com teste; simplificar `useCardLayoutStyles` (a direção em
   linha vira sempre `flex-row`) e o que só `cardImagePosition` usava; nota MAJOR (o que o importador faz para inverter
   a ordem: o próprio `className`); GUIA/anexo. O dono pode vetar; sem veto, é o que a plan manda.
2. **Dois snapshots perderam as variáveis que a retirada removeu:** `PresetCard.test.tsx` e `PreviewCanvas.test.tsx`
   (`--sarak-card-content-alignment` e `--sarak-table-action-position` saíram do `style`). É consequência correta de
   P6/P7: **atualizar os dois snapshots** (`-u` só nesses arquivos), conferindo no diff que **só** essas variáveis (e,
   depois do achado 1, a de `cardImagePosition`) mudaram.

Os outros vermelhos da verificação conjunta (`public-types`, cobertura de `useSarakFonts`, tamanho de `font-manifest.ts`)
são da `plan-118`.

**Status: 🔵 Em correção.** O resto da entrega está aprovado como está.

## Veredito — 2026-10-16 — correção 1 (lote 3: P9) — 🟢 Aprovado

**Conferido:** `cardImagePosition` saiu do schema, das partições, do mapeamento (399 tokens) e dos tipos; está em
`REMOVED_TOKEN_KEYS` com teste; `useCardLayoutStyles` simplificado (linha vira sempre `flex-row`); os dois snapshots
mudaram **só** nas variáveis retiradas; `token-reader:check` verde com a `ALLOWLIST` vazia.

**Verificação conjunta (nível `full` + navegador, uma vez):** `tsc`, baseline com `tsc`, Anel 1, R36 e Anel 0 (1.853
linhas, 0 achados) verdes; kits regenerados e em dia. Suíte: as únicas falhas (13, `cssSafety.test.ts`) e as 2 do
navegador (`fontes-do-host.spec.ts`) são do **lote 4 da `plan-118`**, em execução em paralelo no mesmo worktree;
`cssSafety` passa isolado (38/38). Navegador: 350 de 352 passam, incluindo todos os casos do arsenal desta plan.

**Tabela §5.1:** nenhuma linha aberta. C1 fecha com a `plan-118`; C2 e C3 estão desatualizadas e já refletidas no
backlog (item 7). **Plan aprovada**; a síntese (02/04/09) aguarda autorização do dono. Libera os lotes 5+ da `plan-110`.

## Nota do revisor — 2026-10-16 — plan mantida aberta como registro

**Sintetizada** (a verdade vive em `02` §10.4, `04` §4.1 e `09` §4.4.4) e **retida pela `plan-110`**, por decisão do dono:
ela segue como o **registro vivo** da §5.1 durante a aplicação dos temas. Pendência do arsenal que a `plan-110` achar
**entra na tabela da §5.1 como linha nova e é corrigida aqui, em lote, antes de o tema seguinte ser ajustado** (não vai
ao backlog). Hoje a tabela não tem linha aberta. A retenção expira sozinha: quando a `plan-110` for sintetizada, esta
sai junto, no mesmo ato.

## Resumo da execução — 2026-10-17

**Resultado:** Concluído

**Estado do worktree ao iniciar**

```text
 M specs/00-indice.md
 M specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
 M specs/plan/plan-117-pendencias-do-arsenal.md
?? .claude/settings.local.json
```

**O que foi feito**
- P10: medi `box-shadow` no botão selecionado real do `SarakCatalogGrid`; o estilo `matte` preserva o `style` inline que `SarakButton` recebe, e Offset Y/Blur/Spread alteram a sombra quando variados individualmente. A opacidade de 5% deixa o efeito discreto. Atualizei o uso e a descrição dos três tokens e as linhas da GUIA.
- P11: mantive `colorDepth` e `colorVariation` conforme a decisão do dono. A medição confirmou que ambos alteram os estados globais de hover/pressionado; atualizei schema e GUIA para registrar `--theme-primary-hover`/`--theme-primary-active` e seus consumidores em `_elements.css`.
- P12: `radar` agora usa tooltip por item; `heatmap` recebe eixos categoria/categoria alinhados às coordenadas da série. A medição renderizou os sete tipos padrão em canvas sem erro de console.
- P13: conectei o trilho ativo ao `--sarak-range-active-bg`; trilho, polegares e dicas usam o mesmo token. Atualizei schema, GUIA e o anexo de medição.
- Registrei o resultado dos sete tokens no anexo da `plan-110` e acrescentei este resumo. GUIA foi atualizada manualmente; não executei geradores.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/engines/charts/SubEngines/axisOptions.ts` | alterado | Tooltip por item em radar/heatmap; eixos categoria/categoria para heatmap. |
| `src/components/atomic/Inputs/SarakRangeSlider.tsx` | alterado | A cor ativa passa a ler `--sarak-range-active-bg`. |
| `src/core/Design/schema/buttons.ts` | alterado | Uso e descrição dos tokens de sombra limitados ao consumidor real. |
| `src/core/Design/schema/colors.ts` | alterado | Uso e descrição de profundidade/variação registram as variantes consumidas pelos estados globais do botão. |
| `src/core/Design/schema/inputs.ts` | alterado | Uso e descrição de `rangeActiveColor` incluem trilho, polegares e dicas. |
| `src/components/engines/charts/__tests__/SarakChartEngine.formats.test.tsx` | alterado | Casos unitários para eixos e tooltip de radar/heatmap. |
| `src/components/atomic/Inputs/__tests__/SarakRangeSlider.test.tsx` | alterado | Caso unitário para o token no trilho, polegar e dica. |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | Corrigi as linhas dos tokens P10, P11 e P13. |
| `specs/plan/anexos/plan-110-tokens-funcionais.md` | alterado | Acrescentei o desfecho medido dos sete tokens. |
| `specs/plan/plan-117-pendencias-do-arsenal.md` | alterado | Acrescentei este resumo e movi `status` para `🟠 Em revisão`. |
| `browser-tests/arsenal-lote4-source.spec.ts` | criado | Quatro medições de navegador para P10–P13. |
| `browser-tests/playwright-source.config.ts` | criado | Configuração isolada do caso de navegador direto da fonte. |
| `browser-tests/fixtures/arsenal-lote4-source-entry.tsx` | criado | Cena que importa condicionalmente os componentes reais do projeto. |
| `browser-tests/fixtures/arsenal-lote4-source.html` | criado | Página de medição e estilos mínimos para dimensões do gráfico. |
| `browser-tests/fixtures/arsenal-lote4-icon-stub.tsx` | criado | Substitui ícones decorativos na cena de medição. |
| `browser-tests/fixtures/arsenal-lote4-input-stub.tsx` | criado | Substitui o input de busca do catálogo, fora do alvo medido. |
| `browser-tests/fixtures/arsenal-lote4-provider-stub.tsx` | criado | Fornece contexto mínimo e aplica variáveis reais de `useDesignVariables`. |
| `browser-tests/fixtures/arsenal-lote4-echarts-wrapper.tsx` | criado | Adapta a API React a uma instância ECharts real no navegador. |
| `browser-tests/fixtures/arsenal-lote4-echarts-global.ts` | criado | Expõe a API gráfica do ECharts local aos builders da fonte. |
| `browser-tests/fixtures/arsenal-lote4-echarts-core-stub.ts` | criado | Evita registro duplicado dos componentes já presentes no bundle ECharts local. |
| `browser-tests/fixtures/arsenal-lote4-echarts-components-stub.ts` | criado | Stubs dos registradores de acessibilidade/legenda já presentes no bundle ECharts local. |
| `browser-tests/fixtures/arsenal-lote4-recharts-stub.tsx` | criado | Substitui o motor alternativo não selecionado na cena de P12. |

**Verificações executadas**
- `node_modules/.bin/vitest.cmd run src/components/engines/charts/__tests__/SarakChartEngine.formats.test.tsx src/components/atomic/Inputs/__tests__/SarakRangeSlider.test.tsx` → 2 arquivos, 26/26 testes passaram; houve avisos ambientais de GLib e parse de CSS, sem falhas de teste.
- `$env:PLAYWRIGHT_BROWSERS_PATH = (Resolve-Path 'node_modules/.cache/ms-playwright').Path; node_modules/.bin/playwright.cmd test --config=browser-tests/playwright-source.config.ts browser-tests/arsenal-lote4-source.spec.ts --grep 'P1[0-3]:' --timeout=180000` → 4/4 casos passaram; P12 verificou os sete formatos.
- Não rodei `guide`, `dev-kit`, `build`, suíte completa ou gates, conforme o escopo de verificação definido pelo dono.

**Critérios de aceite**
- [x] P10: cada valor extremo, isoladamente, muda a sombra computada no botão selecionado; o caso usa `btnStyleType: matte` e confirma a precedência real.
- [x] P11: profundidade e variação mudam o hover computado; os tokens permanecem no schema conforme decisão do dono.
- [x] P12: os sete tipos declarados renderizam canvas sem erro de console.
- [x] P13: `rangeActiveColor` muda o estilo computado do trilho, dos polegares e das dicas.

**Decisões e suposições**
- Mantive P11 e corrigi sua documentação, conforme a decisão explícita do dono. Não alterei `removedTokenKeys`, partições nem tipos.
- O harness importa componentes e builders da fonte. Para contornar dependências decorativas/CommonJS, substitui ícones, input de busca, provider, wrapper React do ECharts e motor Recharts; as variáveis vêm do `useDesignVariables` real e P12 usa o bundle ECharts local real com as opções produzidas pelo `SarakChartEngine`.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- A suíte completa, os gates e a medição contra o build não foram executados, conforme instrução do dono; a verificação de integração do revisor continua pendente.
