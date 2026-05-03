import React$1, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface SarakUIOptions {
    endpoints?: {
        baseUrl?: string;
        designPath?: string;
        discoveryPath?: string;
        discovery?: string[];
    };
    manifest?: any;
    persistence?: {
        strategy?: 'local' | 'remote' | 'hybrid';
        storageKey?: string;
        onSave?: (design: any) => Promise<void> | void;
        onLoad?: () => Promise<any> | any;
    };
    theme?: {
        defaultTheme?: string;
        extraTokens?: any;
    };
}
interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: any;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
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

declare const useSarakUI: () => any;
/**
 * SarakUIProvider Orchestrator (v10.1)
 *
 * Este é o ponto de entrada principal da biblioteca Sarak UI.
 * Ele orquestra o estado do design, a descoberta de módulos e a injeção de estilos.
 */
declare const SarakUIProvider: React$1.FC<SarakUIProviderProps>;

declare const ThemeToggle: React$1.FC;

/**
 * Sarak Atomic Design Tokens (v5.5 - Sovereign)
 *
 * Este arquivo contém o DNA visual do ecossistema Sarak, desacoplado do sarak-lib-shared.
 * Migrado para garantir autonomia total da UI.
 */
declare const SCALES: {
    PP: {
        id: string;
        factor: string;
        label: string;
    };
    P: {
        id: string;
        factor: string;
        label: string;
    };
    M: {
        id: string;
        factor: string;
        label: string;
    };
    G: {
        id: string;
        factor: string;
        label: string;
    };
    GG: {
        id: string;
        factor: string;
        label: string;
    };
};
declare const DENSITY: {
    COMPACT: {
        id: string;
        gap: string;
        pad: string;
        fontSizeBase: string;
        radius: string;
        label: string;
    };
    STANDARD: {
        id: string;
        gap: string;
        pad: string;
        fontSizeBase: string;
        radius: string;
        label: string;
    };
    COMFORTABLE: {
        id: string;
        gap: string;
        pad: string;
        fontSizeBase: string;
        radius: string;
        label: string;
    };
};
declare const PRIMARY_COLORS: {
    name: string;
    value: string;
}[];
declare const COLOR_PALETTES: ({
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        surface: string;
        success: string;
        warning: string;
        error: string;
        body?: undefined;
    };
} | {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        surface: string;
        body: string;
        success: string;
        warning: string;
        error: string;
    };
})[];
declare const NAVIGATION_STYLES: {
    SIDEBAR: string;
    TOPBAR: string;
    FLOATING: string;
    MINIMAL: string;
};
declare const LANGUAGES: {
    id: string;
    label: string;
    name: string;
    flag: string;
    sigla: string;
}[];
declare const ALL_LANGUAGES: {
    id: string;
    label: string;
    name: string;
    flag: string;
    sigla: string;
}[];
declare const THEME_FONTS: {
    id: string;
    name: string;
    value: string;
    category: string;
    weights: number[];
}[];
declare const TEXTURE_LIBRARY: {
    id: string;
    name: string;
    className: string;
}[];
declare const THEME_EFFECTS: {
    page: {
        none: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                };
                animate: {
                    opacity: number;
                };
                exit: {
                    opacity: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        fade: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                };
                animate: {
                    opacity: number;
                };
                exit: {
                    opacity: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        slideUp: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    y: number;
                };
                exit: {
                    opacity: number;
                    y: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        slideLeft: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    x: number;
                };
                animate: {
                    opacity: number;
                    x: number;
                };
                exit: {
                    opacity: number;
                    x: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        scale: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    scale: number;
                };
                animate: {
                    opacity: number;
                    scale: number;
                };
                exit: {
                    opacity: number;
                    scale: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        blur: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    filter: string;
                };
                animate: {
                    opacity: number;
                    filter: string;
                };
                exit: {
                    opacity: number;
                    filter: string;
                };
                transition: {
                    duration: number;
                };
            };
        };
        perspective: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    rotateX: number;
                    scale: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    rotateX: number;
                    scale: number;
                    y: number;
                };
                exit: {
                    opacity: number;
                    rotateX: number;
                    scale: number;
                    y: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        flip: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    rotateY: number;
                };
                animate: {
                    opacity: number;
                    rotateY: number;
                };
                exit: {
                    opacity: number;
                    rotateY: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        slideDown: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    y: number;
                };
                exit: {
                    opacity: number;
                    y: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        elastic: {
            name: string;
            page: {
                initial: {
                    opacity: number;
                    scale: number;
                };
                animate: {
                    opacity: number;
                    scale: number;
                };
                exit: {
                    opacity: number;
                    scale: number;
                };
                transition: {
                    type: string;
                    damping: number;
                    stiffness: number;
                };
            };
        };
    };
    hover: {
        none: {};
        lift: {
            whileHover: {
                y: number;
                scale: number;
            };
            whileTap: {
                scale: number;
            };
        };
        glow: {
            whileHover: {
                boxShadow: string;
                scale: number;
            };
        };
        glass: {
            whileHover: {
                backgroundColor: string;
                backdropFilter: string;
            };
        };
        outline: {
            whileHover: {
                outline: string;
                outlineOffset: string;
            };
        };
    };
};
declare const DASHBOARD_TEMPLATES: {
    id: string;
    name: string;
    description: string;
}[];
declare const CHART_PRESETS: {
    id: string;
    name: string;
    description: string;
}[];

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

