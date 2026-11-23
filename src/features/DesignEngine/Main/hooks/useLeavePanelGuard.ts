import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterNavigationGuard } from '../../../../core/Provider/navigationGuard';

/** O que o administrador escolhe ao tentar sair do painel com alterações ainda não aplicadas. */
export type LeavePanelChoice = 'stay' | 'apply' | 'discard';

/** Entregue ao host: pergunta se pode sair do painel agora. Resolve `true` para sair, `false` para ficar. */
export interface SarakPanelLeaveControl {
    confirmLeave: () => Promise<boolean>;
}

/** Props públicas do painel de personalização. */
export interface SarakCustomizationPanelProps {
    /** Recebe o `confirmLeave` do painel. Opcional: o cromo da lib já pergunta sozinho; ligue-o ao bloqueio de rota do host só para a navegação que não passa pelo cromo (voltar do navegador, link no conteúdo). */
    onUnsavedChangesControl?: (control: SarakPanelLeaveControl) => void;
}

interface UseLeavePanelGuardOptions {
    /** O rascunho tem alteração que ainda não foi aplicada. */
    isDirty: boolean;
    onApply: () => void;
    onDiscard: () => void;
    /** Recebe o `confirmLeave`; o host o liga ao bloqueio de rota dele. */
    onControl?: (control: SarakPanelLeaveControl) => void;
}

export interface LeavePanelGuard {
    isAsking: boolean;
    choose: (choice: LeavePanelChoice) => void;
}

/** Com alteração pendente, fechar a aba mostra o aviso do navegador. */
const useWarnBeforeUnload = (isDirty: boolean): void => {
    useEffect(() => {
        if (!isDirty) return undefined;
        const warnBeforeUnload = (event: BeforeUnloadEvent): void => {
            event.preventDefault();
            // Só com `returnValue` preenchido todos os motores mostram o aviso nativo.
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warnBeforeUnload);
        return () => window.removeEventListener('beforeunload', warnBeforeUnload);
    }, [isDirty]);
};

/**
 * Avisa antes de o rascunho do painel se perder. Fechar a aba mostra o aviso do navegador; sair para
 * outra rota pelo cromo da lib (`SarakAppChrome`) pergunta (ficar, aplicar ou descartar) sozinho, pelo guarda
 * de navegação do Provider. A navegação que não passa pelo cromo (voltar do navegador, link no conteúdo)
 * usa `confirmLeave`, que o host liga ao roteador dele. Sem rascunho sujo, não pergunta nada.
 */
export const useLeavePanelGuard = ({ isDirty, onApply, onDiscard, onControl }: UseLeavePanelGuardOptions): LeavePanelGuard => {
    const [isAsking, setIsAsking] = useState(false);
    const resolveRef = useRef<((canLeave: boolean) => void) | null>(null);
    const dirtyRef = useRef(isDirty);
    const actionsRef = useRef({ onApply, onDiscard, onControl });
    dirtyRef.current = isDirty;
    actionsRef.current = { onApply, onDiscard, onControl };

    useWarnBeforeUnload(isDirty);

    const finish = useCallback((canLeave: boolean) => {
        const resolve = resolveRef.current;
        resolveRef.current = null;
        setIsAsking(false);
        resolve?.(canLeave);
    }, []);

    const confirmLeave = useCallback((): Promise<boolean> => {
        if (!dirtyRef.current) return Promise.resolve(true);
        // Uma pergunta já aberta continua sendo a resposta da anterior: a nova tentativa de saída fica.
        resolveRef.current?.(false);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
            setIsAsking(true);
        });
    }, []);

    const choose = useCallback((choice: LeavePanelChoice) => {
        if (choice === 'apply') actionsRef.current.onApply();
        if (choice === 'discard') actionsRef.current.onDiscard();
        finish(choice !== 'stay');
    }, [finish]);

    // O cromo da lib pergunta por aqui antes de chamar o `onNavigate` do host; limpo, nada é registrado.
    useRegisterNavigationGuard(isDirty ? confirmLeave : null);
    useEffect(() => { actionsRef.current.onControl?.({ confirmLeave }); }, [confirmLeave]);
    // Desmontar com a pergunta aberta responde "ficar": quem esperava não recebe um `true` que ninguém deu.
    useEffect(() => () => { resolveRef.current?.(false); resolveRef.current = null; }, []);

    return { isAsking, choose };
};
