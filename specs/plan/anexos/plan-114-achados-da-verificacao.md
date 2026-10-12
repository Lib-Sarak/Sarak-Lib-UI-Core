# Anexo da plan-114 — achados da verificação completa (2026-10-12)

Medido no `HEAD` `56c3324b` por três auditorias somente-leitura (emissão × leitura de variáveis; componente que
ignora o token; painel e temas), com scripts que importam o código real de `src/` e `gates/`. O revisor conferiu
no código os achados de maior impacto (marcados ✔). Linhas valem para esse `HEAD`; o executor reconfere antes de
mexer. "Certeza" = lido no código ou calculado; o que só o navegador prova vai para `browser-tests/`.

Convenção de regra de cascata (`src/styles/sarak-base.css`): `components.sarak-elements` → `utilities` → `sarak-lib`
(a lib por último). Um `!important` na `sarak-lib` vence classe utilitária e `style` inline.

---

## L1 — Cascata: o motor atropela o componente

| # | Onde | O que faz | O que atropela |
|---|---|---|---|
| L1.1 ✔ | `_atmosphere.css:659-679` — `[data-sx-texture] .card, [data-sx-texture] .sarak-card, [data-sx-texture] .bg-theme-card, .sarak-design-scope .card, .sarak-design-scope .sarak-card` | `background` (atalho), `backdrop-filter`, `border-radius` dos 4 cantos, `clip-path`, `border-style`, `border-color`, larguras de borda e `transition: all 0.3s ease`, **todos `!important`**. Vale sempre (o `DesignScope` envolve tudo), não só sob textura | raio de token de componente (`SarakCatalogGrid.tsx:70` `catalogSectionRadius`, `:148` `catalogItemRadius`; `SarakExpandableCard.tsx:54`; `SarakStats.tsx:53,105`; `SarakChart.tsx:121`; `SarakManagementGrid.tsx:115,142,161`; `SarakHelpButton.tsx:25`; `ManagementGroupCard.tsx:72` — só `SarakTableView` contorna); toda `bg-*` de cartão e o hover `hover:bg-*` (atalho zera também `background-image`); o hover de borda de `_cards.css:85` (nunca aparece); `motionDuration*`/`motionEase*` em todo cartão; o modo eco não tira o desfoque do `.sarak-card` (`_performance.css:6` perde) |
| L1.2 ✔ | `_atmosphere.css:643-656` — `body:not([data-sx-texture="none"]) main/section/article/…` | `background-color: transparent; background-image: none` `!important`; o `:not()` vale também sem o atributo | fundo de qualquer `<main>`/`<section>`/`<article>` — `KanbanColumn.tsx:91` e `KanbanCard.tsx:22` ficam transparentes; vale também no consumidor |
| L1.3 | `_atmosphere.css:395` | `opacity: 0.7 !important` na textura `aurora-classic` (inclusive `::before` global); cores fixas `#8b5cf6`/`#06b6d4` (`:393`) | `textureOpacity`, `cardTextureOpacity`, cor de textura |
| L1.4 | `_cards.css:21` | `background-color` `!important` em `.sarak-card, .bg-theme-card` | já perde para L1.1 no `.sarak-card`; no `.bg-theme-card` atropela `hover:bg-*` |
| L1.5 | `_surfaces.css:62-82` (moldura `cyber`/`glow`/`none`) | `border-color` `!important` também sobre `.sarak-shell-sidebar`/`.sarak-shell-header` | suspeita: `sidebarBorderColor`/`topbarBorderColor` |
| L1.6 | literais de duração no motor | `_cards.css:43` (0.4s/0.2s/0.3s), `_cards.css:73` (0.5s), `_atmosphere.css:678` | `motionDuration*` |

Intencionais (não mexer, só não deixar L1.1 vencê-los): `_performance.css:5-11` (eco), `_motion.css:24-44` (movimento
reduzido), `_cards.css:147-151` (campo do cartão de busca).

---

## L2 — Variável: dono, nome e reserva

### L2.1 Variável com mais de um dono — 14 (certeza)

Regra de quem vence (`DesignInjector.tsx`, `DesignScope.tsx`): escalar vai inline (`html` e `body`); responsivo vai a
`<style>` em `:root`. No modo App o inline vence; no Embarcado vence o responsivo (`DesignInjector.tsx:180`). Entre
dois donos do mesmo tipo, vence o último do `MASTER_DESIGN_MAP`. `_base.css:14-51` redeclara `--theme-gap`,
`--radius-theme`, `--theme-surface`, `--theme-card` no `body` e sombreia o que o `:root` herdaria.

