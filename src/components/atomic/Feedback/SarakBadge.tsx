import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface SarakBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Se true, o badge terá bordas mais arredondadas (estilo pill) */
    pill?: boolean;
    /** Se true, o fundo será translúcido/suave em vez de sólido */
    soft?: boolean;
}

export const SarakBadge: React.FC<SarakBadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    pill = false,
    soft = true,
    className,
    ...props
}) => {
    // Base styles
    const baseClasses = "inline-flex items-center justify-center font-bold tracking-wide transition-colors whitespace-nowrap";

    // Size variants
    const sizeClasses = {
        sm: "px-1.5 py-0.5 text-[10px]",
        md: "px-2 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
    };

    // Shape
    const shapeClasses = pill ? "rounded-full" : "rounded-md";

    // Color variants mapping to Sarak theme tokens
    // Se soft=true, usamos fundo translúcido e texto colorido.
    // Se soft=false, usamos fundo sólido e texto com bom contraste (geralmente branco/preto dependendo do tema).
    const variantClasses = {
        primary: soft 
            ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20"
            : "bg-[var(--theme-primary)] text-white border border-transparent",
            
        secondary: soft
            ? "bg-[var(--theme-secondary)]/10 text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/20"
            : "bg-[var(--theme-secondary)] text-white border border-transparent",
            
        success: soft
            ? "bg-green-500/10 text-green-500 border border-green-500/20"
            : "bg-green-500 text-white border border-transparent",
            
        danger: soft
            ? "bg-red-500/10 text-red-500 border border-red-500/20"
            : "bg-red-500 text-white border border-transparent",
            
        warning: soft
            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
            : "bg-yellow-500 text-black border border-transparent",
            
        info: soft
            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
            : "bg-blue-500 text-white border border-transparent",
            
        muted: soft
            ? "bg-[var(--theme-border)] text-[var(--theme-muted)] border border-transparent"
            : "bg-[var(--theme-muted)] text-[var(--theme-surface)] border border-transparent",
    };

    return (
        <span 
            className={twMerge(
                baseClasses,
                sizeClasses[size],
                shapeClasses,
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
