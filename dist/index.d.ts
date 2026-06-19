import React$1, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type DesignTokenId = 'accentColor' | 'aiGlowColor' | 'aiPanelBg' | 'animEnabled' | 'animFast' | 'animInstant' | 'animNormal' | 'animSlow' | 'atmosphereNoiseOpacity' | 'badgeRadius' | 'bgBaseColor' | 'bgGradientAngle' | 'bgGradientMode' | 'bgNoiseAnimation' | 'bgNoiseDensity' | 'bodyFont' | 'bodyLineHeight' | 'bodySize' | 'bodyWeight' | 'borderBeamEnabled' | 'borderRadius' | 'borderRadiusLg' | 'borderRadiusMd' | 'borderRadiusSm' | 'borderStyle' | 'borderType' | 'borderWidth' | 'btnActiveScale' | 'btnBackdropBlur' | 'btnBorderRadius' | 'btnGhostHoverBg' | 'btnHoverScale' | 'btnNeonGlowColor' | 'btnNeonPulseSpeed' | 'btnPrimaryBg' | 'btnPrimaryText' | 'btnRadiusBL' | 'btnRadiusBR' | 'btnRadiusTL' | 'btnRadiusTR' | 'btnSecondaryBg' | 'btnStyleType' | 'buttonIconPosition' | 'buttonWidthStrategy' | 'cardActionBtnBorderRadius' | 'cardActionBtnHoverBg' | 'cardActionBtnPadding' | 'cardActionBtnPrimaryBg' | 'cardActionBtnText' | 'cardActionClickScale' | 'cardBackdropBlur' | 'cardBackgroundColor' | 'cardBorderBottom' | 'cardBorderColor' | 'cardBorderLeft' | 'cardBorderOpacity' | 'cardBorderRadius' | 'cardBorderRight' | 'cardBorderTop' | 'cardBorderWidth' | 'cardContentAlignment' | 'cardFooterBg' | 'cardFooterBorder' | 'cardGeometricCut' | 'cardGlowColor' | 'cardGlowIntensity' | 'cardHeaderBg' | 'cardHeaderBorder' | 'cardHeaderPadding' | 'cardHoverGlowIncrease' | 'cardHoverStyle' | 'cardHoverTranslate' | 'cardImagePosition' | 'cardInnerGlowColor' | 'cardInnerGlowWidth' | 'cardLayoutDirection' | 'cardPaddingMd' | 'cardRadiusBL' | 'cardRadiusBR' | 'cardRadiusTL' | 'cardRadiusTR' | 'cardSearchBgFocus' | 'cardSearchBorderBeamActive' | 'cardSearchPlaceholderColor' | 'cardSearchTextFocusColor' | 'cardShadow' | 'cardShadowSpread' | 'cardSpotlightOpacity' | 'cardSurfaceOpacity' | 'cardTextAlign' | 'cardTextureOpacity' | 'cardTextureType' | 'cardTitleColor' | 'cardTitleFontSize' | 'cardTitleFontWeight' | 'cardTitleIconGlow' | 'cardTitleLetterSpacing' | 'cardVariant' | 'chartColorPalette' | 'chartGridOpacity' | 'chartShowGrid' | 'chartSmoothing' | 'chartThickness' | 'chartTooltipBg' | 'chartType' | 'chatAnimationSpeed' | 'chatBubbleRadius' | 'chatBubbleStyle' | 'chatUserBg' | 'checkboxActiveColor' | 'colorBgBody' | 'colorBgLayer1' | 'colorBgLayer2' | 'colorBgModal' | 'colorDepth' | 'colorPalette' | 'colorVariation' | 'contentAlignment' | 'contrastCurve' | 'easeMain' | 'easeOut' | 'flowGridStyle' | 'flowNodeRadius' | 'focusRingWidth' | 'formFieldDensity' | 'formLabelPosition' | 'formLayoutDirection' | 'glassBlur' | 'glassOpacity' | 'glassRoughness' | 'glassSaturation' | 'glassSpecularity' | 'globalBackgroundBlendMode' | 'globalBackgroundBlur' | 'globalBackgroundImageUrl' | 'globalBackgroundOpacity' | 'globalContrast' | 'globalFlowAlign' | 'globalFlowDirection' | 'globalSaturation' | 'globalSectionGap' | 'h1LetterSpacing' | 'h1LineHeight' | 'h1Size' | 'h1Weight' | 'h2LineHeight' | 'h2Size' | 'h2Weight' | 'headerAlignment' | 'headingFont' | 'headingTransform' | 'iconFamily' | 'iconStrokeWidth' | 'iconWeight' | 'identityAlignment' | 'identityFontFamily' | 'identityFontWeight' | 'identityHoverEffect' | 'identityPadding' | 'identityRedirectUrl' | 'identityTracking' | 'imageCardHoverZoom' | 'imageCardOverlayOpacity' | 'industrialRegistry' | 'inputBackdropBlur' | 'inputBg' | 'inputBorderColor' | 'inputBorderRadius' | 'inputBorderType' | 'inputErrorColor' | 'inputFocusBorderColor' | 'inputIconColor' | 'inputIconPosition' | 'inputPadding' | 'inputShadow' | 'inputSuccessColor' | 'inputTextColor' | 'isAutoHideEnabled' | 'isNavHidden' | 'isSplitViewEnabled' | 'layerBackdropBlur' | 'layerBackdropOpacity' | 'layeredShadows' | 'layerElevationFactor' | 'layout' | 'layoutDensity' | 'layoutGap' | 'layoutGapLg' | 'layoutGapMd' | 'layoutGapSm' | 'layoutGridTemplate' | 'layoutPadding' | 'matrixBlur' | 'matrixBorderColor' | 'matrixGap' | 'matrixItemBg' | 'matrixRadius' | 'matrixSearchBg' | 'maxContentWidth' | 'modalActionAlignment' | 'modalBorderRadius' | 'modalHeaderStyle' | 'modalOverlayBlur' | 'modalOverlayColor' | 'mode' | 'monoFont' | 'motionDurationFast' | 'motionDurationInstant' | 'motionDurationNormal' | 'motionDurationSlow' | 'motionEaseIn' | 'motionEaseMain' | 'motionEaseOut' | 'motionStaggerDelay' | 'navActiveMarkerColor' | 'navActiveMarkerGlow' | 'navbarLayout' | 'navigationStyle' | 'navItemActiveColor' | 'noiseIntensity' | 'pageTransitionType' | 'primaryColor' | 'reducedMotion' | 'scrollbarThumbColor' | 'scrollbarWidth' | 'scrollPadding' | 'scrollRadius' | 'scrollThumbColor' | 'scrollThumbHoverOpacity' | 'scrollThumbOpacity' | 'scrollTrackOpacity' | 'scrollWidth' | 'searchPositionSidebar' | 'searchPositionTopbar' | 'secondaryColor' | 'securityPulseSpeed' | 'securityShieldGlow' | 'shadowAmbientAlpha' | 'shadowColorMode' | 'shadowIntensity' | 'shadowOrientation' | 'shadowProjectionAlpha' | 'shadowProjectionBlur' | 'sidebarActiveColor' | 'sidebarBlur' | 'sidebarColor' | 'sidebarHoverColor' | 'sidebarMaxWidth' | 'sidebarMinWidth' | 'sidebarNoiseOpacity' | 'sidebarPosition' | 'sidebarShadow' | 'sidebarWidth' | 'statusErrorColor' | 'statusInfoColor' | 'statusSuccessColor' | 'statusWarningColor' | 'surfaceColor' | 'surfaceIntensity' | 'surfaceMaterial' | 'switchBackdropBlur' | 'switchLabelPosition' | 'switchPulseColor' | 'switchStyleType' | 'switchThumbBg' | 'switchTrackActiveBg' | 'systemTone' | 'tabGap' | 'tableActionPosition' | 'tableBorderColor' | 'tableBorderRadius' | 'tableCellPadding' | 'tableDensity' | 'tableHeaderBg' | 'tableRowHoverBg' | 'tableZebraStriping' | 'tabSectionMargin' | 'tertiaryColor' | 'textColorMaster' | 'textColorMuted' | 'textColorSecondary' | 'textGlowIntensity' | 'textSmoothing' | 'texture' | 'textureColor' | 'textureOpacity' | 'titleColor' | 'tooltipBg' | 'tooltipRadius' | 'topbarActiveColor' | 'topbarColor' | 'topbarHeight' | 'topbarHoverColor' | 'topbarNoiseOpacity' | 'topbarTitleColor' | 'vignetteOpacity' | 'vignetteSoftness' | 'zIndexBase' | 'zIndexModal' | 'zIndexSidebar' | 'zIndexToast' | 'zIndexTooltip';

