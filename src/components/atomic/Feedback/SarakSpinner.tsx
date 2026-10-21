import React from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

const SIZE_TOKENS = {
    sm: 'var(--sarak-type-scale-caption, 12px)',
    md: 'var(--sarak-body-size, 14px)',
    lg: 'var(--sarak-h3-size, 24px)',
} as const;

export interface SarakSpinnerProps {
    /** Define o diâmetro pequeno, médio ou grande; omitido, usa `md` e os tamanhos acompanham os tokens tipográficos do tema. */
    size?: 'sm' | 'md' | 'lg';
    /** Nome acessível do progresso indeterminado; omitido ou vazio, usa o catálogo no idioma ativo. */
    label?: string;
    /** Acrescenta classes ao SVG; omitida, mantém o estilo interno. Classes de animação podem substituir a rotação em movimento permitido. */
    className?: string;
}

export const SarakSpinner: React.FC<SarakSpinnerProps> = ({
    size = 'md',
    label,
    className,
}: SarakSpinnerProps): React.ReactElement => {
    const text = useLibraryText();
    const accessibleLabel = label?.trim() ? label : text('spinnerLoading');

    return (
        <svg
            aria-label={accessibleLabel}
            className={mergeSarakClasses('motion-safe:animate-spin', className)}
            focusable="false"
            role="progressbar"
            style={{
                color: 'var(--sarak-primary-color, currentColor)',
                height: SIZE_TOKENS[size],
                width: SIZE_TOKENS[size],
            }}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2a10 10 0 0 1 10 10"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="var(--sarak-icon-stroke, 2)"
            />
        </svg>
    );
};
