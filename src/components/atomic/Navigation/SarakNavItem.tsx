import React, { ButtonHTMLAttributes } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export type SarakNavItemOrientation = 'vertical' | 'horizontal';

export interface SarakNavItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
    /** Ícone à esquerda do rótulo — resolvido pelo chamador (`SarakIcon`/`IconRenderer`). */
    icon?: React.ReactNode;
    /** Rótulo do item; trunca em vez de transbordar (orientação vertical). */
    label: React.ReactNode;
    /** Item corresponde à rota/seção corrente. */
    active?: boolean;
    /** Colapsado — mostra só o ícone, sem o rótulo (sidebar recolhida/topbar estreita). */
    collapsed?: boolean;
    /** `vertical` = linha de lista (sidebar/drawer); `horizontal` = aba (topbar). */
    orientation?: SarakNavItemOrientation;
    /** Tooltip nativo; cai para o texto do rótulo quando `label` é string. */
    title?: string;
    className?: string;
}

/**
 * Componente Atômico: SarakNavItem
 *
 * Item de navegação do cromo (sidebar/topbar/drawer) com métrica própria de LISTA —
 * recuo, peso, caixa e truncamento — em vez da métrica de botão de ação que
 * `SarakButton` carrega por padrão. `orientation="vertical"` resolve a
 * largura cheia NA ORIGEM (nunca emite `min-w-fit`), então o rótulo trunca em vez de
 * transbordar; `className` do chamador vence os defaults por `mergeSarakClasses` (R35).
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo, para teclado e leitor de tela funcionarem por construção.
 */
export const SarakNavItem: React.FC<SarakNavItemProps> = ({
    icon,
    label,
    active = false,
    collapsed = false,
    orientation = 'vertical',
    className = '',
    disabled,
    title,
    children,
    ...props
}) => {
    const isVertical = orientation === 'vertical';

    const base = isVertical
        ? 'flex items-center gap-3 w-full min-w-0 px-3 py-2.5 rounded-xl text-sm font-normal normal-case tracking-normal transition-colors'
        : 'inline-flex items-center justify-center gap-2 shrink-0 min-w-0 px-4 py-1.5 rounded-full text-2xs font-bold uppercase tracking-widest transition-colors';

    const collapsedClass = collapsed ? (isVertical ? 'justify-center' : 'w-8 h-8 p-0 rounded-lg') : '';

    const tone = active
        ? 'font-bold bg-[var(--sarak-primary-color,#3b82f6)]/15 text-[var(--sarak-primary-color,#3b82f6)]'
        : 'text-[var(--text-muted,#94a3b8)] hover:text-[var(--sarak-text-main,#ffffff)] hover:bg-[var(--sarak-card-bg,rgba(255,255,255,0.04))]';

    const disabledClass = disabled ? 'opacity-30 grayscale cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    return (
        <button
            type="button"
            disabled={disabled}
            title={title ?? (typeof label === 'string' ? label : undefined)}
            aria-current={active ? 'page' : undefined}
            className={mergeSarakClasses(base, collapsedClass, tone, disabledClass, className)}
            {...props}
        >
            {icon ? <span className="shrink-0 inline-flex items-center justify-center">{icon}</span> : null}
            {!collapsed && <span className={isVertical ? 'flex-1 min-w-0 truncate text-left' : 'truncate'}>{label}</span>}
            {children}
        </button>
    );
};

export default SarakNavItem;
