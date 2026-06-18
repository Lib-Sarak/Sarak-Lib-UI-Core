import React, { ReactNode, useEffect, useMemo, useContext, createContext } from 'react';
import '../../styles/sarak-base.css';
import { NoiseOverlay } from '../../effects/NoiseOverlay';

// Novos Módulos Refatorados
import { SarakUIContextType, SarakUIOptions, SarakUIProviderProps } from './types';
import { DEFAULT_UI_BASE_URL } from './constants';
import { useRegistryManager } from './hooks/useRegistryManager';
import { useDesignManager } from './hooks/useDesignManager';
import { useBrandingManager } from './hooks/useBrandingManager';
import { useSarakUIEffects } from './hooks/useSarakUIEffects';
import { useSarakDrafting } from './hooks/useSarakDrafting';
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
    const drafting = useSarakDrafting(design, applyConfig, applyFullConfig);

    // 4. Efeitos Colaterais (Fontes, Título, Ícone)
    useSarakUIEffects(branding);

    // 6. Valor do Contexto (Memorizado)
    const uiContextValue = useMemo(() => ({
        discoveryEndpoints: options?.endpoints?.discovery || discoveryEndpoints || [],
        design,        // Estado persistido (Sistema)
        draftDesign: drafting.draftDesign,   // Estado volátil (Preview)
        isDrafting: drafting.isDrafting,
        setIsDrafting: drafting.setIsDrafting,
        lockDrafting: drafting.lockDrafting,
        setDesign,     // Mantemos o RAW para commits explícitos do Design Engine
        setDraftDesign: drafting.setDraftDesign,
        applyConfig: drafting.smartApplyConfig,
        applyFullConfig: drafting.smartApplyFullConfig,
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
    }), [
        discoveryEndpoints, design, drafting.draftDesign, drafting.isDrafting, 
        drafting.setIsDrafting, drafting.lockDrafting, setDesign, 
        drafting.setDraftDesign, drafting.smartApplyConfig, 
        drafting.smartApplyFullConfig, applyConfig, applyFullConfig, 
        persistDesign, registeredModules, isHydrated, options, 
        allThemes, token, branding, updateBranding, onMediaUpload
    ]);

    // 7. Renderização com Strict Sync (Evita Flash de Temas)
    const isStrictSync = options?.persistence?.strictBackendSync === true;
    const shouldRenderChildren = isStrictSync ? isBackendLoaded : true;

    return (
        <DeviceProvider>
            <UIContext.Provider value={uiContextValue}>
                <DesignInjector 
                    design={design} 
                    isDrafting={drafting.isDrafting} 
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
