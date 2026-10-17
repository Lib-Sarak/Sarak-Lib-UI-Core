---
tipo: "anexo"
titulo: "plan-110 — Critério estético × funcional e o que \"carrega modo\" (decisões por token)"
dominio: "Design Engine / Contrato de tokens"
status: "🟡 Em construção (um bloco por lote de análise)"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]"]
---

# 0. Para que serve

A `plan-110` grava no próprio schema, token a token, `kind` (estético | funcional), `modeDependent` e `usage`. O
**mapa** é o schema; este anexo guarda só o **critério** e o **porquê das decisões que não são óbvias**. A lista de
tokens e o `usage` de cada um não são copiados aqui (R17): a fonte é `src/core/Design/schema/` e o apêndice A.4b do
`GUIA-FRONTEND.md` do kit.

# 1. O critério

| Pergunta | Se a resposta é sim |
|---|---|
| O valor precisa ser **igual em todo tema** por **segurança**, **acessibilidade** ou **consistência de comportamento**? (camadas, alvo de toque, larguras mínimas e máximas de superfícies de uso, posições e larguras do cromo, breakpoints, comportamento) | **funcional**: o tema embarcado não o declara; vale o padrão do sistema |
| Ele existe só para o **painel de customização** (pré-visualização, moldura de dispositivo, tela de exemplo)? | **funcional**: nunca é parte de um tema |
| Ele escolhe **qual componente** a lib desenha, e não como ele se parece? | **funcional** |
| Senão: cor, elevação, textura, tipografia, geometria visual, densidade visual, movimento | **estético**: todo tema embarcado o projeta |

## 1.1 `modeDependent`: o que carrega modo

Um token **carrega modo** quando o valor *certo* muda ao inverter a luminosidade do fundo, e por isso entra na
`contraparte`. Os que não carregam são herdados do modo principal **de propósito**: é o que preserva a identidade do
tema entre claro e escuro.

| Carrega modo (`true`) | Não carrega (`false`) |
|---|---|
| toda **cor** de texto, fundo, borda, realce e halo | geometria (raio, espessura, deslocamento, desfoque, expansão da sombra) |
| **opacidade** de superfície, de borda e de textura (o mesmo número lê diferente sobre fundo claro e escuro) | tipografia (tamanho, peso, espaçamento de letras) |
| **opacidade e cor** da sombra e do brilho; sombra escrita à mão (`cardShadow`) | movimento e comportamento |
| véu e vinheta | tipo de textura, estilo, posição, direção, alinhamento |

# 2. Decisões não óbvias (lote 1: cartões, sobreposições, tabelas)

| Token(s) | Decisão | Motivo |
|---|---|---|
| `cardVariant` | funcional | escolhe o cartão que a `SarakCardGrid` desenha (e, com ele, quais famílias de token valem); não é estilo. O tema o declara `classic` e deve continuar |
| `modalWidth*`, `toastMinWidth`/`toastMaxWidth`, `contextMenuMinWidth` | funcional | são tamanhos nomeados e pisos de usabilidade (alvo de clique, linha de texto legível); o importador dimensiona o conteúdo contando com eles |
| `modalActionAlignment`, `modalHeaderStyle` | **estético** | mudam a *disposição* do diálogo, não o comportamento: o botão de fechar e as ações continuam alcançáveis e rotulados em qualquer valor |
| `catalogFilterMinWidth`, `matrixNodeMinWidth`, `managementGroupListMaxHeight` | funcional | pisos e tetos de uso (filtro utilizável em contêiner estreito, nó legível, rolagem da lista), não identidade |
| `catalogSectionRadius`, `catalogItemRadius` | estético | arredondamento é geometria visual, mesmo sendo de um componente só |
| `tableDensity`, `tableCellPadding`, `kanban*` | estético | densidade visual é eixo do tema (`axis: density`) |
| `preset*`, `device*`, `controlHeightToggle`, `progressBarMaxWidth` | funcional | só o painel de customização os lê; nenhum componente do sistema muda. O gate de leitor (`PANEL_OWN_TOKENS`) já os trata como "do painel" |
| `cardSurfaceOpacity`, `cardBorderOpacity`, `cardTextureOpacity` | carrega modo | ver 1.1: é a regra de opacidade |
| `cardShadowSpread` | carrega modo; `cardShadowOffsetX/Y`, `cardShadowBlur`, `cardShadowExpansion` não | a *força* da sombra depende do fundo; a *forma* (dura × macia) é identidade |
| `tableZebraStriping` | não carrega | ligar ou desligar é estrutura; o tom da listra já vem da cor do tema |

