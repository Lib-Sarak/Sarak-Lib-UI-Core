---
tipo: "plan"
titulo: "O schema que o painel oferece desenha: os 70 tokens sem leitor ganham leitor, se fundem ou saem, e a excecao do token-reader termina vazia"
objetivo: "Resolver os 70 tokens que a plan-112 declarou na excecao do token-reader, dando leitor ao que tem componente, fundindo duplicatas, retirando o que nao e de tema e provando por opcao o que chega por tabela, ate a ALLOWLIST ficar vazia antes de os temas serem refeitos"
dominio: "Design Engine / CSS do motor / Contrato de tokens / Componentes"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "design-engine", "tokens", "css", "gate", "temas", "componentes"]
relacionados: ["[[02-design-engine]]", "[[09-temas-e-presets]]", "[[04-contrato-de-tokens-e-paridade]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: "plan-112-o-resto-do-arsenal-desenha"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Todo token do schema muda a tela, e a mudança é medida. Os 70 tokens que a `plan-112` declarou na `ALLOWLIST` do
`token-reader:check` terminam em um de quatro destinos: **ganham leitor**, **se fundem** no token que já desenha,
**saem do schema**, ou ganham **prova por opção** de que já desenham. A `ALLOWLIST` termina **vazia**.

# 2. Contexto

**Decisão do dono, 2026-10-11:** "vamos corrigir tudo antes de aplicarmos nos temas". A `plan-110` (lote 1 em
espera) depende desta: o designer dos temas não pode encontrar no painel um controle que não muda nada.

**Por que existem.** Até a 112, o gate só olhava os tokens citados no `manifest.ts`. Quem emite uma variável
(`--sarak-<kebab>`, `cssVars`) e um atributo (`data-sx-<kebab>`) para **todo** token do schema é o
`useDesignVariables.ts`. Com o escopo ampliado, apareceram 70 tokens que o painel oferece e o motor emite, e
que nenhum CSS ou componente lê. O revisor conferiu uma amostra (`card-header`, `tooltip-radius`,
`input-padding`, `z-index-toast`, `card-action-btn`, `ai-glow`, `color-bg-modal`): zero leitores fora de
schema, catálogo, gerados e presets.

**O destino de cada um foi decidido pelo dono** sobre a classificação do revisor (§2.1). Os 11 tokens sem
objeto claro foram analisados um a um pelo revisor antes desta plan (§2.2).

## 2.1 O mapa dos 70

| Grupo | Qtd | Tokens | Destino |
|---|---|---|---|
| **A. Componente existe e deve obedecer** | 30 | `cardHeaderBg`, `cardHeaderBorder`, `cardHeaderPadding`, `cardFooterBg`, `cardFooterBorder`, `cardHoverTranslate`, `cardHoverGlowIncrease`, `cardActionBtnPrimaryBg`, `cardActionBtnHoverBg`, `cardActionBtnText`, `cardActionBtnBorderRadius`, `cardActionBtnPadding`, `cardSearchBgFocus`, `cardSearchPlaceholderColor`, `cardSearchTextFocusColor`, `inputPadding`, `inputSuccessColor`, `tooltipRadius`, `modalOverlayBlur`, `colorBgModal`, `zIndexToast`, `tableZebraStriping`, `tableBorderRadius`, `btnGhostHoverBg`, `btnNeonPulseSpeed`, `statusGlowBlur`, `identityPadding`, `identityFontFamily`, `identityFontWeight`, `identityTracking` | **ganham leitor** no componente que o rótulo nomeia |
| **B. Duplicatas de movimento** | 6 | `animInstant`, `animFast`, `motionDurationInstant`, `motionEaseIn`, `motionEaseOut`, `motionStaggerDelay` | **uma família só** (§2.3) |
| **C. Peças internas do painel da lib** | 11 | `managementGroupDescMaxWidth`, `presetCardHoverShadowBlur`, `presetCardHoverShadowSpread`, `devicePhoneWidth`, `kbdMinWidth`, `themeDropdownMaxHeight`, `visualPerspective`, `visualTranslateOffsetSm`, `visualTranslateZMd`, `visualDotGridSize`, `visualOrbBlur` | **saem do schema**; o valor vira constante do componente do painel |
| **D. Sem objeto claro** | 11 | ver §2.2 | 5 ganham leitor, 3 se fundem, 3 saem |
| **E. Lidos por tabela ou normalizador** | 11 | `pageTransitionType`, `cardHoverStyle`, `btnStyleType`, `cardTitleFontWeight`, `mobileNavigationStyle`, `chromeSearchPosition`, `chromeUserPosition`, `chromeNotificationsPosition`, `layoutGridTemplate`, `maxContentWidth`, `borderStyle` | **prova por opção** (teste) e o gate passa a vê-los (§5, passo 6) |
| **F. Opções sem regra** | 1 | `layout` (`classPrefix` `layout-`, sem `.layout-grid`/`.layout-flex`/`.layout-masonry`) | ganha as regras, ou as opções sem regra saem |

A lista do gate tem 58 tokens no grupo "sem menção" (A + B + C + D). O resumo da 112 dizia 57; vale a contagem do
arquivo.

## 2.2 Os 11 sem objeto claro — análise do revisor

| Token | O que o revisor mediu | Destino |
|---|---|---|
| `colorBgLayer2` | `colorBgLayer1` desenha nos modos de fundo de `_background.css` (`linear`, `radial`, `mesh`); a malha (`mesh`) repete a primária na terceira mancha | **leitor**: a terceira mancha da malha passa a ser a camada 2. O fundo ganha uma segunda camada de profundidade de verdade |
| `textSmoothing` | nenhum `-webkit-font-smoothing` em `src/styles/` | **leitor**: `antialiased`/`grayscale` quando ligado, `auto` quando desligado. Escolha tipográfica real (macOS) |
| `vignetteSoftness` | a vinheta existe (`_atmosphere.css:30` e `:65`, `_theme.css:88`), com a parada transparente fixa (20% e 50%) | **leitor**: a suavidade governa a parada transparente; o valor padrão reproduz o desenho de hoje |
| `bgNoiseAnimation` | o ruído (`bgNoiseDensity`, fundido na 111) é estático; não há animação de ruído no CSS | **leitor**: animação do grão; **padrão passa a 0** (estático, como hoje); respeita `prefers-reduced-motion` e o modo de desempenho que já corta animação |
| `aiGlowColor` | os dois chats (`SarakChatEngine.tsx:171-173` e `Templates/Chat/`) desenham o indicador de "pensando" fixo na primária | **leitor**: o indicador de carregamento dos dois chats usa a cor do brilho de IA. O padrão do token é revisto para conviver com o tema padrão (declarado na nota MAJOR) |
| `formLayoutDirection` | duplica `formLabelPosition` (`structural.ts:144`, `top`/`left`), que desenha (`SarakFormGroup`) | **funde** em `formLabelPosition` |
| `layerElevationFactor` | duplica `layeredShadows`, que já multiplica a opacidade da sombra em camadas (112); a sombra do cartão tem os seus próprios tokens | **funde** em `layeredShadows` |
| `matrixSearchBg` | a busca da `SarakExpandableMatrix` é um `SarakInput` (`SarakExpandableMatrix.tsx:128`), que já obedece aos tokens de campo | **funde** nos tokens de campo (sai como override por instância) |
| `aiPanelBg` | nenhum "painel de IA" na lib; o painel do chat é superfície de cartão, governada pelos tokens de cartão e superfície | **sai** |
| `identityRedirectUrl` | a marca é um slot `ReactNode` do `SarakAppChrome` (`brand`, `logo`): o link é do consumidor; uma variável CSS não navega | **sai** (navegação é comportamento da aplicação, não tema) |
| `industrialRegistry` | não visual (o próprio schema diz); nenhum leitor em JS; o `attr` `data-industrial-registry` do manifesto nunca é emitido | **sai** |

## 2.3 A família de movimento

Há duas famílias de duração e curva que se sobrepõem, medido pelo revisor (leitores fora de schema, catálogo,
gerados e presets):

| `animations.ts` | leitores | `motion.ts` | leitores |
|---|---|---|---|
| `animInstant` (`--sarak-anim-instant`) | 0 | `motionDurationInstant` (`--sarak-motion-dur-instant`) | 0 |
| `animFast` | 0 | `motionDurationFast` | 1 |
| `animNormal` | 1 | `motionDurationNormal` | 1 |
| `animSlow` | 0 | `motionDurationSlow` | 1 |
| `easeMain` | 3 | `motionEaseMain` | 1 |
| `easeOut` | 2 | `motionEaseOut` | 0 |
| — | — | `motionEaseIn` | 0 |
| — | — | `motionStaggerDelay` | 0 |

**Regra:** sobrevive **uma** família (recomendação do revisor: `motion*`, a única completa, com curva de entrada e
cascata); a outra se funde nela e os leitores dela migram, sem mudar o desenho padrão. Os que não têm par ganham
leitor: `motionEaseIn` na saída de sobreposições (modal, popover, toast); `motionStaggerDelay` na entrada em
cascata que hoje é fixa (`SarakTableViewParts.tsx:129`, `ROW_ANIMATION_DELAY`; `SarakChart.tsx:55`,
`index * 0.05`). O executor confirma a escolha da família medindo os leitores e declara no resumo.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/`, `src/core/Design/catalog/` (paridade), `src/core/Provider/generated/` (regenerado), `src/core/Provider/manifest.ts`, `src/core/Provider/utils/removedTokenKeys.ts`.
- `src/styles/` e os componentes que são o leitor natural de cada token do grupo A, D e B (cartão, botão de ação, busca do cartão, campo, tooltip, modal, toast, tabela, botões, status, marca, chats, tabela/gráfico para a cascata, sobreposições para a curva de entrada).
- Os componentes do painel (`src/features/DesignEngine/`) que hoje leem o valor dos tokens do grupo C por fallback — o valor vira constante local.
- `src/core/Design/presets/` — só tirar o que sai do schema e migrar o que se funde (sem redesenho; é da 110).
- `gates/scripts/contrato/check-token-reader.mjs` e o teste dele — `ALLOWLIST` vazia; o gate passa a ver o grupo E (§5, passo 6).
- `browser-tests/` (medição), testes unitários, `docs/migracoes.md` (subseção dentro de `## 8.0.0`), artefatos regenerados.
- Os dois achados que a 112 registrou fora do escopo: os `attr` do `manifest.ts` com nomes que o motor nunca emitiu (`data-surface`, `data-tone`, `data-border`, `data-shadow-orientation`, `data-industrial-registry`…) e as duas leituras do mesmo token com fallbacks diferentes (`--sarak-card-blur` 12px × `--sarak-card-backdrop-blur` 0px, `_atmosphere.css`).

## 3.2 Fora
- Redesenhar tema (é a `plan-110`). Criar componente novo para dar leitor a um token: se o componente não existe, o token sai.
- Mudar o desenho padrão sem declarar: todo leitor novo reproduz o desenho de hoje no valor padrão, ou a diferença vai declarada na nota MAJOR com o motivo.
- Qualquer spec em `specs/` (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-112-o-resto-do-arsenal-desenha.md` (§9, §10) e `plan-111-todo-token-visual-desenha.md` (§9, §10) | o idioma de fusão, as armadilhas medidas, o gate |
| Spec fixa | `arquitetura/02-design-engine.md` (§9.1) · `arquitetura/04-contrato-de-tokens-e-paridade.md` | camadas CSS; paridade 1:1:1 |
| Spec fixa | `specs/09-temas-e-presets.md` §4.2 e §4.4.3 · `specs/00-regras-e-invariantes.md` (R18) · `specs/01-gates-e-baseline.md` §2.2 | valor fora do contrato; token sem efeito; limites declarados |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-refatorar-componente` · `ui-novo-componente` · `ui-arquitetura-design` | token, opção, paridade e CSS do motor |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre; testes dos leitores |
| Código | `src/core/Design/hooks/useDesignVariables.ts`, `gates/scripts/contrato/check-token-reader.mjs`, `src/core/Provider/utils/removedTokenKeys.ts` | emissor real, gate, chaves removidas |
| Código | `browser-tests/arsenal-restante-desenha.spec.ts`, `browser-tests/fixtures/harness-entry.tsx` | idioma de medição da 112 |

# 5. Instruções de execução

1. **Grupo A (30):** cada token desenha, no componente que o rótulo nomeia, o que o rótulo promete, nos dois modos. Valor padrão reproduz o desenho de hoje (ou a diferença vai na nota MAJOR). Se, ao medir, o componente nomeado não existir na lib (ex.: a lib não desenha a marca por conta própria, só o slot), o token sai, declarado com o motivo.
2. **Grupo B (6) e a família de movimento:** como em §2.3.
3. **Grupo C (11):** saem do schema, do catálogo, dos temas e do manifesto; entram em `removedTokenKeys.ts`; o componente do painel que os lia passa a usar constante local com o mesmo valor.
4. **Grupo D (11):** como em §2.2.
5. **Grupo F:** `layout` ganha as regras das opções, ou as opções sem regra saem.
6. **Grupo E (11) e o gate:** cada token ganha teste por opção que prova o efeito (unitário quando o efeito é JS; navegador quando é CSS). O gate deixa de precisar da exceção: o leitor por tabela passa a ser visto (ex.: o gate aceita o literal da opção numa tabela declarada, ou o mapa passa a citar o atributo) — o executor escolhe, justifica e atualiza os limites no cabeçalho (R18). Nenhum dos 11 fica na `ALLOWLIST`.
7. **Os dois achados da 112:** o `manifest.ts` deixa de citar `attr` que o motor não emite; as duas leituras do desfoque do cartão passam a ter um nome e um fallback só.
8. **`ALLOWLIST` vazia**, o mecanismo continua. O gate falha no `HEAD` anterior pelos 70 e passa depois.
9. Testes: unitário do que for JS; em `browser-tests/`, medição de cada leitor CSS novo (uma opção ou valor fora do padrão contra o padrão, por token), da cascata, da curva de entrada, da vinheta, do grão animado (e parado sob movimento reduzido) e da malha com a camada 2.
10. Nota **MAJOR** dentro de `## 8.0.0`: o que passa a desenhar, o que se funde (com o destino do valor salvo) e o que sai.
11. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Grupo A: os 30 desenham, ou saíram com motivo medido.
- [ ] Grupo B: uma família de movimento; cascata e curva de entrada com leitor.
- [ ] Grupo C: os 11 fora do schema; o painel com o mesmo desenho.
- [ ] Grupo D: os 11 conforme §2.2.
- [ ] Grupo E: os 11 com teste por opção, vistos pelo gate sem exceção.
- [ ] Grupo F: `layout` sem opção sem regra.
- [ ] `manifest.ts` sem `attr` que o motor não emite; desfoque do cartão com um nome só.
- [ ] `ALLOWLIST` do `token-reader` vazia; o gate falha no `HEAD` anterior e passa depois.
- [ ] Paridade convergente; `auditor_presets` sem órfã; `tokenContractParity`, `shippedThemesConsoleClean` e contraste verdes.
- [ ] Nota MAJOR em `## 8.0.0`.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; gates do Anel 1; catálogo, kit e barril em dia; casos novos de `browser-tests/` escritos (o revisor roda `cromo-css-real:check`).
- [ ] Nenhuma linha adicionada casa com os padrões de `gates/scripts/segredo/config.json` (o Anel 0 barrou a 111 por uma chave `token:` seguida de texto).

# 7. Como verificar (uso do revisor)

**Gate:** `token-reader:check` (R40), com a `ALLOWLIST` vazia — não é regra nova.

- `git diff --stat` → só a §3.1 e os gerados.
- `npm run token-reader:check` → OK sem exceção; no `HEAD` anterior, falha.
- Mutação: apagar o leitor de um token do grupo A → o gate acusa; apagar a linha da tabela de uma opção do grupo E → o gate acusa.
- `npm run build` + `npm run cromo-css-real:check` (o revisor roda, com rede).
- `npm run audit` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline -- --with-tsc` · Anel 1 completo · simulação do Anel 0.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`02-design-engine`:** os leitores novos, a família de movimento única, a camada 2 do fundo, o grão animado.
- **`09-temas-e-presets`:** os tokens que se fundiram ou saíram (o que o tema pode e não pode mais declarar).
- **`00-regras` R40 e `01-gates`:** exceção vazia; como o gate vê o leitor por tabela.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
