import React, { ButtonHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon: React.ReactNode;
}

/**
 * Componente Atômico: SarakIconButton
 * Um botão iconográfico com restrições geométricas exatas.
 * Implementa taxonomia completa (Neon, Frosted) adaptada para proporções quadradas/circulares.
 */
export const SarakIconButton: React.FC<SarakIconButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    disabled,
    style,
    ...props
}) => {
    const { design } = useSarakUI();
    const [isHovered, setIsHovered] = useState(false);

    const styleType = design?.btnStyleType || 'matte';
    const glowColor = design?.btnNeonGlowColor || 'rgba(0, 242, 255, 0.4)';
    const blurAmount = design?.btnBackdropBlur || 0;

    // Tamanhos estritamente quadrados
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg'
    };

    const baseClasses = `inline-flex items-center justify-center transition-all focus:outline-none rounded-btn flex-shrink-0 ${sizeClasses[size]}`;

    // Computar cores base
    const baseColor = variant === 'danger' ? 'var(--theme-danger, #ef4444)' : 'var(--sx-color-primary-base)';
    const baseTextColor = variant === 'danger' ? '#ffffff' : 'var(--sx-color-text-muted)';
    const localGlow = variant === 'danger' ? 'rgba(239, 68, 68, 0.5)' : glowColor;

    let tailwindClasses = '';

    if (variant === 'primary') {
        tailwindClasses = 'bg-[var(--sx-color-primary-base)] text-[var(--sx-color-text-muted)] hover:brightness-110 active:scale-[0.95]';
        if (styleType === 'matte') tailwindClasses += ' shadow-xl shadow-[var(--sx-color-primary-base)]/20';
        if (styleType === 'borderline') tailwindClasses = 'border border-[var(--sx-color-primary-base)] bg-transparent hover:bg-[var(--sx-color-primary-base)] hover:text-[var(--sx-color-text-muted)] active:scale-[0.95] text-[var(--sx-color-primary-base)]';
    } else if (variant === 'secondary') {
        tailwindClasses = 'bg-[var(--sx-color-surface-base)] text-[var(--sx-color-text-muted)] hover:bg-[var(--sx-color-primary-base)] hover:text-[var(--sx-color-text-muted)] border border-[var(--sx-color-primary-base)]/20 active:scale-[0.95]';
    } else if (variant === 'ghost') {
        tailwindClasses = 'bg-transparent text-[var(--sx-color-primary-base)] hover:bg-white/5 active:scale-[0.98]';
    } else if (variant === 'danger') {
        tailwindClasses = 'bg-[var(--theme-danger,#ef4444)] text-white hover:brightness-110 shadow-lg shadow-[var(--theme-danger,#ef4444)]/20 active:scale-[0.95]';
    }

    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { ...style };
    
    // Processamento Visual Dinâmico Reduzido para Ícones
    if (styleType === 'neon') {
        if (variant === 'primary' || variant === 'danger') {
            dynamicStyle.boxShadow = isHovered 
                ? `0 0 12px ${localGlow}, inset 0 0 5px ${localGlow}`
                : `0 0 5px ${localGlow}`;
            dynamicStyle.border = `1px solid ${localGlow}`;
        } else if (variant === 'secondary') {
            dynamicStyle.boxShadow = isHovered ? `0 0 8px ${localGlow}` : 'none';
            dynamicStyle.border = `1px solid ${localGlow}`;
            dynamicStyle.backgroundColor = `rgba(0,0,0,0.4)`;
        } else if (variant === 'ghost') {
            dynamicStyle.boxShadow = isHovered ? `0 0 8px ${localGlow}` : 'none';
            if (isHovered) {
                dynamicStyle.textShadow = `0 0 5px ${localGlow}`;
            }
        }
    } else if (styleType === 'frosted') {
        if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
            dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.border = '1px solid rgba(255,255,255,0.1)';
            if (variant === 'primary' || variant === 'danger') {
                dynamicStyle.boxShadow = '0 4px 16px 0 rgba(0, 0, 0, 0.3)';
            }
            if (variant === 'secondary') {
                dynamicStyle.backgroundColor = 'rgba(255,255,255,0.05)';
            }
        }
    }

    return (
        <button
            className={`${baseClasses} ${tailwindClasses} ${disabledClass} ${className}`}
            disabled={disabled || isLoading}
            style={dynamicStyle}
            onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e); }}
            onMouseLeave={(e) => { setIsHovered(false); props.onMouseLeave?.(e); }}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon}
        </button>
    );
};
