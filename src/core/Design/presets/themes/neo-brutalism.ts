import type { SarakThemePreset } from './index';
import { FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../schema/system';

// Neo Brutalism: o brutalismo da web é CLARO. Papel creme, borda preta de 3px, cor chapada sem gradiente, sombra dura deslocada
// (6px, sem desfoque), raio 4, Archivo 900 maiúsculo sobre Space Grotesk, ícone Lucide bold. Amarelo é o preenchimento da marca
// (botão, item ativo, cabeçalho de tabela); como TEXTO a primária é o cobalto, porque o amarelo não passa 4,5:1 sobre o papel.
// Declara todo token estético, menos a cor que a paleta `colorPalette` calcula; os funcionais valem o padrão do sistema. A `contraparte` é o modo escuro (preto quente, borda e
// sombra creme, amarelo vira texto); geometria, tipografia e movimento ficam.
export const neobrutalismTheme: SarakThemePreset = {
    id: 'neo-brutalism',
    name: 'Neo Brutalism',
    description: 'Brutalismo claro: papel creme, borda preta grossa, cor chapada, sombra dura deslocada.',
    design: {
        // --- 0. Configurações Globais ---
        mode: 'light',
        // as cores saem da paleta; abaixo ficam só as sobrescritas justificadas
        colorPalette: 'cobalto-vivo',
        bodySize: '16px',

        // --- Identidade Visual ---
        identityAlignment: 'left',
        identityPadding: 16,
        identityFontFamily: "'Archivo', sans-serif",
        identityFontWeight: 900,
        identityTracking: 0,
        identityHoverEffect: 'scale',
        // --- Configurações de Layout ---
        layoutDensity: 'comfortable',
        maxContentWidth: FLUID_MAX_CONTENT_WIDTH_OPTION,
        layoutPadding: { mob: 16, tab: 24, desk: 32 },
        borderRadius: { mob: 4, tab: 4, desk: 4 },
        borderWidth: 3,
        borderStyle: 'solid',
        layoutGap: { mob: 16, tab: 20, desk: 24 },
        layoutGapSm: { mob: 8, tab: 10, desk: 12 },
        layoutGapMd: { mob: 16, tab: 20, desk: 24 },
        layoutGapLg: { mob: 24, tab: 32, desk: 36 },
        iconFamily: 'lucide',
        iconWeight: 'bold',
        iconStrokeWidth: 2.5,

        // --- Container de Nav ---
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        sidebarColor: '#ffffff',
        sidebarNoiseOpacity: 0,
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        topbarColor: '#ffffff',
        topbarNoiseOpacity: 0,
        // borda preta chapada é a assinatura brutalista
        sidebarBorderColor: '#111111',
        sidebarBorderWidth: 3,
        sidebarBorderStyle: 'solid',
        sidebarBorderSide: 'all',
        sidebarBackgroundStyle: 'solid',
        sidebarActiveItemStyle: 'filled',
        sidebarItemDensity: 'spacious',
        sidebarIconSize: 20,
        // borda preta chapada é a assinatura brutalista
        topbarBorderColor: '#111111',
        topbarBorderWidth: 3,
        topbarBorderStyle: 'solid',
        topbarBorderSide: 'all',
        topbarBackgroundStyle: 'solid',
        topbarActiveItemStyle: 'pill',
        topbarItemDensity: 'spacious',
        topbarIconSize: 20,
        topbarBlur: 0,
        topbarShadow: '0 2px 16px rgba(15,23,42,0.08)',
        tabGap: { mob: 4, tab: 6, desk: 8 },
        tabSectionMargin: { mob: 8, tab: 12, desk: 16 },
        navActiveMarkerGlow: 0,
        navItemRadius: 4,
        sidebarBlur: 0,
        sidebarShadow: 'none',
        // --- Card Geral ---
        cardBorderRadius: { mob: 4, tab: 4, desk: 4 },
        cardRadiusTL: { mob: 4, tab: 4, desk: 4 },
        cardRadiusTR: { mob: 4, tab: 4, desk: 4 },
        cardRadiusBL: { mob: 4, tab: 4, desk: 4 },
        cardRadiusBR: { mob: 4, tab: 4, desk: 4 },
        cardGeometricCut: 0,
        cardBackdropBlur: 0,
        cardSurfaceOpacity: 1,
        cardBorderWidth: 3,
        cardBorderOpacity: 1,
        cardBorderTop: 3,
        cardBorderBottom: 3,
        cardBorderLeft: 3,
        cardBorderRight: 3,
        cardInnerGlowWidth: 0,
        cardTextureType: 'crosshatch',
        cardTextureOpacity: 0.05,
        // borda preta chapada é a assinatura brutalista
        cardHeaderBorder: '#111111',
        cardHeaderPadding: { mob: 12, tab: 16, desk: 16 },
        // borda preta chapada é a assinatura brutalista
        cardFooterBorder: '#111111',
        cardShadowSpread: 100,
        cardShadowOffsetX: 6,
        cardShadowOffsetY: 6,
        cardShadowBlur: 0,
        cardShadowExpansion: 0,
        cardGlowIntensity: 0,
        cardHoverTranslate: 0,
        cardHoverGlowIncrease: 0,
        cardSpotlightOpacity: 0,
        cardPaddingMd: { mob: 16, tab: 20, desk: 24 },
        cardLayoutDirection: 'column',
        cardTextAlign: 'left',
        // sombra dura deslocada 6px/6px sem desfoque, escrita inteira: a cor tem de trocar na contraparte, senão preto sobre preto some
        cardShadow: '6px 6px 0 0 #111111',
        borderBeamEnabled: false,
        imageCardOverlayOpacity: 0.6,
        imageCardHoverZoom: 1.05,
        imageCardShadowOffsetY: 10,
        imageCardShadowBlur: 30,
        imageCardShadowSpread: 10,
        imageCardGlowBlur: 40,
        catalogSectionRadius: 0.25,
        catalogItemRadius: 0.25,
        // --- Card de Título ---
        cardTitleFontSize: { mob: 16, tab: 18, desk: 20 },
        cardTitleFontWeight: '900',
        cardTitleLetterSpacing: 0,
        cardTitleIconGlowBlur: 0,

        // --- Card de Ação ---
        cardActionBtnBorderRadius: { mob: 4, tab: 4, desk: 4 },
        cardActionBtnPadding: 16,
        cardActionClickScale: 0.96,
        // --- Card de Busca ---
        cardSearchBorderBeamActive: true,
        // --- Sobreposições (Overlays) ---
        modalActionAlignment: 'right',
        modalHeaderStyle: 'inline',
        modalOverlayBlur: 0,
        modalBorderRadius: { mob: 4, tab: 4, desk: 4 },
        tooltipRadius: 4,
        toastAccentWidth: 6,
        // --- Configuração de Tabelas ---
        tableDensity: 'comfortable',
        tableZebraStriping: true,
        tableBorderRadius: { mob: 4, tab: 4, desk: 4 },
        tableCellPadding: { mob: 8, tab: 10, desk: 12 },
        // borda preta chapada é a assinatura brutalista
        tableBorderColor: '#111111',
        kanbanHeaderPaddingY: 4,
        kanbanHeaderTracking: 0.04,
        kanbanCardRadius: 4,
        // --- Tipografia e Escala ---
        headingFont: "'Archivo', sans-serif",
        bodyFont: "'Space Grotesk', sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        h1Size: { mob: 36, tab: 48, desk: 60 },
        h1Weight: '800',
        h1LineHeight: 1.05,
        h1LetterSpacing: -0.5,
        h2Size: { mob: 24, tab: 28, desk: 32 },
        h2Weight: '800',
        h2LineHeight: 1.2,
        h3Size: 24,
        bodyLineHeight: 1.6,
        bodyWeight: '500',
        headingTransform: 'uppercase',
        textSmoothing: true,
        textGlowIntensity: 0,
        typeScaleMicro: 11,
        typeScaleTiny: 11,
        typeScale3xs: 11,
        typeScale2xs: 11,
        typeScaleCaption: 12,
        trackingTight: 0.2,
        trackingSnug: 0.25,
        trackingWide: 0.3,
        trackingWider: 0.4,
        trackingWidest: 0.5,
        trackingUltra: 0.8,
        typeScaleXs: 11,
        typeScaleXl: 20,

        // --- Botão de Ação ---
        btnBorderRadius: { mob: 4, tab: 4, desk: 4 },
        btnRadiusTL: { mob: 4, tab: 4, desk: 4 },
        btnRadiusTR: { mob: 4, tab: 4, desk: 4 },
        btnRadiusBL: { mob: 4, tab: 4, desk: 4 },
        btnRadiusBR: { mob: 4, tab: 4, desk: 4 },
        btnHoverScale: 1,
        btnActiveScale: 0.96,
        btnStyleType: 'matte',
        btnNeonPulseSpeed: 0,
        btnBackdropBlur: 0,
        iconButtonGlowBlurSm: 5,
        iconButtonGlowBlurMd: 8,
        iconButtonGlowBlurLg: 12,
        iconButtonFrostedShadowOffsetY: 4,
        iconButtonFrostedShadowBlur: 16,
        actionGlowShadowOffsetY: 10,
        actionGlowShadowBlur: 20,
        actionGlowShadowSpread: 10,

        // --- Campo de Entrada (Input) ---
        inputBorderRadius: { mob: 4, tab: 4, desk: 4 },
        inputBorderType: 'solid',
        inputBackdropBlur: 0,
        inputShadow: 'none',
        // borda preta chapada é a assinatura brutalista
        inputBorderColor: '#111111',
        searchBackdropBlur: 0,

        // --- Alternadores (Toggles) ---
        switchStyleType: 'tactile',
        switchBackdropBlur: 0,
        // --- Paletas e Gradientes ---
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        surfaceColor: '#ffffff',
        colorDepth: 1,
        colorVariation: 1,
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        cardBackgroundColor: '#ffffff',
        // borda preta chapada é a assinatura brutalista
        cardBorderColor: '#111111',
        // --- Gráficos & Dados ---
        chartGridOpacity: 0.12,
        chartType: 'bar',
        chartShowGrid: true,
        chartThickness: 3,
        chartSmoothing: false,
        // --- Transições e Animações ---
        pageTransitionType: 'slide-up',
        cardHoverStyle: 'expand',
        // --- Fundo e Atmosfera ---
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        colorBgBody: '#fff6dc',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        colorBgLayer1: '#ffffff',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        colorBgLayer2: '#ffecb8',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        bgBaseColor: '#fff6dc',
        bgGradientMode: 'none',
        bgGradientAngle: 180,
        surfaceMaterial: 'sleek',
        surfaceIntensity: 0,
        borderType: 'solid',
        systemTone: 'none',
        // dots: meio-tom em tinta, pinta com a cor de textura e vale nos dois modos
        texture: 'dots',
        textureOpacity: 0.1,
        bgNoiseDensity: 0,
        bgNoiseAnimation: 0,
        glassBlur: 0,
        glassOpacity: 0,
        glassSpecularity: 0,
        glassRoughness: 0.05,
        glassSaturation: 1.2,
        glassEdgeWidth: 1,
        shadowIntensity: 0,
        layeredShadows: 0,
        shadowOrientation: 'bottom',
        shadowColorMode: 'neutral',
        shadowAmbientAlpha: 0,
        shadowProjectionBlur: 0,
        shadowProjectionAlpha: 0,
        vignetteOpacity: 0,
        vignetteSoftness: 50,
        globalSaturation: 1,
        globalContrast: 1,

        // --- Interface de Chat ---
        chatBubbleRadius: { mob: 4, tab: 4, desk: 4 },
        chatBubbleStyle: 'solid',
        chatAnimationSpeed: 0.05,

        // --- Cores Semânticas ---
        badgeRadius: 4,
        statusGlowBlur: 0,
        progressBarHeight: 12,
        progressBarRadius: 0,
        // --- Ícones e Estética ---
        flowNodeRadius: { mob: 4, tab: 4, desk: 4 },
        flowGridStyle: 'lines',
        dotGridDotOffset: 2,
        dotGridDotSize: 1,
        dotGridTileSize: 40,
        emptyStateOrbOuter: 500,
        emptyStateOrbInner: 300,
        emptyStateOrbBlur: 100,
        emptyStateVoidLetterOffset: 0.8,
        emptyStateRingRadius: 0,
        emptyStateCaptionMaxWidth: 280,
        skeletonRowRadius: 4,
        authHeroOrbBlur: 120,
        chatBubbleGlassBlur: 12,
        flowNodePadding: 10,
        flowNodeBlur: 5,

        // --- Movimento e Física ---
        motionEaseMain: 'cubic-bezier(0.4, 0, 0.2, 1)',
        motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
        motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
        motionDurationInstant: 0.05,
        motionDurationFast: 0.1,
        motionDurationNormal: 0.15,
        motionDurationSlow: 0.25,
        motionStaggerDelay: 0.03,
        // --- Barras de Rolagem ---
        scrollWidth: { mob: 8, tab: 10, desk: 12 },
        scrollRadius: { mob: 0, tab: 0, desk: 0 },
        scrollTrackOpacity: 0.1,
        scrollThumbOpacity: 0.85,
        scrollThumbHoverOpacity: 1,
        scrollPadding: { mob: 0, tab: 2, desk: 2 },

        // --- Componentes Avançados ---
        matrixGap: 12,
        matrixRadius: 4,
        matrixBlur: 0,
        // --- Mídia e Background ---
        globalBackgroundPosition: 'absolute',
        globalBackgroundImageUrl: '',
        globalBackgroundBlur: 0,
        globalBackgroundOpacity: 1,

        // --- Estrutura e Macro-Layout ---
        globalSectionGap: 24,
        headerAlignment: 'space-between',
        formFieldDensity: 'comfortable',
        enabledLanguages: ['pt', 'en', 'es', 'fr', 'de', 'it'],
    },
    contraparte: {
        mode: 'dark',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        sidebarColor: '#1c1a17',
        sidebarNoiseOpacity: 0,
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        topbarColor: '#1c1a17',
        topbarNoiseOpacity: 0,
        // borda preta chapada é a assinatura brutalista
        sidebarBorderColor: '#f4ead2',
        // borda preta chapada é a assinatura brutalista
        topbarBorderColor: '#f4ead2',
        topbarShadow: '0 2px 18px rgba(255,212,0,0.14)',
        sidebarShadow: 'none',
        cardSurfaceOpacity: 1,
        cardBorderOpacity: 1,
        cardTextureOpacity: 0.06,
        // borda preta chapada é a assinatura brutalista
        cardHeaderBorder: '#f4ead2',
        // borda preta chapada é a assinatura brutalista
        cardFooterBorder: '#f4ead2',
        cardShadowSpread: 100,
        cardGlowIntensity: 0,
        cardHoverGlowIncrease: 0,
        cardSpotlightOpacity: 0,
        cardShadow: '6px 6px 0 0 #f4ead2',
        imageCardOverlayOpacity: 0.6,
        // borda preta chapada é a assinatura brutalista
        tableBorderColor: '#f4ead2',
        textGlowIntensity: 0,
        // borda preta chapada é a assinatura brutalista
        inputBorderColor: '#a89d86',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        surfaceColor: '#1c1a17',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        cardBackgroundColor: '#1c1a17',
        // borda preta chapada é a assinatura brutalista
        cardBorderColor: '#f4ead2',
        chartGridOpacity: 0.16,
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        colorBgBody: '#121110',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        colorBgLayer1: '#1c1a17',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        colorBgLayer2: '#24211c',
        // papel creme quente do brutalismo; a neutra da paleta é cinza frio
        bgBaseColor: '#121110',
        surfaceIntensity: 0,
        textureOpacity: 0.12,
        bgNoiseDensity: 0,
        glassOpacity: 0,
        glassSpecularity: 0,
        shadowIntensity: 0,
        layeredShadows: 0,
        shadowAmbientAlpha: 0,
        shadowProjectionAlpha: 0,
        vignetteOpacity: 0,
        scrollTrackOpacity: 0.08,
        scrollThumbOpacity: 0.3,
        scrollThumbHoverOpacity: 0.6,
        globalBackgroundImageUrl: '',
        globalBackgroundOpacity: 1,
    }
};
