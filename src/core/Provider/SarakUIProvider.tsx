import React, { ReactNode, useMemo, useState, useContext, createContext } from 'react';
import { NoiseOverlay } from '../../effects/NoiseOverlay';
import { injectSarakStyles } from './injectStyles';
import { SARAK_CSS } from './__sarakCss';

// Injeção automática de CSS (Spec 08 §2 — Instalação Zero-Config): roda uma vez, no
// carregamento do módulo, ANTES de qualquer instância do Provider montar — evita
// flash de conteúdo sem estilo mesmo no primeiro render. `SARAK_CSS` é o placeholder
// em dev/teste (rodando de `src/`) e o CSS compilado real no bundle publicado
// (substituído por scripts/inject-css.mjs no postbuild).
injectSarakStyles(SARAK_CSS);

// Novos Módulos Refatorados
import { SarakUIContextType, SarakUIOptions, SarakUIProviderProps, SarakThemePayload, ThemeEntry } from './types';
import { useRegistryManager } from './hooks/useRegistryManager';
import { useDesignManager } from './hooks/useDesignManager';
import { useBrandingManager } from './hooks/useBrandingManager';
import { useSarakUIEffects } from './hooks/useSarakUIEffects';
import { useSarakDrafting } from './hooks/useSarakDrafting';
import { useSarakStylesheetGuard } from './hooks/useSarakStylesheetGuard';
import { DesignInjector } from './components/DesignInjector';
import { SarakScopeRoot } from './components/SarakScopeRoot';
import { resolveSarakUIMode } from './scope';
import { SovereignThemeInjector } from './components/SovereignThemeInjector';
import { SarakBackgroundRenderer } from '../Design/components/SarakBackgroundRenderer';
import { GLOBAL_THEMES } from '../Design/presets/themes/index';
import { DeviceProvider } from './DeviceProvider';
import { SarakToastProvider } from '../../components/atomic/Feedback/SarakToast';
import { SarakOverlayProvider } from '../../components/atomic/Modals/SarakOverlayProvider';

// Re-exports para manter compatibilidade com arquivos que importam do Provider
export * from './types';
export { computeColorVariants } from './utils/color-engine';
export { DESIGN_MANIFEST } from './manifest';

// --- SARAK UI BRIDGE CONTEXT ---
export const UIContext = createContext<SarakUIContextType | undefined>(undefined);
export const DesignOverrideContext = createContext<Partial<SarakThemePayload> | null>(null);

// Referência estável para o default de `customThemes` (Spec 44). Um array literal
// `= []` inline no destructuring dos props seria uma referência NOVA a cada
// render sem prop explícita — é metade da causa do loop de render infinito real
// achado na Spec 43 §5.1 (a outra metade, o `useDesignSync` chamar `setDesign`
// sem guard, já foi corrigida). Consumidores que passam `customThemes` inline
// (`customThemes={[...]}` a cada render) continuam expostos ao padrão — por isso
// o guard em `useDesignSync` é a correção definitiva; isto é só o default seguro.
const EMPTY_CUSTOM_THEMES: ThemeEntry[] = [];

export const useSarakUI = (): SarakUIContextType & SarakThemePayload => {
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
    customThemes = EMPTY_CUSTOM_THEMES,
    activeThemeId,
    initialTheme,
    onThemeChange,
    onMediaUpload
}) => {
    // 0. Modo de consumo (Spec 24): `app` (default, dono da página) vs `embedded`
    //    (ilha sobre um front existente). O container da ilha chega por callback ref
    //    com estado, para que o DesignInjector re-renderize quando ele existir.
    const mode = resolveSarakUIMode(options);
    const [scopeElement, setScopeElement] = useState<HTMLElement | null>(null);
    const isEmbedded = mode === 'embedded';

    // 1. Gerenciamento do Registro e Discovery
    const { registeredModules, isHydrated } = useRegistryManager(options);

    // 1.5. Merge Temas Híbridos
    const allThemes = useMemo<ThemeEntry[]>(() => {
        return [...GLOBAL_THEMES, ...customThemes] as ThemeEntry[];
    }, [customThemes]);

    // 2. Gerenciamento do Estado de Design e Persistência
    const { design, setDesign, applyConfig, applyFullConfig, persistDesign, isBackendLoaded } = useDesignManager({
        initialConfig: initialPropsConfig,
        options,
        isHydrated,
        allThemes,
        activeThemeId,
        initialTheme,
        onThemeChange
    });

    // 2.5 Gerenciamento do Estado da Marca (Branding)
    const { branding, updateBranding } = useBrandingManager(options);

    // 3. Gerenciamento de Rascunho (Live Preview)
    const drafting = useSarakDrafting(design, applyConfig, applyFullConfig);

    // 4. Efeitos Colaterais globais (Fontes, Título, Ícone) — inertes no Modo Embarcado.
    //    FONTE ÚNICA da identidade da aba (Spec 47): recebe as DUAS portas pelas quais
    //    o consumidor pode nomear a página (`branding.tabName` e o `systemName` do
    //    design) e resolve a precedência num só lugar. Sem nenhuma delas preenchida, o
    //    `<title>`/favicon do `index.html` do host ficam intocados.
    useSarakUIEffects(branding, mode, options?.embedded?.injectGlobalFonts, design?.systemName);

    // 4.5 Guarda do stylesheet: confere a injeção automática (Modo App) e desfaz o
    //     CSS global quando a ilha é embarcada (Spec 24).
    useSarakStylesheetGuard(mode, scopeElement);

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
        onMediaUpload,
        activeDesign: drafting.isDrafting && drafting.draftDesign ? drafting.draftDesign : design
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
                <SarakScopeRoot mode={mode} onScopeElement={setScopeElement}>
                    <DesignInjector
                        design={design}
                        isDrafting={drafting.isDrafting}
                        mode={mode}
                        scopeElement={scopeElement}
                    />
                    {/* Overlays de PÁGINA INTEIRA: só no Modo App. No Embarcado eles
                        cobririam o front do host (Spec 24 §2.1).

                        A ORDEM destes irmãos é a mesma de antes da Spec 24: no Modo App
                        a árvore renderizada tem de sair byte-a-byte igual (há snapshots
                        de Cards que a cobrem). A spec só REMOVE nós no ramo embarcado —
                        nunca reordena. */}
                    {!isEmbedded && <NoiseOverlay />}
                    <SovereignThemeInjector design={design} manifest={options?.manifest} mode={mode} />
                    {!isEmbedded && (
                        <SarakBackgroundRenderer
                            imageUrl={design?.globalBackgroundImageUrl}
                            opacity={design?.globalBackgroundOpacity}
                            blur={design?.globalBackgroundBlur}
                            blendMode={design?.globalBackgroundBlendMode}
                            isFixed={true}
                            mode={design?.mode as 'light' | 'dark' | undefined}
                        />
                    )}

                    {/* Zero-config (Spec 08 §2): os hosts de feedback do Dispatcher
                        (trigger_toast / open_modal / open_drawer — Spec 25) já nascem
                        montados — o consumidor não precisa (nem deve) montá-los à mão. */}
                    {shouldRenderChildren ? (
                        <SarakToastProvider>
                            <SarakOverlayProvider>{children}</SarakOverlayProvider>
                        </SarakToastProvider>
                    ) : null}
                </SarakScopeRoot>
            </UIContext.Provider>
        </DeviceProvider>
    );
};

export default SarakUIProvider;
