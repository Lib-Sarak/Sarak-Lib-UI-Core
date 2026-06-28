import * as React$1 from 'react';
import React__default, { ReactNode, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type ResponsiveValue<T> = {
    desk: T;
    tab: T;
    mob: T;
};
/** Espaço de valores que um token pode assumir (espelha SarakDesignTokens). */
type SarakTokenValue = string | number | boolean | ResponsiveValue<string | number>;

interface SarakDesignTokens {
    accentColor: string;
    aiGlowColor: string;
    aiPanelBg: string;
    animEnabled: boolean;
    animFast: number;
    animInstant: number;
    animNormal: number;
    animSlow: number;
    atmosphereNoiseOpacity: number;
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
    borderRadius: number | ResponsiveValue<number>;
    borderRadiusLg: number | ResponsiveValue<number>;
    borderRadiusMd: number | ResponsiveValue<number>;
    borderRadiusSm: number | ResponsiveValue<number>;
    borderStyle: string;
    borderType: string;
    borderWidth: number;
    breakpointDesktop: number;
    breakpointTablet: number;
    btnActiveScale: number;
    btnBackdropBlur: number;
    btnBorderRadius: number | ResponsiveValue<number>;
    btnGhostHoverBg: string;
    btnHoverScale: number;
    btnNeonGlowColor: string;
    btnNeonPulseSpeed: number;
    btnPrimaryBg: string;
    btnPrimaryText: string;
    btnRadiusBL: number | ResponsiveValue<number>;
    btnRadiusBR: number | ResponsiveValue<number>;
    btnRadiusTL: number | ResponsiveValue<number>;
    btnRadiusTR: number | ResponsiveValue<number>;
    btnSecondaryBg: string;
    btnStyleType: string;
    buttonIconPosition: string;
    buttonWidthStrategy: string;
    cardActionBtnBorderRadius: number | ResponsiveValue<number>;
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
    cardBorderRadius: number | ResponsiveValue<number>;
    cardBorderRight: number;
    cardBorderTop: number;
    cardBorderWidth: number;
    cardContentAlignment: string;
    cardFooterBg: string;
    cardFooterBorder: string;
    cardGeometricCut: number;
    cardGlowColor: string;
    cardGlowIntensity: number;
    cardHeaderBg: string;
    cardHeaderBorder: string;
    cardHeaderPadding: number | ResponsiveValue<number>;
    cardHoverGlowIncrease: number;
    cardHoverStyle: string;
    cardHoverTranslate: number;
    cardImagePosition: string;
    cardInnerGlowColor: string;
    cardInnerGlowWidth: number;
    cardLayoutDirection: string;
    cardPaddingMd: number | ResponsiveValue<number>;
    cardRadiusBL: number | ResponsiveValue<number>;
    cardRadiusBR: number | ResponsiveValue<number>;
    cardRadiusTL: number | ResponsiveValue<number>;
    cardRadiusTR: number | ResponsiveValue<number>;
    cardSearchBgFocus: string;
    cardSearchBorderBeamActive: boolean;
    cardSearchPlaceholderColor: string;
    cardSearchTextFocusColor: string;
    cardShadow: string;
    cardShadowSpread: number;
    cardSpotlightOpacity: number;
    cardSurfaceOpacity: number;
    cardTextAlign: string;
    cardTextureOpacity: number;
    cardTextureType: string;
    cardTitleColor: string;
    cardTitleFontSize: number | ResponsiveValue<number>;
    cardTitleFontWeight: string;
    cardTitleIconGlow: string;
    cardTitleLetterSpacing: number;
    cardVariant: string;
    chartColorPalette: string;
    chartGridOpacity: number;
    chartShowGrid: boolean;
    chartSmoothing: boolean;
    chartThickness: number;
    chartTooltipBg: string;
    chartType: string;
    chatAnimationSpeed: number;
    chatBubbleRadius: number | ResponsiveValue<number>;
    chatBubbleStyle: string;
    chatUserBg: string;
    checkboxActiveColor: string;
    colorBgBody: string;
    colorBgLayer1: string;
    colorBgLayer2: string;
    colorBgModal: string;
    colorDepth: number;
    colorPalette: string;
    colorVariation: number;
    contentAlignment: string;
    contrastCurve: number;
    easeMain: string;
    easeOut: string;
    flowGridStyle: string;
    flowNodeRadius: number | ResponsiveValue<number>;
    focusRingWidth: number;
    formFieldDensity: string;
    formLabelPosition: string;
    formLayoutDirection: string;
    glassBlur: number;
    glassOpacity: number;
    glassRoughness: number;
    glassSaturation: number;
    glassSpecularity: number;
    globalBackgroundBlendMode: string;
    globalBackgroundBlur: number;
    globalBackgroundImageUrl: string;
    globalBackgroundOpacity: number;
    globalContrast: number;
    globalFlowAlign: string;
    globalFlowDirection: string;
    globalSaturation: number;
    globalSectionGap: number;
    h1LetterSpacing: number;
    h1LineHeight: number;
    h1Size: number | ResponsiveValue<number>;
    h1Weight: string;
    h2LineHeight: number;
    h2Size: number | ResponsiveValue<number>;
    h2Weight: string;
    headerAlignment: string;
    headingFont: string;
    headingTransform: string;
    iconFamily: string;
    iconStrokeWidth: number;
    iconWeight: string;
    identityAlignment: string;
    identityFontFamily: string;
    identityFontWeight: number;
    identityHoverEffect: string;
    identityPadding: number;
    identityRedirectUrl: string;
    identityTracking: number;
    imageCardHoverZoom: number;
    imageCardOverlayOpacity: number;
    industrialRegistry: boolean;
    inputBackdropBlur: number;
    inputBg: string;
    inputBorderColor: string;
    inputBorderRadius: number | ResponsiveValue<number>;
    inputBorderType: string;
    inputErrorColor: string;
    inputFocusBorderColor: string;
    inputIconColor: string;
    inputIconPosition: string;
    inputPadding: number;
    inputShadow: string;
    inputSuccessColor: string;
    inputTextColor: string;
    isAutoHideEnabled: boolean;
    isNavHidden: boolean;
    isSplitViewEnabled: boolean;
    layerBackdropBlur: number;
    layerBackdropOpacity: number;
    layeredShadows: number;
    layerElevationFactor: number;
    layout: string;
    layoutDensity: string;
    layoutGap: number | ResponsiveValue<number>;
    layoutGapLg: number | ResponsiveValue<number>;
    layoutGapMd: number | ResponsiveValue<number>;
    layoutGapSm: number | ResponsiveValue<number>;
    layoutGridTemplate: string;
    layoutPadding: number | ResponsiveValue<number>;
    matrixBlur: number;
    matrixBorderColor: string;
    matrixGap: number;
    matrixItemBg: string;
    matrixRadius: number;
    matrixSearchBg: string;
    maxContentWidth: string;
    modalActionAlignment: string;
    modalBorderRadius: number | ResponsiveValue<number>;
    modalHeaderStyle: string;
    modalOverlayBlur: number;
    modalOverlayColor: string;
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
    navActiveMarkerColor: string;
    navActiveMarkerGlow: number;
    navbarLayout: string;
    navigationStyle: string;
    navItemActiveColor: string;
    noiseIntensity: number;
    pageTransitionType: string;
    primaryColor: string;
    reducedMotion: boolean;
    scrollbarThumbColor: string;
    scrollbarWidth: number | ResponsiveValue<number>;
    scrollPadding: number | ResponsiveValue<number>;
    scrollRadius: number | ResponsiveValue<number>;
    scrollThumbColor: string;
    scrollThumbHoverOpacity: number;
    scrollThumbOpacity: number;
    scrollTrackOpacity: number;
    scrollWidth: number | ResponsiveValue<number>;
    searchPositionSidebar: string;
    searchPositionTopbar: string;
    secondaryColor: string;
    securityPulseSpeed: number;
    securityShieldGlow: number;
    shadowAmbientAlpha: number;
    shadowColorMode: string;
    shadowIntensity: number;
    shadowOrientation: string;
    shadowProjectionAlpha: number;
    shadowProjectionBlur: number;
    sidebarActiveColor: string;
    sidebarBlur: number;
    sidebarColor: string;
    sidebarHoverColor: string;
    sidebarMaxWidth: number | ResponsiveValue<number>;
    sidebarMinWidth: number | ResponsiveValue<number>;
    sidebarNoiseOpacity: number;
    sidebarPosition: string;
    sidebarShadow: string;
    sidebarWidth: number | ResponsiveValue<number>;
    statusErrorColor: string;
    statusInfoColor: string;
    statusSuccessColor: string;
    statusWarningColor: string;
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
    tabGap: number | ResponsiveValue<number>;
    tableActionPosition: string;
    tableBorderColor: string;
    tableBorderRadius: number;
    tableCellPadding: number | ResponsiveValue<number>;
    tableDensity: string;
    tableHeaderBg: string;
    tableRowHoverBg: string;
    tableZebraStriping: boolean;
    tabSectionMargin: number | ResponsiveValue<number>;
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
    tooltipBg: string;
    tooltipRadius: number;
    topbarActiveColor: string;
    topbarColor: string;
    topbarHeight: number | ResponsiveValue<number>;
    topbarHoverColor: string;
    topbarNoiseOpacity: number;
    topbarTitleColor: string;
    vignetteOpacity: number;
    vignetteSoftness: number;
    zIndexBase: number;
    zIndexModal: number;
    zIndexSidebar: number;
    zIndexToast: number;
    zIndexTooltip: number;
}

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
    emojiSet?: string;
    primaryColor?: string;
    secondaryColor?: string;
    flowGridStyle?: string;
    flowNodeRadius?: number;
    chatBubbleStyle?: string;
    chatAnimationSpeed?: number;
    chartType?: string;
    chartShowGrid?: boolean;
    cardHoverStyle?: 'lift' | 'expand' | 'glow' | 'glow-only' | 'none';
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
    globalBackgroundBlendMode?: string;
    moduleBlacklist?: string;
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
interface SarakUIOptions {
    token?: string;
    endpoints?: {
        baseUrl?: string;
        designPath?: string;
        discoveryPath?: string;
        discovery?: string[];
        branding?: string;
    };
    manifest?: {
        brand?: {
            name?: string;
            logoUrl?: string;
        };
        [key: string]: unknown;
    };
    persistence?: {
        strategy?: 'local' | 'remote' | 'hybrid';
        storageKey?: string;
        onSave?: (design: SarakThemePayload) => Promise<void> | void;
        onLoad?: () => Promise<SarakThemePayload> | SarakThemePayload;
        strictBackendSync?: boolean;
    };
    theme?: {
        defaultTheme?: string;
        defaultModuleId?: string;
        extraTokens?: Record<string, unknown>;
    };
}
interface SarakUIContextType {
    discoveryEndpoints: string[];
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
    registeredModules: unknown[];
    layouts: unknown[];
    isHydrated: boolean;
    options: SarakUIOptions;
    allThemes: unknown[];
    token?: string | null;
    branding?: {
        companyName: string;
        loginName: string;
        tabName: string;
        logoBase64: string | null;
    };
    updateBranding?: (partial: Record<string, unknown>) => Promise<void>;
    onMediaUpload?: (file: File) => Promise<string>;
}
interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: SarakThemePayload;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
    customThemes?: unknown[];
    activeThemeId?: string;
    onMediaUpload?: (file: File) => Promise<string>;
}

/**
 * SOVEREIGN DESIGN MANIFEST (v10.1)
 *
 * O Manifesto é a única fonte de verdade para como os tokens de design
 * são mapeados para variáveis CSS, Atributos de DOM e Classes.
 */
declare const DESIGN_MANIFEST: Record<string, {
    vars?: string[];
    unit?: string;
    transform?: (v: any) => any;
    attr?: string;
    classPrefix?: string;
}>;

declare const useSarakUI: () => SarakUIContextType & SarakThemePayload;
/**
 * SarakUIProvider Orchestrator (v10.1)
 *
 * Este é o ponto de entrada principal da biblioteca Sarak UI.
 * Ele orquestra o estado do design, a descoberta de módulos e a injeção de estilos.
 */
declare const SarakUIProvider: React__default.FC<SarakUIProviderProps>;

