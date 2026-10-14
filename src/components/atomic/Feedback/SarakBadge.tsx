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

/** O texto de cada status sólido: o de maior contraste sobre a cor do status (emitido pelo motor). */
const STATUS_ON_COLOR_PROPERTIES: Partial<Record<SarakBadgeVariant, string>> = {
    success: '--sarak-on-success',
    danger: '--sarak-on-error',
    warning: '--sarak-on-warning',
    info: '--sarak-on-info',
};

const BASE_CLASSES = 'inline-flex items-center justify-center font-bold tracking-wide transition-colors whitespace-nowrap';
const SIZE_CLASSES: Record<SarakBadgeSize, string> = {
    sm: 'px-1.5 py-0.5',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};
const VARIANT_CLASSES: Record<SarakBadgeVariant, { soft: string; solid: string }> = {
    primary: {
        soft: 'bg-[var(--theme-primary)]/10 text-[color-mix(in_srgb,var(--theme-primary)_40%,var(--sarak-on-surface,#ffffff))] border border-[var(--theme-primary)]/20',
        solid: 'bg-[var(--theme-primary)] text-[var(--theme-on-primary,#020617)] border border-transparent',
    },
    secondary: {
        soft: 'bg-[var(--theme-secondary)]/10 text-[color-mix(in_srgb,var(--theme-secondary)_40%,var(--sarak-on-surface,#ffffff))] border border-[var(--theme-secondary)]/20',
        solid: 'bg-[var(--theme-secondary)] text-[var(--sarak-on-secondary,#ffffff)] border border-transparent',
    },
    success: { soft: 'border', solid: 'border border-transparent' },
    danger: { soft: 'border', solid: 'border border-transparent' },
    warning: { soft: 'border', solid: 'border border-transparent' },
    info: { soft: 'border', solid: 'border border-transparent' },
    muted: {
        soft: 'bg-[var(--theme-surface)] text-[var(--theme-muted)] border border-transparent',
        solid: 'bg-[var(--theme-muted)] text-[var(--sarak-on-muted,#ffffff)] border border-transparent',
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
        // Suave: a cor do status misturada ao texto de maior contraste sobre o corpo (40/60) — o contraste do par é medido por
        // `verify_contrast.ts` (`mix:`). Sólido: o texto escolhido pelo motor sobre a cor do status.
        color: soft ? `color-mix(in srgb, ${statusColor} 40%, var(--sarak-on-surface, #ffffff))` : `var(${STATUS_ON_COLOR_PROPERTIES[variant]}, var(--theme-on-primary, #020617))`,
        backgroundColor: soft ? `color-mix(in srgb, ${statusColor} 10%, transparent)` : statusColor,
        borderColor: soft ? `color-mix(in srgb, ${statusColor} 20%, transparent)` : 'transparent',
        // Brilho do status (`statusGlowBlur`): com 0 o raio some e a sombra não aparece.
        boxShadow: `0 0 var(--sarak-status-glow-blur, 0px) ${statusColor}`,
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
                // `pill` é a forma pílula pedida pela chamada; sem ela o raio é o do tema (`badgeRadius`).
                pill ? 'rounded-full' : 'rounded-[var(--sarak-badge-radius,99px)]',
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
