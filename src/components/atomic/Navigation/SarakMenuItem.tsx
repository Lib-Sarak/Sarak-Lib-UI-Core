import React, { ButtonHTMLAttributes } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export type SarakMenuItemOrientation = 'vertical' | 'horizontal';

export interface SarakMenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
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
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo, para teclado e leitor de tela funcionarem por construção.
 */
export const SarakMenuItem: React.FC<SarakMenuItemProps> = ({
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

export default SarakMenuItem;
