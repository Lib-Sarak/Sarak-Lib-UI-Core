import React, { InputHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';

export interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
    fullWidth?: boolean;
}

/**
 * Componente Atômico: SarakInput
 * Segue a regra da "Composição Atômica Obrigatória" da Sarak-Lib-UI-Core.
 */
export const SarakInput: React.FC<SarakInputProps> = ({
    leftIcon,
    rightIcon,
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

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--sx-color-text-muted))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--sx-color-text-muted))]/30 bg-[var(--sarak-input-bg,var(--sx-color-surface-base))]';
    const shapeClasses = 'rounded-input py-4';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    
    const paddingLeftClass = leftIcon ? 'pl-11' : 'pl-4';
    const paddingRightClass = rightIcon ? 'pr-11' : 'pr-4';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    return (
        <div className={`relative group ${widthClass}`}>
            {leftIcon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sx-color-primary-base))]">
                    {leftIcon}
                </div>
            )}
            
            <input
                className={`${baseClasses} ${shapeClasses} ${paddingLeftClass} ${paddingRightClass} ${widthClass} ${disabledClass} ${className}`}
                disabled={disabled}
                style={dynamicStyle}
                onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                {...props}
            />
            
            {rightIcon && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sx-color-primary-base))]">
                    {rightIcon}
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-[var(--sarak-input-error-color,#ff4d4f)]">
                    {error}
                </p>
            )}
        </div>
    );
};