interface DesignScopeProps {
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
declare const DesignScope: React__default.FC<DesignScopeProps & Record<string, unknown>>;

declare const ThemeToggle: React__default.FC;

/** Identidade do usuário exibida no Shell (vinda do app consumidor). */
interface ShellUser {
    username?: string;
    email?: string;
    level?: number;
    [key: string]: unknown;
}
interface SarakShellProps {
    children?: React__default.ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: React__default.ReactNode;
    user?: ShellUser;
    logout?: () => void;
    token?: string;
    authApi?: unknown;
}

/**
 * Sarak Shell Core — Interface Engine (Refactored v7.2.5)
 */
declare const SarakShell: React__default.FC<SarakShellProps>;

type DeviceType = 'smartphone' | 'tablet' | 'desktop';
declare const useSarakDevice: () => DeviceType;
interface DeviceProviderProps {
    children: ReactNode;
    /** Se fornecido, sequestra o valor (usado pelo Gêmeo Digital) */
    overrideDevice?: DeviceType;
}
declare const DeviceProvider: React__default.FC<DeviceProviderProps>;

interface SarakAnalyticalPageProps {
    navBar?: ReactNode;
    mainContent: ReactNode;
    sidePanel?: ReactNode;
    /** Se true, o painel lateral abre como um modal/drawer por cima no mobile. Se false, fica empilhado. Default: true */
    sidePanelAsDrawerOnMobile?: boolean;
    /** Se true, centraliza horizontalmente e verticalmente o mainContent no Desktop para preencher vazios. */
    centeredOnDesktop?: boolean;
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
    on: DeviceType | DeviceType[];
}
/**
 * SarakHidden
 *
 * Componente utilitário que não renderiza o conteúdo dependendo do dispositivo.
 * Isso evita poluição do DOM e uso de RAM em dispositivos que não exibirão o componente.
 */
declare const SarakHidden: React__default.FC<SarakHiddenProps>;

type IconName = 'AlertCircle' | 'Check' | 'X' | 'Menu' | 'Search' | 'Bell' | 'User' | 'LogOut' | 'Shield' | 'Globe' | 'ChevronDown' | 'ChevronLeft' | 'ChevronRight' | 'Zap' | 'LayoutDashboard' | 'Save' | 'Settings' | 'BarChart3' | 'Layout' | 'FileText' | 'MessageSquare' | 'History' | 'Network' | 'Box' | 'Type' | 'Lock' | 'Layers' | 'Grid' | 'AlignLeft' | 'LineChart' | 'Hash' | 'Copy' | 'RefreshCw' | 'Edit3' | 'CornerDownRight' | 'Activity' | 'Users' | 'ArrowRight' | 'FileSpreadsheet' | 'Download' | 'ArrowUpDown' | 'Database' | 'List' | 'CheckCircle2' | 'Loader2' | 'Calendar' | 'Trash2' | 'Plus' | 'UploadCloud' | 'MoreVertical' | 'Image' | 'File' | 'Edit' | 'Eye' | 'UserPlus';

declare const IconMap: Record<IconName, {
    lucide: React__default.ElementType;
    phosphor: React__default.ElementType;
    tabler: React__default.ElementType;
}>;

interface SarakIconProps {
    name: IconName | string;
    size?: number | string;
    className?: string;
    color?: string;
    style?: React__default.CSSProperties;
    onClick?: () => void;
}
declare const SarakIcon: React__default.FC<SarakIconProps>;

/**
 * useDesignDraft (v12.1 - Data-Driven)
 * Orquestrador de rascunhos com isolamento de sandbox.
 */
declare const useDesignDraft: (sarak: SarakUIContextType) => {
    draft: SarakDesignState;
    isDirty: boolean;
    isComponentDirty: (schemaId: string) => boolean;
    updateDraft: (key: string, value: SarakTokenValue) => void;
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (tokenId: string) => void;
    handleThemePreview: (presetDesign: Partial<SarakDesignState>, presetKeyId?: string) => void;
    handleApplyToSystem: () => void;
    handleApplyComponent: (schemaId: string) => void;
    toast: {
        type: "success" | "warning";
        message: string;
    } | null;
    showToast: (type: "success" | "warning", message: string) => void;
};

/**
 * CustomizationPanel (v6.0)
 * Central de Comando Unificada - Foco 100% em Soberania e Gêmeo Digital.
 */
declare const CustomizationPanel: React__default.FC;

interface SocialButtonProps {
    provider: 'google' | 'github';
    variant: 'glass' | 'sovereign';
    onClick?: (provider: 'google' | 'github') => void;
    label?: string;
    hideLabel?: boolean;
    className?: string;
}
declare const SocialButton: React__default.FC<SocialButtonProps>;

interface ExpandableCardProps {
    title: string;
    iconContent?: React__default.ReactNode;
    helpButton?: React__default.ReactNode;
    children: React__default.ReactNode;
    className?: string;
    contentClassName?: string;
    baseHeight?: number;
}
declare const ExpandableCard: React__default.FC<ExpandableCardProps>;

interface UserPayload {
    email?: string;
    [key: string]: unknown;
}
interface ModuleConfig {
    id: string;
    label: string;
    [key: string]: unknown;
}
interface LanguageOption {
    id: string;
    label: string;
}
declare const LanguageSelector: () => react_jsx_runtime.JSX.Element;
declare const UserMenu: ({ user, onPasswordModal, onLogout }: {
    user: UserPayload | null;
    onPasswordModal: () => void;
    onLogout: () => void;
}) => react_jsx_runtime.JSX.Element;
declare const ModuleSelector: ({ currentModule, setCurrentModule, modules }: {
    currentModule: string;
    setCurrentModule: (id: string) => void;
    modules: ModuleConfig[];
}) => react_jsx_runtime.JSX.Element;

/** Par ordenado [início, fim] de um intervalo contínuo. */
type RangeValue = [number, number];
interface SarakRangeSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    /** Controlado: par [início, fim]. */
    value?: RangeValue;
    /** Não-controlado: valor inicial. */
    defaultValue?: RangeValue;
    disabled?: boolean;
    error?: string;
    /** Esconde as tooltips de valor sobre os thumbs. */
    hideTooltips?: boolean;
    /** Recebe o novo par já clampado/ordenado (Spec 32: `onChange(value)`). */
    onChange?: (value: RangeValue) => void;
}
/**
 * Componente Atômico: SarakRangeSlider (Spec 11, Regra 5)
 * Slider duplo (início/fim) para intervalos contínuos, com tooltips de valor.
 * Dois `<input type="range">` sobrepostos preservam a navegação por teclado nativa;
 * o trilho colorido entre os thumbs reflete os tokens do Design Engine.
 */
declare const SarakRangeSlider: React__default.FC<SarakRangeSliderProps>;

interface MultiSelectOption {
    value: string;
    label: string;
}
interface SarakMultiSelectProps {
    label?: string;
    options: MultiSelectOption[];
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
type Accept = Record<string, string[]>;
interface FileRejection {
    file: File;
    errors: Array<{
        code: string;
        message: string;
    }>;
}
interface SarakUploaderProps {
    label?: string;
    /** Tipos aceitos no formato do react-dropzone (ex.: `{ 'image/*': [] }`). */
    accept?: Accept;
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
    onReject?: (rejections: FileRejection[]) => void;
}
/**
 * Componente Atômico: SarakUploader (Spec 11, Regra 3)
 * Área drag-and-drop acessível sobre `react-dropzone` (peerDependency). Os estados
 * (ocioso, arrastando, rejeitado, erro de tamanho) mudam a borda para os tokens de
 * cor semânticos — `--sx-color-primary` ao arrastar, `--sx-color-danger` ao rejeitar.
 */
declare const SarakUploader: React__default.FC<SarakUploaderProps>;

type WeekStart = 0 | 1;

/**
 * Locale do `date-fns` passado adiante para `format`. Tipado de forma estrutural
 * (objeto opaco) porque o tipo nomeado `Locale` não resolve sob
 * `moduleResolution: node` — os locales reais (`ptBR`, etc.) são objetos atribuíveis.
 */
type DateLocale = object;

/** Valor: string ISO (single) ou par [início, fim] de ISOs (range). */
type DatePickerValue = string | [string, string];
interface SarakDatePickerProps {
    label?: string;
    mode?: 'single' | 'range';
    value?: DatePickerValue;
    /** Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. */
    displayFormat?: string;
    /** Locale do `date-fns` para nomes de mês/dia (i18n). */
    locale?: DateLocale;
    weekStartsOn?: WeekStart;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). */
    onChange?: (value: DatePickerValue) => void;
}
/**
 * Componente Atômico: SarakDatePicker (Spec 11, Regra 1)
 * Calendário popover in-house sobre `date-fns`. Suporta seleção única e de intervalo
 * na mesma interface, formatos i18n configuráveis e navegação por teclado (setas).
 */
declare const SarakDatePicker: React__default.FC<SarakDatePickerProps>;

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
declare const sanitizeRichText: (html: string) => string;
interface SarakRichTextProps {
    /** Conteúdo HTML controlado (fiado pelo `model` no manifesto). */
    value?: string;
    /** Conteúdo inicial não-controlado. */
    defaultValue?: string;
    /** Emite o HTML JÁ sanitizado a cada mudança. */
    onChange?: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}
declare const SarakRichText: React__default.FC<SarakRichTextProps>;

interface SarakTableProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    endpoint: string;
    data?: TData[];
    label?: string;
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakTable Genérica (v6.0)
 *
 * Um componente agnóstico que renderiza qualquer conjunto de dados tabular
 * baseado em um contrato visual enviado pelo manifesto do módulo.
 */
declare const SarakTable: <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, data: initialData, label, mapping, role, density }: SarakTableProps<TData>) => react_jsx_runtime.JSX.Element;

interface FilterConfig {
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
interface SarakCardGridProps {
    endpoint: string;
    label?: string;
    mapping?: {
        title: string;
        subtitle?: string;
        description?: string;
        badge?: string;
        tags?: string;
        icon?: string;
        color?: string;
        price_in?: string;
        price_out?: string;
        context?: string;
    };
    filters?: FilterConfig[];
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    variant?: 'classic' | 'title' | 'action' | 'search';
}
/**
 * SarakCardGrid Core (v6.4)
 *
 * Renderiza um grid de cartões de alta fidelidade com suporte a metadados
 * técnicos complexos e FILTROS DINÂMICOS declarados via manifesto.
 */
declare const SarakCardGrid: <TData extends Record<string, unknown>>({ endpoint, label, mapping, filters, variant }: SarakCardGridProps) => react_jsx_runtime.JSX.Element;

interface SarakStatsProps<TData extends Record<string, unknown>> {
    endpoint?: string;
    data?: TData;
    label?: string;
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakStats Genérico (v6.0)
 *
 * Exibe contadores e métricas-chave de forma elegante, servindo como
 * um mini-dashboard dinâmico para qualquer módulo.
 */
declare const SarakStats: <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, data, label, mapping }: SarakStatsProps<TData>) => react_jsx_runtime.JSX.Element | null;

interface SarakChartProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakChart Genérico (v6.2)
 *
 * Renderiza tendências de dados usando uma interface visual de alta fidelidade
 * com barras animadas em CSS/SVG, mantendo o padrão Glassmorphism.
 */
declare const SarakChart: React__default.FC<SarakChartProps>;

interface SarakFormProps<TData extends Record<string, unknown>> {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>;
    mode?: 'create' | 'edit';
    initialData?: TData;
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
    }>;
    onSuccess?: () => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakForm Genérico (v6.2)
 *
 * Gera formulários de configuração dinamicamente baseados no manifesto.
 * Idela para abas de "Preferências" e "Configurações" de módulos.
 */
declare const SarakForm: <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, label, mapping, actions, mode, initialData, onSuccess, role, density, importance }: SarakFormProps<TData>) => react_jsx_runtime.JSX.Element;

