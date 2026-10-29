import * as React$1 from 'react';
import React__default, { ReactNode, ButtonHTMLAttributes, ReactElement, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes, Key, LazyExoticComponent } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/** Idioma do sistema importador: código BCP-47, com rótulo opcional para o seletor. */
type SarakI18nLanguage = string | {
    code: string;
    label: string;
};
/**
 * `options.i18n` do `SarakUIProvider` — o sistema declara o idioma e a lib o segue e o avisa.
 * Omitida, a fonte é `design.language`, como antes.
 */
interface SarakI18nOptions {
    /** Os idiomas DO SISTEMA, em BCP-47 (`'pt-BR'`, `'en-US'`); omitida, o seletor lista os do tema. */
    languages?: SarakI18nLanguage[];
    /** Controlado: o idioma atual do i18n do sistema. Com ele, a troca no seletor não grava preferência. */
    language?: string;
    /** O usuário trocou no seletor; o i18n do sistema deve trocar junto. */
    onLanguageChange?: (code: string) => void;
}

/**
 * Sarak Industrial Design Schema (v11.0)
 *
 * Define o contrato para mapeamento de 100% das funcionalidades e componentes.
 */
type SarakTokenValueType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'slider' | 'font' | 'text' | 'image' | 'file';
type SarakResponsiveValue<T> = {
    desk: T;
    tab: T;
    mob: T;
};
/** Espaço de valores que um token pode assumir (espelha SarakDesignTokens). */
type SarakTokenValue = string | number | boolean | SarakResponsiveValue<string | number>;
interface SarakDesignToken {
    id: string;
    label: string;
    type: SarakTokenValueType;
    isResponsive?: boolean;
    semanticRole?: 'bg' | 'text' | 'border' | 'primary';
    iconFamily?: 'lucide' | 'phosphor' | 'tabler';
    iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    unit?: 'px' | '%' | 'rem' | 'em' | 'ms' | 'deg' | 's';
    cssVars?: string[];
    generateVariants?: boolean;
    /**
     * Id do token MESTRE de que este é exceção (ex.: `cardRadiusTL` é exceção de `cardBorderRadius`).
     * O mestre escreve as variáveis de todos os cantos; a exceção só as sobrescreve quando o tema a
     * declara — com valor diferente do padrão do schema. Sem declarar, o mestre chega ao canto.
     */
    exceptionOf?: string;
    constraints?: {
        min?: number;
        max?: number;
        step?: number;
        options?: {
            value?: string;
            id?: string;
            label: string;
        }[];
    };
    options?: {
        value?: string;
        id?: string;
        label: string;
    }[];
    min?: number;
    max?: number;
    step?: number;
    defaultValue: SarakTokenValue;
    legacyValue?: SarakTokenValue;
    description?: string;
    /**
     * Classificação de eixo visual, usada para medir a completude de um tema por eixo
     * (`findMissingThemeAxes`, em `src/core/Design/utils/themeAxes.ts`). Opcional: tokens
     * estruturais/não-visuais (ex: `mode`, `navigationStyle`) podem não ter eixo.
     */
    axis?: 'color' | 'geometry' | 'elevation' | 'texture' | 'density' | 'motion';
    /**
     * Presença = token Estrutural (Alavanca 2): o valor não é injetado como CSS Variable,
     * é lido em JS por um Hook Controlador que decide className/style (ex: direção,
     * posição, alinhamento). Lista os hooks/métodos consumidores (ex: ['useCardLayoutStyles']).
     * Ausência = token de Valor (Alavanca 1, default): consumido via `var(--sarak-*, fallback)`.
     */
    structuralConsumer?: string[];
    /**
     * Natureza do token. `aesthetic`: o tema o projeta (cor, elevação, textura, tipografia, geometria visual,
     * densidade visual, movimento). `functional`: deve ser igual em todo tema por segurança, acessibilidade ou
     * consistência de comportamento (camadas, alvo de toque, larguras e posições do cromo, breakpoints,
     * comportamento) — o tema embarcado não o declara. Critério completo: o anexo da plan de temas.
     */
    kind?: 'aesthetic' | 'functional';
    /** `true` quando o valor muda com o modo claro/escuro, e por isso entra na `contraparte` do tema. */
    modeDependent?: boolean;
    /** O que o token muda na tela e onde, em uma ou duas frases, sem repetir o rótulo nem transcrever opções. */
    usage?: string;
    /** Ids de tokens sem os quais este não tem efeito visível (ex.: opacidade da textura × tipo de textura). */
    interactsWith?: string[];
}

interface SarakDesignTokens {
    accentColor: string;
    actionGlowShadowBlur: number;
    actionGlowShadowOffsetY: number;
    actionGlowShadowSpread: number;
    aiGlowColor: string;
    animEnabled: boolean;
    authHeroOrbBlur: number;
    badgeRadius: number;
    bgBaseColor: string;
    bgGradientAngle: number;
    bgGradientMode: string;
    bgNoiseAnimation: number;
    bgNoiseDensity: number;
    bodyFont: string;
    bodyLineHeight: number;
    bodySize: string;
    bodyWeight: string;
    borderBeamEnabled: boolean;
    borderRadius: number | SarakResponsiveValue<number>;
    borderStyle: string;
    borderType: string;
    borderWidth: number;
    brandLogoSizeCollapsed: number;
    breakpointDesktop: number;
    breakpointTablet: number;
    btnActiveScale: number;
    btnBackdropBlur: number;
    btnBorderRadius: number | SarakResponsiveValue<number>;
    btnGhostHoverBg: string;
    btnHoverScale: number;
    btnNeonGlowColor: string;
    btnNeonPulseSpeed: number;
    btnPrimaryBg: string;
    btnPrimaryText: string;
    btnRadiusBL: number | SarakResponsiveValue<number>;
    btnRadiusBR: number | SarakResponsiveValue<number>;
    btnRadiusTL: number | SarakResponsiveValue<number>;
    btnRadiusTR: number | SarakResponsiveValue<number>;
    btnSecondaryBg: string;
    btnStyleType: string;
    buttonIconPosition: string;
    buttonWidthStrategy: string;
    cardActionBtnBorderRadius: number | SarakResponsiveValue<number>;
    cardActionBtnHoverBg: string;
    cardActionBtnPadding: number;
    cardActionBtnPrimaryBg: string;
    cardActionBtnText: string;
    cardActionClickScale: number;
    cardBackdropBlur: number;
    cardBackgroundColor: string;
    cardBorderBottom: number;
    cardBorderColor: string;
    cardBorderLeft: number;
    cardBorderOpacity: number;
    cardBorderRadius: number | SarakResponsiveValue<number>;
    cardBorderRight: number;
    cardBorderTop: number;
    cardBorderWidth: number;
    cardFooterBg: string;
    cardFooterBorder: string;
    cardGeometricCut: number;
    cardGlowColor: string;
    cardGlowIntensity: number;
    cardHeaderBg: string;
    cardHeaderBorder: string;
    cardHeaderPadding: number | SarakResponsiveValue<number>;
    cardHoverGlowIncrease: number;
    cardHoverStyle: string;
    cardHoverTranslate: number;
    cardInnerGlowColor: string;
    cardInnerGlowWidth: number;
    cardLayoutDirection: string;
    cardPaddingMd: number | SarakResponsiveValue<number>;
    cardRadiusBL: number | SarakResponsiveValue<number>;
    cardRadiusBR: number | SarakResponsiveValue<number>;
    cardRadiusTL: number | SarakResponsiveValue<number>;
    cardRadiusTR: number | SarakResponsiveValue<number>;
    cardSearchBgFocus: string;
    cardSearchBorderBeamActive: boolean;
    cardSearchPlaceholderColor: string;
    cardSearchTextFocusColor: string;
    cardShadow: string;
    cardShadowBlur: number;
    cardShadowExpansion: number;
    cardShadowOffsetX: number;
    cardShadowOffsetY: number;
    cardShadowSpread: number;
    cardSpotlightOpacity: number;
    cardSurfaceOpacity: number;
    cardTextAlign: string;
    cardTextureOpacity: number;
    cardTextureType: string;
    cardTitleColor: string;
    cardTitleFontSize: number | SarakResponsiveValue<number>;
    cardTitleFontWeight: string;
    cardTitleIconGlow: string;
    cardTitleIconGlowBlur: number;
    cardTitleLetterSpacing: number;
    cardVariant: string;
    catalogFilterMinWidth: number;
    catalogItemRadius: number;
    catalogSectionRadius: number;
    chartColorPalette: string;
    chartEngineMinHeight: number;
    chartGridOpacity: number;
    chartShowGrid: boolean;
    chartSmoothing: boolean;
    chartThickness: number;
    chartTooltipBg: string;
    chartType: string;
    chatAnimationSpeed: number;
    chatAttachmentNameMaxWidth: number;
    chatBubbleGlassBlur: number;
    chatBubbleRadius: number | SarakResponsiveValue<number>;
    chatBubbleStyle: string;
    chatTokenSliderMinWidth: number;
    chatUserBg: string;
    checkboxActiveColor: string;
    chromeNotificationsPosition: string;
    chromeSearchPosition: string;
    chromeUserPosition: string;
    colorBgBody: string;
    colorBgLayer1: string;
    colorBgLayer2: string;
    colorBgModal: string;
    colorDepth: number;
    colorPalette: string;
    colorVariation: number;
    contextMenuMinWidth: number;
    controlHeightToggle: number;
    designEngineSidebarMaxWidth: number;
    designEngineSidebarMinWidth: number;
    deviceDesktopMinWidth: number;
    deviceFrameRadius: number;
    devicePhoneHeight: number;
    devicePhoneNotchRadius: number;
    deviceTabletHeight: number;
    dotGridDotOffset: number;
    dotGridDotSize: number;
    dotGridTileSize: number;
    emphasisColor: string;
    emptyStateCaptionMaxWidth: number;
    emptyStateOrbBlur: number;
    emptyStateOrbInner: number;
    emptyStateOrbOuter: number;
    emptyStateRingRadius: number;
    emptyStateVoidLetterOffset: number;
    engineMinHeightLg: number;
    engineMinHeightSm: number;
    flowGridStyle: string;
    flowHandleSize: number;
    flowNodeBlur: number;
    flowNodePadding: number;
    flowNodeRadius: number | SarakResponsiveValue<number>;
    focusRingWidth: number;
    formFieldDensity: string;
    formLabelPosition: string;
    glassBlur: number;
    glassEdgeColor: string;
    glassEdgeWidth: number;
    glassOpacity: number;
    glassRoughness: number;
    glassSaturation: number;
    glassSpecularity: number;
    globalBackgroundBlur: number;
    globalBackgroundImageUrl: string;
    globalBackgroundOpacity: number;
    globalBackgroundPosition: string;
    globalContrast: number;
    globalFlowAlign: string;
    globalFlowDirection: string;
    globalSaturation: number;
    globalSectionGap: number;
    h1LetterSpacing: number;
    h1LineHeight: number;
    h1Size: number | SarakResponsiveValue<number>;
    h1Weight: string;
    h2LineHeight: number;
    h2Size: number | SarakResponsiveValue<number>;
    h2Weight: string;
    h3Size: number;
    headerAlignment: string;
    headingFont: string;
    headingTransform: string;
    iconButtonFrostedShadowBlur: number;
    iconButtonFrostedShadowOffsetY: number;
    iconButtonGlowBlurLg: number;
    iconButtonGlowBlurMd: number;
    iconButtonGlowBlurSm: number;
    iconFamily: string;
    iconStrokeWidth: number;
    iconWeight: string;
    identityAlignment: string;
    identityFontFamily: string;
    identityFontWeight: number;
    identityHoverEffect: string;
    identityPadding: number;
    identityTracking: number;
    imageCardGlowBlur: number;
    imageCardHoverZoom: number;
    imageCardOverlayOpacity: number;
    imageCardShadowBlur: number;
    imageCardShadowOffsetY: number;
    imageCardShadowSpread: number;
    inputBackdropBlur: number;
    inputBg: string;
    inputBorderColor: string;
    inputBorderRadius: number | SarakResponsiveValue<number>;
    inputBorderType: string;
    inputErrorColor: string;
    inputFocusBorderColor: string;
    inputIconColor: string;
    inputIconPosition: string;
    inputPadding: number;
    inputPaddingHorizontal: number;
    inputShadow: string;
    inputTextColor: string;
    isAutoHideEnabled: boolean;
    isNavHidden: boolean;
    isSplitViewEnabled: boolean;
    kanbanCardRadius: number;
    kanbanHeaderPaddingY: number;
    kanbanHeaderTracking: number;
    layeredShadows: number;
    layoutDensity: string;
    layoutGap: number | SarakResponsiveValue<number>;
    layoutGapLg: number | SarakResponsiveValue<number>;
    layoutGapMd: number | SarakResponsiveValue<number>;
    layoutGapSm: number | SarakResponsiveValue<number>;
    layoutGridMinCell: number;
    layoutGridTemplate: string;
    layoutPadding: number | SarakResponsiveValue<number>;
    layoutPreviewMaxH: number;
    managementGroupListMaxHeight: number;
    matrixBlur: number;
    matrixBorderColor: string;
    matrixGap: number;
    matrixItemBg: string;
    matrixNodeMinWidth: number;
    matrixRadius: number;
    maxContentWidth: string;
    mobileNavigationStyle: string;
    modalActionAlignment: string;
    modalBorderRadius: number | SarakResponsiveValue<number>;
    modalHeaderStyle: string;
    modalOverlayBlur: number;
    modalOverlayColor: string;
    modalWidthFull: number;
    modalWidthLg: number;
    modalWidthMd: number;
    modalWidthSm: number;
    modalWidthXl: number;
    mode: string;
    monoFont: string;
    motionDurationFast: number;
    motionDurationInstant: number;
    motionDurationNormal: number;
    motionDurationSlow: number;
    motionEaseIn: string;
    motionEaseMain: string;
    motionEaseOut: string;
    motionStaggerDelay: number;
    multiSelectInputMinWidth: number;
    navActiveMarkerColor: string;
    navActiveMarkerGlow: number;
    navbarLayout: string;
    navigationStyle: string;
    navItemActiveColor: string;
    navItemRadius: number;
    pageTransitionType: string;
    preferenceFontSizePosition: string;
    preferenceLanguagePosition: string;
    preferenceModePosition: string;
    preferenceNavCollapsePosition: string;
    preferenceNavigationStylePosition: string;
    presetCardHoverShadowOffsetY: number;
    presetCardShadowBlur: number;
    presetCardShadowOffsetY: number;
    presetCardShadowSpread: number;
    presetGlowShadowBlur: number;
    presetGlowShadowBlurLg: number;
    presetGridTextureSize: number;
    presetMatteShadowBlur1: number;
    presetMatteShadowBlur2: number;
    presetMatteShadowOffsetY2: number;
    presetMatteShadowSpread1: number;
    presetMatteShadowSpread2: number;
    presetMiniCardHeight: number;
    presetMiniCardMaxWidth: number;
    presetPreviewMinHeight: number;
    presetPreviewPaddingY: number;
    primaryColor: string;
    progressBarHeight: number;
    progressBarMaxWidth: number;
    progressBarRadius: number;
    rangeActiveColor: string;
    reducedMotion: boolean;
    scrollPadding: number | SarakResponsiveValue<number>;
    scrollRadius: number | SarakResponsiveValue<number>;
    scrollThumbColor: string;
    scrollThumbHoverOpacity: number;
    scrollThumbOpacity: number;
    scrollTrackOpacity: number;
    scrollWidth: number | SarakResponsiveValue<number>;
    searchBackdropBlur: number;
    searchDropdownGap: number;
    searchDropdownWidth: number;
    searchPositionSidebar: string;
    searchPositionTopbar: string;
    secondaryColor: string;
    shadowAmbientAlpha: number;
    shadowColorMode: string;
    shadowIntensity: number;
    shadowOrientation: string;
    shadowProjectionAlpha: number;
    shadowProjectionBlur: number;
    shellBrandLogoSize: number;
    sidebarActiveColor: string;
    sidebarActiveItemStyle: string;
    sidebarBackgroundStyle: string;
    sidebarBlur: number;
    sidebarBorderColor: string;
    sidebarBorderSide: string;
    sidebarBorderStyle: string;
    sidebarBorderWidth: number;
    sidebarBrandBackground: string;
    sidebarBrandColor: string;
    sidebarCategoryColor: string;
    sidebarCollapsedWidth: number;
    sidebarColor: string;
    sidebarFooterBackground: string;
    sidebarHoverColor: string;
    sidebarIconColor: string;
    sidebarIconSize: number;
    sidebarItemDensity: string;
    sidebarItemHoverTextColor: string;
    sidebarItemTextColor: string;
    sidebarLabelMaxWidth: number;
    sidebarMaxWidth: number | SarakResponsiveValue<number>;
    sidebarMinWidth: number | SarakResponsiveValue<number>;
    sidebarNoiseOpacity: number;
    sidebarPosition: string;
    sidebarShadow: string;
    sidebarWidth: number | SarakResponsiveValue<number>;
    skeletonCircleSize: number;
    skeletonRowHeight: number;
    skeletonRowRadius: number;
    splitPaneMinWidth: number;
    statusErrorColor: string;
    statusGlowBlur: number;
    statusInfoColor: string;
    statusSuccessColor: string;
    statusWarningColor: string;
    subtitleColor: string;
    surfaceColor: string;
    surfaceIntensity: number;
    surfaceMaterial: string;
    switchBackdropBlur: number;
    switchLabelPosition: string;
    switchPulseColor: string;
    switchStyleType: string;
    switchThumbBg: string;
    switchTrackActiveBg: string;
    systemTone: string;
    tabGap: number | SarakResponsiveValue<number>;
    tableBorderColor: string;
    tableBorderRadius: number | SarakResponsiveValue<number>;
    tableCellPadding: number | SarakResponsiveValue<number>;
    tableDensity: string;
    tableHeaderBg: string;
    tableRowHoverBg: string;
    tableZebraStriping: boolean;
    tabSectionMargin: number | SarakResponsiveValue<number>;
    tertiaryColor: string;
    textColorMaster: string;
    textColorMuted: string;
    textColorSecondary: string;
    textGlowIntensity: number;
    textSmoothing: boolean;
    texture: string;
    textureColor: string;
    textureOpacity: number;
    titleColor: string;
    toastAccentWidth: number;
    toastMaxWidth: number;
    toastMinWidth: number;
    tooltipBg: string;
    tooltipBorderColor: string;
    tooltipRadius: number;
    tooltipTextColor: string;
    topbarActiveColor: string;
    topbarActiveItemStyle: string;
    topbarBackgroundStyle: string;
    topbarBlur: number;
    topbarBorderColor: string;
    topbarBorderSide: string;
    topbarBorderStyle: string;
    topbarBorderWidth: number;
    topbarBrandBackground: string;
    topbarBrandColor: string;
    topbarCollapsedHeight: number;
    topbarColor: string;
    topbarGroupSeparatorColor: string;
    topbarHeight: number | SarakResponsiveValue<number>;
    topbarHoverColor: string;
    topbarIconColor: string;
    topbarIconSize: number;
    topbarItemDensity: string;
    topbarItemHoverTextColor: string;
    topbarItemTextColor: string;
    topbarLabelMaxWidth: number;
    topbarNoiseOpacity: number;
    topbarShadow: string;
    topbarTitleColor: string;
    touchTargetMin: number;
    trackingSnug: number;
    trackingTight: number;
    trackingUltra: number;
    trackingWide: number;
    trackingWider: number;
    trackingWidest: number;
    typeScale2xs: number;
    typeScale3xs: number;
    typeScaleCaption: number;
    typeScaleMicro: number;
    typeScaleTiny: number;
    typeScaleXl: number;
    typeScaleXs: number;
    vignetteOpacity: number;
    vignetteSoftness: number;
    zIndexBase: number;
    zIndexModal: number;
    zIndexSidebar: number;
    zIndexToast: number;
    zIndexTooltip: number;
}

/**
 * As cinco preferências de usuário que a lib conhece (specs/09 — seção de
 * preferências) e o token de tema que guarda, para cada uma, a POSIÇÃO que o
 * administrador escolheu no painel: `off` (não oferecida — some da barra,
 * some do menu), `menu` (item dentro do ⚙ "Preferências") ou `pinned` (botão
 * direto na barra, e também no menu). A declaração vive no `design`, como
 * qualquer outro token de tema — não num campo fora dele: é o administrador
 * quem escolhe isso em runtime, no painel, e só sobrevive a um recarregamento
 * se estiver onde o `design` já é persistido.
 */
declare const PREFERENCE_IDS: readonly ["colorMode", "fontSize", "navigationStyle", "navCollapsed", "language"];
type SarakPreferenceId = typeof PREFERENCE_IDS[number];
type SarakPreferencePosition = 'off' | 'menu' | 'pinned';

type SarakColorModePreference = 'light' | 'dark' | 'system';
type SarakFontSizePreference = 'sm' | 'md' | 'lg';
type SarakNavigationStylePreference = 'topbar' | 'sidebar';
/**
 * As cinco preferências do usuário — camada separada do tema, sobreposta ao
 * design efetivo ao renderizar e NUNCA gravada como tema.
 */
interface SarakUserPreferences {
    colorMode?: SarakColorModePreference;
    fontSize?: SarakFontSizePreference;
    navigationStyle?: SarakNavigationStylePreference;
    navCollapsed?: boolean;
    language?: string;
}
/** Porta opcional do host para guardar preferência por usuário no servidor
 *  (ADR-011, mesmo espírito): a lib não conhece o usuário — quem associa a
 *  preferência a ele é o host, pela própria closure do callback. */
interface SarakPreferencesOptions {
    /**
     * Modo inicial enquanto o usuário não escolheu um modo. Só se aplica se o
     * tema oferecer a preferência; `system` acompanha o sistema operacional.
     * Este fallback do host nunca é persistido nem enviado a `onSave`.
     */
    defaultColorMode?: SarakColorModePreference;
    storageKey?: string;
    onSave?: (preferences: SarakUserPreferences) => Promise<void> | void;
    onLoad?: () => Promise<SarakUserPreferences> | SarakUserPreferences;
}

/**
 * Presets: Temas Globais
 *
 * Configurações que alteram a aplicação inteira de uma vez.
 * Formato: { id: ThemePresetId; name: string; description: string; design: Record<string, unknown> }
 *
 * `design` é `Record<string, unknown>` (Zero `any` — §0.6) e NÃO o `SarakThemePayload`
 * estrito: os presets legados carregam valores que divergiram do domínio fechado do
 * payload (ex.: `logoMinimalUrl`, `cardVariant: "solid"`), reconciliação pendente com a
 * paridade 1:1:1:1:1 (ver `Provider/types.ts`). A blindagem estrita vive na diretiva
 * `theme` (Spec 42), que autores de manifesto consomem via `Partial<SarakThemePayload>`.
 */

/**
 * União conhecida dos ids de preset (fonte única do catálogo embarcado).
 * Adicionar um tema = adicionar seu id aqui, o arquivo do tema, a linha em
 * `loaders.ts` e em `all.ts`. Consumida pela diretiva `theme` (Spec 42) como o
 * ramo "preset nomeado".
 *
 * Este módulo NÃO importa tema nenhum: ele está no fecho estático do barril, e
 * só o tema padrão pode estar lá (`boot.ts`).
 */
declare const SARAK_THEME_PRESET_IDS: readonly ["sarak-sovereign", "cyberpunk-neon", "industrial-terminal", "neo-brutalism", "synthwave-retro", "nebula-space", "kinetic-flow", "cyber-retro-wave", "minimalist-airy", "data-terminal", "neumorphic-mobile", "golden-hour", "aurora-veil", "blueprint-protocol", "editorial-ink", "organic-clay", "high-contrast", "corporate-ledger", "playful-pastel"];
type SarakThemePresetId = (typeof SARAK_THEME_PRESET_IDS)[number];
interface SarakThemePreset {
    id: SarakThemePresetId;
    name: string;
    description: string;
    design: Record<string, unknown>;
    /**
     * Bloco PARCIAL, autorado, com os tokens que mudam para o modo OPOSTO ao
     * nativo (`design.mode`) — specs/specs/09-temas-e-presets.md §2.1. OPCIONAL
     * no tipo de propósito: torná-lo obrigatório quebraria todo tema de
     * consumidor (R33). `resolveThemeForMode` (abaixo) é quem decide o que
     * aplicar; o gate de contraste (`auditor_contraste`) é quem EXIGE presença
     * de todo tema shippado — a lista de isenção terminou vazia.
     */
    contraparte?: Partial<SarakDesignState>;
}
/** O tema padrão do sistema — o único embarcado que vive no boot (`boot.ts`). */
declare const SARAK_DEFAULT_THEME_ID: "sarak-sovereign";
/** Amostra de cor de um tema num modo — o bastante para o seletor desenhar a pílula sem carregar o tema. */
interface SarakThemeSwatch {
    primaryColor: string;
    colorBgBody: string;
    textColorMaster: string;
}
/**
 * Entrada do catálogo LEVE: lista o tema (nome, modo, amostra de cor) sem o
 * `design`. Os embarcados saem de `catalog.generated.ts`, gerado a partir dos
 * próprios temas (`npm run themes:catalog`) — nunca escrito à mão.
 */
interface SarakThemeCatalogEntry {
    id: string;
    name: string;
    description: string;
    /** Modo nativo do tema. */
    mode: 'light' | 'dark';
    /** `true` quando o tema traz a contraparte AUTORADA para o modo oposto. */
    hasContraparte: boolean;
    /** Cores do tema no modo nativo. */
    swatch: SarakThemeSwatch;
    /** Cores do tema no modo oposto (contraparte autorada ou o fallback sintetizado). */
    swatchOpposite: SarakThemeSwatch;
}

/**
 * Props públicas do `SarakUIProvider`. Extraído de `types.ts` só para manter
 * aquele arquivo abaixo do teto de 250 linhas do auditor de Clean Code (R9) —
 * mesmo motivo de `payloadExtraKeys.ts`, ver comentário lá.
 */
interface SarakUIProviderProps {
    children: ReactNode;
    config?: SarakThemePayload;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
    customThemes?: SarakThemeEntry[];
    /** ID do tema ATIVO (controlado): sempre que setado, vence — reaplica a cada mudança. */
    activeThemeId?: string;
    /**
     * ID do tema SEMENTE (não-controlado): só semeia o estado inicial (uma vez, no
     * primeiro seed), nunca força reaplicação. Alternativa mais segura a
     * `activeThemeId` para o caso comum "só quero começar neste tema" — não expõe o
     * consumidor ao contrato de estabilidade de referência que `activeThemeId`
     * exige de `customThemes` (Spec 43 §5.1/Spec 44 §2.1).
     */
    initialTheme?: string;
    /**
     * Callback "traga sua persistência" (Spec 44 §2.5): chamado a cada commit do
     * design persistido (após localStorage), para o consumidor sincronizar no
     * backend DELE, se quiser. A lib nunca faz essa chamada por conta própria.
     */
    onThemeChange?: (design: SarakThemePayload) => void;
    /**
     * O que mostrar enquanto o tema EMBARCADO pedido por código (`activeThemeId`/
     * `initialTheme`) ainda não chegou à memória. Só aparece sem
     * `await sarakPreloadThemes([...])` antes do render; o padrão é nada.
     */
    loadingFallback?: ReactNode;
    onMediaUpload?: (file: File) => Promise<string>;
}
/**
 * De onde vêm as fontes do tema (`options.fonts`):
 * - `'bundled'` (padrão): a lib injeta o `@font-face` só das famílias que o design no ar usa, com os arquivos da
 *   pasta `fonts/` do pacote. Nenhuma requisição a terceiros.
 * - `'google'`: o comportamento anterior — `@import` do Google Fonts com todas as famílias + `preconnect`.
 * - `'none'`: a lib não injeta nada; o host carrega as fontes.
 */
