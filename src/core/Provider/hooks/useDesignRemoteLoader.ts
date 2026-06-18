import { useEffect } from 'react';
import { validateDesign } from '../utils/validation';

export const useDesignRemoteLoader = (
    isHydrated: boolean,
    token: string | null | undefined,
    uiBaseUrl: string,
    optionsRef: any,
    isBackendLoaded: boolean,
    setIsBackendLoaded: (v: boolean) => void,
    setDesign: (updater: any) => void
) => {
    useEffect(() => {
        if (!isHydrated) return;

        const loadRemote = async () => {
            const opt = optionsRef.current;
            if (opt?.persistence?.onLoad) {
                try {
                    const custom = await opt.persistence.onLoad();
                    if (custom) {
                        setDesign((prev: any) => validateDesign({ ...prev, ...custom }));
                        setIsBackendLoaded(true);
                        return;
                    }
                } catch (e) { console.error("[Sarak:Design] onLoad error:", e); }
            }

            if (!isBackendLoaded) {
                const designPath = opt?.endpoints?.designPath || '/design';
                try {
                    const headers: any = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;
                    
                    const resp = await fetch(`${uiBaseUrl}${designPath}`, {
                        headers
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data.design) setDesign((prev: any) => validateDesign({ ...prev, ...data.design }));
                        setIsBackendLoaded(true);
                    }
                } catch (e) {}
            }
        };

        loadRemote();
    }, [token, isBackendLoaded, isHydrated, uiBaseUrl, optionsRef, setDesign, setIsBackendLoaded]);
};
