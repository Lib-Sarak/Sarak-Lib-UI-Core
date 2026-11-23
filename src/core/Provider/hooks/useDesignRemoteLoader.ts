import { useEffect, useRef, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import { readCachedActiveThemeId, writeCachedActiveThemeId, writeCachedDesign } from '../utils/resolveStorageKey';
import { SARAK_DESIGN_FORMAT_CHOICES } from '../utils/designChoices';
import { SarakUIOptions, SarakDesignState, SarakThemePayload, SetDesign } from '../types';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { composeDefaultThemeDesign } from './useDesignSync';
import type { ThemeIdGuard } from './useThemeSeed';
import type { SavedDesign } from './useDesignChoices';

interface LoadedTheme {
    design: SarakThemePayload;
    activeThemeId?: string;
    format?: number;
}

interface RemoteLoaderProps {
    isHydrated: boolean;
    optionsRef: MutableRefObject<SarakUIOptions>;
    isBackendLoaded: boolean;
    setIsBackendLoaded: (loaded: boolean) => void;
    setDesign: SetDesign;
    getSeedConfig: () => SarakDesignState;
    activeThemeId?: string;
    setResolvedThemeId: (id: string | undefined) => void;
    storageKey: string;
    onLoadBecameAvailable?: () => void;
    design: SarakDesignState;
    resolvedThemeId?: string;
    themeIdGuard?: ThemeIdGuard;
    /** Lê o gravado no formato dele (`useDesignChoices.ts`); sem ele, funde por cima como no formato anterior. */
    restoreSaved?: (previous: SarakDesignState, saved: SavedDesign) => SarakDesignState;
}

const isLoadedTheme = (
    value: SarakThemePayload | LoadedTheme | null | undefined,
): value is LoadedTheme => Boolean(value && typeof value === 'object' && 'design' in value);

const resolveLoadedTheme = (
    value: SarakThemePayload | LoadedTheme | null | undefined,
): LoadedTheme | null => {
    if (value === null || value === undefined) return null;
    return isLoadedTheme(value) ? value : { design: value };
};

/**
 * Carrega o design persistido pelo consumidor e, quando disponível, o id do tema
 * ativo. Sem `onLoad`, a semente/localStorage já forneceu o estado no boot.
 *
 * `strategy` (ADR-009 §2.2) define a origem: `'local'` ignora `onLoad`; `'remote'`
 * substitui o fallback síncrono pela semente mais o estado remoto, para o cache
 * local não vencer por acidente; `'hybrid'` mescla o estado remoto ao atual. O gravado no formato de escolhas
 * (`format: 2`) não funde: é refeito pelo tema e substitui o que havia, para um valor que saiu do servidor sair da tela.
 */
export const useDesignRemoteLoader = (props: RemoteLoaderProps): void => {
    const {
        isHydrated,
        optionsRef,
        isBackendLoaded,
        setIsBackendLoaded,
        setDesign,
        getSeedConfig,
        activeThemeId,
        setResolvedThemeId,
        storageKey,
        onLoadBecameAvailable,
        design,
        resolvedThemeId,
        themeIdGuard,
        restoreSaved,
    } = props;

    // `getSeedConfig` depende da coleção de temas e pode mudar a cada render.
    // A ref dá ao efeito o valor mais recente sem fazê-lo rodar de novo e chamar
    // `onLoad` repetidamente enquanto a primeira leitura ainda está pendente.
    const getSeedConfigRef = useRef(getSeedConfig);
    const activeThemeIdRef = useRef(activeThemeId);
    const isRemoteLoadAvailable = Boolean(optionsRef.current.persistence?.onLoad)
        && optionsRef.current.persistence?.strategy !== 'local';
    const previousRemoteLoadAvailableRef = useRef(isRemoteLoadAvailable);
    const shouldRefreshHybridCacheRef = useRef(false);
    // As escolhas que o onLoad devolveu no formato 2: o cache as guarda ao lado do design completo.
    const loadedChoicesRef = useRef<{ format: number; design: Record<string, unknown> } | undefined>(undefined);
    const restoreSavedRef = useRef(restoreSaved);
    restoreSavedRef.current = restoreSaved;
    // O guarda depende de `customThemes`; a ref evita rodar `onLoad` de novo quando ele muda.
    const themeIdGuardRef = useRef(themeIdGuard);
    getSeedConfigRef.current = getSeedConfig;
    themeIdGuardRef.current = themeIdGuard;
    activeThemeIdRef.current = activeThemeId;

    useEffect(() => {
        const becameAvailable = !previousRemoteLoadAvailableRef.current && isRemoteLoadAvailable;
        previousRemoteLoadAvailableRef.current = isRemoteLoadAvailable;
        if (becameAvailable) {
            onLoadBecameAvailable?.();
            return;
        }
        if (!isHydrated || isBackendLoaded) return;

        const options = optionsRef.current;
        const strategy = resolveEffectiveStrategy(options.persistence);
        const onLoad = options.persistence?.onLoad;

        if (strategy === 'local' || !onLoad) {
            setIsBackendLoaded(true);
            return;
        }

        let cancelled = false;
        const loadRemote = async (): Promise<void> => {
            try {
                const loadedTheme = resolveLoadedTheme(await onLoad());
                if (cancelled || loadedTheme === null) return;

                const controlledThemeId = activeThemeIdRef.current;
                const restoredThemeId = controlledThemeId ?? loadedTheme.activeThemeId;
                const guard = themeIdGuardRef.current;

                if (guard && controlledThemeId === undefined && restoredThemeId !== undefined && guard.isRemovedTheme(restoredThemeId)) {
                    // Tema que a lib removeu, gravado pelo consumidor: o design que ele guardou era desse tema e é descartado.
                    guard.warnUnknownThemeOnce(restoredThemeId);
                    setResolvedThemeId(SARAK_DEFAULT_THEME_ID);
                    if (strategy === 'hybrid') shouldRefreshHybridCacheRef.current = true;
                    loadedChoicesRef.current = undefined;
                    setDesign((previous) => composeDefaultThemeDesign(previous));
                    return;
                }

                if (restoredThemeId !== undefined) setResolvedThemeId(restoredThemeId);

                if (strategy === 'hybrid') shouldRefreshHybridCacheRef.current = true;

                const saved: SavedDesign = {
                    design: loadedTheme.design as Record<string, unknown>,
                    format: loadedTheme.format,
                    // O tema do gravado é o id gravado com ele (o do onLoad, senão o do cache); sem id, nada é refeito.
                    themeId: loadedTheme.activeThemeId ?? (strategy === 'hybrid' ? readCachedActiveThemeId(storageKey) : undefined),
                };
                loadedChoicesRef.current = saved.format === SARAK_DESIGN_FORMAT_CHOICES ? { format: saved.format, design: saved.design } : undefined;
                const restore = restoreSavedRef.current
                    ?? ((previous: SarakDesignState) => validateDesign({ ...previous, ...saved.design }));
                setDesign(strategy === 'remote'
                    ? () => restore(getSeedConfigRef.current(), saved)
                    : (previous) => restore(previous, saved));
            } catch (error) {
                console.error('[Sarak:Design] onLoad error:', error);
            } finally {
                if (!cancelled) setIsBackendLoaded(true);
            }
        };

        void loadRemote();
        return () => { cancelled = true; };
    }, [
        isHydrated,
        isBackendLoaded,
        isRemoteLoadAvailable,
        onLoadBecameAvailable,
        optionsRef,
        setDesign,
        setIsBackendLoaded,
        setResolvedThemeId,
        storageKey,
    ]);

    useEffect(() => {
        if (!isHydrated || !isBackendLoaded || !shouldRefreshHybridCacheRef.current) return;
        shouldRefreshHybridCacheRef.current = false;
        try {
            writeCachedDesign(storageKey, design, loadedChoicesRef.current);
            writeCachedActiveThemeId(storageKey, resolvedThemeId);
        } catch (error) {
            console.error('[Sarak:Design] localStorage remote hydration error:', error);
        }
    }, [design, isBackendLoaded, isHydrated, resolvedThemeId, storageKey]);
};