type SarakFontSource = 'bundled' | 'google' | 'none';
interface SarakFontsOptions {
    /** Padrão `'bundled'`. */
    source?: SarakFontSource;
    /**
     * Onde o host serve a pasta `fonts/` do pacote (CDN própria, ou bundler que não reescreve
     * `new URL(..., import.meta.url)`, como esbuild puro ou o CJS). Vale só para `'bundled'`.
     */
    baseUrl?: string;
    /**
     * Famílias que o host serve (a lib não as embarca nem copia): entram no painel ao lado das da lib e, quando o
     * design as usa, a lib injeta o `@font-face` delas. Registrar não muda o que o tema aceita — qualquer pilha de
     * fontes segura continua valendo; uma família não registrada nem instalada cai na genérica da pilha.
     * Com `source: 'none'` a lib não injeta o `@font-face` delas: o host carrega tudo.
     */
    custom?: SarakCustomFont[];
}
type SarakFontsOption = SarakFontSource | SarakFontsOptions;
/** Família genérica que vem depois da família do host no valor gravado no tema (`'Minha Fonte', sans-serif`). */
type SarakFontFallback = 'sans-serif' | 'serif' | 'monospace' | 'cursive' | 'system-ui';
interface SarakCustomFontFile {
    /** `https:`, caminho (`/fontes/x.woff2`, `fontes/x.woff2`) ou `data:font/…;base64,…`; nenhum outro esquema. */
    url: string;
    /** 100–900 em passos de 100, `'normal'` ou `'bold'`. */
    weight: number | 'normal' | 'bold';
    /** Padrão `'normal'`. */
    style?: 'normal' | 'italic';
}
interface SarakCustomFont {
    /** Letras, dígitos, espaço, hífen e sublinhado; até 64 caracteres; não pode repetir uma família da lib. */
    family: string;
    /** Grupo no seletor do painel; sem ele, "Personalizadas". */
    category?: string;
    /** Padrão `'sans-serif'`. */
    fallback?: SarakFontFallback;
    files: SarakCustomFontFile[];
}

/** Entrada completa de tema recebida e devolvida pelas portas do consumidor. */
interface SarakThemeEntry {
    id: string;
    /** Rótulo exibido nas listas de tema; temas runtime precisam dele no catálogo. */
    name?: string;
    design?: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}
/** Operação entregue à porta quando uma gravação runtime cria ou substitui um tema. */
type SarakThemeSaveOperation = 'create' | 'replace';

/**
 * Contrato do Theme Payload com DOMÍNIO DE CHAVES FECHADO: somente design tokens
 * reais (SarakDesignTokens — gerado da SSOT MASTER_DESIGN_MAP, mesma fonte
 * validada pela paridade 1:1:1:1:1, agora com VALORES tipados por `token.type`)
 * + os campos legados/branding declarados em SarakThemePayloadExtras. Qualquer
 * outra chave (ex.: 'brandColorPrimary') passa a ser ERRO DE COMPILAÇÃO —
 * "a Interface do Payload dita a Realidade".
 */
type SarakThemePayload = Partial<SarakDesignTokens> & SarakThemePayloadExtras;
/**
 * Chaves estruturais/sanitizador que existem no estado de design em RUNTIME mas
 * não são design tokens do schema (Spec 65, Fase 0). Não criar token novo aqui —
 * token novo nasce no schema/paridade.
 */
interface SarakRuntimeExtras {
    animationSpeed?: number;
    secondaryModuleId?: string;
    emptyStateId?: string;
    logoPosition?: 'left' | 'center';
    logoScale?: number;
    atmosphere?: Record<string, unknown>;
    specialized?: Record<string, unknown>;
    schema_version?: string;
}
/** Estado de design REAL em runtime: o payload público + os extras de runtime. */
type SarakDesignState = SarakThemePayload & SarakRuntimeExtras;
/**
 * Campos presentes no payload que ainda NÃO foram modelados como design tokens
 * no schema (branding/sistema, estrutura consumida por useStructuralStyles e
 * aliases de cor legados). Pendente reconciliação com a paridade 1:1:1:1:1.
 * NÃO adicione tokens novos aqui: um token novo nasce no schema, não nesta lista.
 */
interface SarakThemePayloadExtras {
    systemName?: string;
    logoUrl?: string;
    mode?: string;
    layout?: string;
    animationStyle?: string;
    primaryColor?: string;
    secondaryColor?: string;
    flowGridStyle?: string;
    flowNodeRadius?: number;
    chatBubbleStyle?: string;
    chatAnimationSpeed?: number;
    chartType?: string;
    chartShowGrid?: boolean;
    cardHoverStyle?: 'lift' | 'glow-only' | 'expand';
    cardTextureType?: string;
    cardGeometricCut?: number;
    cardVariant?: 'classic' | 'title' | 'action' | 'search';
    imageOverlay?: boolean;
    imageCardHoverZoom?: number;
    imageCardOverlayOpacity?: number;
    iconStrokeWidth?: number;
    layoutDensity?: string;
    fontScale?: string;
    navigationStyle?: string;
    sidebarMinWidth?: number;
    sidebarMaxWidth?: number;
    sidebarWidth?: number;
    headingFont?: string;
    bodyFont?: string;
    globalBackgroundImageUrl?: string;
    globalBackgroundOpacity?: number;
    globalBackgroundBlur?: number;
    searchVariant?: "search" | "classic" | "title" | "action";
    columnGap?: string | number;
    iconSize?: string;
    iconFamily?: string;
    iconWeight?: string;
    scale?: string | number;
    btnStyleType?: string;
    radius?: string;
    borderStyle?: string;
    shadowType?: string;
    chartGridStyle?: string;
    map?: Record<string, unknown>;
    imageOpacity?: number;
    imageScale?: number | string;
    layoutMaxWidth?: number;
    enabledLanguages?: string[];
    inputIconPosition?: string;
    qrSize?: number;
    isAutoHideEnabled?: boolean;
    isNavHidden?: boolean;
    logoDarkUrl?: string;
    fontFamily?: string;
    socialButtonStyle?: string;
    searchStyle?: string;
    language?: string;
    availableLanguages?: string[];
}
/**
 * Modo de consumo da biblioteca (Spec 24).
 * - `app`: o sistema nasce com a lib; o Provider é dono da página (default).
 * - `embedded`: a lib renderiza uma ilha sobre um frontend existente, sem tocar
 *   em nada fora do seu container.
 */
type SarakUIMode = 'app' | 'embedded';
interface SarakUIOptions {
    token?: string;
    /** Nonce CSP aplicado a todas as tags `<style>` criadas pela biblioteca. */
    styleNonce?: string;
    /** Ajustes do sequestro de tema legado executado pelo `SovereignThemeInjector`. */
    manifest?: Record<string, unknown>;
    /** Modo de consumo (Spec 24). Default `'app'` — zero breaking change. */
    mode?: SarakUIMode;
    /** Ajustes válidos apenas em `mode: 'embedded'`. */
    embedded?: {
        /**
         * Opt-in explícito para injetar as fontes (da origem de `fonts`) no `<head>` do host.
         * Default `false`: no Modo Embarcado a ilha herda as fontes do host, e a lib
         * não escreve `<link>`/`@import` global sem permissão.
         */
        injectGlobalFonts?: boolean;
    };
    /** Origem das fontes do tema; padrão `'bundled'` (ver `SarakFontsOption`). */
    fonts?: SarakFontsOption;
    persistence?: {
        /** Estratégia de persistência (ADR-009 §2.2). Default `'hybrid'` = localStorage + onSave/onLoad; `'local'` ignora as duas portas; `'remote'` para de gravar localStorage e SUBSTITUI pelo que `onLoad` resolver, degradando para `'local'` com aviso único sem porta configurada. */
        strategy?: 'local' | 'remote' | 'hybrid';
        storageKey?: string;
        /** Escopa a chave por tenant (ADR-009 §2.1): vira `${storageKey}::tenant:${tenantId}`. Opaco, não validado. */
        tenantId?: string;
        /** Quando true, o config fornecido pelo host vence o cache local no primeiro quadro. Default false preserva cache-wins. */
        preferConfigOverCache?: boolean;
        /** `activeThemeId` (2º parâmetro, ADITIVO — plan-42): o id do tema EFETIVAMENTE
         *  no ar (`resolvedThemeId`) no instante deste save. Vem preenchido sempre que a
         *  sessão resolveu um tema (seed ou aplicado em runtime); vem `undefined` só
         *  quando não há tema resolvido ainda. NÃO faz parte de `design` — é identidade,
         *  não token; o payload continua sendo o mesmo objeto que o export de tema
         *  produz. Quem já implementa `onSave(design)` continua funcionando: em
         *  JavaScript, argumento extra não declarado é ignorado. */
        onSave?: (design: SarakThemePayload, activeThemeId?: string) => Promise<void> | void;
        onLoad?: () => Promise<SarakThemePayload | {
            design: SarakThemePayload;
            activeThemeId?: string;
        } | null | undefined> | SarakThemePayload | {
            design: SarakThemePayload;
            activeThemeId?: string;
        } | null | undefined;
        /** Segura os filhos até `onLoad` resolver — troca flash por tela vazia (ver "o primeiro paint" em `docs/persistencia-de-tema.md`). Default `false`. */
        strictBackendSync?: boolean;
        /** Sincroniza o tema entre abas/apps que compartilham a `storageKey`. Escuta `storage` e reaplica o design (validado) quando outra aba grava a mesma chave. Default `true`. */
        crossTabSync?: boolean;
    };
    theme?: {
        defaultTheme?: string;
        extraTokens?: Record<string, unknown>;
        /**
         * Porta ÚNICA de escrita para "salvar tema em runtime" (ADR-011, substitui as
         * três portas do ADR-010): chamada por `sarak.saveTheme` DEPOIS de o tema já
         * validado (`validateDesign`) entrar na sessão (`allThemes`). Recebe o
         * `ThemeEntry` completo (`{ id, name, design, contraparte? }`); GUARDAR — arquivo, tabela,
         * `localStorage`, o que for — e DEVOLVER no próximo boot via `customThemes` é
        * inteiramente do consumidor. O segundo argumento opcional informa `'create'`
        * ou `'replace'`; callbacks antigos que recebem só o tema continuam válidos.
        * A leitura já é a prop `customThemes`; a porta
         * opcional `onDelete` permite remover da fonte persistente.
         */
        onSave?: (theme: SarakThemeEntry, operation?: SarakThemeSaveOperation) => Promise<void> | void;
        /** Remove o tema salvo pelo consumidor, quando configurada. */ onDelete?: (id: string) => Promise<void> | void;
    };
    preferences?: SarakPreferencesOptions;
    /** O idioma é do sistema: declara os idiomas, o atual e recebe a troca do seletor. */ i18n?: SarakI18nOptions;
    /**
     * Marca/branding do sistema (Spec 44 — sem backend próprio): `initial` semeia
     * o estado; `onChange` é a porta "traga sua persistência" (sync no backend DO
     * CONSUMIDOR, se ele quiser — a lib nunca faz fetch/POST para nenhum servidor).
     */
    branding?: {
        initial?: Partial<SarakBrandingState>;
        onChange?: (branding: SarakBrandingState) => Promise<void> | void;
    };
}
/** Estado de marca/branding (nome, logo, textos de login/aba). Identidade nasce
 *  AUSENTE — a lib nunca impõe a própria marca (Spec 47, `docs/identidade-do-host.md`). */
interface SarakBrandingState {
    companyName?: string;
    loginName: string;
    tabName?: string;
    logoBase64: string | null;
}
interface SarakUIContextType {
    preferences: SarakUserPreferences;
    updatePreferences: (partial: Partial<SarakUserPreferences>) => void;
    design: SarakThemePayload;
    systemDesign?: SarakThemePayload;
    activeDesign: SarakThemePayload;
    draftDesign: SarakThemePayload | null;
    isDrafting: boolean;
    setIsDrafting: (active: boolean) => void;
    lockDrafting: () => void;
    setDesign: (design: SarakThemePayload) => void;
    setDraftDesign: (design: SarakThemePayload | null) => void;
    persistDesign?: (design: SarakThemePayload) => void;
    applyConfig: (partial: Partial<SarakThemePayload>) => void;
    applyFullConfig: (config: SarakThemePayload) => void;
    applyConfigRaw: (partial: Partial<SarakThemePayload>) => void;
    applyFullConfigRaw: (config: SarakThemePayload) => void;
    isHydrated: boolean;
    options: SarakUIOptions;
    allThemes: SarakThemeEntry[];
    themeCatalog: SarakThemeCatalogEntry[];
    loadTheme: (id: string) => Promise<SarakThemeEntry | undefined>;
    getHostConfig?: () => SarakThemePayload;
    /** Salva um tema em runtime: valida, funde no estado de SESSÃO e entrega
     *  a operação `create`/`replace` a `options.theme.onSave`,
     *  se configurado — sem a porta, não sobrevive a um reload. */
    saveTheme: (theme: SarakThemeEntry, operation?: SarakThemeSaveOperation) => Promise<void>;
    deleteTheme: (id: string) => Promise<void>;
    activeThemeId?: string;
    resolvedThemeId?: string;
    setResolvedThemeId?: (id: string | undefined) => void;
    token?: string | null;
    branding?: SarakBrandingState;
    updateBranding?: (partial: Partial<SarakBrandingState>) => Promise<void>;
    onMediaUpload?: (file: File) => Promise<string>;
}

/**
 * SOVEREIGN DESIGN MANIFEST (v10.1)
 *
 * Lista de chaves aceitas fora do schema (`ALLOWED_EXTRA_KEYS`) e o export público das
 * variáveis/transformações. NÃO é o emissor: quem escreve variável (`--sarak-<kebab>` e as
 * `cssVars` do schema) e atributo (`data-sx-<kebab>`) de TODO token é `useDesignVariables.ts`,
 * a partir do schema. O `vars` daqui nunca alimentou CSS real, e `attr` só aparece onde é o
 * próprio `data-sx-<kebab>` que o motor emite — por isso o `token-reader:check` lê o schema
 * inteiro e usa este arquivo só para o `classPrefix`. Entrada vazia (`{}`) só mantém a chave
 * aceita no payload (`ALLOWED_EXTRA_KEYS`).
 */
declare const SARAK_DESIGN_MANIFEST: Record<string, {
    vars?: string[];
    unit?: string;
    transform?: (v: SarakTokenValue) => string | number | Record<string, string | number>;
    attr?: string;
    classPrefix?: string;
}>;

/** Porta pública de contexto; lança se o consumidor esquecer o Provider. */
declare const useSarakUI: () => SarakUIContextType & SarakThemePayload;

declare const SarakUIProvider: React__default.FC<SarakUIProviderProps>;

/** Gera CSS validado para pintar o tema no HTML inicial, antes do JavaScript. */
declare const sarakCreateThemeBootCss: (design: SarakThemePayload) => string;

interface SarakLanguageState {
    /** O código do sistema (`pt-BR`). */
    language: string;
    /** BCP-47 usado na formatação (`pt` sem região → `pt-BR`). */
    locale: string;
    languages: string[];
    /** Mesmo caminho do seletor: avisa `onLanguageChange` e, sem idioma controlado, grava a preferência. */
    setLanguage: (code: string) => void;
}
/**
 * O idioma que vale na tela — fonte única dos textos da lib, da formatação e do seletor.
 * Nunca lança: sem Provider, devolve português e `setLanguage` não faz nada (R34).
 */
declare const useSarakLanguage: () => SarakLanguageState;

interface SarakPreferencesHook {
    preferences: SarakUserPreferences;
    updatePreferences: (partial: Partial<SarakUserPreferences>) => void;
}
/**
 * Leitura e escrita PÚBLICA das preferências do usuário — a camada
 * sobreposta ao tema, nunca gravada nele. É por aqui que uma barra de
 * preferências configurável monta, que uma tradução funcional liga o
 * idioma escolhido, e que o host lê a preferência de idioma para a própria
 * tradução.
 */
declare const useSarakPreferences: () => SarakPreferencesHook;

/** Classe raiz da ilha. DEVE casar com `SCOPE_CLASS` de `scripts/build-scoped-css.mjs`. */
declare const SARAK_SCOPE_CLASS = "sarak-scope";
/**
 * Dica de modo lida do documento ANTES de qualquer render.
 *
 * A injeção automática de CSS (Spec 08 §2) roda na IMPORTAÇÃO do módulo, muito antes
 * de o Provider montar e saber o modo. Num host já renderizado (SSR/HTML estático),
 * isso significaria um flash do preflight global re-estilizando a página. O consumidor
 * embarcado mata esse flash marcando o documento:
 *
 * ```html
 * <html data-sarak-ui-mode="embedded">
 * ```
 */
declare const SARAK_MODE_ATTRIBUTE = "data-sarak-ui-mode";

declare const SARAK_BUILD_INFO: {
    readonly libVersion: "8.0.0-rc.4";
    readonly baseCommitShort: "b59418f";
    readonly builtAt: "2026-10-29T21:13:20.560Z";
};

interface SarakDesignScopeProps {
    design: SarakDesignState;
    children: React__default.ReactNode;
    className?: string;
    style?: React__default.CSSProperties;
}
/**
 * DesignScope (v12.0)
 *
 * Envolve um conteúdo em um escopo isolado de variáveis CSS de design.
 * Agora injeta também um DesignOverrideContext para que componentes que usam
 * useSarakUI() dentro deste escopo consumam o design correto (rascunho).
 */
declare const SarakDesignScope: React__default.FC<SarakDesignScopeProps & Record<string, unknown>>;

interface SarakButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Define a aparência visual sem mudar o tipo HTML; sem a prop, usa `primary`. */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
    /** Troca os ícones pelo indicador de carregamento e desabilita o botão enquanto ativa; omitida, mantém o botão habilitado. */
    isLoading?: boolean;
    /** Exibe um elemento antes do conteúdo; omitida, não há ícone à esquerda, e durante o carregamento é substituída pelo indicador. */
    leftIcon?: React__default.ReactNode;
    /** Exibe um elemento depois do conteúdo; omitida, não há ícone à direita, e durante o carregamento fica oculta. */
    rightIcon?: React__default.ReactNode;
    /** Faz o botão ocupar a largura disponível; omitida, a largura acompanha o conteúdo. */
    fullWidth?: boolean;
    /** Define a escala de altura, espaçamento e texto; sem a prop, usa `md`. */
    size?: 'xs' | 'sm' | 'md' | 'lg';
}
/**
 * Componente Atômico: SarakButton
 * Respeita a Spec 08-taxonomia-componentes e implementa a universalização de Neon/Frosted para todas as variantes.
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo, para teclado e leitor de tela funcionarem por construção.
 */
declare const SarakButton: React__default.FC<SarakButtonProps>;

interface SarakIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Define a aparência visual sem mudar o tipo HTML; sem a prop, usa `primary`. */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Define a largura e a altura quadradas do botão; sem a prop, usa `md` (40 × 40 px). */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Troca o ícone pelo indicador de carregamento e desabilita o botão enquanto ativa; omitida, mantém o botão habilitado. */
    isLoading?: boolean;
    /** Elemento exibido dentro do botão; é obrigatório, e sem ele o botão não mostra um glifo; `isLoading` o substitui pelo indicador. */
    icon: React__default.ReactNode;
}
declare const SarakIconButton: React__default.FC<SarakIconButtonProps>;

interface SarakSocialButtonProps {
    /** Provedor usado no rótulo e callback. */
    provider: string;
    /** Elemento de marca fornecido pelo consumidor. */
    icon: React__default.ReactNode;
    /** Acabamento visual fornecido pelo consumidor. */
    variant: 'glass' | 'solid';
    /** Recebe o provedor clicado; omitido, o botão não executa ação. */
    onClick?: (provider: string) => void;
    /** Substitui o rótulo e o título acessível; omitido, usa o texto padrão. */
    label?: string;
    /** Esconde o texto e mantém o título acessível. */
    hideLabel?: boolean;
    /** Acrescenta classes com resolução de conflitos Tailwind. */
    className?: string;
}
type SarakSocialProviderId = SarakSocialButtonProps['provider'];
/** Botão de login social cuja marca visual pertence ao consumidor. */
declare const SarakSocialButton: ({ provider, icon, variant, onClick, label, hideLabel, className, }: SarakSocialButtonProps) => React__default.ReactElement;

type SarakDeviceType = 'smartphone' | 'tablet' | 'desktop';
/** Os dois limiares de responsividade em vigor, em px. */
interface SarakDeviceBreakpoints {
    tablet: number;
    desktop: number;
}
/** Limiares canônicos — o que vale quando o tema não declara os tokens. */
declare const SARAK_DEFAULT_DEVICE_BREAKPOINTS: SarakDeviceBreakpoints;
/**
 * Traduz uma largura de viewport (px) no dispositivo correspondente (mobile-first),
 * segundo os limiares em vigor (default: os canônicos).
 */
declare const sarakDeviceForWidth: (width: number, breakpoints?: SarakDeviceBreakpoints) => SarakDeviceType;
/**
 * Dispositivo ATIVO. Detecção REAL do viewport por padrão (estado inicial já vem da largura
 * atual — sem flash de `'desktop'`), reavaliada a cada `resize`. Um `overrideDevice` num
 * `DeviceProvider` ancestral (Gêmeo Digital/testes) sequestra o valor e desliga a escuta.
 */
declare const useSarakDevice: () => SarakDeviceType;
interface SarakDeviceProviderProps {
    children: ReactNode;
    /** Se fornecido, sequestra o dispositivo (Gêmeo Digital / testes) e desliga a detecção real. */
    overrideDevice?: SarakDeviceType;
    /** Limiares do tema ativo. Omitidos, valem os canônicos. */
    breakpoints?: SarakDeviceBreakpoints;
}
/**
 * Provider do override de dispositivo e dos limiares do tema. Sem `overrideDevice`, é um
 * passthrough transparente quanto ao dispositivo: a detecção real (no hook) governa.
 * Mantido na API por compatibilidade e para o Gêmeo Digital forçar um dispositivo no preview.
 */
declare const SarakDeviceProvider: React__default.FC<SarakDeviceProviderProps>;

/**
 * resolveResponsiveValue (Spec 40.3 — L2)
 *
 * Ponte entre o `ResponsiveValue<T>` (valor por breakpoint `mob`/`tab`/`desk`, Spec 16)
 * e o dispositivo ATIVO (`useSarakDevice`, `'smartphone'|'tablet'|'desktop'`). É a função
 * PURA que as primitivas de layout usam para aceitar `ResponsiveValue` sem duplicar a
 * lógica de seleção — o consumidor passa um valor por dispositivo (controle opcional) e a
 * primitiva resolve o do device atual. Um valor escalar (`T` puro) passa direto (default
 * mobile-first fica por conta de cada primitiva).
 *
 * Testável isoladamente (Regra 3). Não lê contexto React — recebe o `device` já resolvido.
 */

/** Dispositivo ativo — espelha `DeviceType` de `DeviceProvider` sem criar dependência de runtime. */
type SarakResponsiveDevice = 'smartphone' | 'tablet' | 'desktop';
/** True se `value` é um `ResponsiveValue<T>` (tem as três camadas `mob`/`tab`/`desk`). */
declare const sarakIsResponsiveValue: <T>(value: unknown) => value is SarakResponsiveValue<T>;
/**
 * Resolve `value` contra o dispositivo ativo. `ResponsiveValue<T>` → a camada do device;
 * `T` escalar → ele mesmo. Nunca lança; um objeto sem as três camadas não é `ResponsiveValue`.
 */
declare const sarakResolveResponsiveValue: <T>(value: T | SarakResponsiveValue<T>, device: SarakResponsiveDevice) => T;

interface SarakAnalyticalPageProps {
    navBar?: ReactNode;
    mainContent: ReactNode;
    sidePanel?: ReactNode;
    /** Se true, o painel lateral abre como um modal/drawer por cima no mobile. Se false, fica empilhado. Default: true */
    sidePanelAsDrawerOnMobile?: boolean;
    /** Se true, centraliza horizontalmente e verticalmente o mainContent no Desktop para preencher vazios. */
    centeredOnDesktop?: boolean;
    /** Largura do painel lateral em tablet e desktop: número em pixels ou comprimento CSS. Omitida, 16rem no tablet e 20rem no desktop. */
    sidePanelWidth?: number | string;
    /** Se true, a página ocupa a altura que o cromo deixa (e a rolagem fica no conteúdo, não na janela). Omitida, mantém a altura de sempre. */
    fillHeight?: boolean;
}
/**
 * SarakAnalyticalPage
 *
 * Uma Fôrma Inteligente (Smart Layout) para telas de dashboard/análise.
 * No Desktop: Distribui navBar, mainContent e sidePanel em colunas.
 * No Mobile: Oculta navBar ou transforma em modal, empilha mainContent e transforma sidePanel em BottomSheet/Drawer.
 */
declare const SarakAnalyticalPage: React__default.FC<SarakAnalyticalPageProps>;

interface SarakHiddenProps {
    children: ReactNode;
    /** Esconder quando o dispositivo ativo estiver nesta lista */
    on: SarakDeviceType | SarakDeviceType[];
}
/**
 * SarakHidden
 *
 * Componente utilitário que não renderiza o conteúdo dependendo do dispositivo.
 * Isso evita poluição do DOM e uso de RAM em dispositivos que não exibirão o componente.
 */
declare const SarakHidden: React__default.FC<SarakHiddenProps>;

/**
 * SarakShellNav — Navegação de shell 100% orientada a dados (Spec 33 + Spec 14)
 *
 * Menu guiado por DADOS: recebe os módulos como `items`, agrupa por categoria, destaca
 * o item ativo e **delega a navegação ao host** — nunca manipula a URL. O consumidor
 * passa `activeRoute` (a rota atual, do roteador dele) e reage em `onNavigate`.
 */
/** Item de navegação declarativo usado pelo cromo do aplicativo. */
interface SarakShellNavItem {
    /** Rótulo exibido no menu. */
    label: string;
    /** Rota destino (comparada com `activeRoute` para o destaque). */
    route: string;
    /** Nome registrado ou elemento do ícone fornecido pelo consumidor. */
    icon?: string | React__default.ReactNode;
    /** Impede navegação e foco sem remover o item do menu. */
    disabled?: boolean;
    /** Informação visual que também integra o nome acessível. */
    badge?: string | number;
    /** Contexto nativo da âncora. */
    target?: string;
    /** Agrupamento visual (itens sem categoria ficam no grupo raiz). */
    category?: string;
}
interface SarakShellNavProps {
    /** Módulos/rotas do sistema, na ordem de exibição. */
    items: SarakShellNavItem[];
    /** Rota ativa (a do roteador do consumidor) — comparada com `items[].route`. */
    activeRoute?: string;
    /** Identidade exibida no topo do menu. */
    brand?: {
        name?: string;
        logoUrl?: string;
    };
    /** Callback de navegação — o host decide como navegar (router, pushState, assign). */
    onNavigate?: (route: string) => void;
    /** Alias de `onNavigate`; ambos são chamados, na ordem. Mantido por compatibilidade. */
    onChange?: (route: string) => void;
    /**
     * Orientação do menu (Spec 18). `'auto'` (default) segue o Design Engine:
     * `design.navigationStyle === 'topbar'` → horizontal; qualquer outro → vertical.
     * Qualquer valor desconhecido é tratado como vertical.
     */
    orientation?: 'vertical' | 'horizontal' | 'auto';
    /** Colapsado (`isNavHidden`): só ícone, rótulo e categoria somem. */
    collapsed?: boolean;
    className?: string;
}
/** Menu vertical de shell guiado por dados, com grupos e estado ativo (Spec 33). */
declare const SarakShellNav: React__default.FC<SarakShellNavProps>;

/** Identidade do usuário exibida pelo widget do cromo. */
interface SarakShellUser {
    name: string;
    role?: string;
    avatarUrl?: string;
    email?: string;
}
interface SarakShellUserWidgetProps {
    /** Fornece a identidade genérica do usuário; omitido, exibe o rótulo genérico. */
    user?: SarakShellUser;
    /** Executa o encerramento de sessão e habilita o botão de sair; omitida, esse botão não é renderizado. */
    logout?: () => void;
    /** Ajusta o arranjo à barra, à lateral ou ao modo compacto; omitida, usa `vertical`. */
    variant?: 'horizontal' | 'vertical' | 'mini';
}
declare const SarakShellUserWidget: React__default.FC<SarakShellUserWidgetProps>;