interface SarakManagementGridProps<TItem extends Record<string, unknown>> {
    endpoint: string;
    groupBy: string;
    ghostGroups?: string[];
    mapping: {
        id: string;
        title: string;
        status: string;
        isActive: string;
        description?: string;
        error?: string;
    };
    headerActions?: {
        label: string;
        action: string;
    }[];
    groupActions?: {
        label: string;
        icon?: 'plus' | 'settings';
        action: string;
    }[];
    formMapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
declare const SarakManagementGrid: <TItem extends Record<string, unknown> = Record<string, unknown>>({ endpoint, groupBy, ghostGroups, mapping, headerActions, groupActions, formMapping }: SarakManagementGridProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakChatProps {
    endpoint: string;
    modelsEndpoint?: string;
    label?: string;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
declare const SarakChat: React__default.FC<SarakChatProps>;

interface SarakSecurityOrchestratorProps {
    endpoint: string;
    label?: string;
    config?: Record<string, unknown>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakSecurityOrchestrator (v7.5)
 *
 * Componente especializado em fluxos de soberania de segurança.
 * Gerencia o ciclo de vida do MFA: Status, Setup e Ativação.
 */
declare const SarakSecurityOrchestrator: React__default.FC<SarakSecurityOrchestratorProps>;

interface SarakAuthScreenProps {
    branding?: {
        name: string;
        logo?: string;
    };
    isRegistering: boolean;
    setIsRegistering: (val: boolean) => void;
    mfaStep: boolean;
    setMfaStep: (val: boolean) => void;
    username: string;
    setUsername: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    error?: string;
    isPending?: boolean;
    onSubmit: (e: React__default.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{
            id: string;
            variant: 'glass' | 'sovereign';
        }>;
    };
    onForgot?: () => void;
    onMasterLogin?: () => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakAuthScreen (Industrial Template v9.5)
 *
 * Template soberano para fluxos de autenticação.
 * Mantenha a fidelidade visual absoluta aos tokens de design.
 */
declare const SarakAuthScreen: React__default.FC<SarakAuthScreenProps>;

interface CatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: unknown;
}
interface SarakCatalogGridProps {
    items: CatalogItem[];
    loading?: boolean;
    title: string;
    subtitle?: string;
    categories?: Record<string, string>;
    onSync?: () => void;
    renderCard?: (item: CatalogItem) => React__default.ReactNode;
    emptyMessage?: string;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
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

interface MatrixTreeNode {
    id: string;
    name?: string;
    description?: string;
    /** Discriminador opcional para o mapeamento `manifest.types`. */
    type?: string;
    children?: MatrixTreeNode[];
    /** Carregamento assíncrono em andamento — renderiza o `lazyLoadingIcon`. */
    loading?: boolean;
}

interface MatrixNodeConfig<TNode = MatrixTreeNode> {
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
    levels?: Record<number, MatrixNodeConfig<MatrixTreeNode>>;
    /** Mapeamento dinâmico pelo atributo `node.type` */
    types?: Record<string, MatrixNodeConfig<MatrixTreeNode>>;
    /** Configurações fallback padrão */
    default?: MatrixNodeConfig<MatrixTreeNode>;
}
interface MatrixParentData {
    id: string;
    name?: string;
    description?: string;
    [key: string]: unknown;
}
interface SarakExpandableMatrixProps<TData extends MatrixParentData> {
    /** Itens principais (ex: Roles/Papéis) */
    data: TData[];
    /** Todos os sub-itens possíveis (ex: Todas as Permissões) */
    subItems: MatrixTreeNode[];
    /** Função para checar se um sub-item está ativo em um item pai */
    activeMapping: (parentId: string, subItemId: string) => boolean;
    /** Callback disparado ao clicar no toggle */
    onToggle: (parentId: string, subItemId: string) => void;
    /** Renderizador customizado para o cabeçalho de cada item pai */
    renderItemHeader?: (item: TData) => React__default.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}
declare const SarakExpandableMatrix: <TData extends MatrixParentData>({ data, subItems, activeMapping, onToggle, renderItemHeader, manifest }: SarakExpandableMatrixProps<TData>) => react_jsx_runtime.JSX.Element;

interface SarakModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React__default.ReactNode;
    children?: React__default.ReactNode;
    footer?: React__default.ReactNode;
    /**
     * Sub-wizard multi-step (Spec 13, Regra 2): cada passo é renderizado isolado dentro
     * do overlay, com navegação "Voltar/Avançar" contida no rodapé. Tem precedência
     * sobre `children`. No último passo, "Avançar" é substituído por `onComplete`.
     */
    steps?: React__default.ReactNode[];
    /** Chamado ao avançar além do último passo (conclusão do wizard). */
    onComplete?: () => void;
    /** Se true, o clique no overlay (fundo) não fecha o modal */
    disableOverlayClick?: boolean;
    /** Se true, o botão de fechar não é renderizado */
    hideCloseButton?: boolean;
    /** Classe CSS customizada para o contêiner do modal */
    className?: string;
}
declare const SarakModal: React__default.FC<SarakModalProps>;

interface SarakDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    children: React__default.ReactNode;
    size?: string | number;
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
 * O controller (`open`/`close`) casa estruturalmente com o `OverlayController` do
 * Dispatcher — sem import cruzado core↔components (evita ciclo).
 *
 * Conteúdo nesta onda: `title` + `message` (texto). Conteúdo rico como nó de manifesto
 * é refinamento posterior (Spec 30/33).
 */

interface SarakOverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: string;
}
/** Casa estruturalmente com o `OverlayController` do Dispatcher (Spec 25), sem import cruzado. */
interface SarakOverlayController {
    open(request: SarakOverlayRequest): void;
    close(): void;
}
declare const SarakOverlayProvider: React__default.FC<{
    children: React__default.ReactNode;
}>;
/** Acessa o controller de overlays; no-op fora do Provider (degrada sem quebrar). */
declare const useOverlay: () => SarakOverlayController;

interface ModalLayoutContext {
    headerClass: string;
    footerClass: string;
    closeButtonClass: string;
}
/**
 * Hook Controlador Estrutural (Camada 6) - Modals
 */
declare const useModalLayoutStyles: (design: SarakThemePayload) => ModalLayoutContext;

interface SarakEmptyStateProps {
    type?: 'minimal' | 'abstract' | 'geometric';
}
declare const SarakEmptyState: React__default.FC<SarakEmptyStateProps>;

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
type BadgeSize = 'sm' | 'md' | 'lg';
interface SarakBadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Se true, o badge terá bordas mais arredondadas (estilo pill) */
    pill?: boolean;
    /** Se true, o fundo será translúcido/suave em vez de sólido */
    soft?: boolean;
}
declare const SarakBadge: React__default.FC<SarakBadgeProps>;

/**
 * SarakSkeleton — placeholder de carregamento (Spec 13, Regra 3 + Spec 31, Regra 2)
 *
 * Assume FORMAS declaradas (`shape`): `text` (barras finas), `circle` (avatar) e `rect`
 * (bloco). Mantém o uso original como estado `loading` da Fonte de Dados (linhas-fantasma)
 * por padrão. Zero Hardcode: cores/raio via `var(--sx-*)`; pulso via `animate-pulse`.
 */

/** Forma do esqueleto. */
type SkeletonShape = 'text' | 'circle' | 'rect';
interface SarakSkeletonProps {
    /** Forma do placeholder (default: `text`). */
    shape?: SkeletonShape;
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

/**
 * SarakDataEmpty — placeholder MÍNIMO de "sem dados" (puxado sob demanda)
 *
 * ⚠️ MÍNIMO: estado `empty` da Fonte de Dados (Spec 31, Regra 2). Mensagem neutra e
 * tokenizada — distinto do `SarakEmptyState` (peça de branding de viewport vazio).
 * A UX completa de Empty States chega na Spec 13.
 */

interface SarakDataEmptyProps {
    /** Mensagem exibida (default: "Nenhum dado encontrado."). */
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
 * Cada toast desmonta sozinho após `duration` ms (Plano de Testes: mount/unmount por
 * timeout). A pilha empilha com espaçamento e anima a entrada via transição CSS.
 *
 * Zero Any: o controller é tipado; a fronteira não usa `any`.
 */

/** Variantes semânticas, mapeadas 1:1 ao Status Schema. */
type ToastVariant = 'success' | 'error' | 'warning' | 'info';
/** Opções de um disparo de toast (interface estável consumida pelo Dispatcher). */
interface ToastOptions {
    /** Texto exibido. */
    message: string;
    /** Variante semântica (default: `info`). */
    variant?: ToastVariant;
    /** Duração até o auto-dismiss em ms (default: 3000). */
    duration?: number;
}
/** Controller público do sistema de toasts. */
interface ToastController {
    /** Empilha um toast; devolve seu id (para dismiss manual). */
    notify(options: ToastOptions): string;
    /** Remove um toast pelo id. */
    dismiss(id: string): void;
}
/**
 * Provider do sistema de toasts. Renderiza a pilha num portal no `body` (z-index alto,
 * estável) e gerencia o ciclo de auto-dismiss. Envolva a app (ou o Renderer) com ele.
 */
declare const SarakToastProvider: React__default.FC<{
    children: React__default.ReactNode;
}>;
/**
 * Acessa o controller de toasts. Fora de um `SarakToastProvider`, devolve um
 * controller no-op (loga um aviso) para que o Dispatcher degrade sem quebrar a árvore.
 */
declare const useToast: () => ToastController;

interface SarakTabItem {
    id: string;
    label: React__default.ReactNode;
    icon?: React__default.ReactNode;
    disabled?: boolean;
}
interface SarakTabsProps$1 {
    tabs: SarakTabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    /** Estilo de exibição das abas */
    variant?: 'pills' | 'underlined' | 'enclosed';
    /** Preencher a largura toda? */
    fullWidth?: boolean;
    className?: string;
    listClassName?: string;
}
declare const SarakTabs: React__default.FC<SarakTabsProps$1>;

/**
 * SarakTooltip (Spec 13 — Regra 4)
 *
 * Balão flutuante que NÃO é cortado pelo `overflow:hidden` de containers ancestrais:
 * o conteúdo é renderizado num portal no `body` e posicionado em `position: fixed` a
 * partir do retângulo do gatilho. Inclui edge detection — se a posição preferida sair
 * da viewport, é espelhada (flip) e/ou deslocada para dentro.
 *
 * Zero Hardcode nas cores (tokens `--theme-*`).
 */

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface SarakTooltipProps {
    children: React__default.ReactNode;
    content: React__default.ReactNode;
    position?: TooltipPosition;
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

interface ContextMenuPosition {
    x: number;
    y: number;
}
interface SarakContextMenuProps {
    /** Controla a visibilidade. */
    isOpen: boolean;
    /** Coordenada (viewport) onde abrir — normalmente `{ x: e.clientX, y: e.clientY }`. */
    position: ContextMenuPosition;
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
 * `renderRow`. Zero Hardcode: dimensões/efeitos via tokens `var(--sx-*)`.
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
 * Lista virtualizada vertical. Só as linhas dentro da viewport (+ overscan) são
 * montadas no DOM, mantendo a contagem de nós baixa independentemente de `count`.
 */
declare const SarakDataGridImpl: React__default.FC<SarakDataGridProps>;

/**
 * SarakDataGrid — barrel + carregamento preguiçoso (Spec 12, base da Onda 1).
 *
 * `SarakDataGrid` é um `React.lazy`: a dependência de virtualização
 * (`@tanstack/react-virtual`) só é baixada quando um grid é realmente renderizado
 * — telas sem listas grandes pagam custo zero. Sempre renderize sob `<Suspense>`.
 *
 * `SarakDataGridImpl`/`SarakDataGridProps` são exportados para teste direto (sem
 * a fronteira de Suspense).
 */
declare const SarakDataGrid: React$1.LazyExoticComponent<React$1.FC<SarakDataGridProps>>;

/**
 * Modelo de colunas do SarakDataTable (Spec 12, Regra 2 · Onda 9).
 *
 * Lógica pura (sem React/DOM) de ordenação, largura e deslocamento das colunas
 * congeladas (pinned). Mantém o componente visual enxuto e testável de forma isolada.
 */

interface SarakColumn<T> {
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
    /** Render da célula; ausente = `String(row[id])`. */
    render?: (row: T, rowIndex: number) => React__default.ReactNode;
}
declare const DEFAULT_COLUMN_WIDTH = 160;
declare const MIN_COLUMN_WIDTH = 60;
/** Resolve a largura efetiva da coluna a partir do estado controlado + default. */
declare const widthOf: <T>(column: SarakColumn<T>, widths: Record<string, number>) => number;
/** Reordena `order` movendo `fromId` para a posição de `toId` (imutável). */
declare const reorder: (order: string[], fromId: string, toId: string) => string[];
interface PinnedOffsets {
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
declare const computeOffsets: <T>(ordered: Array<SarakColumn<T>>, widths: Record<string, number>) => PinnedOffsets;

interface SarakDataTableProps<T = Record<string, unknown>> {
    /** Definição declarativa das colunas (ordem inicial = ordem do array). */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. */
    rows: T[];
    /** Altura de cada linha em px (default: 44). */
    rowHeight?: number;
    /** Altura do cabeçalho em px (default: 44). */
    headerHeight?: number;
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Linhas extra montadas fora da viewport (default: 8). */
    overscan?: number;
    /** Chave estável da linha (default: índice). */
    getRowKey?: (row: T, index: number) => React__default.Key;
    /** Notifica nova largura ao soltar o handle de resize. */
    onColumnResize?: (columnId: string, width: number) => void;
    /** Notifica reordenação (origem → destino) ao soltar o drag do cabeçalho. */
    onColumnReorder?: (fromId: string, toId: string) => void;
    className?: string;
}
declare function SarakDataTableImpl<T>({ columns, rows, rowHeight, headerHeight, height, overscan, getRowKey, onColumnResize, onColumnReorder, className, }: SarakDataTableProps<T>): react_jsx_runtime.JSX.Element;

/**
 * SarakDataTable — barrel + carregamento preguiçoso (Spec 12, Regra 2 · Onda 9).
 *
 * Componente pesado: a virtualização (`@tanstack/react-virtual`) só é baixada quando
 * uma tabela colunar é realmente renderizada. Sempre renderize sob `<Suspense>`.
 * `SarakDataTableImpl`/tipos são exportados para teste direto (sem a fronteira de Suspense).
 */
declare const SarakDataTable: React$1.LazyExoticComponent<typeof SarakDataTableImpl>;

/**
 * SarakSparkline — micro-gráfico sem eixos (Spec 12, Regra 4 · Onda 9)
 *
 * Visualização minimalista (linha/área/barra) que cabe no espaço confinado de um
 * `<SarakCard>` (Critério de Aceite 5). In-house em SVG puro: **zero dependência
 * nova** (as Ondas 7–9 não adicionam libs). Zero Hardcode: a cor da série herda dos
 * tokens globais — `--sarak-chart-primary` (Spec 12 / schema `data.ts`) com cascata
 * para `--sx-color-primary-base`. O traço usa `vector-effect: non-scaling-stroke`
 * para permanecer nítido mesmo quando o SVG é esticado na largura do contêiner.
 */

type SparklineVariant = 'line' | 'area' | 'bar';
interface SarakSparklineProps {
    /** Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. */
    data: number[];
    /** Forma do micro-gráfico (default: 'line'). */
    variant?: SparklineVariant;
    /** Altura em px do desenho (default: 40). A largura preenche o contêiner. */
    height?: number;
    /** Espessura do traço (line/area) em px (default: 2). */
    strokeWidth?: number;
    /** Opacidade do preenchimento da área (default: 0.15). */
    fillOpacity?: number;
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
 * nova; Zero Hardcode (estilos herdados dos átomos via tokens `var(--sx-*)`).
 */

interface SarakTreeViewProps {
    /** Floresta de nós; cada nó pode ter `children` (N níveis) e `loading`. */
    data: MatrixTreeNode[];
    /** Manifesto de layout por nível/tipo (default: variante limpa por profundidade). */
    manifest?: SarakMatrixManifest;
    /** Indicador exibido sob nós com `loading: true` (default: spinner tokenizado). */
    lazyLoadingIcon?: React__default.ReactNode;
    /** Disparado ao expandir/colapsar um nó — ponto de gancho para fetch assíncrono. */
    onExpand?: (node: MatrixTreeNode, expanded: boolean) => void;
    /** IDs selecionados (habilita o toggle por nó quando combinado com `onSelect`). */
    selectedIds?: string[];
    /** Disparado ao alternar a seleção de um nó. */
    onSelect?: (nodeId: string) => void;
    className?: string;
}
declare const SarakTreeView: React__default.FC<SarakTreeViewProps>;

/**
 * Modelo de dados do SarakKanban (Spec 12, Regra 3 · Onda 10).
 *
 * Lógica pura (sem React/DOM) de movimentação de cards entre colunas — testável de forma
 * isolada e reusada pelo componente no `drop`.
 */
interface KanbanCard {
    id: string;
    title?: string;
    description?: string;
}
interface KanbanColumn<C extends KanbanCard = KanbanCard> {
    id: string;
    title: string;
    cards: C[];
}
interface CardMove {
    cardId: string;
    fromColumn: string;
    toColumn: string;
    /** Índice de destino dentro da coluna alvo. */
    toIndex: number;
}
/**
 * Move `cardId` de `fromColumn` para `toColumn` na posição `toIndex` (imutável).
 * Devolve as colunas inalteradas se o card/coluna não existirem.
 */
declare const moveCard: <C extends KanbanCard>(columns: Array<KanbanColumn<C>>, cardId: string, fromColumn: string, toColumn: string, toIndex: number) => Array<KanbanColumn<C>>;

interface SarakKanbanProps<C extends KanbanCard = KanbanCard> {
    /** Colunas e seus cards (a ordem do array é a ordem visual). */
    columns: Array<KanbanColumn<C>>;
    /** Disparado ao soltar um card numa coluna (origem → destino). */
    onCardMove?: (move: CardMove) => void;
    /** Render customizado do card (default: título + descrição). */
    renderCard?: (card: C, columnId: string) => React__default.ReactNode;
    className?: string;
}
declare function SarakKanbanImpl<C extends KanbanCard>({ columns, onCardMove, renderCard, className, }: SarakKanbanProps<C>): react_jsx_runtime.JSX.Element;

/**
 * SarakMarkdownRenderer (Spec 15, Regra 1) — implementação pesada (lazy).
 *
 * Ingere Markdown cru e o renderiza como elementos estilizados pelos tokens Sarak
 * (`var(--sx-*)`), com highlight de código atrelado ao modo (dark/light) do tema.
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

interface LightboxImage {
    src: string;
    alt?: string;
}
interface SarakLightboxProps {
    /** Mídias da galeria, na ordem de exibição. */
    images: LightboxImage[];
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
type PdfSource = string | Uint8Array | ArrayBuffer;

/**
 * SarakPDFViewer (Spec 15, Regra 2) — implementação pesada (lazy).
 *
 * Desenha as páginas do PDF em `<canvas>` via `pdfjs-dist` (peer), sem depender do
 * visualizador nativo bloqueado do navegador. O parse roda num Web Worker (fora da main
 * thread) — `GlobalWorkerOptions.workerSrc` é configurável pela prop `workerSrc`. A barra
 * de controles (zoom/página/download) é 100% estilizada por tokens (`var(--sx-*)`).
 *
 * A dependência pesada (`pdfjs-dist`) vive AQUI; o `index.ts` exporta isto via
 * `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

interface SarakPDFViewerProps {
    /** Origem do documento: URL, bytes ou ArrayBuffer. */
    src: PdfSource;
    /** Página inicial (1-based, default: 1). */
    initialPage?: number;
    /** Escala inicial de zoom (default: 1.2). */
    zoom?: number;
    /** URL do worker do pdf.js; default resolvido do pacote via `import.meta.url`. */
    workerSrc?: string;
    /** Disparado ao clicar em Download (recebe a `src` quando string). */
    onDownload?: (src: PdfSource) => void;
    className?: string;
}

declare const SarakPDFViewer: React$1.LazyExoticComponent<React$1.FC<SarakPDFViewerProps>>;

/** Item de dado de série: dataset externo, lido por chave dinâmica. */
type ChartDataItem = Record<string, unknown>;

interface SarakChartEngineProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter' | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst' | 'histogram' | 'boxplot';
    data: ChartDataItem[];
    config?: {
        xAxisKey?: string;
        dataKey?: string;
        engine?: 'recharts' | 'echarts';
        title?: string;
        showGradients?: boolean;
        showAnimation?: boolean;
        thickness?: number;
    };
}
/**
 * Sarak Chart Engine v7.5 [Quantum Edition] - Refactored v7.2.5
 */
declare const SarakChartEngine: React__default.FC<SarakChartEngineProps>;

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
 * União conhecida dos ids de preset (fonte única; espelha `GLOBAL_THEMES`).
 * Adicionar um tema = adicionar seu id aqui e importá-lo abaixo. Consumida pela
 * diretiva `theme` (Spec 42) como o ramo "preset nomeado".
 */
declare const THEME_PRESET_IDS: readonly ["sarak-sovereign", "crystal-glass", "cyberpunk-neon", "holographic-glass", "industrial-terminal", "nature-breeze", "neo-brutalism", "synthwave-retro", "nebula-space", "dot-matrix-elegant", "stellar-nebula", "kinetic-flow", "cyber-retro-wave", "minimalist-airy", "data-terminal", "neumorphic-mobile", "industrial-dashboard", "asymmetric-editorial"];
type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

/**
 * Manifest Schema e Gramática do Nó (Spec 20). `ManifestNode` é a Lei do JSON do bloco
 * funcional — análoga ao `SarakThemePayload` do Design Engine; todos os motores a consomem.
 * Contrato Zero Any (Regra 3): cada diretiva tem tipo próprio (sem `any` nem `Record`
 * aberto); as specs donas refinam os tipos sem quebrar o contrato.
 */

/** Valor serializável de um manifesto JSON. Substitui qualquer `any` em props. */
type ManifestValue = string | number | boolean | null | ManifestValue[] | {
    [key: string]: ManifestValue;
};
/** Bag de props visuais repassadas ao átomo (apenas dados, nunca comportamento). */
type ManifestProps = Record<string, ManifestValue>;
/** Expressão de template do tipo `"{{caminho.de.estado}}"`. */
type BindingExpression = string;
/** Expressão condicional avaliada de forma segura (Spec 26). Ex.: `"{{role}} === 'ADMIN'"`. */
type ConditionExpression = string;
/** Diretiva de repetição (Spec 23). `source` aponta para a lista no estado. */
interface RenderForDirective {
    /** Caminho/binding da lista a iterar (ex.: `"{{users}}"`). */
    source: BindingExpression;
    /** Nome da variável de item no escopo local (default: `item`). */
    as?: string;
    /** Nome da variável de índice no escopo local (default: `index`). */
    indexAs?: string;
    /** Caminho de propriedade usado como chave estável de reconciliação. */
    keyBy?: string;
}
/** Uma ação declarativa do dispatcher (Spec 25). Refinada pela spec dona. */
interface ManifestAction {
    /** Tipo de ação: `api_call`, `navigate`, `mutate_state`, `trigger_toast`, etc. */
    type: string;
    /** Carga declarativa da ação (interpolável). */
    payload?: ManifestProps;
    /** Atraso de disparo em ms (debounce declarativo — aguarda a parada). */
    debounce?: number;
    /** Taxa máxima de disparo em ms (throttle declarativo — limita a frequência). */
    throttle?: number;
    /**
     * Marca um `api_call` como submit de formulário (Spec 29/32): monta o payload a
     * partir dos `model` do form-escopo ativo e é BLOQUEADO se a Validação acusar erro.
     */
    submit?: boolean;
}
/** Lista de ações associadas a um evento/nó (Spec 25). */
type ActionList = ManifestAction[];
/** Diretiva de persistência local (Spec 28). */
interface PersistDirective {
    /** Chave sob a qual o estado é salvo/restaurado no storage (namespaced p/ `@sarak:`). */
    key: string;
    /** Se `true`, o valor é ofuscado (base64) antes de persistir no storage visível (Regra 4). */
    sensitive?: boolean;
}
/** Nomes de regra de validação suportados (Spec 29, Regra 1). */
type ValidationRuleName = 'required' | 'minLength' | 'maxLength' | 'pattern' | 'type';
/** Tipos semânticos validáveis pela regra `type` (Spec 29, Regra 1). */
type ValidationTypeName = 'email' | 'url' | 'numero';
/** Regra única de validação de campo (Spec 29). */
interface ValidationRule {
    /** Identificador da regra: `required`, `minLength`, `maxLength`, `pattern`, `type`. */
    rule: ValidationRuleName;
    /**
     * Argumento da regra: comprimento (`minLength`/`maxLength`), regex string
     * (`pattern`) ou nome do tipo (`type`). `required` dispensa argumento.
     */
    value?: number | string;
    /** Mensagem custom exibida quando a regra falha (Regra 4). */
    message?: string;
}
/** Schema de validação de um campo/formulário (Spec 29). */
type ValidationSchema = ValidationRule[];
/** Método HTTP declarativo da fonte de dados (Spec 31). */
type DataSourceMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/** Estados do ciclo de vida de um nó de dados (Spec 31, Regra 2). */
type DataNodeState = 'loading' | 'success' | 'empty' | 'error';
/** Overrides dos estados de um nó com `source` (Spec 31, Regra 2): cada estado pode ter nó próprio. */
interface DataSourceStates {
    /** Nó exibido durante o carregamento (default: Skeleton mínimo). */
    loading?: ManifestNode;
    /** Nó exibido quando o resultado é vazio (default: Empty State mínimo). */
    empty?: ManifestNode;
    /** Nó exibido em caso de erro (default: Fallback). */
    error?: ManifestNode;
}
/**
 * Fonte de dados assíncrona (Spec 31): carrega ao montar, deposita em `into`, expõe
 * o ciclo de vida; a E/S passa pelo `networkInterceptor` injetado (Regra 5).
 */
interface DataSourceDirective {
    /** Endpoint/identificador da fonte (interpolável). */
    endpoint: string;
    /** Método HTTP (default: `GET`). */
    method?: DataSourceMethod;
    /** Parâmetros declarativos (interpoláveis via Spec 24). */
    params?: ManifestProps;
    /** Chave no DataStore onde o resultado é depositado (de onde o `renderFor` itera). */
    into: string;
    /** Quando disparar a busca (default: `onMount`). */
    trigger?: 'onMount' | 'manual';
    /** Overrides dos nós de estado (loading/empty/error). */
    states?: DataSourceStates;
}
/** Modelo de form / two-way binding (Spec 32, Regra 1): valor lido/escrito via `FormState`, nunca `any`. */
interface FormModelDirective {
    /** Caminho no estado vinculado ao campo (lido do DataStore e escrito de volta). */
    path: string;
}
/** Evento que dispara o reset de um escopo de formulário (Spec 32, Regra 4). */
type FormResetTrigger = 'submitSuccess';
/**
 * Diretiva de escopo de formulário (Spec 32, Regra 2). Cria um escopo isolado de
 * estado (valores + dirty + touched + erros) montado sobre o DataStore.
 */
interface FormScopeDirective {
    /** Identificador do escopo de formulário. */
    id: string;
    /** Quando restaurar os valores iniciais (ex.: sucesso do submit). */
    resetOn?: FormResetTrigger;
}
/**
 * Diretiva responsiva (Spec 16, Regra 2): override de props em cascata
 * mobile-first (`mob` base → `tab` → `desk`). Cada camada é `Partial` das props
 * base — Zero Any (Regra 3); resolvida sem remontar o nó (Regra 5).
 */
interface ResponsiveDirective {
    mob?: Partial<ManifestProps>;
    tab?: Partial<ManifestProps>;
    desk?: Partial<ManifestProps>;
}
/** Alvo de rota (Spec 33): subárvore inline ou referência lazy a manifesto externo. */
type RouteTarget = ManifestNode | {
    lazy: string;
};
/** Mapa de rotas (Spec 33): caminho → subárvore montada na região `content`. */
type RouteMap = Record<string, RouteTarget>;
/**
 * Diretiva de app-shell (Spec 33, Regra 1): regiões persistentes (sidebar/topbar)
 * + slot `content` ("<slot-rotas>") onde a rota ativa monta sua subárvore.
 */
interface ShellDirective {
    sidebar?: ManifestNode;
    topbar?: ManifestNode;
    content: string;
}
/** Diretiva de tema por região (Spec 42 — bridge `DesignScope`): preset (`ThemePresetId`) ou
 *  binding `"{{designTheme}}"` (R4), ou override parcial (`SarakThemePayload`) sobre o herdado (R3). */
type ThemeDirective = ThemePresetId | (string & {}) | Partial<SarakThemePayload>;
/** Diretiva de acessibilidade (Spec 41). */
type AriaDirective = Record<string, string | number | boolean>;
/** Mapa de slots nomeados (Spec 20, Regra 6). Ex.: header/body/footer. */
type SlotMap = Record<string, ManifestNode>;
/**
 * Nó canônico do Manifesto (Spec 20). Forma: `{ type, id?, props?, children?, ...diretivas }`.
 * `type` é resolvido pelo Component Registry (Spec 22).
 */
interface ManifestNode {
    /** Tipo do componente, resolvido pelo Registry (Spec 22). */
    type: string;
    /** Identificador opcional do nó (usado em mensagens de erro e reconciliação). */
    id?: string;
    /** Props visuais repassadas ao átomo (apenas dados). */
    props?: ManifestProps;
    /** Filhos aninhados (lista). */
    children?: ManifestNode[];
    /** Regiões nomeadas (Regra 6). */
    slots?: SlotMap;
    renderFor?: RenderForDirective;
    bindings?: BindingExpression[];
    actions?: ActionList;
    onError?: ActionList;
    renderIf?: ConditionExpression;
    disabledIf?: ConditionExpression;
    persistState?: PersistDirective;
    validation?: ValidationSchema;
    source?: DataSourceDirective;
    model?: FormModelDirective;
    form?: FormScopeDirective;
    responsive?: ResponsiveDirective;
    shell?: ShellDirective;
    routes?: RouteMap;
    theme?: ThemeDirective;
    aria?: AriaDirective;
}
/**
 * Nó raiz do Manifesto: declara a versão do schema (Regra 5). O Renderer (Spec 30)
 * recusa versões incompatíveis com fallback explícito.
 */
interface ManifestRoot extends ManifestNode {
    /** Versão do schema do manifesto (ex.: `1`). */
    schemaVersion: number;
    /**
     * Tela de recuperação global (Spec 27, Regra 2): o nó renderizado pelos Error
     * Boundaries quando uma sub-árvore quebra. Ausente → cai no Fallback estático.
     */
    fallbackErrorUI?: ManifestNode;
}
/** Versão de schema suportada por esta build da fundação. */
declare const SUPPORTED_SCHEMA_VERSION: 1;

/**
 * Catálogo Canônico de Diretivas Reservadas (Spec 20 — Onda 0)
 *
 * Análogo funcional do `theme_table_mapping` do Design Engine: cada chave de
 * COMPORTAMENTO do Manifesto vive aqui, com sua spec dona. A Conferência
 * Funcional (Spec 34) valida que cada entrada tem tipo + engine + teste.
 *
 * Diretivas NUNCA vazam como atributos de DOM — são interceptadas pelos motores
 * antes da renderização. Apenas `props` chegam ao átomo visual (Regra 4 da Spec 20).
 *
 * Este array é a fonte da verdade (C — Catálogo) consultada por:
 *  - `validateNode` (rejeita chave reservada escrita errado / chave fora do contrato);
 *  - `auditor_manifesto.mjs` (Spec 34 — cruza Contrato TS ↔ Runtime ↔ Catálogo).
 */
/**
 * Chaves estruturais do nó que NÃO são diretivas de comportamento nem `props`.
 * São tratadas explicitamente pela gramática (Regra 1 e Regra 6 da Spec 20).
 */
declare const STRUCTURAL_KEYS: readonly ["type", "id", "props", "children", "schemaVersion", "fallbackErrorUI"];
type StructuralKey = (typeof STRUCTURAL_KEYS)[number];
/**
 * Nome canônico de cada diretiva reservada. União fechada e versionada:
 * adicionar capacidade funcional nova = adicionar uma entrada aqui (e seu tipo
 * em `types.ts`), sob validação da Conferência Funcional (Spec 34, Regra 5).
 */
declare const RESERVED_DIRECTIVES: readonly ["slots", "renderFor", "bindings", "actions", "onError", "renderIf", "disabledIf", "persistState", "validation", "source", "model", "form", "responsive", "shell", "routes", "theme", "aria"];
type DirectiveName = (typeof RESERVED_DIRECTIVES)[number];
/**
 * Mapa diretiva → spec dona (a engine que a consome). Documenta a propriedade
 * de cada diretiva e alimenta a Regra 1 (3 Fontes da Verdade) da Spec 34.
 */
declare const DIRECTIVE_OWNERS: Readonly<Record<DirectiveName, string>>;
/** True se `key` é uma diretiva reservada conhecida. */
declare const isReservedDirective: (key: string) => key is DirectiveName;
/** True se `key` é uma chave estrutural da gramática (type/id/props/children/schemaVersion). */
declare const isStructuralKey: (key: string) => key is StructuralKey;

/**
 * Validação da Gramática do Nó (Spec 20 — Regras 1, 3, 4, 5)
 *
 * Determinístico, sem `any`. Responsável por:
 *  - separar `props` (visual) de diretivas (comportamento) — Regra 4;
 *  - rejeitar chave de topo desconhecida (ex.: `renderForr`) com `path`/`id` do nó
 *    culpado — Regra 3 (erro de validação, não silêncio);
 *  - validar `schemaVersion` do nó raiz — Regra 5.
 */

/** Um erro de validação do manifesto, com localização do nó culpado. */
interface ManifestValidationError {
    /** Caminho do nó na árvore (ex.: `root.children[2].slots.header`). */
    path: string;
    /** `id` do nó culpado, se declarado. */
    nodeId?: string;
    /** Código da falha. */
    code: 'unknown_key' | 'invalid_type' | 'unsupported_schema_version' | 'invalid_children';
    /** Mensagem legível. */
    message: string;
}
/** Resultado da validação de um nó (ou árvore). */
interface ManifestValidationResult {
    valid: boolean;
    errors: ManifestValidationError[];
}
/** Partes de um nó separadas por responsabilidade (Regra 4). */
interface NodeParts {
    /** Apenas dados visuais — o que chega ao átomo. */
    props: ManifestProps;
    /** Diretivas de comportamento presentes no nó (nunca vão ao DOM). */
    directives: Partial<Record<DirectiveName, unknown>>;
}
/**
 * Separa `props` das diretivas de um nó já validado (Regra 4).
 * As chaves estruturais (type/id/children/slots/schemaVersion) não entram em nenhum lado.
 */
declare const separateNodeParts: (node: ManifestNode) => NodeParts;
/**
 * Valida um nó (e toda a sub-árvore) contra a gramática da Spec 20.
 * Não lança: devolve a lista de erros para o chamador decidir o fallback.
 */
declare const validateManifestNode: (node: unknown, path?: string) => ManifestValidationResult;
/**
 * Valida o nó raiz: além da gramática, exige `schemaVersion` compatível (Regra 5).
 * Aciona o fallback de "Manifesto de UI Inválido" quando a versão é incompatível.
 */
declare const validateManifestRoot: (root: unknown) => ManifestValidationResult;

/**
 * Resolução Segura de Caminho (Spec 21 — Regras 2 e 5)
 *
 * Compartilhado com o motor de Data Binding (Spec 24). Lê `user.address.street`
 * de forma imune a `undefined` intermediário (nunca lança) e resolve o escopo
 * local de iteração (`item`, `index` do renderFor) ANTES do estado global.
 *
 * Determinístico e sem `any`.
 */
/** Estado/escopo arbitrário porém serializável — substitui `any` na fronteira. */
type StateRecord = Record<string, unknown>;
/**
 * Lê um caminho dentro de um objeto, sem lançar. Retorna `undefined` se qualquer
 * elo intermediário for ausente/primitivo. Suporta índices de array (`list.0.name`).
 */
declare const getByPath: (root: unknown, path: string) => unknown;
/**
 * Resolve um caminho consultando o escopo local antes do global (Regra 5).
 * O primeiro segmento decide a fonte: se existir como chave do escopo local,
 * a leitura inteira parte do escopo local; caso contrário, parte do global.
 * Assim `{{item.x}}` dentro de um `renderFor` não polui o estado global.
 */
declare const resolveScopedPath: (path: string, localScope: StateRecord, globalState: unknown) => unknown;
/**
 * Escreve `value` em `path` de forma IMUTÁVEL: clona apenas o trajeto afetado,
 * preservando o resto da árvore por referência (barato e anti-loop). Arrays no
 * caminho são preservados como arrays (escrita em índice como `list.0.name`).
 * Retorna a nova raiz; objetos não tocados mantêm identidade (seletores não disparam à toa).
 */
declare const setByPath: (root: StateRecord, path: string, value: unknown) => StateRecord;

/**
 * DataStore e Estado Reativo (Spec 21)
 *
 * Container de estado externo único (padrão `useSyncExternalStore`), determinístico
 * e barato, sobre o qual interpolação (24) lê, dispatcher (25) escreve, condicional
 * (26) decide e persistência (28) hidrata. Contrato Zero Any (Regra 6).
 *
 * Propriedades centrais:
 *  - Leitura segura por caminho (Regra 2) — delega a `getByPath`/`resolveScopedPath`.
 *  - Escrita imutável e em LOTE (Regra 3) — múltiplas escritas síncronas coalescem
 *    num único flush de notificação (anti-loop infinito de re-render).
 *  - Seletores → re-render mínimo (Regra 4) — só notifica assinantes cuja fatia mudou.
 */

/** Seletor de uma fatia do estado. */
type Selector<TState, TSlice = unknown> = (state: TState) => TSlice;
/**
 * Contrato público do store (Regra 6 — Zero Any na fronteira).
 * `TState` é o formato do estado fornecido pelo importador.
 */
interface SarakDataStore<TState extends StateRecord = StateRecord> {
    /** Leitura segura por caminho (`"a.b.c"`), imune a `undefined` intermediário. */
    get(path: string): unknown;
    /** Escrita imutável e em lote. */
    set(path: string, value: unknown): void;
    /** Alias semântico de `set` usado pelo dispatcher (ação `mutate_state`). */
    mutate_state(path: string, value: unknown): void;
    /** Assina uma FATIA do estado; o listener só dispara quando essa fatia muda. */
    subscribe(selector: Selector<TState>, listener: () => void): () => void;
    /** Resolve um caminho com escopo local (renderFor) sobreposto ao global. */
    getScoped(path: string, scope: StateRecord): unknown;
    /** Snapshot imutável do estado atual (para `useSyncExternalStore`). */
    getSnapshot(): TState;
}
/**
 * Cria um store reativo a partir do estado inicial do importador.
 * O agendamento de flush usa microtask para coalescer escritas síncronas.
 */
declare const createSarakDataStore: <TState extends StateRecord = StateRecord>(initialState: TState) => SarakDataStore<TState>;

/** Item navegável da Command Palette (Spec 14, Regra 1). */
interface NavigationItem {
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
    items: NavigationItem[];
    /** Atalho de ativação global (default: `mod+k` = Ctrl/Cmd+K). */
    shortcut?: string;
    /** Modo controlado: estado de abertura. */
    open?: boolean;
    /** Notifica mudanças de abertura (abrir via atalho / fechar via Esc). */
    onOpenChange?: (open: boolean) => void;
    /** Acionado ao confirmar um item (Enter ou clique). */
    onSelect: (item: NavigationItem) => void;
    /** Placeholder do input central. */
    placeholder?: string;
}

/** Passo de um fluxo orientado (Spec 14, Regra 2). */
interface StepConfig {
    /** Rótulo do passo. */
    label: string;
    /** Descrição/legenda opcional. */
    description?: string;
}
type StepperOrientation = 'horizontal' | 'vertical';
interface SarakStepperProps {
    /** Passos na ordem do fluxo. */
    steps: StepConfig[];
    /** Índice (0-based) do passo atual. */
    current: number;
    /** Disposição (default: horizontal). */
    orientation?: StepperOrientation;
    className?: string;
}

/** Migalha do caminho de navegação (Spec 14, Regra 3). */
interface BreadcrumbItem {
    /** Rótulo exibido. */
    label: string;
    /** Destino opcional (acionado via `onNavigate`, não pela URL diretamente). */
    href?: string;
    /** Ícone opcional à esquerda do rótulo. */
    icon?: React__default.ReactNode;
}
interface SarakBreadcrumbsProps {
    /** Caminho do usuário, da raiz à folha. */
    items: BreadcrumbItem[];
    /** Separador entre migalhas (default: `/`). */
    separator?: React__default.ReactNode;
    /** Delega a navegação ao host (Spec 33, Regra 3) — não manipula a URL. */
    onNavigate?: (href: string) => void;
    className?: string;
}

interface SarakPaginationProps {
    /** Página atual (1-based). */
    current: number;
    /** Total de páginas. */
    total: number;
    /** Máximo de botões numéricos antes de compactar com reticências (default: 7). */
    maxVisible?: number;
    /** Disparado ao escolher uma página válida (diferente da atual). */
    onChange: (page: number) => void;
    className?: string;
}

interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React__default.ReactNode;
    leftIcon?: React__default.ReactNode;
    rightIcon?: React__default.ReactNode;
    error?: string;
    fullWidth?: boolean;
}

interface SarakTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    fullWidth?: boolean;
}

interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    fullWidth?: boolean;
}

interface SarakSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React__default.ReactNode;
    description?: React__default.ReactNode;
}

interface SarakSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    valueLabel?: string | number;
}

interface SarakGridProps extends React__default.HTMLAttributes<HTMLDivElement> {
    children: React__default.ReactNode;
    templateColumns?: string;
    templateAreas?: string;
    gap?: string;
    as?: React__default.ElementType;
}

interface SarakFormGroupProps extends React__default.HTMLAttributes<HTMLDivElement> {
    children: React__default.ReactNode;
}

interface SarakFlexProps extends React__default.HTMLAttributes<HTMLDivElement> {
    children: React__default.ReactNode;
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | string;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string;
    align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | string;
    gap?: string;
    as?: React__default.ElementType;
}

interface SarakSplitPaneProps {
    leftPane: React__default.ReactNode;
    rightPane: React__default.ReactNode;
    minLeftWidth?: number;
    maxLeftWidth?: number;
    defaultLeftWidth?: number;
    className?: string;
}

interface SarakAccordionProps {
    title: React__default.ReactNode;
    children: React__default.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

interface TabItem {
    id: string;
    label: React__default.ReactNode;
    content: React__default.ReactNode;
}
interface SarakTabsProps {
    items: TabItem[];
    defaultActiveId?: string;
    alignment?: 'horizontal' | 'vertical';
    className?: string;
}

/**
 * Registro nativo. `as const` em conjunto com `satisfies` mantém a inferência das
 * chaves literais (para derivar `ComponentType`) sem afrouxar a tipagem dos valores.
 *
 * `SarakDataGrid` é o primeiro componente pesado registrado via `React.lazy`
 * (Regra 5): a virtualização (`@tanstack/react-virtual`) só carrega quando um grid
 * é renderizado. O Renderer já envolve a árvore em `<Suspense>`.
 */
declare const NATIVE_COMPONENTS: {
    readonly SarakFlex: React$1.FC<SarakFlexProps>;
    readonly SarakGrid: React$1.FC<SarakGridProps>;
    readonly SarakSplitPane: React$1.FC<SarakSplitPaneProps>;
    readonly SarakTabs: React$1.FC<SarakTabsProps>;
    readonly SarakAccordion: React$1.FC<SarakAccordionProps>;
    readonly SarakFormGroup: React$1.FC<SarakFormGroupProps>;
    readonly SarakDataGrid: React$1.LazyExoticComponent<React$1.FC<SarakDataGridProps>>;
    readonly SarakDataTable: React$1.LazyExoticComponent<typeof SarakDataTableImpl>;
    readonly SarakSparkline: React$1.FC<SarakSparklineProps>;
    readonly SarakTreeView: React$1.FC<SarakTreeViewProps>;
    readonly SarakKanban: typeof SarakKanbanImpl;
    readonly SarakSkeleton: React$1.FC<SarakSkeletonProps>;
    readonly SarakDataEmpty: React$1.FC<SarakDataEmptyProps>;
    readonly SarakModal: React$1.FC<SarakModalProps>;
    readonly SarakDrawer: React$1.FC<SarakDrawerProps>;
    readonly SarakTooltip: React$1.FC<SarakTooltipProps>;
    readonly SarakContextMenu: React$1.FC<SarakContextMenuProps>;
    readonly SarakInput: React$1.FC<SarakInputProps>;
    readonly SarakSelect: React$1.FC<SarakSelectProps>;
    readonly SarakTextarea: React$1.FC<SarakTextareaProps>;
    readonly SarakSwitch: React$1.FC<SarakSwitchProps>;
    readonly SarakSlider: React$1.FC<SarakSliderProps>;
    readonly SarakRangeSlider: React$1.FC<SarakRangeSliderProps>;
    readonly SarakMultiSelect: React$1.FC<SarakMultiSelectProps>;
    readonly SarakUploader: React$1.FC<SarakUploaderProps>;
    readonly SarakDatePicker: React$1.FC<SarakDatePickerProps>;
    readonly SarakTimePicker: React$1.FC<SarakTimePickerProps>;
    readonly SarakRichText: React$1.FC<SarakRichTextProps>;
    readonly SarakSpotlight: React$1.FC<SarakSpotlightProps>;
    readonly SarakStepper: React$1.FC<SarakStepperProps>;
    readonly SarakBreadcrumbs: React$1.FC<SarakBreadcrumbsProps>;
    readonly SarakPagination: React$1.FC<SarakPaginationProps>;
    readonly SarakMarkdownRenderer: React$1.LazyExoticComponent<React$1.FC<SarakMarkdownRendererProps>>;
    readonly SarakLightbox: React$1.FC<SarakLightboxProps>;
    readonly SarakPDFViewer: React$1.LazyExoticComponent<React$1.FC<SarakPDFViewerProps>>;
};
/** União dos `type` nativos oficiais — fonte do `ComponentType` (Spec 22, Regra 1). */
type NativeComponentType = keyof typeof NATIVE_COMPONENTS;

/**
 * Component Registry e Resolver (Spec 22)
 *
 * Mapa de resolução `type → componente React`. Ponte entre a camada lógica (lê o
 * JSON) e a visual (átomos das Specs 10–15). Tipado e fechado por padrão (Regra 1),
 * com fallback seguro (Regra 2), passagem restrita de props (Regra 3), registro de
 * customizados pelo importador (Regra 4) e suporte a lazy (Regra 5).
 *
 * Zero Any: o keyword `any` não aparece. Componentes heterogêneos são guardados sob
 * `ManifestComponent` via cast tipado (`as unknown as`), nunca via `any`.
 */

/** Props que um componente renderizável recebe do manifesto (apenas dados + children). */
interface ManifestComponentProps {
    children?: React__default.ReactNode;
    [prop: string]: unknown;
}
/** Tipo uniforme sob o qual qualquer componente é guardado no registry. */
type ManifestComponent = React__default.ComponentType<ManifestComponentProps>;
/**
 * União de string-literais dos `type` oficiais da Sarak (Regra 1). Derivada das
 * chaves do mapa nativo: registrar/remover um átomo atualiza este tipo
 * automaticamente — barrando, em tempo de compilação, um `type` fora do conjunto.
 */
type ComponentType = NativeComponentType;
/** Resultado de uma resolução de `type`. */
interface ComponentResolution {
    /** Componente a renderizar (real ou fallback). */
    Component: ManifestComponent;
    /** True quando caiu no fallback (type desconhecido). */
    isFallback: boolean;
}
/** Contrato público do registry (Spec 22, §2). */
interface ComponentRegistry {
    /** Resolve um `type` para um componente; nunca lança (cai no fallback). */
    resolve(type: string, nodeId?: string): ComponentResolution;
    /** Registra/atualiza um componente para um `type` (importador — Regra 4). */
    register<P extends object>(type: string, component: React__default.ComponentType<P>): void;
    /** True se o `type` está registrado. */
    has(type: string): boolean;
    /** Componente de fallback usado para `type` desconhecido. */
    getFallback(): ManifestComponent;
}
/** Cria um registry isolado, semeado com os componentes nativos oficiais. */
declare const createComponentRegistry: () => ComponentRegistry;
/** Registry singleton padrão da biblioteca (usado pelo Renderer e pela API pública). */
declare const defaultComponentRegistry: ComponentRegistry;
/**
 * API pública para o importador registrar um componente customizado sem fork (Regra 4).
 * Exportada em `src/index.ts`.
 */
declare const registerComponent: <P extends object>(type: string, component: React__default.ComponentType<P>) => void;
/** Helper para resolver via registry padrão. */
declare const resolveComponent: (type: string, nodeId?: string) => ComponentResolution;

/** Props do Fallback: identifica o nó culpado sem derrubar a árvore (Spec 22, Regra 2). */
interface SarakFallbackProps {
    /** `type` não resolvido que acionou o fallback. */
    type: string;
    /** `id`/path do nó culpado, para diagnóstico. */
    nodeId?: string;
}
/**
 * Componente de Fallback visual (Spec 22 — Regra 2 / integra Spec 27).
 * Renderizado quando um `type` não resolve no Registry: mostra um marcador
 * discreto e registra o nó culpado, mantendo o restante da árvore intacto.
 *
 * Zero Hardcode: cores via `var(--sx-*)`; espaçamento via utilitários do design system.
 */
declare const SarakFallback: React__default.FC<SarakFallbackProps>;

/**
 * Motor de Interpolação / Data Binding (Spec 24 — Regras 1, 3, 4)
 *
 * Interpretador léxico que caça templates `{{ ... }}` no manifesto e os substitui
 * pelo estado correspondente em tempo de execução, aplicando pipes de formatação.
 *
 * Princípios:
 *  - Resolução SEGURA (Regra 1): reusa `resolveScopedPath` da Spec 21 — caminho
 *    ausente vira `''` (ou o fallback `|| 'literal'`), nunca lança.
 *  - Reativo (Regra 3): puro e síncrono; o Renderer reexecuta a interpolação quando
 *    o DataStore muda (via `useSyncExternalStore` na raiz).
 *  - Anti-XSS (Regra 4): produz apenas `string`/valor primitivo, nunca HTML cru.
 *
 * Zero Any: a fronteira dinâmica é `unknown` + `ManifestValue`; sem `any`.
 */

/**
 * Resolve UMA expressão de template (o conteúdo entre `{{ }}`): caminho + fallback
 * `|| 'literal'` opcional + pipes encadeados. Retorna o valor cru (sem `String()`),
 * para que props possam preservar o tipo (ex.: `"{{count}}"` → número).
 */
declare const resolveExpression: (expr: string, scope: StateRecord, globalState: unknown) => unknown;
/**
 * Resolve um binding solto (`"{{users}}"` ou `"users"`) ao seu valor cru.
 * Usado pelo motor de repetição (Spec 23) para obter a lista a iterar.
 */
declare const resolveBinding: (binding: string, scope: StateRecord, globalState: unknown) => unknown;
/**
 * Substitui todos os `{{ ... }}` de uma string pelo texto resolvido. Valores
 * ausentes (`undefined`/`null`) viram `''` (Regra 1).
 */
declare const interpolate: (template: string, scope: StateRecord, globalState: unknown) => string;
/**
 * Interpola todas as `props` visuais de um nó contra o escopo+estado atuais.
 * O que chega ao átomo já vem com as variáveis resolvidas (Regra 3).
 */
declare const interpolateProps: (props: ManifestProps, scope: StateRecord, globalState: unknown) => ManifestProps;

/**
 * Pipes de Formatação (Spec 24 — Regra 2)
 *
 * Registro de funções formatadoras PURAS aplicadas no template via `|`
 * (ex.: `{{valor | currency: 'BRL'}}`). Cada pipe recebe o valor resolvido e
 * argumentos string do template, e devolve sempre uma `string` (Regra 4 — nunca
 * HTML cru; sanitização rica fica no `SarakMarkdownRenderer`, Spec 15).
 *
 * Contrato Zero Any: o valor de entrada é `unknown`; nenhuma `any` na fronteira.
 */
/**
 * Assinatura de um pipe: transforma um valor resolvido em texto, com argumentos
 * literais (string) extraídos do template após o `:`.
 */
type Pipe = (value: unknown, ...args: string[]) => string;
/** Registra (ou substitui) um pipe pelo nome. API pública (importador). */
declare const registerPipe: (name: string, pipe: Pipe) => void;
/** Recupera um pipe pelo nome, ou `undefined` se não cadastrado. */
declare const getPipe: (name: string) => Pipe | undefined;
/** True se o pipe está registrado. */
declare const hasPipe: (name: string) => boolean;

/**
 * Motor de Repetição (Spec 23 — Regras 1, 2, 3, 4)
 *
 * Coração dinâmico do Renderer: intercepta a diretiva `renderFor` de um nó, resolve
 * a lista-fonte no estado (via Spec 24) e multiplica o nó N vezes, injetando um
 * ESCOPO LOCAL por iteração (`item`/`index`) que se sobrepõe ao global (Spec 21).
 *
 * Esta camada é PURA (sem React): devolve a descrição das instâncias a renderizar.
 * O Renderer materializa cada instância e decide (Regra 4) entre map direto e a
 * virtualização da Spec 12 quando a lista passa do limiar.
 *
 * Zero Any: fronteiras em `unknown`/`StateRecord`; nenhuma `any`.
 */

/** Uma instância expandida do nó: o nó-base (sem `renderFor`) + escopo + chave. */
interface ExpandedNode {
    /** Nó a renderizar — o original sem a diretiva `renderFor` (evita re-expansão). */
    node: ManifestNode;
    /** Escopo local da iteração (pai + `{ [as]: item, [indexAs]: index }`). */
    scope: StateRecord;
    /** Chave estável de reconciliação (Regra 3). */
    key: string;
}
/** Resultado da expansão. `ok=false` quando a fonte não é um Array (Regra 2). */
interface RenderForResult {
    ok: boolean;
    items: ExpandedNode[];
    /** Mensagem de erro capturável quando `ok=false`. */
    error?: string;
}
/** Limiar de itens a partir do qual o Renderer delega à virtualização (Regra 4). */
declare const VIRTUALIZE_THRESHOLD = 100;
/**
 * Expande um nó que carrega `renderFor`. Retorna a lista de instâncias a renderizar
 * (cada uma com seu escopo local) ou um erro capturável se a fonte não for um Array.
 */
declare const expandRenderFor: (node: ManifestNode, scope: StateRecord, globalState: unknown) => RenderForResult;

/**
 * Fonte de Dados Declarativa (Spec 31 — Regras 1–5)
 *
 * Fecha o ciclo "JSON vira app viva": um nó com `source` carrega seus próprios
 * dados ao montar, deposita-os no DataStore na chave `into` (de onde o `renderFor`
 * itera) e dirige a máquina de estados `loading → success | empty | error`.
 *
 *  - Regra 4 (anti-loop): a busca dispara UMA vez por montagem, chaveada por
 *    endpoint+params interpolados; só refaz por `trigger: manual` (reload) ou
 *    mudança das params.
 *  - Regra 5 (sem rede embutida): a biblioteca NUNCA chama `fetch`; toda E/S passa
 *    pelo `networkInterceptor` injetado pelo importador (mantém auth/JWT fora daqui).
 *
 * Zero Any: a fronteira do payload é `unknown`; nenhuma `any`.
 */

/** Requisição declarativa entregue ao interceptor do importador. */
interface NetworkRequest {
    endpoint: string;
    method?: DataSourceMethod;
    params?: ManifestProps;
}
/**
 * Interceptor de rede injetado pelo importador (Spec 30/31, Regra 5). Recebe a
 * requisição declarativa e devolve os dados. A biblioteca não conhece auth nem fetch.
 */
type NetworkInterceptor = (request: NetworkRequest) => Promise<unknown>;
/** Controlador retornado pelo hook: estado do ciclo + erro + recarga manual. */
interface DataSourceController {
    state: DataNodeState;
    error: unknown;
    /** Dispara uma nova busca (modo `manual` ou re-fetch sob demanda). */
    reload: () => void;
}
/**
 * Gerencia o ciclo de vida de um nó com `source`. Deposita o resultado em
 * `directive.into` no `store` e devolve o estado para o Renderer escolher entre
 * Skeleton / Empty / Fallback / conteúdo.
 */
declare const useDataSource: (directive: DataSourceDirective, store: SarakDataStore<StateRecord> | undefined, interceptor: NetworkInterceptor | undefined, scope: StateRecord, globalState: unknown) => DataSourceController;

/**
 * Tokenizer do Motor de Avaliação Condicional (Spec 26 — Regras 1, 3, 4)
 *
 * Quebra a expressão em tokens de um conjunto FECHADO de operadores. Os `{{ }}` são
 * resolvidos aqui (valor tipado) e os literais reconhecidos; identificadores que não
 * sejam `true`/`false`/`null` são PROIBIDOS — fecha a porta a globais (`window`/`document`)
 * e a chamadas de função, sem nunca tocar em `eval`.
 */

/** Erro restrito do avaliador — sintaxe inválida, token inesperado ou global proibido. */
declare class ConditionSyntaxError extends Error {
    constructor(message: string);
}

/**
 * Motor de Avaliação Condicional (Spec 26 — Regras 1–4)
 *
 * Avalia strings lógicas declaradas no manifesto (`renderIf`/`disabledIf`) SEM jamais
 * tocar em `eval`/`Function`. Um parser recursivo-descendente próprio consome os tokens
 * (ver `tokenize.ts`) sobre um conjunto FECHADO de operadores; os operandos só nascem de
 * literais ou de `{{ }}` resolvidos pela Spec 24.
 *
 * Segurança (Regra 1/4): qualquer construção fora da gramática vira erro de parse → o
 * avaliador falha de forma passiva (`console.warn`) e assume `false` (segurança por
 * default). Zero Any: a fronteira dinâmica é `unknown`.
 */

/**
 * Avalia uma `ConditionExpression` de forma segura. Retorna sempre `boolean` (o valor
 * final é coagido por veracidade). Em QUALQUER erro de sintaxe/token (incluindo
 * tentativas de alcançar globais), loga e retorna `false` (fail-safe — Regra 4).
 */
declare const evaluateCondition: (expression: string, scope: StateRecord, global: unknown) => boolean;

/**
 * Validação Declarativa de Campos (Spec 29)
 *
 * Lógica PURA e determinística (sem React, sem `any`): recebe o valor de um campo e
 * seu `ValidationSchema` e devolve os erros. As engrenagens visuais (LeafNode) e o
 * bloqueio de submit (Dispatcher) consomem este resultado — a regra de negócio vive
 * aqui, isolada e testável.
 *
 * Regra 1 (tipos): `required`, `minLength`, `maxLength`, `pattern` (regex), `type`
 * (`email`/`url`/`numero`). Regra 4: cada regra aceita `message` custom; senão usa o
 * default em pt-BR. A compilação de regex é blindada (try/catch) — regex inválida no
 * JSON nunca derruba o motor (mesma postura anti-injeção do `evaluateCondition`).
 */

/** Erro de validação de um campo, pronto para exibição (Regra 3/4). */
interface ValidationError {
    /** Regra que falhou. */
    rule: ValidationRule['rule'];
    /** Mensagem (custom do JSON ou default). */
    message: string;
}
/**
 * Valida um valor contra um schema, retornando TODOS os erros (na ordem das regras).
 * Determinístico: mesmo valor + schema => mesmo resultado.
 */
declare const validateValue: (value: unknown, schema: ValidationSchema | undefined) => ValidationError[];
/** Conveniência: primeira mensagem de erro de um campo (a exibida abaixo do input). */
declare const firstErrorMessage: (value: unknown, schema: ValidationSchema | undefined) => string | undefined;

/**
 * Escopo de Formulário (Spec 32, Regras 2 e 4)
 *
 * Controlador PURO (sem React) de um `form: { id, resetOn? }`: isola valores, dirty,
 * touched e erros de um formulário montado sobre o DataStore. Os VALORES vivem no
 * próprio DataStore (escritos pela diretiva `model` via two-way) — este escopo guarda
 * apenas o META-estado (quais campos pertencem ao form, quais estão sujos/tocados,
 * os valores iniciais para reset) e deriva validade/payload sob demanda.
 *
 * Store injetável (`FormStore`) para teste isolado sem React/DataStore real.
 * Zero Any: valores de campo são `unknown` na fronteira, nunca `any` (Regra 5).
 */

/** Acesso mínimo ao estado que o escopo precisa (subconjunto do SarakDataStore). */
interface FormStore {
    get(path: string): unknown;
    set(path: string, value: unknown): void;
}
/** Chave de estado onde o meta-estado do form é espelhado (lido por `{{form.*}}`). */
declare const FORM_META_KEY = "form";
/** Contrato do escopo de formulário ativo. */
interface FormScope {
    /** Identificador do form (da diretiva `form.id`). */
    readonly id: string;
    /** Registra um campo (pelo seu `model` path); devolve a função de baixa. */
    registerField(path: string, schema?: ValidationSchema): () => void;
    /** Marca um campo como sujo (valor mudou em relação ao inicial). */
    markDirty(path: string): void;
    /** Marca um campo como tocado (recebeu e perdeu foco). */
    markTouched(path: string): void;
    /** True se o campo já foi tocado (controla quando exibir erro). */
    isTouched(path: string): boolean;
    /** Valida TODOS os campos registrados contra os valores atuais do store. */
    validate(): Record<string, ValidationError[]>;
    /** True se algum campo registrado tem erro agora. */
    hasErrors(): boolean;
    /** Monta o payload de submit a partir dos `model` registrados (estrutura aninhada). */
    buildPayload(): StateRecord;
    /** Restaura os valores iniciais e limpa dirty/touched (Regra 4 — `resetOn`). */
    reset(): void;
    /** Sinaliza tentativa de submit: campos passam a exibir erro mesmo sem `touched`. */
    markSubmitAttempted(): void;
    /** True após uma tentativa de submit (limpo no reset). */
    readonly submitAttempted: boolean;
    /** True se algum campo está sujo. */
    readonly isDirty: boolean;
    /** Assina mudanças de meta-estado (touched/dirty/submitAttempted) para re-render. */
    subscribe(listener: () => void): () => void;
}
/**
 * Cria um escopo de formulário. `store` é opcional: sem ele, o escopo degrada para
 * no-op de leitura/escrita (a árvore não quebra fora de um DataStore).
 */
declare const createFormScope: (id: string, store?: FormStore) => FormScope;

/**
 * Dispatcher Central de Eventos e Ações (Spec 25)
 *
 * Medula da interatividade: traduz a diretiva declarativa `actions: []` num pipeline
 * de execução real. As ações rodam EM SEQUÊNCIA (Regra 2) — uma assíncrona (`api_call`)
 * só libera a próxima em sucesso; em falha, a cadeia para e o `onError` é disparado.
 *
 * A biblioteca NÃO conhece rede/rota/feedback diretamente: tudo entra por um
 * `DispatchContext` injetável (interceptor, navigate, toast, overlay) — a mesma
 * fronteira de confiança da Fonte de Dados (Spec 31, Regra 5).
 *
 * Zero Any: payloads são `ManifestProps`; as fronteiras dinâmicas são `unknown`.
 */

/**
 * Sinaliza que um `api_call` com `submit: true` foi BARRADO pela Validação (Spec 29,
 * Regra 2). `runActions` o reconhece e interrompe a cadeia SILENCIOSAMENTE — sem
 * disparar `onError` (diferente de uma falha de rede real).
 */
declare class SubmitBlockedError extends Error {
    constructor(message?: string);
}
/** Pedido de overlay imperativo (open_modal/open_drawer). */
interface OverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: string;
}
/** Controller de overlays injetado (Spec 13 fornece a implementação). */
interface OverlayController {
    open(request: OverlayRequest): void;
    close(): void;
}
/** Callback de navegação injetado pelo importador (router do consumidor). */
type NavigateFn = (to: string, payload?: ManifestProps) => void;
/**
 * Capacidades disponíveis às ações. Tudo opcional: um handler que precise de uma
 * capacidade ausente falha de forma controlada (loga; em `api_call`, propaga o erro
 * para parar a cadeia). `scope`/`global` alimentam a interpolação (Spec 24).
 */
interface DispatchContext {
    store?: SarakDataStore<StateRecord>;
    interceptor?: NetworkInterceptor;
    toast?: ToastController;
    navigate?: NavigateFn;
    overlay?: OverlayController;
    /** Escopo de formulário ativo (Spec 32) — usado pelo `api_call` com `submit`. */
    form?: FormScope;
    scope: StateRecord;
    global: unknown;
}
/** Handler de uma ação. Pode ser assíncrono (a cadeia aguarda). */
type ActionHandler = (action: ManifestAction, ctx: DispatchContext) => void | Promise<void>;
/** Registry tipado `type → handler` (Regra 1). Extensível sem `any`. */
declare const ACTION_HANDLERS: Readonly<Record<string, ActionHandler>>;
/**
 * Executa uma lista de ações em sequência (Regra 2). Se uma ação falhar, as seguintes
 * são BLOQUEADAS e a lista `onError` (se houver) é disparada — best-effort, sem
 * recursão de `onError` sobre `onError`.
 */
declare const runActions: (actions: ActionList, ctx: DispatchContext, onError?: ActionList) => Promise<void>;

/**
 * Modificadores de Taxa do Dispatcher (Spec 25 — Regra 3)
 *
 * `debounce` (aguarda a parada) e `throttle` (limita a frequência) declarativos.
 * Ambos preservam os argumentos e devolvem uma função estável que mantém seu próprio
 * estado de temporização entre chamadas. Baseados em `setTimeout` (sem `Date.now`),
 * o que os torna determinísticos sob fake timers.
 *
 * Zero Any: o genérico captura a assinatura exata da função embrulhada.
 */
/** Assinatura genérica de um handler de evento (retorno ignorado). */
type AnyHandler<TArgs extends unknown[]> = (...args: TArgs) => void;
/**
 * Debounce: só executa `fn` após `waitMs` sem novas chamadas. Digitar 10 caracteres
 * rápido com `waitMs=1000` resulta em UMA execução (Critério de Aceite 3 da Spec 25).
 */
declare const debounce: <TArgs extends unknown[]>(fn: AnyHandler<TArgs>, waitMs: number) => AnyHandler<TArgs>;
/**
 * Throttle (leading): executa `fn` imediatamente e bloqueia novas chamadas por `waitMs`.
 * Um double-click com `waitMs=500` dispara só a primeira (Plano de Testes da Spec 25).
 */
declare const throttle: <TArgs extends unknown[]>(fn: AnyHandler<TArgs>, waitMs: number) => AnyHandler<TArgs>;

/** Contexto do escopo de formulário ativo (null fora de um `form`). */
declare const FormScopeContext: React$1.Context<FormScope | null>;
/** Lê o escopo de formulário ativo, se houver. */
declare const useFormScope: () => FormScope | null;

/**
 * Two-Way Binding `model` (Spec 32, Regra 1) — helpers puros
 *
 * O caminho de VOLTA do Data Binding (Spec 24 só lê): lê o valor do campo do DataStore
 * (respeitando o escopo local do renderFor) e extrai o novo valor de um evento de
 * mudança para reescrever no estado. Sem React, sem `any`.
 */

/** Lê o valor atual de um `model` path, escopo local antes do global (Spec 21, Regra 5). */
declare const resolveModelValue: (path: string, scope: StateRecord, global: unknown) => unknown;
/**
 * Extrai o valor a gravar no estado a partir do que o `onChange` recebeu:
 *  - evento de checkbox/switch → `target.checked` (boolean);
 *  - evento de input/select/textarea/range → `target.value`;
 *  - valor já primitivo (componentes que chamam `onChange(value)`) → ele mesmo.
 */
declare const coerceEventValue: (event: unknown) => unknown;

/**
 * Error Boundary do Manifesto (Spec 27)
 *
 * Isola falhas de renderização de uma sub-árvore (Regra 1): um erro fatal num nó
 * (ex.: API devolve `undefined` onde se esperava array) NÃO derruba a árvore inteira
 * — só o nó culpado é substituído pela tela de recuperação. Boundary de classe porque
 * `getDerivedStateFromError`/`componentDidCatch` não têm equivalente em hooks.
 *
 * Regra 4 (log silencioso): registra a chave JSON exata (`nodeId`/`path`) que panicou,
 * acelerando o debug do importador.
 */

interface SarakErrorBoundaryProps {
    /** `id`/path do nó protegido — usado no log de diagnóstico (Regra 4). */
    nodeId: string;
    /** Tela de recuperação a renderizar quando a sub-árvore quebra (Regra 2). */
    renderFallback: () => React__default.ReactNode;
    children: React__default.ReactNode;
}
interface SarakErrorBoundaryState {
    hasError: boolean;
}
declare class SarakErrorBoundary extends React__default.Component<SarakErrorBoundaryProps, SarakErrorBoundaryState> {
    state: SarakErrorBoundaryState;
    static getDerivedStateFromError(): SarakErrorBoundaryState;
    componentDidCatch(error: Error, info: React__default.ErrorInfo): void;
    render(): React__default.ReactNode;
}

/**
 * Acesso Guardado ao LocalStorage (Spec 28)
 *
 * Fronteira de confiança do storage: a biblioteca NUNCA toca o `localStorage`
 * diretamente — passa por aqui. Determinístico, sem `any`, e à prova de ambientes
 * hostis (modo anônimo, storage bloqueado, SSR sem `window`): todo acesso é guardado
 * e degrada para no-op em vez de derrubar o render (Regra de degradação suave).
 *
 *  - Namespace (Regra 3): toda chave é prefixada com `@sarak:` para não colidir com
 *    chaves do sistema importador (ex.: as legadas `sarak_*`).
 *  - sensitive (Regra 4): o valor é ofuscado em base64 (não é cripto — só evita o
 *    valor em claro no storage visível).
 */
/** Prefixo obrigatório de namespace (Regra 3). */
declare const STORAGE_NAMESPACE = "@sarak:";
/** Monta a chave namespaced a partir da chave declarada no JSON. */
declare const namespacedKey: (key: string) => string;
/**
 * Lê e desserializa um valor persistido. Retorna `undefined` se ausente ou ilegível
 * (nunca lança). `sensitive` deve casar com o usado na escrita.
 */
declare const readPersisted: (key: string, sensitive?: boolean) => unknown;
/**
 * Serializa e persiste um valor. No-op silencioso (com aviso) se o storage estiver
 * indisponível — nunca derruba o render.
 */
declare const writePersisted: (key: string, value: unknown, sensitive?: boolean) => void;
/** Remove uma chave persistida (no-op se indisponível). */
declare const removePersisted: (key: string) => void;
/**
 * Assina mudanças EXTERNAS de uma chave (Regra 2 — outra aba do navegador altera o
 * storage). Dispara `onChange` com o novo valor desserializado. Devolve a função de
 * baixa. No-op (devolve cleanup vazio) fora do browser.
 */
declare const subscribeStorage: (key: string, onChange: (value: unknown) => void, sensitive?: boolean) => (() => void);

/**
 * Hook de Persistência de Fatia (Spec 28)
 *
 * Liga uma fatia do DataStore (em `path`) a uma chave de `localStorage`, fechando o
 * ciclo declarativo do `persistState`:
 *   1. hidrata o estado a partir do storage no mount, ANTES do paint (sem flicker);
 *   2. grava no storage sempre que a fatia muda;
 *   3. sincroniza entre abas (Regra 2): mudança externa do storage volta ao estado.
 *
 * Tudo guardado por `safeStorage` (degrada suave se o storage estiver bloqueado).
 */

declare const usePersistedSlice: (store: SarakDataStore<StateRecord> | undefined, path: string | undefined, key: string | undefined, sensitive?: boolean) => void;

/**
 * SarakManifestRenderer — Componente público do Motor de Dados Vivo
 *
 * Materializa um manifesto JSON numa árvore React. Assina o DataStore (Spec 21) para
 * reagir a mudanças de estado e re-interpolar a árvore; injeta as capacidades do
 * Dispatcher (Spec 25), o interceptor de rede (Spec 31) e a tela de recuperação global
 * (Spec 27). A maquinaria recursiva de nós vive em `nodes/renderNode` (pipeline de
 * diretivas + Error Boundary por nó).
 */

/**
 * Contrato do importador (Spec 30, Regra 2). As 4 chaves cruciais: `payload`,
 * `dataStore`, `networkInterceptor`, `routerInterceptor` (+ `route` da Spec 33).
 * `manifest`/`onNavigate` permanecem como aliases retrocompatíveis.
 */
interface SarakManifestRendererProps {
    /** Nó raiz do manifesto (deve declarar `schemaVersion`). Alias canônico: `payload`. */
    manifest?: unknown;
    /** Payload do manifesto (Spec 30, Regra 2) — string/objeto JSON. Alias de `manifest`. */
    payload?: unknown;
    /** Store reativo opcional (Spec 21), injetado pelo importador. */
    dataStore?: SarakDataStore<StateRecord>;
    /** Registry a usar; default = singleton da biblioteca. */
    registry?: ComponentRegistry;
    /** Interceptor de rede injetado (Spec 31, Regra 5) — toda E/S passa por ele. */
    networkInterceptor?: NetworkInterceptor;
    /** Ponte de navegação do host (Spec 30, Regra 2): processa os `navigate` do JSON. */
    routerInterceptor?: NavigateFn;
    /** @deprecated Use `routerInterceptor`. Mantido por compatibilidade (Spec 25). */
    onNavigate?: NavigateFn;
    /**
     * Rota ativa informada pelo host (Spec 33, Regra 3): a Sarak reage e resolve qual
     * subárvore de `routes` monta na região `content` — NUNCA controla a URL diretamente.
     */
    route?: string;
    /**
     * Tela de recuperação global (Spec 27, Regra 2). Override do importador; se ausente,
     * usa a chave `fallbackErrorUI` do próprio manifesto.
     */
    fallbackErrorUI?: ManifestNode;
}
/**
 * Materializa um manifesto. Assina o DataStore (se fornecido) para reagir a mudanças
 * de estado e re-interpolar a árvore. Toda a saída fica sob `<Suspense>` para acomodar
 * componentes pesados carregados via `React.lazy` (ex.: virtualização do DataGrid).
 */
declare const SarakManifestRenderer: React__default.FC<SarakManifestRendererProps>;

/**
 * Sarak Registry (v5.5)
 *
 * Local manager for registered modules to avoid dependency on lib-shared.
 */
/**
 * Props que um componente registrado pode receber (heterogêneo, sem `any`).
 * Espelha o padrão canônico de `ManifestComponentProps` (Spec 22).
 */
interface SarakComponentProps {
    children?: React.ReactNode;
    [prop: string]: unknown;
}
/** Tipo uniforme sob o qual qualquer componente é guardado no registro. */
type SarakComponent = React.ComponentType<SarakComponentProps>;
interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    component?: SarakComponent;
    components?: Record<string, SarakComponent>;
    priority?: number;
    description?: string;
    isLocal?: boolean;
}
/**
 * Subscribes to registry changes (v9.0 Passive Discovery).
 */
