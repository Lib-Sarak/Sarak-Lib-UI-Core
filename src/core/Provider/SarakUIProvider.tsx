import React, { ReactNode, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { MotionConfig } from 'framer-motion';
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
import type { SarakUIProviderProps, SarakThemeEntry } from './types';
import { useDesignManager } from './hooks/useDesignManager';
import { useBrandingManager } from './hooks/useBrandingManager';
import { useSarakUIEffects } from './hooks/useSarakUIEffects';
import { useSarakFonts } from './hooks/useSarakFonts';
import { useSarakDrafting } from './hooks/useSarakDrafting';
import { useSarakStylesheetGuard } from './hooks/useSarakStylesheetGuard';
import { usePreferencesManager } from './hooks/usePreferencesManager';
import { overlayPreferences } from './utils/overlayPreferences';
import { UIContext, DesignOverrideContext } from './context';
import { DesignInjector } from './components/DesignInjector';
import { SarakScopeRoot } from './components/SarakScopeRoot';
import { resolveSarakUIMode } from './scope';
import { useThemeCollection } from './hooks/useThemeCollection';
import { useThemeReadiness } from './hooks/useThemeReadiness';
import { SovereignThemeInjector } from './components/SovereignThemeInjector';
import { SarakBackgroundRenderer } from '../Design/components/SarakBackgroundRenderer';
import { SarakDeviceProvider, SARAK_DEFAULT_DEVICE_BREAKPOINTS, SarakDeviceBreakpoints } from './DeviceProvider';
import { SarakToastProvider } from '../../components/atomic/Feedback/SarakToast';
import { SarakOverlayProvider } from '../../components/atomic/Modals/SarakOverlayProvider';
import { useThemeDeletionHandler } from './hooks/useThemeDeletionHandler';

// Re-exports para manter compatibilidade com arquivos que importam do Provider
export * from './types';
export { computeColorVariants } from './utils/color-engine';
export { SARAK_DESIGN_MANIFEST } from './manifest';

export { UIContext, DesignOverrideContext } from './context';
export { useSarakUI, useSarakUIOptional } from './hooks/useSarakUI';

// Referência estável para o default de `customThemes` (Spec 44): um `= []` inline seria
// uma referência NOVA a cada render — metade do loop de render infinito da Spec 43 §5.1
// (a correção definitiva é o guard em `useDesignSync`; isto é só o default seguro).
const EMPTY_CUSTOM_THEMES: SarakThemeEntry[] = [];

// Orquestra o design, a hidratação e a injeção de estilos; só monta depois da porta de espera do tema.
const SarakUIProviderCore: React.FC<SarakUIProviderProps> = ({
    children,
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
    // 0. Modo de consumo (Spec 24): `app` (dono da página) vs `embedded` (ilha sobre um front existente).
    const mode = resolveSarakUIMode(options);
    const [scopeElement, setScopeElement] = useState<HTMLElement | null>(null);
    const isEmbedded = mode === 'embedded';
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => setIsHydrated(true), []);

    // 1.5. Temas: embarcados carregados + customThemes + salvos em runtime; porta única de escrita (ADR-011).
    const { allThemes, themeCatalog, loadTheme, saveTheme, deleteTheme: deleteThemeFromCollection } = useThemeCollection(customThemes, options);
    const hostConfigRef = useRef(initialPropsConfig);
    hostConfigRef.current = initialPropsConfig;
    const getHostConfig = useCallback(() => hostConfigRef.current, []);

    // 2. Gerenciamento do Estado de Design e Persistência
    const { design, setDesign, applyConfig, applyFullConfig, persistDesign, isBackendLoaded, resolvedThemeId, setResolvedThemeId } = useDesignManager({
        initialConfig: initialPropsConfig,
        options,
        isHydrated,
        allThemes,
        activeThemeId,
        initialTheme,
        onThemeChange
    });

    const deleteTheme = useThemeDeletionHandler({
        deleteThemeFromCollection, resolvedThemeId, loadTheme, design, getHostConfig, setResolvedThemeId, applyFullConfig, persistDesign,
    });

    // 2.5 Gerenciamento do Estado da Marca (Branding)
    const { branding, updateBranding } = useBrandingManager(options);
    // 2.6 Preferências do usuário — camada separada, nunca persistida no tema;
    //     `effectiveDesign` sobrepõe as OFERECIDAS pelo tema resolvido.
    const { preferences, updatePreferences, systemColorScheme } = usePreferencesManager(options, isHydrated);
    const activeTheme = allThemes.find((theme) => theme.id === resolvedThemeId);

    // 3. Gerenciamento de Rascunho (Live Preview) — sobre o design BRUTO: o
    //    painel edita e comita o tema, nunca o efetivo.
    const drafting = useSarakDrafting(design, applyConfig, applyFullConfig);
    // A TELA REAL mostra o rascunho por cima do sistema enquanto o painel está aberto
    // e diverge — nunca grava nada; sem rascunho, cai exatamente no sistema (preferências continuam por cima).
    const liveDesign = drafting.isDrafting && drafting.draftDesign ? drafting.draftDesign : design;
    const effectiveDesign = useMemo(
        () => overlayPreferences(liveDesign, preferences, activeTheme, systemColorScheme),
        [liveDesign, preferences, activeTheme, systemColorScheme],
    );

    // 4. Efeitos globais, inertes no Modo Embarcado: identidade da aba (Spec 47) e fontes (`options.fonts`).
    useSarakUIEffects(branding, mode, design?.systemName);
    useSarakFonts(effectiveDesign, mode, options);

    // 4.5 Guarda do stylesheet (Modo App injeta; Embarcado desfaz o CSS global — Spec 24).
    useSarakStylesheetGuard(mode, scopeElement);

    // 6. Valor do Contexto (Memorizado)
    const uiContextValue = useMemo(() => ({
        design: effectiveDesign, // Estado EFETIVO — tema + preferências oferecidas sobrepostas
        systemDesign: design,    // Estado persistido (Sistema/tema), sem preferência nenhuma
        preferences,
        updatePreferences,
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
        isHydrated,
        options,
        allThemes,
        themeCatalog, loadTheme, getHostConfig,
        saveTheme, deleteTheme,
        activeThemeId,
        resolvedThemeId,
        setResolvedThemeId,
        token,
        branding,
        updateBranding,
        onMediaUpload,
        activeDesign: effectiveDesign // já é o sistema (+ rascunho, se houver) + preferências
    }), [
        design, effectiveDesign, preferences, updatePreferences,
        drafting.draftDesign, drafting.isDrafting,
        drafting.setIsDrafting, drafting.lockDrafting, setDesign,
        drafting.setDraftDesign, drafting.smartApplyConfig,
        drafting.smartApplyFullConfig, applyConfig, applyFullConfig,
        persistDesign, isHydrated, options,
        allThemes, themeCatalog, loadTheme, getHostConfig, saveTheme, deleteTheme, activeThemeId, resolvedThemeId, setResolvedThemeId,
        token, branding, updateBranding, onMediaUpload
    ]);

    // 7. Strict Sync (evita flash de temas)
    const isStrictSync = options?.persistence?.strictBackendSync === true;
    const shouldRenderChildren = isStrictSync ? isBackendLoaded : true;

    // Breakpoints como DADO (Spec 16): os tokens da media-query descem ao detector JS (senão CSS e
    // JS discordam do que é "tablet"). Memoizado: o hook de dispositivo depende da identidade.
    const deviceBreakpoints = useMemo<SarakDeviceBreakpoints>(() => ({
        tablet: typeof design?.breakpointTablet === 'number' ? design.breakpointTablet : SARAK_DEFAULT_DEVICE_BREAKPOINTS.tablet,
        desktop: typeof design?.breakpointDesktop === 'number' ? design.breakpointDesktop : SARAK_DEFAULT_DEVICE_BREAKPOINTS.desktop
    }), [design?.breakpointTablet, design?.breakpointDesktop]);

    return (
        <SarakDeviceProvider breakpoints={deviceBreakpoints}>
            <UIContext.Provider value={uiContextValue}>
                <SarakScopeRoot mode={mode} onScopeElement={setScopeElement}>
                    <DesignInjector
                        design={effectiveDesign}
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
                    <SovereignThemeInjector design={effectiveDesign} manifest={options?.manifest} mode={mode} />
                    {!isEmbedded && (
                        <SarakBackgroundRenderer
                            imageUrl={effectiveDesign?.globalBackgroundImageUrl}
                            opacity={effectiveDesign?.globalBackgroundOpacity}
                            blur={effectiveDesign?.globalBackgroundBlur}
                            isFixed={true}
                            mode={effectiveDesign?.mode as 'light' | 'dark' | undefined}
                        />
                    )}

                    {/* Zero-config (Spec 08 §2): os hosts de feedback do Dispatcher
                        (trigger_toast / open_modal / open_drawer — Spec 25) já nascem
                        montados — o consumidor não precisa (nem deve) montá-los à mão. */}
                    {shouldRenderChildren ? (
                        <MotionConfig reducedMotion={effectiveDesign?.reducedMotion === true ? 'always' : 'user'}>
                            <SarakToastProvider>
                                <SarakOverlayProvider>{children}</SarakOverlayProvider>
                            </SarakToastProvider>
                        </MotionConfig>
                    ) : null}
                </SarakScopeRoot>
            </UIContext.Provider>
        </SarakDeviceProvider>
    );
};

// O Provider público: porta de espera do tema sob demanda antes do núcleo; transparente sem tema forçado fora de memória.
export const SarakUIProvider: React.FC<SarakUIProviderProps> = (props) => {
    const requestedThemeId = props.activeThemeId || props.initialTheme || props.options?.theme?.defaultTheme;
    const isReady = useThemeReadiness({
        requestedThemeId,
        controlled: Boolean(props.activeThemeId),
        persistence: props.options?.persistence,
    });
    if (!isReady) return <>{props.loadingFallback ?? null}</>;
    return <SarakUIProviderCore {...props} />;
};

export default SarakUIProvider;