interface SarakChromeNotification {
    id: string;
    label: string;
    description?: string;
}

interface SarakSearchItem {
    id: string;
    label: string;
    category?: string;
    icon?: React__default.ReactNode;
}
interface SarakSearchProps {
    isOpen: boolean;
    onClose: () => void;
    items: SarakSearchItem[];
    onSelect?: (id: string) => void;
}
declare const SarakSearch: (props: SarakSearchProps) => React__default.ReactElement;

/**
 * Item de navegação estruturado do `SarakAppChrome` (Spec 40.2 — L1).
 *
 * Modelo de NAVEGAÇÃO com ícone first-class, pensado para o consumidor de apps
 * separados (conector-redirect): cada item aponta para uma `href` (URL de destino)
 * e o próprio consumidor marca qual está `active`. É o contrato que o `@erp/ui-kit`
 * compartilha entre todos os apps para o cromo ficar IDÊNTICO em toda aba.
 *
 * O `icon` é resolvido pelo `SarakIcon`/`IconMap` curado (mesmo motor do shell),
 * temável por token, opcional por item. Difere do `ShellNavItem` (que usa
 * `route`/`activeRoute` do modelo declarativo) por trazer `id` estável + `active`
 * por item — mais ergonômico para um menu de topo estático por app.
 *
 * Mora em `chrome/` (e não no `SarakAppChrome.tsx`) só por higiene de tamanho de
 * arquivo — o tipo continua público pelo mesmo caminho (re-export no cromo + barril).
 */
interface SarakNavItem {
    /** Identidade estável do item (chave de render; não precisa ser a URL). */
    id: string;
    /** Rótulo exibido ao lado do ícone. */
    label: string;
    /** Nome registrado ou elemento do ícone fornecido pelo consumidor. Opcional. */
    icon?: string | React__default.ReactNode;
    /** URL de destino — o host navega para cá (redirect de página, router, etc.). */
    href: string;
    /** Marca o item como ativo (destaque + `aria-current="page"`). */
    active?: boolean;
    /** Impede navegação e foco sem remover o item do menu. */
    disabled?: boolean;
    /** Informação visual que também integra o nome acessível. */
    badge?: string | number;
    /** Contexto nativo da âncora. */
    target?: string;
    /** Agrupamento visual — mesmo campo do `ShellNavItem`; itens sem categoria ficam no grupo raiz. */
    category?: string;
}

/**
 * Widgets do cromo que nascem MONTADOS por padrão no `SarakAppChrome` — busca (com
 * atalho Ctrl/Cmd+K), alternância de tema, usuário, notificações e preferências de
 * tamanho da fonte, orientação da navegação, idioma e colapso.
 * Omitir um campo mantém o widget ligado; só `false` explícito desliga aquele, isolado
 * dos demais. Redimensionamento por arraste e auto-hide continuam fora do default —
 * não têm campo aqui de propósito.
 */
interface SarakChromeWidgets {
    /** Busca (slot `search`) — trigger + atalho Ctrl/Cmd+K. Default: ligado. */
    search?: boolean;
    /** Alternância de tema claro/escuro. Default: ligado. */
    themeToggle?: boolean;
    /** Identidade do usuário + logout. Default: ligado. */
    user?: boolean;
    /** Widget de notificações. Default: ligado. */
    notifications?: boolean;
    /** Preferência de tamanho da fonte. Default: ligado. */
    fontSize?: boolean;
    /** Preferência de orientação da navegação. Default: ligado. */
    navigationStyle?: boolean;
    /** Preferência de idioma. Default: ligado. */
    language?: boolean;
    /** Colapso da navegação (sidebar ícone-only / topbar reduzida) no desktop. Default: ligado. */
    collapse?: boolean;
}

/**
 * SarakAppChrome — cromo temável do aplicativo (topbar/sidebar) com navegação por dados.
 *
 * Cada aplicativo monta seu cromo com `children`, `navItems` e `onNavigate`; o
 * aplicativo controla suas telas e escolhe como atualizar a rota.
 *
 * Multidispositivo por padrão (Spec 40.3 — L1), zero-config via `useSarakDevice`: em
 * **desktop** é o cromo configurado (sidebar/topbar); em **tablet** vira topbar compacta
 * (a sidebar cheia comeria a tela ≤1024px); no **celular** colapsa para barra + hambúrguer
 * + drawer (`SarakAppChromeMobile`) — a nav não ocupa a tela toda e continua acessível. O
 * consumidor não escreve CSS/media query; para refinar, os tokens de cromo aceitam
 * `ResponsiveValue` pelo Design Engine.
 *
 * Extensibilidade de layout (Spec 48 — L1): os slots `logo`/`topbarStart`/`topbarEnd`/
 * `sidebarHeader`/`sidebarFooter`/`banner`/`footer`/`decoration` deixam o consumidor
 * injetar imagem, animação ou qualquer `ReactNode` em regiões do cromo sem forkar a
 * componente. Todos opcionais (ausente = região não renderiza); complementam — não
 * substituem — o fundo/atmosfera GLOBAL por tema do Design Engine.
 *
 * Zero hardcode (Regra 2): toda cor/medida vem de tokens `--sarak-*` com fallback.
 */
interface SarakAppChromeProps {
    /** Conteúdo do app (a tela do próprio módulo). */
    children: React__default.ReactNode;
    /** Slot `secondaryContent`: segundo painel, exibido quando `isSplitViewEnabled` está ligado. */
    secondaryContent?: React__default.ReactNode;
    /** Identidade exibida no cromo (topo da sidebar / início da topbar). */
    brand?: {
        name?: string;
        logoUrl?: string;
    };
    /**
     * Navegação ESTRUTURADA com ícone first-class (Spec 40.2 — L1). Renderiza
     * ícone (via `SarakIcon`/`SarakIconMap`) + label, temável por token, com estado
     * ativo acessível (`aria-current`, foco por teclado). É o caminho recomendado
     * para o cromo por-app; tem precedência sobre `nav` quando ambos são passados.
     */
    navItems?: SarakNavItem[];
    /**
     * Itens de navegação como DADO no contrato do `SarakShellNav` (modelo declarativo,
     * `route`/`activeRoute`). Mantido para compatibilidade; prefira `navItems`.
     */
    nav?: SarakShellNavItem[];
    /** Rota ativa (destaca o item correspondente no `nav`; ignorado se `navItems`). */
    activeRoute?: string;
    /** Clique/teclado num item de navegação — o host decide como navegar. */
    onNavigate?: (route: string) => void;
    /**
     * Estilo do cromo. `'auto'` (default) segue o Design Engine
     * (`design.navigationStyle === 'topbar'` → topbar; caso contrário → sidebar),
     * então trocar o tema no `/design` também troca a orientação do cromo.
     */
    navigationStyle?: 'sidebar' | 'topbar' | 'auto';
    /** Conteúdo à direita da topbar (ações, avatar, seletor de tema…). Alias legado de `topbarEnd`. */
    topbarActions?: React__default.ReactNode;
    /**
     * Slot `logo` (Spec 48 — L1): logo custom/animado (`ReactNode`). Tem PRECEDÊNCIA
     * sobre `brand.logoUrl`; o `brand.name` continua ao lado. Aparece nos três modos.
     */
    logo?: React__default.ReactNode;
    /**
     * Slot `topbarStart`: conteúdo no INÍCIO da barra superior (após a marca).
     * Sem barra superior (modo sidebar) degrada para o topo da sidebar.
     */
    topbarStart?: React__default.ReactNode;
    /**
     * Slot `topbarEnd`: conteúdo no FIM da barra superior. É o mesmo lugar do
     * `topbarActions` (alias preservado); quando os dois vêm, `topbarEnd` vence.
     * No modo sidebar degrada para o rodapé da sidebar (comportamento atual).
     */
    topbarEnd?: React__default.ReactNode;
    /**
     * Slot `search`: conteúdo de busca do consumidor (tipicamente um
     * `SarakShellSearchWidget`), posicionado por `design.searchPositionTopbar`
     * (`left`/`center`/`right`) na topbar e `design.searchPositionSidebar`
     * (`top`/`bottom`) na sidebar/drawer. A composição do widget controla se a
     * busca default é oferecida; a região personalizada continua controlada pelo
     * conteúdo desta prop.
     */
    search?: React__default.ReactNode;
    /** Slot `sidebarHeader`: topo da sidebar (abaixo da marca). No celular migra para o drawer. */
    sidebarHeader?: React__default.ReactNode;
    /** Slot `sidebarFooter`: rodapé da sidebar. No celular migra para o drawer. */
    sidebarFooter?: React__default.ReactNode;
    /** Slot `banner`: faixa full-width no topo do cromo (aviso, promo, faixa animada). */
    banner?: React__default.ReactNode;
    /** Slot `footer`: faixa full-width na base do cromo (rodapé da página). */
    footer?: React__default.ReactNode;
    /**
     * Slot `decoration`: camada decorativa ATRÁS do conteúdo do cromo (imagem/animação
     * escopada ao cromo). É ornamento — `aria-hidden` e sem captura de foco/toque.
     * COMPLEMENTA o fundo/atmosfera global por tema (Design Engine), não o substitui.
     */
    decoration?: React__default.ReactNode;
    /** Identidade exibida no widget de usuário default. */
    user?: SarakShellUser;
    /** Encerra a sessão a partir do widget de usuário default. */
    logout?: () => void;
    /** Notificações fornecidas pelo aplicativo para o widget da barra. */
    notifications?: SarakChromeNotification[];
    /** Trata a seleção de uma notificação pelo usuário. */
    onNotificationSelect?: (notification: SarakChromeNotification) => void;
    /**
     * O cromo nasce com busca (atalho Ctrl/Cmd+K incluso), alternância de tema, widget
     * de usuário, notificações e colapso da navegação MONTADOS — sem escrever nada.
     * Omitir esta prop mantém os widgets ligados; `false` num campo desliga só aquele.
     * Um slot preenchido pelo consumidor (`search`) sempre vence o default correspondente.
     */
    widgets?: SarakChromeWidgets;
    className?: string;
    style?: React__default.CSSProperties;
}
/**
 * Cromo apresentacional. Renderiza topbar OU sidebar (por `navigationStyle`) + a área
 * de conteúdo, tudo pintado pelos tokens de navegação (Spec 18) que o Design Engine emite.
 */
declare const SarakAppChrome: React__default.FC<SarakAppChromeProps>;

interface SarakIconPresentationProps {
    size?: number | string;
    className?: string;
    color?: string;
    style?: React__default.CSSProperties;
    strokeWidth?: number;
    onClick?: () => void;
}
type SarakIconProps = SarakIconPresentationProps & ({
    name: React__default.ReactNode;
    icon?: never;
} | {
    icon: React__default.ReactNode;
    name?: never;
});
interface SarakRegisteredIconProps extends SarakIconPresentationProps {
    weight?: string;
    strokeWidth?: number;
}
/** Adds consumer icons by name and returns a function that removes this registration. */
declare function sarakRegisterIcons(icons: Record<string, React__default.ElementType>): () => void;
declare const SarakIcon: (props: SarakIconProps) => React__default.ReactElement;

/**
 * Contrato público de nomes de ícone da Sarak UI Core (Spec 41 §2.3).
 *
 * Esta lista contém os nomes integrados: dela derivam o tipo, os três mapas de
 * família (`families/`) — que o TypeScript obriga a cobrir 1:1 — e a seção de
 * ícones do catálogo gerado (`docs/component-catalog.*`). O consumidor pode
 * acrescentar nomes com `sarakRegisterIcons` ou passar um elemento.
 *
 * Um nome não integrado nem registrado degrada para o ícone de aviso e emite
 * `console.warn` (postura da Spec 17). Antes da
 * Spec 41 qualquer nome do `lucide-react` funcionava, porque o componente caía
 * num acesso dinâmico ao barril (`LucideIcons[nome]`) — o que impedia o
 * tree-shaking e arrastava ~1500 ícones para o bundle do consumidor.
 *
 * Para acrescentar um nome integrado: some-o aqui e o compilador vai cobrar a entrada
 * correspondente nas três famílias. Cada nome novo custa ~2,6 KB no `dist/` da
 * lib (phosphor ~2,35 KB + tabler ~0,28 KB — o lucide é `external`), então a
 * lista é curada de propósito, não exaustiva. Nomes registrados pelo consumidor
 * não geram entradas nas famílias incluídas no pacote.
 */
