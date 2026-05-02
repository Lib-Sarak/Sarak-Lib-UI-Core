import React, { ReactNode, useEffect, useMemo, useContext } from 'react';
import '../../styles/sarak-base.css';
import { LAYOUTS } from '../../constants/theme-models';
import { NoiseOverlay } from '../../effects/NoiseOverlay';

// Novos Módulos Refatorados
import { SarakUIContextType, SarakUIOptions, SarakUIProviderProps } from './types';
import { DEFAULT_UI_BASE_URL } from './constants';
import { useRegistryManager } from './hooks/useRegistryManager';
import { useDesignManager } from './hooks/useDesignManager';
import { DesignInjector } from './components/DesignInjector';

// Re-exports para manter compatibilidade com arquivos que importam do Provider
export * from './types';
export { computeColorVariants } from './utils/color-engine';
export { DESIGN_MANIFEST } from './manifest';

// --- SARAK UI BRIDGE CONTEXT ---
export const UIContext = React.createContext<SarakUIContextType | undefined>(undefined);

export const useSarakUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        return {
            discoveryEndpoints: [],
            design: {},
            registeredModules: [],
            layouts: [],
            isHydrated: false,
            applyConfig: () => { },
            applyFullConfig: () => { }
        } as any;
    }
    return {
        ...context,
        ...context.design
    };
};

/**
 * SarakUIProvider Orchestrator (v10.1)
 * 
 * Este é o ponto de entrada principal da biblioteca Sarak UI.
 * Ele orquestra o estado do design, a descoberta de módulos e a injeção de estilos.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({
    children,
    discoveryEndpoints = [],
    config: initialPropsConfig = {},
    token,
    userId,
    options = {}
}) => {
    // 1. Gerenciamento do Registro e Discovery
    const { registeredModules, isHydrated } = useRegistryManager(options);

    // 2. Gerenciamento do Estado de Design e Persistência
    const { design, setDesign, applyConfig, applyFullConfig } = useDesignManager({
        initialConfig: initialPropsConfig,
        options,
        token,
        isHydrated
    });

    // 3. Injeção de Fontes Avançadas (Core Optimization)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const domains = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
        domains.forEach(domain => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            document.head.appendChild(preconnect);
        });

        const ID = 'sarak-core-fonts';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    // 4. Injeção de Estilos Críticos (Pre-paint Sync)
    const criticalStyles = useMemo(() => {
        const sidebarW = design.sidebarWidth || 240;
        const primaryHex = design.primaryColor || '#00f2ff';
        const isDark = design.mode === 'dark';
        
        return `
            :root {
                --sarak-sidebar-width: ${sidebarW}px;
                --sidebar-width: ${sidebarW}px;
                --theme-primary: ${primaryHex};
                --theme-body: ${isDark ? '#0f172a' : '#f8fafc'};
                --theme-surface: ${isDark ? '#1e293b' : '#ffffff'};
                --theme-sidebar: ${isDark ? '#1e293b' : '#ffffff'};
                --theme-title: ${isDark ? '#ffffff' : '#0f172a'};
                --theme-border: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
                --radius-theme: 12px;
                --sarak-navigation-style: ${design.navigationStyle || 'sidebar'};
            }
            .sarak-shell-sidebar, .sarak-shell-topbar { opacity: 1 !important; visibility: visible !important; }
        `;
    }, [design.sidebarWidth, design.primaryColor, design.mode, design.navigationStyle]);

    // 5. Valor do Contexto (Memorizado)
    const uiContextValue = useMemo(() => ({
        ...design,
        discoveryEndpoints: options?.endpoints?.discovery || discoveryEndpoints || [],
        design,
        setDesign,
        applyConfig,
        applyFullConfig,
        registeredModules,
        layouts: Object.values(LAYOUTS),
        isHydrated,
        options
    }), [discoveryEndpoints, design, setDesign, applyConfig, applyFullConfig, registeredModules, isHydrated, options]);

    return (
        <UIContext.Provider value={uiContextValue}>
            <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
            <DesignInjector design={design} />
            <NoiseOverlay />
            {children}
        </UIContext.Provider>
    );
};

export default SarakUIProvider;
