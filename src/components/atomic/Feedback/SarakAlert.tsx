import React, { useId } from 'react';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakIcon } from '../Icon/SarakIcon';
import type { SarakIconName } from '../Icon/iconNames';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

export type SarakAlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertPresentation {
    icon: SarakIconName;
    color: string;
    role: 'alert' | 'status';
}

const ALERT_PRESENTATION: Readonly<Record<SarakAlertVariant, AlertPresentation>> = {
    success: {
        icon: 'CheckCircle2',
        color: 'var(--sarak-status-success-color, var(--theme-success, #10b981))',
        role: 'status',
    },
    error: {
        icon: 'AlertCircle',
        color: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))',
        role: 'alert',
    },
    warning: {
        icon: 'AlertTriangle',
        color: 'var(--sarak-status-warning-color, var(--theme-warning, #f59e0b))',
        role: 'status',
    },
    info: {
        icon: 'Info',
        color: 'var(--sarak-status-info-color, var(--theme-info, #3b82f6))',
        role: 'status',
    },
};

const ALERT_CONTENT_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--sarak-layout-gap-sm, 8px)',
};

function createAlertStyle(color: string): React.CSSProperties {
    return {
        gap: 'var(--sarak-layout-gap-sm, 8px)',
        padding: 'var(--sarak-layout-gap-md, 16px)',
        borderLeft: `var(--sarak-border-width, 1px) solid ${color}`,
        borderRadius: 'var(--sarak-card-radius, 12px)',
        backgroundColor: 'var(--color-theme-card, #1e293b)',
        color: 'var(--sarak-text-main, #ffffff)',
        fontSize: 'var(--sarak-body-size, 14px)',
    };
}

export interface SarakAlertProps {
    /** Define a intenção `info`, `success`, `warning` ou `error`; omitida, usa `info`. Só `error` recebe anúncio assertivo. */
    variant?: SarakAlertVariant;
    /** Define o título visível e o nome acessível do aviso; é obrigatória e, se omitida em runtime, o aviso fica sem título. */
    title: string;
    /** Define o texto simples do aviso; é obrigatório e, se omitido em runtime, nenhum texto será exibido. */
    message: string;
    /** Exibe uma ação com rótulo e callback; omitida, não há botão, e clicar nela não fecha o aviso automaticamente. */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Exibe o botão de fechar; omitida, não há botão, e o callback deve remover ou desmontar o aviso, pois ele não tem estado interno de fechamento. */
    onClose?: () => void;
}

function renderAlertAction(action: SarakAlertProps['action']): React.ReactElement | null {
    if (!action) return null;
    return (
        <SarakButton
            type="button"
            variant="primary"
            size="xs"
            style={{ alignSelf: 'flex-start' }}
            onClick={action.onClick}
        >
            {action.label}
        </SarakButton>
    );
}

function renderAlertCloseButton(onClose: SarakAlertProps['onClose'], closeLabel: string): React.ReactElement | null {
    if (!onClose) return null;
    return (
        <SarakIconButton
            type="button"
            variant="ghost"
            size="xs"
            aria-label={closeLabel}
            onClick={onClose}
            style={{ color: 'var(--sarak-text-main, #ffffff)', lineHeight: 1, borderRadius: 0 }}
            icon={<SarakIcon name="X" size="var(--sarak-body-size, 14px)" />}
        />
    );
}

export const SarakAlert = ({
    variant = 'info',
    title,
    message,
    action,
    onClose,
}: SarakAlertProps): React.ReactElement => {
    const presentation = ALERT_PRESENTATION[variant];
    const text = useLibraryText();
    const titleId = useId();
    const messageId = useId();

    return (
        <div
            role={presentation.role}
            aria-labelledby={titleId}
            aria-describedby={messageId}
            data-sarak-alert="true"
            data-variant={variant}
            className="flex items-start"
            style={createAlertStyle(presentation.color)}
        >
            <span aria-hidden="true">
                <SarakIcon name={presentation.icon} size="var(--sarak-body-size, 14px)" />
            </span>
            <div className="flex-1" style={ALERT_CONTENT_STYLE}>
                <strong id={titleId}>{title}</strong>
                <p id={messageId} style={{ margin: 0 }}>{message}</p>
                {renderAlertAction(action)}
            </div>
            {renderAlertCloseButton(onClose, text('alertClose'))}
        </div>
    );
};
