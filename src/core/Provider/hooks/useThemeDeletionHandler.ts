import { useCallback } from 'react';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { resolveThemeForMode } from '../../Design/presets/themes/color-engine';
import { composeThemeDesign } from '../../Design/presets/themes/compose';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakDesignState, SarakThemeEntry } from '../types';

interface UseThemeDeletionHandlerProps {
    deleteThemeFromCollection: (id: string) => Promise<void>;
    resolvedThemeId?: string;
    loadTheme: (id: string) => Promise<SarakThemeEntry | undefined>;
    design: SarakDesignState;
    getHostConfig: () => SarakDesignState;
    setResolvedThemeId: (id: string) => void;
    applyFullConfig: (design: SarakDesignState) => void;
    persistDesign: (design: SarakDesignState) => Promise<void>;
}

export const useThemeDeletionHandler = ({
    deleteThemeFromCollection,
    resolvedThemeId,
    loadTheme,
    design,
    getHostConfig,
    setResolvedThemeId,
    applyFullConfig,
    persistDesign,
}: UseThemeDeletionHandlerProps): ((id: string) => Promise<void>) => useCallback(async (id) => {
    await deleteThemeFromCollection(id);
    if (resolvedThemeId !== id) return;

    const fallback = await loadTheme(SARAK_DEFAULT_THEME_ID);
    if (!fallback?.design) throw new Error(`O tema padrão "${SARAK_DEFAULT_THEME_ID}" não pôde ser carregado.`);

    const mode = design.mode === 'light' ? 'light' : 'dark';
    const resolvedFallback = resolveThemeForMode({
        design: fallback.design as Record<string, SarakTokenValue>,
        contraparte: fallback.contraparte,
    }, mode);
    const fallbackDesign = composeThemeDesign(resolvedFallback, design, getHostConfig());
    setResolvedThemeId(SARAK_DEFAULT_THEME_ID);
    applyFullConfig(fallbackDesign);
    await persistDesign(fallbackDesign);
}, [deleteThemeFromCollection, resolvedThemeId, loadTheme, design, getHostConfig, setResolvedThemeId, applyFullConfig, persistDesign]);
