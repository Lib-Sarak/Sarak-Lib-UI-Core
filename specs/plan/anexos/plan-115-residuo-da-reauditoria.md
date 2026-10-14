# Anexo da plan-115 — o resíduo da re-auditoria de fechamento (2026-10-13)

Medido sobre o worktree do lote 5 da `plan-114` (commit `60c137f3`) por três re-auditorias somente-leitura, com a
instrução de procurar **o que cada trava declara não ver**. O revisor conferiu no código os pontos marcados ✔.
Linhas valem para esse commit; o executor reconfere antes de mexer.

O que já está em zero e não volta a ser medido aqui: variável com dois donos em conflito; nome lido sem dono;
tema fora do contrato (chave, opção, faixa, cor); controle sem ramo, `select` que não grava, slider `NaN`; valor de
cor que busca recurso (mais de 60 sondas).

---

## Lote 1 — Injeção, cascata e movimento

| # | Onde | O defeito | Efeito |
|---|---|---|---|
| R1.1 ✔ | `useDesignVariables.ts:84-131` + `DesignInjector.tsx:108-113` | valor escalar vai inline (`html`/`body`); responsivo vai a um `<style>`; o inline vence. Mestre de raio escalar (o caso comum nos temas: `aurora-veil.ts:77`) e canto responsivo (o painel grava canto como objeto, `BasicControls.tsx:76-87`) → o canto editado não aparece no modo App; no Embarcado aparece | comportamento diferente por modo; a descrição dos cantos ("sobrescreve só nesse canto") falsa nesse caso |
| R1.2 ✔ | `DesignInjector.tsx` — nenhum `removeProperty` em `src/` | variável inline nunca é removida: token que passa de escalar a responsivo, ou some ao trocar de tema, deixa o inline antigo vencendo | valor do tema anterior persiste na tela |
| R1.3 ✔ | `_surfaces.css:27-51` | material (`frosted` é o padrão, todo preset declara `surfaceMaterial`) escreve `backdrop-filter`, `background-image` com branco fixo e `box-shadow` com `!important` em todo `.sarak-card`/`.bg-theme-card`: o "atributo com valor" é sempre emitido, então o seletor é amplo na prática; `:62` `border-style` e `:67,77,82` `border-color` (`cyber`/`glow`/`none`) idem. O comentário `:15-18` justifica com um `!important` de `_atmosphere.css`/`_cards.css` que já não existe | vence `bg-gradient-*`, `backdrop-blur-*`, `border-dashed`, `hover:border-*` e `style` inline; contradiz o contrato do `SarakCard` (`SarakCard.tsx:11`) |
| R1.4 | `_cards.css:6-43,63` (camada final, sem `!important`) | `padding`, `box-shadow`, `clip-path` e o hover de sombra do `.sarak-card`/`.bg-theme-card` vencem `p-*`, `shadow-*`, `hover:shadow-*` (`SarakExpandableCard.tsx:56`; `<SarakCard className="p-0 shadow-none">`; selo `PresetCard.tsx:188`; hovers de `AtmosphereCatalog:80`, `CardsCatalog:56`, `PresetCard:90`, `TypographyCatalog:32`) | classe do componente morta |
| R1.5 | `bg-theme-card` | é também o nome da utilitária de cor gerada por `--color-theme-card` no `@theme`: quem quer só a cor recebe o cartão inteiro (padding, sombra, recorte, `:active`) | nome com dois sentidos |
| R1.6 | `_utilities.css:33,38,43-50` | `.bg-theme-card:active` encolhe contêiner; `button:active:not(.p-0) { transform !important }` vence `active:scale-*` e o `whileTap` de `SarakActionCard.tsx:134-135`; recorte geométrico com 15px fixo e um canto, ignorando `cardGeometricCut` | |
| R1.7 ✔ | `SovereignThemeInjector.tsx:44-104` | no modo claro, repinta `.text-white…`, `.bg-black…`, `.bg-white/5|10`, `.text-slate-*` com `!important` montado em TypeScript (fora do alcance do `css-important:check`); `SarakLightbox.tsx:137` fica ilegível sobre `bg-black/90` e os botões `:34,107` viram cartão claro sobre preto | |
| R1.8 ✔ | `--default-transition-duration` (`.15s` no `dist/`, nenhuma menção em `src/`) | ~76 usos de `transition-*` sem duração em `src/components` rodam a 150 ms fixos e vencem o padrão de elemento que lê o token (`_elements.css:70,75`): `SarakButton.tsx:57`, `SarakInput.tsx:104`, `SarakSelect.tsx:51`, `SarakTextarea.tsx:42`, `SarakMenuItem.tsx:69-70`, `SarakTabs.tsx:113,145`, `SarakShellSearchWidget.tsx`… | a velocidade do tema não chega; a curva cai no padrão do Tailwind, não em `motionEaseMain` |
| R1.9 | `_typography.css:16-17` | regra morta: `data-tabular-nums` nunca é emitido | |

