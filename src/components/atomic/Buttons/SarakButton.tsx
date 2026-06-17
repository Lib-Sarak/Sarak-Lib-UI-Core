import React, { ButtonHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Componente Atômico: SarakButton
 * Respeita a Spec 08-taxonomia-componentes e implementa a universalização de Neon/Frosted para todas as variantes.
 */
export const SarakButton: React.FC<SarakButtonProps> = ({
    variant = 'primary',
    isLoading,
    leftIcon,
    rightIcon,
    fullWidth,
    size = 'md',
    className = '',
    children,
    disabled,
    style,
    ...props
}) => {
    const { design } = useSarakUI();
    const [isHovered, setIsHovered] = useState(false);

    const styleType = design?.btnStyleType || 'matte';
    const glowColor = design?.btnNeonGlowColor || 'rgba(0, 242, 255, 0.4)';
    const blurAmount = design?.btnBackdropBlur || 0;

    const sizeClasses = {
        xs: 'py-1.5 px-3 text-xs',
        sm: 'py-2 px-4 text-sm',
        md: 'py-4 px-6 text-sm',
        lg: 'py-5 px-8 text-base'
    };

    const baseClasses = `inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all focus:outline-none rounded-btn ${sizeClasses[size]}`;

    // Computar cores base (Tema vs Danger)
    const baseColor = variant === 'danger' ? 'var(--theme-danger, #ef4444)' : 'var(--theme-primary)';
    const baseTextColor = variant === 'danger' ? '#ffffff' : 'var(--theme-text)';
    const localGlow = variant === 'danger' ? 'rgba(239, 68, 68, 0.5)' : glowColor;

    let tailwindClasses = '';

    // Estilos Base do Tailwind (Backgrounds e Bordas Matte/Padrão)
    if (variant === 'primary') {
        tailwindClasses = 'bg-[var(--theme-primary)] text-[var(--theme-text)] hover:brightness-110 active:scale-[0.98]';
        if (styleType === 'matte') tailwindClasses += ' shadow-xl shadow-[var(--theme-primary)]/20';
        if (styleType === 'borderline') tailwindClasses = 'border border-[var(--theme-primary)] bg-transparent hover:bg-[var(--theme-primary)] hover:text-[var(--theme-text)] active:scale-[0.98] text-[var(--theme-primary)]';
    } else if (variant === 'secondary') {
        tailwindClasses = 'bg-[var(--theme-card)] text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-text)] border border-[var(--theme-primary)]/20 active:scale-[0.98]';
    } else if (variant === 'ghost') {
        tailwindClasses = 'bg-transparent text-[var(--theme-primary)] hover:bg-white/5 active:scale-[0.98]';
    } else if (variant === 'danger') {
        tailwindClasses = 'bg-[var(--theme-danger,#ef4444)] text-white hover:brightness-110 shadow-xl shadow-[var(--theme-danger,#ef4444)]/20 active:scale-[0.98]';
    }

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    // Engine de Estilos Inline (Neon / Frosted / Glassmorphism)
    const dynamicStyle: React.CSSProperties = { ...style };
    
    // Processamento do Neon
    if (styleType === 'neon') {
        if (variant === 'primary' || variant === 'danger') {
            dynamicStyle.boxShadow = isHovered 
                ? `0 0 20px ${localGlow}, inset 0 0 10px ${localGlow}`
                : `0 0 10px ${localGlow}`;
            dynamicStyle.border = `1px solid ${localGlow}`;
        } else if (variant === 'secondary') {
            dynamicStyle.boxShadow = isHovered 
                ? `0 0 15px ${localGlow}`
                : `0 0 5px ${localGlow}`;
            dynamicStyle.border = `1px solid ${localGlow}`;
            dynamicStyle.backgroundColor = `rgba(0,0,0,0.4)`; // Fundo translúcido para secondary neon
        } else if (variant === 'ghost') {
            dynamicStyle.boxShadow = isHovered ? `0 0 15px ${localGlow}` : 'none';
            if (isHovered) {
                dynamicStyle.textShadow = `0 0 8px ${localGlow}`;
            }
        }
    } 
    // Processamento do Frosted
    else if (styleType === 'frosted') {
        if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
            dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.border = '1px solid rgba(255,255,255,0.1)';
            if (variant === 'primary' || variant === 'danger') {
                dynamicStyle.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
            }
            if (variant === 'secondary') {
                dynamicStyle.backgroundColor = 'rgba(255,255,255,0.05)';
            }
        }
    }

    return (
        <button
            className={`${baseClasses} ${tailwindClasses} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled || isLoading}
            style={dynamicStyle}
            onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e); }}
            onMouseLeave={(e) => { setIsHovered(false); props.onMouseLeave?.(e); }}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : leftIcon}
            
            <span>{children}</span>
            
            {!isLoading && rightIcon}
        </button>
    );
};

