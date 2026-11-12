---
tipo: "anexo"
titulo: "Plan-162, lote 0 — mapa de tokens dos sete temas antigos e as propostas 0.2 a 0.6"
dominio: "Design Engine / Catálogo de temas"
status: "🟠 Em revisão"
tags: ["anexo", "temas", "resgate", "plan-162"]
relacionados: ["[[plan-162-resgatar-temas-antigos-como-temas-novos]]", "[[09-temas-e-presets]]", "[[024-paleta-calculada-separada-do-tema]]"]
---

# 0. O que este anexo é e como foi medido

Documento do **lote 0** da plan-162: nenhum arquivo de tema foi criado e nenhum tema atual foi tocado. Tudo abaixo sai de medida sobre três fontes:

- o **original**, de dois jeitos que coincidem: `git show 7c4dbaed:src/core/Design/presets/themes/<id-antigo>.ts` e os sete JSONs de `specs/plan/anexos/plan-162-temas-antigos/`. Comparados chave a chave por script, **os dois são idênticos nos sete temas** (0 chaves que diferem): o painel do Novo aplicou exatamente o que o arquivo declara, e nenhum dos sete tem `contraparte`;
- o **schema vivo**: `sarakGetAllDesignTokens()` (424 tokens: **339 estéticos, 85 funcionais**, 0 sem `kind`), `REMOVED_TOKEN_KEYS`, `PALETTE_ROLE_MAP` (92 papéis de cor que a paleta calcula) e `auditTokenContract`, a mesma função que o gate de contrato usa;
- as **fotos** de `C:\tmp\sarak-temas-antigos\` e o catálogo atual (`SARAK_ALL_THEMES`, 19 temas).

Os scripts que geraram os números estão fora do repositório (diretório de rascunho da sessão) e são reproduzíveis: o que cada um faz está dito na seção que usa o número. Data das medidas: 2026-11-11, no `HEAD` `f5b3c7e7` com o worktree sujo por outras tarefas (nenhuma delas toca tema).

# 1. O achado que muda a pergunta: o que o dono viu não é o que o código dos originais pretendia

Todos os sete originais declaram `mode: dark` e `colorBgBody` quase preto (`#050505`, ou `#05030a` no Retro-Wave). Em dois deles isso contradiz o resto do próprio arquivo:

| Tema | O arquivo declara | O que o Novo mostrou na foto |
|---|---|---|
| **Nature Breeze** | `bgBaseColor #f4fbf7`, `surfaceColor #e8f5e9`, `textColorMaster #1b5e20`, cartão branco translúcido, sombra verde suave, cantos de 32 px, **mas** `mode: dark` e `colorBgBody #050505` | tela **escura**; títulos em Lora; verde só no item ativo, na aba e no marcador. Os valores claros não aparecem |
| **Neo Brutalism** | `bgBaseColor #f0f0f0`, `surfaceColor #fff`, `textColorMaster #000`, `cardShadow 8px 8px 0 #000`, **mas** `mode: dark` e `colorBgBody #050505` | tela **escura**, vermelho `#ff0000` só no item ativo e na aba; a sombra preta dura some sobre o fundo preto |

Os outros cinco são coerentes: o que o arquivo declara é o que a foto mostra (escuro, cor viva sobre preto).

**Consequência:** "o mais próximo possível do original" tem dois alvos possíveis para esses dois temas, a **aparência** (escura, a foto) ou a **intenção** (clara, o código). Como o modo é preferência do usuário e todo tema novo carrega os dois modos, a proposta (decisão D1 na §9) é **não escolher um**: o modo nativo é o da intenção autorada, e o outro modo reproduz a foto. Nos cinco coerentes, o nativo é o escuro e a contraparte clara é desenho novo (§6).

# 2. Resumo por tema (contagens medidas)

| | Sovereign | Cyberpunk | Industrial | Nature | Neo Brutalism | Dot Matrix | Retro-Wave |
|---|---|---|---|---|---|---|---|
| Chaves no original | 269 | 259 | 269 | 260 | 260 | 268 | 268 |
| Estéticas que existem hoje | 214 | 214 | 215 | 215 | 215 | 224 | 224 |
| Dessas, as que a paleta calcula (`PALETTE_ROLE_MAP`) | 66 | 66 | 66 | 66 | 66 | 69 | 69 |
| Removidas do schema (`REMOVED_TOKEN_KEYS`) | 23 | 23 | 23 | 23 | 23 | 24 | 24 |
| Funcionais (o tema não declara, §5.3) | 17 | 17 | 17 | 17 | 17 | 19 | 19 |
| Desconhecidas (branding, legado, payload) | 15 | 5 | 14 | 5 | 5 | 1 | 1 |
| Estéticos de hoje que o original **não tinha** | 125 | 125 | 124 | 124 | 124 | 115 | 115 |
| Desses, cobertos pela paleta | 26 | 26 | 26 | 26 | 26 | 23 | 23 |
| **Novos a declarar no tema** | **99** | **99** | **98** | **98** | **98** | **92** | **92** |

(Um estético que a paleta calcula não é cobrado do tema, 09 §5.3; o `theme-completeness:check` cobra os demais.)

# 3. O mapa

## 3.1 Tokens removidos: de onde vêm e para onde vão

Idêntico nos sete (o Dot Matrix e o Retro-Wave têm ainda `globalBackgroundBlendMode`). O destino vem de `removedTokenKeys.ts`, de `docs/migracoes.md` (`## 8.0.0`) e de conferir que o JSON original já traz o token sucessor com o mesmo valor.