declare const useDesignDraft: (sarak: any) => {
    draft: {
        layout: any;
        mode: any;
        primaryColor: any;
        secondaryColor: any;
        tertiaryColor: any;
        navigationStyle: any;
        sidebarWidth: any;
        topbarHeight: any;
        colorPalette: any;
        dashboardTemplate: any;
        fontScale: any;
        layoutDensity: any;
        headingFont: any;
        subtitleFont: any;
        bodyFont: any;
        headingWeight: any;
        headingLetterSpacing: any;
        borderRadius: any;
        layoutGap: any;
        cardPadding: any;
        borderWidth: any;
        borderStyle: any;
        glassOpacity: any;
        glassBlur: any;
        shadowIntensity: any;
        isGeometricCut: any;
        animationSpeed: any;
        tabFont: any;
        systemName: any;
        logoUrl: any;
        logoDarkUrl: any;
        logoScale: any;
        logoPosition: any;
        systemTone: any;
        emptyStateId: any;
        surfaceMaterial: any;
        borderType: any;
        interfaceElasticity: any;
        isSplitViewEnabled: any;
        secondaryModuleId: any;
        searchStyle: any;
        chartPalette: any;
        chartStyle: any;
        shadowOrientation: any;
        shadowColorMode: any;
        isAutoHideEnabled: any;
        chatBubbleStyle: any;
        chatAnimationSpeed: any;
        flowGridStyle: any;
        flowNodeRadius: any;
        chartShowGrid: any;
        chartType: any;
        chartThickness: any;
        chartSmoothing: any;
        tabGap: any;
        tabSectionMargin: any;
        texture: any;
        textureOpacity: any;
        textureColor: any;
        scaleRatio: any;
        contrastCurve: any;
        layeredShadows: any;
        isNavHidden: any;
        hoverLiftEnabled: any;
        spotlightEnabled: any;
        magneticPullEnabled: any;
        borderBeamEnabled: any;
        performanceMode: any;
        sidebarNoiseOpacity: any;
        topbarNoiseOpacity: any;
        cardNoiseOpacity: any;
        sidebarHoverColor: any;
        sidebarActiveColor: any;
        topbarHoverColor: any;
        topbarActiveColor: any;
        cardHoverColor: any;
        cardActiveColor: any;
        colorDepth: any;
        colorVariation: any;
        sidebarColor: any;
        topbarColor: any;
        cardBackgroundColor: any;
        cardBorderColor: any;
        buttonColor: any;
        buttonHoverColor: any;
        titleColor: any;
        successColor: any;
        warningColor: any;
        errorColor: any;
        atmosphereNoiseOpacity: any;
        borderRadiusSm: any;
        borderRadiusMd: any;
        borderRadiusLg: any;
        layoutGapSm: any;
        layoutGapMd: any;
        layoutGapLg: any;
        cardPaddingSm: any;
        cardPaddingMd: any;
        cardPaddingLg: any;
    };
    updateDraft: (key: string, value: any) => void;
    handleThemePreview: (id: string) => void;
    handleApplyToSystem: () => void;
    toast: {
        type: "success" | "warning";
        message: string;
    } | null;
    showToast: (type: "success" | "warning", message: string) => void;
};

/**
 * CustomizationPanel (v5.4)
 * Single resilient and self-adjusting configuration center.
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
 * Sarak Discovery Tokens (v9.0 Industrial)
 *
 * Endpoints are now injected dynamically via the consumer application.
 * Hardcoded polling has been decommissioned.
 */
declare const DISCOVERY_ENDPOINTS: string[];
type VisualContractType = 'TABLE' | 'STATS' | 'CARD_GRID' | 'MANAGEMENT_GRID' | 'FORM' | 'CHAT_INTERFACE' | 'CHART' | 'FLOW_DIAGRAM' | 'ELITE_CHART' | 'ADVANCED_CHAT' | 'SECURITY_ORCHESTRATOR' | 'CATALOG_GRID' | 'CUSTOM' | 'AUTH_FLOW';
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
    version: string;
    priority: number;
    endpoints: Record<string, string>;
    visualContracts?: VisualContract[];
}
interface DiscoveredModule extends ModuleManifest {
    status: 'online' | 'offline';
    baseUrl: string;
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
    modules: any;
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

export { ALL_LANGUAGES, CHART_PRESETS, COLOR_PALETTES, CustomizationPanel, DASHBOARD_TEMPLATES, DENSITY, DESIGN_MANIFEST, DISCOVERY_ENDPOINTS, type DiscoveredModule, DynamicRenderer, ExpandableCard, LANGUAGES, LanguageSelector, type ModuleManifest, ModuleSelector, NAVIGATION_STYLES, PRIMARY_COLORS, SCALES, SarakAuthScreen, SarakCardGrid, SarakCatalogGrid, SarakChart, SarakChartEngine, SarakChat, SarakForm, SarakManagementGrid, type SarakModule, type SarakRouterState, SarakSecurityOrchestrator, SarakShell, SarakStats, SarakTable, SarakUIProvider, SocialButton, TEXTURE_LIBRARY, THEME_EFFECTS, THEME_FONTS, ThemeToggle, UserMenu, type VisualContract, type VisualContractType, getLocalComponent, getRegisteredModules, getSarakModule, registerLocalComponent, registerSarakModule, subscribeToRegistry, useDesignDraft, useModuleDiscovery, useSarakRouter, useSarakUI };
