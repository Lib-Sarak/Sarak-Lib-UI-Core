import React, { ButtonHTMLAttributes, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useButtonLayoutStyles } from './hooks/useButtonLayoutStyles';

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
    // Átomo: tolera montar sem SarakUIProvider (Spec 18 — R10 §2.3), usa o default abaixo.
    const design = useSarakUIOptional()?.design;
    const { getButtonStyles } = useAtomicStyles();
    const { containerClass, iconOrderClass } = useButtonLayoutStyles(design);
    const [isHovered, setIsHovered] = useState(false);

    const styleType = design?.btnStyleType || 'matte';

    const sizeClasses = {
        xs: 'py-1.5 px-3 text-xs',
        sm: 'py-2 px-4 text-sm',
        md: 'py-4 px-6 text-sm',
        lg: 'py-5 px-8 text-base'
    };

    const baseClasses = `${containerClass} ${iconOrderClass} font-black uppercase tracking-widest transition-all focus:outline-none rounded-btn ${sizeClasses[size]}`;

    const getTailwindClasses = (v: string, st: string) => {
        const strats: Record<string, () => string> = {
            'primary': () => {
                if (st === 'borderline') return 'border border-[var(--sarak-primary-color,#3b82f6)] bg-transparent hover:bg-[var(--sarak-primary-color,#3b82f6)] hover:text-[var(--text-muted,#94a3b8)] active:scale-[0.98] text-[var(--sarak-primary-color,#3b82f6)]';
                const base = 'bg-[var(--sarak-primary-color,#3b82f6)] text-[var(--text-muted,#94a3b8)] hover:brightness-110 active:scale-[0.98]';
                return st === 'matte' ? `${base} shadow-xl shadow-[var(--sarak-primary-color,#3b82f6)]/20` : base;
            },
            'secondary': () => 'bg-[var(--color-theme-card,#1e293b)] text-[var(--text-muted,#94a3b8)] hover:bg-[var(--sarak-primary-color,#3b82f6)] hover:text-[var(--text-muted,#94a3b8)] border border-[var(--sarak-primary-color,#3b82f6)]/20 active:scale-[0.98]',
            'ghost': () => 'bg-transparent text-[var(--sarak-primary-color,#3b82f6)] hover:bg-white/5 active:scale-[0.98]',
            'danger': () => 'bg-[var(--sarak-status-error-color,#ef4444)] text-white hover:brightness-110 shadow-xl shadow-[var(--sarak-status-error-color,#ef4444)]/20 active:scale-[0.98]',
            'success': () => 'bg-[var(--theme-success,#10b981)] text-white hover:brightness-110 shadow-xl shadow-[var(--theme-success,#10b981)]/20 active:scale-[0.98]',
            'outline': () => 'bg-transparent text-[var(--sarak-primary-color,#3b82f6)] border border-[var(--sarak-primary-color,#3b82f6)] hover:bg-[var(--sarak-primary-color,#3b82f6)]/10 active:scale-[0.98]'
        };
        return strats[v] ? strats[v]() : '';
    };

    const tailwindClasses = getTailwindClasses(variant, styleType);

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