## Lote 2 — Painel, descrições, tokens sem efeito e as travas

| # | Onde | O defeito |
|---|---|---|
| R2.1 ✔ | `TokenControl.tsx:21-42`, `DynamicTokenControl.tsx:58-63,76-84` | a `description` só é passada no ramo `boolean`: em 391 tokens o `HelpTooltip` mostra o texto genérico (`HelpTooltip.tsx:33`) — contradiz [[06-painel-de-customizacao-e-preview]] §3 |
| R2.2 | `TokenControl.tsx:40`, `BasicControls.tsx:203` | ramo `number` sem `min`/`max`/`step`/unidade; campo vazio grava `NaN` (`colorDepth`, `colorVariation`, `zIndexToast`) |
| R2.3 | `ColorControl.tsx:31-32,76` | o seletor troca `var()`/`color-mix()` por hex opaco e perde o alfa da reserva; 14 padrões não literais, 8 mostram `#ffffff` (`tooltipBg`, `tooltipBorderColor`, `rangeActiveColor`, `colorBgModal`, `cardActionBtnHoverBg`, `cardSearchBgFocus`, `cardSearchPlaceholderColor`, `cardSearchTextFocusColor`); `hsl()`/`rgb(%)` idem |
| R2.4 | `cards.ts:281` `cardShadowSpread`; `atmosphere.ts:389` `vignetteSoftness` | faixa 0–200 com o CSS cortando em `min(100%, …)` (`_cards.css:22`): metade do slider morta; a vinheta satura em 62,5 em `_atmosphere.css:31,66` (fator 1,6%) e `_theme.css:90` usa outro fator (1%) |
| R2.5 | 13 valores de tema fora do `step` (a validação não confere a grade) | `kinetic-flow` `glassRoughness` 0,02; `minimalist-airy` `shadowAmbientAlpha` 0,02; `golden-hour`/`data-terminal`/`aurora-veil` `shadowProjectionAlpha`; `aurora-veil` `shadowAmbientAlpha`, `scrollTrackOpacity`, `motionDuration*`; `blueprint-protocol` `motionDuration*`, `iconStrokeWidth` 1,75 |
| R2.6 | catálogo | 7 entradas duplicadas (`bgBaseColor`, `cardBackgroundColor`, `cardBorderColor`, `colorBgBody`, `colorBgLayer1`, `colorBgLayer2`, `zIndexModal`) com descrições divergentes; vence a última |
| R2.7 | descrições falsas | `primaryColor` diz "botões primários" (o fundo do primário é `btnPrimaryBg`); `shadowIntensity` diz "multiplicador de todas as sombras" (o único leitor é `.shadow-theme`, que muda a `opacity` do elemento); `btnStyleType: neumorphism` sem ramo de botão (sai matte sem sombra; é o estilo do `neumorphic-mobile`); `textColorMaster` diz "títulos" (títulos usam `titleColor`); rótulos com valor embutido ("Escala Micro (7px)", "Tracking Tight (0.2em)"…) ficam falsos ao editar. Suspeitas: `bodySize` "escala todos os textos" (componentes com `--sarak-type-scale-*` em px não escalam); `accentColor` "badge novo" sem leitor |
| R2.8 ✔ | tokens que o gate dá como lidos e nada desenha | `identityAlignment`, `identityHoverEffect` (`branding.ts:17,81`) — nenhum leitor; o gate não vê porque as opções declaram `id` sem `value` (`optionValues` vazio, `check-token-reader.mjs:211-212`; mesmo parse vazio em `inputBorderType`, `h1Weight`, `h2Weight`, `bodyWeight`, `headingTransform`); `glassSpecularity`/`glassRoughness` só chegam a `--sarak-surface-specular/-roughness` (`_theme.css:86-87`), que ninguém lê; `zIndexSidebar` só ao alias `--z-index-sidebar` (o cromo usa `z-[60]` fixo, `ChromeSidebarBody.tsx:98`); `badgeRadius` lido só pelo `SarakLightbox` (o badge usa `rounded-md`/`rounded-full`, `SarakBadge.tsx:103`) |
| R2.9 | leituras e escritas mortas | `SarakChart.tsx:58` lê `--animation-speed` (nada escreve); `SarakExpandableCard.tsx:51` lê `--font-size-factor` (só sob `[data-font-scale]`, nunca escrito); 24 seletores com atributo que nada escreve (`data-performance`, `data-perf-mode`, `data-glass`, `data-sx-theme`, `data-sx-surface`, `data-tabular-nums`) e `[data-sx-card-texture-type="aurora-classic"]` (valor fora das opções); `--sarak-on-accent` escrito e nunca lido |
| R2.10 ✔ | travas com furo | `variable-contract`: `scanFallbacks` chama `sameColor` sem o guarda `looksLikeColor` no ramo de variante (`helpers/variable-contract-core.ts:283`) — toda reserva `-rgb` passa (até "banana"); esconde `_base.css:34` (`var(--theme-primary-rgb, 59, 130, 246)`, padrão `0, 242, 255`) e `_colors.css:11` (`var(--sarak-card-bg-rgb, 255, 255, 255)`, padrão `15, 23, 42`); não julga reserva de nome derivado (`_base.css:39-40` `--accent-color, #06b6d4`; canais claros de `_colors.css:9-10`); declaração sob seletor que nunca casa conta como dono. `token-reader`: opção sem `value`. `css-important`: não vê TypeScript. `panel-contract`: não confere a grade dos valores de tema |

