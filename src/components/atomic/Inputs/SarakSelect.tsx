import React, { SelectHTMLAttributes, useId, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakFieldError } from '../Feedback/SarakFieldError';

export interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /**
     * Rótulo visual ligado ao campo pelo `id` (gerado quando não é informado).
     * Sem ele, não há rótulo visível; forneça outro nome acessível se necessário.
     */
    label?: string;
    /**
     * Mensagem exibida abaixo da lista, ligada ao `<select>` por `aria-describedby`
     * (pelo `SarakFieldError`), que também marca `aria-invalid`. Sem a prop, não há
     * mensagem nem estado inválido.
     */
    error?: string;
    /**
     * Faz o contêiner e a lista ocuparem toda a largura disponível. Omitida ou
     * `false`, a largura depende do layout pai.
     */
    fullWidth?: boolean;
}

/**
 * Componente Atômico: SarakSelect
 *
 * @sarak-encapsula select — a razão de existir deste componente é dar forma Sarak
 *   ao `<select>` nativo (seta customizada, tokens de cor); remova o `<select>` e
 *   não sobra função nenhuma, só a seta decorativa.
 */
export const SarakSelect: React.FC<SarakSelectProps> = ({
    label,
    error,
    fullWidth,
    className = '',
    disabled,
    style,
    children,
    ...props
}) => {
    // Átomo: tolera montar sem SarakUIProvider (R34), usa o default do estilo de campo.
    const design = useSarakUIOptional()?.design;
    const { getInputStyles } = useAtomicStyles();
    const [isFocused, setIsFocused] = useState(false);
    const reactId = useId();
    // O id só existe quando algo (rótulo ou mensagem de erro) precisa apontar para o campo.
    const selectId = props.id ?? (label || error ? reactId : undefined);

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))]/30 bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))]';
    const shapeClasses = 'rounded-input py-[var(--sarak-input-padding,1rem)] pl-4 pr-10 appearance-none';
    
    // Sem `fullWidth` o invólucro encolhe ao campo: a seta é absoluta no invólucro e, num
    // bloco que estica (célula de grade), ficaria longe do `<select>`.
    const widthClass = fullWidth ? 'w-full' : 'w-fit';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    const field = (
        <div className={`relative group ${widthClass}`}>
            <select
                className={`${baseClasses} ${shapeClasses} ${widthClass} ${disabledClass} ${className}`}
                disabled={disabled}
                style={dynamicStyle}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${selectId}-error` : undefined}
                onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                {...props}
                id={selectId}
            >
                {children}
            </select>

            {/* Custom Caret */}
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#3b82f6))]" style={{ paddingRight: 'var(--sarak-layout-gap-md,16px)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <SarakFieldError message={error} fieldId={selectId ?? ''} />
        </div>
    );

    // Sem rótulo o invólucro é o próprio campo; o grupo só entra quando há rótulo a posicionar.
    if (!label) return field;

    return (
        <SarakFormGroup style={{ width: fullWidth ? '100%' : 'fit-content' }}>
            <label htmlFor={selectId} className="text-sm font-medium">{label}</label>
            {field}
        </SarakFormGroup>
    );
};
