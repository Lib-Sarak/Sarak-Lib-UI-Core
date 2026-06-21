import * as React$1 from 'react';
import React__default, { ReactNode } from 'react';
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
declare const SarakUIProvider: React__default.FC<SarakUIProviderProps>;

interface DesignScopeProps {
    design: any;
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
declare const DesignScope: React__default.FC<DesignScopeProps & Record<string, any>>;

declare const ThemeToggle: React__default.FC;

interface SarakShellProps {
    children?: React__default.ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: React__default.ReactNode;
    user?: any;
    logout?: () => void;
    token?: string;
    authApi?: any;
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
    lucide: any;
    phosphor: any;
    tabler: any;
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
declare const SarakTable: React__default.FC<SarakTableProps>;

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
declare const SarakCardGrid: React__default.FC<SarakCardGridProps>;

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
declare const SarakStats: React__default.FC<SarakStatsProps>;

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
declare const SarakForm: React__default.FC<SarakFormProps>;

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
declare const SarakManagementGrid: React__default.FC<SarakManagementGridProps>;

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
declare const SarakAuthScreen: React__default.FC<SarakAuthScreenProps>;

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
    icon?: React__default.ComponentType<any>;
    /** Renderizador totalmente customizado para controle total */
    renderCustom?: (node: any, level: number, isActive: boolean, isExpanded: boolean, onToggle: () => void, onToggleExpand: () => void) => React__default.ReactNode;
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
    renderItemHeader?: (item: any) => React__default.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}
declare const SarakExpandableMatrix: React__default.FC<SarakExpandableMatrixProps>;

interface SarakModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React__default.ReactNode;
    children: React__default.ReactNode;
    footer?: React__default.ReactNode;
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

interface SarakTooltipProps {
    children: React__default.ReactNode;
    content: React__default.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
    /** Se true, desativa o tooltip */
    disabled?: boolean;
}
declare const SarakTooltip: React__default.FC<SarakTooltipProps>;

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
declare const SarakChartEngine: React__default.FC<SarakChartEngineProps>;

/**
 * Manifest Schema e Gramática do Nó (Spec 20 — Onda 0)
 *
 * `ManifestNode` é a Lei do JSON do bloco funcional — análoga ao `SarakThemePayload`
 * para o Design Engine. Todos os motores (renderFor, pipes, dispatcher, condicional,
 * validação) consomem esta gramática única.
 *
 * Contrato Zero Any (Regra 3): cada diretiva tem tipo próprio; não há `any` nem
 * `Record<string, unknown>` aberto nas diretivas. Nesta onda (0) as engines donas
 * (23–42) ainda não existem, então as diretivas são tipadas como PLACEHOLDERS
 * versionados — formato estável que as specs donas refinam sem quebrar o contrato.
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
    /** Atraso de disparo em ms (debounce declarativo). */
    debounce?: number;
}
/** Lista de ações associadas a um evento/nó (Spec 25). */
type ActionList = ManifestAction[];
/** Diretiva de persistência local (Spec 28). */
interface PersistDirective {
    /** Chave sob a qual o estado é salvo/restaurado no storage. */
    key: string;
}
/** Regra única de validação de campo (Spec 29). */
interface ValidationRule {
    /** Identificador da regra: `required`, `pattern`, `min`, `max`, etc. */
    rule: string;
    /** Argumento da regra (ex.: o regex de `pattern`). */
    value?: ManifestValue;
    /** Mensagem exibida quando a regra falha. */
    message?: string;
}
/** Schema de validação de um campo/formulário (Spec 29). */
type ValidationSchema = ValidationRule[];
/** Diretiva de fonte de dados assíncrona (Spec 31). */
interface DataSourceDirective {
    /** Endpoint/identificador da fonte. */
    endpoint: string;
    /** Caminho no estado onde o resultado é depositado. */
    target?: string;
}
/** Diretiva de modelo de formulário / two-way binding (Spec 32). */
interface FormModelDirective {
    /** Caminho no estado vinculado ao campo. */
    path: string;
}
/** Diretiva responsiva (Spec 16). Override de props por breakpoint. */
interface ResponsiveDirective {
    /** Overrides aplicados por breakpoint (`desktop`/`tablet`/`mobile`). */
    breakpoints: Record<string, ManifestProps>;
}
/** Mapa de rotas declarativas (Spec 33). */
type RouteMap = Record<string, ManifestNode>;
/** Diretiva de app-shell (Spec 33). */
interface ShellDirective {
    /** Identificador do layout de shell. */
    layout?: string;
}
/** Diretiva de tema por região (Spec 42 — bridge com DesignScope). */
interface ThemeDirective {
    /** Nome do preset/escopo de tema aplicado à sub-árvore. */
    scope: string;
}
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
    form?: FormModelDirective;
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
declare const STRUCTURAL_KEYS: readonly ["type", "id", "props", "children", "schemaVersion"];
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
 * preservando o resto da árvore por referência (barato e anti-loop). Retorna a
 * nova raiz; objetos não tocados mantêm identidade (seletores não disparam à toa).
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
 * Mapa Nativo de Componentes (Spec 22 — Regra 1)
 *
 * Conjunto oficial de átomos resolvíveis por `type` no Manifesto. As chaves deste
 * mapa derivam o tipo `ComponentType` (união de string-literais), garantindo
 * autocomplete e barrando `type` inválido em tempo de compilação.
 *
 * Os átomos de micro-layout (Spec 10) já existem em `components/atomic/Layouts/` —
 * aqui apenas os registramos (decisão da Onda 0: verificar e conformar, não reescrever).
 * Componentes pesados (DataGrid, PDFViewer, charts) entram aqui via `React.lazy`
 * quando suas specs (12/15) forem implementadas.
 */
