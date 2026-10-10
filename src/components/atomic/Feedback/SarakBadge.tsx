import React from 'react';
import { clsx } from 'clsx';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export type SarakBadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
export type SarakBadgeSize = 'sm' | 'md' | 'lg';

export interface SarakBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: SarakBadgeVariant;
    size?: SarakBadgeSize;
    /** Se true, o badge terá bordas mais arredondadas (estilo pill) */
    pill?: boolean;
    /** Se true, o fundo será translúcido/suave em vez de sólido */
    soft?: boolean;
    /** Exibe uma forma junto ao rótulo nas variantes de status. */
    showStatusShape?: boolean;
}

const STATUS_COLOR_PROPERTIES: Partial<Record<SarakBadgeVariant, string>> = {
    success: '--sarak-status-success-color',
    danger: '--sarak-status-error-color',
    warning: '--sarak-status-warning-color',
    info: '--sarak-status-info-color',
};

const BASE_CLASSES = 'inline-flex items-center justify-center font-bold tracking-wide transition-colors whitespace-nowrap';
const SIZE_CLASSES: Record<SarakBadgeSize, string> = {
    sm: 'px-1.5 py-0.5',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};
const VARIANT_CLASSES: Record<SarakBadgeVariant, { soft: string; solid: string }> = {
    primary: {
        soft: 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20',
        solid: 'bg-[var(--theme-primary)] text-white border border-transparent',
    },
    secondary: {
        soft: 'bg-[var(--theme-secondary)]/10 text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/20',
        solid: 'bg-[var(--theme-secondary)] text-white border border-transparent',
    },
    success: { soft: 'border', solid: 'border border-transparent text-black' },
    danger: { soft: 'border', solid: 'border border-transparent text-black' },
    warning: { soft: 'border', solid: 'border border-transparent text-black' },
    info: { soft: 'border', solid: 'border border-transparent text-black' },
    muted: {
        soft: 'bg-[var(--theme-surface)] text-[var(--theme-muted)] border border-transparent',
        solid: 'bg-[var(--theme-muted)] text-[var(--theme-surface)] border border-transparent',
    },
};

const STATUS_SHAPES: Partial<Record<SarakBadgeVariant, string>> = {
    success: '●',
    danger: '◆',
    warning: '▲',
    info: '■',
};

function getStatusStyle(variant: SarakBadgeVariant, soft: boolean): React.CSSProperties {
    const property = STATUS_COLOR_PROPERTIES[variant];
    if (!property) return {};
    const statusColor = `var(${property}, var(--sarak-primary-color, currentColor))`;
    return {
        color: soft ? statusColor : undefined,
        backgroundColor: soft ? `color-mix(in srgb, ${statusColor} 10%, transparent)` : statusColor,
        borderColor: soft ? `color-mix(in srgb, ${statusColor} 20%, transparent)` : 'transparent',
    };
}

function getVariantClass(variant: SarakBadgeVariant, soft: boolean): string {
    return VARIANT_CLASSES[variant][soft ? 'soft' : 'solid'];
}

export const SarakBadge: React.FC<SarakBadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    pill = false,
    soft = true,
    showStatusShape = true,
    className,
    style,
    ...props
}: SarakBadgeProps): React.ReactElement => {
    const statusShape = showStatusShape ? STATUS_SHAPES[variant] : undefined;
    const sizeStyle: React.CSSProperties = size === 'sm' ? { fontSize: 'var(--sarak-type-scale2xs, 10px)' } : {};
    return (
        <span
            className={mergeSarakClasses(
                BASE_CLASSES,
                SIZE_CLASSES[size],
                pill ? 'rounded-full' : 'rounded-md',
                getVariantClass(variant, soft),
                className,
            )}
            style={{ ...sizeStyle, ...getStatusStyle(variant, soft), ...style }}
            {...props}
        >
            {statusShape && <span aria-hidden="true" className="leading-none" data-status-shape>{statusShape}{'\u00a0'}</span>}
            {children}
        </span>
    );
};
