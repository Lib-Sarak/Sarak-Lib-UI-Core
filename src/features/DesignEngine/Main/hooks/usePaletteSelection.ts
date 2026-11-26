import { useCallback } from 'react';
import { useOverlay } from '../../../../components/atomic/Modals/SarakOverlayProvider';
import { useSarakUIOptional } from '../../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import {
    barTonesOf, buildPaletteDraftPatch, findManualColorAdjustments, findThemeColorAdjustments, resolveDraftPalette,
} from '../utils/paletteDraft';
import type { ModeResolvableTheme } from '../../../../core/Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../../../core/Design/types';

interface UsePaletteSelectionProps {
    draft: Record<string, unknown>;
    /** O design aplicado: referência dos ajustes manuais quando o rascunho ainda não tinha paleta. */
    appliedDesign: Record<string, unknown> | undefined;
    updateDraft: (id: string, value: SarakTokenValue) => void;
    /** O tema do rascunho: a cor que ele declara por cima da paleta não é ajuste manual. */
    theme?: ModeResolvableTheme;
}

/**
 * Escolher uma paleta é rascunho: grava `colorPalette` e as cores calculadas do modo do rascunho.
 * Havendo cor ajustada à mão, pergunta antes — só o botão explícito "Descartar ajustes" os perde;
 * cancelar ou fechar o diálogo (Esc, clique fora) mantém o ajuste sobre a nova paleta.
 */
export const usePaletteSelection = ({ draft, appliedDesign, updateDraft, theme }: UsePaletteSelectionProps) => {
    const overlay = useOverlay();
    const hostConfig = useSarakUIOptional()?.getHostConfig?.() as Record<string, unknown> | undefined;
    const text = useLibraryText();
    const mode = draft.mode === 'light' ? 'light' : 'dark';

    return useCallback(async (value: string): Promise<void> => {
        if (draft.colorPalette === value) return;
        const previous = resolveDraftPalette(draft.colorPalette, mode, barTonesOf(draft));
        const reference = Object.keys(previous).length > 0 ? previous : (appliedDesign ?? {});
        const adjusted = theme && Object.keys(previous).length > 0
            ? findThemeColorAdjustments(draft, theme, hostConfig)
            : findManualColorAdjustments(draft, reference);
        const discard = adjusted.length > 0 && await overlay.confirm({
            title: text('paletteKeepTitle'),
            message: text(adjusted.length === 1 ? 'paletteKeepMessageOne' : 'paletteKeepMessageMany', { count: adjusted.length }),
            confirmLabel: text('paletteKeepDiscard'),
            cancelLabel: text('paletteKeepConfirm'),
            tone: 'danger',
        });
        const patch = buildPaletteDraftPatch(value, mode, discard ? [] : adjusted, barTonesOf(draft));
        Object.entries(patch).forEach(([tokenId, tokenValue]) => updateDraft(tokenId, tokenValue));
    }, [draft, appliedDesign, mode, overlay, text, updateDraft, theme, hostConfig]);
};
