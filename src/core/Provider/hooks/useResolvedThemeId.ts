import { useEffect, useState } from 'react';

/**
 * plan-27 — o tema EFETIVAMENTE no ar, extraído de `useDesignManager` para não
 * estourar o teto de estado por hook (R9). Nasce da semente
 * (`activeThemeId || initialTheme`, resolvida por `resolveSeedThemeId`) e
 * acompanha `activeThemeId` quando a prop CONTROLADA muda de fato. Trocar de
 * MODO nunca passa por aqui — só quem aplica um tema novo chama `setResolvedThemeId`
 * (via `activeThemeId` mudando, ou o chamador manual do painel).
 */
export const useResolvedThemeId = (
    activeThemeId: string | undefined,
    resolveSeedThemeId: () => string | undefined,
) => {
    const [resolvedThemeId, setResolvedThemeId] = useState<string | undefined>(() => resolveSeedThemeId());

    useEffect(() => {
        if (activeThemeId) setResolvedThemeId(activeThemeId);
    }, [activeThemeId]);

    return [resolvedThemeId, setResolvedThemeId] as const;
};