/**
 * Contrato do Theme Payload com DOMÍNIO DE CHAVES FECHADO: somente design tokens
 * reais (DesignTokenId — gerado da SSOT MASTER_DESIGN_MAP, mesma fonte validada
 * pela paridade 1:1:1:1:1) + os campos legados/branding declarados em
 * SarakThemePayloadExtras. Qualquer outra chave (ex.: 'brandColorPrimary') passa
 * a ser ERRO DE COMPILAÇÃO — "a Interface do Payload dita a Realidade".
 */
type SarakThemePayload = Partial<Record<DesignTokenId, unknown>> & SarakThemePayloadExtras;
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
declare const SarakUIProvider: React$1.FC<SarakUIProviderProps>;

interface DesignScopeProps {
    design: any;
    children: React$1.ReactNode;
    className?: string;
    style?: React$1.CSSProperties;
}
/**
 * DesignScope (v12.0)
 *
 * Envolve um conteúdo em um escopo isolado de variáveis CSS de design.
 * Agora injeta também um DesignOverrideContext para que componentes que usam
 * useSarakUI() dentro deste escopo consumam o design correto (rascunho).
 */
declare const DesignScope: React$1.FC<DesignScopeProps & Record<string, any>>;

declare const ThemeToggle: React$1.FC;