| Token do original | Destino | Observação |
|---|---|---|
| `animInstant`, `animFast`, `animNormal`, `animSlow` | `motionDurationInstant/Fast/Normal/Slow` | o original já declara os `motion*` (em segundos); o tema novo usa só eles |
| `easeMain`, `easeOut` | `motionEaseMain`, `motionEaseOut` | idem |
| `atmosphereNoiseOpacity`, `noiseIntensity` | `bgNoiseDensity` | o original já declara `bgNoiseDensity` |
| `contrastCurve` | `globalContrast` | o original já declara |
| `scrollbarWidth`, `scrollbarThumbColor` | `scrollWidth`, `scrollThumbColor` | idem |
| `borderRadiusSm/Md/Lg` | `borderRadius` e os raios por componente | o original usa `borderRadius` 12 (4 no Dot Matrix) e os raios de cartão/botão/campo; nada se perde |
| `layerBackdropBlur`, `layerBackdropOpacity` | `modalOverlayBlur`, `modalOverlayColor` | os dois já existem no original |
| `layerElevationFactor` | `layeredShadows` | já existe |
| `matrixSearchBg` | tokens de campo (`inputBg`) | já existe |
| `identityRedirectUrl`, `industrialRegistry`, `aiPanelBg`, `securityShieldGlow`, `securityPulseSpeed` | **sem destino** | saíram do schema sem substituto |
| `globalBackgroundBlendMode` (Dot Matrix e Retro-Wave) | **sem destino** | o valor era `normal`; nada a preservar |

## 3.2 Chaves desconhecidas hoje

| Chave | Valor no original | Destino |
|---|---|---|
| `systemName`, `logoUrl`, `logoMinimalUrl`, `logoScale` | `Sarak OS`, vazios, `100` | **não entram em tema**: identidade do host (zero marca, ADR-006) |
| `layout` | `grid` | chave aceita do payload, não token; não é declarada |
| `colorPrimary`, `colorSecondary`, `colorSurface`, `fontHeading`, `radiusTheme`, `buttonRadius`, `cardRadius`, `themeGap`, `motionSpeedBase`, `pageTransition` (só Sovereign e Industrial) | valores que repetem tokens atuais (`primaryColor`, `headingFont`, `borderRadius`…) | aliases legados do painel antigo; o destino é o token atual, que o original já declara. `pageTransition: fade` alimenta `pageTransitionType` na §3.5 |

## 3.3 Funcionais: o que o original mostrava e o tema novo não pode declarar

O tema embarcado **não declara** funcional (09 §5.3). Onde o original usava um deles para a identidade, a diferença é **inevitável** e fica nomeada:

| Funcional no original | Tema | Efeito visível que se perde |
|---|---|---|
| `navigationStyle: topbar` | Neo Brutalism | a foto mostra a navegação no topo; o tema novo vale o padrão do consumidor (e a preferência do usuário). A identidade de barra passa a ser dada por `topbarTone`, `topbarActiveItemStyle` etc., que valem nas duas orientações |
| `sidebarWidth: 320` | Industrial Terminal | lateral larga de painel de máquina; vale a largura padrão do sistema |
| `sidebarWidth: 260`, `layoutPadding`/`layoutGap` altos | Dot Matrix | `layoutGap 48` e `layoutPadding 64` são estéticos e entram; a largura 260 é funcional e não |
| `animEnabled`, `reducedMotion`, `zIndex*`, `focusRingWidth`, `isNavHidden`, `isSplitViewEnabled`, `isAutoHideEnabled`, `topbarHeight`, `sidebarMin/MaxWidth`, `cardVariant`, `searchPositionTopbar/Sidebar` | todos | iguais ao padrão do sistema; sem perda de identidade |
| "sem animação" do Industrial (`motionDurationNormal: 0`) | Industrial Terminal | **não** se perde: é estético (`motionDuration*` em 0), e o tema novo o mantém |

## 3.4 Valores do original que o contrato atual recusa, e a correção

Medido com `auditTokenContract` sobre cada JSON. **Todo tema tem** `colorPalette` (valores `default`/`vibrant`, ids de paleta antigos que viraram só texto) e `systemTone: dark` (opção que saiu): os dois são substituídos (§4 e a linha abaixo).

| Token | Valor antigo | Valor no tema novo | Temas |
|---|---|---|---|
| `colorPalette` | `default`, `vibrant` | `custom:<tipo>:<base>,sec=,acc=` com as sementes do original (§4) | os sete |
| `systemTone` | `dark` | `none` (padrão; `dark`/`light` saíram, `docs/migracoes.md`) | os sete |
| `btnStyleType` | `solid`, `outline` | `matte` (chapado) e `cyberpunk` (wireframe); o schema só aceita `matte`, `neon`, `frosted`, `borderline`, `cyberpunk`, `neumorphism` | Industrial, Nature Breeze e Neo Brutalism (`solid`); Cyberpunk (`outline`) |
| `bodySize` | `13px` | `14px` (opções: 12/14/16/18/20); a compacidade do Industrial vem de `layoutDensity: compact` | Industrial |
| `surfaceMaterial` | `solid` | `industrial` (opções: `frosted`, `sleek`, `industrial`, `organic`) | Industrial |
| `colorVariation` | `0` | `1` (faixa 1 a 5) | Industrial |
| `btnBorderRadius` | `999` | `120` (teto do token; já maior que a metade da altura, vira pílula) | Nature Breeze |
| `sidebarNoiseOpacity`, `topbarNoiseOpacity` | `0.02` | `0.05` ou `0` (grade de 0,05) | Dot Matrix |
| `searchPositionSidebar` | `none` | **não declarar**: é funcional (a posição da busca vale o padrão do sistema); o valor `none` também saiu das opções | Dot Matrix |
| `switchStyleType` | `flat` | `tactile` (opções: `tactile`, `asymmetric`, `pulsing`, `glass`) | Dot Matrix |
| `maxContentWidth` | `1440px` (Industrial `1600px`, Dot Matrix `1000px`) | `fluid` (09 §5.3: todo embarcado declara) | os sete |
| `headingFont`, `bodyFont` | `"Lora", serif` (aspas duplas) | `'Lora', serif` (o `value` exato de `THEME_FONTS`; aspas duplas passam na validação mas o arquivo de fonte não carrega) | Cyberpunk, Nature, Neo Brutalism |
| `btnPrimaryBg` | `#00f2ff` (ciano, num tema dourado) | o dourado da paleta | Dot Matrix: defeito do original, não fidelidade |

Todas as famílias de fonte do original existem em `THEME_FONTS` com o mesmo nome (Inter, Outfit, JetBrains Mono, Lora, Space Grotesk, Chakra Petch, Orbitron, VT323).