declare const subscribeToRegistry: (listener: () => void) => () => boolean;
/**
 * Registers a local component linked to a system ID (v6.5).
 */
declare const registerLocalComponent: <P extends object>(id: string, component: React.ComponentType<P>) => void;
/**
 * Returns the component associated with an ID, if it exists.
 */
declare const getLocalComponent: (id: string) => SarakComponent | undefined;
/**
 * Registers or updates a Sarak module in the system (v9.1 - Merging Support).
 */
declare const registerSarakModule: (manifest: SarakModule) => void;
/**
 * Returns the list of registered modules with resolved components (v9.1).
 */
declare const getRegisteredModules: () => SarakModule[];
/**
 * Retrieves a specific module by ID.
 */
declare const getSarakModule: (id: string) => SarakModule | undefined;

/**
 * Sarak Discovery Core Types (v11.0)
 */

/** Descritor de filtro de um contrato (espelha estruturalmente o FilterConfig do CardGrid; core fica sem dependência de `components/`). */
interface FilterDescriptor {
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
type VisualContractType = 'TABLE' | 'STATS' | 'CARD_GRID' | 'MANAGEMENT_GRID' | 'FORM' | 'CHAT_INTERFACE' | 'CHART' | 'FLOW_DIAGRAM' | 'ELITE_CHART' | 'ADVANCED_CHAT' | 'SECURITY_ORCHESTRATOR' | 'CATALOG_GRID' | 'CUSTOM' | 'AUTH_FLOW' | 'EXPANDABLE_MATRIX';
interface VisualContract {
    id: string;
    type: VisualContractType;
    label: string;
    endpoint: string;
    tab?: string;
    mapping?: Record<string, string>;
    filters?: FilterDescriptor[];
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
        icon?: string;
    }>;
    groupBy?: string;
    ghostGroups?: string[];
    headerActions?: {
        label: string;
        action: string;
    }[];
    groupActions?: {
        label: string;
        icon: string;
        action: string;
    }[];
    formMapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    component?: string;
    config?: Record<string, unknown>;
}
interface ModuleManifest {
    id: string;
    label: string;
    icon: string;
    category: string;
    version?: string;
    priority: number;
    endpoints?: Record<string, string>;
    visualContracts?: VisualContract[];
}
interface DiscoveredModule extends ModuleManifest {
    status: 'online' | 'offline';
    baseUrl?: string;
    component?: SarakComponent;
    components?: Record<string, SarakComponent>;
    error?: string;
}