interface SarakShellProps {
    children?: React$1.ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: React$1.ReactNode;
    user?: any;
    logout?: () => void;
    token?: string;
    authApi?: any;
}

/**
 * Sarak Shell Core — Interface Engine (Refactored v7.2.5)
 */
declare const SarakShell: React$1.FC<SarakShellProps>;

type DeviceType = 'smartphone' | 'tablet' | 'desktop';
declare const useSarakDevice: () => DeviceType;
interface DeviceProviderProps {
    children: ReactNode;
    /** Se fornecido, sequestra o valor (usado pelo Gêmeo Digital) */
    overrideDevice?: DeviceType;
}
declare const DeviceProvider: React$1.FC<DeviceProviderProps>;

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
declare const SarakAnalyticalPage: React$1.FC<SarakAnalyticalPageProps>;

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
declare const SarakHidden: React$1.FC<SarakHiddenProps>;

type IconName = 'AlertCircle' | 'Check' | 'X' | 'Menu' | 'Search' | 'Bell' | 'User' | 'LogOut' | 'Shield' | 'Globe' | 'ChevronDown' | 'ChevronLeft' | 'ChevronRight' | 'Zap' | 'LayoutDashboard' | 'Save' | 'Settings' | 'BarChart3' | 'Layout' | 'FileText' | 'MessageSquare' | 'History' | 'Network' | 'Box' | 'Type' | 'Lock' | 'Layers' | 'Grid' | 'AlignLeft' | 'LineChart' | 'Hash' | 'Copy' | 'RefreshCw' | 'Edit3' | 'CornerDownRight' | 'Activity' | 'Users' | 'ArrowRight' | 'FileSpreadsheet' | 'Download' | 'ArrowUpDown' | 'Database' | 'List' | 'CheckCircle2' | 'Loader2' | 'Calendar' | 'Trash2' | 'Plus' | 'UploadCloud' | 'MoreVertical' | 'Image' | 'File' | 'Edit' | 'Eye' | 'UserPlus';
declare const IconMap: Record<IconName, {
    lucide: any;
    phosphor: any;
    tabler: any;
}>;