## 3.5 Tokens que o tema novo precisa declarar e o original não tinha

**Regra de preenchimento** (a coluna "origem" de cada linha mora no script e nesta lista): onde o original tem um valor irmão, o novo deriva dele; onde o original não tinha o eixo, vale o **padrão do schema** (que conta como declarado, `theme-completeness:check`, limite 2); onde a barra é de uma Personalidade, o valor é o dela, porque `themeBars.test.ts` exige. Derivações usadas: sombra do cartão (`cardShadowOffsetX/Y`, `cardShadowBlur`, `cardShadowExpansion`, `cardShadow`) do `cardShadow`/`cardShadowSpread` do original; raios (`tableBorderRadius`, `catalog*Radius`, `kanbanCardRadius`, `skeletonRowRadius`, `progressBarRadius`) do raio de cartão; blur de vidro dos campos e do chat de `glassBlur` com teto 16; brilho de ícone de `textGlowIntensity` e `cardGlowIntensity`; `h3Size` de 3/4 do `h2Size`; `globalSectionGap` de `layoutGap`; `formFieldDensity` de `layoutDensity` (`compact` vira `tight`); `globalBackgroundPosition` `fixed` onde há textura de página.

**Os 26 estéticos de cor que a paleta calcula** (texto e borda de barra, ícones, campo, tooltip, `subtitleColor`, `emphasisColor`, `glassEdgeColor`…) **não entram**: nascem da paleta, nos dois modos.

**Verificação:** cada coluna passou por `auditTokenContract` e devolveu **0 violações** (tipo, enum, faixa e grade de `step`). Duas regras minhas violavam (`formFieldDensity: compact`, `catalogSectionRadius: 5`) e foram corrigidas no gerador antes de gravar a tabela.

A célula "já no original" marca o token que o original já declarava (o valor dele vale). As linhas de barra repetem a Personalidade da §7.

