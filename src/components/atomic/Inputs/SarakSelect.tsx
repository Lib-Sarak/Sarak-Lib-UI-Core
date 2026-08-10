import React, { SelectHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';

export interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
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
    error,
    fullWidth,
    className = '',
    disabled,
    style,
    children,
    ...props
}) => {
    const { design } = useSarakUI();
    const { getInputStyles } = useAtomicStyles();
    const [isFocused, setIsFocused] = useState(false);

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))]/30 bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))]';
    const shapeClasses = 'rounded-input py-4 pl-4 pr-10 appearance-none';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    return (
        <div className={`relative group ${widthClass}`}>
            <select
                className={`${baseClasses} ${shapeClasses} ${widthClass} ${disabledClass} ${className}`}
                disabled={disabled}
                style={dynamicStyle}
                onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                {...props}
            >
                {children}
            </select>
            
            {/* Custom Caret */}
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#3b82f6))]" style={{ paddingRight: 'var(--sarak-layout-gap-md,16px)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {error && (
                <p className="text-sm text-[var(--sarak-input-error-color,#ff4d4f)]" style={{ marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    {error}
                </p>
            )}
        </div>
    );
};
