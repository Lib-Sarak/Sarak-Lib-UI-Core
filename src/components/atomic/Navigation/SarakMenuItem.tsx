import React from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { sarakIsSafeLinkHref, shouldHandleSameTabNavigation } from './linkNavigation';
import { SarakIcon } from '../Icon/SarakIcon';
import { useNavigationAppearance } from '../../../core/Provider/useNavigationAppearance';

export type SarakMenuItemOrientation = 'vertical' | 'horizontal';

export interface SarakMenuItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onClick' | 'type'> {
    /** Nome registrado ou elemento renderizado à esquerda do rótulo. */
    icon?: string | React.ReactNode;
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
    /** A barra inferior do celular ancora o indicador no topo do item. */
    markerPosition?: 'edge' | 'top';
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
    markerPosition = 'edge',
    disabled,
    title,
    type = 'button',
    tabIndex,
    onClick,
    children,
    ...props
}) => {
    const isVertical = orientation === 'vertical';
    const appearance = useNavigationAppearance();
    const activeItemStyle = isVertical ? appearance.sidebarActiveItemStyle : appearance.topbarActiveItemStyle;
    const itemDensity = isVertical ? appearance.sidebarItemDensity : appearance.topbarItemDensity;
    const iconSize = isVertical
        ? 'var(--sarak-sidebar-icon-size, 18px)'
        : 'var(--sarak-topbar-icon-size, 18px)';
    const iconColorVariable = isVertical ? '--sarak-sidebar-icon-color' : '--sarak-topbar-icon-color';
    const iconColor = active ? 'currentColor' : `var(${iconColorVariable}, currentColor)`;

    // Raio do item (fundo do ativo e do hover): UM token para as três formas — lateral, topo e
    // recolhido —, `navItemRadius` (`--sarak-nav-item-radius`). O literal depois da vírgula é o
    // padrão do token, para fora do Provider.
    const densityClasses = isVertical
        ? {
            compact: 'gap-2 px-2 py-1.5',
            comfortable: 'gap-3 px-3 py-2.5',
            spacious: 'gap-4 px-4 py-3',
        }[itemDensity]
        : {
            compact: 'gap-1 px-3 py-1',
            comfortable: 'gap-2 px-4 py-1.5',
            spacious: 'gap-3 px-5 py-2',
        }[itemDensity];
    const base = isVertical
        ? `relative flex items-center w-full min-w-0 rounded-[var(--sarak-nav-item-radius,12px)] text-sm font-normal normal-case tracking-normal transition-colors ${densityClasses}`
        : `relative inline-flex items-center justify-center shrink-0 min-w-0 rounded-[var(--sarak-nav-item-radius,12px)] text-sm font-light normal-case tracking-normal transition-colors ${densityClasses}`;

    const collapsedClass = collapsed ? (isVertical ? 'justify-center' : 'w-8 h-8 p-0') : '';

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
    // (`#19e3f0`, sempre emitido), não o literal do JSX.
    const activeBackgroundVariable = isVertical ? '--sarak-sidebar-active-color' : '--sarak-topbar-active-color';
    const activeBackground = activeItemStyle === 'filled'
        ? 'var(--sarak-nav-active-color, #19e3f0)'
        : activeItemStyle === 'underline' || activeItemStyle === 'outline'
            ? 'transparent'
            : `var(${activeBackgroundVariable}, transparent)`;
    const itemStyle: React.CSSProperties = {
        minHeight: 'var(--sarak-touch-target-active, 0px)',
        minWidth: 'var(--sarak-touch-target-active, 0px)',
        color: active
            ? activeItemStyle === 'filled'
                ? 'var(--sarak-on-nav-active, #020617)'
                : 'var(--sarak-nav-active-color, #19e3f0)'
            : undefined,
        backgroundColor: active ? activeBackground : undefined,
        border: active && activeItemStyle === 'outline'
            ? 'var(--sarak-border-width, 1px) solid var(--sarak-nav-active-color, #19e3f0)'
            : undefined,
        ...props.style,
    };
    const tone = active
        ? (isVertical ? 'font-bold' : 'font-light')
        : isVertical
            ? 'text-[var(--sarak-sidebar-item-text-color,var(--text-muted,rgba(242,246,251,0.55)))] hover:text-[var(--sarak-sidebar-item-hover-text-color,var(--sarak-text-main,#f2f6fb))] hover:bg-[var(--sarak-sidebar-hover-color,transparent)]'
            : 'text-[var(--sarak-topbar-item-text-color,var(--text-muted,rgba(242,246,251,0.55)))] hover:text-[var(--sarak-topbar-item-hover-text-color,var(--sarak-text-main,#f2f6fb))] hover:bg-[var(--sarak-topbar-hover-color,transparent)]';

    const disabledClass = disabled
        ? 'text-[var(--text-muted,rgba(242,246,251,0.55))] cursor-not-allowed pointer-events-none'
        : 'cursor-pointer';
    const hasHref = href !== undefined;
    const isSafeHref = typeof href === 'string' && sarakIsSafeLinkHref(href);
    const isNavigable = isSafeHref && !disabled;
    const accessibleTitle = title ?? (typeof label === 'string' ? label : undefined);
    const renderedIcon = typeof icon === 'string'
        ? <SarakIcon name={icon} size={iconSize} color={iconColor} />
        : icon;
    const accessibleLabel = typeof label === 'string' || typeof label === 'number'
        ? `${label}${badge !== undefined ? ` ${badge}` : ''}`
        : props['aria-label'];
    const content = (
        <>
            {renderedIcon ? (
                <span
                    aria-hidden="true"
                    className="shrink-0 inline-flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                    style={{ width: iconSize, height: iconSize, color: iconColor }}
                >
                    {renderedIcon}
                </span>
            ) : null}
            {collapsed ? null : <span className={isVertical ? 'flex-1 min-w-0 truncate text-left' : 'truncate'}>{label}</span>}
            {badge !== undefined && (
                <span
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-color,rgba(255,255,255,0.09))] bg-[var(--theme-card,transparent)] text-[var(--text-muted,rgba(242,246,251,0.55))]"
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
    const marker = active && (activeItemStyle === 'bar' || activeItemStyle === 'underline') ? (
        <span
            aria-hidden="true"
            className={activeItemStyle === 'underline'
                ? mergeSarakClasses(`absolute ${markerPosition === 'top' ? 'top-0' : 'bottom-0'} left-2 right-2 h-0.5`, 'sarak-nav-marker-glow')
                : isVertical
                    ? mergeSarakClasses('absolute left-0 w-1 h-4 rounded-full', 'sarak-nav-marker-glow')
                    : mergeSarakClasses(`absolute left-1/2 -translate-x-1/2 ${markerPosition === 'top' ? 'top-0' : 'bottom-0'} h-0.5 w-4 rounded-full`, 'sarak-nav-marker-glow')}
            style={{ background: 'var(--sarak-nav-marker-color, #19e3f0)' }}
        />
    ) : null;
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
                style={itemStyle}
                onClick={handleAnchorClick}
            >
                {marker}
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
            style={itemStyle}
            onClick={onClick}
        >
            {marker}
            {content}
        </button>
    );
};

export default SarakMenuItem;