| token | sarak-sovereign | cyberpunk-neon | industrial-terminal | nature-breeze | neo-brutalism | dot-matrix-elegant | cyber-retro-wave |
|---|---|---|---|---|---|---|---|
| `sidebarBorderWidth` | `1` | `1` | `1` | `1` | `3` | `1` | `1` |
| `sidebarBorderStyle` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` |
| `sidebarBorderSide` | `none` | `edge` | `edge` | `none` | `all` | `edge` | `all` |
| `sidebarBackgroundStyle` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` |
| `sidebarActiveItemStyle` | `bar` | `filled` | `bar` | `pill` | `filled` | `pill` | `outline` |
| `sidebarItemDensity` | `compact` | `compact` | `compact` | `comfortable` | `comfortable` | `spacious` | `comfortable` |
| `sidebarIconSize` | `20` | `20` | `15` | `18` | `18` | `22` | `18` |
| `sidebarLogoPlacement` | `top` | `bottom` | `bottom` | `top` | `top` | `top` | `top` |
| `sidebarTone` | `inverse` | `inverse` | `secondary` | `surface` | `primary` | `surface` | `surface` |
| `topbarTone` | `surface` | `neutral` | `surface` | `neutral` | `surface` | `secondary` | `surface` |
| `topbarBorderWidth` | `1` | `1` | `1` | `1` | `3` | `1` | `1` |
| `topbarBorderStyle` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` |
| `topbarBorderSide` | `edge` | `none` | `edge` | `none` | `all` | `none` | `edge` |
| `topbarBackgroundStyle` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` |
| `topbarActiveItemStyle` | `filled` | `underline` | `underline` | `underline` | `filled` | `underline` | `pill` |
| `topbarItemDensity` | `compact` | `comfortable` | `compact` | `comfortable` | `comfortable` | `comfortable` | `comfortable` |
| `topbarIconSize` | `18` | `18` | `16` | `18` | `18` | `18` | `18` |
| `topbarBlur` | `10` | `10` | `0` | `10` | `10` | `0` | `10` |
| `topbarShadow` | `0 2px 18px rgba(0,242,255,0.14)` | `0 2px 18px rgba(0,255,65,0.14)` | `none` | `0 2px 18px rgba(46,125,50,0.14)` | `0 2px 18px rgba(255,0,0,0.14)` | `0 1px 0 rgba(212, 175, 55, 0.1)` | `0 2px 18px rgba(255,0,255,0.14)` |
| `navItemRadius` | `10` | `6` | `6` | `18` | `12` | `16` | `20` |
| `cardShadowOffsetX` | `0` | `0` | `0` | `0` | `8` | `0` | `0` |
| `cardShadowOffsetY` | `20` | `10` | `0` | `30` | `8` | `10` | `20` |
| `cardShadowBlur` | `40` | `20` | `0` | `60` | `0` | `20` | `40` |
| `cardShadowExpansion` | `-12` | `-12` | `0` | `-10` | `0` | `-12` | `-12` |
| `cardLayoutDirection` | `column` | `column` | `column` | `column` | `column` | `column` | `column` |
| `cardTextAlign` | `left` | `left` | `left` | `left` | `left` | `left` | `left` |
| `cardShadow` | `none` | `none` | já no original | já no original | já no original | `none` | `none` |
| `borderBeamEnabled` | `false` | `true` | `false` | `false` | `false` | `false` | `false` |
| `imageCardOverlayOpacity` | `0.5` | `0.5` | `0.5` | `0.5` | `0.5` | já no original | já no original |
| `imageCardHoverZoom` | `1.05` | `1.05` | `1.05` | `1.05` | `1.05` | já no original | já no original |
| `imageCardShadowOffsetY` | `10` | `10` | `10` | `10` | `10` | `10` | `10` |
| `imageCardShadowBlur` | `30` | `30` | `30` | `30` | `30` | `30` | `30` |
| `imageCardShadowSpread` | `10` | `10` | `10` | `10` | `10` | `10` | `10` |
| `imageCardGlowBlur` | `40` | `40` | `40` | `40` | `40` | `40` | `40` |
| `catalogSectionRadius` | `3` | `0` | `0` | `4` | `3` | `3` | `0` |
| `catalogItemRadius` | `2` | `0` | `0` | `3` | `2` | `2` | `0` |
| `cardTitleIconGlowBlur` | `15` | `15` | `0` | `15` | `15` | `0` | `15` |
| `modalActionAlignment` | `right` | `right` | `right` | `right` | `right` | `right` | `right` |
| `modalHeaderStyle` | `inline` | `inline` | `inline` | `inline` | `inline` | `inline` | `inline` |
| `toastAccentWidth` | `4` | `4` | `4` | `4` | `4` | `4` | `4` |
| `tableDensity` | `comfortable` | `compact` | `compact` | `spacious` | `comfortable` | `spacious` | `comfortable` |
| `tableZebraStriping` | `false` | `false` | `true` | `false` | `false` | `false` | `false` |
| `tableBorderRadius` | `{"mob":12,"tab":12,"desk":12}` | `{"mob":0,"tab":0,"desk":0}` | `{"mob":0,"tab":0,"desk":0}` | `{"mob":32,"tab":32,"desk":32}` | `{"mob":4,"tab":4,"desk":4}` | `{"mob":4,"tab":4,"desk":4}` | `{"mob":0,"tab":0,"desk":0}` |
| `kanbanHeaderPaddingY` | `4` | `4` | `4` | `4` | `4` | `4` | `4` |
| `kanbanHeaderTracking` | `0.04` | `0.04` | `0.04` | `0.04` | `0.04` | `0.04` | `0.04` |
| `kanbanCardRadius` | `8` | `0` | `0` | `4` | `8` | `8` | `0` |
| `h3Size` | `24` | `24` | `18` | `24` | `24` | `27` | `24` |
| `typeScaleMicro` | `11` | `11` | `11` | `11` | `11` | `11` | `11` |
| `typeScaleTiny` | `11` | `11` | `11` | `11` | `11` | `11` | `11` |
| `typeScale3xs` | `11` | `11` | `11` | `11` | `11` | `11` | `11` |
| `typeScale2xs` | `11` | `11` | `11` | `11` | `11` | `11` | `11` |
| `typeScaleCaption` | `12` | `12` | `12` | `12` | `12` | `12` | `12` |
| `trackingTight` | `0.2` | `0.2` | `0.2` | `0.2` | `0.2` | `0.2` | `0.2` |
| `trackingSnug` | `0.25` | `0.25` | `0.25` | `0.25` | `0.25` | `0.25` | `0.25` |
| `trackingWide` | `0.3` | `0.3` | `0.3` | `0.3` | `0.3` | `0.3` | `0.3` |
| `trackingWider` | `0.4` | `0.4` | `0.4` | `0.4` | `0.4` | `0.4` | `0.4` |
| `trackingWidest` | `0.5` | `0.5` | `0.5` | `0.5` | `0.5` | `0.5` | `0.5` |
| `trackingUltra` | `0.8` | `0.8` | `0.8` | `0.8` | `0.8` | `0.8` | `0.8` |
| `typeScaleXs` | `11` | `11` | `11` | `11` | `11` | `11` | `11` |
| `typeScaleXl` | `20` | `20` | `16` | `20` | `24` | `22` | `20` |
| `iconButtonGlowBlurSm` | `5` | `8` | `0` | `5` | `5` | `0` | `8` |
| `iconButtonGlowBlurMd` | `8` | `14` | `0` | `8` | `8` | `0` | `14` |
| `iconButtonGlowBlurLg` | `12` | `20` | `0` | `12` | `12` | `0` | `20` |
| `iconButtonFrostedShadowOffsetY` | `4` | `4` | `4` | `4` | `4` | `4` | `4` |
| `iconButtonFrostedShadowBlur` | `16` | `16` | `16` | `16` | `16` | `16` | `16` |
| `actionGlowShadowOffsetY` | `10` | `10` | `10` | `10` | `10` | `10` | `10` |
| `actionGlowShadowBlur` | `20` | `20` | `20` | `20` | `20` | `20` | `20` |
| `actionGlowShadowSpread` | `10` | `10` | `10` | `10` | `10` | `10` | `10` |
| `inputBorderType` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` | `solid` |
| `inputBackdropBlur` | `10` | `0` | `0` | `16` | `0` | `16` | `16` |
| `inputShadow` | `none` | `none` | `none` | `none` | `none` | `none` | `none` |
| `searchBackdropBlur` | `10` | `0` | `0` | `16` | `0` | `16` | `16` |
| `pageTransitionType` | `fade` | `fade` | `none` | `fade` | `fade` | já no original | já no original |
| `cardHoverStyle` | `glow-only` | `glow-only` | `lift` | `lift` | `lift` | já no original | já no original |
| `glassEdgeWidth` | `1` | `1` | `2` | `1` | `1` | `1` | `1` |
| `statusGlowBlur` | `0` | `0` | `0` | `0` | `0` | `0` | `6` |
| `progressBarHeight` | `8` | `8` | `8` | `8` | `8` | `8` | `8` |
| `progressBarRadius` | `12` | `0` | `0` | `32` | `4` | `4` | `0` |
| `dotGridDotOffset` | `2` | `2` | `2` | `2` | `2` | `2` | `2` |
| `dotGridDotSize` | `1` | `1` | `1` | `1` | `1` | `1` | `1` |
| `dotGridTileSize` | `40` | `40` | `40` | `40` | `40` | `40` | `40` |
| `emptyStateOrbOuter` | `500` | `500` | `500` | `500` | `500` | `500` | `500` |
| `emptyStateOrbInner` | `300` | `300` | `300` | `300` | `300` | `300` | `300` |
| `emptyStateOrbBlur` | `100` | `100` | `100` | `100` | `100` | `100` | `100` |
| `emptyStateVoidLetterOffset` | `0.8` | `0.8` | `0.8` | `0.8` | `0.8` | `0.8` | `0.8` |
| `emptyStateRingRadius` | `2` | `2` | `2` | `2` | `2` | `2` | `2` |
| `emptyStateCaptionMaxWidth` | `280` | `280` | `280` | `280` | `280` | `280` | `280` |
| `skeletonRowRadius` | `4` | `0` | `0` | `4` | `4` | `4` | `0` |
| `authHeroOrbBlur` | `120` | `120` | `120` | `120` | `120` | `120` | `120` |
| `chatBubbleGlassBlur` | `10` | `0` | `0` | `16` | `0` | `16` | `16` |
| `flowNodePadding` | `10` | `10` | `10` | `10` | `10` | `10` | `10` |
| `flowNodeBlur` | `10` | `0` | `0` | `10` | `0` | `10` | `10` |
| `globalBackgroundImageUrl` | `` | `` | `` | `` | `` | já no original | já no original |
| `globalBackgroundBlur` | `0` | `0` | `0` | `0` | `0` | já no original | já no original |
| `globalBackgroundOpacity` | `1` | `1` | `1` | `1` | `1` | já no original | já no original |
| `globalBackgroundPosition` | `absolute` | `fixed` | `fixed` | `fixed` | `fixed` | `fixed` | `fixed` |
| `globalSectionGap` | `24` | `24` | `16` | `24` | `24` | `48` | `24` |
| `headerAlignment` | `space-between` | `space-between` | `space-between` | `space-between` | `space-between` | `space-between` | `space-between` |
| `formFieldDensity` | `comfortable` | `comfortable` | `tight` | `comfortable` | `comfortable` | `comfortable` | `comfortable` |


# 4. Decisão 0.2 — a cor de cada tema: paleta calculada ou cor declarada

**Recomendação para os sete: paleta calculada, com as sementes do original, mais poucas sobrescritas justificadas.** O custo, dito uma vez: a paleta acompanha tom de barra e modo e entrega a contraparte clara calculada, com o texto já corrigido para 4,5:1; a cor declarada não acompanha nada, exige contraparte autorada e um par de contraste verificado à mão, e vence a paleta onde as duas existem.

Medido com `sarakResolvePalette('custom:analogous:<base>,sec=<secundária>,acc=<acento>', modo)` (com `sec=` e `acc=` explícitos o tipo de harmonia não mexe nas três sementes; usei `analogous`), comparado ao original:

| Tema | Valor de `colorPalette` | No escuro, a paleta devolve | Diferença para o original | Sobrescrita proposta (justificativa curta) |
|---|---|---|---|---|
| Sovereign Classic | `custom:analogous:#00f2ff,sec=#7000ff,acc=#ff00d4` | primária, secundária e acento **idênticos**; fundo `#061011` | fundo tingido de ciano em vez de `#050505`; texto `#e8f7f8` em vez de `#fff` | nenhuma |
| Cyberpunk Neon Classic | `custom:analogous:#00ff41,sec=#ff00ff,acc=#00ffff` | idênticos; fundo `#071107` | o original pinta **o texto** de verde (`textColorMaster #00ff41`); a paleta dá quase branco | `textColorMaster` verde no nativo e `#00821c` na contraparte: o texto verde é a marca do tema |
| Industrial Terminal Classic | `custom:analogous:#ff9900,sec=#cc7a00,acc=#ff3300` | idênticos; fundo `#140d07` | original com texto âmbar (`textColorMaster #ff9900`) e chapa `#141414` | `textColorMaster` âmbar no nativo e `#a25f00` na contraparte: terminal de fósforo âmbar |
| Nature Breeze | `custom:analogous:#2e7d32,sec=#fbc02d,acc=#00695c` | no claro: primária `#2e7d32` **exata**, fundo `#edf6ed`; no escuro: texto de marca `#418f43`, botão `#2e7d32` | o original tem `surfaceColor #e8f5e9`, `bgBaseColor #f4fbf7`: a paleta clara cai entre os dois | nenhuma |
| Neo Brutalism Classic | `custom:analogous:#ff0000,sec=#ffff00,acc=#0000ff` | idênticos; claro com fundo `#ffefed` | o original é papel neutro `#f0f0f0`, cartão `#fff`, texto `#000`; a paleta tinge o papel de rosa | `colorBgBody #f0f0f0`, `surfaceColor #ffffff`, `textColorMaster #000000` no claro: o brutalismo pede papel neutro e preto puro |
| Dot Matrix Elegant | `custom:analogous:#d4af37,sec=#a67c00,acc=#ffffff` | idênticos; fundo `#110e07`; botão primário dourado | o original pinta o texto de dourado e tem o botão primário **ciano** (incoerente) | `textColorMaster` dourado no nativo e `#876c00` na contraparte; o botão passa a ser dourado (defeito do original corrigido) |
| Cyber Retro-Wave 2077 Classic | `custom:analogous:#ff00ff,sec=#00ffff,acc=#ff0055` | idênticos; fundo `#140a14` | o original tem fundo violeta-azulado `#05030a`; a paleta o puxa para magenta | `colorBgBody #05030a` no nativo: o matiz frio do fundo é o que separa o roxo do rosa |

