import React, { SelectHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    fullWidth?: boolean;
}

/**
 * Componente Atômico: SarakSelect
 * Mapeia propriedades avançadas do Schema dinamicamente via engine context.
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
    const [isFocused, setIsFocused] = useState(false);

    // Propriedades Estruturais Avançadas
    const borderType = design?.inputBorderType || 'solid';
    const shadowType = design?.inputShadow || 'none';
    const blurAmount = design?.inputBackdropBlur || 0;
    
    const borderColor = 'var(--sarak-input-border-color, var(--theme-border))';
    const focusColor = 'var(--sarak-input-focus-border-color, var(--theme-primary))';

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--theme-text))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--theme-text))]/30 bg-[var(--sarak-input-bg,var(--theme-card))]';
    const shapeClasses = 'rounded-input py-4 pl-4 pr-10 appearance-none';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { ...style };
    
    if (borderType === 'none') {
        dynamicStyle.border = 'none';
    } else if (borderType === 'underline') {
        dynamicStyle.border = 'none';
        dynamicStyle.borderBottom = `2px solid ${isFocused ? focusColor : borderColor}`;
        dynamicStyle.borderRadius = '0px';
    } else if (borderType === 'dashed') {
        dynamicStyle.border = `2px dashed ${isFocused ? focusColor : borderColor}`;
    } else {
        dynamicStyle.border = `1px solid ${isFocused ? focusColor : borderColor}`;
    }

    if (isFocused && borderType !== 'underline' && borderType !== 'none') {
        dynamicStyle.boxShadow = `0 0 0 2px ${focusColor}33`;
    }

    if (shadowType === 'neumorphism' && !isFocused) {
        dynamicStyle.boxShadow = 'inset 5px 5px 10px rgba(0,0,0,0.5), inset -5px -5px 10px rgba(255,255,255,0.05)';
    } else if (shadowType === 'neumorphism' && isFocused) {
        dynamicStyle.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.05), ' + `0 0 0 2px ${focusColor}33`;
    } else if (shadowType !== 'none' && shadowType !== 'neumorphism' && !isFocused) {
        dynamicStyle.boxShadow = shadowType;
    }

    if (blurAmount > 0) {
        dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
        dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
    }

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
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--theme-primary))]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {error && (
                <p className="mt-2 text-sm text-[var(--sarak-input-error-color,#ff4d4f)]">
                    {error}
                </p>
            )}
        </div>
    );
};
