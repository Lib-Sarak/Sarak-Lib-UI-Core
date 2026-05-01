import React$1, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

declare const useSarakUI: () => any;
interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: any;
    token?: string | null;
    userId?: string | null;
}
declare const SarakUIProvider: React$1.FC<SarakUIProviderProps>;

declare const ThemeToggle: React$1.FC;

/**
 * Sarak Atomic Design Tokens (v5.5 - Sovereign)
 *
 * Este arquivo contém o DNA visual do ecossistema Sarak, desacoplado do sarak-lib-shared.
 * Migrado para garantir autonomia total da UI.
 */
declare const LAYOUTS: {
    GLASS: {
        id: string;
        name: string;
        class: string;
        animation: string;
        emoji: string;
    };
    CYBERPUNK: {
        id: string;
        name: string;
        class: string;
        animation: string;
        emoji: string;
    };
    PRESTIGE: {
        id: string;
        name: string;
        class: string;
        animation: string;
        emoji: string;
    };
    ORGANIC: {
        id: string;
        name: string;
        class: string;
        animation: string;
        emoji: string;
    };
    ATMOSPHERIC: {
        id: string;
        name: string;
        class: string;
        animation: string;
        emoji: string;
    };
};
declare const SCALES: {
    P1: {
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
    G1: {
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
declare const BASE_PRESETS: any;

interface SarakShellProps {
    children?: ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: ReactNode;
    user?: any;
    logout?: () => void;
    token?: string;
    authApi?: any;
}
/**
 * Sarak Shell Core — Interface Engine
 */
declare const SarakShell: React$1.FC<SarakShellProps>;

/**
 * CustomizationPanel (v5.4)
 * Single resilient and self-adjusting configuration center.
 */
declare const CustomizationPanel: React$1.FC;

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

/**
 * Sarak Atomic Discovery (v5.5)
 *
 * Lista de endpoints base para escaneamento de manifestos.
 * Em produção, isso pode ser alimentado por um Service Registry ou Config Map.
 */
declare const DISCOVERY_ENDPOINTS: string[];
type VisualContractType = 'TABLE' | 'STATS' | 'CARD_GRID' | 'MANAGEMENT_GRID' | 'FORM' | 'CHAT_INTERFACE' | 'CHART' | 'FLOW_DIAGRAM' | 'ELITE_CHART' | 'ADVANCED_CHAT';
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

/**
 * Hook de Descoberta Atômica (v5.5)
 *
 * Escaneia os microserviços em busca de manifestos e gerencia o estado de disponibilidade.
 */
declare const useModuleDiscovery: (isEnabled?: boolean) => {
    modules: DiscoveredModule[];
    isLoading: boolean;
    lastScan: Date | null;
    refresh: () => Promise<void>;
};

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
    component: React.ComponentType<any>;
    priority?: number;
    description?: string;
}
/**
 * Registers a local component linked to a system ID (v6.5).
 */
declare const registerLocalComponent: (id: string, component: React.ComponentType<any>) => void;
/**
 * Returns the component associated with an ID, if it exists.
 */
declare const getLocalComponent: (id: string) => React.ComponentType<any> | undefined;
/**
 * Registers a complete module (legacy external modules).
 */
declare const registerSarakModule: (module: SarakModule) => void;
/**
 * Returns the list of legacy registered modules.
 */
declare const getRegisteredModules: () => SarakModule[];
/**
 * Retrieves a specific module by ID.
 */
declare const getSarakModule: (id: string) => SarakModule | undefined;

export { ALL_LANGUAGES, BASE_PRESETS, CustomizationPanel, DENSITY, DISCOVERY_ENDPOINTS, type DiscoveredModule, ExpandableCard, LANGUAGES, LAYOUTS, LanguageSelector, type ModuleManifest, ModuleSelector, NAVIGATION_STYLES, PRIMARY_COLORS, SCALES, type SarakModule, SarakShell, SarakUIProvider, TEXTURE_LIBRARY, THEME_EFFECTS, THEME_FONTS, ThemeToggle, UserMenu, type VisualContract, type VisualContractType, getLocalComponent, getRegisteredModules, getSarakModule, registerLocalComponent, registerSarakModule, useModuleDiscovery, useSarakUI };
