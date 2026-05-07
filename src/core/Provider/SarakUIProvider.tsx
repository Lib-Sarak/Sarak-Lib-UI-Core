import React, { ReactNode, useEffect, useMemo, useContext, createContext } from 'react';
import '../../styles/sarak-base.css';
import { LAYOUTS } from '../Design/presets/layout';
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
export const UIContext = createContext<SarakUIContextType | undefined>(undefined);
export const DesignOverrideContext = createContext<any>(null);

export const useSarakUI = () => {
    const context = useContext(UIContext);
    const overrideDesign = useContext(DesignOverrideContext);
    
    if (!context) {
        throw new Error('useSarakUI must be used within a SarakUIProvider');
    }
    
    // O design é o override (se houver, ex: dentro de um DesignScope/Preview) ou o sistema
    const design = overrideDesign || context.design || {};

    return {
        ...context,
        design,
        ...design, // Mantemos o spread aqui para compatibilidade local de quem consome o hook
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

    // 3. Gerenciamento de Rascunho (Live Preview)
    const [draftDesign, setDraftDesign] = React.useState<any | null>(null);

    // 4. Injeção de Fontes Avançadas (Core Optimization)
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
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700&family=Roboto:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;600;800&family=Lexend:wght@300;400;500;600;700;800&family=Unbounded:wght@300;400;600;900&family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');`;
        document.head.prepend(style);
    }, []);

    // 5. Interceptor Inteligente (Isolamento Draft vs System)
    const smartApplyConfig = React.useCallback((partial: any) => {
        console.log('[SarakUIProvider] smartApplyConfig called with:', partial);
        console.log('[SarakUIProvider] Current drafting status:', !!draftDesign);
        
        if (draftDesign) {
            console.log('[SarakUIProvider] Updating DRAFT state');
            setDraftDesign((prev: any) => ({ ...prev, ...partial }));
        } else {
            console.log('[SarakUIProvider] Updating SYSTEM state');
            applyConfig(partial);
        }
    }, [draftDesign, applyConfig]);

    // 6. Valor do Contexto (Memorizado)
    const uiContextValue = useMemo(() => ({
        discoveryEndpoints: options?.endpoints?.discovery || discoveryEndpoints || [],
        design,        // Estado persistido (Sistema)
        draftDesign,   // Estado volátil (Preview)
        isDrafting: !!draftDesign,
        setDesign,
        setDraftDesign,
        applyConfig: smartApplyConfig,
        applyFullConfig,
        registeredModules,
        layouts: Object.values(LAYOUTS),
        isHydrated,
        options
    }), [discoveryEndpoints, design, draftDesign, setDesign, setDraftDesign, smartApplyConfig, applyFullConfig, registeredModules, isHydrated, options]);

    return (
        <UIContext.Provider value={uiContextValue}>
            <DesignInjector 
                design={design} 
                isDrafting={!!draftDesign} 
            />
            <NoiseOverlay />
            {children}
        </UIContext.Provider>
    );
};

export default SarakUIProvider;
