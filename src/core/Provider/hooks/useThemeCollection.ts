import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { validateDesign } from '../utils/validation';
import { getLoadedThemePresets, getThemeCacheVersion, sarakLoadThemePreset, subscribeThemeCache } from '../../Design/presets/themes/registry';
import { SARAK_THEME_CATALOG } from '../../Design/presets/themes/catalog.generated';
import { toThemeCatalogEntry } from '../../Design/presets/themes/catalog';
import type { SarakThemeCatalogEntry } from '../../Design/presets/themes';
import { SarakUIOptions, SarakThemeEntry } from '../types';

/**
 * Lista unificada de temas + a porta de escrita de temas salvos em runtime
 * (ADR-011 / plan-38). Estado de SESSÃO: o Provider não lembra de nada entre
 * boots — quem guarda e devolve é o importador via `customThemes` na montagem
 * seguinte (§2 do ADR). Extraído do `SarakUIProvider` para manter aquele
 * arquivo abaixo do teto de 250 linhas do auditor de Clean Code (R9).
 */
export const useThemeCollection = (customThemes: SarakThemeEntry[], options: SarakUIOptions) => {
    const [savedThemes, setSavedThemes] = useState<SarakThemeEntry[]>([]);
    const [deletedThemeIds, setDeletedThemeIds] = useState<string[]>([]);

    // A versão do cache de temas carregados: a lista só é recomposta quando um
    // tema CHEGA — referência estável por versão (nunca por render), senão o
    // `useDesignSync` reaplica o tema em loop (spec 02 §3.1).
    const themeCacheVersion = useSyncExternalStore(subscribeThemeCache, getThemeCacheVersion, getThemeCacheVersion);

    // `allThemes` = os temas com `design` EM MEMÓRIA: o padrão do boot, os
    // embarcados já carregados, `customThemes` e os salvos. savedThemes funde
    // DEPOIS de customThemes para que um tema salvo agora apareça sem reload.
    // A lista de tudo que é escolhível (inclusive o não carregado) é `themeCatalog`.
    const allThemes = useMemo<SarakThemeEntry[]>(() => {
        return [...getLoadedThemePresets(), ...customThemes, ...savedThemes]
            .filter((theme) => !deletedThemeIds.includes(theme.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `themeCacheVersion` é o sinal de que o cache mudou
    }, [customThemes, deletedThemeIds, savedThemes, themeCacheVersion]);

    const themeCatalog = useMemo<SarakThemeCatalogEntry[]>(() => {
        const own = [...customThemes, ...savedThemes].map((theme) => toThemeCatalogEntry(theme));
        return [...SARAK_THEME_CATALOG, ...own].filter((entry) => !deletedThemeIds.includes(entry.id));
    }, [customThemes, deletedThemeIds, savedThemes]);

    // Carrega um tema embarcado sob demanda e o devolve (ou o que já está em
    // memória: custom/salvo). `undefined` quando o id não existe em lugar nenhum.
    const loadTheme = useCallback(async (id: string): Promise<SarakThemeEntry | undefined> => {
        const inMemory = [...customThemes, ...savedThemes].find((theme) => theme.id === id);
        if (inMemory) return inMemory;
        if (!SARAK_THEME_CATALOG.some((entry) => entry.id === id)) return undefined;
        return sarakLoadThemePreset(id);
    }, [customThemes, savedThemes]);

    // `saveTheme` é a ÚNICA porta de escrita (ADR-011): valida o `design` na
    // fronteira (mesma regra de qualquer tema de origem externa —
    // 10-seguranca-e-acessibilidade §2.1), funde no estado de sessão ANTES de
    // chamar `onSave` — perder o tema por falha do backend do consumidor é o
    // pior desfecho — e só então entrega ao importador. `onSave` rejeitando
    // propaga o erro para quem chamou (o painel mostra o toast), mas o tema
    // já está em `allThemes` e permanece lá. Salvar o mesmo `id` duas vezes
    // SUBSTITUI, nunca duplica.
    const saveTheme = useCallback(async (theme: SarakThemeEntry): Promise<void> => {
        const validatedTheme: SarakThemeEntry = {
            ...theme,
            design: validateDesign(theme.design) as unknown as Record<string, unknown>
        };
        setDeletedThemeIds((prev) => prev.filter((id) => id !== validatedTheme.id));
        setSavedThemes((prev) => [...prev.filter((t) => t.id !== validatedTheme.id), validatedTheme]);
        await options?.theme?.onSave?.(validatedTheme);
    }, [options?.theme?.onSave]);

    const deleteTheme = useCallback(async (id: string): Promise<void> => {
        if (!allThemes.some((theme) => theme.id === id)) return;

        setDeletedThemeIds((prev) => [...new Set([...prev, id])]);
        setSavedThemes((prev) => prev.filter((theme) => theme.id !== id));
        await options?.theme?.onDelete?.(id);
    }, [allThemes, options?.theme?.onDelete]);

    return { allThemes, themeCatalog, loadTheme, saveTheme, deleteTheme };
};
