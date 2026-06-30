import React, { TextareaHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';

export interface SarakTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    fullWidth?: boolean;
}

/**
 * Componente Atômico: SarakTextarea
 */
export const SarakTextarea: React.FC<SarakTextareaProps> = ({
    error,
    fullWidth,
    className = '',
    disabled,
    style,
    ...props
}) => {
    const { design } = useSarakUI();
    const { getInputStyles } = useAtomicStyles();
    const [isFocused, setIsFocused] = useState(false);

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(var(--text-muted,#94a3b8)))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(var(--text-muted,#94a3b8)))]/30 bg-[var(--sarak-input-bg,var(var(--color-theme-card,#1e293b)))]';
    const shapeClasses = 'rounded-input p-4';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    return (
        <div className={`relative group ${widthClass}`}>
            <textarea
                className={`${baseClasses} ${shapeClasses} ${widthClass} ${disabledClass} ${className}`}
                disabled={disabled}
                style={dynamicStyle}
                onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-[var(--sarak-input-error-color,#ff4d4f)]">
                    {error}
                </p>
            )}
        </div>
    );
};
