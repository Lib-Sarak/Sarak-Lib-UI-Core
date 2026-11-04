import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import type { SarakTabsOverflow } from './useTabsOverflow';

export type SarakTabsVariant = 'pills' | 'underlined' | 'enclosed';

/** `border-radius` por variante (equivalente ao `rounded-*` que cada uma usava). Zero
 *  hardcode (R2): `--sarak-btn-border-radius` é token real, mesmo default (8px = 0.5rem). */
const TAB_RADIUS: Record<SarakTabsVariant, string> = {
    underlined: '0px',
    pills: 'var(--sarak-btn-border-radius, 8px)',
    enclosed: 'var(--sarak-btn-border-radius, 8px) var(--sarak-btn-border-radius, 8px) 0 0',
};

const OVERFLOW_LIST_CLASS: Record<SarakTabsOverflow, string> = {
    scroll: 'min-w-0 max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:thin]',
    wrap: 'flex-wrap max-w-full',
    menu: 'min-w-0 flex-1 overflow-hidden',
};

export const tabsListClassName = (variant: SarakTabsVariant, listClassName?: string, overflow: SarakTabsOverflow = 'scroll'): string =>
    mergeSarakClasses(
        'flex items-center',
        OVERFLOW_LIST_CLASS[overflow],
        variant === 'underlined' && 'border-b border-[var(--theme-border)]',
        variant === 'pills' && 'bg-theme-tint rounded-xl',
        listClassName,
    );

const baseTabsListStyle = (variant: SarakTabsVariant): React.CSSProperties =>
    variant === 'underlined' ? { gap: 'calc(var(--sarak-layout-gap-md, 16px) * 1.5)' }
    : variant === 'pills' ? { gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }
    : { gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' };

const EDGE_FADE = 'calc(var(--sarak-layout-gap-md, 16px) * 2)';

/** Esmaece a borda onde ainda há abas fora da vista (`scroll`). */
const edgeFadeMask = (atStart: boolean, atEnd: boolean): string =>
    `linear-gradient(to right, ${atStart ? 'transparent' : 'black'}, black ${atStart ? EDGE_FADE : '0'}, black calc(100% - ${atEnd ? EDGE_FADE : '0px'}), ${atEnd ? 'transparent' : 'black'})`;

export interface TabsListEdges { atStart: boolean; atEnd: boolean }

export const tabsListStyle = (variant: SarakTabsVariant, overflow: SarakTabsOverflow = 'scroll', edges?: TabsListEdges): React.CSSProperties | undefined => {
    const style: React.CSSProperties = { ...baseTabsListStyle(variant) };
    // O indicador do `underlined` desce uma borda; sem esta reserva o `overflow` o cortaria.
    if (variant === 'underlined' && overflow !== 'wrap') style.paddingBottom = 'var(--sarak-border-width, 1px)';
    if (overflow === 'scroll' && edges && (edges.atStart || edges.atEnd)) {
        style.maskImage = edgeFadeMask(edges.atStart, edges.atEnd);
        style.WebkitMaskImage = style.maskImage;
    }
    return style;
};

/** `textTransform`/`fontWeight`/`letterSpacing`/`borderRadius` vão por `style` (vence a classe do
 *  átomo) para neutralizar o `font-black uppercase tracking-widest` e o `rounded-btn` do botão. */
export const tabItemStyle = (variant: SarakTabsVariant): React.CSSProperties => ({
    minHeight: 'var(--sarak-touch-target-min, 44px)',
    gap: 'var(--sarak-layout-gap-sm, 8px)',
    paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.625)',
    paddingInline: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
    borderRadius: TAB_RADIUS[variant],
    textTransform: 'none',
    fontWeight: 700,
    letterSpacing: 'normal',
});

export const tabItemClassName = (variant: SarakTabsVariant, isActive: boolean, isDisabled: boolean, fullWidth: boolean, overflow: SarakTabsOverflow = 'scroll'): string =>
    clsx(
        'relative text-sm transition-colors',
        overflow !== 'wrap' && 'shrink-0 whitespace-nowrap',
        fullWidth ? 'flex-1' : '',
        isDisabled && 'opacity-50 cursor-not-allowed',
        variant === 'underlined' && [
            'hover:text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]',
            isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]',
        ],
        variant === 'pills' && [
            'z-10',
            isActive ? 'text-[var(--theme-on-primary,#020617)]' : 'text-[var(--theme-muted)] hover:text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]',
        ],
        variant === 'enclosed' && [
            'border-t border-x border-transparent',
            isActive
                ? 'bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))] z-10'
                : 'bg-theme-tint text-[var(--theme-muted)] hover:text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))] hover:bg-theme-tint-hover',
        ],
    );

/** Indicador da aba ativa de `pills` (atrás do texto) e ícone da aba. */
export const TabLeading: React.FC<{ variant: SarakTabsVariant; isActive: boolean; icon?: React.ReactNode }> = ({ variant, isActive, icon }) => (
    <>
        {variant === 'pills' && isActive && (
            <motion.div
                layoutId="sarak-tabs-pill"
                className="absolute inset-0 bg-[var(--theme-primary)] rounded-lg -z-10 shadow-md"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
        )}
        {icon && (
            <span className={clsx('transition-colors', isActive && variant === 'underlined' && 'text-[var(--theme-primary)]')}>
                {icon}
            </span>
        )}
    </>
);

/** Sublinhado da aba ativa de `underlined`. */
export const TabTrailing: React.FC<{ variant: SarakTabsVariant; isActive: boolean }> = ({ variant, isActive }) =>
    variant === 'underlined' && isActive ? (
        <motion.div
            layoutId="sarak-tabs-underline"
            className="absolute bottom-[length:calc(var(--sarak-border-width,1px)*-1)] left-0 right-0 h-[length:var(--sarak-border-width,1px)] bg-[var(--theme-primary)]"
            initial={false}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
    ) : null;
