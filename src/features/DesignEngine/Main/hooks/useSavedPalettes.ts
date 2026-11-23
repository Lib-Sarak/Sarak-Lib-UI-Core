import { useCallback, useMemo } from 'react';
import { useOverlay } from '../../../../components/atomic/Modals/SarakOverlayProvider';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import {
    encodeSavedPalettes, findSavedPaletteByName, removeSavedPalette, sanitizePaletteName, savePalette,
    savedPalettesOf, type SarakSavedPalette,
} from '../../../../core/Design/palette/savedPalettes';
import type { SarakTokenValue } from '../../../../core/Design/types';

interface UseSavedPalettesProps {
    draft: Record<string, unknown>;
    updateDraft: (id: string, value: SarakTokenValue) => void;
}

/** O que a tentativa de salvar fez: `saved` gravou no rascunho; `kept` é a recusa de substituir; o resto é o motivo da recusa. */
export type SavePaletteOutcome = 'saved' | 'kept' | 'name' | 'value' | 'full';

export interface SavedPalettesApi {
    saved: SarakSavedPalette[];
    save: (name: string, value: string) => Promise<SavePaletteOutcome>;
    remove: (entry: SarakSavedPalette) => Promise<void>;
}

/**
 * As paletas salvas do rascunho: salvar com nome (nome repetido pergunta antes de substituir) e apagar (pede confirmação).
 * É rascunho como o resto do painel: a lista só é gravada pelo `Aplicar`, junto com o design.
 */
export const useSavedPalettes = ({ draft, updateDraft }: UseSavedPalettesProps): SavedPalettesApi => {
    const overlay = useOverlay();
    const text = useLibraryText();
    const raw = draft.savedPalettes;
    const saved = useMemo(() => savedPalettesOf({ savedPalettes: raw }), [raw]);

    const save = useCallback(async (name: string, value: string): Promise<SavePaletteOutcome> => {
        const cleanName = sanitizePaletteName(name);
        if (!cleanName) return 'name';
        const same = findSavedPaletteByName(saved, cleanName);
        const replace = same !== undefined && await overlay.confirm({
            title: text('paletteSaveReplaceTitle'),
            message: text('paletteSaveReplaceMessage', { name: same.name }),
            confirmLabel: text('paletteSaveReplaceConfirm'),
            cancelLabel: text('paletteSaveReplaceCancel'),
        });
        if (same && !replace) return 'kept';
        const result = savePalette(saved, cleanName, value);
        if (!result.ok) return result.reason;
        updateDraft('savedPalettes', encodeSavedPalettes(result.list));
        return 'saved';
    }, [saved, overlay, text, updateDraft]);

    const remove = useCallback(async (entry: SarakSavedPalette): Promise<void> => {
        const confirmed = await overlay.confirm({
            title: text('paletteDeleteTitle'),
            message: text('paletteDeleteMessage', { name: entry.name }),
            confirmLabel: text('paletteDeleteConfirm'),
            cancelLabel: text('paletteDeleteCancel'),
            tone: 'danger',
        });
        if (confirmed) updateDraft('savedPalettes', encodeSavedPalettes(removeSavedPalette(saved, entry.id)));
    }, [saved, overlay, text, updateDraft]);

    return { saved, save, remove };
};