## Lote 3 — Contraste e valores fixos restantes

| # | Onde | O defeito |
|---|---|---|
| R3.1 | pares desenhados fora do verificador (14 temas × 2 modos) | aviso e erro sobre a própria tinta de 10% no `AuthForm.tsx:112-113` (16 e 18 de 28, pior 1,00); `primaryColor` sobre `btnGhostHoverBg` (hover fantasma, `SarakButton.tsx:67`, `SarakIconButton.tsx:72`; 18/28) e sobre `primaryColor@0.1` (hover contorno; 17/28); perigo/sucesso no estilo `cyberpunk` (`useAtomicStyles.ts:72-78` zera o fundo, o texto segue `--sarak-on-*`: 1,11 no `blueprint-protocol`); `textColorMuted` sobre `tableHeaderBg` (1/28); erro sobre a barra lateral (`SarakShellUserWidget.tsx:149`, com `--theme-error-bg/-border` que nada define, `:100,149`) |
| R3.2 | contrapartes | nenhum tema declara `statusWarningColor`, `statusInfoColor`, `accentColor`, `tertiaryColor` na contraparte (herda o nativo; `kinetic-flow` aviso `#ffff00` sobre `#fff5f8`: 1,07) |
| R3.3 | valor fixo onde há token | `MessageList.tsx:47` e `ChatInput.tsx:56` com raio fixo (há `chatBubbleRadius`); `PremiumCheckbox.tsx:11` e `RecursiveMatrixNode.tsx:87` com `rgba(var(--sarak-primary-color,#00f2ff),0.5)` (inválido: a sombra some); `SarakCatalogGrid.tsx:126` `hover:text-red-400`; `SarakFilterSelect.tsx:21`, `SarakHelpButton.tsx:42` `text-slate-300`; `switchStyles.ts:17` pulso 1,6 s; `LazyEngineWrapper.tsx:25` `duration: 2`; atrasos fixos em `MessageList.tsx:50-51`, `SarakChatEngine.tsx:184-185`; reservas `--sarak-on-error/-success` `#ffffff` em `SarakButton.tsx:68-69`, `SarakIconButton.tsx:73` e `--sarak-on-muted` `#020617` em `SarakBadge.tsx:55` (o motor calcula o oposto no padrão). Suspeitas: raios fixos da matriz (`RecursiveMatrixNode.tsx:104,128,149,169,212`; há `matrixRadius`), ~46 `shadow-sm…2xl` em sobreposições sem token de sombra de sobreposição |
| R3.4 | `src/features/` | 158 classes de paleta Tailwind fixas, 37 `duration-N` e 8 durações de `framer-motion` fixas; brancos e pretos que o detector não pega (`ChartsMock.tsx:67-68` `fill="white"`, `ChatMock.tsx:36`, `SettingsMock.tsx:21-22`, `MockDocuments.tsx:96` `#000`, `ButtonPresetPreview.tsx:81`/`InputPresetPreview.tsx:47` `rgba(10,10,10,0.5)`, `useDeviceStyles.ts:11,14` `#1a1a1c`) — os mocks deveriam mostrar o tema |

