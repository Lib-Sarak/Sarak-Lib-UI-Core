import { useCallback, useState } from 'react';
import { SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';

interface AppliedSnapshot {
    design: SarakDesignState;
    resolvedThemeId: string | undefined;
}

/**
 * Guarda uma aplicação anterior para desfazer o design e o id de tema juntos.
 * O desfazer não limpa o rascunho aqui: `useDesignDraft` limpa pelo `setDraftState`
 * local, sem chamar `sarak.setDraftDesign`; pela ponte de
 * `useDesignDraftSync.ts`, essa origem local converge sem eco nem restaura o
 * rascunho antigo sobre o sistema.
 *
 * `setResolvedThemeId` atualiza sincronamente a ref que `persistDesign` lê em
 * `useDesignManager`. Por isso o setter do id precisa vir antes da gravação, na
 * mesma execução síncrona, para `onSave` receber o par restaurado.
 */
export const useLastAppliedSnapshot = (
    sarak: SarakUIContextType,
    showToast: (type: 'success' | 'warning', message: string) => void,
) => {
    const [snapshot, setSnapshot] = useState<AppliedSnapshot | null>(null);

    const captureBeforeApply = useCallback(() => {
        const design = sarak.systemDesign as SarakDesignState | undefined;
        setSnapshot(design ? { design, resolvedThemeId: sarak.resolvedThemeId } : null);
    }, [sarak.systemDesign, sarak.resolvedThemeId]);

    const undoLastApply = useCallback(() => {
        if (!snapshot || !sarak.applyFullConfigRaw) return;
        sarak.applyFullConfigRaw(snapshot.design);
        sarak.setResolvedThemeId?.(snapshot.resolvedThemeId);
        sarak.persistDesign?.(snapshot.design);
        setSnapshot(null);
        showToast('success', 'Última aplicação desfeita.');
    }, [snapshot, sarak, showToast]);

    return { canUndoLastApply: snapshot !== null, captureBeforeApply, undoLastApply };
};