declare const SARAK_ICON_NAMES: readonly ["AlertCircle", "AlertTriangle", "Check", "CheckCircle2", "X", "Info", "HelpCircle", "Menu", "Search", "Bell", "Filter", "List", "ListOrdered", "Grid", "Layout", "LayoutDashboard", "LayoutGrid", "Home", "ChevronDown", "ChevronLeft", "ChevronRight", "ChevronUp", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowUpDown", "CornerDownRight", "MoreVertical", "MoreHorizontal", "Maximize2", "Minimize2", "Loader2", "RefreshCw", "ZoomIn", "ZoomOut", "User", "UserPlus", "Users", "LogIn", "LogOut", "Lock", "Shield", "ShieldCheck", "Eye", "EyeOff", "File", "FileText", "FileSpreadsheet", "Folder", "Image", "Paperclip", "ScrollText", "Clipboard", "Copy", "Download", "Upload", "UploadCloud", "Printer", "Save", "Edit", "Edit3", "Bold", "Italic", "Plus", "Trash2", "Type", "AlignLeft", "Hash", "Activity", "BarChart3", "LineChart", "PieChart", "ScatterChart", "TrendingUp", "Database", "Layers", "Network", "Box", "Package", "Cpu", "Cloud", "Terminal", "Binary", "Thermometer", "History", "Calendar", "Clock", "MessageSquare", "Mail", "Send", "Phone", "Bot", "Globe", "Link", "Link2", "ExternalLink", "Command", "Briefcase", "Building", "CreditCard", "DollarSign", "MapPin", "Tag", "Star", "Play", "Palette", "Settings", "Settings2", "Zap", "Sparkles", "Compass", "Sun", "Moon", "XCircle", "ToggleLeft", "ToggleRight"];
/** Nome de ícone válido no contrato público. */
type SarakIconName = (typeof SARAK_ICON_NAMES)[number];
/** Ícone usado quando o nome pedido não existe no contrato (degradação visível). */
declare const SARAK_ICONE_DESCONHECIDO: SarakIconName;

/**
 * Mapa curado nome→componente das três famílias de ícone.
 *
 * A lista de nomes vive em `iconNames.ts` (contrato público, publicado no
 * catálogo); cada família tem seu módulo em `families/`, com imports NOMEADOS
 * e estáticos. O tipo `Record<IconName, ...>` de cada módulo faz o compilador
 * garantir a paridade 1:1:1 entre as famílias — nome sem tripla não compila.
 */

/** Famílias de ícone suportadas pelo token `iconFamily`. */
type SarakIconFamily = 'lucide' | 'phosphor' | 'tabler';
interface SarakIconTriple {
    lucide: React__default.ElementType;
    phosphor: React__default.ElementType;
    tabler: React__default.ElementType;
}
declare const SarakIconMap: Record<SarakIconName, SarakIconTriple>;

declare const useDesignDraft: (sarak: SarakUIContextType) => {
    draft: SarakDesignState;
    previewDraft: SarakDesignState;
    isDirty: boolean;
    dirtyTokenCount: number;
    isComponentDirty: (schemaId: string) => boolean;
    updateDraft: (key: string, value: SarakTokenValue) => void;
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (tokenId: string) => void;
    discardDraft: () => void;
    handleThemePreview: (presetDesign: Partial<SarakDesignState>, presetKeyId?: string, themeId?: string) => void;
    setDraftThemeId: React__default.Dispatch<React__default.SetStateAction<string | undefined>>;
    handleApplyToSystem: () => void;
    canUndoLastApply: boolean;
    undoLastApply: () => void;
    toast: {
        type: "success" | "warning";
        message: string;
    } | null;
    showToast: (type: "success" | "warning", message: string) => void;
};

declare const SARAK_THEME_CATALOG: readonly SarakThemeCatalogEntry[];

/**
 * Carrega um tema embarcado (cache em memória; um `import()` por id). Rejeita
 * com id desconhecido — nunca devolve `undefined` mudo.
 */
declare const sarakLoadThemePreset: (id: string) => Promise<SarakThemePreset>;
/** Carrega vários de uma vez e popula o cache síncrono que o Provider lê. */
declare const sarakPreloadThemes: (ids: readonly string[]) => Promise<SarakThemePreset[]>;
/** Todos os embarcados — para o painel e para ferramenta. */
declare const sarakLoadAllThemePresets: () => Promise<SarakThemePreset[]>;

/** Os ids que `sarakDeriveThemeFromReference` aceita SEM carregar nada: os do boot. */
type SarakReferenceThemeId = 'sarak-sovereign';
/**
 * Referência ESCURA e COMPLETA, síncrona (`sarak-sovereign`, topbar/sidebar, Outfit) —
 * ponto de partida para o consumidor. Use direto em `customThemes` do
 * `SarakUIProvider`, ou clone e ajuste. O par claro vem de `sarakLoadReferenceThemes()`.
 */
declare const SARAK_BOOT_THEMES: SarakThemePreset[];
/** O par COMPLETO de referência — claro e escuro —, carregando o que ainda não está em memória. */
declare const sarakLoadReferenceThemes: () => Promise<SarakThemePreset[]>;
/** O que `deriveThemeFromReference` recebe: identidade do tema derivado + as
 *  sobreposições de `design`. `id` não é `ThemePresetId` — um tema
 *  derivado é do CONSUMIDOR, fora da união fechada dos temas shippados. */
interface SarakThemeReferenceOverrides {
    id: string;
    name: string;
    description?: string;
    design: Record<string, unknown>;
}
/** O que `deriveThemeFromReference` devolve — mesma forma de `ThemeEntry` (Provider/types.ts),
 *  com `contraparte` a mais. Bate estruturalmente com `ModeResolvableTheme`
 *  (`color-engine.ts`), então segue direto para `resolveThemeForMode`. */
interface SarakDerivedThemePreset {
    id: string;
    name: string;
    description?: string;
    design: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}
/**
 * Deriva um tema COMPLETO — `design` e `contraparte` — de um tema de
 * referência: o id do tema do boot (síncrono) ou um preset já carregado. Substitui o padrão que a spec 09 §4.1 registrou como
 * erro recorrente: `{ ...REF.design, primaryColor: X }` copia só metade do
 * tema e descarta a contraparte — a troca de modo volta a degradar, em
 * silêncio, para quem clonou.
 *
 * As sobreposições de `design` são aplicadas nos DOIS modos: toda chave que
 * também exista na `contraparte` da referência é espelhada lá — sem isso, o
 * modo oposto voltaria a mostrar o valor ANTIGO da referência, e a troca de
 * modo pareceria reverter a customização. Chave de marca (`primaryColor`,
 * `accentColor`, `btnPrimaryBg`…) não está em nenhuma contraparte autorada —
 * para essas, o merge em `design` já basta, e a identidade da marca atravessa
 * os dois modos porque nunca esteve na contraparte para começo de conversa.
 */
declare function sarakDeriveThemeFromReference(referenceOrId: SarakReferenceThemeId | SarakThemePreset, overrides: SarakThemeReferenceOverrides): SarakDerivedThemePreset;

/**
 * Resolutor oficial de tokens semânticos de espaçamento (Spec 16).
 *
 * Os átomos estruturais descrevem espaçamento com tokens semânticos
 * (`gap="spacing-md"`). Antes desta camada, eles jogavam a string CRUA no CSS
 * (`gap: spacing-md`) — inválida e descartada em silêncio pelo browser. Este módulo é
 * a fonte ÚNICA que traduz token → CSS Variable, deixa passar CSS já válido e AVISA
 * (com sugestão) quando o autor inventa um valor, degradando para o default do Design
 * Engine em vez de quebrar a tela.
 *
 * As `px` abaixo são apenas FALLBACKS dentro de `var(--x, N)` — o mesmo padrão
 * canônico já emitido por `src/core/Provider/manifest.ts`; a fonte real do valor
 * continua sendo a CSS Variable do tema.
 */
/**
 * Mapa oficial dos tokens de espaçamento → CSS Variable (com fallback).
 * FONTE ÚNICA. Manter os valores atrelados às vars `--sarak-layout-gap-*`.
 */
declare const SPACING_TOKENS: {
    readonly 'spacing-xs': "calc(var(--sarak-layout-gap-sm, 8px) * 0.5)";
    readonly 'spacing-sm': "var(--sarak-layout-gap-sm, 8px)";
    readonly 'spacing-md': "var(--sarak-layout-gap-md, 16px)";
    readonly 'spacing-lg': "var(--sarak-layout-gap-lg, 24px)";
    readonly 'spacing-xl': "calc(var(--sarak-layout-gap-lg, 24px) * 1.5)";
};
/** Valores aceitos pelas props `gap` das primitivas de layout. */
type SarakLayoutGap = keyof typeof SPACING_TOKENS | number | '0' | `${number}${'px' | 'rem' | 'em' | '%' | 'vh' | 'vw' | 'ch' | 'vmin' | 'vmax'}` | `${'var' | 'calc' | 'clamp' | 'min' | 'max'}(${string})`;

/**
 * Helper para obter todos os tokens em uma lista plana.
 */
declare const sarakGetAllDesignTokens: () => SarakDesignToken[];
/**
 * Helper para obter os valores padrão de todos os tokens.
 */
declare const sarakGetDefaultDesignState: () => Record<string, SarakTokenValue>;

type SarakPaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic';
type SarakPaletteMode = 'light' | 'dark';
interface SarakOklchColor {
    lightness: number;
    chroma: number;
    hue: number;
}
interface SarakPaletteInput {
    type: SarakPaletteType;
    base: string;
    secondary?: string;
    accent?: string;
}
interface SarakPaletteSeeds {
    primary: SarakOklchColor;
    secondary: SarakOklchColor;
    accent: SarakOklchColor;
    neutral: SarakOklchColor;
    success: SarakOklchColor;
    error: SarakOklchColor;
    warning: SarakOklchColor;
    info: SarakOklchColor;
}

declare const sarakResolvePalette: (value: string, mode: SarakPaletteMode) => Record<string, string>;

/**
 * Cobertura de EIXOS de um tema (Spec 40.1 — L6, aviso de omissão).
 *
 * Um tema "completo" preenche todos os eixos conceituais que o consumidor espera ver
 * mudar ao trocar de tema: cor, fonte, cromo (topbar/sidebar), raio e espaçamento. Um
 * tema que omite um eixo inteiro (o `ERP_THEMES` do v5, só cor) faz o consumidor achar
 * que "a lib não muda fonte/cromo", quando na verdade o TEMA é que não os declara.
 *
 * `findMissingThemeAxes` detecta esses buracos; `warnOnIncompleteTheme` avisa uma vez
 * (dev), sem lançar. São utilitários OPT-IN — a lib não força completude, só ajuda o
 * consumidor a não ficar silenciosamente incompleto.
 */

/** Eixo conceitual → tokens representativos (basta UM presente para o eixo contar). */
declare const SARAK_THEME_AXES: Readonly<Record<string, readonly string[]>>;
/**
 * Eixos que o tema NÃO declara (nenhum token representativo presente). Vazio = completo.
 * Um `colorPalette` válido declara, por ele, todo token de cor que o motor de paletas calcula.
 */
declare const sarakFindMissingThemeAxes: (design: SarakDesignState | Record<string, unknown>) => string[];
/**
 * Avisa (uma vez, `console.warn`) se o tema omite eixos inteiros. Não lança — apenas
 * sinaliza ao dev. Chame ao aplicar um tema custom para não ficar incompleto em silêncio.
 */
declare const sarakWarnOnIncompleteTheme: (design: SarakDesignState | Record<string, unknown>, label?: string) => string[];

/**
 * `CustomizationPanel` — fronteira lazy.
 *
 * O painel arrasta o Design Engine inteiro (abas, canvas de preview, controles de token).
 * Exportado eager, ele punia no boot todo consumidor que nunca abre o painel — a dívida
 * mais cara de [[03-superficie-publica]] §8, e a violação direta da regra §7 (*nada pesado
 * sai eager do barril*).
 *
 * `Suspense` é interno, no padrão do `SarakChartEngine`: quem renderiza
 * `<CustomizationPanel />` continua não precisando declarar `Suspense`, e o tipo público
 * segue sendo `React.FC` — a fronteira lazy não vaza para o contrato.
 */

declare const SarakCustomizationPanel: React__default.FC;

type SarakTypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'mono';
type SarakTypographyColor = 'main' | 'secondary' | 'muted' | 'title' | 'subtitle' | 'emphasis';
interface SarakTypographyProps extends React__default.HTMLAttributes<HTMLElement> {
    /** Escala tipográfica (Spec typography — tokens `h1Size`/`h2Size`/etc). Default: `body`. */
    variant?: SarakTypographyVariant;
    /** Papel de cor do texto. Títulos usam `title` por padrão; os demais usam `main`. */
    color?: SarakTypographyColor;
    /** Tag HTML a renderizar; sobrepõe o default semântico do `variant`. */
    as?: React__default.ElementType;
    /** Sobrepõe `--sarak-h-transform` só para esta instância. */
    transform?: 'none' | 'uppercase' | 'capitalize';
    /**
     * Texto via prop, para quando a origem é uma string e não nós filhos (ex.: dado
     * vindo de uma API). Tem prioridade sobre `children` quando ambos são passados.
     */
    content?: string;
    children?: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakTypography (Spec typography).
 * Único átomo de texto/hierarquia tipográfica da Sarak — resolvível via manifesto
 * (`"type": "SarakTypography"`) ou uso direto em TSX. 100% orientado a tokens já
 * existentes no Design Engine (nenhum valor visual novo introduzido).
 */
declare const SarakTypography: React__default.FC<SarakTypographyProps>;

type SarakAvatarSize = 'xs' | 'sm' | 'md' | 'lg';
interface SarakAvatarProps extends Omit<React__default.HTMLAttributes<HTMLSpanElement>, 'children'> {
    /**
     * Nome da pessoa; obrigatório e usado como texto alternativo padrão e como origem das iniciais.
     * Nome vazio (se a tipagem for contornada) exibe `?` no fallback.
     */
    name: string;
    /**
     * Endereço da foto. Omitido, o avatar mostra as iniciais; se a imagem falhar ao carregar,
     * também volta às iniciais. Para tentar novamente a mesma URL, remonte o componente.
     */
    src?: string;
    /**
     * Texto alternativo da foto e nome acessível do fallback. Omitido, usa `name`; string vazia
     * torna a imagem decorativa e deixa as iniciais sem nome acessível.
     */
    alt?: string;
    /**
     * Tamanho na escala `xs`/`sm`/`md`/`lg` dos átomos. Omitido, usa `md`; o tamanho acompanha
     * o token de espaçamento médio do tema.
     */
    size?: SarakAvatarSize;
}
declare const SarakAvatar: ({ name, src, alt, size, className, style, ...props }: SarakAvatarProps) => React__default.ReactElement;

declare const sarakFormatNumber: (value: number | null | undefined, locale?: string, options?: Intl.NumberFormatOptions) => string;

declare const sarakFormatCurrency: (value: number | null | undefined, currency: string, locale?: string) => string;

declare const sarakFormatPercent: (value: number | null | undefined, locale?: string, options?: Omit<Intl.NumberFormatOptions, "style">) => string;

declare const sarakFormatDate: (value: Date | string | number | null | undefined, locale?: string, options?: Intl.DateTimeFormatOptions) => string;

type SarakValueFormat = {
    type: 'number';
    options?: Intl.NumberFormatOptions;
} | {
    type: 'currency';
    currency: string;
} | {
    type: 'percent';
    options?: Omit<Intl.NumberFormatOptions, 'style'>;
} | {
    type: 'date';
    options?: Intl.DateTimeFormatOptions;
};

interface SarakValueProps {
    value: number | Date | string | null | undefined;
    format?: SarakValueFormat;
    locale?: string;
    signColor?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
declare const SarakValue: ({ value, format, locale: localeOverride, signColor, size, className }: SarakValueProps) => ReactElement;

interface SarakExpandableCardProps {
    /** Título obrigatório do cabeçalho nas visualizações compacta e expandida; sem valor, o título fica vazio. */
    title: string;
    /** Elemento ao lado do título; omitido, o cabeçalho não reserva um ícone. */
    iconContent?: React__default.ReactNode;
    /** Ação ou conteúdo auxiliar no cabeçalho; omitido, essa área não é renderizada. */
    helpButton?: React__default.ReactNode;
    /** Conteúdo obrigatório das visualizações compacta e expandida; se omitido ou vazio, deixa o corpo sem conteúdo. */
    children: React__default.ReactNode;
    /** Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
    /** Acrescenta classes à área do conteúdo; omitida, a área usa apenas as classes internas do cartão. */
    contentClassName?: string;
    /** Altura mínima compacta em pixels, ajustada pelo fator tipográfico do tema; sem a prop, usa 300 px. */
    baseHeight?: number;
}
declare const SarakExpandableCard: React__default.FC<SarakExpandableCardProps>;

interface SarakActionCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    onAction?: (item: TItem) => void;
    design?: SarakThemePayload;
    label?: string;
    /** Texto do botão de ação principal (default: "Executar"). */
    actionLabel?: string;
}
declare const SarakActionCard: <TItem extends Record<string, unknown>>({ item, mapping, className, onAction, design: localDesign, label, actionLabel }: SarakActionCardProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakCardFooterProps {
    /** Conteúdo do rodapé; se omitido, o invólucro do rodapé permanece vazio. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}
/** Peça de rodapé para compor um cartão Sarak. */
declare const SarakCardFooter: ({ children, className }: SarakCardFooterProps) => ReactElement;

interface SarakCardBodyProps {
    /** Conteúdo principal; se omitido, a área do corpo permanece vazia. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}
/** Peça de corpo para compor um cartão Sarak. */
declare const SarakCardBody: ({ children, className }: SarakCardBodyProps) => ReactElement;

interface SarakCardHeaderProps {
    /** Conteúdo do cabeçalho; se omitido, o invólucro do cabeçalho permanece vazio. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}
/** Peça de cabeçalho para compor um cartão Sarak. */
declare const SarakCardHeader: ({ children, className }: SarakCardHeaderProps) => ReactElement;

type SarakCardDensity = 'sm' | 'md' | 'lg';
interface SarakCardProps {
    /** Conteúdo composto do cartão; se omitido, a moldura temática permanece vazia. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, o cartão mantém largura total e sua moldura temática. Classes utilitárias conflitantes substituem o padrão; a classe `sarak-card` é preservada para aplicar os tokens do tema. */
    className?: string;
    /** Marca o cartão inteiro como alvo do ponteiro: só ele sobe, cresce ou brilha no hover (`cardHoverStyle`). Omitida, o cartão é contêiner e não se move. */
    interactive?: boolean;
    /** Espaçamento interno: `sm` e `lg` leem `--sarak-card-padding-sm|lg` (derivados do `md` do tema, sobrescrevíveis em CSS). Omitida, `md`, como sempre foi. */
    density?: SarakCardDensity;
}
/** Cartão genérico que expõe cabeçalho, corpo e rodapé por notação de ponto. */
declare const SarakCard: (({ children, className, interactive, density }: SarakCardProps) => React.JSX.Element) & {
    Header: ({ children, className }: SarakCardHeaderProps) => React$1.ReactElement;
    Body: ({ children, className }: SarakCardBodyProps) => React$1.ReactElement;
    Footer: ({ children, className }: SarakCardFooterProps) => React$1.ReactElement;
};

interface SarakSearchCardProps<TItem extends Record<string, unknown>> {
    /** Registro genérico exigido pela assinatura; a implementação atual não o consulta, então ele não altera o conteúdo visível. */
    item: TItem;
    /** Caminhos de campos previstos para o registro; a implementação atual não lê o mapa, então fornecê-lo não altera o cartão. */
    mapping?: Record<string, string>;
    /** Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
    /** Recebe o texto a cada edição da busca; sem callback, a busca ainda muda localmente, mas nenhum valor é enviado ao consumidor. */
    onSearchChange?: (text: string) => void;
    /** Recebe a capacidade (`vision`, `web` ou `chat`) e seu novo estado; sem callback, os alternadores mudam apenas o estado local. */
    onToggleCapability?: (cap: string, active: boolean) => void;
    /** Substitui o tema do provider para este cartão; omitida, usa o tema global. */
    design?: SarakThemePayload;
    /** Texto do selo de rascunho; sem a prop, usa `Card de Interação`, e o selo só aparece durante a composição de rascunho. */
    label?: string;
}
declare const SarakSearchCard: <TItem extends Record<string, unknown>>({ item, mapping, className, onSearchChange, onToggleCapability, design: propDesign, label }: SarakSearchCardProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakTitleCardProps<TItem extends Record<string, unknown>> {
    /** Registro obrigatório usado para obter título, subtítulo, contexto, capacidades e ícone pelos caminhos de `mapping`. */
    item: TItem;
    /** Associa esses campos a caminhos do registro; aceita caminhos pontuados e, sem a prop, não há valores mapeados (o subtítulo usa `Modelo`). */
    mapping?: Record<string, string>;
    /** Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
    /** Substitui o tema do provider para este cartão; omitida, usa o tema global. */
    design?: SarakThemePayload;
    /** Texto do selo de rascunho; sem a prop, usa `Card de Título`, e o selo só aparece durante a composição de rascunho. */
    label?: string;
}
declare const SarakTitleCard: <TItem extends Record<string, unknown>>({ item, mapping, className, design: localDesign, label }: SarakTitleCardProps<TItem>) => react_jsx_runtime.JSX.Element;

type SarakFlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse' | string;
interface SarakFlexProps extends Omit<React__default.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React__default.ReactNode;
    /** Direção do eixo. Aceita `SarakResponsiveValue` para variar por dispositivo (opcional). */
    direction?: SarakFlexDirection | SarakResponsiveValue<SarakFlexDirection>;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string;
    align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | string;
    gap?: SarakLayoutGap;
    /**
     * Quebra em múltiplas linhas quando não cabe (mobile-first). Default `true`: uma linha de
     * itens nunca estoura a página no celular — reflui para baixo. Passe `false` para forçar
     * linha única (nowrap) quando o layout exigir.
     */
    wrap?: boolean;
    as?: React__default.ElementType;
}
/**
 * Componente Atômico de Micro-Layout (Flexbox).
 * O SarakFlex é um container flexível que lê os estilos estruturais do Design Engine
 * ou aceita injeção local de parâmetros, traduzindo-os sem depender de classes CSS hardcoded.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): `wrap` liga por padrão (itens quebram em vez
 * de transbordar no celular) e `direction` aceita `ResponsiveValue` para controle opcional.
 */
declare const SarakFlex: React__default.FC<SarakFlexProps>;

interface SarakGridProps extends Omit<React__default.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React__default.ReactNode;
    /**
     * Colunas do grid. Aceita:
     * - `string` fixo (ex.: `"1fr 1fr 1fr"`): mobile-first por padrão — **colapsa para 1
     *   coluna no celular** (nunca estoura a página), reflui no valor cheio em tablet/desktop.
     * - `SarakResponsiveValue<string>` (`{ mob, tab, desk }`): o consumidor controla por dispositivo.
     * Sem `templateColumns`, usa a estratégia de grid do Design Engine (também 1 coluna no celular).
     */
    templateColumns?: string | SarakResponsiveValue<string>;
    /**
     * Quantidade de colunas iguais: um número ou um valor por dispositivo (`{ mob, tab, desk }`).
     * Vence `templateColumns` se os dois vierem. Omitida, o grid faz o que fazia. Um número fixo
     * colapsa para 1 coluna no celular, como `templateColumns`; para ter mais, declare `mob`.
     */
    columns?: number | SarakResponsiveValue<number>;
    templateAreas?: string;
    gap?: SarakLayoutGap;
    as?: React__default.ElementType;
}
/**
 * Componente Atômico de Macro-Layout.
 * O SarakGrid é o container raiz que lê o Token de Layout do Design Engine
 * e organiza os componentes filhos (Cards, Tabelas, Gráficos) na malha correta.
 * Ele elimina a necessidade de chumbarmos "grid-cols-X" nas telas.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): um `templateColumns` fixo colapsa para
 * **uma coluna no celular** (via `useSarakDevice`), então nenhum grid estoura horizontalmente
 * no mobile sem o consumidor escrever CSS. Para controlar por dispositivo, passe um
 * `ResponsiveValue<string>`.
 */
declare const SarakGrid: React__default.FC<SarakGridProps>;

interface SarakGridItemProps extends React__default.HTMLAttributes<HTMLDivElement> {
    /**
     * Quantas trilhas o item ocupa: um número, `'full'` (a linha toda) ou um valor por dispositivo
     * (`{ mob, tab, desk }`). Omitida, o item ocupa uma trilha, no fluxo normal. Um `span` maior que
     * as colunas do grid vira `'full'` — no celular, onde o grid tem uma coluna, isso acontece sozinho.
     */
    span?: number | 'full' | SarakResponsiveValue<number | 'full'>;
    /** Quantas linhas o item ocupa, por dispositivo ou fixo. Omitida, uma linha. */
    rowSpan?: number | SarakResponsiveValue<number>;
    /** Elemento renderizado. Omitida, `div`. */
    as?: React__default.ElementType;
    children?: React__default.ReactNode;
}
/**
 * Filho de `SarakGrid` que escolhe a própria ocupação de coluna por dispositivo, sem classe
 * utilitária. O dispositivo vem do `DeviceProvider` (breakpoints do tema). As classes `col-span-*`
 * continuam valendo em qualquer filho do grid.
 */
declare const SarakGridItem: React__default.FC<SarakGridItemProps>;

interface SarakSplitPaneProps {
    /** Conteúdo obrigatório do painel esquerdo; em celulares, aparece antes do painel direito. */
    leftPane: React__default.ReactNode;
    /** Conteúdo obrigatório do painel direito; em celulares, aparece depois do painel esquerdo. */
    rightPane: React__default.ReactNode;
    /** Limite inferior, em pixels, ao arrastar com mouse; sem a prop, usa 200 px, não se aplica no celular e não é ajustável por toque em tablet. */
    minLeftWidth?: number;
    /** Limite superior, em pixels, ao arrastar com mouse; sem a prop, usa 800 px, não se aplica no celular e não é ajustável por toque em tablet. */
    maxLeftWidth?: number;
    /** Largura inicial do painel esquerdo, em pixels; sem a prop, usa 300 px, sem ajustar esse valor aos limites até o primeiro arraste. */
    defaultLeftWidth?: number;
    /** Acrescenta classes ao contêiner; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
}
/**
 * Componente de Painel Redimensionável (Split Pane).
 * Permite arraste fluido entre dois painéis respeitando os limites configurados.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): no celular (`useSarakDevice`) os painéis
 * **empilham** em coluna full-width (sem a divisória de arraste, que não faz sentido no
 * touch estreito) — nenhum painel de largura fixa estoura a página. Em tablet/desktop
 * mantém o split redimensionável.
 */
declare const SarakSplitPane: React__default.FC<SarakSplitPaneProps>;

interface SarakAccordionProps {
    /** Título obrigatório do botão que abre e fecha o painel; sem conteúdo, o controle fica sem título visível. */
    title: React__default.ReactNode;
    /** Conteúdo obrigatório do painel, mantido no DOM mesmo quando recolhido; se omitido, o painel fica vazio. */
    children: React__default.ReactNode;
    /** Define o estado inicial do painel; sem a prop, começa recolhido e mudanças posteriores não o controlam. */
    defaultOpen?: boolean;
    /** Acrescenta classes à raiz do acordeão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
}
/**
 * Componente Atômico de Acordeão (Expansível).
 * Empurra o conteúdo abaixo fluidamente lendo os tokens de animação da Engine.
 */
declare const SarakAccordion: React__default.FC<SarakAccordionProps>;

interface SarakFormGroupProps extends React__default.HTMLAttributes<HTMLDivElement> {
    children: React__default.ReactNode;
    /** Espaçamento entre label e campo — token semântico, número ou comprimento CSS. */
    gap?: SarakLayoutGap;
}
/**
 * Componente Atômico de Agrupamento de Formulários.
 * O SarakFormGroup envelopa Labels e Inputs, lendo as propriedades de
 * "Form Label Position" e "Form Density" do Design Engine para rearranjar
 * a estrutura sem que o desenvolvedor altere o JSX.
 */
declare const SarakFormGroup: React__default.FC<SarakFormGroupProps>;

interface SarakScrimProps {
    /** Fecha a camada — chamado ao clique em qualquer ponto do scrim. */
    onClose: () => void;
    /** Rótulo acessível do scrim (ex.: "Fechar menu de navegação"). */
    ariaLabel: string;
    className?: string;
    /** `data-testid`, para quem precisa localizar o scrim em teste sem depender do
     * `ariaLabel`. Não é passthrough genérico de props — evita colidir com os tipos de
     * evento do `motion.button` (que redefine `onDrag` e afins com assinatura própria). */
    testId?: string;
    /** Sobrepõe o fundo padrão (`--sarak-modal-overlay`, do token `modalOverlayColor`) —
     * para consumidores que já liam a cor do overlay de um token de design próprio antes
     * de migrar para este átomo. */
    style?: React__default.CSSProperties;
    /** Ativa a transição de opacidade na entrada/saída. Default `false` — o comportamento
     * de sempre, sem animação (plan-19/20/22 pararam exatamente por causa disto: dar
     * animação sem ela ser opcional removeria o scrim estático que já existe). */
    animate?: boolean;
    /** Só tem efeito com `animate`. Alvo da opacidade (1 = visível, 0 = invisível) SEM
     * desmontar — para consumidores que gerenciam o próprio atraso de desmontagem (ex.:
     * `SarakDrawer`, que mantém o overlay montado até a transição terminar). Quando
     * omitido, assume visível — o caso de quem desmonta via `AnimatePresence` por fora
     * (ex.: `Controls.tsx`), onde o `exit` já cobre o fade de saída. */
    visible?: boolean;
    /** Só tem efeito com `animate`. Duração da transição em ms. Default 300 — o mesmo
     * valor que o `motion.div` ad hoc de `Controls.tsx` já usava (default do framer-motion
     * para uma transição de opacidade sem `transition` explícito). */
    durationMs?: number;
}
/**
 * SarakScrim — o backdrop de tela cheia que fecha um overlay (drawer, modal, painel) ao
 * clique fora. É `<button>` nativo, não `<div onClick>`: teclado (foco + Enter/Espaço) e
 * leitor de tela funcionam por construção, sem handler adicional (achado 17 / plan-19 —
 * o padrão se repetia pela base sem um átomo próprio).
 *
 * `animate` é opcional (plan-23): por padrão o scrim continua estático, pixel a pixel
 * igual ao que sempre foi (`SarakAppChromeMobile`, o único uso publicado hoje). Quem
 * precisa de fade (`Controls.tsx`, `SarakDrawer`) liga a prop.
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo do backdrop, para teclado e leitor de tela funcionarem por
 *   construção (a fronteira de R10 passou de PASTA para PAPEL — plan-20).
 */
declare const SarakScrim: React__default.FC<SarakScrimProps>;

type SarakDividerOrientation = 'horizontal' | 'vertical';
interface SarakDividerProps extends Omit<React__default.HTMLAttributes<HTMLDivElement>, 'children'> {
    /**
     * Direção do traço. Omitida, usa `horizontal`; no modo vertical, o contêiner acompanha a
     * altura disponível do pai.
     */
    orientation?: SarakDividerOrientation;
    /**
     * Texto exibido entre os traços e usado como nome acessível. Omitido, não há texto e o
     * separador é decorativo por padrão.
     */
    label?: string;
    /**
     * Oculta o componente da árvore acessível. Omitida, é decorativo quando `label` não existe
     * e semântico quando existe; use `false` sem rótulo apenas se também fornecer `aria-label`.
     */
    decorative?: boolean;
}
declare const SarakDivider: ({ orientation, label, decorative, className, style, "aria-label": ariaLabel, ...props }: SarakDividerProps) => React__default.ReactElement;

/** Item navegável da Command Palette (Spec 14, Regra 1). */
interface SarakNavigationItem {
    /** Identificador único. */
    id: string;
    /** Rótulo exibido e base da busca. */
    label: string;
    /** Termos extra para o filtro (além do label). */
    keywords?: string;
    /** Ícone opcional à esquerda. */
    icon?: React__default.ReactNode;
}
interface SarakSpotlightProps {
    /** Itens disponíveis para navegação instantânea. */
    items: SarakNavigationItem[];
    /** Atalho de ativação global (default: `mod+k` = Ctrl/Cmd+K). */
    shortcut?: string;
    /** Modo controlado: estado de abertura. */
    open?: boolean;
    /** Notifica mudanças de abertura (abrir via atalho / fechar via Esc). */
    onOpenChange?: (open: boolean) => void;
    /** Acionado ao confirmar um item (Enter ou clique). */
    onSelect: (item: SarakNavigationItem) => void;
    /** Placeholder do input central. */
    placeholder?: string;
}
/**
 * Command Palette global (Spec 14, Regra 1): modal por cima de tudo, acionável por
 * atalho, com input central + lista filtrada e navegação por teclado (setas + Enter).
 */
declare const SarakSpotlight: React__default.FC<SarakSpotlightProps>;

/** Passo de um fluxo orientado (Spec 14, Regra 2). */
interface SarakStepConfig {
    /** Rótulo do passo. */
    label: string;
    /** Descrição/legenda opcional. */
    description?: string;
}
type SarakStepperOrientation = 'horizontal' | 'vertical';
interface SarakStepperProps {
    /** Passos na ordem do fluxo. */
    steps: SarakStepConfig[];
    /** Índice (0-based) do passo atual. */
    current: number;
    /** Disposição (default: horizontal). */
    orientation?: SarakStepperOrientation;
    className?: string;
}
/**
 * Desenha passos + conectores indicando concluído/atual/futuro (Spec 14, Regra 2).
 * Em horizontal, a barra faz overflow-x com scroll em telas pequenas — nunca quebra
 * em duas linhas (Critério de Aceite).
 */
declare const SarakStepper: React__default.FC<SarakStepperProps>;

/** Migalha do caminho de navegação (Spec 14, Regra 3). */
interface SarakBreadcrumbItem {
    /** Rótulo exibido. */
    label: string;
    /** Destino opcional (acionado via `onNavigate`, não pela URL diretamente). */
    href?: string;
    /** Ícone opcional à esquerda do rótulo. */
    icon?: React__default.ReactNode;
}
interface SarakBreadcrumbsProps {
    /** Caminho do usuário, da raiz à folha. */
    items: SarakBreadcrumbItem[];
    /** Separador entre migalhas (default: `/`). */
    separator?: React__default.ReactNode;
    /** Delega a navegação ao host (Spec 33, Regra 3) — não manipula a URL. */
    onNavigate?: (href: string) => void;
    className?: string;
}
/** Trilha semântica com ícones e separador customizável (Spec 14, Regra 3). */
declare const SarakBreadcrumbs: React__default.FC<SarakBreadcrumbsProps>;

/** Token de paginação: número de página ou marcador de reticências. */
type SarakPaginationToken = number | 'ellipsis';
/**
 * Gera a lista de renderização numérica (Spec 14, Regra 4): início, miolo em torno
 * da página atual e final, inserindo `ellipsis` quando há corte. Função PURA —
 * testável isoladamente, sem DOM.
 */
declare const sarakBuildPaginationRange: (current: number, total: number, maxVisible?: number) => SarakPaginationToken[];
interface SarakPaginationProps {
    /** Página atual (1-based). */
    current: number;
    /** Total de páginas, quando o total de itens e o tamanho não derivam o valor. */
    total?: number;
    /** Quantidade de registros por página. */
    pageSize?: number;
    /** Opções de quantidade de registros por página. */
    pageSizeOptions?: number[];
    /** Quantidade total de registros para os resumos e o cálculo de páginas. */
    totalItems?: number;
    /** Disparado ao escolher outra quantidade de registros por página. */
    onPageSizeChange?: (pageSize: number) => void;
    /** Máximo de botões numéricos antes de compactar com reticências (default: 7). */
    maxVisible?: number;
    /** Disparado ao escolher uma página válida (diferente da atual). */
    onChange: (page: number) => void;
    className?: string;
}
/** Controles de página, resumo de resultados e opções de tamanho. */
declare const SarakPagination: (props: SarakPaginationProps) => React__default.ReactElement;

declare const sarakIsSafeLinkHref: (href: string) => boolean;

interface SarakLinkProps extends Omit<React__default.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel' | 'onClick'> {
    /** Destino do link. Esquemas perigosos (`javascript:`, `data:`, ...) são bloqueados. */
    href: string;
    /** Abre em nova aba com `rel="noopener noreferrer"` + indicação visual/a11y. */
    external?: boolean;
    /** Contexto de navegação nativo; fora de `_self`, o navegador mantém o comportamento. */
    target?: string;
    rel?: string;
    /** Intercepta apenas clique primário simples destinado à aba atual. */
    onNavigate?: (href: string) => void;
    onClick?: React__default.MouseEventHandler<HTMLAnchorElement>;
    children: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakLink
 * Âncora acessível por tokens: anel de foco real (`--sarak-focus-width`), `href`
 * validado por allow-list de esquema, e marcação de link externo (`target="_blank"`
 * + `rel="noopener noreferrer"` + ícone/texto para leitor de tela).
 */
declare const SarakLink: React__default.FC<SarakLinkProps>;

type SarakMenuItemOrientation = 'vertical' | 'horizontal';
interface SarakMenuItemProps extends Omit<React__default.HTMLAttributes<HTMLElement>, 'title' | 'onClick' | 'type'> {
    /** Nome registrado ou elemento renderizado à esquerda do rótulo. */
    icon?: string | React__default.ReactNode;
    /** Rótulo do item; trunca em vez de transbordar (orientação vertical). */
    label: React__default.ReactNode;
    /** Item corresponde à rota/seção corrente. */
    active?: boolean;
    /** Colapsado — mostra só o ícone, sem o rótulo (sidebar recolhida/topbar estreita). */
    collapsed?: boolean;
    /** `vertical` = linha de lista (sidebar/drawer); `horizontal` = aba (topbar). */
    orientation?: SarakMenuItemOrientation;
    /** Tooltip nativo; cai para o texto do rótulo quando `label` é string. */
    title?: string;
    /** Destino opcional; quando informado, o item é renderizado como link. */
    href?: string;
    /** Chamado apenas para clique primário simples em link destinado à aba atual. */
    onNavigate?: (href: string) => void;
    /** Indica uma quantidade ou estado adicional; também integra o nome acessível. */
    badge?: string | number;
    /** Contexto de navegação nativo do link. */
    target?: string;
    type?: React__default.ButtonHTMLAttributes<HTMLButtonElement>['type'];
    disabled?: boolean;
    onClick?: React__default.MouseEventHandler<HTMLElement>;
    className?: string;
    /** A barra inferior do celular ancora o indicador no topo do item. */
    markerPosition?: 'edge' | 'top';
}
/**
 * Componente Atômico: SarakMenuItem
 *
 * Item de navegação do cromo (sidebar/topbar/drawer) com métrica própria de LISTA —
 * recuo, peso, caixa e truncamento — em vez da métrica de botão de ação que
 * `SarakButton` carrega por padrão. `orientation="vertical"` resolve a
 * largura cheia NA ORIGEM (nunca emite `min-w-fit`), então o rótulo trunca em vez de
 * transbordar; `className` do chamador vence os defaults por `mergeSarakClasses` (R35).
 *
 * @sarak-encapsula button — encapsula a ação sem destino com o elemento nativo;
 *   links usam âncoras para preservar a navegação do navegador.
 */
declare const SarakMenuItem: React__default.FC<SarakMenuItemProps>;

interface SarakShellSearchWidgetProps {
    variant?: 'bar' | 'icon';
    items?: SarakSearchItem[];
    onClick: () => void;
    onSelect?: (item: SarakSearchItem) => void;
}
declare const SarakShellSearchWidget: (props: SarakShellSearchWidgetProps) => React__default.ReactElement;

interface SarakShellThemeToggleProps {
    /** Define o formato horizontal, vertical ou compacto; omitida, usa `horizontal`. O clique grava a preferência do usuário. */
    variant?: 'horizontal' | 'vertical' | 'mini';
}
declare const SarakShellThemeToggle: React__default.FC<SarakShellThemeToggleProps>;

interface SarakShellLanguageSelectorProps {
    /** Posiciona o seletor na barra ou na lateral; omitida, usa `horizontal`. Com zero ou um idioma habilitado, nada é renderizado. */
    variant?: 'horizontal' | 'vertical';
}
/**
 * ShellLanguageSelector — lista os idiomas do SISTEMA (`options.i18n.languages`) ou, sem
 * eles, os que o TEMA habilita (`design.enabledLanguages`). A escolha vai por `setLanguage`:
 * avisa `onLanguageChange` e, sem idioma controlado, grava a PREFERÊNCIA do usuário, nunca o
 * tema (specs/09 §4.7). Um
 * idioma só, ou nenhum, não monta — não há escolha possível
 * (ADR-014: "só monta quando tem com o que funcionar").
 */
declare const SarakShellLanguageSelector: React__default.FC<SarakShellLanguageSelectorProps>;

interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    prefixText?: React__default.ReactNode;
    suffixText?: React__default.ReactNode;
    icon?: React__default.ReactNode;
    leftIcon?: React__default.ReactNode;
    rightIcon?: React__default.ReactNode;
    error?: string;
    fullWidth?: boolean;
}
/**
 * @sarak-encapsula input — o átomo encapsula o campo nativo para teclado, leitor de tela e estilo.
 */
declare const SarakInput: (props: SarakInputProps) => React__default.ReactElement;

interface SarakMaskedInputProps extends Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'> {
    /**
     * Padrão com `0` nas posições numéricas ou preset `cpf`, `cnpj` e `phone`.
     * É obrigatório; `phone` alterna entre telefone fixo e celular pelo total de dígitos,
     * e `cnpj` aceita letras e números nas doze primeiras posições.
     */
    mask: string;
    /** Valor limpo controlado. Omitido, usa `defaultValue`; ao fornecê-lo, o pai deve atualizá-lo após `onChange`. */
    value?: string;
    /** Valor inicial sem pontuação. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. */
    defaultValue?: string;
    /** Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. */
    label?: string;
    /** Emite os caracteres aceitos pelo padrão. Omitido, mudanças não são notificadas por callback. */
    onChange?: (cleanValue: string) => void;
    /** Confere CPF/CNPJ no blur e anuncia o dígito verificador inválido. Omitida, não valida. */
    validate?: boolean;
    /** Teclado sugerido ao dispositivo. CNPJ usa texto por padrão; os demais usam numérico. */
    inputMode?: React__default.HTMLAttributes<HTMLInputElement>['inputMode'];
}
declare const SarakMaskedInput: (props: SarakMaskedInputProps) => React__default.ReactElement;

type SarakDocumentKind = 'cpf' | 'cnpj' | 'cep' | 'auto';
declare const sarakIsValidCpf: (value: string) => boolean;
declare const sarakIsValidCnpj: (value: string) => boolean;
declare const sarakFormatDocument: (value: string, kind?: SarakDocumentKind) => string;

interface SarakCurrencyInputProps extends Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'> {
    /** Valor numérico controlado; `null` representa campo vazio. Omitido, usa `defaultValue`; o pai deve atualizar após `onChange`. */
    value?: number | null;
    /** Valor numérico inicial. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. */
    defaultValue?: number | null;
    /** Moeda ISO 4217 de `Intl.NumberFormat`. Omitida, usa BRL; o estilo monetário aparece ao sair do campo; código inválido gera `RangeError`. */
    currency?: string;
    /** Locale dos separadores durante a edição e da formatação ao sair do campo. Omitida, acompanha o idioma do Provider; sem Provider, usa `pt-BR`. Textos colados devem segui-la. */
    locale?: string;
    /** Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. */
    label?: string;
    /** Emite número ou `null` para o campo vazio, nunca o texto formatado. Omitido, mudanças não são notificadas. */
    onChange?: (cleanValue: number | null) => void;
    /** Teclado sugerido ao dispositivo. Omitido, solicita teclado decimal na locale atual. */
    inputMode?: React__default.HTMLAttributes<HTMLInputElement>['inputMode'];
}
declare const SarakCurrencyInput: ({ value, defaultValue, currency, locale, label, onChange, inputMode, ...inputProps }: SarakCurrencyInputProps) => React__default.ReactElement;

interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /**
     * Rótulo visual ligado ao campo pelo `id` (gerado quando não é informado).
     * Sem ele, não há rótulo visível; forneça outro nome acessível se necessário.
     */
    label: string;
    /** Mantém o rótulo acessível sem ocupar espaço visual. */
    hideLabel?: boolean;
    /** Opções declarativas; quando informado, substitui `children`. */
    options?: Array<{
        label: string;
        value: string;
        disabled?: boolean;
    }>;
    /**
     * Mensagem exibida abaixo da lista, ligada ao `<select>` por `aria-describedby`
     * (pelo `SarakFieldError`), que também marca `aria-invalid`. Sem a prop, não há
     * mensagem nem estado inválido.
     */
    error?: string;
    /**
     * Faz o contêiner e a lista ocuparem toda a largura disponível. Omitida ou
     * `false`, a largura depende do layout pai.
     */
    fullWidth?: boolean;
}
/**
 * Componente Atômico: SarakSelect
 *
 * @sarak-encapsula select — a razão de existir deste componente é dar forma Sarak
 *   ao `<select>` nativo (seta customizada, tokens de cor); remova o `<select>` e
 *   não sobra função nenhuma, só a seta decorativa.
 */
declare const SarakSelect: (props: SarakSelectProps) => React__default.ReactElement;

interface SarakTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Rótulo visual ligado à área de texto pelo `id` (gerado quando não é informado). */
    label?: string;
    /**
     * Mensagem exibida abaixo da área de texto, ligada ao `<textarea>` por
     * `aria-describedby` (pelo `SarakFieldError`), que também marca `aria-invalid`.
     * Sem a prop, não há mensagem nem estado inválido.
     */
    error?: string;
    /**
     * Faz o contêiner e a área de texto ocuparem toda a largura disponível.
     * Omitida ou `false`, a largura depende do layout pai.
     */
    fullWidth?: boolean;
}
/**
 * Componente Atômico: SarakTextarea
 */
declare const SarakTextarea: React__default.FC<SarakTextareaProps>;

interface SarakSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /**
     * Texto mostrado acima do controle e usado como nome acessível quando
     * `aria-label` não é informado. Sem `label`, forneça `aria-label`.
     */
    label?: string;
    /**
     * Texto apresentado ao lado do rótulo e exposto como `aria-valuetext`; não
     * altera o valor numérico. Sem a prop, o navegador anuncia o valor nativo.
     */
    valueLabel?: string | number;
}
/**
 * Componente Atômico: SarakSlider
 * Substitui o `<input type="range">`.
 *
 * @sarak-encapsula input — dá trilho e thumb com tokens Sarak ao `<input
 *   type=range>` nativo; é o próprio input estilizado, não uma peça de algo maior.
 */
declare const SarakSlider: React__default.FC<SarakSliderProps>;

interface SarakSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /**
     * Conteúdo visível ao lado do controle e clicável como parte do rótulo.
     * Sem `label` e `description`, nenhum texto é mostrado; nesse caso, dê um
     * nome acessível ao controle.
     */
    label?: React__default.ReactNode;
    /**
     * Texto auxiliar exibido junto ao rótulo e ligado ao controle por
     * `aria-describedby`. Sem a prop, não há descrição adicional.
     */
    description?: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakSwitch
 *
 * @sarak-encapsula input — o `<input type=checkbox role=switch>` é o controle
 *   real (foco, teclado, leitor de tela); trilho e thumb são só a pele visual
 *   sobreposta. Sem o input não há switch, só dois `<div>` decorativos.
 */
declare const SarakSwitch: React__default.FC<SarakSwitchProps>;

interface SarakCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React__default.ReactNode;
    description?: React__default.ReactNode;
    indeterminate?: boolean;
}
/**
 * Componente Atômico: SarakCheckbox
 *
 * @sarak-encapsula input — o `<input type=checkbox>` é o controle real
 *   (foco, teclado, leitor de tela); caixa visual é só a pele sobreposta.
 *   Suporta estado indeterminado nativo.
 *
 * Contrato de valor (o do React): quem passa `checked` GOVERNA — pele, `aria-checked` e
 * `<input>` seguem esse valor e o componente não guarda estado próprio. Sem `checked`, o
 * componente guarda o valor, semeado por `defaultChecked`. O `onChange` de quem chama é
 * sempre chamado, nos dois modos.
 */