### Herdado do veredito do lote 1 (2026-10-13)

| # | Lote | Onde | O que fazer |
|---|---|---|---|
| R2.11 | 2 | `scripts/consumer-kit/__tests__/kitGenerator.test.mjs`, `check-container-query-literal`, `generate-token-types.check` | estouram o tempo sob carga (passam isolados) — mesma regra do lote 5 da `plan-114`: limite declarado por caso pesado, com o motivo |
| R3.5 | 3 | `SarakChat.tsx:45`, `SarakChatEngine.tsx:62` | `!p-0` redundante desde que o padding cede à classe |

### Herdado do veredito do lote 2 (2026-10-13)

| # | Lote | Onde | O que fazer |
|---|---|---|---|
| R3.6 | 3 | reservas de alias de fachada em componentes (`var(--text-muted, #94a3b8)`, `--border-color`, `--color-theme-card`): 359 leituras em TypeScript, 323 divergentes do padrão do token | a reserva é o padrão do token dono (R42); o `variable-contract:check` passa a julgar também a reserva de alias em componente (fecha o limite 6) |

### Herdado do veredito do lote 3 (2026-10-13)

| # | Onde | O que fazer |
|---|---|---|
| F.1 | `.agents/skills/ui-criar-tema/scripts/__tests__/generate_theme_template.test.ts:17-33` | o teste grava um tema temporário **dentro de `src/core/Design/presets/themes/`** e o apaga no fim; o gerador do kit (`scripts/consumer-kit/kitFiles.mjs:86`) varre `src/` na mesma suíte e lê o arquivo já apagado (`ENOENT`) — falha intermitente de `kitGenerator.test.mjs` que não é de tempo. O teste escreve fora do repositório (pasta temporária) |
| F.2 | sobreposições (modal, menu, tooltip, toast, popup: ~44 `shadow-sm…2xl`) | sem token de sombra de sobreposição; recomendação do revisor: ler a sombra do tema (`--dynamic-shadow`), que já segue cor, direção e camadas — sem token novo |
| F.3 | `DashboardMetricsGrid.tsx:93` | `!p-0` redundante (mesma classe de R3.5) |

---

## Lote 4 — o resíduo da re-auditoria de fechamento (2026-10-13)

Medido sobre o worktree do lote 3 (três re-auditorias somente-leitura, instruídas a procurar também o que os gates
não veem). O revisor conferiu os pontos ✔. **Em zero, confirmados:** conflito de dono entre tokens; nome lido sem
emissor nem declaração viva; variável inline órfã na troca de tema; token sem leitor e opção sem regra; contrato dos
14 temas (chave, opção, faixa, grade, cor); controle sem ramo, sem descrição, `NaN`, `id` ≠ `value`; duplicata no
catálogo; validação de cor (30 sondas recusadas, 1777 cores dos temas aceitas).

### Cascata e classes