| Variável | Donos | Natureza | Efeito |
|---|---|---|---|
| `--sarak-card-radius-tl/tr/bl/br` | `cardBorderRadius` (`cards.ts:14`) + `cardRadiusTL/TR/BL/BR` | mestre + canto | **o mestre nunca chega aos cantos**: o canto emite sempre o próprio padrão (`useDesignVariables.ts:80`, `design[id] ?? default`) e vem depois; o slider mestre não tem efeito; nos temas o mestre é ignorado (minimalist-airy mestre 0 / cantos 9999) |
| `--sarak-btn-radius-tl/tr/bl/br` | `btnBorderRadius` (`buttons.ts:50`) + `btnRadiusTL..BR` | mestre + canto | idem |
| `--radius-theme` | `borderRadius` (`system.ts:68`) × `cardBorderRadius` | duas semânticas | depende do modo: `:root` = cartão; abaixo do `body` = sistema (`_base.css:50`); Embarcado = cartão. 15 leituras |
| `--theme-gap` | `layoutGap` × `cardPaddingMd` | gap × padding | mesmo mecanismo; padrões coincidem hoje |
| `--theme-border-width` | `borderWidth` × `cardBorderWidth` | sistema × cartão | vence o cartão |
| `--theme-surface` | `surfaceColor` × `cardBackgroundColor` | superfície × fundo do cartão | vence o cartão; e `--surface-color` sai do `surfaceColor` → `--theme-surface` ≠ `--surface-color`. 21 leituras (`SarakBadge`, `SarakModal`, `SarakTabs`, `SarakTooltip`…) |
| `--theme-card-border` | variante `-border` gerada de `cardBackgroundColor` × `cssVars` de `cardBorderColor` | tom derivado × cor da borda | vence `cardBorderColor`; sem leitura |
| `--sarak-bg-base` | `colorBgBody` × `bgBaseColor` | duplicata | mudar `colorBgBody` não muda `--sarak-bg-base` |

### L2.2 Lida e nunca emitida nem declarada (certeza)

| Nome | Leituras | Onde |
|---|---|---|
| `--sarak-bg-body-rgb`, `--sarak-sidebar-bg-rgb` | 1 + 1 | `_colors.css:9-10` (tokens sem `generateVariants`) |
| `--sarak-max-width` | 1 | `_base.css:78` |
| `--sarak-primary-color-bg` | 9 | `SarakTitleCard.tsx:150`, `ChatInput.tsx:56`, `MessageList.tsx:29`… |
| `--sarak-status-{success,error}-color-{bg,border}` | — | `SarakForm.tsx:112-113`, `ChatHeader.tsx:39`, `ChatInput.tsx:63` |
| `--theme-error-bg`, `--theme-error-border` | — | `SarakShellUserWidget.tsx:100,149` (sem reserva: fundo transparente) |
| `--theme-secondary-border`, `--theme-primary-border` | — | `SarakActionCard.tsx:137`, `MessageBubble.tsx:26` |
| Mocks do painel: `--theme-text-sec` (28), `--sarak-radius` (8), `--sarak-radius-sm` (3), `--sarak-status-success`/`-error` (6), `--theme-main` (2), `--theme-shadow` (1) | 48 | `src/features/DesignEngine/Canvas/Mocks/*` (42 sem reserva) |

O `auditor_ghostvars` não pegou nenhum destes (limites declarados em [[01-gates-e-baseline]] §4.3).

### L2.3 Reserva (`var(--x, F)`) divergente do padrão do token (certeza)

266 leituras em 75 pares (fora: piso mobile-first, palavra-chave, composto). Os de maior peso:

- `--sarak-primary-color` → `#3b82f6` contra padrão `#00f2ff`: **134 ocorrências em 111 linhas** (CSS e TSX); também `--primary-color` (`_base.css:30-31`), `--sarak-nav-active-color`; `--secondary-color` `#64748b`×`#7000ff`; `--sarak-accent-color` `#f43f5e`×`#ff00d4`; `--sarak-bg-body`/`--bg-body`/`--theme-body` (4 reservas diferentes); `--sarak-card-bg`, `--theme-card`, `--theme-border`, `--theme-muted`, `--sarak-topbar-bg`, `--theme-texture-color` (`#111`×`#ffffff`, `_atmosphere.css:500`), cores de navegação ativa/hover, `--sarak-card-glow-color`, `--sarak-modal-overlay(-color)` (`.5`/`.6`×`.4`).
- Geometria e tipo: `--sarak-border-width` `2px`/`4px`×`1px`; `--theme-border-width` `3px`; `--sarak-card-radius` `6px`; `--sarak-input-border-radius` `8` **sem unidade** (`TextMock.tsx:93,115,122,132`); `--sarak-layout-gap-sm` `2px`/`4px`; `--sarak-topbar-height` `44px`×56/60/64; `--sarak-glass-blur` `12px`×`16px`; `--font-heading` `'Inter'`×`'Outfit'`; `--sarak-h1-weight` `700`×`900`; `--sarak-body-weight` `600`/`700`×`400`; `--sarak-z-base` `10`×`1`.
- Opacidade e efeito: `--theme-texture-opacity` (5 reservas diferentes, `_atmosphere.css:17,46,297,503,585,597,611,626`), `--sarak-card-texture-opacity`, `--sarak-vignette-opacity`, `--sarak-surface-intensity` `.05`×`.5`, `--sarak-card-surface-opacity`, `--sarak-glass-saturation` `180%`×`120%`, `--sarak-btn-neon-pulse-speed` `1.5s`×`0s`.
- Ponte de `_colors.css:13-20` com reservas de tema claro contra padrões escuros.
- `PresetCard.tsx:26-37`: lê chaves de tokens responsivos que nunca entram em `variables` (cai num token de **gap** usado como raio) e usa cor como reserva de largura de borda.

### L2.4 Escrita sem efeito e prosa falsa (certeza)

- ✔ `DesignInjector.tsx:124` grava `BEZIER_CURVES` (`constants.ts:12-17`) com chaves sem `--` (`standard`, `decelerate`…): `setProperty` sem efeito.
- Descrições do schema que afirmam `id` duplicado (`bgBaseColor`, `colorBgLayer1/2` em `atmosphere.ts`) — medido: 0 ids duplicados; `cardBorderColor` (`colors.ts:131`) remete a uma nota que não existe; `_base.css:43-45` cita `system.ts:90` (o token está em `:68`).

---

## L3 — O componente não obedece ao token

| # | Componente | Faz | Deveria ler |
|---|---|---|---|
| L3.1 ✔ | `SarakButton.tsx:62-63` (primário) | `bg-[--sarak-primary-color] text-[--text-muted]` | `btnPrimaryBg`/`btnPrimaryText` — **zero leitores na lib**; só `ButtonPresetPreview.tsx:21-22` (o painel). O par desenhado reprova contraste em 27 de 28 combinações tema×modo (pior 1,06) |
| L3.2 | `SarakButton.tsx:66` (secundário) | `--color-theme-card` | `btnSecondaryBg` só vale em `glow`/`frosted` (`useAtomicStyles.ts:55,92`) |
| L3.3 | `cardShadow` (`cards.ts:467`) | nenhum leitor de `--sarak-card-shadow` na lib; só `PresetCard.tsx:37` | a sombra do cartão |
| L3.4 | `SarakTableViewParts.tsx:96,133,149` | `bg-white/5` no cabeçalho, `hover:bg-white/[0.02]` e `border-white/[0.02]` na linha, `bg-white/5 rounded-md` no esqueleto | `tableHeaderBg`, `tableRowHoverBg`, `tableBorderColor`, `skeletonRowRadius` |
| L3.5 | `SarakAnalyticalPage.tsx:89,108`, `SarakSpotlight.tsx:122` | `bg-black/50 backdrop-blur-sm` | `modalOverlayColor`, `modalOverlayBlur` / `searchBackdropBlur` |
| L3.6 | `PremiumSwitch.tsx:14` | `bg-white shadow-md` no polegar | `switchThumbBg` (`--sarak-switch-thumb`) |
| L3.7 | `SarakModal.tsx:102,106,122` | `rounded-md` nos botões (o merge troca `rounded-btn`) | `btnBorderRadius` |
| L3.8 | `SarakIconButton.tsx:40` | brilho `rgba(0,242,255,0.4)` fixo | `btnNeonGlowColor` |
| L3.9 | `SarakTitleCard:77`, `SarakActionCard:84`, `SarakSearchCard:91` | `bg-black/60` + sombra ciano fixa | primária / brilho do tema |
| L3.10 | `MessageBubble.tsx:73,82,88` | `rounded-md`, `shadow-xl` nas etiquetas | `chatBubbleRadius` |
| L3.11 | `AuthForm` (`:74,110,111,115`) | `amber/red/emerald-*` | `statusWarningColor`/`statusErrorColor`/`statusSuccessColor` |
| L3.12 | durações literais `duration-200…700` em 16 lugares (`SarakSwitch:63,67`, `SarakProgress:78`, `SarakCheckbox:100`, `SarakRadio:104`, `ChromeSidebarBody:103`, `ChromeTopbarBody:96`, cartões, `KanbanColumn:93`) | 0 usos de `motionDuration*` | `motionDuration*` |
| L3.13 | `cardSurfaceOpacity` (`cards.ts:98`) | `opacity` no cartão inteiro (`_cards.css:22`, apaga o texto) **e** no `color-mix` do fundo (`_atmosphere.css:100,662`): efeito dobrado | só a superfície |
| L3.14 | `cardHoverStyle: 'glow-only'` | não acrescenta brilho (`cardHoverMotion.ts:17-19`; `SarakImageCard.tsx:55` remove a sombra) | o brilho que o rótulo promete |
| L3.15 | `SarakActionCard.tsx:137` | cor de sombra usada como cor de texto | token de texto |