declare const SarakCheckbox: React__default.FC<SarakCheckboxProps>;

interface SarakRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React__default.ReactNode;
    description?: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakRadio
 *
 * @sarak-encapsula input — o `<input type=radio>` é o controle real
 *   (foco, teclado, leitor de tela, agrupamento por name); círculo visual
 *   é só a pele sobreposta. Agrupamento é feito via atributo `name` nativo.
 *
 * Contrato de valor (o do React): quem passa `checked` GOVERNA — pele e `<input>` seguem
 * esse valor e o componente não guarda estado próprio. Sem `checked`, o componente guarda
 * o valor, semeado por `defaultChecked`. O `onChange` de quem chama é sempre chamado, nos
 * dois modos.
 */
declare const SarakRadio: React__default.FC<SarakRadioProps>;

interface SarakAutocompleteOption {
    value: string;
    label: string;
    description?: string;
}
interface SarakAutocompleteProps extends Omit<SarakInputProps, 'defaultValue' | 'onChange' | 'value'> {
    /**
     * Opções locais filtradas pelo rótulo. Omitida, a lista começa vazia; com
     * `searchOptions`, os resultados remotos substituem esta lista.
     */
    options?: SarakAutocompleteOption[];
    /**
     * Busca fornecida pelo host para listas remotas; a biblioteca não acessa a
     * rede diretamente. Omitida, a propriedade options é filtrada localmente.
     *
     * Recriar a função mantendo-a definida não reinicia a busca nem chama o
     * host de novo. A próxima busca usa a função mais recente; uma chamada já
     * iniciada continua com a função que a iniciou.
     */
    searchOptions?: (query: string) => Promise<SarakAutocompleteOption[]>;
    /**
     * Intervalo antes da busca remota, em milissegundos. Omitido, aguarda
     * 300 ms; valores negativos são tratados como zero.
     */
    debounceMs?: number;
    /**
     * Texto digitado no modo controlado. Omitido, o componente guarda a busca
     * internamente; quem controla deve atualizá-lo após a seleção.
     */
    value?: string;
    /**
     * Texto inicial no modo não controlado. Omitido, o campo começa vazio.
     */
    defaultValue?: string;
    /**
     * Recebe o evento nativo ao digitar. Omitida, não há notificação de
     * digitação; selecionar uma opção é informado por `onOptionSelect`.
     */
    onChange?: React__default.ChangeEventHandler<HTMLInputElement>;
    /**
     * Texto de dica do campo. Omitido, usa o padrão traduzido da biblioteca.
     */
    placeholder?: string;
    /**
     * Recebe a opção escolhida por clique ou teclado. Omitida, a opção ainda
     * preenche o texto do campo não controlado, sem emitir seleção externa.
     */
    onOptionSelect?: (option: SarakAutocompleteOption) => void;
    /** Opção selecionada em modo controlado; seu `value` é o identificador salvo pelo consumidor. */
    selection?: SarakAutocompleteOption | null;
    /** Informa a seleção nova ou `null` quando a busca deixa de representar a opção atual. */
    onSelectionChange?: (option: SarakAutocompleteOption | null) => void;
    /** Cria um item com a busca atual quando nenhuma opção tem o mesmo rótulo. */
    onCreate?: (query: string) => void;
    /** Rótulo da ação de criação; omitido, usa o texto traduzido da biblioteca. */
    createLabel?: (query: string) => string;
}
declare const SarakAutocomplete: (props: SarakAutocompleteProps) => React__default.ReactElement;

/**
 * SarakAssigneePicker — escolhe o responsável entre uma lista de pessoas: mostra o escolhido
 * (avatar + nome) e busca outro pelo nome, por mouse ou teclado (a navegação é a do
 * `SarakAutocomplete`). Controlado: quem chama guarda o `value`. Texto pelo catálogo;
 * ícone pela porta de ícones.
 */
interface SarakAssigneePerson {
    id: string;
    name: string;
    avatarUrl?: string;
}
interface SarakAssigneePickerProps {
    /** Pessoas que podem ser escolhidas. Vazio mostra o estado vazio traduzido, sem campo de busca. */
    people: SarakAssigneePerson[];
    /** Id da pessoa escolhida; `null`/omitido = sem responsável. Id que não está em `people` não mostra ninguém. */
    value?: string | null;
    /** Disparado com o id da pessoa escolhida, ou `null` ao remover o responsável. */
    onChange: (id: string | null) => void;
    /** Mostra o botão de remover o responsável escolhido. Omitido, só dá para trocar de pessoa. */
    clearable?: boolean;
    /** Rótulo do campo. Omitido, usa o texto traduzido "Responsável". */
    label?: string;
    /** Trava a busca (somente leitura, anunciada como desabilitada) e desabilita o botão de remover. */
    disabled?: boolean;
    className?: string;
}
declare function SarakAssigneePicker({ people, value, onChange, clearable, label, disabled, className }: SarakAssigneePickerProps): react_jsx_runtime.JSX.Element;

/** Par ordenado [início, fim] de um intervalo contínuo. */
type SarakRangeValue = [number, number];
interface SarakRangeSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    /** Controlado: par [início, fim]. */
    value?: SarakRangeValue;
    /** Não-controlado: valor inicial. */
    defaultValue?: SarakRangeValue;
    disabled?: boolean;
    error?: string;
    /** Esconde as tooltips de valor sobre os thumbs. */
    hideTooltips?: boolean;
    /** Recebe o novo par já clampado/ordenado (Spec 32: `onChange(value)`). */
    onChange?: (value: SarakRangeValue) => void;
}
/**
 * Componente Atômico: SarakRangeSlider (Spec 11, Regra 5)
 * Slider duplo (início/fim) para intervalos contínuos, com tooltips de valor.
 * Dois `<input type="range">` sobrepostos preservam a navegação por teclado nativa;
 * o trilho colorido entre os thumbs reflete os tokens do Design Engine.
 *
 * @sarak-encapsula input — o `RangeThumb` interno é um `<input type=range>`
 *   transparente; dois deles sobrepostos formam o padrão de slider duplo. São o
 *   próprio controle de início/fim, não decoração de algo maior.
 */
declare const SarakRangeSlider: React__default.FC<SarakRangeSliderProps>;

interface SarakMultiSelectOption {
    value: string;
    label: string;
}
interface SarakMultiSelectProps {
    label?: string;
    options: SarakMultiSelectOption[];
    /** Controlado: lista de values selecionados. */
    value?: string[];
    /** Não-controlado: seleção inicial. */
    defaultValue?: string[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite a nova lista de values (Spec 32: `onChange(value)`). */
    onChange?: (value: string[]) => void;
}
/**
 * Componente Atômico: SarakMultiSelect (Spec 11, Regra 2)
 * Combobox com autocomplete: busca digitada, seleção múltipla e chips deletáveis.
 * O input de busca e os chips coexistem no mesmo campo — digitar NÃO desmonta os
 * chips nem perde o foco (Plano de Testes §4).
 */
declare const SarakMultiSelect: React__default.FC<SarakMultiSelectProps>;

/**
 * Tipos estruturais do react-dropzone declarados localmente — os tipos nomeados
 * (`Accept`/`FileRejection`) não resolvem sob `moduleResolution: node`. O formato
 * espelha o contrato real da lib: `accept` = MIME → extensões; `FileRejection` =
 * arquivo + motivos. São aceitos pela assinatura de opções do `useDropzone`.
 */
type SarakAccept = Record<string, string[]>;
interface SarakFileRejection {
    file: File;
    errors: Array<{
        code: string;
        message: string;
    }>;
}
interface SarakUploaderProps {
    label?: string;
    /** Tipos aceitos no formato do react-dropzone (ex.: `{ 'image/*': [] }`). */
    accept?: SarakAccept;
    /** Tamanho máximo por arquivo, em bytes. */
    maxSize?: number;
    multiple?: boolean;
    disabled?: boolean;
    /** Texto-dica abaixo do título da área. */
    hint?: string;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Recebe os arquivos aceitos (Spec 32: `onChange(value)`). */
    onChange?: (files: File[]) => void;
    /** Recebe as rejeições (ex.: arquivo maior que `maxSize`). */
    onReject?: (rejections: SarakFileRejection[]) => void;
}
/**
 * Componente Atômico: SarakUploader (Spec 11, Regra 3)
 * Área drag-and-drop acessível sobre `react-dropzone` (peerDependency). Os estados
 * (ocioso, arrastando, rejeitado, erro de tamanho) mudam a borda para os tokens de
 * cor semânticos — `--sx-color-primary` ao arrastar, `--sx-color-danger` ao rejeitar.
 */
declare const SarakUploader: React__default.FC<SarakUploaderProps>;

type SarakWeekStart = 0 | 1;

/**
 * Locale do `date-fns` passado adiante para `format`. Tipado de forma estrutural
 * (objeto opaco) porque o tipo nomeado `Locale` não resolve sob
 * `moduleResolution: node` — os locales reais (`ptBR`, etc.) são objetos atribuíveis.
 */
type SarakDateLocale = object;

type SarakDatePickerValue = string | [string, string];
type SarakDatePresetId = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';
interface SarakDatePreset {
    label: string;
    value: SarakDatePickerValue | (() => SarakDatePickerValue);
}

interface SarakDatePickerProps {
    label?: string;
    mode?: 'single' | 'range';
    value?: SarakDatePickerValue;
    /** Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. */
    displayFormat?: string;
    /** Locale do `date-fns` para nomes de mês/dia; omitido, segue o idioma escolhido (`useSarakLanguage`). */
    locale?: SarakDateLocale;
    weekStartsOn?: SarakWeekStart;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). */
    onChange?: (value: SarakDatePickerValue) => void;
    min?: string;
    max?: string;
    isDateDisabled?: (iso: string) => boolean;
    presets?: Array<SarakDatePresetId | SarakDatePreset>;
    allowTyping?: boolean;
    clearable?: boolean;
}
/**
 * Componente Atômico: SarakDatePicker (Spec 11, Regra 1)
 * Calendário popover in-house sobre `date-fns`. Suporta seleção única e de intervalo
 * na mesma interface, formatos i18n configuráveis e navegação por teclado (setas).
 */
declare const SarakDatePicker: (props: SarakDatePickerProps) => React__default.ReactElement;

interface SarakTimePickerProps {
    label?: string;
    /** Valor no formato 24h `HH:mm`. */
    value?: string;
    /** Passo dos minutos (ex.: 5, 15). */
    minuteStep?: number;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite o novo horário `HH:mm` (Spec 32: `onChange(value)`). */
    onChange?: (value: string) => void;
}
/**
 * Componente Atômico: SarakTimePicker (Spec 11, Regra 1 — par temporal)
 * Seleção de horário 24h via dois campos (hora/minuto), com passo de minutos
 * configurável. Emite `HH:mm`; teclado nativo dos `<select>` cobre a navegação.
 *
 * @sarak-encapsula select — os dois `<select>` (hora/minuto) SÃO o controle de
 *   horário, não decoram nada: juntos formam o par temporal completo. Sem eles
 *   não há como escolher hora nenhuma.
 */
declare const SarakTimePicker: React__default.FC<SarakTimePickerProps>;

/**
 * SarakRichText — editor WYSIWYG blindado (Spec 11, Regra 4 · Onda 10)
 *
 * Editor in-house sobre `contentEditable` — **zero dependência nova**. Toda saída (digitação
 * E colagem) passa pelo canal único de sanitização (`sanitizeHtml`, Spec 40), com allowlist
 * RESTRITA: marcações semânticas (negrito, itálico, listas, links, títulos), **nunca** tags
 * `<style>`/`<script>`, handlers `on*` ou `javascript:` (Critério de Aceite). Sem estilos
 * locais que rompam o escopo CSS. Integra ao formulário via `value` + `onChange(htmlLimpo)`,
 * consumido pelo `model`/`coerceEventValue` do LeafNode (Spec 32).
 */

/** Sanitiza o HTML do editor pela allowlist restrita. Exportado para teste isolado. */
declare const sarakSanitizeRichText: (html: string) => string;
interface SarakRichTextProps {
    /** Conteúdo HTML controlado pelo consumidor (par com `onChange`). */
    value?: string;
    /** Conteúdo inicial não-controlado. */
    defaultValue?: string;
    /** Emite o HTML JÁ sanitizado a cada mudança. */
    onChange?: (html: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}
declare const SarakRichText: React__default.FC<SarakRichTextProps>;

interface SarakFilterSelectOption {
    label: string;
    value: string;
}
interface SarakFilterSelectProps {
    /** Identifica a coluna cujo valor será lido de `filters` e enviado ao callback; obrigatória. */
    col: string;
    /** Texto da opção inicial (valor vazio); omitido, sai do catálogo da lib no idioma escolhido (`Todos`, `All`…). */
    placeholder?: string;
    /** Nome acessível do seletor; omitido, a biblioteca usa um rótulo genérico oculto. */
    label?: string;
    /** Estado atual dos filtros; a opção selecionada vem de `filters[col]` e fica vazia quando a chave não existe. */
    filters: Record<string, string>;
    /** Recebe a coluna e o novo valor a cada seleção; obrigatória para propagar mudanças ao consumidor. */
    onChange: (col: string, value: string) => void;
    /** Valores disponíveis além da opção inicial: textos simples ou pares `{ label, value }`; obrigatória, mesmo vazia. */
    options: string[] | SarakFilterSelectOption[];
}
declare const SarakFilterSelect: ({ col, placeholder, label, filters, onChange, options }: SarakFilterSelectProps) => React__default.ReactElement;

declare const SarakHelpButton: ({ text }: {
    text: string;
}) => react_jsx_runtime.JSX.Element;

/**
 * Valor, texto, ordem, busca e agregação de uma coluna — lógica pura compartilhada pelas duas
 * tabelas públicas (`SarakDataTable` e `SarakTable`), para as APIs de coluna não divergirem.
 */

type SarakAggregate<T> = 'sum' | 'avg' | 'count' | 'min' | 'max' | ((values: unknown[], rows: T[]) => unknown);
interface SarakColumnFooterContext<T> {
    value: unknown;
    rows: T[];
}
/** O bloco de valor que `SarakColumn<T>` (DataTable) e `SarakTableColumn<T>` (Table) compartilham. */
interface SarakColumnValueOptions<T> {
    /** Lê o valor da linha; ausente = `row[id]` (DataTable) / `row[key]` (Table). */
    accessor?: (row: T) => unknown;
    /** Formato do valor; numérico com formato alinha à direita e usa `tabular-nums`. */
    format?: SarakValueFormat;
    /** Exibe o controle de ordenação. DataTable: `false`; Table: `true`. */
    sortable?: boolean;
    /** Valor usado na ordem; ausente = o valor de `accessor` (bruto, não o texto formatado). */
    sortValue?: (row: T) => unknown;
    /** Texto usado na busca; ausente = o texto exibido (com `format`). */
    searchValue?: (row: T) => string;
    /** Agregação do rodapé (e do subtotal de grupo). */
    aggregate?: SarakAggregate<T>;
    /** Conteúdo do rodapé; ausente com `aggregate` = o agregado formatado. */
    footer?: ReactNode | ((ctx: SarakColumnFooterContext<T>) => ReactNode);
    /** `true` → `th scope="row"` (Table) / `role="rowheader"` (DataTable). */
    rowHeader?: boolean;
    /** Quantas colunas a célula cobre naquela linha; as cobertas não são renderizadas. */
    colSpan?: (row: T) => number | undefined;
}
type SarakColumnLike<T> = SarakColumnValueOptions<T> & ({
    id: string;
} | {
    key: string;
});
/** Agrega a coluna sobre as linhas — o mesmo cálculo do rodapé, reaproveitável fora da tabela. */
declare function sarakAggregate<T>(rows: T[], column: SarakColumnLike<T>): unknown;

/**
 * Modelo de colunas do SarakDataTable (Spec 12, Regra 2 · Onda 9).
 *
 * Lógica pura (sem React/DOM) de ordenação, largura e deslocamento das colunas
 * congeladas (pinned). Mantém o componente visual enxuto e testável de forma isolada.
 */

type SarakColumnAlignment = 'left' | 'center' | 'right';
interface SarakColumn<T> extends SarakColumnValueOptions<T> {
    /** Identidade estável da coluna (chave de largura/ordem/reorder). */
    id: string;
    /** Conteúdo do cabeçalho. */
    header: React__default.ReactNode;
    /** Largura inicial em px (default: `DEFAULT_COLUMN_WIDTH`). */
    width?: number;
    /** Largura mínima ao redimensionar em px (default: `MIN_COLUMN_WIDTH`). */
    minWidth?: number;
    /** Congelamento lateral; ausente = coluna rola normalmente. */
    pinned?: 'left' | 'right';
    /** Alinhamento horizontal do cabeçalho e das células. */
    align?: SarakColumnAlignment;
    /** Render da célula; ausente = `String(row[id])`. */
    render?: (row: T, rowIndex: number) => React__default.ReactNode;
}
interface SarakTableSort {
    columnId: string;
    direction: 'asc' | 'desc';
}
declare const SARAK_DEFAULT_COLUMN_WIDTH = 160;
declare const SARAK_MIN_COLUMN_WIDTH = 60;
/** Resolve a largura efetiva da coluna a partir do estado controlado + default. */
declare const sarakWidthOf: <T>(column: SarakColumn<T>, widths: Record<string, number>) => number;
/** Reordena `order` movendo `fromId` para a posição de `toId` (imutável). */
declare const sarakReorder: (order: string[], fromId: string, toId: string) => string[];
interface SarakPinnedOffsets {
    /** Deslocamento `left` acumulado por id de coluna congelada à esquerda. */
    left: Record<string, number>;
    /** Deslocamento `right` acumulado por id de coluna congelada à direita. */
    right: Record<string, number>;
    /** Soma das larguras de todas as colunas ordenadas. */
    total: number;
}
/**
 * Calcula os deslocamentos sticky das colunas congeladas na ordem atual:
 * left-pinned acumulam da esquerda; right-pinned acumulam da direita (ré).
 */
declare const sarakComputeOffsets: <T>(ordered: Array<SarakColumn<T>>, widths: Record<string, number>) => SarakPinnedOffsets;

/**
 * Achata grupos, subtotais, linhas expandidas e árvore em UMA lista de linhas visuais, para a
 * virtualização continuar valendo (uma linha visual = uma entrada). Lógica pura, sem React.
 */

interface SarakTableGroupBy<T> {
    /** Campo da linha, ou função que devolve a chave do grupo. */
    key: string | ((row: T) => string);
    label?: (key: string, rows: T[]) => ReactNode;
    /** Padrão `true`. */
    subtotals?: boolean;
    /** Padrão `true`. */
    defaultExpanded?: boolean;
}

interface SarakTableColumn<TData> extends SarakColumnValueOptions<TData> {
    key: string;
    label: string;
    render?: (row: TData) => ReactNode;
    align?: 'left' | 'center' | 'right';
}
interface SarakTableProps$1<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre `load`. */
    data?: TData[];
    /** Carrega as linhas pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    label?: string;
    mapping?: Record<string, string>;
    /** Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. */
    getRowKey?: (row: TData, index: number) => Key;
    /** Omitido, ordena localmente; passe null para controlar o estado sem ordenação. */
    sort?: SarakTableSort | null;
    /** Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. */
    onSortChange?: (sort: SarakTableSort | null) => void;
    /** Habilita a seleção de linhas e a caixa das linhas visíveis. */
    selectable?: boolean;
    /** Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. */
    selectedKeys?: Key[];
    /** Recebe as chaves selecionadas atualizadas. */
    onSelectionChange?: (selectedKeys: Key[]) => void;
    /** Colunas semânticas compartilhadas pela tabela desktop e pelos cartões mobile. */
    columns?: SarakTableColumn<TData>[];
    /** Recebe a linha acionada tanto na tabela quanto no cartão mobile. */
    onRowClick?: (row: TData) => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    /**
     * No smartphone colapsa para cards empilhados. Default `true` — mesma prop, mesmo
     * default e mesmo efeito do irmão `SarakDataTable`, para que os dois componentes
     * públicos de tabela não tenham APIs divergentes.
     */
    responsive?: boolean;
    /** Exibe o campo de busca; omitido, fica visível. */
    showSearch?: boolean;
    /** Exibe o botão de atualização quando `load` existe; omitido, segue a presença de `load`. */
    showRefresh?: boolean;
    /** Agrupa as linhas, com cabeçalho de grupo expansível e subtotal. */
    groupBy?: SarakTableGroupBy<TData>;
    /** Conteúdo da linha expandida; com ele, cada linha ganha o botão de expandir. */
    renderExpanded?: (row: TData) => ReactNode;
    /** Chaves das linhas expandidas (controlado); omitido, a tabela gerencia. */
    expandedKeys?: Key[];
    onExpandedChange?: (keys: Key[]) => void;
    /** Texto da busca (controlado); omitido, a tabela guarda o texto do campo. */
    searchQuery?: string;
    onSearchQueryChange?: (query: string) => void;
    /** Total no servidor; maior que as linhas visíveis, oferece "Selecionar todos os N". */
    totalCount?: number;
    /** Com `true`, `selectedKeys` passa a ser a lista de EXCEÇÕES. */
    selectAll?: boolean;
    onSelectAllChange?: (all: boolean) => void;
    /** Mostra o botão de exportar CSV na barra; `{ filename }` troca o nome do arquivo. */
    exportable?: boolean | {
        filename?: string;
    };
}

interface SarakTableProps<TData extends Record<string, unknown> = Record<string, unknown>> extends SarakTableProps$1<TData> {
    onRetry?: () => void;
    updatedAt?: Date | string | number;
    emptyMessage?: string;
    loading?: boolean;
    error?: string | null;
}
declare const SarakTable: <TData extends Record<string, unknown> = Record<string, unknown>>(props: SarakTableProps<TData>) => ReactElement;

interface SarakFilterConfig {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: {
        label: string;
        value: string;
    }[];
    dynamic?: boolean;
}
interface SarakCardGridProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre `load`. */
    data?: TData[];
    /** Carrega os registros pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    /** Horário do dado entregue diretamente pelo host. */
    updatedAt?: Date | string | number;
    /** Callback opcional para tentar novamente após uma falha. */
    onRetry?: () => void;
    label?: string;
    /**
     * Mapa de dados do card. Cada valor é o CAMINHO de um campo do item, exceto os
     * marcados como *literal* (texto/nome fixo escrito pelo próprio autor).
     *
     * Genérico por contrato (Spec 42): a Sarak não conhece domínio nenhum — nenhuma
     * aritmética, unidade ou moeda é calculada aqui. O consumidor entrega valores
     * prontos em `details`.
     */
    mapping?: {
        title: string;
        subtitle?: string;
        description?: string;
        badge?: string;
        tags?: string;
        /** *literal*: nome do ícone (contrato de nomes em `docs/component-catalog.md`). */
        icon?: string;
        color?: string;
        /** Caminho para `Array<{ label, value }>` JÁ FORMATADO pelo consumidor — painel de detalhes. */
        details?: string;
        /** Caminho para `string[]` — chips da fileira primária. */
        input_caps?: string;
        /** Caminho para `string[]` — chips da fileira secundária. */
        output_caps?: string;
        /** *literal*: cabeçalho da fileira `input_caps` (ausente = fileira sem cabeçalho). */
        input_caps_label?: string;
        /** *literal*: cabeçalho da fileira `output_caps` (ausente = fileira sem cabeçalho). */
        output_caps_label?: string;
        /** *literal*: cabeçalho do bloco de descrição no painel expansível. */
        description_label?: string;
        /** *literal*: texto do botão que abre o painel expansível (default `"Ver mais"`). */
        expand_label?: string;
        /** *literal*: texto do mesmo botão com o painel aberto (default `"Fechar"`). */
        collapse_label?: string;
    };
    filters?: SarakFilterConfig[];
    variant?: 'classic' | 'title' | 'action' | 'search';
}
/**
 * SarakCardGrid Core (v6.4)
 *
 * Renderiza um grid de cartões de alta fidelidade com suporte a metadados
 * técnicos complexos e FILTROS DINÂMICOS declarados via manifesto.
 */
