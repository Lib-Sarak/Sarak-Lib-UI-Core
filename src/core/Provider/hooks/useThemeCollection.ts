import { useCallback, useMemo, useState } from 'react';
import { validateDesign } from '../utils/validation';
import { GLOBAL_THEMES } from '../../Design/presets/themes/index';
import { SarakUIOptions, ThemeEntry } from '../types';

/**
 * Lista unificada de temas + a porta de escrita de temas salvos em runtime
 * (ADR-011 / plan-38). Estado de SESSÃO: o Provider não lembra de nada entre
 * boots — quem guarda e devolve é o importador via `customThemes` na montagem
 * seguinte (§2 do ADR). Extraído do `SarakUIProvider` para manter aquele
 * arquivo abaixo do teto de 250 linhas do auditor de Clean Code (R9).
 */
export const useThemeCollection = (customThemes: unknown[], options: SarakUIOptions) => {
    const [savedThemes, setSavedThemes] = useState<ThemeEntry[]>([]);

    // savedThemes funde DEPOIS de customThemes para que um tema salvo agora
    // apareça sem reload.
    const allThemes = useMemo<ThemeEntry[]>(() => {
        return [...GLOBAL_THEMES, ...customThemes, ...savedThemes] as ThemeEntry[];
    }, [customThemes, savedThemes]);

    // `saveTheme` é a ÚNICA porta de escrita (ADR-011): valida o `design` na
    // fronteira (mesma regra de qualquer tema de origem externa —
    // 10-seguranca-e-acessibilidade §2.1), funde no estado de sessão ANTES de
    // chamar `onSave` — perder o tema por falha do backend do consumidor é o
    // pior desfecho — e só então entrega ao importador. `onSave` rejeitando
    // propaga o erro para quem chamou (o painel mostra o toast), mas o tema
    // já está em `allThemes` e permanece lá. Salvar o mesmo `id` duas vezes
    // SUBSTITUI, nunca duplica.
    const saveTheme = useCallback(async (theme: ThemeEntry): Promise<void> => {
        const validatedTheme: ThemeEntry = {
            ...theme,
            design: validateDesign(theme.design) as unknown as Record<string, unknown>
        };
        setSavedThemes((prev) => [...prev.filter((t) => t.id !== validatedTheme.id), validatedTheme]);
        await options?.theme?.onSave?.(validatedTheme);
    }, [options?.theme?.onSave]);

    return { allThemes, saveTheme };
};
