import { useEffect, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import { SarakUIOptions, SetDesign } from '../types';

/**
 * Carrega o design de uma fonte remota OPCIONAL do próprio consumidor
 * (`options.persistence.onLoad`, BYO-persistência — Spec 44). A lib não tem
 * backend próprio: sem `onLoad`, o design já veio do seed/localStorage (síncrono,
 * no `useState` inicial de `useDesignManager`) e não há mais nada a buscar.
 */
export const useDesignRemoteLoader = (
    isHydrated: boolean,
    optionsRef: MutableRefObject<SarakUIOptions>,
    isBackendLoaded: boolean,
    setIsBackendLoaded: (v: boolean) => void,
    setDesign: SetDesign
) => {
    useEffect(() => {
        if (!isHydrated || isBackendLoaded) return;

        const opt = optionsRef.current;
        if (!opt?.persistence?.onLoad) {
            setIsBackendLoaded(true);
            return;
        }

        let cancelled = false;
        const loadRemote = async () => {
            try {
                const custom = await opt.persistence!.onLoad!();
                if (!cancelled && custom) {
                    setDesign((prev) => validateDesign({ ...prev, ...custom }));
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
