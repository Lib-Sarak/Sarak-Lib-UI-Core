import { useEffect, useMemo, useState } from 'react';
import { SARAK_THEME_CATALOG } from '../../../../core/Design/presets/themes/catalog.generated';
import { getLoadedThemePresets, sarakLoadAllThemePresets, sarakLoadThemePreset } from '../../../../core/Design/presets/themes/registry';
import type { SarakThemeCatalogEntry, SarakThemePreset } from '../../../../core/Design/presets/themes';
import type { SarakThemeEntry, SarakUIContextType } from '../../../../core/Provider/types';

export interface CatalogThemeRow {
    entry: SarakThemeCatalogEntry;
    /** O tema com `design`, quando já chegou à memória; `undefined` enquanto só há o metadado. */
    theme: SarakThemePreset | undefined;
}

/**
 * Os temas da galeria: o catálogo LEVE lista tudo na hora; o `design` de cada
 * embarcado chega por `sarakLoadAllThemePresets` ao abrir a aba (um chunk, só
 * quando o painel abre). Sem Provider (uso isolado), lê o cache direto.
 */
export const useCatalogThemes = (sarak?: SarakUIContextType) => {
    const [standalone, setStandalone] = useState<SarakThemeEntry[]>(() => getLoadedThemePresets());

    useEffect(() => {
        let alive = true;
        sarakLoadAllThemePresets()
            .then((themes) => { if (alive) setStandalone(themes); })
            .catch((error: unknown) => console.error('[Sarak:Design] falha ao carregar os temas do catálogo:', error));
        return () => { alive = false; };
    }, []);

    const catalog = sarak?.themeCatalog ?? SARAK_THEME_CATALOG;
    const themes = sarak?.allThemes ?? standalone;

    const rows = useMemo<CatalogThemeRow[]>(() => {
        const byId = new Map<string, SarakThemeEntry>();
        themes.forEach((theme) => { if (theme.design && !byId.has(theme.id)) byId.set(theme.id, theme); });
        return catalog.map((entry) => ({ entry, theme: byId.get(entry.id) as SarakThemePreset | undefined }));
    }, [catalog, themes]);

    const loadTheme = sarak?.loadTheme ?? sarakLoadThemePreset;
    return { rows, loadTheme };
};