# 3. Como cada token foi aberto (método do lote)

1. **Leitor no código**: busca por `--sarak-<kebab>`, pelas `cssVars` e pelo id em `src/` (sem testes, schema, presets,
   catálogo e gerados), e leitura do arquivo que consome.
2. **Efeito no navegador**: cena única, montada de `src/` (não do `dist/`), com um exemplar de cada componente dos
   seis grupos. Para cada token, a cena é aberta com o valor-padrão e com cada valor extremo (ou opção), e o estilo
   computado de **todos** os elementos (e dos pseudoelementos com `content`) é comparado, em repouso, sob o
   ponteiro, com foco e com o botão pressionado. O que mudou, e em qual componente, é o que o `usage` diz.
3. **Dependência**: um token que só muda algo com outro (opacidade da textura × tipo de textura) é medido com o
   outro ligado, e o par entra em `interactsWith`.

# 4. Tokens sem efeito visível (vão para o resumo como achado, não são documentados)

Medidos nos dois métodos acima (leitor e navegador). Ficam na lista de exceção do gate com o rótulo `achado-lote-1`.

| Token | O que se mediu |
|---|---|
| `cardSpotlightOpacity` | os quatro cartões escrevem `data-spotlight` e uma camada `.spotlight-effect`, mas nenhuma regra CSS lê o atributo, a classe nem `--spotlight-opacity`: o valor muda um atributo, nenhum pixel |
| `borderBeamEnabled`, `cardSearchBorderBeamActive` | a camada `.border-beam-effect` existe e `@keyframes beam-rotate` também, mas nenhuma regra desenha a classe nem lê `--beam-angle`: ligar ou desligar acrescenta ou remove um `<div>` vazio |
| `cardActionClickScale` | `SarakActionCard` calcula `clickScale` e não o usa; o botão de ação não tem `whileTap` com o valor |
| `cardContentAlignment` | só o `getCardStyles` de `useStructuralStyles` o lê, e nenhum componente chama `getCardStyles` |
| `imageCardHoverZoom` | o `whileHover` está na camada da imagem, mas o véu e o conteúdo, irmãos mais acima, recebem o ponteiro: a camada nunca é "hovered", e a escala medida ao passar o ponteiro em três pontos do cartão é `none` |
| `tableActionPosition` | `useTableLayoutStyles` calcula `actionColumnAlignmentClass` e nenhum componente o consome; a `SarakTable` não tem coluna de ação |

Parcial, e documentado como tal: `cardImagePosition` só muda algo com `cardLayoutDirection` em linha e o valor da
direita (inverte a ordem dos blocos); `left`, `top` e `none` não mudam nada, e o ramo de `getCardStyles` é morto.

## 4.1 Desfecho (plan-117, lote 1 — 2026-10-15)

Três dos sete deixaram de ser achado: passaram a desenhar, foram medidos em navegador (valor padrão × extremo, em
repouso, sob o ponteiro e pressionado) e saíram da exceção `achado-lote-1`.

| Token | O que desenha agora | Medido |
|---|---|---|
| `cardSpotlightOpacity` | gradiente radial da primária do tema, com a opacidade do token, centrado onde o ponteiro está nos quatro cartões; 0 não desenha nem registra listener | `cartao-que-se-move.spec.ts` |
| `cardActionClickScale` | o botão de ação encolhe até a escala do token enquanto pressionado (propriedade `scale`; o aperto de elemento e o do átomo deixam de somar) | idem |
| `imageCardHoverZoom` | o hover vive na raiz do `SarakImageCard` e desce à camada da imagem por variante: o zoom vale com o ponteiro sobre o cartão inteiro | idem |

