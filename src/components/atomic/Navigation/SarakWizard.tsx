import React, { useState } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { sarakErrorMessage } from '../../../shared/errors/sarakErrorMessage';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakStepper } from './SarakStepper';

/** O que `validate` devolve: `true` (ou nada) deixa passar; `false` recusa com a mensagem padrão; texto recusa com ele. */
export type SarakWizardValidation = boolean | string | void;

export interface SarakWizardStep {
    id: string;
    label: string;
    description?: string;
    /** Conteúdo da etapa. Só a etapa atual fica montada: o estado dos campos é do host. */
    content: React.ReactNode;
    /** Roda ao avançar (e ao concluir); pode ser assíncrona. Omitida, a etapa sempre deixa passar. */
    validate?: () => SarakWizardValidation | Promise<SarakWizardValidation>;
}

export interface SarakWizardProps {
    steps: SarakWizardStep[];
    /** Etapa atual (0-based) quando o host governa a navegação; omitida, o assistente guarda a etapa. */
    step?: number;
    /** Etapa inicial no modo sem `step`; omitida, a primeira. */
    defaultStep?: number;
    onStepChange?: (index: number) => void;
    /** Chamado na última etapa, depois da validação dela. */
    onFinish: () => void | Promise<void>;
    /** Mostra o botão de cancelar; omitido, não há botão. */
    onCancel?: () => void;
    className?: string;
}

const verdictOf = (result: SarakWizardValidation): string | null => {
    if (result === false) return '';
    return typeof result === 'string' ? result : null;
};

/** Assistente em etapas: compõe o `SarakStepper`, valida a etapa antes de avançar e só volta sem validar. */
export const SarakWizard = ({ steps, step, defaultStep = 0, onStepChange, onFinish, onCancel, className }: SarakWizardProps): React.ReactElement | null => {
    const text = useLibraryText();
    const [inner, setInner] = useState(defaultStep);
    const [message, setMessage] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const current = Math.min(Math.max(step ?? inner, 0), steps.length - 1);
    const active = steps[current];
    if (!active) return null;
    const isLast = current === steps.length - 1;

    const goTo = (index: number): void => {
        setMessage(null);
        setInner(index);
        onStepChange?.(index);
    };

    const advance = async (): Promise<void> => {
        setBusy(true);
        try {
            const verdict = verdictOf(await active.validate?.());
            if (verdict !== null) {
                setMessage(verdict || text('wizardStepInvalid'));
                return;
            }
            if (isLast) await onFinish();
            else goTo(current + 1);
        } catch (error) {
            setMessage(sarakErrorMessage(error));
        } finally {
            setBusy(false);
        }
    };

    return (
        <SarakFlex direction="column" gap="spacing-md" className={className} role="group" aria-label={text('wizardAriaLabel')}>
            <SarakStepper steps={steps.map(({ label, description }) => ({ label, description }))} current={current} />
            <div role="group" aria-label={active.label}>{active.content}</div>
            {message && <p role="alert" className="text-sm" style={{ color: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))' }}>{message}</p>}
            <SarakFlex gap="spacing-sm" justify="flex-end">
                {onCancel && <SarakButton type="button" variant="ghost" onClick={onCancel}>{text('wizardCancel')}</SarakButton>}
                {current > 0 && <SarakButton type="button" variant="outline" disabled={busy} onClick={() => goTo(current - 1)}>{text('wizardBack')}</SarakButton>}
                <SarakButton type="button" isLoading={busy} onClick={() => void advance()}>{isLast ? text('wizardFinish') : text('wizardNext')}</SarakButton>
            </SarakFlex>
        </SarakFlex>
    );
};
