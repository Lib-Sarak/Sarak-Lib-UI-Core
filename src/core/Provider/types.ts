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
        strictBackendSync?: boolean;
    };
    theme?: {
        defaultTheme?: string;
        extraTokens?: any;
    };
}

export interface SarakUIContextType {
    discoveryEndpoints: string[];
    design: any;
    draftDesign: any | null; // Rascunho ativo (para Live Preview)
    isDrafting: boolean; // Flag explícita de modo rascunho
    setIsDrafting: (active: boolean) => void;
    lockDrafting: () => void;
    setDesign: (design: any) => void;
    setDraftDesign: (design: any | null) => void;
    applyConfig: (partial: any) => void;
    applyFullConfig: (config: any) => void;
    applyConfigRaw: (partial: any) => void; // Canal direto para o sistema (ignora rascunho)
    applyFullConfigRaw: (config: any) => void; // Canal direto para o sistema (ignora rascunho)
    registeredModules: any[];
    layouts: any[];
    isHydrated: boolean;
    options: SarakUIOptions;
    allThemes: any[]; // Array unificado (Scripts + DB) para a interface
}

export interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: any;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
    customThemes?: any[]; // Temas vindos do banco de dados (UI.custom_themes)
    activeThemeId?: string; // ID do tema atualmente selecionado no banco
}
