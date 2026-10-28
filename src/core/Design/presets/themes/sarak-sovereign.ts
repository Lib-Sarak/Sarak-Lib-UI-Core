import type { SarakThemePreset } from './index';
import { FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../schema/system';

// Sovereign: sala de comando. Vidro escuro sobre uma constelação, ciano contido (H184 S88, fora do S100 dos neons do
// conjunto), Phosphor preenchido como linguagem de produto. É o tema que carrega sem ninguém escolher, e o valor de
// cada token estético aqui, menos a cor, é o PADRÃO do schema (`defaultValue`): componente sem Provider mostra a geometria,
// a tipografia e o cromo deste tema. A cor sai da paleta `colorPalette`; os funcionais (camadas, alvo de toque, larguras do
// cromo, comportamento) valem o padrão do sistema e não aparecem. A `contraparte` troca só o que carrega modo (cor, opacidade, sombra); geometria,
// tipografia e movimento vêm do modo principal, que é o que mantém a identidade entre claro e escuro.
export const sarakSovereignTheme: SarakThemePreset = {
    id: 'sarak-sovereign',
    name: 'Sarak Sovereign',
    description: 'Sala de comando: vidro escuro sobre constelação, ciano contido, Outfit nos títulos e Phosphor preenchido.',
    design: {
        // --- 0. Configurações Globais ---
        mode: 'dark',
        // as cores saem da paleta; abaixo ficam só as sobrescritas justificadas
        colorPalette: 'ciano-violeta',
        bodySize: '14px',

        // --- Identidade Visual ---
        identityAlignment: 'left',
        identityPadding: 16,
        identityFontFamily: "'Outfit', sans-serif",
        identityFontWeight: 800,
        identityTracking: 0,
        identityHoverEffect: 'opacity',

        // --- Configurações de Layout ---
        layoutDensity: 'comfortable',
        maxContentWidth: FLUID_MAX_CONTENT_WIDTH_OPTION,
        layoutPadding: { mob: 16, tab: 24, desk: 32 },
        borderRadius: { mob: 8, tab: 10, desk: 12 },
        borderWidth: 1,
        borderStyle: 'solid',
        layoutGap: { mob: 16, tab: 20, desk: 24 },
        layoutGapSm: { mob: 8, tab: 10, desk: 12 },
        layoutGapMd: { mob: 16, tab: 20, desk: 24 },
        layoutGapLg: { mob: 24, tab: 32, desk: 36 },
        iconFamily: 'phosphor',
        // fill: Phosphor preenchido é a assinatura do tema
        iconWeight: 'fill',
        iconStrokeWidth: 2,

        // --- Container de Nav ---
        sidebarNoiseOpacity: 0,
        topbarNoiseOpacity: 0,
        sidebarBorderWidth: 1,
        sidebarBorderStyle: 'solid',
        sidebarBorderSide: 'edge',
        sidebarBackgroundStyle: 'solid',
        sidebarActiveItemStyle: 'bar',
        sidebarItemDensity: 'comfortable',
        sidebarIconSize: 18,
        topbarBorderWidth: 1,
        topbarBorderStyle: 'solid',
        topbarBorderSide: 'edge',
        topbarBackgroundStyle: 'solid',
        topbarActiveItemStyle: 'bar',
        topbarItemDensity: 'comfortable',
        topbarIconSize: 18,
        topbarBlur: 0,
        topbarShadow: '0 2px 18px rgba(25,227,240,0.14)',
        tabGap: { mob: 4, tab: 6, desk: 8 },
        tabSectionMargin: { mob: 8, tab: 12, desk: 16 },
        navActiveMarkerGlow: 8,
        navItemRadius: 12,
        sidebarBlur: 10,
        sidebarShadow: '10px 0 30px rgba(0,0,0,0.5)',

        // --- Card Geral ---
        cardBorderRadius: { mob: 10, tab: 14, desk: 14 },
        cardRadiusTL: { mob: 10, tab: 14, desk: 14 },
        cardRadiusTR: { mob: 10, tab: 14, desk: 14 },
        cardRadiusBL: { mob: 10, tab: 14, desk: 14 },
        cardRadiusBR: { mob: 10, tab: 14, desk: 14 },
        cardGeometricCut: 0,
        cardBackdropBlur: 12,
        // 70%: o vidro deixa a constelação aparecer por baixo
        cardSurfaceOpacity: 0.7,
        cardBorderWidth: 1,
        cardBorderOpacity: 1,
        cardBorderTop: 1,
        cardBorderBottom: 1,
        cardBorderLeft: 1,
        cardBorderRight: 1,
        cardInnerGlowWidth: 1,
        // micro-dots: textura discreta, não compete com o conteúdo do cartão
        cardTextureType: 'micro-dots',
        cardTextureOpacity: 0.06,
        cardHeaderPadding: { mob: 12, tab: 16, desk: 16 },
        cardShadowSpread: 20,
        cardShadowOffsetX: 0,
        cardShadowOffsetY: 20,
        cardShadowBlur: 50,
        cardShadowExpansion: -12,
        cardGlowIntensity: 0.25,
        cardHoverTranslate: -2,
        cardHoverGlowIncrease: 0.2,
        cardSpotlightOpacity: 0.1,
        cardPaddingMd: { mob: 16, tab: 20, desk: 24 },
        cardLayoutDirection: 'column',
        cardTextAlign: 'left',
        cardShadow: 'none',
        borderBeamEnabled: false,
        imageCardOverlayOpacity: 0.5,
        imageCardHoverZoom: 1.05,
        imageCardShadowOffsetY: 10,
        imageCardShadowBlur: 30,
        imageCardShadowSpread: 10,
        imageCardGlowBlur: 40,
        catalogSectionRadius: 3,
        catalogItemRadius: 2,

        // --- Card de Título ---
        cardTitleFontSize: { mob: 16, tab: 18, desk: 20 },
        cardTitleFontWeight: '900',
        cardTitleLetterSpacing: 0,
        cardTitleIconGlowBlur: 15,

        // --- Card de Ação ---
        cardActionBtnBorderRadius: { mob: 6, tab: 8, desk: 8 },
        cardActionBtnPadding: 16,
        cardActionClickScale: 0.96,

        // --- Card de Busca ---
        cardSearchBorderBeamActive: true,

        // --- Sobreposições (Overlays) ---
        modalActionAlignment: 'right',
        modalHeaderStyle: 'inline',
        modalOverlayBlur: 8,
        modalBorderRadius: { mob: 12, tab: 16, desk: 16 },
        tooltipRadius: 6,
        toastAccentWidth: 4,

        // --- Configuração de Tabelas ---
        tableDensity: 'comfortable',
        tableZebraStriping: false,
        tableBorderRadius: { mob: 10, tab: 14, desk: 14 },
        tableCellPadding: { mob: 8, tab: 10, desk: 12 },
        kanbanHeaderPaddingY: 4,
        kanbanHeaderTracking: 0.04,
        kanbanCardRadius: 8,

        // --- Tipografia e Escala ---
        headingFont: "'Outfit', sans-serif",
        bodyFont: "'Inter', sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        h1Size: { mob: 32, tab: 40, desk: 48 },
        h1Weight: '800',
        h1LineHeight: 1.1,
        h1LetterSpacing: -1,
        h2Size: { mob: 24, tab: 28, desk: 32 },
        h2Weight: '700',
        h2LineHeight: 1.2,
        h3Size: 24,
        bodyLineHeight: 1.6,
        bodyWeight: '400',
        headingTransform: 'none',
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
        btnBorderRadius: { mob: 8, tab: 10, desk: 10 },
        btnRadiusTL: { mob: 8, tab: 10, desk: 10 },
        btnRadiusTR: { mob: 8, tab: 10, desk: 10 },
        btnRadiusBL: { mob: 8, tab: 10, desk: 10 },
        btnRadiusBR: { mob: 8, tab: 10, desk: 10 },
        btnHoverScale: 1.02,
        btnActiveScale: 0.98,
        // frosted: botão de vidro, coerente com o cartão
        btnStyleType: 'frosted',
        btnNeonPulseSpeed: 0,
        btnBackdropBlur: 8,
        iconButtonGlowBlurSm: 5,
        iconButtonGlowBlurMd: 8,
        iconButtonGlowBlurLg: 12,
        iconButtonFrostedShadowOffsetY: 4,
        iconButtonFrostedShadowBlur: 16,
        actionGlowShadowOffsetY: 10,
        actionGlowShadowBlur: 20,
        actionGlowShadowSpread: 10,

        // --- Campo de Entrada (Input) ---
        inputBorderRadius: { mob: 8, tab: 10, desk: 10 },
        inputBorderType: 'solid',
        inputBackdropBlur: 8,
        inputShadow: 'none',
        searchBackdropBlur: 8,

        // --- Alternadores (Toggles) ---
        switchStyleType: 'tactile',
        switchBackdropBlur: 4,

        // --- Paletas e Gradientes ---
        colorDepth: 1,
        colorVariation: 1,

        // --- Gráficos & Dados ---
        chartGridOpacity: 0.06,
        // area: leitura de tendência com preenchimento suave
        chartType: 'area',
        chartShowGrid: true,
        chartThickness: 2,
        chartSmoothing: true,

        // --- Transições e Animações ---
        pageTransitionType: 'fade',
        // glow-only: o cartão acende em vez de se mover
        cardHoverStyle: 'glow-only',

        // --- Fundo e Atmosfera ---
        // radial: o brilho vem do centro, como um painel de operação
        bgGradientMode: 'radial',
        bgGradientAngle: 135,
        surfaceMaterial: 'frosted',
        surfaceIntensity: 0.5,
        borderType: 'solid',
        systemTone: 'none',
        // constellation pinta com --theme-texture-color, então vale nos dois modos
        texture: 'constellation',
        textureOpacity: 0.3,
        bgNoiseDensity: 0.05,
        // 0: o grão fica parado; movimento é decisão de quem pede, não do padrão
        bgNoiseAnimation: 0,
        glassBlur: 14,
        glassOpacity: 0.1,
        glassSpecularity: 0.1,
        glassRoughness: 0.05,
        glassSaturation: 1.2,
        glassEdgeWidth: 1,
        shadowIntensity: 0.5,
        layeredShadows: 1,
        shadowOrientation: 'bottom',
        shadowColorMode: 'neutral',
        shadowAmbientAlpha: 0.4,
        shadowProjectionBlur: 40,
        shadowProjectionAlpha: 0.2,
        vignetteOpacity: 0.3,
        vignetteSoftness: 50,
        globalSaturation: 1,
        globalContrast: 1,

        // --- Interface de Chat ---
        chatBubbleRadius: { mob: 8, tab: 10, desk: 12 },
        chatBubbleStyle: 'glass',
        chatAnimationSpeed: 0.05,

        // --- Cores Semânticas ---
        badgeRadius: 99,
        statusGlowBlur: 0,
        progressBarHeight: 8,
        progressBarRadius: 8,

        // --- Ícones e Estética ---
        flowNodeRadius: { mob: 8, tab: 10, desk: 12 },
        flowGridStyle: 'dots',
        dotGridDotOffset: 2,
        dotGridDotSize: 1,
        dotGridTileSize: 40,
        emptyStateOrbOuter: 500,
        emptyStateOrbInner: 300,
        emptyStateOrbBlur: 100,
        emptyStateVoidLetterOffset: 0.8,
        emptyStateRingRadius: 2,
        emptyStateCaptionMaxWidth: 280,
        skeletonRowRadius: 4,
        authHeroOrbBlur: 120,
        chatBubbleGlassBlur: 12,
        flowNodePadding: 10,
        flowNodeBlur: 5,

        // --- Movimento e Física ---
        // Expo Glide: desacelera forte no fim, sensação de painel que assenta
        motionEaseMain: 'cubic-bezier(0.16, 1, 0.3, 1)',
        motionEaseOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        motionEaseIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
        motionDurationInstant: 0.1,
        motionDurationFast: 0.2,
        motionDurationNormal: 0.3,
        motionDurationSlow: 0.6,
        motionStaggerDelay: 0.05,

        // --- Barras de Rolagem ---
        scrollWidth: { mob: 4, tab: 4, desk: 6 },
        scrollRadius: { mob: 8, tab: 10, desk: 10 },
        scrollTrackOpacity: 0.05,
        scrollThumbOpacity: 0.2,
        scrollThumbHoverOpacity: 0.5,
        scrollPadding: { mob: 0, tab: 2, desk: 2 },

        // --- Componentes Avançados ---
        matrixGap: 12,
        matrixRadius: 12,
        matrixBlur: 10,

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
        mode: 'light',
        sidebarNoiseOpacity: 0,
        topbarNoiseOpacity: 0,
        topbarShadow: '0 2px 16px rgba(15,23,42,0.08)',
        sidebarShadow: '10px 0 30px rgba(15, 23, 42, 0.08)',
        // 70%: o vidro deixa a constelação aparecer por baixo
        cardSurfaceOpacity: 0.9,
        cardBorderOpacity: 1,
        cardTextureOpacity: 0.06,
        cardShadowSpread: 12,
        cardGlowIntensity: 0.18,
        cardHoverGlowIncrease: 0.2,
        cardSpotlightOpacity: 0.08,
        cardShadow: 'none',
        imageCardOverlayOpacity: 0.55,
        textGlowIntensity: 0,
        chartGridOpacity: 0.08,
        surfaceIntensity: 0.5,
        textureOpacity: 0.3,
        bgNoiseDensity: 0.04,
        glassOpacity: 0.5,
        glassSpecularity: 0.3,
        shadowIntensity: 0.3,
        layeredShadows: 1,
        shadowAmbientAlpha: 0.2,
        shadowProjectionAlpha: 0.12,
        vignetteOpacity: 0.12,
        scrollTrackOpacity: 0.05,
        scrollThumbOpacity: 0.25,
        scrollThumbHoverOpacity: 0.5,
        globalBackgroundImageUrl: '',
        globalBackgroundOpacity: 1,
    }
};
