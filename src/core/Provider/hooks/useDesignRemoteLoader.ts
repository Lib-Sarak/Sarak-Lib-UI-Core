import { useEffect, useRef, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import { SarakUIOptions, SarakDesignState, SetDesign } from '../types';

/**
 * Carrega o design de uma fonte remota OPCIONAL do próprio consumidor
 * (`options.persistence.onLoad`, BYO-persistência — Spec 44). A lib não tem
 * backend próprio: sem `onLoad`, o design já veio do seed/localStorage (síncrono,
 * no `useState` inicial de `useDesignManager`) e não há mais nada a buscar.
 *
 * `strategy` (ADR-009 §2.2) muda dois comportamentos: `'local'` ignora `onLoad`
 * mesmo se fornecido; `'remote'` SUBSTITUI o design pela semente + `onLoad`
 * (`getSeedConfig`), em vez de fundir por cima do que veio do fallback síncrono
 * de `localStorage` — é o que impede o cache local de "vencer" por acidente.
 */
export const useDesignRemoteLoader = (
    isHydrated: boolean,
    optionsRef: MutableRefObject<SarakUIOptions>,
    isBackendLoaded: boolean,
    setIsBackendLoaded: (v: boolean) => void,
    setDesign: SetDesign,
    getSeedConfig: () => SarakDesignState
) => {
    // `getSeedConfig` NÃO é referencialmente estável (depende de `allThemes`, que
    // `customThemes` inline recria a cada render — SarakUIProvider.tsx:44-46). Por
    // ref, como `optionsRef` ao lado, para o efeito abaixo não reexecutar (e
    // rechamar `onLoad`) a cada render enquanto `isBackendLoaded` ainda é `false`.
    const getSeedConfigRef = useRef(getSeedConfig);
    getSeedConfigRef.current = getSeedConfig;

    useEffect(() => {
        if (!isHydrated || isBackendLoaded) return;

        const opt = optionsRef.current;
        const strategy = resolveEffectiveStrategy(opt?.persistence);
        const onLoad = opt?.persistence?.onLoad;

        if (strategy === 'local' || !onLoad) {
            setIsBackendLoaded(true);
            return;
        }

        let cancelled = false;
        const loadRemote = async () => {
            try {
                const custom = await onLoad();
                if (!cancelled && custom) {
                    setDesign(strategy === 'remote'
                        ? () => validateDesign({ ...getSeedConfigRef.current(), ...custom })
                        : (prev) => validateDesign({ ...prev, ...custom }));
                }
            } catch (e) {
                console.error("[Sarak:Design] onLoad error:", e);
            } finally {
                if (!cancelled) setIsBackendLoaded(true);
            }
        };

        loadRemote();
        return () => { cancelled = true; };
    }, [isHydrated, isBackendLoaded, optionsRef, setDesign, setIsBackendLoaded]);
};
