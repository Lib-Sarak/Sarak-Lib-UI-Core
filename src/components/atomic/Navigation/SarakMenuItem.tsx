import React from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { sarakIsSafeLinkHref, shouldHandleSameTabNavigation } from './linkNavigation';

export type SarakMenuItemOrientation = 'vertical' | 'horizontal';

export interface SarakMenuItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onClick' | 'type'> {
    /** Ícone à esquerda do rótulo — resolvido pelo chamador (`SarakIcon`/`IconRenderer`). */
    icon?: React.ReactNode;
    /** Rótulo do item; trunca em vez de transbordar (orientação vertical). */
    label: React.ReactNode;
    /** Item corresponde à rota/seção corrente. */
    active?: boolean;
    /** Colapsado — mostra só o ícone, sem o rótulo (sidebar recolhida/topbar estreita). */
    collapsed?: boolean;
    /** `vertical` = linha de lista (sidebar/drawer); `horizontal` = aba (topbar). */
    orientation?: SarakMenuItemOrientation;
    /** Tooltip nativo; cai para o texto do rótulo quando `label` é string. */
    title?: string;
    /** Destino opcional; quando informado, o item é renderizado como link. */
    href?: string;
    /** Chamado apenas para clique primário simples em link destinado à aba atual. */
    onNavigate?: (href: string) => void;
    /** Indica uma quantidade ou estado adicional; também integra o nome acessível. */
    badge?: string | number;
    /** Contexto de navegação nativo do link. */
    target?: string;
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
    className?: string;
}

/**
 * Componente Atômico: SarakMenuItem
 *
 * Item de navegação do cromo (sidebar/topbar/drawer) com métrica própria de LISTA —
 * recuo, peso, caixa e truncamento — em vez da métrica de botão de ação que
 * `SarakButton` carrega por padrão. `orientation="vertical"` resolve a
 * largura cheia NA ORIGEM (nunca emite `min-w-fit`), então o rótulo trunca em vez de
 * transbordar; `className` do chamador vence os defaults por `mergeSarakClasses` (R35).
 *
 * @sarak-encapsula button — encapsula a ação sem destino com o elemento nativo;
 *   links usam âncoras para preservar a navegação do navegador.
 */
export const SarakMenuItem: React.FC<SarakMenuItemProps> = ({
    icon,
    label,
    href,
    onNavigate,
    badge,
    target,
    active = false,
    collapsed = false,
    orientation = 'vertical',
    className = '',
    disabled,
    title,
    type = 'button',
    tabIndex,
    onClick,
    children,
    ...props
}) => {
    const isVertical = orientation === 'vertical';

    const base = isVertical
        ? 'flex items-center gap-3 w-full min-w-0 px-3 py-2.5 rounded-xl text-sm font-normal normal-case tracking-normal transition-colors'
        : 'inline-flex items-center justify-center gap-2 shrink-0 min-w-0 px-4 py-1.5 rounded-full text-sm font-bold normal-case tracking-normal transition-colors';

    const collapsedClass = collapsed ? (isVertical ? 'justify-center' : 'w-8 h-8 p-0 rounded-lg') : '';

    // Cor de ativo/hover do CROMO — cada ramo lê o token do seu PRÓPRIO papel: o fundo
    // do ativo vem de `sidebarActiveColor`/`topbarActiveColor` (fundo, cada orientação
    // o seu — default `transparent`, deliberado), o texto/ícone do ativo vem de
    // `navItemActiveColor` (`--sarak-nav-active-color`) nas DUAS orientações — é o
    // token que carrega o sinal visível, por ter default de cor real — e o hover vem
    // de `sidebarHoverColor`/`topbarHoverColor`, cada orientação o seu. O mesmo item
    // atômico desenha os dois cromos (Shell e SarakAppChrome), então a cor chega aos
    // DOIS por aqui.
    //
    // O literal depois da vírgula em `var(--x, literal)` só vale ANTES de o Design
    // Engine hidratar ou fora de um `SarakUIProvider` (SSR, Storybook, teste isolado):
    // com o Provider montado, o Design Engine sempre declara cada token — quem garante
    // o sinal visível na tela real é o DEFAULT DO SCHEMA de `navItemActiveColor`
    // (`#00f2ff`, sempre emitido), não o literal do JSX.
    const tone = active
        ? isVertical
            ? 'font-bold bg-[var(--sarak-sidebar-active-color,rgba(59,130,246,0.15))] text-[var(--sarak-nav-active-color,#3b82f6)]'
            : 'font-bold bg-[var(--sarak-topbar-active-color,rgba(59,130,246,0.15))] text-[var(--sarak-nav-active-color,#3b82f6)]'
        : isVertical
            ? 'text-[var(--text-muted,#94a3b8)] hover:text-[var(--sarak-text-main,#ffffff)] hover:bg-[var(--sarak-sidebar-hover-color,rgba(255,255,255,0.04))]'
            : 'text-[var(--text-muted,#94a3b8)] hover:text-[var(--sarak-text-main,#ffffff)] hover:bg-[var(--sarak-topbar-hover-color,rgba(255,255,255,0.04))]';

    const disabledClass = disabled
        ? 'text-[var(--text-muted,#94a3b8)] cursor-not-allowed pointer-events-none'
        : 'cursor-pointer';
    const hasHref = href !== undefined;
    const isSafeHref = typeof href === 'string' && sarakIsSafeLinkHref(href);
    const isNavigable = isSafeHref && !disabled;
    const accessibleTitle = title ?? (typeof label === 'string' ? label : undefined);
    const accessibleLabel = typeof label === 'string' || typeof label === 'number'
        ? `${label}${badge !== undefined ? ` ${badge}` : ''}`
        : props['aria-label'];
    const content = (
        <>
            {icon ? <span aria-hidden="true" className="shrink-0 inline-flex items-center justify-center">{icon}</span> : null}
            {collapsed ? null : <span className={isVertical ? 'flex-1 min-w-0 truncate text-left' : 'truncate'}>{label}</span>}
            {badge !== undefined && (
                <span
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-color,rgba(255,255,255,0.1))] bg-[var(--theme-card,transparent)] text-[var(--text-muted,#94a3b8)]"
                    style={{ paddingInline: 'var(--sarak-layout-gap-sm, 8px)' }}
                >
                    {badge}
                </span>
            )}
            {children}
        </>
    );

    const handleAnchorClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (disabled || !isSafeHref) return;
        onClick?.(event);
        if (!onNavigate || !href || !shouldHandleSameTabNavigation(event, target)) return;
        event.preventDefault();
        onNavigate(href);
    };

    const itemClassName = mergeSarakClasses(base, collapsedClass, tone, disabledClass, className);
    if (hasHref) {
        return (
            <a
                {...props}
                href={isNavigable ? href : undefined}
                target={target}
                rel={target !== undefined && target !== '_self' && isNavigable ? 'noopener noreferrer' : undefined}
                role={isNavigable ? undefined : 'link'}
                aria-disabled={isNavigable ? undefined : true}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed || badge !== undefined ? accessibleLabel : undefined}
                tabIndex={isNavigable ? tabIndex : -1}
                title={accessibleTitle}
                className={itemClassName}
                onClick={handleAnchorClick}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            aria-disabled={disabled ? true : undefined}
            aria-current={active ? 'page' : undefined}
            aria-label={collapsed || badge !== undefined ? accessibleLabel : undefined}
            tabIndex={disabled ? -1 : tabIndex}
            title={accessibleTitle}
            className={itemClassName}
            onClick={onClick}
        >
            {content}
        </button>
    );
};

export default SarakMenuItem;
