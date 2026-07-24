import { useEffect, useRef, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import { ThemeEntry, SetDesign } from '../types';

export const useDesignSync = (
    isHydrated: boolean,
    activeThemeId: string | undefined,
    allThemes: ThemeEntry[] | undefined,
    storageKey: string,
    hasHydratedRef: MutableRefObject<boolean>,
    setDesign: SetDesign
) => {
    // Guarda o último `activeThemeId` efetivamente aplicado. Sem isso, qualquer
    // render que produza uma nova referência de `allThemes` (ex.: consumidor que
    // passa `customThemes={[...]}` inline, ou o default antigo `= []` do Provider)
    // reexecutaria este efeito e chamaria `setDesign` incondicionalmente — como
    // `setDesign` sempre recebe um objeto NOVO (spread), o React nunca faz bailout
    // por igualdade referencial, e o resultado é um loop de render infinito real
    // (reproduzido com CPU ~100%, achado na Spec 43 §5.1). O guard aplica o tema
    // só quando o ID pedido de fato muda — não a cada render.
    const lastAppliedThemeIdRef = useRef<string | undefined>(undefined);

    // RE-HYDRATION & ACTIVE THEME ID SYNC
    useEffect(() => {
        if (!isHydrated) return;

        // Se temos um tema ativo definido explicitamente, ele é a verdade absoluta
        if (activeThemeId && allThemes) {
            if (lastAppliedThemeIdRef.current === activeThemeId) return;

            const activeTheme = allThemes.find(t => t.id === activeThemeId);
            if (activeTheme && activeTheme.design) {
                lastAppliedThemeIdRef.current = activeThemeId;
                setDesign((prev) => validateDesign({ ...prev, ...activeTheme.design }));
            }
            return;
        }

        // `activeThemeId` foi limpo — permite reaplicar se ele voltar a ser setado.
        lastAppliedThemeIdRef.current = undefined;

        // Se não temos tema ativo, e ainda não hidratamos, tentamos ler do cache local
        if (!hasHydratedRef.current) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setDesign((prev) => validateDesign({ ...prev, ...parsed }));
                }
            } catch (e) {}
            hasHydratedRef.current = true;
        }
    }, [isHydrated, storageKey, activeThemeId, allThemes, setDesign, hasHydratedRef]);
};
