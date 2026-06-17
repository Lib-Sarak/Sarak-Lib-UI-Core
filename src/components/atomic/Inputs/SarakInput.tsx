import React, { InputHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
    fullWidth?: boolean;
}

/**
 * Componente Atômico: SarakInput
 * Segue a regra da "Composição Atômica Obrigatória" da Sarak-Lib-UI-Core.
 * Mapeia propriedades avançadas do Schema dinamicamente via engine context.
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
    const [isFocused, setIsFocused] = useState(false);

    // Propriedades Estruturais Avançadas
    const borderType = design?.inputBorderType || 'solid';
    const shadowType = design?.inputShadow || 'none';
    const blurAmount = design?.inputBackdropBlur || 0;
    
    // Cores Injetadas (Lidamos via CSS var para fallback seguro, mas ajudam no estilo inline)
    const borderColor = 'var(--sarak-input-border-color, var(--theme-border))';
    const focusColor = 'var(--sarak-input-focus-border-color, var(--theme-primary))';

    // Classes base
    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--theme-text))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--theme-text))]/30 bg-[var(--sarak-input-bg,var(--theme-card))]';
    const shapeClasses = 'rounded-input py-4';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    
    // Tratamos a cor da borda condicionalmente via boxShadow inline para Focus ring (ao invés de ring-2 fixo do tailwind)
    const paddingLeftClass = leftIcon ? 'pl-11' : 'pl-4';
    const paddingRightClass = rightIcon ? 'pr-11' : 'pr-4';

    // Computação Dinâmica de Estilo Inline
    const dynamicStyle: React.CSSProperties = { ...style };
    
    // Bordas Dinâmicas
    if (borderType === 'none') {
        dynamicStyle.border = 'none';
    } else if (borderType === 'underline') {
        dynamicStyle.border = 'none';
        dynamicStyle.borderBottom = `2px solid ${isFocused ? focusColor : borderColor}`;
        dynamicStyle.borderRadius = '0px'; // Underline tira arredondamento global
    } else if (borderType === 'dashed') {
        dynamicStyle.border = `2px dashed ${isFocused ? focusColor : borderColor}`;
    } else {
        // Solid padrão
        dynamicStyle.border = `1px solid ${isFocused ? focusColor : borderColor}`;
    }

    // Foco Ring Customizado
    if (isFocused && borderType !== 'underline' && borderType !== 'none') {
        dynamicStyle.boxShadow = `0 0 0 2px ${focusColor}33`; // 33 é 20% opacity em hex
    }

    // Sombras Avançadas (Neumorphism vs None)
    if (shadowType === 'neumorphism' && !isFocused) {
        dynamicStyle.boxShadow = 'inset 5px 5px 10px rgba(0,0,0,0.5), inset -5px -5px 10px rgba(255,255,255,0.05)';
    } else if (shadowType === 'neumorphism' && isFocused) {
        dynamicStyle.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.05), ' + `0 0 0 2px ${focusColor}33`;
    } else if (shadowType !== 'none' && shadowType !== 'neumorphism' && !isFocused) {
        dynamicStyle.boxShadow = shadowType;
    }

    // Glassmorphism Blur
    if (blurAmount > 0) {
        dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
        dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
    }

    return (
        <div className={`relative group ${widthClass}`}>
            {leftIcon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--theme-primary))]">
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
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--sarak-input-icon-color,rgba(255,255,255,0.5))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--theme-primary))]">
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