| # | Onde | O defeito | O que fazer |
|---|---|---|---|
| L4.1 ✔ | 11 classes arbitrárias com espaço dentro do colchete, que o Tailwind parte em duas e não gera: `SarakTooltip.tsx:191` `z-[var(--z-index-tooltip, 9000)]` (o tooltip `fixed` fica sem z-index — conferido: a classe não está no `dist/sarak.css`), `SarakAnalyticalPage.tsx:52,65` (hover sem fundo), e no painel `CardsCatalog.tsx:58`, `TypographyCatalog.tsx:35`, `PreviewCanvas.tsx:100`, `LiveDraftPreviewFrame.tsx:49,55`, `MasterControlPanel.tsx:174`, `LayoutTab.tsx:168,186` | o valor do tema nunca chega | corrigir (sem espaço, ou `_`) e **travar**: classe arbitrária com espaço é acusada |
| L4.2 | `_utilities.css:22` `.transition-sarak { transition … !important }` (isenta pelo limite 4 do `css-important`) | atropela `transition`/`duration-*` da classe do consumidor e a transição do cartão (`SarakExpandableCard.tsx:56`, `SarakSocialButton.tsx:40,73`) | sem `!important`, na camada que cede |
| L4.3 | `_atmosphere.css:636-639` `body[data-sarak-has-media="true"] .bg-theme-body { background-color: transparent !important }` | com fundo de mídia, apaga o fundo de componente que usa `bg-theme-body` (overlay do `SarakExpandableCard.tsx:96`, rótulo do `AuthSocialLogin.tsx:39`, `AuthForm.tsx:73`, `SarakAuthScreen.tsx:163`, `SarakActionCard.tsx:163`) | o fundo de mídia alcança só o contêiner de página, não o componente |
| L4.4 | `_theme.css:96` `.rounded-sarak`, `:106` `.rounded-input` na camada final; `mergeSarakClasses` só registra `rounded-btn` no grupo `rounded` | vencem o `rounded-*` da classe do consumidor | o merge conhece as três; a regra cede |
| L4.5 | 13 sombras de sobreposição fixas (`SarakModal.tsx:147`, `SarakToast.tsx:136`, `SarakTooltip.tsx:193`, `SarakContextMenu.tsx:87`, `AutocompletePopup.tsx:108`, `SarakDatePicker.tsx:155`, `SarakMultiSelect.tsx:143`, `SarakShellLanguageSelector.tsx:83`, `SarakSpotlight.tsx:131`, `ShellPreferencesMenu.tsx:62`, `ModelPicker.tsx:31`, `SarakHelpButton.tsx:25`, `SarakManagementGrid.tsx:115`) — antigo F.2 | a sombra não segue o tema | ler a sombra do tema (`--dynamic-shadow`), sem token novo (recomendação do revisor) |
| L4.6 | z-index fixo em sobreposição (`SarakSpotlight.tsx:122` 9999, `SarakHelpButton.tsx:20` e `SarakExpandableCard.tsx:96` 99999, `SarakShellLanguageSelector.tsx:83` e `ShellPreferencesMenu.tsx:62` 1000, `SarakSearch.tsx:72` e `SarakShellSearchWidget.tsx:110` 600, `SarakManagementGrid.tsx:110,122` 50); `SarakLightbox.tsx:102` 1100 abaixo do modal (2000); `zIndexToast` e `zIndexTooltip` com o mesmo padrão (9000) e `max` 9999 fora da grade de `step` 100 | a escada de camadas não é a do tema; lightbox aberto de dentro de modal fica por baixo | cada sobreposição lê o token da camada dela; escada sem empate; `max` na grade |

### Variável e injeção

| # | Onde | O defeito | O que fazer |
|---|---|---|---|
| L4.7 ✔ | `--color-theme-title`: o motor (`useDesignVariables.ts:206`) escreve `--text-main`; `_theme.css:15` declara `--sarak-topbar-title-color` | o inline vence: `topbarTitleColor` nunca chega aos usos de `theme-title`; dois donos com valores diferentes em 10 de 14 temas | um dono |
| L4.8 | `_base.css:16` `--theme-card: var(--theme-surface, …)` | sem Provider, o cartão vira a cor da superfície | a reserva é a do token dono |
| L4.9 | `_theme.css` usa `@theme {` (não `inline`): 43 de 45 nomes (`--radius-btn`, `--color-theme-primary`, `--duration-*`, `--z-index-*`…) resolvem no `:root` e o motor não os reemite no `DesignScope` | a prévia do painel mostra o tema aplicado, não o rascunho, em `rounded-btn`, `bg-theme-primary`… | o escopo do rascunho alcança esses nomes (`@theme inline` ou reemissão) — com prova no navegador dentro do `DesignScope` |
| L4.10 | 30 reservas em nomes derivados declarados em CSS da lib (`--radius-btn, 12px`; `--sarak-shadow-glow, rgba(59,130,246,.5)` ×9; `--color-theme-primary, #3b82f6`; `--color-theme-on-primary, #fff`; `--duration-slow, 0.5s`; `--duration-normal, 0.4s`…) | divergem do valor que o nome carrega | reserva = valor declarado; o `variable-contract` passa a julgar nome derivado declarado em CSS |
| L4.11 | `TextMock.tsx:93,115,122,132` `calc(var(--sarak-input-border-radius, 8) * 1px)` | o motor emite `8px`: `calc(px * px)` inválido → raio 0 | ler a variável direto; o gate acusa reserva sem unidade em variável com unidade |
| L4.12 | `SarakShellNav.tsx:184` `width: var(--sarak-border-width, thin)`; tolerância de alfa do gate (0,011) deixa `TextMock.tsx:92` passar com 0,02 × 0,03 | palavra-chave inválida para a propriedade; tolerância larga | reserva válida para a propriedade; tolerância apertada |
| L4.13 | `DesignInjector.tsx` não limpa ao desmontar (~946 variáveis, `#sarak-responsive-vars`, classe de modo) | o host fica com o tema depois de o Provider sair | limpar o que o injetor escreveu ao desmontar |

