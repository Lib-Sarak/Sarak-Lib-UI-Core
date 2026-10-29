import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export type SarakTabsVariant = 'pills' | 'underlined' | 'enclosed';

/** `border-radius` por variante (equivalente ao `rounded-*` que cada uma usava). Zero
 *  hardcode (R2): `--sarak-btn-border-radius` é token real, mesmo default (8px = 0.5rem). */
const TAB_RADIUS: Record<SarakTabsVariant, string> = {
    underlined: '0px',
    pills: 'var(--sarak-btn-border-radius, 8px)',
    enclosed: 'var(--sarak-btn-border-radius, 8px) var(--sarak-btn-border-radius, 8px) 0 0',
};

export const tabsListClassName = (variant: SarakTabsVariant, listClassName?: string): string =>
    mergeSarakClasses(
        'flex items-center',
        variant === 'underlined' && 'border-b border-[var(--theme-border)]',
        variant === 'pills' && 'bg-theme-tint rounded-xl',
        listClassName,
    );

export const tabsListStyle = (variant: SarakTabsVariant): React.CSSProperties | undefined =>
    variant === 'underlined' ? { gap: 'calc(var(--sarak-layout-gap-md, 16px) * 1.5)' }
    : variant === 'pills' ? { gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }
    : { gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' };

/** `textTransform`/`fontWeight`/`letterSpacing`/`borderRadius` vão por `style` (vence a classe do
 *  átomo) para neutralizar o `font-black uppercase tracking-widest` e o `rounded-btn` do botão. */
export const tabItemStyle = (variant: SarakTabsVariant): React.CSSProperties => ({
    gap: 'var(--sarak-layout-gap-sm, 8px)',
    paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.625)',
    paddingInline: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
    borderRadius: TAB_RADIUS[variant],
    textTransform: 'none',
    fontWeight: 700,
    letterSpacing: 'normal',
});

export const tabItemClassName = (variant: SarakTabsVariant, isActive: boolean, isDisabled: boolean, fullWidth: boolean): string =>
    clsx(
        'relative text-sm transition-colors',
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
