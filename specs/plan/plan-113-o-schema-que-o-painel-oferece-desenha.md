---
tipo: "plan"
titulo: "O schema que o painel oferece desenha: os 70 tokens sem leitor ganham leitor, se fundem ou saem, e a excecao do token-reader termina vazia"
objetivo: "Resolver os 70 tokens que a plan-112 declarou na excecao do token-reader, dando leitor ao que tem componente, fundindo duplicatas, retirando o que nao e de tema e provando por opcao o que chega por tabela, ate a ALLOWLIST ficar vazia antes de os temas serem refeitos"
dominio: "Design Engine / CSS do motor / Contrato de tokens / Componentes"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-10-11

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- **Grupo C (11) e saídas do D (3)** saem do schema (`schema/*.ts`), do catálogo (`partitions/*.json` e `theme_table_mapping.json`, por remoção textual, sem reformatar), dos 14 temas, de `color-engine.ts` e do manifesto; entram em `removedTokenKeys.ts`. Nenhum componente do painel lia o valor (nenhuma menção por fallback), então não houve constante local a criar.
- **Grupo D**: `formLayoutDirection`, `layerElevationFactor`, `matrixSearchBg` fundidos (nenhum tema declarava `formLayoutDirection`; `layerElevationFactor` só valia 1 e 2 e cai no padrão); `aiPanelBg`, `identityRedirectUrl`, `industrialRegistry` saem; `colorBgLayer2` (malha), `textSmoothing`, `vignetteSoftness`, `bgNoiseAnimation` (padrão 0, `prefers-reduced-motion` e modo eco), `aiGlowColor` (os dois chats) ganham leitor.
- **Grupo A (30)**: 29 desenham e 1 sai (`inputSuccessColor`, nenhum campo tem estado de sucesso). Leitores: `SarakCardHeader`/`SarakCardFooter`, `_cards.css` (hover, botão de ação, busca), `SarakInput`/`SarakSelect`/`SarakTextarea`, `SarakTooltip`, `SarakModal`, `SarakToast`, `SarakTableView*`/`SarakDataTable*`, `SarakButton`/`SarakIconButton`, `SarakBadge`, `ChromeSlots`/`SarakShellNav`.
- **Grupo B**: sobrevive `motion*` (medido: `motion*` é a única com curva de entrada e cascata; `anim*` tinha 1 leitor de CSS e dois de JS). Saem `animInstant/Fast/Normal/Slow`, `easeMain`, `easeOut`; leitores migrados em `_utilities.css`, `_elements.css`, `_cards.css`, `SarakAccordion.tsx`, `SarakDrawer.tsx`. `--duration-*` de `_theme.css` estavam inválidas (`calc(0.3s * 1s)` computa 0 s no Chromium, medido) e foram corrigidas. `motionDurationInstant` lê o aperto (`:active`); `motionEaseIn` e `motionStaggerDelay` por `useMotionTokens.ts` (novo) em `SarakModal`, `SarakScrim`, `SarakSearch`, `SarakTableViewParts`, `SarakChart`.
- **Grupo E**: o gate passou a ver o leitor DECLARADO (`@sarak-token-reader <id> tabela|direto`, em comentário no leitor, TS ou CSS) e exige teste por opção; declarados `pageTransitionType`, `mobileNavigationStyle`, `chrome{Search,User,Notifications}Position`, `layoutGridTemplate`, `maxContentWidth`, `borderStyle`, `cardTitleFontWeight`, `cardHoverStyle`, `btnStyleType`. Casos de teste novos por opção em `SarakPageTransition.test.tsx`, `chromePreferencePlacement.test.ts`, `chromeStructuralStyles.test.ts` e nos dos lotes.
- **Grupo F**: `layout` sai (as três opções nunca tiveram regra). Também saem as opções `3d-tilt` (`cardHoverStyle`) e passa a ter leitor `cyberpunk` (`btnStyleType`).
- **Achados da 112**: `manifest.ts` sem `attr` que o motor não emite (ficam só os `data-sx-<kebab>` reais); `--sarak-card-blur` e `--sarak-card-backdrop-blur` viram um nome (`--sarak-card-backdrop-blur`, fallback 12px) em `_atmosphere.css`, `_surfaces.css`, `_cards.css` e `MessageBubble.tsx`.
- **Gate**: `ALLOWLIST = []`, mecanismo mantido; limites 10 e 11 no cabeçalho (R18). `check-token-reader.test.mjs` com 7 casos novos (tabela, mutação por linha da tabela e por caso de teste, passagem direta, marcador órfão).
- Nota MAJOR em `docs/migracoes.md` (subseção nova em `## 8.0.0`); `token-types`, `catalog`, `guide`, `dev-kit` regenerados; 4 snapshots atualizados (só defaults e tokens removidos).