Mais dois deixaram de ser achado no lote 2 da plan-117: passaram a desenhar, foram medidos em navegador (ligado ×
desligado, em repouso e com o campo em foco) e saíram da exceção `achado-lote-1`.

| Token | O que desenha agora | Medido |
|---|---|---|
| `borderBeamEnabled` | anel de gradiente cônico na primária que gira (`--beam-angle`), mascarado para a borda, com o raio do cartão; desligado, a camada é `display: none` e nenhuma animação roda | `cartao-que-se-move.spec.ts` |
| `cardSearchBorderBeamActive` | o mesmo anel no `SarakSearchCard`, só com o campo em foco | idem |

Ficam abertos, para o lote 3 da plan-117: `cardContentAlignment` e `tableActionPosition`.

Os dois últimos saíram do schema no lote 3 da plan-117 (2026-10-16): fora das partições do catálogo, do mapeamento de
tema e dos tipos gerados (400 tokens), com entrada em `REMOVED_TOKEN_KEYS` — o tema salvo com a chave carrega, com
aviso, e a chave é descartada. O código morto que os lia também saiu (`getCardStyles` em `useStructuralStyles`,
`actionColumnAlignmentClass` em `useTableLayoutStyles`), e com ele o ramo morto de `cardImagePosition`, que fica só
com o leitor `useCardLayoutStyles`.

| Token | Desfecho |
|---|---|
| `cardContentAlignment` | retirado — redundante com `cardTextAlign`, que já distribui o conteúdo |
| `tableActionPosition` | retirado — a `SarakTable` não tem coluna de ações |

A exceção `achado-lote-1` do gate de documentação ficou vazia: dos sete, cinco desenham e dois saíram.

Na correção do lote 3 (2026-10-16) saiu também `cardImagePosition`, o "parcial" desta seção: sem o `getCardStyles`
morto, a opção `top` (o padrão) ficou sem leitor e o `token-reader` acusou. Só `right` com `cardLayoutDirection` em
linha mudava algo (invertia a ordem dos blocos). Saiu do schema, das partições, do mapeamento e dos tipos (399 tokens),
com entrada em `REMOVED_TOKEN_KEYS`; o `useCardLayoutStyles` passou a desenhar a direção em linha sempre como
`flex-row`. Quem invertia a ordem usa o `className` do cartão (`flex-row-reverse`).

| Token | Desfecho |
|---|---|
| `cardImagePosition` | retirado — só um valor, numa combinação, mudava a tela; a ordem dos blocos é do `className` |

# 5. Decisões não óbvias (lote 2: tipografia, controles, cor, dados, chat e status)

| Token(s) | Decisão | Motivo |
|---|---|---|
| `buttonIconPosition`, `buttonWidthStrategy`, `inputIconPosition`, `inputPadding` | funcional | posição e largura dos controles não devem mudar ao trocar o tema; o respiro vertical também preserva a área de toque do campo. |
| `multiSelectInputMinWidth`, `chatAttachmentNameMaxWidth`, `chatTokenSliderMinWidth` | funcional | são limites de uso que evitam que tags, nomes de arquivo ou o controle de tokens quebrem o layout. |
| `chartType`, `chartThickness`, `chartSmoothing` | estético | descrevem a apresentação padrão; `SarakChartEngine` aceita `type` para o consumidor preservar a forma adequada aos dados. Espessura e suavização só valem para tipos compatíveis. |
| `textGlowIntensity` | carrega modo | acompanha o halo do título, cuja força precisa ser calibrada para a luminosidade de cada contraparte. |
| Tokens de halo, vidro, textura e grade | `interactsWith` | o halo neon e o desfoque dependem do estilo de botão, o vidro e o pulso dependem do estilo de alternador, as cores de textura dependem de uma textura ativa, e a opacidade da grade só aparece com a grade ligada. |