declare const SarakCardGrid: <TData extends Record<string, unknown> = Record<string, unknown>>({ data, load, updatedAt, onRetry, label, mapping, filters, variant }: SarakCardGridProps<TData>) => ReactElement;

interface SarakStatsMetricConfig {
    icon?: ReactNode;
    delta?: number;
    format?: SarakValueFormat;
    label?: string;
    hint?: string;
    /** Pinta o valor pelo sinal: verde positivo, vermelho negativo (padrão: `true`). */
    signColor?: boolean;
    /** Sentido bom da variação; `'down'` inverte a cor (despesa, atraso), a seta segue o sentido real (padrão: `'up'`). */
    goodDirection?: 'up' | 'down';
    /** Formato do delta; `{ type: 'percent' }` mostra a variação percentual (0,12 → 12%). */
    deltaFormat?: SarakValueFormat;
    /** Texto depois do delta, como "vs. mês anterior". */
    deltaLabel?: string;
    /** Meta numérica: mostra a barra de progresso até ela e "Meta: …" no `format` da métrica. */
    target?: number;
    /** Troca a palavra "Meta" do texto da meta. */
    targetLabel?: string;
    /** Série curta desenhada sob o valor. */
    sparkline?: number[];
}
interface SarakStatsProps<TData extends Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData;
    /** Carrega as métricas pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData>;
    /** Horário do dado entregue diretamente pelo host. */
    updatedAt?: Date | string | number;
    /** Callback opcional para tentar novamente após uma falha. */
    onRetry?: () => void;
    /** Título opcional fornecido pelo host. */
    label?: string;
    /** Define os rótulos exibidos; omitido, usa as chaves do dado recebido. */
    mapping?: Record<string, string>;
    /** Configuração visual e de formato por chave de métrica. */
    metrics?: Partial<Record<keyof TData & string, SarakStatsMetricConfig>>;
}
declare const SarakStats: <TData extends Record<string, unknown> = Record<string, unknown>>({ data, load, updatedAt, onRetry, label, mapping, metrics, }: SarakStatsProps<TData>) => ReactElement;

interface SarakFormProps<TData extends Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData;
    /** Carrega o formulário pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData>;
    /** Rótulo opcional fornecido pelo host. */
    label?: string;
    /** Define as chaves e os rótulos dos campos. */
    mapping?: Record<string, string>;
    /** Seleciona o modo de preenchimento; create não carrega dado. */
    mode?: 'create' | 'edit';
    /** Valor inicial usado no modo create ou até load concluir. */
    initialData?: TData;
    /** Envia os valores ao host; sem callback, o botão de envio não é exibido. */
    onSubmit?: (data: TData) => void | Promise<void>;
    /** Chamado após um envio bem-sucedido. */
    onSuccess?: () => void | Promise<void>;
}
/** Gera um formulário simples por `mapping`; fluxos CRUD devem compor `SarakFormSection` e os campos. */
declare const SarakForm: <TData extends Record<string, unknown> = Record<string, unknown>>({ data, load, label, mapping, mode, initialData, onSubmit, onSuccess, }: SarakFormProps<TData>) => react_jsx_runtime.JSX.Element;

interface SarakFormSectionProps {
    title: React__default.ReactNode;
    description?: React__default.ReactNode;
    columns?: number | SarakResponsiveValue<number>;
    disabled?: boolean;
    children: React__default.ReactNode;
    className?: string;
}
declare const SarakFormSection: ({ title, description, columns, disabled, children, className, }: SarakFormSectionProps) => React__default.ReactElement;

interface SarakManagementAction {
    label: string;
    action: string;
    icon?: 'plus' | 'settings';
    /** Opens the host-submitted creation form when onCreate is provided. */
    opensCreateForm?: boolean;
}
interface SarakManagementGridProps<TItem extends Record<string, unknown>> {
    /** Records already loaded by the host; takes precedence over load. */
    data?: TItem[];
    /** Loads records through the host's chosen transport. */
    load?: () => Promise<TItem[]>;
    /** Path to the grouping value; supports nested fields. */
    groupBy: string;
    /** Empty groups to display alongside groups found in the records. */
    ghostGroups?: string[];
    /** Maps record paths to fields displayed by each item card. */
    mapping: {
        id: string;
        title: string;
        status?: string;
        isActive?: string;
        description?: string;
        error?: string;
    };
    label?: string;
    description?: string;
    headerActions?: SarakManagementAction[];
    groupActions?: SarakManagementAction[];
    formMapping?: Record<string, string>;
    onAction?: (action: string, group?: string) => void | Promise<void>;
    onToggle?: (item: TItem) => void | Promise<void>;
    onDelete?: (item: TItem) => void | Promise<void>;
    onCreate?: (data: Record<string, unknown>, group?: string) => void | Promise<void>;
}
declare const SarakManagementGrid: <TItem extends Record<string, unknown> = Record<string, unknown>>({ data, load, groupBy, ghostGroups, mapping, label, description, headerActions, groupActions, formMapping, onAction, onToggle, onDelete, onCreate, }: SarakManagementGridProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakChatModelRoute {
    model: string;
    provider: string;
    display_name: string;
    capabilities: string[];
    tier: string;
    score?: number;
}
interface SarakChatSendRequest {
    message: string;
    attachments: File[];
    mode: 'auto' | 'manual';
    model: SarakChatModelRoute | null;
    maxTokens: number;
}
type SarakChatOnSend = (request: SarakChatSendRequest, onToken: (token: string) => void) => Promise<void>;
type SarakChatModelLoader = () => Promise<SarakChatModelRoute[]>;

interface SarakChatProps {
    /** O host envia a mensagem e encaminha cada token recebido ao callback. */
    onSend: SarakChatOnSend;
    /** Carrega modelos do host; omitido, a lista permanece vazia. */
    loadModels?: SarakChatModelLoader;
    /** Nome exibido no cabeçalho; omitido, usa `AI Chat`. */
    label?: string;
}
declare const SarakChat: React__default.FC<SarakChatProps>;

interface SarakSocialProviderConfig {
    id: string;
    icon: React__default.ReactNode;
    variant: 'glass' | 'solid';
    label?: string;
}
interface SarakSocialConfig {
    enabled: boolean;
    display: 'compact' | 'full';
    providers: SarakSocialProviderConfig[];
}

type SarakAuthScreenLabelKey = 'authTitleLogin' | 'authTitleRegister' | 'authTitleMfa' | 'authDescriptionLogin' | 'authDescriptionRegister' | 'authDescriptionMfa' | 'authEmailLabel' | 'authEmailPlaceholder' | 'authPasswordLabel' | 'authMfaLabel' | 'authForgotPassword' | 'authBackToPassword' | 'authSubmitLogin' | 'authSubmitRegister' | 'authSubmitMfa' | 'authHasAccount' | 'authNoAccount' | 'authToggleLogin' | 'authToggleRegister';
/**
 * Evento estruturado emitido por `onChange` (Spec 20) — o canal declarativo único
 * do template. A Engine injeta `onChange` quando o nó tem `actions` no manifesto
 * (mesmo mecanismo do `SarakShellNav.onChange`: LeafNode wire genérico) e o valor
 * emitido vira `{{$event}}` para a cadeia (ex.: `api_call` com `params: "{{$event}}"`).
 */
interface SarakAuthScreenEvent {
    intent: 'submit' | 'social' | 'forgot' | 'toggleRegister' | 'backToPassword';
    username?: string;
    password?: string;
    mfaCode?: string;
    isRegistering?: boolean;
    provider?: string;
}
interface SarakAuthScreenProps {
    branding?: {
        name: string;
        logo?: string;
    };
    /** Permite alternar entre login e cadastro; desativado por padrão. */
    allowRegistration?: boolean;
    /** Permite renderizar a etapa MFA quando controlada pelo host; desativado por padrão. */
    allowMfa?: boolean;
    /** Sobrescreve títulos, descrições e rótulos com texto do host. */
    labels?: Partial<Record<SarakAuthScreenLabelKey, string>>;
    isRegistering?: boolean;
    setIsRegistering?: (val: boolean) => void;
    mfaStep?: boolean;
    setMfaStep?: (val: boolean) => void;
    username?: string;
    setUsername?: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    error?: string;
    isPending?: boolean;
    onSubmit?: (e: React__default.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: SarakSocialConfig;
    onForgot?: () => void;
    errorVariant?: 'error' | 'warning';
    /** Canal declarativo único — ver `SarakAuthScreenEvent`. Dispara em toda interação de negócio. */
    onChange?: (event: SarakAuthScreenEvent) => void;
    /** Renderiza apenas os provedores sociais configurados, sem os campos de credenciais. Default `true`. */
    showCredentials?: boolean;
}
/**
 * SarakAuthScreen is a host-configured template with no built-in network behavior.
 *
 * Template soberano para fluxos de autenticação. Autocontido por padrão: campos e
 * alternância de modo vivem em estado interno quando o host não os controla; o único
 * canal que o host PRECISA injetar é `onChange` (ou os callbacks imperativos
 * individuais, para uso direto em TSX) para saber o que aconteceu. A lib nunca decide
 * onde o token vive nem chama rede — só entrega o evento (receita canônica de sessão:
 * The host owns the authentication flow and transport.
 */
declare const SarakAuthScreen: React__default.FC<SarakAuthScreenProps>;

interface SarakCatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: unknown;
}
interface SarakCatalogGridProps {
    /** Itens filtrados e exibidos; obrigatória. Cada registro precisa de `id` e `display_name`; a busca ignora `description` e outros campos. */
    items: SarakCatalogItem[];
    /** Exibe o indicador de carga no lugar de todo o catálogo; omitida, os itens são renderizados sem espera. */
    loading?: boolean;
    /** Título obrigatório do catálogo; não há valor padrão e ele também fica oculto enquanto `loading` for verdadeiro. */
    title: string;
    /** Texto complementar do cabeçalho; omitido, a linha de subtítulo não aparece. */
    subtitle?: string;
    /** Mapeia cada valor de `item.category` para o rótulo do filtro; omitida, oferece apenas `all: 'Todos'`. Inclua `all` para manter o botão de mostrar tudo. */
    categories?: Record<string, string>;
    /** Habilita o botão que chama a rotina de sincronização; omitida, o botão não aparece. Ele fica fixo no canto inferior direito. */
    onSync?: () => void;
    /** Personaliza cada cartão já filtrado; omitida, o cartão padrão mostra `display_name` e `organization`. */
    renderCard?: (item: SarakCatalogItem) => React$1.ReactNode;
    /** Mensagem exibida quando a lista filtrada fica vazia; omitida, usa `Nenhum item encontrado.`. Não aparece durante o carregamento. */
    emptyMessage?: string;
}

/**
 * SarakCatalogGrid (Industrial Template v9.5)
 *
 * Template soberano para catálogos, grids de produtos ou modelos.
 * Centraliza lógica de busca e filtragem visual.
 */
declare const SarakCatalogGrid: React__default.FC<SarakCatalogGridProps>;

/**
 * Contratos do nó recursivo (RBAC/IAM e TreeView genérico).
 *
 * Extraídos de `RecursiveMatrixNode.tsx` na Onda 9 para manter o componente sob o
 * limite de 250 linhas (Clean Code). Tipado — Zero Any.
 */

interface SarakMatrixTreeNode {
    id: string;
    name?: string;
    description?: string;
    /** Discriminador opcional para o mapeamento `manifest.types`. */
    type?: string;
    children?: SarakMatrixTreeNode[];
    /** Carregamento assíncrono em andamento — renderiza o `lazyLoadingIcon`. */
    loading?: boolean;
}

interface SarakMatrixNodeConfig<TNode = SarakMatrixTreeNode> {
    /** Variante visual de renderização do nó */
    variant?: 'card' | 'row' | 'badge' | 'switch' | 'clean';
    /** Se exibe checkbox/toggle para ativar/desativar */
    hasToggle?: boolean;
    /** Se o nó é expansível/colapsável */
    hasExpand?: boolean;
    /** Se o nó deve iniciar expandido */
    defaultExpanded?: boolean;
    /** Ícone customizado (Lucide ou elemento) */
    icon?: React__default.ComponentType<Record<string, unknown>>;
    /** Renderizador totalmente customizado para controle total */
    renderCustom?: (node: TNode, level: number, isActive: boolean, isExpanded: boolean, onToggle: () => void, onToggleExpand: () => void) => React__default.ReactNode;
}
interface SarakMatrixManifest {
    /** Mapeamento por nível de profundidade (0 para raiz, 1 para filhos, 2 para netos, etc.) */
    levels?: Record<number, SarakMatrixNodeConfig<SarakMatrixTreeNode>>;
    /** Mapeamento dinâmico pelo atributo `node.type` */
    types?: Record<string, SarakMatrixNodeConfig<SarakMatrixTreeNode>>;
    /** Configurações fallback padrão */
    default?: SarakMatrixNodeConfig<SarakMatrixTreeNode>;
}
interface SarakMatrixParentData {
    id: string;
    name?: string;
    description?: string;
    [key: string]: unknown;
}
interface SarakExpandableMatrixProps<TData extends SarakMatrixParentData> {
    /** Itens principais (ex: Roles/Papéis) */
    data: TData[];
    /** Todos os sub-itens possíveis (ex: Todas as Permissões) */
    subItems: SarakMatrixTreeNode[];
    /** Função para checar se um sub-item está ativo em um item pai */
    activeMapping: (parentId: string, subItemId: string) => boolean;
    /** Callback disparado ao clicar no toggle */
    onToggle: (parentId: string, subItemId: string) => void;
    /** Renderizador customizado para o cabeçalho de cada item pai */
    renderItemHeader?: (item: TData) => React__default.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}
declare const SarakExpandableMatrix: <TData extends SarakMatrixParentData>({ data, subItems, activeMapping, onToggle, renderItemHeader, manifest }: SarakExpandableMatrixProps<TData>) => react_jsx_runtime.JSX.Element;

interface SarakImageCardProps {
    /** Endereço da imagem de fundo; é obrigatório e, sem uma fonte válida, a camada de imagem fica vazia. */
    src: string;
    /** Texto alternativo da imagem; sem a prop, usa o texto genérico `Image Card`, então informe uma descrição para imagens informativas. */
    alt?: string;
    /** Título sobreposto à imagem; omitido, o título não aparece. */
    title?: string;
    /** Texto secundário sob o título; omitido, o subtítulo não aparece. */
    subtitle?: string;
    /** Conteúdo adicional sob os textos; omitido, não há conteúdo extra. */
    children?: React__default.ReactNode;
    /** Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
    /** Executa uma ação quando o cartão recebe clique; omitida, não há ação, e a raiz continua sem semântica de botão nem suporte de teclado. */
    onClick?: () => void;
}
declare const SarakImageCard: React__default.FC<SarakImageCardProps>;

interface SarakPageTransitionProps {
    children: React__default.ReactNode;
    /** Usado como key pela AnimatePresence para saber quando a rota mudou */
    locationKey: string;
}
declare const SarakPageTransition: React__default.FC<SarakPageTransitionProps>;

interface SarakPageHeaderProps extends Omit<React__default.HTMLAttributes<HTMLElement>, 'title'> {
    title: React__default.ReactNode;
    subtitle?: React__default.ReactNode;
    breadcrumbs?: SarakBreadcrumbItem[];
    onBreadcrumbNavigate?: (href: string) => void;
    primaryActions?: React__default.ReactNode;
    secondaryActions?: React__default.ReactNode;
    loading?: boolean;
    loadingLabel?: string;
}
declare const SarakPageHeader: ({ title, subtitle, breadcrumbs, onBreadcrumbNavigate, primaryActions, secondaryActions, loading, loadingLabel, className, style, ...props }: SarakPageHeaderProps) => React__default.ReactElement;

interface SarakFilterBarProps extends React__default.HTMLAttributes<HTMLDivElement> {
    ariaLabel: string;
    children: React__default.ReactNode;
    actions?: React__default.ReactNode;
    clearFilters?: {
        label: string;
        onClick: () => void;
    };
}
declare const SarakFilterBar: ({ ariaLabel, children, actions, clearFilters, className, style, ...props }: SarakFilterBarProps) => React__default.ReactElement;

interface SarakSegmentedOption {
    value: string;
    label: React__default.ReactNode;
    disabled?: boolean;
}
interface SarakSegmentedControlProps extends Omit<React__default.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: SarakSegmentedOption[];
    ariaLabel: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}
declare const SarakSegmentedControl: ({ options, ariaLabel, value, defaultValue, onValueChange, className, style, ...props }: SarakSegmentedControlProps) => React__default.ReactElement;

interface SarakSectionProps extends Omit<React__default.HTMLAttributes<HTMLElement>, 'title'> {
    title: React__default.ReactNode;
    description?: React__default.ReactNode;
    actions?: React__default.ReactNode;
    children?: React__default.ReactNode;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    variant?: 'plain' | 'card';
    loading?: boolean;
    loadingLabel?: string;
    emptyState?: {
        title?: React__default.ReactNode;
        description?: React__default.ReactNode;
        action?: React__default.ReactNode;
    };
    error?: {
        title: string;
        message: string;
        retryLabel?: string;
        onRetry?: () => void;
    };
}
declare const SarakSection: ({ title, description, actions, children, headingLevel, variant, loading, loadingLabel, emptyState, error, className, style, ...props }: SarakSectionProps) => React__default.ReactElement;

interface SarakDescriptionListItem {
    label: React__default.ReactNode;
    value: React__default.ReactNode;
}
interface SarakDescriptionListProps extends Omit<React__default.HTMLAttributes<HTMLDListElement>, 'children'> {
    items: SarakDescriptionListItem[];
}
declare const SarakDescriptionList: ({ items, className, style, ...props }: SarakDescriptionListProps) => React__default.ReactElement;

interface SarakResourceRowAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
}
interface SarakResourceRowProps extends Omit<React__default.HTMLAttributes<HTMLElement>, 'title'> {
    title: React__default.ReactNode;
    description?: React__default.ReactNode;
    badges?: React__default.ReactNode[];
    metadata?: SarakDescriptionListItem[];
    actions?: SarakResourceRowAction[];
    href?: string;
    onNavigate?: (href: string) => void;
}
declare const SarakResourceRow: ({ title, description, badges, metadata, actions, href, onNavigate, className, style, ...props }: SarakResourceRowProps) => React__default.ReactElement;

type SarakModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
interface SarakModalProps {
    /** Controla se o modal está visível. */
    isOpen: boolean;
    /** Chamado ao fechar pelo botão, tecla Escape ou clique no overlay habilitado. */
    onClose: () => void;
    /** Conteúdo do cabeçalho e nome acessível do diálogo. */
    title?: React__default.ReactNode;
    /** Conteúdo principal do modal; fica em segundo plano quando `steps` é informado. */
    children?: React__default.ReactNode;
    /** Conteúdo do rodapé; substituído pela navegação quando `steps` está informado. */
    footer?: React__default.ReactNode;
    /**
     * Sub-wizard multi-step (Spec 13, Regra 2): cada passo é renderizado isolado dentro
     * do overlay, com navegação "Voltar/Avançar" contida no rodapé. Tem precedência
     * sobre `children`. No último passo, "Avançar" é substituído por `onComplete`.
     */
    steps?: React__default.ReactNode[];
    /** Chamado ao avançar além do último passo (conclusão do wizard). */
    onComplete?: () => void;
    /** Se true, o clique no overlay (fundo) não fecha o modal. */
    disableOverlayClick?: boolean;
    /** Se true, o botão de fechar não é renderizado. */
    hideCloseButton?: boolean;
    /** Classe CSS customizada para o contêiner do modal. */
    className?: string;
    /** Largura máxima controlada por tokens; sem a prop, mantém os 32rem atuais. */
    size?: SarakModalSize;
}
declare const SarakModal: (props: SarakModalProps) => React__default.ReactElement | null;

interface SarakDrawerProps {
    /**
     * Controla a abertura do painel. `true` mostra o diálogo; `false` mantém
     * a estrutura durante a saída animada e depois a desmonta. Obrigatória,
     * sem estado padrão.
     */
    isOpen: boolean;
    /**
     * Callback chamado ao clicar no scrim ou pressionar `Escape`. É
     * obrigatório; sem ele, a integração não compila nem pode solicitar o fechamento.
     */
    onClose: () => void;
    /**
     * Borda pela qual o painel entra; o padrão é `right`. `left`/`right` usam
     * `size` como largura, enquanto `top`/`bottom` usam como altura.
     */
    direction?: 'left' | 'right' | 'top' | 'bottom';
    /** Conteúdo renderizado dentro do diálogo. Obrigatório; não há conteúdo padrão. */
    children: React__default.ReactNode;
    /**
     * Largura para direções laterais ou altura para direções verticais; aceita
     * número (pixels) ou valor CSS com unidade. O padrão é `320`, limitado à
     * área da tela.
     */
    size?: string | number;
    /**
     * Classes adicionais aplicadas ao elemento do diálogo, que já mantém
     * rolagem vertical. Sem a prop, usa apenas as classes internas.
     */
    className?: string;
}
/**
 * Componente de Painel Lateral Deslizante (Drawer).
 * Renderiza um overlay e conteúdo deslizante baseado na direção.
 */
declare const SarakDrawer: React__default.FC<SarakDrawerProps>;

/**
 * SarakOverlayProvider + useOverlay (Spec 13 ↔ Spec 25)
 *
 * Host imperativo de overlays que o Dispatcher abre via `open_modal`/`open_drawer`.
 * Mantém um único overlay ativo por vez e o materializa no `SarakModal`/`SarakDrawer`.
 * Os métodos `open`/`close` casam estruturalmente com o `OverlayController` do
 * Dispatcher — sem import cruzado core↔components (evita ciclo). `confirm()` amplia a
 * API do componente para diálogos com resultado booleano.
 *
 * O overlay aceita `title` + `message`; `confirm()` também permite rótulos customizados
 * e tom destrutivo. `message` aceita `ReactNode`.
 * A confirmação resolve `false` ao cancelar, fechar, substituir o overlay ou desmontar.
 */

interface SarakOverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: React__default.ReactNode;
}
/** Opções visuais e textuais do diálogo de confirmação imperativo. */
interface SarakConfirmOptions {
    /** Título do diálogo. */
    title: string;
    /** Mensagem que explica a ação a confirmar: texto ou qualquer `ReactNode`. */
    message: React__default.ReactNode;
    /** Rótulo do botão de confirmação (padrão localizado: Confirmar). */
    confirmLabel?: string;
    /** Rótulo do botão de cancelamento (padrão localizado: Cancelar). */
    cancelLabel?: string;
    /** Estilo do botão de confirmação; `danger` indica uma ação destrutiva. */
    tone?: 'default' | 'danger';
}
/** Casa estruturalmente com o `OverlayController` do Dispatcher, sem import cruzado. */
interface SarakOverlayController {
    /** Abre um modal ou drawer com título e mensagem opcionais. */
    open(request: SarakOverlayRequest): void;
    /** Fecha o overlay atual; uma confirmação pendente resolve com `false`. */
    close(): void;
    /** Abre um diálogo de confirmação e resolve `true` se confirmado, senão `false`. */
    confirm(options: SarakConfirmOptions): Promise<boolean>;
}
declare const SarakOverlayProvider: ({ children }: {
    children: React__default.ReactNode;
}) => React__default.ReactElement;
/** Acessa o controller de overlays; no-op fora do Provider (degrada sem quebrar). */
declare const useOverlay: () => SarakOverlayController;

interface SarakModalLayoutContext {
    headerClass: string;
    footerClass: string;
    closeButtonClass: string;
}
/**
 * Hook Controlador Estrutural (Camada 6) - Modals
 */
declare const useModalLayoutStyles: (design: SarakThemePayload) => SarakModalLayoutContext;

interface SarakEmptyStateProps {
    /** Escolhe a composição visual (`minimal`, `abstract` ou `geometric`); sem a prop, usa `abstract`. */
    type?: 'minimal' | 'abstract' | 'geometric';
    /** Conteúdo principal do estado; quando informado, ativa a composição de conteúdo. */
    title?: React__default.ReactNode;
    /** Explicação complementar para o estado vazio. */
    description?: React__default.ReactNode;
    /** Ação composta pelo consumidor, normalmente um `SarakButton`. */
    action?: React__default.ReactNode;
    /** Ícone ou ilustração composta pelo consumidor. */
    icon?: React__default.ReactNode;
}
declare const SarakEmptyState: (props: SarakEmptyStateProps) => React__default.ReactElement;

type SarakProgressVariant = 'success' | 'error' | 'warning' | 'info';
interface SarakProgressThreshold {
    /** Valor absoluto, na mesma escala de `value` e `max`, a partir do qual a cor vale. */
    value: number;
    variant: SarakProgressVariant;
}
interface SarakProgressProps {
    /** Valor atual do progresso, limitado ao intervalo entre zero e `max` (padrão: 0). */
    value?: number;
    /** Valor que representa 100% do progresso; precisa ser positivo (padrão: 100). */
    max?: number;
    /** Limiares que escolhem a variante de cor conforme o valor atual. */
    thresholds?: SarakProgressThreshold[];
    /** Rótulo acessível anunciado pela barra de progresso. */
    label?: string;
    /** Exibe animação indeterminada e omite o valor atual na árvore acessível. */
    indeterminate?: boolean;
    /** Classe adicional aplicada ao contêiner do componente. */
    className?: string;
    /** Aceita `value` acima de `max`: enche a barra e marca o excesso com o tom de alerta (padrão: `false`). */
    allowOverflow?: boolean;
    /** Mostra o valor ao lado da barra (padrão: `false`). */
    showValue?: boolean;
    /** Formato do valor mostrado; `percent` é aplicado a `value / max`, os demais a `value` (padrão: percentual). */
    valueFormat?: SarakValueFormat;
}
declare const SarakProgress: ({ value, max, thresholds, label, indeterminate, className, allowOverflow, showValue, valueFormat, }: SarakProgressProps) => React__default.ReactElement;

type SarakBadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
type SarakBadgeSize = 'sm' | 'md' | 'lg';
interface SarakBadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: SarakBadgeVariant;
    size?: SarakBadgeSize;
    /** Se true, o badge terá bordas mais arredondadas (estilo pill) */
    pill?: boolean;
    /** Se true, o fundo será translúcido/suave em vez de sólido */
    soft?: boolean;
    /** Exibe uma forma junto ao rótulo nas variantes de status. */
    showStatusShape?: boolean;
}
declare const SarakBadge: React__default.FC<SarakBadgeProps>;

/**
 * SarakSkeleton — placeholder de carregamento (Spec 13, Regra 3 + Spec 31, Regra 2)
 *
 * Assume FORMAS declaradas (`shape`): `text` (barras finas), `circle` (avatar) e `rect`
 * (bloco). Mantém o uso original como estado `loading` da Fonte de Dados (linhas-fantasma)
 * por padrão. Zero Hardcode: cores/raio via `[--sarak-*]`; pulso via `animate-pulse`.
 */

