import { useEffect, useRef, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import { SarakUIOptions, SarakDesignState, SarakThemePayload, SetDesign } from '../types';

interface LoadedTheme {
    design: SarakThemePayload;
    activeThemeId?: string;
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
 * local não vencer por acidente; `'hybrid'` mescla o estado remoto ao atual.
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
    } = props;

    // `getSeedConfig` depende da coleção de temas e pode mudar a cada render.
    // A ref dá ao efeito o valor mais recente sem fazê-lo rodar de novo e chamar
    // `onLoad` repetidamente enquanto a primeira leitura ainda está pendente.
    const getSeedConfigRef = useRef(getSeedConfig);
    const activeThemeIdRef = useRef(activeThemeId);
    getSeedConfigRef.current = getSeedConfig;
    activeThemeIdRef.current = activeThemeId;

    useEffect(() => {
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
                if (restoredThemeId !== undefined) setResolvedThemeId(restoredThemeId);

                setDesign(strategy === 'remote'
                    ? () => validateDesign({ ...getSeedConfigRef.current(), ...loadedTheme.design })
                    : (previous) => validateDesign({ ...previous, ...loadedTheme.design }));
            } catch (error) {
                console.error('[Sarak:Design] onLoad error:', error);
            } finally {
                if (!cancelled) setIsBackendLoaded(true);
            }
        };

        void loadRemote();
        return () => { cancelled = true; };
    }, [isHydrated, isBackendLoaded, optionsRef, setDesign, setIsBackendLoaded, setResolvedThemeId, storageKey]);
};
