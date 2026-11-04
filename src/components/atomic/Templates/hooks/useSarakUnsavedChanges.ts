import { useCallback, useEffect, useRef } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { useOverlay } from '../../Modals/SarakOverlayProvider';

/** Por onde a saída foi tentada: fechar a aba ou navegar dentro do aplicativo. */
export type SarakUnsavedChangesBlockSource = 'unload' | 'navigation';

export interface SarakUnsavedChangesOptions {
    /** Há alteração que ainda não foi salva. */
    isDirty: boolean;
    /** Chamado quando a saída é barrada: ao fechar a aba ou ao recusar a confirmação. */
    onBlock?: (source: SarakUnsavedChangesBlockSource) => void;
}

export interface SarakUnsavedChangesControl {
    /**
     * Ligue no bloqueio do seu roteador: resolve `true` quando pode sair, sem perguntar se
     * não há alteração, e `false` quando o usuário escolhe continuar editando.
     */
    confirmLeave: () => Promise<boolean>;
}

/** Avisa antes de perder alteração não salva. A lib não navega: a rota interna é ligada pelo host. */
export const useSarakUnsavedChanges = ({ isDirty, onBlock }: SarakUnsavedChangesOptions): SarakUnsavedChangesControl => {
    const overlay = useOverlay();
    const text = useLibraryText();
    const dirtyRef = useRef(isDirty);
    const blockRef = useRef(onBlock);
    dirtyRef.current = isDirty;
    blockRef.current = onBlock;

    useEffect(() => {
        if (!isDirty) return undefined;
        const warnBeforeUnload = (event: BeforeUnloadEvent): void => {
            event.preventDefault();
            // O navegador só mostra o aviso nativo em todos os motores com `returnValue` preenchido.
            event.returnValue = '';
            blockRef.current?.('unload');
        };
        window.addEventListener('beforeunload', warnBeforeUnload);
        return () => window.removeEventListener('beforeunload', warnBeforeUnload);
    }, [isDirty]);

    const confirmLeave = useCallback(async (): Promise<boolean> => {
        if (!dirtyRef.current) return true;
        const confirmed = await overlay.confirm({
            title: text('unsavedChangesTitle'),
            message: text('unsavedChangesMessage'),
            confirmLabel: text('unsavedChangesLeave'),
            cancelLabel: text('unsavedChangesStay'),
            tone: 'danger',
        });
        if (!confirmed) blockRef.current?.('navigation');
        return confirmed;
    }, [overlay, text]);

    return { confirmLeave };
};