Quatro das sete sobrescritas são `textColorMaster` e entram na contraparte; cada uma gera um par de contraste que o `solve_theme_contrast.ts` mede no lote 1.

# 5. Proposta 0.3 — a contraparte clara (ou escura, onde o nativo é claro), uma frase por tema

| Tema | Modo nativo | Contraparte |
|---|---|---|
| Sovereign Classic | escuro | gelo `#e8f7f8` da paleta, cartão de vidro claro com borda teal de 1 px, primária teal `#007c83`, barra clara; a identidade fica na tipografia Inter + Outfit e no marcador de item ativo com brilho |
| Cyberpunk Neon Classic | escuro | papel esverdeado `#e9f8e9`, texto e primária em verde-escuro (`#00821c`), grade de página e quina cortada mantidas, botão wireframe com contorno verde-escuro |
| Industrial Terminal Classic | escuro | chapa clara `#fcf1e8`, texto âmbar-escuro `#a25f00`, borda de 2 px, zero raio e zero sombra mantidos: é "o mesmo painel sob luz de oficina" |
| Nature Breeze | **claro** (D1) | escuro reproduz a **foto**: fundo `#0a100a`, vidro escuro, verde da paleta, Lora nos títulos e cantos de 32 px mantidos |
| Neo Brutalism Classic | **claro** (D1) | escuro reproduz a **foto**: fundo quase preto, fio cinza no cartão, vermelho vivo só no item ativo e na aba, **sem sombra** (a dura preta some sobre o preto e a foto não tem outra); a espessura da borda não tem modo e fica a do claro *(corrigido pelo revisor em 2026-11-12, veredito do lote 2: a versão anterior pedia borda grossa e sombra vermelha, contra a foto)* |
| Dot Matrix Elegant | escuro | marfim `#f7f3e8`, dourado-escuro `#876c00`, pontos discretos e fio dourado de 1 px nas barras |
| Cyber Retro-Wave 2077 Classic | escuro | papel rosado `#feeefc`, magenta-escuro `#c400c4`, scanlines finas mantidas, Orbitron maiúsculo nos títulos |

