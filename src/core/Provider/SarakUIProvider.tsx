import React, { ReactNode, useEffect, useMemo, useContext, createContext } from 'react';
import '../../styles/sarak-base.css';
import { NoiseOverlay } from '../../effects/NoiseOverlay';

// Novos Módulos Refatorados
import { SarakUIContextType, SarakUIOptions, SarakUIProviderProps } from './types';
import { DEFAULT_UI_BASE_URL } from './constants';
import { useRegistryManager } from './hooks/useRegistryManager';
import { useDesignManager } from './hooks/useDesignManager';
import { useBrandingManager } from './hooks/useBrandingManager';
import { DesignInjector } from './components/DesignInjector';
import { SovereignThemeInjector } from './components/SovereignThemeInjector';
import { SarakBackgroundRenderer } from '../Design/components/SarakBackgroundRenderer';
import { GLOBAL_THEMES } from '../Design/presets/themes/index';
import { DeviceProvider } from './DeviceProvider';

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
    
    // Design do Sistema (O que está persistido)
    const systemDesign = context.design || {};
    
    // Design Ativo (Rascunho se houver override, caso contrário usa o design persistido do sistema)
    const activeDesign = overrideDesign || systemDesign;

    // Merging the branding overrides smoothly
    const activeDesignWithBranding = {
        ...activeDesign,
        systemName: context.branding?.companyName || activeDesign.systemName,
        logoUrl: context.branding?.logoBase64 || activeDesign.logoUrl
    };

    return {
        ...context,
        systemDesign,
        activeDesign: activeDesignWithBranding,
        design: activeDesignWithBranding,
        ...activeDesignWithBranding,
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
    options = {},
    customThemes = [],
    activeThemeId,
    onMediaUpload
}) => {
    // 1. Gerenciamento do Registro e Discovery
    const { registeredModules, isHydrated } = useRegistryManager(options);

    // 1.5. Merge Temas Híbridos
    const allThemes = useMemo(() => {
        return [...GLOBAL_THEMES, ...customThemes];
    }, [customThemes]);

    // 2. Gerenciamento do Estado de Design e Persistência
    const { design, setDesign, applyConfig, applyFullConfig, persistDesign, isBackendLoaded } = useDesignManager({
        initialConfig: initialPropsConfig,
        options,
        token,
        isHydrated,
        allThemes,
        activeThemeId
    });

    // 2.5 Gerenciamento do Estado da Marca (Branding)
    const { branding, updateBranding, isBrandingLoaded } = useBrandingManager(options, token);

    // 3. Gerenciamento de Rascunho (Live Preview)
    const [draftDesign, setDraftDesign] = React.useState<any | null>(null);
    const [isDrafting, setIsDraftingState] = React.useState(false);
    const isDraftingRef = React.useRef(false);

    // Sincroniza o estado visual com o Ref síncrono para evitar race conditions
    const setIsDrafting = React.useCallback((active: boolean) => {
        isDraftingRef.current = active;
        setIsDraftingState(active);
    }, []);

    // Trava síncrona imediata (pode ser chamada durante a renderização)
    const lockDrafting = React.useCallback(() => {
        isDraftingRef.current = true;
    }, []);

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
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;600;800&family=Lexend:wght@300;400;500;600;700;800;900&family=Unbounded:wght@300;400;600;900&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Syne:wght@400;500;600;700;800&family=Archivo:wght@400;500;600;700&family=Bebas+Neue&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Satisfy&family=Caveat:wght@400;500;600;700&family=Fraunces:wght@300;400;500;600;700;800;900&display=swap');`;
        document.head.prepend(style);
    }, []);

    // 4.5 Atualização Dinâmica do Título e Ícone da Aba (Branding)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        if (branding?.tabName) {
            document.title = branding.tabName;
        }

        if (branding?.logoBase64) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = branding.logoBase64;
        }
    }, [branding?.tabName, branding?.logoBase64]);

    // 5. Interceptor Inteligente (Isolamento Draft vs System)
    const smartApplyConfig = React.useCallback((partial: any) => {
        if (isDraftingRef.current || draftDesign) {
            setDraftDesign((prev: any) => ({ ...(prev || design), ...partial }));
        } else {
            applyConfig(partial);
        }
    }, [design, applyConfig, draftDesign]);

    const smartApplyFullConfig = React.useCallback((config: any) => {
        if (isDraftingRef.current || draftDesign) {
            setDraftDesign(config);
        } else {
            applyFullConfig(config);
        }
    }, [applyFullConfig, draftDesign]);

    // 6. Valor do Contexto (Memorizado)
    const uiContextValue = useMemo(() => ({
        discoveryEndpoints: options?.endpoints?.discovery || discoveryEndpoints || [],
        design,        // Estado persistido (Sistema)
        draftDesign,   // Estado volátil (Preview)
        isDrafting,
        setIsDrafting,
        lockDrafting,
        setDesign,     // Mantemos o RAW para commits explícitos do Design Engine
        setDraftDesign,
        applyConfig: smartApplyConfig,
        applyFullConfig: smartApplyFullConfig,
        applyConfigRaw: applyConfig,
        applyFullConfigRaw: applyFullConfig,
        persistDesign,
        registeredModules,
        layouts: [],
        isHydrated,
        options,
        allThemes,
        token,
        branding,
        updateBranding,
        onMediaUpload
    }), [discoveryEndpoints, design, draftDesign, isDrafting, setIsDrafting, lockDrafting, setDesign, setDraftDesign, smartApplyConfig, smartApplyFullConfig, applyConfig, applyFullConfig, persistDesign, registeredModules, isHydrated, options, allThemes, token, branding, updateBranding, onMediaUpload]);

    // 7. Renderização com Strict Sync (Evita Flash de Temas)
    const isStrictSync = options?.persistence?.strictBackendSync === true;
    const shouldRenderChildren = isStrictSync ? isBackendLoaded : true;

    return (
        <DeviceProvider>
            <UIContext.Provider value={uiContextValue}>
                <DesignInjector 
                    design={design} 
                    isDrafting={isDrafting} 
                />
                <NoiseOverlay />
                <SovereignThemeInjector design={design} manifest={options?.manifest} />
                
                {/* Aplicação Global da Mídia de Fundo do Sistema */}
                <SarakBackgroundRenderer 
                    imageUrl={design?.globalBackgroundImageUrl}
                    opacity={design?.globalBackgroundOpacity}
                    blur={design?.globalBackgroundBlur}
                    blendMode={design?.globalBackgroundBlendMode}
                    isFixed={true}
                    mode={design?.mode}
                />

                {shouldRenderChildren ? children : null}
            </UIContext.Provider>
        </DeviceProvider>
    );
};

export default SarakUIProvider;
