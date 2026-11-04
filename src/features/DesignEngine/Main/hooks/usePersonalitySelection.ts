import { useCallback } from 'react';
import { useOverlay } from '../../../../components/atomic/Modals/SarakOverlayProvider';
import type { Personality } from '../../../../core/Design/presets/components/personalities';
import type { SarakThemePreset } from '../../../../core/Design/presets/themes';
import type { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';
import { usePresetText } from '../../hooks/usePresetText';
import {
    buildStructureReference, findAppliedPersonality, findStructureAdjustments, personalityPatch, resolvePendingThemeDesign,
} from '../utils/personalityDraft';

interface UsePersonalitySelectionProps {
    draft: Partial<SarakDesignState>;
    sarak: SarakUIContextType;
    /** O tema escolhido na galeria e ainda não aplicado: o que ele trouxe não é ajuste manual. */
    draftThemeId?: string;
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
}

/**
 * Escolher uma Personalidade é rascunho: grava os tokens de estrutura dela e nenhuma cor. Havendo estrutura ajustada à
 * mão, pergunta antes — só o botão explícito "Descartar ajustes" os perde; cancelar ou fechar o diálogo (Esc, clique fora)
 * mantém o ajuste sobre a nova Personalidade.
 */
export const usePersonalitySelection = ({ draft, sarak, draftThemeId, onApplyPreset }: UsePersonalitySelectionProps) => {
    const overlay = useOverlay();
    const presetText = usePresetText();

    return useCallback(async (personality: Personality): Promise<void> => {
        const record = draft as Record<string, unknown>;
        const mode = record.mode === 'light' ? 'light' : 'dark';
        const theme = (sarak.allThemes as SarakThemePreset[] | undefined)?.find((candidate) => candidate.id === draftThemeId);
        const themeDesign = resolvePendingThemeDesign(theme, mode, record, sarak.getHostConfig?.() as Record<string, unknown> | undefined);
        const reference = buildStructureReference(sarak.systemDesign as Record<string, unknown> | undefined, themeDesign, findAppliedPersonality(record));
        const adjusted = findStructureAdjustments(record, reference, personality);
        const discard = adjusted.length > 0 && await overlay.confirm({
            title: presetText.ui('personalityKeepTitle'),
            message: presetText.ui(adjusted.length === 1 ? 'personalityKeepMessageOne' : 'personalityKeepMessageMany', { count: adjusted.length }),
            confirmLabel: presetText.ui('personalityKeepDiscard'),
            cancelLabel: presetText.ui('personalityKeepConfirm'),
            tone: 'danger',
        });
        onApplyPreset(personalityPatch(personality, discard ? [] : adjusted), true);
    }, [draft, sarak, draftThemeId, onApplyPreset, overlay, presetText]);
};