/** Forma do esqueleto. */
type SarakSkeletonShape = 'text' | 'circle' | 'rect';
interface SarakSkeletonProps {
    /** Forma do placeholder (default: `text`). */
    shape?: SarakSkeletonShape;
    /** Número de linhas-fantasma quando `shape="text"` (default: 3). */
    rows?: number;
    /** Altura de cada linha/bloco (default: `1rem`). */
    rowHeight?: string;
    /** Diâmetro quando `shape="circle"` (default: `2.5rem`). */
    size?: string;
    /** Largura quando `shape="rect"`/`circle` (default: `100%` / `size`). */
    width?: string;
}
declare const SarakSkeleton: React__default.FC<SarakSkeletonProps>;

interface SarakSpinnerProps {
    /** Define o diâmetro pequeno, médio ou grande; omitido, usa `md` e os tamanhos acompanham os tokens tipográficos do tema. */
    size?: 'sm' | 'md' | 'lg';
    /** Nome acessível do progresso indeterminado; omitido ou vazio, usa o catálogo no idioma ativo. */
    label?: string;
    /** Acrescenta classes ao SVG; omitida, mantém o estilo interno. Classes de animação podem substituir a rotação em movimento permitido. */
    className?: string;
}
declare const SarakSpinner: React__default.FC<SarakSpinnerProps>;

/**
 * SarakDataEmpty — placeholder MÍNIMO de "sem dados" (puxado sob demanda)
 *
 * ⚠️ MÍNIMO: estado `empty` da Fonte de Dados (Spec 31, Regra 2). Mensagem neutra e
 * tokenizada — distinto do `SarakEmptyState` (peça de branding de viewport vazio).
 * A UX completa de Empty States chega na Spec 13.
 */

interface SarakDataEmptyProps {
    /** Mensagem exibida; omitida, usa o texto do catálogo no idioma ativo. */
    message?: string;
}
declare const SarakDataEmpty: React__default.FC<SarakDataEmptyProps>;

/**
 * SarakToast + SarakToastProvider (Spec 13 — Regra 1)
 *
 * Sistema de notificações em pilha, estável (sem conflito de z-index) e tokenizado.
 * As cores mapeiam o Status Schema (`--sarak-status-*-color`), sem hardcode. O
 * Provider expõe um controller imperativo via `useToast()` — é por aqui que o
 * Dispatcher (Spec 25) dispara a ação `trigger_toast`.
 *
 * Cada toast desmonta sozinho após `duration` ms. Quando há uma ação, a duração é de
 * pelo menos cinco segundos; zero ou valor negativo desabilita o auto-dismiss. A pilha
 * empilha com espaçamento, anima a entrada via transição CSS e é renderizada em portal.
 *
 * Zero Any: o controller é tipado; a fronteira não usa `any`.
 */

type SarakToastVariant = 'success' | 'error' | 'warning' | 'info';
/** Ação opcional apresentada junto à mensagem do toast. */
interface SarakToastAction {
    /** Texto visível do botão da ação. */
    label: string;
    /** Executado ao acionar o botão; o toast é dispensado em seguida. */
    onClick: () => void;
}
/** Opções aceitas ao criar uma notificação pelo controller de toasts. */
interface SarakToastOptions {
    /** Texto principal exibido na notificação. */
    message: string;
    /** Variante semântica mapeada às cores do Status Schema (padrão: `info`). */
    variant?: SarakToastVariant;
    /** Duração até o fechamento automático em milissegundos (padrão: 3000). */
    duration?: number;
    /** Título opcional exibido acima da mensagem. */
    title?: string;
    /** Ação opcional exibida como botão; garante duração mínima de cinco segundos. */
    action?: SarakToastAction;
}
/** Controller público para criar e dispensar notificações. */
interface SarakToastController {
    /** Adiciona uma notificação à pilha e devolve seu id para dispensa manual. */
    notify(options: SarakToastOptions): string;
    /** Remove da pilha a notificação identificada pelo id. */
    dismiss(id: string): void;
}
declare const SarakToastProvider: ({ children }: {
    children: React__default.ReactNode;
}) => React__default.ReactElement;
/** Acessa o controller de toasts; fora de SarakToastProvider devolve um controller no-op. */
declare const useToast: () => SarakToastController;

interface SarakFieldErrorProps {
    /**
     * Mensagem do erro. Omitida, vazia ou composta só por espaços, não renderiza
     * elemento nem reserva espaço; espaços nas bordas não são removidos do texto exibido.
     */
    message?: string;
    /**
     * `id` do controle descrito; a mensagem recebe o id `${fieldId}-error`.
     * É obrigatório em TypeScript; se omitido ao contornar a tipagem, a mensagem
     * continua visível e anunciada, mas não pode ser associada ao campo. No controle,
     * use esse id da mensagem em `aria-describedby`.
     */
    fieldId: string;
}
/** Exibe uma mensagem de erro anunciada por leitor de tela e pronta para associação ao campo. */
declare function SarakFieldError({ message, fieldId }: SarakFieldErrorProps): React__default.ReactElement | null;

type SarakAlertVariant = 'success' | 'error' | 'warning' | 'info';
interface SarakAlertProps {
    /** Define a intenção `info`, `success`, `warning` ou `error`; omitida, usa `info`. Só `error` recebe anúncio assertivo. */
    variant?: SarakAlertVariant;
    /** Define o título visível e o nome acessível do aviso; é obrigatória e, se omitida em runtime, o aviso fica sem título. */
    title: string;
    /** Define o conteúdo do aviso: texto ou qualquer `ReactNode`; é obrigatório e, se omitido em runtime, nenhum conteúdo será exibido. */
    message: React__default.ReactNode;
    /** Exibe uma ação com rótulo e callback; omitida, não há botão, e clicar nela não fecha o aviso automaticamente. */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Exibe o botão de fechar; omitida, não há botão, e o callback deve remover ou desmontar o aviso, pois ele não tem estado interno de fechamento. */
    onClose?: () => void;
}
declare const SarakAlert: ({ variant, title, message, action, onClose, }: SarakAlertProps) => React__default.ReactElement;

type SarakTabsVariant = 'pills' | 'underlined' | 'enclosed';

interface SarakTabItem {
    id: string;
    label: React__default.ReactNode;
    icon?: React__default.ReactNode;
    disabled?: boolean;
    /** Destino da aba-rota. Com `href` em alguma aba, a lista vira um `<nav>` de links com `aria-current="page"` (aba que troca de rota é navegação, não `role="tab"`). */
    href?: string;
    /** Contador lido junto do rótulo pelo leitor de tela. Omitido, a aba não mostra contador. */
    count?: number;
    /** `id` do painel que a aba controla. Omitido, `${idPrefix}-panel-${id}`. */
    panelId?: string;
}
interface SarakTabsProps {
    tabs: SarakTabItem[];
    activeTab: string;
    /** Chamado ao escolher uma aba. Opcional: aba-rota pode usar só `onNavigate`. */
    onChange?: (tabId: string) => void;
    /** Com `href` na aba, o clique simples não recarrega a página e chama isto. Omitido, o navegador segue o link. */
    onNavigate?: (href: string, tab: SarakTabItem) => void;
    /** Prefixo dos `id` da aba e do painel (`SarakTabPanel idPrefix`). Omitido, gerado. */
    idPrefix?: string;
    /** Estilo de exibição das abas */
    variant?: SarakTabsVariant;
    /** Preencher a largura toda? */
    fullWidth?: boolean;
    className?: string;
    listClassName?: string;
}
declare const SarakTabs: React__default.FC<SarakTabsProps>;

interface SarakTabPanelProps {
    /** `id` da aba (`SarakTabItem.id`) a que este painel pertence. */
    tabId: string;
    /** O mesmo `idPrefix` passado ao `SarakTabs`; é o que casa `aria-controls` e `aria-labelledby`. */
    idPrefix: string;
    children: React__default.ReactNode;
}
/**
 * Painel ligado a uma aba: `role="tabpanel"`, `id` igual ao `aria-controls` da aba e
 * `aria-labelledby` apontando para ela. Renderize só o painel da aba ativa.
 */
declare const SarakTabPanel: React__default.FC<SarakTabPanelProps>;

/**
 * SarakTooltip (Spec 13 — Regra 4)
 *
 * Balão flutuante que NÃO é cortado pelo `overflow:hidden` de containers ancestrais:
 * o conteúdo é renderizado num portal no `body` e posicionado em `position: fixed` a
 * partir do retângulo do gatilho. Inclui edge detection — se a posição preferida sair
 * da viewport, é espelhada (flip) e/ou deslocada para dentro.
 *
 * Abre por mouse (com atraso), por foco e por toque: no toque o gatilho alterna o balão na hora
 * e um toque fora o fecha — sem isso, um gatilho que não recebe foco nunca o abriria.
 *
 * Zero Hardcode nas cores (tokens `--theme-*`).
 */

type SarakTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface SarakTooltipProps {
    children: React__default.ReactNode;
    content: React__default.ReactNode;
    position?: SarakTooltipPosition;
    delay?: number;
    className?: string;
    /** Se true, desativa o tooltip */
    disabled?: boolean;
}
declare const SarakTooltip: React__default.FC<SarakTooltipProps>;

/**
 * SarakContextMenu (Spec 13 — Regra 5)
 *
 * Menu que abre exatamente na coordenada X,Y do clique (tipicamente o botão direito) e
 * desaparece instantaneamente ao clicar em qualquer outro lugar (ou ESC). Renderiza num
 * portal no `body` para escapar de `overflow:hidden` de containers ancestrais.
 *
 * Edge detection: se a coordenada jogaria o menu para fora da viewport, ele é deslocado
 * para dentro. Zero Hardcode nas cores (tokens `--sx-*`/`--theme-*`).
 */

interface SarakContextMenuPosition {
    x: number;
    y: number;
}
interface SarakContextMenuProps {
    /** Controla a visibilidade. */
    isOpen: boolean;
    /** Coordenada (viewport) onde abrir — normalmente `{ x: e.clientX, y: e.clientY }`. */
    position: SarakContextMenuPosition;
    /** Fecha o menu (clique fora / ESC / escolha de item). */
    onClose: () => void;
    /** Itens do menu (ex.: botões). */
    children: React__default.ReactNode;
    className?: string;
}
declare const SarakContextMenu: React__default.FC<SarakContextMenuProps>;

/**
 * SarakDataGrid — BASE de virtualização (Spec 12, recorte da Onda 1)
 *
 * ⚠️ ESCOPO REDUZIDO: esta é apenas a *janela virtual* (windowing) que o motor de
 * repetição (Spec 23, Regra 4) delega para listas grandes (> limiar). As demais
 * Regras da Spec 12 — pinned/resize/reorder de colunas, Kanban, Charts/Sparklines,
 * Tree Views — ficam para a implementação COMPLETA da Spec 12 (onda posterior).
 *
 * Headless por design: não impõe markup de tabela nem cores próprias. Renderiza só
 * as linhas visíveis (60 FPS / 10k+ itens) e delega o conteúdo de cada linha ao
 * `renderRow`. Zero Hardcode: dimensões/efeitos via tokens `[--sarak-*]`.
 */

interface SarakDataGridProps {
    /** Quantidade total de linhas (a fonte real vive fora; aqui só virtualizamos). */
    count: number;
    /** Render de UMA linha pelo índice — chamado apenas para linhas visíveis. */
    renderRow: (index: number) => React__default.ReactNode;
    /** Altura estimada de cada linha em px (default: 44). */
    estimateSize?: number;
    /** Linhas extra montadas fora da viewport para scroll suave (default: 8). */
    overscan?: number;
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Classe utilitária extra do contêiner. */
    className?: string;
}

/**
 * SarakDataGrid — barrel + carregamento preguiçoso (Spec 12, base da Onda 1).
 *
 * `SarakDataGrid` é um `React.lazy`: a dependência de virtualização
 * (`@tanstack/react-virtual`) só é baixada quando um grid é realmente renderizado
 * — telas sem listas grandes pagam custo zero. Sempre renderize sob `<Suspense>`.
 *
 * A implementação é interna; `SarakDataGridProps` continua público.
 */
declare const SarakDataGrid: React$1.LazyExoticComponent<React$1.FC<SarakDataGridProps>>;

type SarakDataTableRowHeight<T> = number | ((row: T) => number) | 'auto';
interface SarakDataTableProps<T = Record<string, unknown>> {
    /** Definição declarativa das colunas (ordem inicial = ordem do array). */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. */
    rows: T[];
    rowHeight?: SarakDataTableRowHeight<T>;
    headerHeight?: number;
    height?: number | string;
    overscan?: number;
    /** Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. */
    getRowKey?: (row: T, index: number) => React__default.Key;
    /** Omitido, ordena localmente; passe null para controlar o estado sem ordenação. */
    sort?: SarakTableSort | null;
    /** Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. */
    onSortChange?: (sort: SarakTableSort | null) => void;
    /** Habilita a seleção de linhas e a caixa das linhas visíveis. */
    selectable?: boolean;
    /** Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. */
    selectedKeys?: React__default.Key[];
    /** Recebe as chaves selecionadas atualizadas. */
    onSelectionChange?: (selectedKeys: React__default.Key[]) => void;
    onColumnResize?: (columnId: string, width: number) => void;
    onColumnReorder?: (fromId: string, toId: string) => void;
    /** L2 (Spec 40.2): no smartphone colapsa para cards empilhados. Default `true`. */
    responsive?: boolean;
    /** Exibe os estados de carregamento, erro e vazio recebidos pelo host. */
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    onRetry?: () => void;
    /** Disparado ao ativar uma linha. */
    onRowClick?: (row: T) => void;
    className?: string;
    /** Agrupa as linhas, com cabeçalho de grupo expansível e subtotal. */
    groupBy?: SarakTableGroupBy<T>;
    /** Conteúdo da linha expandida; com ele, cada linha ganha o botão de expandir. */
    renderExpanded?: (row: T) => React__default.ReactNode;
    /** Chaves das linhas expandidas (controlado); omitido, a tabela gerencia. */
    expandedKeys?: React__default.Key[];
    onExpandedChange?: (keys: React__default.Key[]) => void;
    /** Filtra as linhas pelo texto exibido (ou `searchValue`); omitido, sem filtro. A DataTable não tem campo de busca. */
    searchQuery?: string;
    onSearchQueryChange?: (query: string) => void;
    /** Total no servidor; maior que as linhas visíveis, oferece "Selecionar todos os N". */
    totalCount?: number;
    /** Com `true`, `selectedKeys` passa a ser a lista de EXCEÇÕES. */
    selectAll?: boolean;
    onSelectAllChange?: (all: boolean) => void;
    /** Filhos da linha: transforma a tabela em tree-table (plano de contas, DRE). */
    getChildren?: (row: T) => T[] | undefined;
    /** Profundidade aberta de início na árvore; padrão `0` (tudo recolhido). */
    defaultExpandedDepth?: number;
    /** Cabeçalhos arrastáveis para reordenar; padrão `true`. */
    reorderable?: boolean;
    /** Linhas do esqueleto com `loading` e sem linhas; padrão `8`. */
    skeletonRows?: number;
}

/**
 * SarakDataTable — barrel + carregamento preguiçoso (Spec 12, Regra 2 · Onda 9).
 *
 * Componente pesado: a virtualização (`@tanstack/react-virtual`) só é baixada quando
 * uma tabela colunar é realmente renderizada. Sempre renderize sob `<Suspense>`.
 * A implementação é interna; os tipos da tabela continuam públicos.
 */

declare const SarakDataTable: LazyExoticComponent<(<T>(props: SarakDataTableProps<T>) => ReactElement)>;

/**
 * SarakSparkline — micro-gráfico sem eixos (Spec 12, Regra 4 · Onda 9)
 *
 * Visualização minimalista (linha/área/barra) que cabe no espaço confinado de um
 * `<SarakCard>` (Critério de Aceite 5). In-house em SVG puro: **zero dependência
 * nova** (as Ondas 7–9 não adicionam libs). Zero Hardcode: a cor da série herda dos
 * tokens globais — `--sarak-chart-primary` (Spec 12 / schema `data.ts`) com cascata
 * para `var(--sarak-primary-color,#3b82f6)`. O traço usa `vector-effect: non-scaling-stroke`
 * para permanecer nítido mesmo quando o SVG é esticado na largura do contêiner.
 */

type SarakSparklineVariant = 'line' | 'area' | 'bar';
type SarakSparklineBaseline = 'auto' | 'zero';
interface SarakSparklineProps {
    /** Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. */
    data: number[];
    /** Forma do micro-gráfico (default: 'line'). */
    variant?: SarakSparklineVariant;
    /** Altura em px do desenho (default: 40). A largura preenche o contêiner. */
    height?: number;
    /** Espessura do traço (line/area) em px (default: 2). */
    strokeWidth?: number;
    /** Opacidade do preenchimento da área (default: 0.15). */
    fillOpacity?: number;
    /** `'auto'` (padrão) ajusta a escala ao mínimo e máximo; `'zero'` fixa o zero na escala e desenha a linha de base. */
    baseline?: SarakSparklineBaseline;
    /** Descrição acessível do gráfico (vira `<title>` + `aria-label`). */
    label?: string;
    className?: string;
    style?: React__default.CSSProperties;
}
declare const SarakSparkline: React__default.FC<SarakSparklineProps>;

/**
 * SarakTreeView — árvore hierárquica genérica (Spec 12, Regra 5 · Onda 9)
 *
 * Wrapper fino que **reusa** o motor de recursão `RecursiveMatrixNode` (o mesmo que
 * serve a matriz RBAC) — sem duplicar a recursão. Suporta profundidade infinita e o
 * estado `lazyLoadingIcon` ativável via JSON (nó com `loading: true`), além de seleção
 * opcional por nó e callback de expansão para carregamento sob demanda. Zero dependência
 * nova; Zero Hardcode (estilos herdados dos átomos via tokens `[--sarak-*]`).
 */

interface SarakTreeViewProps {
    /** Floresta de nós; cada nó pode ter `children` (N níveis) e `loading`. */
    data: SarakMatrixTreeNode[];
    /** Manifesto de layout por nível/tipo (default: variante limpa por profundidade). */
    manifest?: SarakMatrixManifest;
    /** Indicador exibido sob nós com `loading: true` (default: spinner tokenizado). */
    lazyLoadingIcon?: React__default.ReactNode;
    /** Disparado ao expandir/colapsar um nó — ponto de gancho para fetch assíncrono. */
    onExpand?: (node: SarakMatrixTreeNode, expanded: boolean) => void;
    /** IDs selecionados (habilita o toggle por nó quando combinado com `onSelect`). */
    selectedIds?: string[];
    /** Disparado ao alternar a seleção de um nó. */
    onSelect?: (nodeId: string) => void;
    className?: string;
}
declare const SarakTreeView: React__default.FC<SarakTreeViewProps>;

/**
 * Tipos públicos do SarakKanban. Sem React nem DOM: o modelo puro (`kanbanModel.ts`) e
 * a interface (`SarakKanbanImpl.tsx`) compartilham estes contratos.
 */
type SarakKanbanPriority = 'low' | 'medium' | 'high' | 'urgent';
interface SarakKanbanAssignee {
    name: string;
    avatarUrl?: string;
}
interface SarakKanbanSubtasks {
    done: number;
    total: number;
}
/** Todos os campos além de `id` são opcionais: o cartão padrão mostra só o que vier preenchido. */
interface SarakKanbanCard {
    id: string;
    /** Identificador legível (ex.: `PRJ-12`), mostrado antes do título. */
    code?: string;
    title?: string;
    description?: string;
    assignee?: SarakKanbanAssignee;
    /** `medium` é o padrão silencioso: não aparece no cartão. */
    priority?: SarakKanbanPriority;
    /** Data ISO (`2026-10-31` ou com horário). Passada a data de hoje, o prazo aparece como atrasado. */
    dueDate?: string;
    subtasks?: SarakKanbanSubtasks;
    /** Valor do cartão (ex.: o da oportunidade); aparece formatado no cartão e é somado no cabeçalho da coluna. */
    value?: number;
}
interface SarakKanbanColumn<C extends SarakKanbanCard = SarakKanbanCard> {
    id: string;
    title: string;
    cards: C[];
}
/**
 * Movimento consolidado de um cartão. Índices valem para a coluna JÁ com o cartão no lugar
 * (`toIndex`) e para a coluna de origem ANTES da saída (`fromIndex`). Os vizinhos são os
 * cartões finais ao redor do destino (`null` nas pontas) — bastam para calcular uma ordem,
 * inclusive fracionária, sem reler o quadro.
 */
interface SarakCardMove {
    cardId: string;
    fromColumn: string;
    toColumn: string;
    fromIndex: number;
    toIndex: number;
    beforeCardId: string | null;
    afterCardId: string | null;
}

/**
 * SarakKanban — quadro de colunas que arrasta entre e DENTRO das colunas, por mouse, toque e
 * teclado. A biblioteca de arrastar vive atrás de `useKanbanDrag`; aqui só se monta o
 * quadro. O modelo local move o cartão no ato da soltura (sem esperar o consumidor) e o
 * `onCardMove` leva índices e vizinhos finais. Medidas, superfícies e bordas saem de tokens.
 */

interface SarakKanbanProps<C extends SarakKanbanCard = SarakKanbanCard> {
    /** Colunas e seus cards (a ordem do array é a ordem visual). */
    columns: Array<SarakKanbanColumn<C>>;
    /** Disparado ao soltar um card em outro lugar: coluna e índice de origem e destino, mais os vizinhos finais. Soltar no mesmo lugar não dispara. */
    onCardMove?: (move: SarakCardMove) => void;
    /** Render customizado do card (default: o cartão padrão com código, título, avatar, prioridade, prazo e subtarefas). */
    renderCard?: (card: C, columnId: string) => React__default.ReactNode;
    /** Ao clicar (ou Enter) num card. Omitido, o card não é clicável. */
    onCardClick?: (card: C, columnId: string) => void;
    /** Criação rápida no rodapé da coluna. Omitido, o campo não aparece. */
    onCardAdd?: (columnId: string, title: string) => void;
    /** Nova coluna, ao fim do quadro. Omitido, o campo não aparece. */
    onColumnAdd?: (title: string) => void;
    /** Renomear coluna pelo menu dela. Omitido, o item não aparece. */
    onColumnRename?: (id: string, title: string) => void;
    /** Excluir coluna pelo menu dela. Omitido, o item não aparece. */
    onColumnDelete?: (id: string) => void;
    /** Formato do `value` dos cartões e da soma das colunas; omitido, o número aparece cru. */
    valueFormat?: SarakValueFormat;
    /** Soma no cabeçalho da coluna: `true`/omitido mostra a soma dos `value` só se algum cartão tiver; `false` esconde; função devolve o conteúdo. */
    columnTotal?: boolean | ((column: SarakKanbanColumn<C>) => React__default.ReactNode);
    className?: string;
}

declare function SarakKanban<C extends SarakKanbanCard = SarakKanbanCard>(props: SarakKanbanProps<C>): react_jsx_runtime.JSX.Element;

/**
 * Modelo de dados do SarakKanban.
 *
 * Lógica pura (sem React/DOM) de movimentação de cards entre e dentro das colunas —
 * testável de forma isolada e usada pelo adaptador de arrastar (`useKanbanDrag`).
 */

/**
 * Move `cardId` de `fromColumn` para `toColumn` na posição `toIndex` (imutável).
 * Devolve as colunas inalteradas se o card/coluna não existirem.
 */
declare const sarakMoveCard: <C extends SarakKanbanCard>(columns: Array<SarakKanbanColumn<C>>, cardId: string, fromColumn: string, toColumn: string, toIndex: number) => Array<SarakKanbanColumn<C>>;

/**
 * SarakChecklist — lista de itens marcáveis (subtarefas de um cartão, por exemplo), com
 * progresso `feitos/total`, criação rápida e remoção opcionais. Estilo só por token;
 * texto pelo catálogo de i18n; ícone só pela porta de ícones.
 */
interface SarakChecklistItem {
    id: string;
    label: string;
    done: boolean;
}
interface SarakChecklistProps {
    /** Itens na ordem em que aparecem. Vazio mostra o estado vazio traduzido. */
    items: SarakChecklistItem[];
    /** Disparado ao marcar ou desmarcar um item, com o id e o novo estado. A lista é controlada: quem chama atualiza `items`. */
    onToggle: (id: string, done: boolean) => void;
    /** Criação rápida: recebe o título digitado, sem espaços nas pontas. Omitido, o campo de novo item não aparece. */
    onAdd?: (label: string) => void;
    /** Remover um item. Omitido, o botão de remover não aparece. */
    onRemove?: (id: string) => void;
    /** Mostra a barra de progresso e o contador `feitos de total`. Omitido, não aparece. */
    showProgress?: boolean;
    /** Nome acessível da lista. Omitido, usa o texto traduzido "Lista de verificação". */
    label?: string;
    className?: string;
}
declare function SarakChecklist({ items, onToggle, onAdd, onRemove, showProgress, label, className }: SarakChecklistProps): react_jsx_runtime.JSX.Element;

/**
 * Horário relativo ("há 3 horas") no locale que vale na tela (`useSarakLanguage`), para o fio de comentários e o
 * histórico. Usa `Intl.RelativeTimeFormat`: nenhuma tradução fica no catálogo.
 */
type SarakTimestamp = string | number | Date;

interface SarakCommentAuthor {
    name: string;
    avatarUrl?: string;
}
interface SarakComment {
    id: string;
    author: SarakCommentAuthor;
    body: string;
    /** Data ISO, número (ms) ou `Date`. Data inválida mostra o comentário sem horário. */
    createdAt: SarakTimestamp;
}
interface SarakCommentThreadProps {
    /** Comentários na ordem em que aparecem. Vazio mostra o estado vazio traduzido. */
    comments: SarakComment[];
    /** Disparado ao enviar (botão ou Ctrl/Cmd+Enter) com o texto sem espaços nas pontas. Texto vazio não dispara. */
    onSubmit: (text: string) => void;
    /** Excluir um comentário. Omitido, o botão de excluir não aparece. */
    onDelete?: (id: string) => void;
    /** Nome acessível da seção. Omitido, usa o texto traduzido "Comentários". */
    label?: string;
    className?: string;
}
declare function SarakCommentThread({ comments, onSubmit, onDelete, label, className }: SarakCommentThreadProps): react_jsx_runtime.JSX.Element;

interface SarakActivityActor {
    name: string;
    avatarUrl?: string;
}
interface SarakActivityEntry {
    id: string;
    /** Quem fez. Omitido, a entrada é um evento do sistema, sem avatar nem nome. */
    actor?: SarakActivityActor;
    /** O que aconteceu, já na frase final ("moveu para Em andamento"). */
    text: string;
    /** Data ISO, número (ms) ou `Date`. Data inválida mostra a entrada sem horário. */
    at: SarakTimestamp;
}
interface SarakActivityFeedProps {
    /** Entradas na ordem em que aparecem. Vazio mostra o estado vazio traduzido. */
    entries: SarakActivityEntry[];
    /** Nome acessível da lista. Omitido, usa o texto traduzido "Histórico". */
    label?: string;
    className?: string;
}
declare function SarakActivityFeed({ entries, label, className }: SarakActivityFeedProps): react_jsx_runtime.JSX.Element;

type SarakCalendarTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
/** `Date` ou texto `AAAA-MM-DD`. */
type SarakCalendarDate = Date | string;
interface SarakCalendarEvent {
    id: string;
    title: string;
    /** Primeiro dia do evento. */
    start: SarakCalendarDate;
    /** Último dia, inclusive. Omitido (ou antes do início), o evento ocupa só o dia do início. */
    end?: SarakCalendarDate;
    /** Cor do chip, pelas cores do design. Omitido, usa `primary`. */
    tone?: SarakCalendarTone;
    /** Dado livre de quem chama, devolvido intacto em `onEventClick`; a lib não o lê. */
    meta?: unknown;
}