# 6. Decisões não óbvias (lote 3: fundo, movimento, camadas, especializados, rolagem, avançados e mídia)

Todos os tokens foram abertos no leitor e medidos em navegador por diferença de estilo computado (cena de `src/`,
Chromium 153): o que cada valor mudou está no resumo do lote.

| Token(s) | Decisão | Motivo |
|---|---|---|
| `zIndex*` (5), `touchTargetMin`, `focusRingWidth`, `reducedMotion`, `animEnabled` | funcional | escada de camadas, alvo de toque, anel de foco, movimento reduzido e liga/desliga da transição são segurança, acessibilidade ou comportamento: iguais em todo tema |
| `chartEngineMinHeight`, `engineMinHeightLg/Sm`, `skeletonRowHeight`, `skeletonCircleSize`, `flowHandleSize` | funcional | pisos de layout e alvo de arraste; os dois do esqueleto devem imitar o conteúdo do host, não a identidade do tema |
| `designEngineSidebarMin/MaxWidth`, `layoutPreviewMaxH` | funcional | só o painel de customização os lê (medidos no painel aberto: largura da barra e altura do bloco de JSON) |
| `motion*`, `pageTransitionType`, `cardHoverStyle` | estético | o ritmo e o efeito são identidade do tema; a contraparte os herda do modo principal |
| `textureOpacity`, `bgNoiseDensity`, `glassOpacity`, `glassSpecularity`, `shadow*Alpha`, `layeredShadows`, `shadowIntensity`, `vignetteOpacity`, `surfaceIntensity`, `globalBackgroundOpacity` | carrega modo | regra de opacidade (1.1): o mesmo número lê diferente sobre fundo claro e escuro |
| `shadowColorMode`, `shadowOrientation`, `borderType`, `systemTone`, `texture` | não carrega | escolha de estilo, não de cor |
| `globalBackgroundImageUrl` | carrega modo | a imagem certa muda com a luminosidade do fundo |

## 6.1 Medido e diferente do que o schema dizia

| Token | O que o navegador mostrou |
|---|---|
| `globalSaturation`, `globalContrast` | filtram só o pseudoelemento da textura (`html::before`), não a interface; sem textura nada muda |
| `bgNoiseDensity` | regula só a camada fixa de grão (`NoiseOverlay`); a opacidade do padrão `texture: noise` continua `textureOpacity` |
| `motionEaseOut` | alcança o pulso do alternador pulsante e o aperto de um botão HTML sem classe; o `SarakButton` mantém a própria curva |
| `vignette*` | só existem com textura diferente de `none` (a vinheta é o `::after` do elemento com textura) |

## 6.2 Tokens sem efeito visível (achados, não documentados)

Ficam na lista de exceção do gate com o rótulo `achado-lote-3`.

| Token | O que se mediu |
|---|---|
| `motionEaseIn` | a saída de `SarakModal`, `SarakSearch` e do véu da `SarakDrawer` nunca toca a curva: modal e busca retornam `null` ao fechar (o `AnimatePresence` é desmontado junto) e somem em ~10–30 ms com qualquer curva; o véu da gaveta anima só `duration` |
| `matrixGap` | `SarakExpandableMatrix` escreve `--matrix-gap`, mas nenhuma regra lê `--matrix-gap`; o espaçamento da matriz vem de `--sarak-layout-gap-md` (medido com 3 papéis: `gap` não muda com 12 → 32) |

## 7. Desfecho (plan-117, lote 4 — 2026-10-17)

Os sete tokens foram medidos em cena montada de `src/`, com Chromium e comparação de estilo computado; os quatro tipos
de gráfico foram conferidos com `canvas` e sem erros de console:

| Token | O que a tela mostra agora | Medido |
|---|---|---|
| `actionGlowShadowOffsetY` | desloca a sombra do botão da categoria selecionada no `SarakCatalogGrid`; o inline sobrevive ao estilo `matte` do `SarakButton`, e o alfa de 5% deixa o efeito discreto | `arsenal-lote4.spec.ts` |
| `actionGlowShadowBlur` | altera o desfoque da mesma sombra selecionada | idem |
| `actionGlowShadowSpread` | altera o espalhamento da mesma sombra selecionada | idem |
| `colorDepth` | altera o hover e o pressionado global de `button` via `--theme-primary-hover`/`--theme-primary-active` | idem |
| `colorVariation` | altera a matiz das variantes de hover/pressionado consumidas pelos estados globais de `button` | idem |
| `chartType` | os tipos `area`, `bar`, `pie`, `scatter`, `gauge`, `radar` e `heatmap` renderizam; radar usa tooltip por item e heatmap tem dois eixos categoria | idem |
| `rangeActiveColor` | pinta o trilho ativo, os dois polegares e as dicas de valor do `SarakRangeSlider` | idem |

# 7. Decisões não óbvias (lote 4: global, marca, layout, navegação, estruturais e preferências)

Os 79 tokens foram abertos no leitor e medidos em navegador (cena de `src/`, Chromium 153, cromo lateral e do topo,
viewport de celular, preferência do usuário ligada pela porta pública `useSarakPreferences`).

| Token(s) | Decisão | Motivo |
|---|---|---|
| `navigationStyle`, `mobileNavigationStyle`, `sidebarPosition`, `navbarLayout`, `isNavHidden`, `isSplitViewEnabled`, `isAutoHideEnabled` | funcional | posição e comportamento do cromo (§1): iguais em todo tema; a preferência do usuário vence o tema |
| `sidebarWidth`/`MinWidth`/`MaxWidth`, `topbarHeight`/`CollapsedHeight`, `*LabelMaxWidth`, `shellBrandLogoSize`, `brandLogoSizeCollapsed`, `searchDropdown*`, `searchPosition*` | funcional | larguras e posições do cromo |
| `chrome*Position`, `preference*Position` | funcional | posição de cada widget: decisão do administrador, não identidade do tema |
| `breakpointTablet`/`Desktop` | funcional | breakpoints |
| `layoutGridTemplate`, `layoutGridMinCell`, `globalFlow*`, `formLabelPosition`, `switchLabelPosition`, `splitPaneMinWidth` | funcional | estrutura e posição dos controles: não devem mudar ao trocar o tema |
| `layoutDensity`, `layoutPadding`, `layoutGap*`, `globalSectionGap`, `maxContentWidth`, `tabGap`, `tabSectionMargin`, `formFieldDensity`, `bodySize` | estético | densidade visual (eixo `density`) |
| `borderRadius`, `borderWidth`, `borderStyle`, `icon*`, `identity*`, `headerAlignment` | estético | geometria, ícone e identidade; a contraparte os herda do modo principal |
| `sidebarColor`/`HoverColor`/`ActiveColor`, `topbar*Color`, `nav*Color`, `*NoiseOpacity`, `sidebarShadow` | carrega modo | cor, opacidade e sombra escrita à mão (1.1) |
| `sidebarBlur`, `navActiveMarkerGlow` | não carrega | geometria do efeito |
| `mode` | estético, não carrega | declara o modo nativo de cada tema; é o eixo da contraparte, não parte dela |

## 7.1 Medido e diferente do que o schema dizia

| Token | O que o navegador mostrou |
|---|---|
| `mode` | em `config` (com ou sem tema carregado) muda só o ícone do alternador, `--sarak-mode` e a vinheta; a paleta inverte pela preferência `colorMode` (medido: `config` claro + preferência escura = escuro; preferência clara = claro) |
| `searchPositionTopbar: center` | igual a `left` com itens de navegação (o `flex-1` da navegação ocupa o espaço); sem itens desloca ~12 px |
| `borderRadius: 0` | o `SarakAccordion` o trata como ausente (`||`) e mantém 12 px; 2 e 30 funcionam |
| `iconStrokeWidth` | só Lucide e Tabler (stroke-width 3 → 1,5/4,5 px e 2,5 → 1,25/3,75 px); Phosphor ignora |
| `switchLabelPosition` | só o `SarakSwitch`; `SarakCheckbox` e `SarakRadio` não mudam |

