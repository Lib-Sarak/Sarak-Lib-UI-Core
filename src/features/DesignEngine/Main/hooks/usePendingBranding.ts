import { useCallback, useMemo, useState } from 'react';
import type { SarakBrandingState } from '../../../../core/Provider/types';
import type { SarakDirtyToken } from '../../hooks/useDesignDraft';

/** A parte da marca que o atalho "Usar minha marca" escreve; o resto da `SarakBrandingState` não é tocado. */
export type PendingBranding = Pick<SarakBrandingState, 'companyName' | 'logoBase64'>;

const BRANDING_DIRTY_ID = 'branding';

interface UsePendingBrandingProps {
    branding: SarakBrandingState | undefined;
    updateBranding: ((partial: Partial<SarakBrandingState>) => Promise<void>) | undefined;
    /** O rótulo humano da linha "Identidade da empresa" na lista de mudanças. */
    dirtyLabel: string;
}

/**
 * A marca do atalho espera o "Aplicar": `updateBranding` grava na hora, então o painel guarda o que o usuário
 * pediu aqui, mostra na prévia e só entrega ao Provider quando o rascunho é aplicado. Descartar esquece.
 */
export const usePendingBranding = ({ branding, updateBranding, dirtyLabel }: UsePendingBrandingProps) => {
    const [pending, setPending] = useState<PendingBranding | null>(null);

    const isDirty = pending !== null && (
        (pending.companyName ?? '') !== (branding?.companyName ?? '') || (pending.logoBase64 ?? null) !== (branding?.logoBase64 ?? null)
    );

    const commit = useCallback(() => {
        if (pending && isDirty) void updateBranding?.({ companyName: pending.companyName, logoBase64: pending.logoBase64 });
        setPending(null);
    }, [pending, isDirty, updateBranding]);

    const clear = useCallback(() => setPending(null), []);

    const dirtyToken = useMemo((): SarakDirtyToken | null => (isDirty && pending ? {
        id: BRANDING_DIRTY_ID,
        label: dirtyLabel,
        applied: branding?.companyName ?? '',
        draft: pending.companyName ?? '',
    } : null), [isDirty, pending, branding?.companyName, dirtyLabel]);

    return { pending, setPending, isDirty, commit, clear, dirtyToken };
};
