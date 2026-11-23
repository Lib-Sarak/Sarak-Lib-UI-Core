import { useEffect, useState } from 'react';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';

/**
 * plan-27 — o tema EFETIVAMENTE no ar, extraído de `useDesignManager` para não
 * estourar o teto de estado por hook (R9). Nasce da semente
 * (`activeThemeId || initialTheme`, resolvida por `resolveSeedThemeId`) e
 * acompanha `activeThemeId` quando a prop CONTROLADA muda de fato. Trocar de
 * MODO nunca passa por aqui — só quem aplica um tema novo chama `setResolvedThemeId`
 * (via `activeThemeId` mudando, ou o chamador manual do painel).
 *
 * `activeThemeId` desconhecido (removido, ou tema do consumidor ainda em carga): o tema no ar é o padrão; quando o id
 * passa a ser conhecido, `resolvedThemeId` volta a ele. Só a TRANSIÇÃO conhecido/desconhecido reexecuta o efeito.
 */
export const useResolvedThemeId = (
    activeThemeId: string | undefined,
    resolveSeedThemeId: () => string | undefined,
    isUnknownTheme?: (id: string | undefined) => boolean,
) => {
    const [resolvedThemeId, setResolvedThemeId] = useState<string | undefined>(() => resolveSeedThemeId());

    const isUnknown = Boolean(activeThemeId) && Boolean(isUnknownTheme?.(activeThemeId));

    useEffect(() => {
        if (activeThemeId) setResolvedThemeId(isUnknown ? SARAK_DEFAULT_THEME_ID : activeThemeId);
    }, [activeThemeId, isUnknown]);

    return [resolvedThemeId, setResolvedThemeId] as const;
};