## 7.2 Tokens sem efeito visível (achados, não documentados)

Ficam na lista de exceção do gate com o rótulo `achado-lote-4`.

| Token | O que se mediu |
|---|---|
| `contentAlignment` | `center` acrescenta `max-w-7xl mx-auto w-full px-*` (`chromeStructuralStyles.ts:37`) ao mesmo elemento que recebe, em linha, `max-width`, `margin-inline: auto`, `width: 100%` e `padding` (`resolveChromeContentStyle`); o estilo em linha vence: nenhuma propriedade muda, na lateral e no topo, com `maxContentWidth` de 1000 px |
| `sidebarCollapsedWidth` | a lateral recolhida mede 200 px (`sidebarMinWidth`) com 74 e com 100; com `sidebarMinWidth: 150` mede 150. O token aceita 48 a 100 px e o piso (150 a 400 px, `ChromeSidebarBody.tsx:111`) sempre vence |

## 8. Desfecho (plan-117, lote 5 — 2026-10-17)

Medido em Chromium, por estilo computado, num build de `src/` feito fora do repositório (`browser-tests/arsenal-lote5.spec.ts`):

| Token | O que a tela mostra agora | Medido |
|---|---|---|
| `motionEaseIn` | a causa era o `AnimatePresence` dentro do `if (isOpen)`: o `SarakModal` e a `SarakSearch` saíam da página no mesmo quadro. Agora permanecem durante a saída (`motionDurationFast`; 0 sob movimento reduzido), a curva do token governa a opacidade e o painel não segura o ponteiro. O véu da gaveta (`SarakScrim`) também lê o token, mas a `SarakDrawer` anima por `animate` e não por `exit`: segue sem tocar a curva (achado, fora do lote) | opacidade a 250 ms de uma saída de 500 ms, curva de fábrica × `cubic-bezier(0, 1, 0, 1)`: 0,84 × 0,09 no modal e 0,82 × 0,04 na paleta |
| `matrixGap` | é o espaço entre os sub-itens da matriz dentro de cada linha aberta (`row-gap` 12 → 28 px); os filhos aninhados de um sub-item têm o espaçamento próprio | `row-gap` do contêiner dos sub-itens |
| `sidebarCollapsedWidth` | a lateral recolhida mede o token (74 e 96 px); o piso de `sidebarMinWidth` vale só aberta | largura do `aside` |
| `borderRadius` | `0` escalar deixa os cantos do acordeão retos (a forma responsiva `{mob,tab,desk}` segue sem raio algum no acordeão: achado, fora do lote) | `border-top-left-radius` |
| `switchLabelPosition` | declarado só do `SarakSwitch` (descrição do schema e partição do catálogo corrigidas); ligar no `SarakCheckbox`/`SarakRadio` mudaria o alinhamento padrão deles (`items-start` → `items-center`) | — |

## 9. Desfecho (plan-117, lote 6 — 2026-10-17)

Medido em Chromium, por geometria e estilo computados, num build de `src/` feito fora do repositório (`browser-tests/arsenal-lote6.spec.ts`):

| Token | O que a tela mostra agora | Medido |
|---|---|---|
| `contentAlignment` | retirado do schema: nunca mudou a tela (a classe perdia para o estilo em linha, e `maxContentWidth` já limita e centraliza); a chave salva cai no padrão com aviso | `main` sem `max-w-7xl`, mesma largura máxima, aviso no console |
| `searchPositionTopbar: center` | a busca vem depois da navegação, no meio do espaço livre entre ela e o grupo final (não no centro geométrico da barra) | ponto médio da busca = ponto médio do vão (±3 px); `left` × `center` deslocam a busca em mais de 100 px |
| `borderRadius` (forma responsiva) | o acordeão resolve a camada do dispositivo | 3 px (390), 7 px (900) e 11 px (1280) com `{ mob: 3, tab: 7, desk: 11 }` |