**Brecha do gate que deixou L3.1 e L3.3 passarem:** o `token-reader:check` conta o painel (`src/features/DesignEngine/`) como leitor. A pré-visualização lê o token e o componente real não — o painel mostra uma coisa e a tela outra.

---

## L4 — Modo claro e contraste

### L4.1 Branco/preto translúcido em componente (certeza, ~44)

`SarakTableViewParts.tsx:96,133,149` · `SarakEmptyState.tsx:69,71,81,98,101,108,110` · `SarakSearchCard.tsx:136,141,154,167` · `SarakSocialButton.tsx:43,47,75` · `SarakTitleCard.tsx:134` (texto invisível no claro) · `SarakCoreCard.tsx:30` (rótulo invisível) · `SarakModal.tsx:122` (fechar) · `SarakHelpButton.tsx:29,30,38,42` · `SarakAccordion.tsx:74` · `SarakStats.tsx:105` · `ManagementGroupCard.tsx:75` · `AuthSocialLogin.tsx:37` · inline `rgba(255,255,255,…)` em `SarakIconButton.tsx:108-121`, `SarakSlider.tsx:36`, `useAtomicStyles.ts:137,139` · `_utilities.css:79` (polegar da barra de rolagem). Suspeita: `bg-black/10`/`/20` em `SarakModal:119,158`, `SarakTabs:70,129`; `text-white` da aba ativa (`SarakTabs:123`).

### L4.2 Pares desenhados abaixo de 4,5:1 fora do verificador (202 falhas em 28 combinações tema×modo)

| Par desenhado | Fonte | Falhas/28 | Pior |
|---|---|---|---|
| `textColorMuted` sobre `primaryColor` (botão primário; hover do secundário) | `SarakButton.tsx:62,66` | 27 | 1,06 |
| `#fff` sobre `primaryColor` / `secondaryColor` (badge sólido) | `SarakBadge.tsx:36,40` | 24 / 20 | 1,37 / 1,07 |
| `rgba(255,255,255,.9)` fixo sobre `chatUserBg` | `SarakChatEngine.tsx:100` | 17 | 1,00 |
| `inputErrorColor` sobre corpo / cartão | `SarakFieldError.tsx:29` | 17 / 16 | 2,58 |
| `primaryColor`, `statusInfoColor`, `statusWarningColor` sobre corpo/cartão (badge suave) | `SarakBadge.tsx:35,63` | 17 / 16 / 14 | 1,04 |
| `textColorMaster` sobre `chatUserBg` | `MessageBubble` | 11 | 1,69 |

`gates/scripts/audit/verify_contrast.ts:107-153` mede 37 pares fixos — inclusive `btnPrimaryText`/`btnPrimaryBg`, que o botão não desenha (L3.1).

### L4.3 Contraparte que herda cor do modo nativo e reprova no oposto

minimalist-airy `sidebarHoverColor`/`topbarHoverColor` (`:167,:172`) no escuro: 1,03 · neumorphic-mobile `matrixItemBg` (`:11`) no escuro: 1,20 · industrial-terminal `chatUserBg` (`:204`) no claro: 1,69 · `chatUserBg` herdado em data-terminal, golden-hour, blueprint-protocol, neumorphic-mobile: 3,07–3,77. Cor declarada só na contraparte: `inputTextColor`/`inputBorderColor`/`inputFocusBorderColor`/`tooltipBorderColor` em sarak-sovereign, cyberpunk-neon e outros.

