import React, { InputHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';

export interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
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
    label,
    icon,
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
    const { getInputIconStyles } = useStructuralStyles();
    const { iconPositionClass, isIconRight } = getInputIconStyles();
    const [isFocused, setIsFocused] = useState(false);

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--sx-color-text-muted))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--sx-color-text-muted))]/30 bg-[var(--sarak-input-bg,var(--sx-color-surface-base))]';
    const shapeClasses = 'rounded-input py-4';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    
    // Usa o icon genérico ou fallback para left/right legados
    const activeIcon = icon || leftIcon || rightIcon;
    const hasIcon = !!activeIcon;
    
    // Se a posição estrutural for right, o padding muda de lado dinamicamente
    const paddingLeftClass = hasIcon && !isIconRight ? 'pl-11' : 'pl-4';
    const paddingRightClass = hasIcon && isIconRight ? 'pr-11' : 'pr-4';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    return (
        <SarakFormGroup className={`${widthClass} ${className}`}>
            {label && <label className="text-sm font-medium">{label}</label>}
            
            <div className="flex-1 flex flex-col relative w-full">
                <div className="relative w-full flex items-center">
                    {hasIcon && (
                        <div className={`${iconPositionClass} flex items-center pointer-events-none text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sx-color-primary-base))]`}>
                            {activeIcon}
                        </div>
                    )}
                    
                    <input
                        className={`${baseClasses} ${shapeClasses} ${paddingLeftClass} ${paddingRightClass} w-full ${disabledClass}`}
                        disabled={disabled}
                        style={dynamicStyle}
                        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="mt-1 text-sm text-[var(--sarak-input-error-color,#ff4d4f)]">
                        {error}
                    </p>
                )}
            </div>
        </SarakFormGroup>
    );
};