Todo `design` de modo nativo claro declara tokens de modo (fundo, texto, borda) para o claro; a contraparte escura declara os mesmos tokens para o escuro. O que não carrega modo (textura, geometria, fonte, movimento) fica no `design` e vale nos dois: por isso `texture`/`cardTextureType` do Neo Brutalism e do Nature Breeze precisam servir aos dois modos (`grid` e `noise` do original servem; `carbon` não serviria).

# 6. Proposta 0.4 — nomes e ids

Confirmo a tabela da §2 da plan, com as checagens:

- **Nenhum id colide** com `SARAK_THEME_PRESET_IDS` (os 19 atuais, nenhum termina em `-classic`; `nature-breeze` e `dot-matrix-elegant` não existem hoje) nem com id de tema salvo de importador conhecido: busca pelos sete ids novos no ERP Earendel, nos dois logins de `Sarak-Lib-Login` e no Novo devolveu **zero** ocorrência em código (o Novo usa a lib antiga em `7c4dbaed`, que não lê o catálogo de hoje). Não existe lista de id reservado de tema: `SARAK_LEGACY_PALETTE_IDS` é só de paleta.
- **Nenhum nome colide** com o catálogo; o mais próximo é `Cyber Retro Wave` (atual) × `Cyber Retro-Wave 2077 Classic`, distinto.
- `Sarak Sovereign Classic` repete a palavra "Sarak" que `Sarak Sovereign` já carrega no catálogo; o `zero-brand:check` confirma no lote 1 (o nome é do catálogo, não vai para a UI do host).
- Sufixo `Classic` fica como proposto. Alternativa só se o dono preferir: `Original` ou o ano (`Sovereign 2026`); o custo é igual e nenhuma é melhor do que `Classic` para quem lê o seletor ao lado do homônimo.

**Barra de cada tema (decisão D3, medida):** `themeBars.test.ts` exige que todo tema, menos `sarak-sovereign`, declare as barras de uma Personalidade, e limita a **3** os temas com tom `neutral/neutral`: **hoje são exatamente 3** (`industrial-terminal`, `blueprint-protocol`, `editorial-ink`). Mapear o Cyberpunk para `technical` ou o Dot Matrix para `editorial` estouraria o teto (3 → 5), e deixar o `sarak-sovereign-classic` nos padrões do schema também (4). Mapeamento que cabe, com a matriz da §3.5 já calculada com ele:

| Tema novo | Personalidade | Por quê (caráter do original) |
|---|---|---|
| Sovereign Classic | `corporate` | lateral preta com marcador de barra: o mais perto do "padrão original" sem ser neutro/neutro |
| Cyberpunk Neon Classic | `operations` | tela ligada o dia todo, item ativo preenchido (o atual `cyberpunk-neon` também) |
| Industrial Terminal Classic | `erp` | chapa densa, ícone pequeno |
| Nature Breeze | `soft` | sem borda, volume, pílula |
| Neo Brutalism Classic | `brutalist` | borda grossa, tom da marca |
| Dot Matrix Elegant | `executive` | espaçoso, sóbrio, item ativo em pílula |
| Cyber Retro-Wave 2077 Classic | `glass` | translúcido com atmosfera |

# 7. Proposta 0.5 — diversidade, medida

`measureTheme` e `evaluateDistanceCriteria` (de `gates/scripts/audit/verify_diversity.ts`) rodados sobre os sete **como candidatos**: o original filtrado ao que o schema atual aceita (estéticos, sem removidos, `btnStyleType` corrigido), no modo nativo declarado, contra os 19 atuais.

| Candidato (nativo escuro) | Família / H / S / L do fundo | Mesma família e modo no catálogo, e a distância de matiz |
|---|---|---|
| sarak-sovereign-classic | ciano / 183 / 100 / 2 | `sarak-sovereign` **1°** |
| cyberpunk-neon-classic | verde / 135 / 100 / 2 | `cyberpunk-neon` **10°** |
| industrial-terminal-classic | laranja / 36 / 100 / 4 | `industrial-terminal` **3°** |
| nature-breeze | verde / 123 / 46 / 2 | `cyberpunk-neon` 22° |
| neo-brutalism-classic | vermelho / 0 / 100 / 2 | `kinetic-flow` 5° (no claro: `playful-pastel` 347°, a 13°) |
| dot-matrix-elegant | amarelo / 46 / 65 / 2 | `high-contrast` 4° |
| cyber-retro-wave-classic | magenta / 300 / 100 / 3 | `synthwave-retro` 33° (sai no lote 3) |

O que isto diz, sem enfeite:

