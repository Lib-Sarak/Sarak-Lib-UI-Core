import { ReactNode } from 'react';

export interface SarakUIOptions {
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

export interface SarakUIContextType {
    discoveryEndpoints: string[];
    design: any;
    setDesign: (design: any) => void;
    applyConfig: (partial: any) => void;
    applyFullConfig: (config: any) => void;
    registeredModules: any[];
    layouts: any[];
    isHydrated: boolean;
    options: SarakUIOptions;
}

export interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: any;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
}
