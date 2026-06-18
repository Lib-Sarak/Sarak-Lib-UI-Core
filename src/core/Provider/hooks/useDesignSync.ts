import { useEffect, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';

export const useDesignSync = (
    isHydrated: boolean,
    activeThemeId: string | undefined,
    allThemes: any[] | undefined,
    storageKey: string,
    hasHydratedRef: MutableRefObject<boolean>,
    setDesign: (updater: any) => void
) => {
    // RE-HYDRATION & ACTIVE THEME ID SYNC
    useEffect(() => {
        if (!isHydrated) return;

        // Se temos um tema ativo definido explicitamente, ele é a verdade absoluta
        if (activeThemeId && allThemes) {
            const activeTheme = allThemes.find(t => t.id === activeThemeId);
            if (activeTheme && activeTheme.design) {
                setDesign((prev: any) => validateDesign({ ...prev, ...activeTheme.design }));
            }
            return;
        }

        // Se não temos tema ativo, e ainda não hidratamos, tentamos ler do cache local
        if (!hasHydratedRef.current) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setDesign((prev: any) => validateDesign({ ...prev, ...parsed }));
                }
            } catch (e) {}
            hasHydratedRef.current = true;
        }
    }, [isHydrated, storageKey, activeThemeId, allThemes, setDesign, hasHydratedRef]);
};