1. **Os critérios 1 a 7 de `--new` reprovam por construção** (só o 8, estrutural, passa: raio 3 faixas, borda 3, blur 3, densidade 2). São os critérios de uma campanha de cinco temas **novos e distintos**, que cobram "zero novo em ciano ou magenta", "nenhum a menos de 25° de um atual" e "ao menos dois claros": um resgate que **pretende ser o homônimo** só pode reprovar. Detalhe medido: #1 0 claro (se o D1 for aceito sobe para 2), #2 0 de fundo médio, #3 1 de saturação contida, #4 cinco com S≥90 (máx. 1), #5 ciano e magenta, #6 o Sovereign Classic a 1° do atual, #7 Cyberpunk × Nature na mesma família.
2. **O que roda no `gates:full` não é `--new`.** `npm run themes:diversity` sem argumento só reprova a diversidade do **cromo** (≥ 3 estilos de item ativo e ≥ 3 tratamentos de fundo por orientação), e os sete a ampliam. `--new` só é cobrado pela checklist da skill `ui-criar-tema`.
3. **A trava que importa para o resgate passa**: `themeSetCoverage` exige combinação única `cardTextureType + btnStyleType + headingFont`, e as sete são inéditas no catálogo (ex.: Cyberpunk Classic `grid · cyberpunk · JetBrains Mono` × atual `scanlines · cyberpunk · JetBrains Mono`; Industrial Classic `grid · matte · JetBrains Mono` × atual `stripes · borderline · Bebas Neue`). As travas de piso (≥ 15 texturas, ≥ 10 fontes de título…) só crescem.
4. **Par muito próximo existe de fato**, e é a medida que o dono pediu: Sovereign (1°), Industrial (3°), Dot Matrix × High Contrast (4°), Neo Brutalism × Kinetic Flow (5°) e Cyberpunk (10°) diferem do vizinho **só pela estrutura** (textura, fonte, forma, barra, botão), não pela cor. Isso é consequência direta de "o mais próximo possível do original" e do original usar neon puro; não é defeito do mapa.

**Proposta (decisão D5):** o resgate declara-se fora do `--new` (nenhum critério de distância de cor se aplica a um tema que é, por definição, a cor de outro), e o lote 1 registra em vez disso: `themes:diversity` sem argumento verde, `themeSetCoverage` verde e a tabela acima atualizada com os números finais.

# 8. Proposta 0.6 — `synthwave-retro`

Fatos medidos:

- O id aparece em **código** só na própria lib: `all.ts`, `index.ts`, `loaders.ts`, `synthwave-retro.ts`, `catalog.generated.ts`, `themeBars.test.ts`, `TemaSobDemanda.test.tsx` (usa o loader dele como o que "falha"), dois specs de navegador (`barra-de-topo-estreita`, `seletor-da-barra-legivel`) e o snapshot de `PresetsCatalog`. Fora dela, **zero** uso em código no ERP, nos logins e no Novo; o ERP o tem só dentro da cópia do kit (`sarak-ui/`), que é a própria lib.
- Não há mecanismo de apelido de tema: `registry.ts` e o Provider só conhecem o id ou o fallback da 09 §4.3.

| Opção | O que o importador com o id gravado vê | Código | Nível da próxima versão (03) |
|---|---|---|---|
| **A** remover o id | cai no tema padrão no modo pedido, com **um** `console.warn` nomeando o id (09 §4.3, comportamento já testado) | só remover (7 arquivos de lib + 3 testes) | `SarakThemePresetId` perde um literal: **tipo público alterado**, ou seja, **MAJOR** pela regra do 03 (`minor-no-removal:check` não vê, a regra é humana); exige nota `## 9.0.0` ancorada |
| **B** tirar da lista e manter o id como apelido do tema mais próximo, **sem aviso** | recebe `cyber-retro-wave-classic` (magenta escuro neon, o mais perto: 33° e mesmo modo) sem aviso e **com o visual trocado** | mecanismo novo: mapa de apelidos lido por `sarakLoadThemePreset` e pelo Provider; o literal continua no tipo como obsoleto, e a paridade 1:1 de `themeCatalogParity` passa a separar "lista do catálogo" de "ids aceitos" | **MINOR**: o conjunto aceito não encolhe; 7 temas novos mais o apelido são aditivos |
| C **outra**: A com aviso melhor | como A, mas o `warn` cita o sucessor sugerido | como A + texto | MAJOR, como A |

**Recomendação: B**, porque a única objeção real à remoção é o nível da release, e nenhum importador conhecido tem o id gravado; B mantém a release MINOR e custa um mapa pequeno. Ressalva honesta: B troca o visual **em silêncio** para quem tiver o id, o que a 09 §4.3 evita no caso comum ("id inexistente não passa em silêncio"); como o id deixa de ser inexistente (vira apelido), o contrato não é violado, mas é uma escolha. Se o dono preferir o aviso, A + nota `9.0.0`.

# 9. Decisões para o dono antes do lote 1

| # | Decisão | Recomendação | Se a resposta for outra |
|---|---|---|---|
| **D1** | Nature Breeze e Neo Brutalism Classic: nativo **claro** (a intenção do arquivo) com o escuro reproduzindo a foto, **ou** nativo escuro (a foto) com a contraparte clara desenhada | nativo claro (§1, §5) | o nativo escuro entra no catálogo como escuro; a contraparte clara vira desenho novo e o critério 1 de `--new` (que já não se aplica, D5) fica em 0 claros novos |
| **D2** | Paleta calculada nos sete, com as quatro sobrescritas de `textColorMaster` e as três de fundo da §4 | sim | cor declarada: cada tema ganha ~70 cores à mão nos dois modos e perde o acompanhamento de tom e de modo |
| **D3** | Mapa tema → Personalidade da §6 | o proposto (cabe nos tetos de `themeBars.test.ts`) | outra escolha exige mexer no teto de 3 `neutral/neutral` ou na exceção de `sarak-sovereign` |
| **D4** | Nomes e ids da tabela da plan | os da plan | — |
| **D5** | O resgate fica fora dos critérios de `--new` e é medido por `themes:diversity` + `themeSetCoverage` | sim (§7) | adaptar o `--new` é outra tarefa (toca `verify_diversity.ts`, fora do escopo da §3.1) |
| **D6** | `synthwave-retro`: A, B ou C | B (§8) | A exige `9.0.0` |
| **D7** | Decisões pequenas já tomadas na §3.4: Industrial `13px` → `14px`; `btnStyleType` `solid` → `matte`, `outline` → `cyberpunk`; Dot Matrix com botão dourado | confirmar | reabrir só a linha afetada |

# 10. O que a plan toca além do que a §3.1 lista (para o revisor ver antes do lote 1)

