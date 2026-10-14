import React, { TextareaHTMLAttributes, useId, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { SarakFieldError } from '../Feedback/SarakFieldError';

export interface SarakTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Rótulo visual ligado à área de texto pelo `id` (gerado quando não é informado). */
    label?: string;
    /**
     * Mensagem exibida abaixo da área de texto, ligada ao `<textarea>` por
     * `aria-describedby` (pelo `SarakFieldError`), que também marca `aria-invalid`.
     * Sem a prop, não há mensagem nem estado inválido.
     */
    error?: string;
    /**
     * Faz o contêiner e a área de texto ocuparem toda a largura disponível.
     * Omitida ou `false`, a largura depende do layout pai.
     */
    fullWidth?: boolean;
}

/**
 * Componente Atômico: SarakTextarea
 */
export const SarakTextarea: React.FC<SarakTextareaProps> = ({
    label,
    error,
    fullWidth,
    className = '',
    disabled,
    style,
    ...props
}: SarakTextareaProps): React.ReactElement => {
    // Átomo: tolera montar sem SarakUIProvider (R34) e cai no default do estilo de campo.
    const design = useSarakUIOptional()?.design;
    const { getInputStyles } = useAtomicStyles();
    const [isFocused, setIsFocused] = useState(false);
    const reactId = useId();
    const textareaId = props.id ?? reactId;
    const labelId = `${textareaId}-label`;

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--text-muted,rgba(255,255,255,0.4)))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--text-muted,rgba(255,255,255,0.4)))]/30 bg-[var(--sarak-input-bg,var(--color-theme-card,rgba(15,23,42,0.6)))]';
    const shapeClasses = 'rounded-input px-4 py-[var(--sarak-input-padding,16px)]';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    return (
        <div className={`relative group ${widthClass}`}>
            {label && <label id={labelId} htmlFor={textareaId} className="text-sm font-medium">{label}</label>}
            <textarea
                className={`${baseClasses} ${shapeClasses} ${widthClass} ${disabledClass} ${className}`}
                disabled={disabled}
                style={dynamicStyle}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${textareaId}-error` : undefined}
                onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                {...props}
                id={textareaId}
            />
            <SarakFieldError message={error} fieldId={textareaId} />
        </div>
    );
};