interface SarakCalendarProps {
    /** Eventos do mês (e de fora dele: só os que tocam a grade visível aparecem). Vazio mostra a grade sem chips. */
    events: SarakCalendarEvent[];
    /** Mês exibido, no modo controlado: a navegação chama `onMonthChange` e quem chama atualiza esta prop. */
    month?: Date;
    /** Chamado a cada troca de mês com o primeiro dia do novo mês, nos dois modos. */
    onMonthChange?: (month: Date) => void;
    /** Mês inicial no modo não controlado (sem `month`). Omitido, abre no mês de hoje. */
    defaultMonth?: Date;
    /** Primeira coluna da semana: `0` domingo, `1` segunda. Omitido, `0`. */
    weekStartsOn?: SarakWeekStart;
    /** Clique ou `Enter` num chip de evento. */
    onEventClick?: (event: SarakCalendarEvent) => void;
    /** Clique ou `Enter` num dia, toque no dia em contêiner estreito, e o "+N" do dia cheio. */
    onDayClick?: (date: Date) => void;
    /** Conteúdo do chip no lugar do título. O nome acessível do chip continua sendo o título. */
    renderEvent?: (event: SarakCalendarEvent) => React__default.ReactNode;
    /** Quantos chips um dia mostra antes do "+N". Omitido, `3`. */
    maxEventsPerDay?: number;
    /** Nome acessível da grade. Omitido, usa o texto traduzido "Calendário de <mês e ano>". */
    label?: string;
    className?: string;
}
declare function SarakCalendar({ events, month, onMonthChange, defaultMonth, weekStartsOn, onEventClick, onDayClick, renderEvent, maxEventsPerDay, label, className, }: SarakCalendarProps): react_jsx_runtime.JSX.Element;

type SarakGanttScale = 'day' | 'week' | 'month';
/** Os tons do Gantt são os do calendário: cores do design, nunca hexadecimal. */
type SarakGanttTone = SarakCalendarTone;

interface SarakGanttTask {
    id: string;
    title: string;
    /** Primeiro dia da tarefa: `Date` ou `AAAA-MM-DD`, lido como dia local. Ilegível, a tarefa não aparece. */
    start: SarakCalendarDate;
    /** Último dia, inclusive. Ilegível ou antes do início, a tarefa ocupa só o dia do início. */
    end: SarakCalendarDate;
    /** Percentual concluído, de 0 a 100; fora da faixa é recortado. Omitido, a barra não mostra preenchimento. */
    progress?: number;
    /** Ids das tarefas que precisam terminar antes desta começar. Id inexistente é ignorado, com aviso em desenvolvimento. */
    dependsOn?: string[];
    /** Cor da barra, pelas cores do design. Omitido ou desconhecido, `primary`. */
    tone?: SarakGanttTone;
    /** Grupo (fase, épico), mostrado sob o título na lista. */
    group?: string;
}

interface SarakGanttProps {
    /** Tarefas, uma por linha, na ordem recebida. Vazio mostra o estado vazio traduzido. */
    tasks: SarakGanttTask[];
    /** Quanto cabe em cada coluna do cabeçalho: um dia, uma semana ou um mês. Omitido, `week`. */
    scale?: SarakGanttScale;
    /** Clique ou `Enter` numa barra. */
    onTaskClick?: (task: SarakGanttTask) => void;
    /** Primeiro dia exibido. Omitido, o início das tarefas com uma margem da escala. */
    rangeStart?: SarakCalendarDate;
    /** Último dia exibido, inclusive. Omitido, o fim das tarefas com uma margem da escala. */
    rangeEnd?: SarakCalendarDate;
    /** Nome acessível do cronograma. Omitido, usa o texto traduzido "Cronograma". */
    label?: string;
    className?: string;
}
declare function SarakGantt({ tasks, scale, onTaskClick, rangeStart, rangeEnd, label, className }: SarakGanttProps): react_jsx_runtime.JSX.Element;

/**
 * Exportação CSV das tabelas — código próprio, sem dependência. O BOM UTF-8 e o `;` (quando o
 * locale usa vírgula decimal) fazem o arquivo abrir certo no Excel pt-BR.
 */

interface SarakCsvOptions {
    /** Padrão: `;` quando o locale usa vírgula decimal (pt-BR), senão `,`. */
    separator?: ';' | ',';
    /** Padrão `true`: exporta o valor exibido (`format`); `false`: o valor bruto. */
    formatted?: boolean;
    /** Padrão `true` quando há agregação. */
    includeFooter?: boolean;
    /** Locale do formato e da escolha do separador; ausente = o do ambiente. */
    locale?: string;
}
type SarakCsvColumn<T> = SarakColumn<T> | SarakTableColumn<T>;
/** Converte as linhas em CSV com BOM; o rodapé entra como última linha quando há agregação. */
declare function sarakTableToCsv<T>(columns: SarakCsvColumn<T>[], rows: T[], options?: SarakCsvOptions): string;
/** Baixa o CSV como arquivo; só funciona no navegador. */
declare function sarakDownloadCsv(filename: string, csv: string): void;

/**
 * SarakMarkdownRenderer (Spec 15, Regra 1) — implementação pesada (lazy).
 *
 * Ingere Markdown cru e o renderiza como elementos estilizados pelos tokens Sarak
 * (`[--sarak-*]`), com highlight de código atrelado ao modo (dark/light) do tema.
 * Segurança (Spec 40): NÃO usa `dangerouslySetInnerHTML` nem `rehype-raw` — HTML cru
 * no Markdown é tratado como texto literal (não executado); URLs passam por uma
 * allowlist de esquemas seguros (`javascript:`/`data:` viram href vazio).
 *
 * A dependência pesada (`react-markdown` + `react-syntax-highlighter`) vive AQUI; o
 * `index.ts` exporta isto via `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

interface SarakMarkdownRendererProps {
    /** String de Markdown cru a renderizar. */
    content: string;
    className?: string;
}

declare const SarakMarkdownRenderer: React$1.LazyExoticComponent<React$1.FC<SarakMarkdownRendererProps>>;

/**
 * SarakLightbox (Spec 15, Regra 3) — galeria/carrossel em overlay escuro.
 *
 * Reaproveita o modelo de foco transversal (`useFocusTrap` da Spec 41): trap + ESC +
 * restauração do foco ao fechar. Navega entre mídias por botões prev/next e pelas
 * setas do teclado (←/→), com contador de posição. Renderiza via portal no topo do DOM.
 * Leve (sem dependência nova) — não precisa de `React.lazy`.
 */

interface SarakLightboxImage {
    src: string;
    alt?: string;
}
interface SarakLightboxProps {
    /** Mídias da galeria, na ordem de exibição. */
    images: SarakLightboxImage[];
    /** Controla a visibilidade do overlay. */
    isOpen: boolean;
    /** Índice inicial ao abrir (default: 0). */
    initialIndex?: number;
    /** Fecha o overlay (ESC, clique no ✕ ou no fundo). */
    onClose: () => void;
    /** Notifica a troca de mídia (avançar/retroceder). */
    onIndexChange?: (index: number) => void;
}
declare const SarakLightbox: React__default.FC<SarakLightboxProps>;

/**
 * usePdfDocument (Spec 15, Regra 2 · Onda 10) — ciclo de vida do documento PDF.
 *
 * Extraído do `SarakPDFViewerImpl` para manter o componente enxuto (limite de
 * estado/efeitos do Clean Code). Configura o worker (fora da main thread), carrega o
 * documento via `pdfjs-dist` e cancela/destrói a tarefa na troca da fonte. Zero Any.
 */

/** Fonte do documento: URL, bytes ou ArrayBuffer. */
type SarakPdfSource = string | Uint8Array | ArrayBuffer;

/**
 * SarakPDFViewer (Spec 15, Regra 2) — implementação pesada (lazy).
 *
 * Desenha as páginas do PDF em `<canvas>` via `pdfjs-dist` (peer), sem depender do
 * visualizador nativo bloqueado do navegador. O parse roda num Web Worker (fora da main
 * thread) — o consumidor fornece `workerSrc` da própria instalação de `pdfjs-dist`. A
 * barra de controles (zoom/página/download) é estilizada por tokens (`[--sarak-*]`).
 *
 * A dependência pesada (`pdfjs-dist`) vive AQUI; o `index.ts` exporta isto via
 * `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

interface SarakPDFViewerProps {
    /** Origem do documento: URL, bytes ou ArrayBuffer. */
    src: SarakPdfSource;
    /** Página inicial (1-based, default: 1). */
    initialPage?: number;
    /** Escala inicial de zoom (default: 1.2). */
    zoom?: number;
    /**
     * URL do worker da versão de `pdfjs-dist` instalada pelo consumidor.
     * Vite: `import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';`
     * Webpack 5: `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()`.
     */
    workerSrc: string;
    /** Disparado ao clicar em Download (recebe a `src` quando string). */
    onDownload?: (src: SarakPdfSource) => void;
    className?: string;
}

declare const SarakPDFViewer: React$1.LazyExoticComponent<React$1.FC<SarakPDFViewerProps>>;

/** Item de dado de série: dataset externo, lido por chave dinâmica. */
type SarakChartDataItem = Record<string, unknown>;
/** Tom de uma linha ou faixa de referência; só `neutral` fica fora dos tokens de status. */
type SarakChartReferenceTone = 'neutral' | 'success' | 'warning' | 'error';
/** Linha horizontal (vertical, na orientação horizontal) traçada sobre um valor do eixo de valor. */
interface SarakChartReferenceLine {
    value: number;
    label?: string;
    /** Eixo de valor ao qual `value` pertence; precisa de uma série em `axis: 'right'` para existir. */
    axis?: 'left' | 'right';
    tone?: SarakChartReferenceTone;
    dashed?: boolean;
}
/** Faixa do eixo de valor entre `from` e `to`, sombreada no tom pedido. */
interface SarakChartReferenceBand {
    from: number;
    to: number;
    label?: string;
    tone?: SarakChartReferenceTone;
}
type SarakChartZoom = boolean | 'inside' | 'slider';
type SarakChartPieLabel = 'name' | 'value' | 'percent' | 'name-percent' | 'none';
/** Escala do medidor; omitidos, vale 0 a 100. */
interface SarakChartGauge {
    min?: number;
    max?: number;
}

interface SarakChartEngineProps {
    /**
     * Seleciona o formato; omitido, usa `chartType` do design resolvido. `waterfall` lê `{ name, value, total? }`,
     * `sankey` lê `{ source, target, value }` e `calendar` lê `{ date, value }`.
     */
    type?: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter' | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst' | 'histogram' | 'boxplot' | 'waterfall' | 'sankey' | 'calendar';
    /** Registros da série, com os campos configurados por `xAxisKey` e `dataKey`. */
    data: SarakChartDataItem[];
    /** Ajusta chaves de leitura, motor, título, gradiente, animação e espessura. */
    config?: {
        xAxisKey?: string;
        dataKey?: string;
        engine?: 'recharts' | 'echarts';
        title?: string;
        showGradients?: boolean;
        showAnimation?: boolean;
        thickness?: number;
    };
    /**
     * Séries cartesianas; pizza, radar, funil, `waterfall`, `sankey`, `calendar` e outros formatos ignoram esta prop.
     * `color`, quando informado, é o nome de um token de cor do tema, nunca um valor hexadecimal.
     */
    series?: Array<{
        key: string;
        label?: string;
        type?: 'bar' | 'line' | 'area';
        stack?: string;
        axis?: 'left' | 'right';
        dashed?: boolean;
        /** Formato do valor desta série; omitido, herda `valueFormat` (útil no eixo direito). */
        format?: SarakValueFormat;
        color?: 'chartColorPalette' | 'secondaryColor' | 'accentColor' | 'statusSuccessColor' | 'statusWarningColor' | 'statusErrorColor' | 'statusInfoColor' | 'tertiaryColor';
    }>;
    /** Formatos não cartesianos, `waterfall` e `calendar` ignoram esta prop. */
    stacked?: boolean;
    /** Formatos não cartesianos, `waterfall` e `calendar` ignoram esta prop. */
    orientation?: 'vertical' | 'horizontal';
    /** Exibe a legenda no topo/rodapé ou define explicitamente sua visibilidade; `waterfall`, `sankey` e `calendar` ignoram esta prop. */
    legend?: boolean | 'top' | 'bottom';
    /** Recebe a série, o índice e o registro original ao clicar em um ponto do ECharts. */
    onPointClick?: (event: {
        seriesKey: string;
        index: number;
        datum: SarakChartDataItem;
    }) => void;
    /** Texto acessível do gráfico; omitido, usa o catálogo de i18n. */
    ariaLabel?: string;
    /** Formato de eixo de valor, dica e rótulos, no idioma da tela; omitido, mostra o número cru. Só no ECharts. */
    valueFormat?: SarakValueFormat;
    /** Altura do gráfico (número em px); omitida, ocupa 100% do pai. Só no ECharts. */
    height?: number | string;
    /** Linhas sobre valores do eixo de valor de `bar`, `line` e `area`; os tons vêm dos tokens de status. */
    referenceLines?: SarakChartReferenceLine[];
    /** Faixas sombreadas entre dois valores do eixo de valor de `bar`, `line` e `area`. */
    referenceBands?: SarakChartReferenceBand[];
    /** Zoom do eixo de categoria; `true` equivale a `'slider'`. */
    zoom?: SarakChartZoom;
    /** Rótulo das fatias da pizza; omitido, mostra o da rc.3 (só ao passar o mouse). */
    pieLabel?: SarakChartPieLabel;
    /** Escala do medidor (`gauge`); omitida, vale 0 a 100. O `%` só aparece com `valueFormat` percentual ou sem `valueFormat`. */
    gauge?: SarakChartGauge;
}

/**
 * `SarakChartEngine` (Spec 41 §2.4) — fronteira lazy.
 *
 * Mesma postura do `SarakMarkdownRenderer`/`SarakPDFViewer`: `React.lazy` mantém
 * `echarts` + `zrender` + `recharts` (peers pesados) FORA do grafo estático — só
 * carregam quando um gráfico é de fato renderizado. O barril público (`src/index.ts`)
 * exportava o `default` do módulo de implementação, o que anulava o code-splitting
 * que `components/engines/index.ts` já implementava e colocava ~2,7 MB de biblioteca
 * de gráfico no chunk principal de TODO consumidor, mesmo o que nunca desenha um gráfico.
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakChartEngine />` continua não precisando declarar `Suspense`.
 */

declare const SarakChartEngine: React__default.FC<SarakChartEngineProps>;

interface SarakMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}
interface SarakChatEngineProps {
    /** Histórico controlado pelo consumidor; obrigatório. O motor o renderiza como Markdown e rola para a última mensagem quando a lista muda. */
    messages: SarakMessage[];
    /** Recebe o texto digitado; obrigatório. O consumidor precisa atualizar `messages` para que a resposta apareça. */
    onSendMessage: (text: string) => void;
    /** Indica envio em andamento, mostra o indicador e bloqueia novo envio; omitida, vale `false`. */
    isLoading?: boolean;
    /** Texto de orientação do campo de entrada; omitido, usa `Escreva sua mensagem...`. */
    placeholder?: string;
}

/**
 * `SarakChatEngine` (P26) — fronteira lazy.
 *
 * Mesma postura de `engines/charts/index.tsx`: `React.lazy` mantém `react-markdown`
 * + `react-syntax-highlighter` (peers pesados) FORA do grafo estático do barril
 * público — só carregam quando um chat é de fato renderizado. Expor EAGER anularia
 * o split e colocaria o highlighter no boot de TODO consumidor (a lição medida da
 * Spec 41: o pecado nunca foi expor, foi expor eager).
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakChatEngine />` não precisa declarar `Suspense`.
 */

declare const SarakChatEngine: React__default.FC<SarakChatEngineProps>;

declare const ReactFlow: any;
type ReactFlowProps = React__default.ComponentProps<typeof ReactFlow>;
interface SarakFlowEngineProps {
    /** Nós fornecidos ao React Flow; obrigatório, sem lista padrão. Use `[]` para iniciar sem nós. */
    nodes: NonNullable<ReactFlowProps['nodes']>;
    /** Conexões existentes fornecidas ao React Flow; obrigatório, sem lista padrão. Use `[]` quando não houver conexões. */
    edges: NonNullable<ReactFlowProps['edges']>;
    /** Recebe novas conexões criadas na tela; omitida, os nós e as conexões existentes continuam visíveis, mas não há callback do consumidor para persistir novas ligações. */
    onConnect?: ReactFlowProps['onConnect'];
}

/**
 * `SarakFlowEngine` (P26) — fronteira lazy.
 *
 * Mesma postura de `engines/charts/index.tsx`: `React.lazy` mantém `reactflow`
 * (peer pesado, mais o CSS que ele importa) FORA do grafo estático do barril
 * público — só carrega quando um fluxo é de fato renderizado.
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakFlowEngine />` não precisa declarar `Suspense`.
 */

declare const SarakFlowEngine: React__default.FC<SarakFlowEngineProps>;

export { SARAK_BOOT_THEMES, SARAK_BUILD_INFO, SARAK_DEFAULT_COLUMN_WIDTH, SARAK_DEFAULT_DEVICE_BREAKPOINTS, SARAK_DEFAULT_THEME_ID, SARAK_DESIGN_MANIFEST, SARAK_ICONE_DESCONHECIDO, SARAK_ICON_NAMES, SARAK_MIN_COLUMN_WIDTH, SARAK_MODE_ATTRIBUTE, SARAK_SCOPE_CLASS, SARAK_THEME_AXES, SARAK_THEME_CATALOG, SARAK_THEME_PRESET_IDS, type SarakAccept, SarakAccordion, type SarakAccordionProps, SarakActionCard, type SarakActionCardProps, type SarakActivityActor, type SarakActivityEntry, SarakActivityFeed, type SarakActivityFeedProps, type SarakAggregate, SarakAlert, type SarakAlertProps, type SarakAlertVariant, SarakAnalyticalPage, type SarakAnalyticalPageProps, SarakAppChrome, type SarakAppChromeProps, type SarakAssigneePerson, SarakAssigneePicker, type SarakAssigneePickerProps, SarakAuthScreen, type SarakAuthScreenEvent, type SarakAuthScreenLabelKey, type SarakAuthScreenProps, SarakAutocomplete, type SarakAutocompleteOption, type SarakAutocompleteProps, SarakAvatar, type SarakAvatarProps, type SarakAvatarSize, SarakBadge, type SarakBadgeProps, type SarakBadgeSize, type SarakBadgeVariant, type SarakBrandingState, type SarakBreadcrumbItem, SarakBreadcrumbs, type SarakBreadcrumbsProps, SarakButton, type SarakButtonProps, SarakCalendar, type SarakCalendarDate, type SarakCalendarEvent, type SarakCalendarProps, type SarakCalendarTone, SarakCard, SarakCardBody, type SarakCardBodyProps, type SarakCardDensity, SarakCardFooter, type SarakCardFooterProps, SarakCardGrid, type SarakCardGridProps, SarakCardHeader, type SarakCardHeaderProps, type SarakCardMove, type SarakCardProps, SarakCatalogGrid, type SarakCatalogGridProps, type SarakCatalogItem, type SarakChartDataItem, SarakChartEngine, type SarakChartEngineProps, type SarakChartGauge, type SarakChartPieLabel, type SarakChartReferenceBand, type SarakChartReferenceLine, type SarakChartReferenceTone, type SarakChartZoom, SarakChat, SarakChatEngine, type SarakChatEngineProps, type SarakChatModelLoader, type SarakChatModelRoute, type SarakChatOnSend, type SarakChatProps, type SarakChatSendRequest, SarakCheckbox, type SarakCheckboxProps, SarakChecklist, type SarakChecklistItem, type SarakChecklistProps, type SarakChromeNotification, type SarakChromeWidgets, type SarakColorModePreference, type SarakColumn, type SarakColumnAlignment, type SarakColumnFooterContext, type SarakColumnLike, type SarakColumnValueOptions, type SarakComment, type SarakCommentAuthor, SarakCommentThread, type SarakCommentThreadProps, type SarakConfirmOptions, SarakContextMenu, type SarakContextMenuPosition, type SarakContextMenuProps, type SarakCsvColumn, type SarakCsvOptions, SarakCurrencyInput, type SarakCurrencyInputProps, type SarakCustomFont, type SarakCustomFontFile, SarakCustomizationPanel, SarakDataEmpty, type SarakDataEmptyProps, SarakDataGrid, type SarakDataGridProps, SarakDataTable, type SarakDataTableProps, type SarakDataTableRowHeight, type SarakDateLocale, SarakDatePicker, type SarakDatePickerProps, type SarakDatePickerValue, type SarakDatePreset, type SarakDatePresetId, type SarakDerivedThemePreset, SarakDescriptionList, type SarakDescriptionListItem, type SarakDescriptionListProps, SarakDesignScope, type SarakDesignScopeProps, type SarakDesignState, type SarakDesignToken, type SarakDesignTokens, type SarakDeviceBreakpoints, SarakDeviceProvider, type SarakDeviceProviderProps, type SarakDeviceType, SarakDivider, type SarakDividerOrientation, type SarakDividerProps, type SarakDocumentKind, SarakDrawer, type SarakDrawerProps, SarakEmptyState, type SarakEmptyStateProps, SarakExpandableCard, type SarakExpandableCardProps, SarakExpandableMatrix, type SarakExpandableMatrixProps, SarakFieldError, type SarakFieldErrorProps, type SarakFileRejection, SarakFilterBar, type SarakFilterBarProps, type SarakFilterConfig, SarakFilterSelect, type SarakFilterSelectOption, type SarakFilterSelectProps, SarakFlex, type SarakFlexDirection, type SarakFlexProps, SarakFlowEngine, type SarakFlowEngineProps, type SarakFontFallback, type SarakFontSizePreference, type SarakFontSource, type SarakFontsOption, type SarakFontsOptions, SarakForm, SarakFormGroup, type SarakFormGroupProps, type SarakFormProps, SarakFormSection, type SarakFormSectionProps, SarakGantt, type SarakGanttProps, type SarakGanttScale, type SarakGanttTask, type SarakGanttTone, SarakGrid, SarakGridItem, type SarakGridItemProps, type SarakGridProps, SarakHelpButton, SarakHidden, type SarakHiddenProps, type SarakI18nLanguage, type SarakI18nOptions, SarakIcon, SarakIconButton, type SarakIconButtonProps, type SarakIconFamily, SarakIconMap, type SarakIconName, type SarakIconPresentationProps, type SarakIconProps, type SarakIconTriple, SarakImageCard, type SarakImageCardProps, SarakInput, type SarakInputProps, SarakKanban, type SarakKanbanAssignee, type SarakKanbanCard, type SarakKanbanColumn, type SarakKanbanPriority, type SarakKanbanProps, type SarakKanbanSubtasks, type SarakLanguageState, type SarakLayoutGap, SarakLightbox, type SarakLightboxImage, type SarakLightboxProps, SarakLink, type SarakLinkProps, type SarakManagementAction, SarakManagementGrid, type SarakManagementGridProps, SarakMarkdownRenderer, type SarakMarkdownRendererProps, SarakMaskedInput, type SarakMaskedInputProps, type SarakMatrixManifest, type SarakMatrixNodeConfig, type SarakMatrixParentData, type SarakMatrixTreeNode, SarakMenuItem, type SarakMenuItemOrientation, type SarakMenuItemProps, type SarakMessage, SarakModal, type SarakModalLayoutContext, type SarakModalProps, type SarakModalSize, SarakMultiSelect, type SarakMultiSelectOption, type SarakMultiSelectProps, type SarakNavItem, type SarakNavigationItem, type SarakNavigationStylePreference, type SarakOklchColor, type SarakOverlayController, SarakOverlayProvider, type SarakOverlayRequest, SarakPDFViewer, type SarakPDFViewerProps, SarakPageHeader, type SarakPageHeaderProps, SarakPageTransition, type SarakPageTransitionProps, SarakPagination, type SarakPaginationProps, type SarakPaginationToken, type SarakPaletteInput, type SarakPaletteMode, type SarakPaletteSeeds, type SarakPaletteType, type SarakPdfSource, type SarakPinnedOffsets, type SarakPreferenceId, type SarakPreferencePosition, type SarakPreferencesHook, type SarakPreferencesOptions, SarakProgress, type SarakProgressProps, type SarakProgressThreshold, type SarakProgressVariant, SarakRadio, type SarakRadioProps, SarakRangeSlider, type SarakRangeSliderProps, type SarakRangeValue, type SarakReferenceThemeId, type SarakRegisteredIconProps, SarakResourceRow, type SarakResourceRowAction, type SarakResourceRowProps, type SarakResponsiveDevice, type SarakResponsiveValue, SarakRichText, type SarakRichTextProps, SarakScrim, type SarakScrimProps, SarakSearch, SarakSearchCard, type SarakSearchCardProps, type SarakSearchItem, type SarakSearchProps, SarakSection, type SarakSectionProps, SarakSegmentedControl, type SarakSegmentedControlProps, type SarakSegmentedOption, SarakSelect, type SarakSelectProps, SarakShellLanguageSelector, type SarakShellLanguageSelectorProps, SarakShellNav, type SarakShellNavItem, type SarakShellNavProps, SarakShellSearchWidget, type SarakShellSearchWidgetProps, SarakShellThemeToggle, type SarakShellThemeToggleProps, type SarakShellUser, SarakShellUserWidget, type SarakShellUserWidgetProps, SarakSkeleton, type SarakSkeletonProps, type SarakSkeletonShape, SarakSlider, type SarakSliderProps, SarakSocialButton, type SarakSocialButtonProps, type SarakSocialConfig, type SarakSocialProviderConfig, type SarakSocialProviderId, SarakSparkline, type SarakSparklineBaseline, type SarakSparklineProps, type SarakSparklineVariant, SarakSpinner, type SarakSpinnerProps, SarakSplitPane, type SarakSplitPaneProps, SarakSpotlight, type SarakSpotlightProps, SarakStats, type SarakStatsMetricConfig, type SarakStatsProps, type SarakStepConfig, SarakStepper, type SarakStepperOrientation, type SarakStepperProps, SarakSwitch, type SarakSwitchProps, type SarakTabItem, SarakTabPanel, type SarakTabPanelProps, SarakTable, type SarakTableColumn, type SarakTableGroupBy, type SarakTableProps, type SarakTableSort, SarakTabs, type SarakTabsProps, type SarakTabsVariant, SarakTextarea, type SarakTextareaProps, type SarakThemeCatalogEntry, type SarakThemeEntry, type SarakThemePayload, type SarakThemePreset, type SarakThemePresetId, type SarakThemeReferenceOverrides, type SarakThemeSaveOperation, type SarakThemeSwatch, SarakTimePicker, type SarakTimePickerProps, type SarakTimestamp, SarakTitleCard, type SarakTitleCardProps, type SarakToastAction, type SarakToastController, type SarakToastOptions, SarakToastProvider, type SarakToastVariant, type SarakTokenValue, type SarakTokenValueType, SarakTooltip, type SarakTooltipPosition, type SarakTooltipProps, SarakTreeView, type SarakTreeViewProps, SarakTypography, type SarakTypographyColor, type SarakTypographyProps, type SarakTypographyVariant, type SarakUIContextType, type SarakUIMode, type SarakUIOptions, SarakUIProvider, type SarakUIProviderProps, SarakUploader, type SarakUploaderProps, type SarakUserPreferences, SarakValue, type SarakValueFormat, type SarakValueProps, type SarakWeekStart, sarakAggregate, sarakBuildPaginationRange, sarakComputeOffsets, sarakCreateThemeBootCss, sarakDeriveThemeFromReference, sarakDeviceForWidth, sarakDownloadCsv, sarakFindMissingThemeAxes, sarakFormatCurrency, sarakFormatDate, sarakFormatDocument, sarakFormatNumber, sarakFormatPercent, sarakGetAllDesignTokens, sarakGetDefaultDesignState, sarakIsResponsiveValue, sarakIsSafeLinkHref, sarakIsValidCnpj, sarakIsValidCpf, sarakLoadAllThemePresets, sarakLoadReferenceThemes, sarakLoadThemePreset, sarakMoveCard, sarakPreloadThemes, sarakRegisterIcons, sarakReorder, sarakResolvePalette, sarakResolveResponsiveValue, sarakSanitizeRichText, sarakTableToCsv, sarakWarnOnIncompleteTheme, sarakWidthOf, useDesignDraft, useModalLayoutStyles, useOverlay, useSarakDevice, useSarakLanguage, useSarakPreferences, useSarakUI, useToast };