---

## L5 — Painel e contrato numérico

| # | Achado | Onde | Qtd |
|---|---|---|---|
| L5.1 ✔ | **Slider de token responsivo mostra `NaN`** (`Number({desk,tab,mob})`, `BasicControls.tsx:22`) e, ao arrastar, grava escalar e perde os breakpoints | 37 tokens (`cardBorderRadius`, `btnBorderRadius`, `sidebarWidth`, `h1Size`…) | 37 |
| L5.2 ✔ | `cardTitleFontWeight`: `id` ≠ `value` (`id 'black'`, `value '900'`); o `SelectControl` usa `id` (`BasicControls.tsx:93`), a validação usa `value` (`validation.ts:65`) — o controle não grava nada válido | `schema/card-title.ts:33-45` | 1 |
| L5.3 | Tipo sem ramo no `DynamicTokenControl` (cai em "tipo não suportado"): `text` (`sidebarShadow`, `cardShadow`, `inputShadow`, `motionEaseMain/Out/In`) e `image` (`globalBackgroundImageUrl`) | `DynamicTokenControl.tsx:78-83` | 7 |
| L5.4 | Sufixo `px` padrão em slider sem `unit` (`DynamicTokenControl.tsx:42`): "0.6px" de opacidade, "9000px" de camada, "600px" de peso | `identityFontWeight`, `bodyLineHeight`, `glassOpacity`, `zIndexModal`… | 48 |
| L5.5 | `ColorControl` converte `rgba` em hex sem alfa e `var()`/`hsl` em `#ffffff` (`ColorControl.tsx:20-33`): a primeira edição grava cor opaca | 30 padrões translúcidos + 13 padrões `var()` | 43 |
| L5.6 | Padrão fora de `min/max`: `sidebarMaxWidth` mob 280 < 300; `zIndexToast` 9000 sem `constraints` (o painel desenha 0..100 e jogar o toast abaixo do modal) | `navigation.ts:94`, `engineering.ts:43` | 2 |
| L5.7 | `colorDepth`/`colorVariation` declaram `min/max` fora de `constraints` (o painel ignora e mostra 0..100; a validação corta em 1..5) | `colors.ts:81,92` | 2 |
| L5.8 | Padrão fora da grade do `step` | `searchDropdownGap` 0,5, `toastMaxWidth` 22,5, `identityTracking` −0,025 | 3 |
| L5.9 | `inputShadow` é `text` mas o leitor trata `'neumorphism'` como palavra-chave (`useAtomicStyles.ts:135,143`) | `inputs.ts:86` | 1 |
| L5.10 | **Valor de tema fora de `min/max` é cortado sem aviso** (`clampNumber`, `validation.ts:54`), e `auditTokenContract` não detecta | 41 valores nos 14 temas (ex.: industrial-terminal `motionDuration*` = 0 → 0,1/0,2/0,5; minimalist-airy `borderRadius` 9999 → 40; `securityPulseSpeed` 0 em 7 temas → 0,5; `identityTracking` 1–4 em 4 temas → 0,5; `zIndexTooltip` 100 → 5000) | 41 |

L5.10 aponta para o schema, não para o tema: "desligado" (`securityPulseSpeed` 0, `motionDuration*` 0), "pílula" (raio 9999) e a unidade do tracking são intenções que o schema não oferece.

### L3 — herdado do veredito do lote 1 (2026-10-12)

| # | Onde | O que fazer |
|---|---|---|
| L3.16 | cartões da lib com `bg-[var(--color-theme-card,…)]` (`SarakTitleCard`, `SarakCatalogGrid`, `SarakChart`, `SarakStats`…) e a superfície do tema em `_atmosphere.css` (camada final) | tirar a classe de fundo redundante dos cartões (a superfície vem do tema, de um lugar só) e rebaixar a superfície para `components.sarak-elements`, para que `bg-*`/`hover:bg-*` do componente e do consumidor vençam; o guarda "cartão real computa a superfície" continua verde |
| L3.17 | `_utilities.css:33` | `.bg-theme-card:active { background-color }` na camada final vence `active:bg-*` |
| L3.18 | `_theme.css:100-102` | `box-shadow` de `.bg-theme-card` sempre vencido por `_cards.css` (código morto) |