interface DynamicRendererProps {
    contracts: VisualContract[];
    module?: DiscoveredModule;
}
/**
 * DynamicRenderer (v6.0-6.8 Smart Router)
 *
 * The UI-Core rendering engine. It receives a list of visual contracts
 * and builds the interface dynamically without prior knowledge
 * of the module's specifics.
 */
declare const DynamicRenderer: React__default.FC<DynamicRendererProps>;

/**
 * Hook de Descoberta Passiva (v9.0 Industrial)
 *
 * Este hook não realiza mais escaneamento proativo (Active Polling).
 * Ele apenas consome e formata os módulos que foram injetados ou registrados
 * localmente no SarakUIProvider.
 */
declare const useModuleDiscovery: (isEnabled?: boolean) => {
    modules: DiscoveredModule[];
    isLoading: boolean;
    lastScan: Date;
    refresh: () => void;
};

/**
 * Interface that defines the return of the routing hook
 */
interface SarakRouterState {
    currentPath: string;
    segments: string[];
    navigate: (path: string, replace?: boolean) => void;
    getParam: (index: number) => string | undefined;
}
/**
 * Hook for native routing based on the browser's History API.
 * Designed to replace memory-based activeModuleId state and allow deep linking.
 */
declare function useSarakRouter(basePath?: string): SarakRouterState;