- `themeSetCoverage.test.ts` tem `expect(SARAK_ALL_THEMES.length).toBe(19)`: sobe para 23 no lote 1, 26 no lote 2 e cai para 25 no lote 3. É um dos "testes de tema que listam ids".
- `themeBars.test.ts`: `CLOSEST_PERSONALITY` ganha as sete linhas da §6; não precisa de exceção nova.
- Os specs de navegador e o teste de tema sob demanda que citam `synthwave-retro` (§8) entram no lote 3.
- Peso: o teto é 15 KB por tema (gzip, minificado); os temas atuais têm de 335 a 491 linhas, e os sete novos vão a ~340 chaves. O número real só existe com o arquivo escrito (lote 1, `boot:measure`).

## Anexo C — onde a foto venceu o JSON (correção 2 do lote 1)

Referência do modo nativo escuro: `C:\tmp\sarak-temas-antigos\<tema>-pagina.png`. Cada linha é um valor do JSON que a foto não mostra.

| Tema | Token | JSON | Foto (valor no tema) |
|---|---|---|---|
| Sovereign | `titleColor`, `cardTitleColor`, `topbarTitleColor` / `textColorMaster` | `#ffffff` / `#ffffff` | título `#f0f0f0`, texto `#e6e6e6` (a foto pinta `#e6e6e6`; o título sobe um pouco para a trava `themeSetCoverage`, que exige título ≠ texto) |
| Sovereign | `cardBackgroundColor`, `cardBorderColor` | `rgba(15,23,42,.6)`, `rgba(255,255,255,.1)` | `#050505`, `rgba(255,255,255,.03)`: cartão sem fundo e borda quase invisível |
| Sovereign, Cyberpunk, Retro-Wave | `bgGradientMode` | `linear` | `none`: fundo chapado |
| Cyberpunk | `textColorMaster` | `#00ff41` | `#d9f2e0`: texto quase branco com tinta verde; título `#f0f0f0` |
| Cyberpunk, Retro-Wave, Industrial | `cardGeometricCut`, raios | corte de 16/24 px, raio 0 | corte 0, raio 12 (Industrial 8): a foto mostra canto arredondado |
| Cyberpunk | `cardBorderColor`, `sidebarBorderColor`, `topbarBorderColor` | `#00ff41` | verde a 40 % (`#00671b` na foto) |
| Retro-Wave | `cardBorderColor` e bordas de barra | `#00ffff` | ciano a 40 % (`#006767` na foto) |
| Retro-Wave | `titleColor` / `textColorMaster` | `#ffffff` / `#ffffff` | `#f2f2f2` / `#e6e6e6` |
| Industrial | `titleColor`, `cardTitleColor`, `topbarTitleColor` | `#ff9900` | creme `#fff5e5` |
| Industrial | `textColorMaster` | `#ff9900` | creme `#d6cdc0` |
| Industrial | `cardTextureType` | `grid` | `none`: cartão liso |
| Industrial | `colorBgBody`, `colorBgLayer1`, barras | `#0a0a0a`, `#141414` | `#070707`, `#101010` |

Barras: `sidebarColor` e `topbarColor` declarados (`#000000`; Industrial `#101010`) vencem o tom da Personalidade (09 §4.3.4), então a D3 fica. A contraparte espelha, em cada token declarado, o valor que a paleta já calculava no claro: o claro não mudou, exceto o fundo chapado.

## Anexo D — onde a foto venceu o JSON (lote 2)

Nature Breeze e Neo Brutalism Classic são nativos claros (D1): no claro vale a intenção do arquivo (JSON); a contraparte escura reproduz a foto. No Dot Matrix (nativo escuro) a foto vence no nativo. Referência: `C:\tmp\sarak-temas-antigos\<tema>-pagina.png`.

| Tema | Token | JSON | Valor no tema (por quê) |
|---|---|---|---|
| Nature Breeze | `texture` | `grid` | `none`: a foto não mostra grade (token sem modo, vale nos dois) |
| Nature Breeze | `bgGradientMode` | `linear` | `none`: fundo chapado na foto |
| Nature Breeze | `textColorMaster` (escuro) | `#1b5e20` | `#e6e6e6`: texto claro da foto |
| Nature Breeze | `titleColor` (escuro) | `#ffffff` | `#ffffff` (igual); texto `#e6e6e6` mantém título ≠ texto |
| Nature Breeze | `cardBackgroundColor` / `cardBorderColor` (escuro) | `rgba(255,255,255,.4)` / `transparent` | `#050505` / `transparent`: cartão sem preenchimento na foto |
| Neo Brutalism Classic | `bgGradientMode` | `linear` | `none`: fundo chapado na foto |
| Neo Brutalism Classic | `cardBorderColor` (escuro) | `#000000` | `#343434` (também na borda da lateral e do topo): o fio medido no pixel da foto (espessura 4 px mantida, é token sem modo) |
| Neo Brutalism Classic | `cardShadow` (escuro) | `8px 8px 0 #000` | `none`: a foto não tem sombra (achado 8 do veredito do lote 2) |
| Neo Brutalism Classic | `textColorMaster` (claro) | `#000000` | `#0a0a0a`: `themeSetCoverage` exige título ≠ texto; título `#000000` |
| Dot Matrix Elegant | `textColorMaster` | `#d4af37` | `#e6e6e6`: a foto pinta texto claro |
| Dot Matrix Elegant | `cardTitleColor`, `topbarTitleColor` | `#d4af37` | `#ffffff` (foto) |
| Dot Matrix Elegant | `bgGradientMode` | `linear` | `none`: fundo preto chapado; sem isso o fundo saía marrom |
| Dot Matrix Elegant | `textureOpacity` | `0.15` | `0.15` no escuro (foto e JSON; achado 9 do veredito do lote 2); `0.08` na contraparte clara, legível sobre o marfim |
| Dot Matrix Elegant | `surfaceIntensity` / `glassOpacity` | `0.5` / `0.1` | `0.05` / `0`: o material `frosted` clareava o cartão (medido: `#0c0c0c` contra `#0a0a0a` declarado) |

Barras: nos três temas as cores declaradas das barras e seus papéis (tom neutro) existem porque `presetsReadable` reprova barra de tom `primary` (Neo, claro) e de tom `secondary` (Dot Matrix, topo claro) com `textColorMaster` escuro; o tom da Personalidade (D3) não mudou.