### Painel, catálogo e descrições

| # | Onde | O defeito | O que fazer |
|---|---|---|---|
| L4.14 | `ColorControl.tsx:73,83` + `composeColor` (`colorParts.ts:114-119`) | mexer só no alfa de um valor `var()`/`color-mix()` grava `rgba()` literal e perde o vínculo | gravar `color-mix(in srgb, var(--x) N%, transparent)` |
| L4.15 | `PresetCard.tsx:65` usa `cardShadowSpread` como desfoque em px; o schema o define como opacidade em % | um token, dois sentidos | um sentido |
| L4.16 | **catálogo dessincronizado do schema** em 14 entradas: `shadowOrientation` (opção `top-left` inexistente; faltam `top`, `dynamic`), `cardTitleFontWeight` (`100`, `800` a mais), `btnStyleType` (faltam `cyberpunk`, `neumorphism`), `h1Weight`/`h2Weight` (faltam `800`, `900`), `chartType` (falta `area`), `texture` (faltam 36), `maxContentWidth` (falta `1000px`); tipos trocados: `bgNoiseAnimation` e `layeredShadows` como `boolean`, `glassBlur` como `string`, `cardTitleIconGlow` como `number`, `cardSearchBorderBeamActive` como `color`, `globalBackgroundImageUrl` como `string` | a paridade 1:1:1 confere presença, não valor nem tipo | catálogo igual ao schema em opções e tipo; **a paridade passa a conferir opção e tipo** |
| L4.17 | descrições falsas: `animEnabled` ("toda a aplicação"; o único leitor é `SarakPageTransition.tsx:49`), `isNavHidden` ("remove a navegação"; recolhe a 74 px), `cardGeometricCut` ("um canto"; corta os quatro), `motionDurationFast` (cita `--duration-fast`, que não vale no `DesignScope` até L4.9) | a ajuda do painel mente | o código faz o que a descrição diz, ou a descrição diz o que o código faz |
| L4.18 | herdado: `generate_theme_template.test.ts` grava dentro de `src/` (antigo F.1) · `DashboardMetricsGrid.tsx:93` `!p-0` redundante (F.3) | colisão de testes; resíduo | o teste escreve fora do repositório |

### Roteado para outras plans (não é deste lote)

- **Trocar de tema herda token do tema anterior** (`useDesignSync.ts:54,68`; e a prévia do painel, `useDesignDraft.ts:208-212`, que o "Aplicar" grava): 127 de 182 pares de temas herdam, 66 deles os cantos de raio — já é critério da `plan-116` (aplicar tema); a prévia do painel entra lá também.
- **Contrapartes que não declaram** `secondaryColor`, `tertiaryColor`, `accentColor`, `statusWarningColor`, `statusInfoColor`, `btnPrimary*` (pares de aviso, info e secundária do painel e dos mocks, e o chip do `SarakCalendar` no `neo-brutalism`): a `plan-110` declara todo token estético dependente de modo na contraparte de cada tema — fecha lá, tema a tema.
- **Raios, sombras e durações literais sem token específico** (33 raios, 43 sombras e molas do `framer-motion` em componentes; mais no painel): sem token que os nomeie, é vocabulário de design, não desobediência; registrado no backlog.
