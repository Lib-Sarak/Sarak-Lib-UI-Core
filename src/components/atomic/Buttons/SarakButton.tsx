import React, { ButtonHTMLAttributes, useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';

export interface SarakButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
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
    const { getButtonStyles } = useAtomicStyles();
    const [isHovered, setIsHovered] = useState(false);

    const styleType = design?.btnStyleType || 'matte';

    const sizeClasses = {
        xs: 'py-1.5 px-3 text-xs',
        sm: 'py-2 px-4 text-sm',
        md: 'py-4 px-6 text-sm',
        lg: 'py-5 px-8 text-base'
    };

    const baseClasses = `inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all focus:outline-none rounded-btn ${sizeClasses[size]}`;

    let tailwindClasses = '';

    if (variant === 'primary') {
        tailwindClasses = 'bg-[var(--sx-color-primary-base)] text-[var(--sx-color-text-muted)] hover:brightness-110 active:scale-[0.98]';
        if (styleType === 'matte') tailwindClasses += ' shadow-xl shadow-[var(--sx-color-primary-base)]/20';
        if (styleType === 'borderline') tailwindClasses = 'border border-[var(--sx-color-primary-base)] bg-transparent hover:bg-[var(--sx-color-primary-base)] hover:text-[var(--sx-color-text-muted)] active:scale-[0.98] text-[var(--sx-color-primary-base)]';
    } else if (variant === 'secondary') {
        tailwindClasses = 'bg-[var(--sx-color-surface-base)] text-[var(--sx-color-text-muted)] hover:bg-[var(--sx-color-primary-base)] hover:text-[var(--sx-color-text-muted)] border border-[var(--sx-color-primary-base)]/20 active:scale-[0.98]';
    } else if (variant === 'ghost') {
        tailwindClasses = 'bg-transparent text-[var(--sx-color-primary-base)] hover:bg-white/5 active:scale-[0.98]';
    } else if (variant === 'danger') {
        tailwindClasses = 'bg-[var(--theme-danger,#ef4444)] text-white hover:brightness-110 shadow-xl shadow-[var(--theme-danger,#ef4444)]/20 active:scale-[0.98]';
    } else if (variant === 'success') {
        tailwindClasses = 'bg-[var(--theme-success,#10b981)] text-white hover:brightness-110 shadow-xl shadow-[var(--theme-success,#10b981)]/20 active:scale-[0.98]';
    } else if (variant === 'outline') {
        tailwindClasses = 'bg-transparent text-[var(--sx-color-primary-base)] border border-[var(--sx-color-primary-base)] hover:bg-[var(--sx-color-primary-base)]/10 active:scale-[0.98]';
    }

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getButtonStyles(design, variant, isHovered)
    };
    
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