**Arquivos alterados** (resumo; 120 rastreados + novos, ver `git status`)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-token-reader.mjs` e teste | alterado | ALLOWLIST vazia; leitor declarado; teste por opção; chave sem aspas |
| `src/core/Design/schema/*.ts`, `catalog/**`, `presets/themes/*.ts`, `Provider/generated/*` | alterado | 25 tokens fora, defaults, opções |
| `src/core/Provider/manifest.ts`, `utils/removedTokenKeys.ts` | alterado | `attr` e chaves removidas |
| `src/styles/*.css` (9 arquivos) | alterado | leitores novos, movimento, desfoque único |
| `src/components/**` (≈40 arquivos) | alterado | leitores por token |
| `src/components/atomic/hooks/useMotionTokens.ts`, `Cards/cardHoverMotion.ts` | criado | curva de entrada, cascata, hover do cartão |
| testes novos (≈14) e `browser-tests/schema-que-desenha.spec.ts`, `fixtures/harness-entry.tsx` | criado/alterado | prova por opção; casos de navegador |
| `docs/migracoes.md`, `docs/component-catalog.*`, `sarak-ui/**`, `sarak-dev/**` | alterado | nota MAJOR e gerados |

**Verificações executadas**
- `npx vitest run` (completo, 460 arquivos): 1ª rodada 5 falhas (teste da tabela e 4 snapshots), corrigidas; rodada final **2954 de 2955 passaram**, a falha era o snapshot de `PreviewCanvas` (atualizado com `-u`, só defaults e atributos dos tokens mexidos; isolado → 4/4).
- `npx tsc --noEmit` → exit 0, sem saída. `check-audit-baseline.mjs --with-tsc` → "igual ao baseline… nenhuma regressão" (uma regressão minha de `ghostvars` 1→3, `--spacing` e `--sarak-input-placeholder-color`, corrigida).
- `token-reader:check` → OK sem exceção; com `allowlist: []` o gate acusava 87 achados em 70 tokens no estado inicial (medido nesta execução) e hoje acusa 0.
- Anel 1 todo OK: `container-query`, `container-query-boundary`, `class-merge`, `icon-port`, `chrome-token-parity` (42/42), `zero-brand`, `barrel` (102), `catalog`, `guide`, `dev-kit`, `token-types` (409), `gate-limits` (43), `persistence-doc`, `public-types`, `kit-names`, `section-pointers`, `migration-anchor`.
- Anel 0 simulado (padrões de `config.json` sobre linhas adicionadas e não rastreados): 0 achados.
- **Não rodei** `npm run build` nem `cromo-css-real:check` (sem rede); os casos de `browser-tests/schema-que-desenha.spec.ts` estão escritos e **não executados**.

**Critérios de aceite**
- [x] Grupo A: 29 desenham, 1 sai com motivo (`inputSuccessColor`).
- [x] Grupo B: uma família; cascata e curva de entrada com leitor.
- [x] Grupo C: 11 fora do schema.
- [x] Grupo D: conforme §2.2 (3 desenham fora o `aiGlowColor`/camada 2, 3 fundidos, 3 saem).
- [x] Grupo E: 11 com teste por opção e vistos pelo gate sem exceção (`token-reader:check`).
- [x] Grupo F: `layout` fora do schema.
- [x] `manifest.ts` sem `attr` não emitido; desfoque do cartão com um nome.
- [x] `ALLOWLIST` vazia; o gate acusa o estado anterior (ver acima).
- [x] Paridade, `auditor_presets`, contraste (`audit:baseline`), Anel 1.
- [x] Nota MAJOR.
- [ ] Casos de navegador executados — motivo: sem rede/build; do revisor.
- [x] Anel 0: 0 achados.

**Decisões e suposições**
- Família `motion*` sobrevive (recomendação do revisor, confirmada pela medição dos leitores).
- `--duration-*` corrigidas (medido: 0 s): diferença declarada na MAJOR.
- `layout` sai inteiro (todas as opções sem regra) e continua chave aceita do payload (`PAYLOAD_EXTRA_KEYS`; o painel a usa).
- O marcador `@sarak-token-reader` é declarativo (limite 10 do gate). Escolhi isso à tabela fixa dentro do gate para o leitor carregar a própria declaração.
- `statusGlowBlur` desenha no `SarakBadge` (a lib não tem `SarakStatus`); `identity*` desenham no nome da marca do cromo; `tableBorderRadius` ficou responsivo (8/12/12) para reproduzir o desenho.
- Cartão: `cardHoverTranslate` padrão -4 faz TODO `.sarak-card` subir (antes só 2 cartões): declarado.
- Subagentes: três lotes (cartão, campos, botões/marca/atmosfera) foram executados por subagentes sob o brief comum; li os relatórios e conferi gate, `tsc`, baseline e suíte; não reli cada arquivo linha a linha.

**Achados fora do escopo (não corrigidos)**
- `.agents/skills/ui-criar-tema/SKILL.md:112` cita `easeMain` (removido).
- `cardBackdropBlur.cssVars` inclui `--sarak-glass-blur`, que `glassBlur` também emite: dois tokens escrevem a mesma variável; vence o último.
- `[data-perf-mode="eco"]`/`data-performance` em `_performance.css`: nenhum token emite esses atributos (só consumidor manual).
- `--layer-backdrop-blur`/`--layer-backdrop-bg` (`_theme.css`) sem leitor.
- `SarakModal` não lê `modalOverlayColor`; `SarakTooltip` ignora `tooltipBg` etc.; `[data-sx-border-type="solid"]`/`.sarak-design-scope .sarak-card` ignoram `borderStyle` nos cartões (`!important`).
- `types.ts:66` (`cardHoverStyle` extras com `glow`/`none`).
- Regra (i) do gate casa `var(--x` por prefixo (limite 11): `layout` passava por `--sarak-layout-gap-*`.
- O seletor de fonte do painel pode abrir sem item marcado para `identityFontFamily` (default agora é `var()`).

**Pendências / riscos**
- `npm run build`, `cromo-css-real:check` e os casos de `browser-tests/schema-que-desenha.spec.ts` (seletores e valores esperados escritos sem executar) são do revisor.
- Temas (14) passam a ver desenhar o que já declaravam (cabeçalho/rodapé de cartão, `colorBgModal` etc.): é da plan-110 revisá-los.

## Resumo da execução (correção 1) — 2026-10-12

**Resultado:** Concluído

**Estado do worktree ao iniciar**
O trabalho da execução original, ainda sem commit (≈190 entradas em `git status --short`: `src/`, `gates/`, `browser-tests/`, `docs/`, `sarak-ui/`, `sarak-dev/`, `specs/plan/plan-113…`), mais 48 entradas de `dist/` do build do revisor, que não são desta correção e não foram tocadas.

**O que foi feito, por achado**
1. **Kit defasado.** `docs/migracoes.md` ganhou as mudanças desta correção; `npm run catalog`, `dev-kit` e **`guide` por último**; `npm run guide:check` → "kit em dia (7 arquivos)".
2. **Hover só no cartão interativo.** Critério: *interativo é o cartão cuja superfície inteira responde ao ponteiro* e traz `data-sx-card-interactive="true"` — `SarakTitleCard` e `SarakImageCard` (os que já subiam) e o `SarakCard` com a nova prop `interactive` (aditiva). `_cards.css`: as regras de `lift`/`expand`/`glow-only`, o brilho (`::before`) e o corte do movimento reduzido passam a exigir o atributo. Contêiner (chat, matriz, `SarakCard` sem a prop) não se move em nenhum valor de `cardHoverStyle`. Testes: `cartaoQueDesenha.test.ts` (2 casos novos, mais 4 ajustados), `cardTokensQueDesenham.test.tsx` (4 casos); navegador: `schema-que-desenha.spec.ts` › "cartão: hover" (4 casos, os três valores de `cardHoverStyle` e o contêiner).
3. **Casos de navegador.** (a) Expectativa do padrão: a cena roda `sarak-sovereign`; os casos de cabeçalho, rodapé, botão de ação e tooltip comparam o alterado com o valor da cena (≠), sem fixar o `defaultValue` do schema. (b) O modal saiu da cena de hover para a cena própria `schema-modal` (`harness-entry.tsx`). (c) Seletor do campo de busca: `input[placeholder^="Buscar"]`. (d) **Os dois "prováveis defeitos" eram defeitos da lib e foram corrigidos:**
   - `tableBorderRadius` não valia: `[data-sx-texture] .card` (`_atmosphere.css`) escreve o raio com `!important` a partir de `--sarak-card-radius-tl/tr/br/bl`, e a classe `rounded-[…]` da tabela perdia (medido: o `var` do token valia `0px`, o raio computado 12px). `SarakTableView.tsx` passa o token pelos quatro cantos, como variável do próprio contêiner.
   - O grão de ruído não parava sob movimento reduzido: o atributo `data-sx-texture` mora no `html`, e `_motion.css` só alcançava `:root *` (descendentes). Entraram `:root`, `:root::before` e `:root::after` nas duas portas.
   - Mais três defeitos que o navegador revelou, corrigidos na lib: o fundo, o texto e o placeholder focados do cartão de busca perdiam para a classe utilitária do próprio `SarakInput` (`!important` em `_cards.css`); `motionDurationInstant` não chegava ao `SarakButton`/`SarakIconButton` (a classe `transition-all` vence a regra de elemento; entrou `active:[transition-duration:var(--sarak-motion-dur-instant,0.1s)]`); e a leitura imediata do campo pegava o início da transição (o caso espera 500 ms).
   - Casos novos: `tooltipBg/TextColor/BorderColor`, `modalOverlayColor` e `borderStyle` no cartão (achado 5).
4. **Controle de fonte da marca.** `identityFontFamily` (`schema/branding.ts`) passa a ter `constraints.options` = o item "Fonte de títulos do tema (padrão)" (o valor padrão `var(…)`) + as fontes do tema (`FONT_OPTIONS` agora exportado de `typography.ts`). Teste: `identityFontControl.test.tsx` (lista e item marcado com o padrão, renderizando o `SelectControl`).
5. **Tokens lidos no CSS e ignorados pelo componente.** `SarakModal` lê `modalOverlayColor` (`--sarak-modal-overlay-color`); `SarakTooltip` lê `tooltipBg`, `tooltipTextColor` e `tooltipBorderColor` (padrões do schema passam a `var(--theme-surface)`, `var(--color-theme-title, #ffffff)`, `var(--theme-border)`, que é o que desenhava); `borderStyle` vale no cartão (`border-style: var(--border-style, solid)` em `_surfaces.css` e `_atmosphere.css`). Testes unitários nos três e caso de navegador. Dos "demais achados": `layerBackdropBlur`/`layerBackdropOpacity` (leitura morta da própria lib, `--layer-backdrop-*` sem leitor) **saem**, fundidos em `modalOverlayBlur`/`modalOverlayColor`; o tipo extra `cardHoverStyle` de `types.ts:66` agora lista só as três opções do schema. `data-perf-mode`/`data-performance`/`.sarak-eco-mode` em `_performance.css` ficam: são contrato do consumidor (gancho manual, nenhum token os emite) — registrado no resumo, sem mudança.
6. **Uma variável, um dono.** `cardBackdropBlur.cssVars` perde `--sarak-glass-blur` (schema e catálogo); teste `schema/__tests__/variableOwners.test.ts` (falhava antes: 2 donos).
7. **Gate.** `codeHasVar` ancora o nome (`(?![\w-])`; no CSS exige `var(`): `--x` não é lida por `var(--x-gap)`, nem declarar a variável conta. Três casos de mutação em `check-token-reader.test.mjs`; a regra nova não acusou outro token. Cabeçalho: limite 11 reescrito.
8. **Texto desatualizado.** `.agents/skills/ui-criar-tema/SKILL.md:112` cita `cardHoverStyle` (três opções) em vez de `easeMain`.

**Consequências que a correção expôs (declaradas)**
- `gates/scripts/audit/verify_contrast.ts`: o verificador só resolvia cor literal; com o tooltip lendo os tokens, o par `tooltipTextColor / tooltipBg` ficou "pulado" nos temas que não os declaram. Ele passou a resolver `var(--theme-surface|--color-theme-title|--theme-border|--sarak-primary-color)` para o token de cor do próprio tema (limite 1 atualizado; 2 casos novos). Uma vez medido, `industrial-terminal` (modo escuro e claro) e `kinetic-flow` (escuro) reprovavam: declaravam `tooltipBg` laranja/rosa e o texto herdava o título; entrou `tooltipTextColor: '#000000'` nesses três blocos (`presets/themes/industrial-terminal.ts`, `kinetic-flow.ts`).
- `modalOverlayColor` no modal: o véu passa de preto fixo a 0,6 para a opacidade do token (0,4 no padrão). Declarado na nota MAJOR.

**Arquivos alterados (só desta correção, resumo)**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_cards.css`, `_motion.css`, `_surfaces.css`, `_atmosphere.css`, `_theme.css` | alterado | interativo, `!important` da busca, `:root::before`, `border-style`, `--layer-backdrop-*` fora |
| `src/components/atomic/Cards/SarakCard.tsx`, `SarakTitleCard.tsx`, `Templates/SarakImageCard.tsx`, `SarakTableView.tsx`, `Modals/SarakModal.tsx`, `UX/SarakTooltip.tsx`, `Buttons/SarakButton.tsx`, `SarakIconButton.tsx` | alterado | marca interativa, raio da tabela, véu, tooltip, aperto |
| `src/core/Design/schema/{branding,typography,cards,overlays,layers}.ts`, `catalog/**`, `presets/themes/*`, `Provider/{types.ts,utils/removedTokenKeys.ts}`, `generated/*` | alterado | opções de fonte, dono da variável, cores do tooltip, 2 tokens fora |
| `gates/scripts/contrato/check-token-reader.mjs` + teste; `gates/scripts/audit/verify_contrast.ts` + teste | alterado | nome ancorado; `var(--tema)` resolvido |
| `browser-tests/schema-que-desenha.spec.ts`, `fixtures/harness-entry.tsx` | alterado | casos corrigidos e novos; cena do modal |
| testes novos/ajustados (`variableOwners`, `identityFontControl`, `cardTokensQueDesenham`, `cartaoQueDesenha`, `toqueEMovimento`, `SarakTable.tableTokens`, `SarakModal.surfaceTokens`, `SarakTooltip.radiusToken`, `SarakButton`) e 7 snapshots | alterado | prova de cada achado |
| `docs/migracoes.md`, `docs/component-catalog.*`, `sarak-ui/**`, `sarak-dev/**`, `.agents/skills/ui-criar-tema/SKILL.md` | alterado | nota, gerados, texto |

**Verificações executadas**
- **Navegador, localmente:** o `dist/` do revisor está desatualizado em relação a esta correção, então montei uma cópia da árvore fora do repositório (`%TEMP%\s113\work`, `node_modules` por junção; só `tsup` + `tailwind`, sem rede e sem tocar o `dist/` real) e rodei `playwright` ali: **`schema-que-desenha.spec.ts` 24/24 verdes** (era 14 verdes, 10 vermelhos) e **o conjunto inteiro de `browser-tests/` 179/179** (rodada anterior à inclusão dos 3 casos do achado 5, que rodaram à parte: 3/3). Não rodei `npm run build` nem `cromo-css-real:check`, que são do revisor.
- `npx vitest run` (completo): 2978/2978 (462 arquivos), depois de atualizar 7 snapshots (só classe de botão, defaults e atributos dos tokens mexidos).
- `npx tsc --noEmit` → exit 0, sem saída. `check-audit-baseline.mjs --with-tsc` → "igual ao baseline… nenhuma regressão".
- Anel 1: `container-query`, `container-query-boundary`, `class-merge`, `icon-port`, `chrome-token-parity` (42/42), `zero-brand`, `barrel` (102), `catalog`, **`guide`** ("kit em dia (7 arquivos)"), `dev-kit`, `token-types` (407), `token-reader` (OK, `ALLOWLIST` vazia), `gate-limits` (43), `persistence-doc`, `public-types`, `kit-names`, `section-pointers`, `migration-anchor` → todos OK.
- Anel 0 simulado (padrões de `gates/scripts/segredo/config.json` sobre linhas adicionadas e não rastreados): 0 achados.

**Critérios de aceite**
- [x] Achados 1 a 8 — evidência acima, com teste que falha antes e passa depois (2, 3d, 4, 5, 6) e caso de mutação no gate (7).
- [x] Kit, catálogo e barril em dia (`guide:check`, `catalog:check`, `barrel:check`).
- [x] Casos de navegador relidos contra o que a cena monta e executados localmente.
- [ ] `npm run build` e `cromo-css-real:check` — motivo: sem rede; do revisor.

**Decisões e suposições**
- Critério de "cartão interativo" = superfície inteira alvo do ponteiro, marcada por atributo; `SarakActionCard`, `SarakSearchCard`, `SarakExpandableCard`, `SarakCoreCard` e `ManagementGroupCard` não são marcados (têm botão/campo dentro, ou não se moviam). O consumidor marca o seu com `<SarakCard interactive>`.
- `layerBackdropBlur`/`Opacity` saem (27 tokens fora no total; 434 → 407): nenhum componente lia o véu de camadas, e o véu real é `modalOverlayBlur`/`modalOverlayColor`.
- O padrão do tooltip passou a `var()` de tema; o verificador de contraste foi ensinado a resolvê-lo, e três blocos de tema receberam `tooltipTextColor` legível (efeito colateral declarado, não redesenho).
- Medi em cópia fora do repositório para não alterar o `dist/` do revisor; a cópia fica em `%TEMP%` e não é artefato do repositório.

**Achados fora do escopo (não corrigidos)**
- Outras variáveis com dois donos no schema (medido por `dupvars`): `--sarak-bg-base` (`colorBgBody`/`bgBaseColor`), `--sarak-btn-radius-tl/tr/bl/br` (`btnBorderRadius`/`btnRadiusTL…`), `--radius-theme` (`cardBorderRadius`/`borderRadius`), `--sarak-card-radius-tl/tr/bl/br` (`cardBorderRadius`/`cardRadiusTL…`), `--theme-border-width` (`cardBorderWidth`/`borderWidth`), `--theme-gap` (`cardPaddingMd`/`layoutGap`), `--theme-surface` (`surfaceColor`/`cardBackgroundColor`). Os de canto são mestre + exceção (o último vence), mas `--theme-surface`, `--theme-gap` e `--theme-border-width` são duas semânticas na mesma variável.
- `SarakDrawer`, `SarakHelpButton` e `SarakManagementGrid` leem `--sarak-modal-overlay-color` com fallback 0,5, e o token vale 0,4 no padrão: o 0,5 só aparece sem Provider.
- `.sarak-eco-mode`, `data-performance` e `data-perf-mode` (`_performance.css`): nenhum token os emite; só o consumidor escreve.
- A regra (i) do gate segue textual (limite 4): citação em string solta ou comentário de CSS conta.

**Pendências / riscos**
- `npm run build` e `cromo-css-real:check` são do revisor; o `dist/` presente no worktree é o do build anterior (não reflete esta correção).
- Os 14 temas passam a ver desenhar os tokens que já declaravam (`tooltip*`, `modalOverlayColor`, `borderStyle` nos cartões): a revisão visual deles é da plan-110.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-11 — 🔴 Reprovado

**Conferido no worktree:** suíte completa 460/460 arquivos, 2955/2955 testes; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 OK **exceto `guide:check`**; `token-reader:check` OK com `ALLOWLIST` vazia; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. `npm run build` **falha** (achado 1); o revisor montou o `dist/` com a mesma cadeia do `build` sem o `guide:check` e rodou `browser-tests/`: **164 verdes, 10 vermelhos**, todos casos novos de `schema-que-desenha.spec.ts` (achado 3).

**Achados:**

1. **Kit do consumidor defasado** — `sarak-ui/docs/migracoes.md` não foi regenerado depois da nota MAJOR em `docs/migracoes.md`: `guide:check` falha, o `build` para nele e o Anel 1 barra o commit. Rodar `npm run guide`. Critério violado: catálogo, kit e barril em dia.
2. **Hover que sobe em todo cartão no padrão** — `src/styles/_cards.css` (`[data-sx-card-hover-style="lift"] .sarak-card:hover`, com `cardHoverStyle` padrão `lift` e `cardHoverTranslate` padrão -4): todo `.sarak-card` passa a subir, inclusive superfícies que não são clicáveis — o painel inteiro do chat (`SarakChatEngine.tsx:62`, `SarakChat.tsx:45`), a `SarakExpandableMatrix`, `SarakCard` usado como contêiner de formulário. Subir no hover anuncia clique. Antes só os cartões que se movem por framer-motion (`SarakTitleCard`, `SarakImageCard`) subiam. O movimento de hover vale só para cartão interativo (o executor define o critério — clicável, com `onClick`/`href`/papel de botão, ou marcação explícita — e o mede); o cartão contêiner não se move. Critério violado: "todo leitor novo reproduz o desenho atual no valor padrão" (§3.2); a diferença não é inevitável.
3. **10 casos novos de navegador vermelhos** (`browser-tests/schema-que-desenha.spec.ts`), saída medida:
   - **Expectativa do padrão errada** — o harness roda o tema `sarak-sovereign`, que declara os tokens, não o padrão do schema: `:89` (`cardHeaderBg` esperado transparente, recebido `rgba(255, 255, 255, 0.03)`, que é `sarak-sovereign.ts:75`); `:147` (`cardActionBtnPadding` 16 × 12, `sarak-sovereign.ts:97`); `:193` (`tooltipRadius` 6 × 4, `sarak-sovereign.ts:107`). O "padrão" do teste tem de ser o que a cena de fato aplica.
   - **Modal aberto cobre as sondas** — `fixtures/harness-entry.tsx:546` monta `<SarakModal isOpen …>` na cena, e o overlay intercepta o `hover`: `:109`, `:121`, `:252`, `:312` estouram 4 min cada. O modal sai da cena de hover (ou vai para uma cena própria).
   - **Seletor ambíguo** — `:156`: `locator('input')` resolve 4 elementos (o campo e 3 switches); estreitar ao campo de busca.
   - **Provável defeito real, a confirmar pelo executor:** `:221` — com `tableBorderRadius: 0`, o cartão da tabela segue com 12px (o token responsivo `{ mob: 8, tab: 12, desk: 12 }` parece vencer o valor escalar do tema); `:296` — sob `reducedMotion: 'reduce'` o grão segue com `animation-duration: 2s` (a regra de `_atmosphere.css:130` não cede ao movimento reduzido), e a §2.2 pede que pare.
4. **Controle de fonte da marca inutilizável no painel** — `identityFontFamily` (`schema/branding.ts`) é `type: 'font'` sem nenhuma opção, e o `DynamicTokenControl` o desenha como `SelectControl` com a lista de `constraints.options` (vazia); o padrão novo é uma expressão `var(…)`. O controle precisa oferecer as fontes que os outros tokens de fonte oferecem e um item para o padrão (herdar a fonte de títulos), marcado quando o valor é o padrão. Critério violado: o schema que o painel oferece desenha.
5. **Token lido no CSS, ignorado pelo componente** (do resumo do executor, mesma classe de defeito desta plan): `SarakModal` não lê `modalOverlayColor`; `SarakTooltip` ignora `tooltipBg` e os demais tokens de cor do tooltip; `borderStyle` não vale nos cartões por causa do `!important` de `[data-sx-border-type="solid"]`/`.sarak-design-scope .sarak-card`. Cada um desenha no componente, com teste.
6. **Dois tokens escrevem a mesma variável** — `cardBackdropBlur.cssVars` inclui `--sarak-glass-blur`, que `glassBlur` também emite: vence o último na ordem de emissão. Uma variável tem um dono.
7. **Brecha do gate** (limite 11 do próprio executor) — a regra (i) casa `var(--x` por prefixo: `--sarak-layout` contava como lida por causa de `--sarak-layout-gap-*`. Ancorar o nome (o caractere seguinte não pode continuar o identificador), com caso de mutação no teste do gate.
8. **Texto desatualizado** — `.agents/skills/ui-criar-tema/SKILL.md:112` cita `easeMain`, que saiu do schema.

Os demais achados fora do escopo do resumo (atributos `data-perf-mode`/`data-performance` que só o consumidor escreve; `--layer-backdrop-*` sem leitor; extras de `cardHoverStyle` em `types.ts:66`) entram na mesma correção se forem leitura morta da própria lib; se forem contrato público do consumidor, ficam registrados no resumo com o motivo.

## Veredito — 2026-10-12 (rodada 2) — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK (com `guide:check`); `playwright test` sobre esse `dist/`: **179/179**, com os 24 casos de `schema-que-desenha.spec.ts` (inclusive os de hover nos três valores de `cardHoverStyle` e no contêiner, e os três do achado 5); suíte completa 2978/2978; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK (`guide` incluído); `token-reader:check` OK com `ALLOWLIST` vazia; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Os 8 achados da rodada 1 estão fechados como o resumo descreve; o critério de cartão interativo (`data-sx-card-interactive`, prop `interactive` aditiva no `SarakCard`) está no CSS e no componente.

**Registrado para decisão do dono (não bloqueia):** o executor mediu outras 7 variáveis com dois donos no schema (`--sarak-bg-base`, `--sarak-btn-radius-*`, `--radius-theme`, `--sarak-card-radius-*`, `--theme-border-width`, `--theme-gap`, `--theme-surface`). As de canto são mestre + exceção; `--theme-surface`, `--theme-gap` e `--theme-border-width` são duas semânticas na mesma variável.