/**
 * Registro nativo. `as const` em conjunto com `satisfies` mantém a inferência das
 * chaves literais (para derivar `ComponentType`) sem afrouxar a tipagem dos valores.
 */
declare const NATIVE_COMPONENTS: {
    readonly SarakFlex: React$1.FC<SarakFlexProps>;
    readonly SarakGrid: React$1.FC<SarakGridProps>;
    readonly SarakSplitPane: React$1.FC<SarakSplitPaneProps>;
    readonly SarakTabs: React$1.FC<SarakTabsProps>;
    readonly SarakAccordion: React$1.FC<SarakAccordionProps>;
    readonly SarakFormGroup: React$1.FC<SarakFormGroupProps>;
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
 * SarakManifestRenderer — versão MÍNIMA (harness da Onda 0)
 *
 * Conforme a nota da §3.1 do índice do plano, o Renderer (Spec 30) existe em versão
 * mínima já na Onda 0 para PROVAR a fundação (20/21/22) ponta-a-ponta. Esta versão:
 *  - valida o nó raiz (Spec 20, Regra 5) e cai no fallback de "Manifesto Inválido";
 *  - resolve `type` pelo Component Registry (Spec 22);
 *  - separa `props` de diretivas e repassa SOMENTE `props` ao átomo — diretivas
 *    NUNCA vazam ao DOM (Spec 20, Regra 4);
 *  - renderiza `children` recursivamente, isolando types desconhecidos no fallback.
 *
 * O processamento das diretivas (renderFor, bindings, actions, renderIf…) é das ondas
 * seguintes; aqui elas são apenas removidas do caminho visual. O `dataStore` é aceito
 * e disponibilizado para essas engines futuras, com a árvore reagindo a mudanças.
 */

interface SarakManifestRendererProps {
    /** Nó raiz do manifesto (deve declarar `schemaVersion`). */
    manifest: unknown;
    /** Store reativo opcional (Spec 21), injetado pelo importador. */
    dataStore?: SarakDataStore<StateRecord>;
    /** Registry a usar; default = singleton da biblioteca. */
    registry?: ComponentRegistry;
}
/**
 * Harness que materializa um manifesto. Se o store for fornecido, a árvore re-renderiza
 * quando o estado muda (plumbing reativo pronto para as engines de binding das ondas 1+).
 */
declare const SarakManifestRenderer: React__default.FC<SarakManifestRendererProps>;

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
declare const DynamicRenderer: React__default.FC<DynamicRendererProps>;

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

export { type ActionList, type AriaDirective, type BadgeSize, type BadgeVariant, type BindingExpression, type ComponentRegistry, type ComponentResolution, type ComponentType, type ConditionExpression, CustomizationPanel, DESIGN_MANIFEST, DIRECTIVE_OWNERS, type DataSourceDirective, DesignScope, DeviceProvider, type DeviceType, type DirectiveName, type DiscoveredModule, DynamicRenderer, ExpandableCard, type FormModelDirective, IconMap, type IconName, LanguageSelector, type ManifestAction, type ManifestComponent, type ManifestComponentProps, type ManifestNode, type ManifestProps, type ManifestRoot, type ManifestValidationError, type ManifestValidationResult, type ManifestValue, type MatrixNodeConfig, type ModalLayoutContext, type ModuleManifest, ModuleSelector, NATIVE_COMPONENTS, type NativeComponentType, type NodeParts, type PersistDirective, RESERVED_DIRECTIVES, type RenderForDirective, type ResponsiveDirective, type RouteMap, STRUCTURAL_KEYS, SUPPORTED_SCHEMA_VERSION, SarakAnalyticalPage, type SarakAnalyticalPageProps, SarakAuthScreen, type SarakAuthScreenProps, SarakBadge, type SarakBadgeProps, SarakCardGrid, SarakCatalogGrid, SarakChart, SarakChartEngine, SarakChat, type SarakDataStore, SarakDrawer, type SarakDrawerProps, SarakEmptyState, SarakExpandableMatrix, type SarakExpandableMatrixProps, SarakFallback, type SarakFallbackProps, SarakForm, SarakHidden, SarakIcon, type SarakIconProps, SarakManagementGrid, SarakManifestRenderer, SarakManifestRenderer as SarakManifestRendererDefault, type SarakManifestRendererProps, type SarakMatrixManifest, SarakModal, type SarakModalProps, type SarakModule, type SarakRouterState, SarakSecurityOrchestrator, SarakShell, SarakStats, type SarakTabItem, SarakTable, SarakTabs, type SarakTabsProps$1 as SarakTabsProps, SarakTooltip, type SarakTooltipProps, SarakUIProvider, type Selector, type ShellDirective, type SlotMap, SocialButton, type StateRecord, type ThemeDirective, ThemeToggle, UserMenu, type ValidationRule, type ValidationSchema, type VisualContract, type VisualContractType, createComponentRegistry, createSarakDataStore, defaultComponentRegistry, getByPath, getLocalComponent, getRegisteredModules, getSarakModule, isReservedDirective, isStructuralKey, registerComponent, registerLocalComponent, registerSarakModule, resolveComponent, resolveScopedPath, separateNodeParts, setByPath, subscribeToRegistry, useDesignDraft, useModalLayoutStyles, useModuleDiscovery, useSarakDevice, useSarakRouter, useSarakUI, validateManifestNode, validateManifestRoot };