export { ACTION_HANDLERS, type Accept, type ActionHandler, type ActionList, type AriaDirective, type BadgeSize, type BadgeVariant, type BindingExpression, type CardMove, type ComponentRegistry, type ComponentResolution, type ComponentType, type ConditionExpression, ConditionSyntaxError, type ContextMenuPosition, CustomizationPanel, DEFAULT_COLUMN_WIDTH, DESIGN_MANIFEST, DIRECTIVE_OWNERS, type DataNodeState, type DataSourceController, type DataSourceDirective, type DataSourceMethod, type DataSourceStates, type DatePickerValue, DesignScope, DeviceProvider, type DeviceType, type DirectiveName, type DiscoveredModule, type DispatchContext, DynamicRenderer, ExpandableCard, type ExpandedNode, FORM_META_KEY, type FileRejection, type FilterDescriptor, type FormModelDirective, type FormResetTrigger, type FormScope, FormScopeContext, type FormScopeDirective, type FormStore, IconMap, type IconName, type KanbanCard, type KanbanColumn, type LanguageOption, LanguageSelector, type LightboxImage, MIN_COLUMN_WIDTH, type ManifestAction, type ManifestComponent, type ManifestComponentProps, type ManifestNode, type ManifestProps, type ManifestRoot, type ManifestValidationError, type ManifestValidationResult, type ManifestValue, type MatrixNodeConfig, type MatrixParentData, type MatrixTreeNode, type ModalLayoutContext, type ModuleConfig, type ModuleManifest, ModuleSelector, type MultiSelectOption, NATIVE_COMPONENTS, type NativeComponentType, type NavigateFn, type NetworkInterceptor, type NetworkRequest, type NodeParts, type OverlayController, type OverlayRequest, type PersistDirective, type Pipe, RESERVED_DIRECTIVES, type RangeValue, type RenderForDirective, type RenderForResult, type ResponsiveDirective, type RouteMap, type RouteTarget, STORAGE_NAMESPACE, STRUCTURAL_KEYS, SUPPORTED_SCHEMA_VERSION, SarakAnalyticalPage, type SarakAnalyticalPageProps, SarakAuthScreen, type SarakAuthScreenProps, SarakBadge, type SarakBadgeProps, SarakCardGrid, SarakCatalogGrid, SarakChart, SarakChartEngine, SarakChat, type SarakColumn, type SarakComponent, type SarakComponentProps, SarakContextMenu, type SarakContextMenuProps, SarakDataEmpty, type SarakDataEmptyProps, SarakDataGrid, SarakDataGridImpl, type SarakDataGridProps, type SarakDataStore, SarakDataTable, SarakDataTableImpl, type SarakDataTableProps, SarakDatePicker, type SarakDatePickerProps, SarakDrawer, type SarakDrawerProps, SarakEmptyState, SarakErrorBoundary, type SarakErrorBoundaryProps, SarakExpandableMatrix, type SarakExpandableMatrixProps, SarakFallback, type SarakFallbackProps, SarakForm, SarakHidden, SarakIcon, type SarakIconProps, SarakKanbanImpl as SarakKanban, type SarakKanbanProps, SarakLightbox, type SarakLightboxProps, SarakManagementGrid, SarakManifestRenderer, SarakManifestRenderer as SarakManifestRendererDefault, type SarakManifestRendererProps, SarakMarkdownRenderer, type SarakMarkdownRendererProps, type SarakMatrixManifest, SarakModal, type SarakModalProps, type SarakModule, SarakMultiSelect, type SarakMultiSelectProps, type SarakOverlayController, SarakOverlayProvider, type SarakOverlayRequest, SarakPDFViewer, type SarakPDFViewerProps, SarakRangeSlider, type SarakRangeSliderProps, SarakRichText, type SarakRichTextProps, type SarakRouterState, SarakSecurityOrchestrator, SarakShell, SarakSkeleton, type SarakSkeletonProps, SarakSparkline, type SarakSparklineProps, SarakStats, type SarakTabItem, SarakTable, SarakTabs, type SarakTabsProps$1 as SarakTabsProps, SarakTimePicker, type SarakTimePickerProps, SarakToastProvider, SarakTooltip, type SarakTooltipProps, SarakTreeView, type SarakTreeViewProps, SarakUIProvider, SarakUploader, type SarakUploaderProps, type Selector, type ShellDirective, type SkeletonShape, type SlotMap, SocialButton, type SparklineVariant, type StateRecord, SubmitBlockedError, type ThemeDirective, ThemeToggle, type ToastController, type ToastOptions, type ToastVariant, type TooltipPosition, UserMenu, type UserPayload, VIRTUALIZE_THRESHOLD, type ValidationError, type ValidationRule, type ValidationRuleName, type ValidationSchema, type ValidationTypeName, type VisualContract, type VisualContractType, coerceEventValue, computeOffsets, createComponentRegistry, createFormScope, createSarakDataStore, debounce, defaultComponentRegistry, evaluateCondition, expandRenderFor, firstErrorMessage, getByPath, getLocalComponent, getPipe, getRegisteredModules, getSarakModule, hasPipe, interpolate, interpolateProps, isReservedDirective, isStructuralKey, moveCard, namespacedKey, readPersisted, registerComponent, registerLocalComponent, registerPipe, registerSarakModule, removePersisted, reorder, resolveBinding, resolveComponent, resolveExpression, resolveModelValue, resolveScopedPath, runActions, sanitizeRichText, separateNodeParts, setByPath, subscribeStorage, subscribeToRegistry, throttle, useDataSource, useDesignDraft, useFormScope, useModalLayoutStyles, useModuleDiscovery, useOverlay, usePersistedSlice, useSarakDevice, useSarakRouter, useSarakUI, useToast, validateManifestNode, validateManifestRoot, validateValue, widthOf, writePersisted };
