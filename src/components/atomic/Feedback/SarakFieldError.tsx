import React from 'react';
import { SarakIcon } from '../Icon/SarakIcon';

export interface SarakFieldErrorProps {
    /**
     * Mensagem do erro. Omitida, vazia ou composta só por espaços, não renderiza
     * elemento nem reserva espaço; espaços nas bordas não são removidos do texto exibido.
     */
    message?: string;
    /**
     * `id` do controle descrito; a mensagem recebe o id `${fieldId}-error`.
     * É obrigatório em TypeScript; se omitido ao contornar a tipagem, a mensagem
     * continua visível e anunciada, mas não pode ser associada ao campo. No controle,
     * use esse id da mensagem em `aria-describedby`.
     */
    fieldId: string;
}

/** Exibe uma mensagem de erro anunciada por leitor de tela e pronta para associação ao campo. */
export function SarakFieldError({ message, fieldId }: SarakFieldErrorProps): React.ReactElement | null {
    if (!message?.trim()) {
        return null;
    }

    return (
        <p
            id={fieldId ? `${fieldId}-error` : undefined}
            role="alert"
            className="text-sm text-[var(--sarak-input-error-color,#ff4d4f)]"
            style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}
        >
            <span aria-hidden="true">
                <SarakIcon name="AlertCircle" size="var(--sarak-body-size, 14px)" />
            </span>{' '}
            {message}
        </p>
    );
}
