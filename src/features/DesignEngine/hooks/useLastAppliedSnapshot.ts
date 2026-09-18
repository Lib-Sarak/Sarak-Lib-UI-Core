import { useCallback, useEffect, useState } from 'react';
import { SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';

interface AppliedSnapshot {
    design: SarakDesignState;
    /** O tema anunciado (`resolvedThemeId`) no instante da aplicação — sem isto,
     *  desfazer um tema do catálogo restaura o DESIGN mas deixa o tema errado
     *  anunciado (a persistência grava o par errado; a troca de modo usa a
     *  contraparte do tema desfeito, não a do restaurado). */
    resolvedThemeId: string | undefined;
}

/**
 * Um nível de desfazer para "Aplicar": guarda o design e o tema anunciado que
 * estavam no SISTEMA imediatamente ANTES da última aplicação, e devolve os dois
 * pelo MESMO caminho do "Aplicar" — sistema (`applyFullConfigRaw`), persistência
 * (`persistDesign`) e o tema anunciado (`setResolvedThemeId`). NÃO limpa o
 * rascunho aqui — quem chama (`useDesignDraft.ts`) faz isso pelo `setDraftState`
 * LOCAL, nunca por `sarak.setDraftDesign` direto: a ponte bidirecional de
 * `useDesignDraftSync.ts` só converge sem eco quando a mudança nasce do lado
 * local (o mesmo caminho que `resetToken`/`resetComponent` já usam). Uma nova
 * aplicação substitui a foto; nunca sobrevive a um reload (estado local, não
 * persistido).
 *
 * `persistDesign` lê o tema anunciado por uma ref que só reflete
 * `setResolvedThemeId` no PRÓXIMO render (`useDesignManager.ts`) — chamar as
 * duas na mesma função síncrona grava o tema de ANTES do desfazer. Por isso a
 * persistência do desfazer não é síncrona: `undoLastApply` só agenda
 * (`setPendingPersist`), e o efeito abaixo grava depois que o render (e a ref)
 * já assentaram — garantido pela ordem de fases do React, não por tempo.
 */
export const useLastAppliedSnapshot = (
    sarak: SarakUIContextType,
    showToast: (type: 'success' | 'warning', message: string) => void,
) => {
    const [snapshot, setSnapshot] = useState<AppliedSnapshot | null>(null);
    const [pendingPersist, setPendingPersist] = useState<SarakDesignState | null>(null);

    const captureBeforeApply = useCallback(() => {
        const design = sarak.systemDesign as SarakDesignState | undefined;
        setSnapshot(design ? { design, resolvedThemeId: sarak.resolvedThemeId } : null);
    }, [sarak.systemDesign, sarak.resolvedThemeId]);

    const undoLastApply = useCallback(() => {
        if (!snapshot || !sarak.applyFullConfigRaw) return;
        sarak.applyFullConfigRaw(snapshot.design);
        sarak.setResolvedThemeId?.(snapshot.resolvedThemeId);
        setPendingPersist(snapshot.design);
        setSnapshot(null);
        showToast('success', 'Última aplicação desfeita.');
    }, [snapshot, sarak, showToast]);

    useEffect(() => {
        if (!pendingPersist) return;
        sarak.persistDesign?.(pendingPersist);
        setPendingPersist(null);
    }, [pendingPersist, sarak]);

    return { canUndoLastApply: snapshot !== null, captureBeforeApply, undoLastApply };
};
