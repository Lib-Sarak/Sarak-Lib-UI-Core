import { useCallback } from 'react';
import { useOverlay } from '../../../../components/atomic/Modals/SarakOverlayProvider';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import {
    buildPaletteDraftPatch, findManualColorAdjustments, resolveDraftPalette,
} from '../utils/paletteDraft';
import type { SarakTokenValue } from '../../../../core/Design/types';

interface UsePaletteSelectionProps {
    draft: Record<string, unknown>;
    /** O design aplicado: referência dos ajustes manuais quando o rascunho ainda não tinha paleta. */
    appliedDesign: Record<string, unknown> | undefined;
    updateDraft: (id: string, value: SarakTokenValue) => void;
}

/**
 * Escolher uma paleta é rascunho: grava `colorPalette` e as cores calculadas do modo do rascunho.
 * Havendo cor ajustada à mão, pergunta antes — só o botão explícito "Descartar ajustes" os perde;
 * cancelar ou fechar o diálogo (Esc, clique fora) mantém o ajuste sobre a nova paleta.
 */
export const usePaletteSelection = ({ draft, appliedDesign, updateDraft }: UsePaletteSelectionProps) => {
    const overlay = useOverlay();
    const text = useLibraryText();
    const mode = draft.mode === 'light' ? 'light' : 'dark';

    return useCallback(async (value: string): Promise<void> => {
        if (draft.colorPalette === value) return;
        const previous = resolveDraftPalette(draft.colorPalette, mode);
        const reference = Object.keys(previous).length > 0 ? previous : (appliedDesign ?? {});
        const adjusted = findManualColorAdjustments(draft, reference);
        const discard = adjusted.length > 0 && await overlay.confirm({
            title: text('paletteKeepTitle'),
            message: text('paletteKeepMessage', { count: adjusted.length }),
            confirmLabel: text('paletteKeepDiscard'),
            cancelLabel: text('paletteKeepConfirm'),
            tone: 'danger',
        });
        const patch = buildPaletteDraftPatch(value, mode, discard ? [] : adjusted);
        Object.entries(patch).forEach(([tokenId, tokenValue]) => updateDraft(tokenId, tokenValue));
    }, [draft, appliedDesign, mode, overlay, text, updateDraft]);
};