interface SarakIconProps {
    name: IconName | string;
    size?: number | string;
    className?: string;
    color?: string;
    style?: React$1.CSSProperties;
    onClick?: () => void;
}
declare const SarakIcon: React$1.FC<SarakIconProps>;

/**
 * useDesignDraft (v12.1 - Data-Driven)
 * Orquestrador de rascunhos com isolamento de sandbox.
 */
declare const useDesignDraft: (sarak: any) => {
    draft: any;
    isDirty: boolean;
    isComponentDirty: (schemaId: string) => boolean;
    updateDraft: (key: string, value: any) => void;
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (tokenId: string) => void;
    handleThemePreview: (presetDesign: Record<string, any>, presetKeyId?: string) => void;
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
declare const CustomizationPanel: React$1.FC;

interface SocialButtonProps {
    provider: 'google' | 'github';
    variant: 'glass' | 'sovereign';
    onClick?: (provider: 'google' | 'github') => void;
    label?: string;
    hideLabel?: boolean;
    className?: string;
}
declare const SocialButton: React$1.FC<SocialButtonProps>;

interface ExpandableCardProps {
    title: string;
    iconContent?: React$1.ReactNode;
    helpButton?: React$1.ReactNode;
    children: React$1.ReactNode;
    className?: string;
    contentClassName?: string;
    baseHeight?: number;
}
declare const ExpandableCard: React$1.FC<ExpandableCardProps>;

declare const LanguageSelector: () => react_jsx_runtime.JSX.Element;
declare const UserMenu: ({ user, onPasswordModal, onLogout }: {
    user: any;
    onPasswordModal: () => void;
    onLogout: () => void;
}) => react_jsx_runtime.JSX.Element;
declare const ModuleSelector: ({ currentModule, setCurrentModule, modules }: {
    currentModule: string;
    setCurrentModule: (id: string) => void;
    modules: any[];
}) => react_jsx_runtime.JSX.Element;

interface SarakTableProps {
    endpoint: string;
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
declare const SarakTable: React$1.FC<SarakTableProps>;

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
declare const SarakCardGrid: React$1.FC<SarakCardGridProps>;

interface SarakStatsProps {
    endpoint?: string;
    data?: Record<string, any>;
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
declare const SarakStats: React$1.FC<SarakStatsProps>;

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
declare const SarakChart: React$1.FC<SarakChartProps>;

interface SarakFormProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>;
    mode?: 'create' | 'edit';
    initialData?: Record<string, any>;
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
declare const SarakForm: React$1.FC<SarakFormProps>;

interface SarakManagementGridProps {
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
declare const SarakManagementGrid: React$1.FC<SarakManagementGridProps>;

interface SarakChatProps {
    endpoint: string;
    modelsEndpoint?: string;
    label?: string;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
declare const SarakChat: React$1.FC<SarakChatProps>;

interface SarakSecurityOrchestratorProps {
    endpoint: string;
    label?: string;
    config?: any;
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
declare const SarakSecurityOrchestrator: React$1.FC<SarakSecurityOrchestratorProps>;

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
    onSubmit: (e: React$1.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{
            id: string;
            variant: any;
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
declare const SarakAuthScreen: React$1.FC<SarakAuthScreenProps>;

interface CatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: any;
}
interface SarakCatalogGridProps {
    items: CatalogItem[];
    loading?: boolean;
    title: string;
    subtitle?: string;
    categories?: Record<string, string>;
    onSync?: () => void;
    renderCard?: (item: CatalogItem) => React$1.ReactNode;
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
declare const SarakCatalogGrid: React$1.FC<SarakCatalogGridProps>;

interface MatrixNodeConfig {
    /** Variante visual de renderização do nó */
    variant?: 'card' | 'row' | 'badge' | 'switch' | 'clean';
    /** Se exibe checkbox/toggle para ativar/desativar */
    hasToggle?: boolean;
    /** Se o nó é expansível/colapsável */
    hasExpand?: boolean;
    /** Se o nó deve iniciar expandido */
    defaultExpanded?: boolean;
    /** Ícone customizado (Lucide ou elemento) */
    icon?: React$1.ComponentType<any>;
    /** Renderizador totalmente customizado para controle total */
    renderCustom?: (node: any, level: number, isActive: boolean, isExpanded: boolean, onToggle: () => void, onToggleExpand: () => void) => React$1.ReactNode;
}
interface SarakMatrixManifest {
    /** Mapeamento por nível de profundidade (0 para raiz, 1 para filhos, 2 para netos, etc.) */
    levels?: Record<number, MatrixNodeConfig>;
    /** Mapeamento dinâmico pelo atributo `node.type` */
    types?: Record<string, MatrixNodeConfig>;
    /** Configurações fallback padrão */
    default?: MatrixNodeConfig;
}
interface SarakExpandableMatrixProps {
    /** Itens principais (ex: Roles/Papéis) */
    data: any[];
    /** Todos os sub-itens possíveis (ex: Todas as Permissões) */
    subItems: any[];
    /** Função para checar se um sub-item está ativo em um item pai */
    activeMapping: (parentId: string, subItemId: string) => boolean;
    /** Callback disparado ao clicar no toggle */
    onToggle: (parentId: string, subItemId: string) => void;
    /** Renderizador customizado para o cabeçalho de cada item pai */
    renderItemHeader?: (item: any) => React$1.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}
declare const SarakExpandableMatrix: React$1.FC<SarakExpandableMatrixProps>;

interface SarakModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React$1.ReactNode;
    children: React$1.ReactNode;
    footer?: React$1.ReactNode;
    /** Se true, o clique no overlay (fundo) não fecha o modal */
    disableOverlayClick?: boolean;
    /** Se true, o botão de fechar não é renderizado */
    hideCloseButton?: boolean;
    /** Classe CSS customizada para o contêiner do modal */
    className?: string;
}
declare const SarakModal: React$1.FC<SarakModalProps>;

interface SarakDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    children: React$1.ReactNode;
    size?: string | number;
    className?: string;
}
/**
 * Componente de Painel Lateral Deslizante (Drawer).
 * Renderiza um overlay e conteúdo deslizante baseado na direção.
 */
declare const SarakDrawer: React$1.FC<SarakDrawerProps>;

interface ModalLayoutContext {
    headerClass: string;
    footerClass: string;
    closeButtonClass: string;
}
/**
 * Hook Controlador Estrutural (Camada 6) - Modais
 * Define como o Header (e botão de fechar) e o Footer (alinhamento de ações) se comportam.
 */
declare const useModalLayoutStyles: (design: any) => ModalLayoutContext;

interface SarakEmptyStateProps {
    type?: 'minimal' | 'abstract' | 'geometric';
}
declare const SarakEmptyState: React$1.FC<SarakEmptyStateProps>;

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
type BadgeSize = 'sm' | 'md' | 'lg';
interface SarakBadgeProps extends React$1.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Se true, o badge terá bordas mais arredondadas (estilo pill) */
    pill?: boolean;
    /** Se true, o fundo será translúcido/suave em vez de sólido */
    soft?: boolean;
}
declare const SarakBadge: React$1.FC<SarakBadgeProps>;

interface SarakTabItem {
    id: string;
    label: React$1.ReactNode;
    icon?: React$1.ReactNode;
    disabled?: boolean;
}
interface SarakTabsProps {
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
declare const SarakTabs: React$1.FC<SarakTabsProps>;

interface SarakTooltipProps {
    children: React$1.ReactNode;
    content: React$1.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
    /** Se true, desativa o tooltip */
    disabled?: boolean;
}
declare const SarakTooltip: React$1.FC<SarakTooltipProps>;

interface SarakChartEngineProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter' | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst' | 'histogram' | 'boxplot';
    data: any[];
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
declare const SarakChartEngine: React$1.FC<SarakChartEngineProps>;

/**
 * Sarak Discovery Core Types (v11.0)
 */
type VisualContractType = 'TABLE' | 'STATS' | 'CARD_GRID' | 'MANAGEMENT_GRID' | 'FORM' | 'CHAT_INTERFACE' | 'CHART' | 'FLOW_DIAGRAM' | 'ELITE_CHART' | 'ADVANCED_CHAT' | 'SECURITY_ORCHESTRATOR' | 'CATALOG_GRID' | 'CUSTOM' | 'AUTH_FLOW' | 'EXPANDABLE_MATRIX';
interface VisualContract {
    id: string;
    type: VisualContractType;
    label: string;
    endpoint: string;
    tab?: string;
    mapping?: Record<string, string>;
    filters?: any[];
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
    config?: any;
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
    component?: any;
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
declare const DynamicRenderer: React$1.FC<DynamicRendererProps>;

/**
 * Sarak Registry (v5.5)
 *
 * Local manager for registered modules to avoid dependency on lib-shared.
 */
interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    component?: React.ComponentType<any>;
    components?: Record<string, React.ComponentType<any>>;
    priority?: number;
    description?: string;
}
/**
 * Subscribes to registry changes (v9.0 Passive Discovery).
 */
declare const subscribeToRegistry: (listener: () => void) => () => boolean;
/**
 * Registers a local component linked to a system ID (v6.5).
 */
declare const registerLocalComponent: (id: string, component: React.ComponentType<any>) => void;
/**
 * Returns the component associated with an ID, if it exists.
 */
declare const getLocalComponent: (id: string) => React.ComponentType<any> | undefined;
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

export { type BadgeSize, type BadgeVariant, CustomizationPanel, DESIGN_MANIFEST, DesignScope, DeviceProvider, type DeviceType, type DiscoveredModule, DynamicRenderer, ExpandableCard, IconMap, type IconName, LanguageSelector, type MatrixNodeConfig, type ModalLayoutContext, type ModuleManifest, ModuleSelector, SarakAnalyticalPage, type SarakAnalyticalPageProps, SarakAuthScreen, type SarakAuthScreenProps, SarakBadge, type SarakBadgeProps, SarakCardGrid, SarakCatalogGrid, SarakChart, SarakChartEngine, SarakChat, SarakDrawer, type SarakDrawerProps, SarakEmptyState, SarakExpandableMatrix, type SarakExpandableMatrixProps, SarakForm, SarakHidden, SarakIcon, type SarakIconProps, SarakManagementGrid, type SarakMatrixManifest, SarakModal, type SarakModalProps, type SarakModule, type SarakRouterState, SarakSecurityOrchestrator, SarakShell, SarakStats, type SarakTabItem, SarakTable, SarakTabs, type SarakTabsProps, SarakTooltip, type SarakTooltipProps, SarakUIProvider, SocialButton, ThemeToggle, UserMenu, type VisualContract, type VisualContractType, getLocalComponent, getRegisteredModules, getSarakModule, registerLocalComponent, registerSarakModule, subscribeToRegistry, useDesignDraft, useModalLayoutStyles, useModuleDiscovery, useSarakDevice, useSarakRouter, useSarakUI };
