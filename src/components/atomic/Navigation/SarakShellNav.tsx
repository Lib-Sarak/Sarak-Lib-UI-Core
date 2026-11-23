import React, { useRef } from 'react';
import { SarakTooltip } from '../UX/SarakTooltip';
import { ShellNavEntry } from './internal/ShellNavEntry';
import { ShellNavGroup } from './internal/ShellNavGroup';
import { groupByCategory, isNavGroup } from './internal/shellNavTree';
import { useShellNavExpansion } from './internal/useShellNavExpansion';
import { NAV_CELL_ATTRIBUTE, useHorizontalOverflow } from './internal/useHorizontalOverflow';
import { ShellNavMore } from './internal/ShellNavMore';
import { ShellNavBrand } from './internal/ShellNavBrand';
import { useNavigationStyle } from '../../../core/Provider/useNavigationStyle';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { VERTICAL_NAV_GAP, VERTICAL_NAV_PADDING } from './menuItemMetrics';

/**
 * SarakShellNav — Navegação de shell 100% orientada a dados (Spec 33 + Spec 14)
 *
 * Menu guiado por DADOS: recebe os módulos como `items`, agrupa por categoria, destaca
 * o item ativo e **delega a navegação ao host** — nunca manipula a URL. O consumidor
 * passa `activeRoute` (a rota atual, do roteador dele) e reage em `onNavigate`.
 */

/** Item de navegação declarativo usado pelo cromo do aplicativo. */
export interface SarakShellNavItem {
    /** Rótulo exibido no menu. */
    label: string;
    /** Rota destino (comparada com `activeRoute` para o destaque). */
    route: string;
    /** Nome registrado ou elemento do ícone fornecido pelo consumidor. */
    icon?: string | React.ReactNode;
    /** Impede navegação e foco sem remover o item do menu. */
    disabled?: boolean;
    /** Informação visual que também integra o nome acessível. */
    badge?: string | number;
    /** Contexto nativo da âncora. */
    target?: string;
    /** Agrupamento visual (itens sem categoria ficam no grupo raiz). */
    category?: string;
    /**
     * Filhos do item: o pai vira um grupo recolhível (botão com seta, `aria-expanded` e `aria-controls`) e a rota
     * dele deixa de navegar. Um nível só de aninhamento — filhos de filhos são ignorados.
     */
    children?: SarakShellNavItem[];
    /** Grupo aberto de saída; o grupo do item ativo abre sozinho, com ou sem isto. */
    defaultExpanded?: boolean;
}

export interface SarakShellNavProps {
    /** Módulos/rotas do sistema, na ordem de exibição. */
    items: SarakShellNavItem[];
    /** Rota ativa (a do roteador do consumidor) — comparada com `items[].route`. */
    activeRoute?: string;
    /** Identidade exibida no topo do menu. */
    brand?: { name?: string; logoUrl?: string };
    /** Callback de navegação — o host decide como navegar (router, pushState, assign). */
    onNavigate?: (route: string) => void;
    /** Alias de `onNavigate`; ambos são chamados, na ordem. Mantido por compatibilidade. */
    onChange?: (route: string) => void;
    /**
     * Orientação do menu (Spec 18). `'auto'` (default) segue o Design Engine:
     * `design.navigationStyle === 'topbar'` → horizontal; qualquer outro → vertical.
     * Qualquer valor desconhecido é tratado como vertical.
     */
    orientation?: 'vertical' | 'horizontal' | 'auto';
    /** Colapsado (`isNavHidden`): só ícone, rótulo e categoria somem. */
    collapsed?: boolean;
    className?: string;
}

// sarak-allow-hardcode: espaçamento entre letras é proporção da própria fonte (em), não medida de layout; nenhum token o declara.
const CATEGORY_TRACKING = '0.2em';

/**
 * Menu vertical de shell guiado por dados, com grupos e estado ativo (Spec 33).
 *
 * @iconNameProp navItems[].icon
 */
export const SarakShellNav: React.FC<SarakShellNavProps> = ({
    items,
    activeRoute,
    brand,
    onNavigate,
    onChange,
    orientation = 'auto',
    collapsed = false,
    className = '',
}) => {
    const navigationStyle = useNavigationStyle();
    const t = useLibraryText();
    // `auto` segue o Design Engine: só `topbar` vira horizontal.
    const resolved = orientation === 'auto'
        ? (navigationStyle === 'topbar' ? 'horizontal' : 'vertical')
        : orientation;
    const horizontal = resolved === 'horizontal';

    const select = onNavigate || onChange
        ? (route: string): void => {
            onNavigate?.(route);
            onChange?.(route);
        }
        : undefined;

    const safeItems = items ?? [];
    const groups = groupByCategory(safeItems);
    const expansion = useShellNavExpansion(safeItems, activeRoute);
    const navRef = useRef<HTMLElement | null>(null);
    // Na topbar o que não cabe vai para o "Mais", no fim da lista: nenhum item fica inalcançável sem sinal (Spec 05 §2.1).
    const flatItems = Array.from(groups.values()).flat();
    const overflow = useHorizontalOverflow(navRef, horizontal, `${flatItems.map((item) => item.route).join('|')}|${collapsed}`);
    const firstHidden = overflow.start ?? flatItems.length;
    const hiddenItems = flatItems.slice(firstHidden);
    const hasMore = horizontal && hiddenItems.length > 0;
    const indexOf = (item: SarakShellNavItem): number => flatItems.indexOf(item);

    const renderLeaf = (item: SarakShellNavItem): React.ReactNode => {
        if (isNavGroup(item)) {
            return (
                <ShellNavGroup
                    key={item.route}
                    item={item}
                    activeRoute={activeRoute}
                    horizontal={horizontal}
                    collapsed={collapsed}
                    expanded={expansion.isExpanded(item)}
                    onToggle={expansion.toggle}
                    onSelect={select}
                />
            );
        }
        // O item ancora o marcador do ativo (`navActiveMarkerColor`/`navActiveMarkerGlow`, Spec 05 §2.4) pelo `SarakMenuItem`.
        const entry = (
            <ShellNavEntry key={item.route} item={item} isActive={item.route === activeRoute} horizontal={horizontal} collapsed={collapsed} onSelect={select} />
        );
        // Recolhida só mostra o ícone: o nome aparece em dica ao passar o mouse e ao focar.
        return collapsed && !horizontal
            ? <SarakTooltip key={item.route} content={item.label} position="right" disabled={item.disabled}>{entry}</SarakTooltip>
            : entry;
    };

    // Na horizontal cada item mora numa célula medida; a que não coube perde a visibilidade (some do foco e do leitor de tela)
    // mas continua no fluxo, para a largura natural da lista não depender de quem coube.
    const renderItem = (item: SarakShellNavItem): React.ReactNode => {
        if (!horizontal) return renderLeaf(item);
        return (
            <div
                key={item.route}
                {...{ [NAV_CELL_ATTRIBUTE]: 'true' }}
                className="inline-flex shrink-0"
                style={indexOf(item) >= firstHidden ? { visibility: 'hidden' } : undefined}
            >
                {renderLeaf(item)}
            </div>
        );
    };

    return (
        <nav
            ref={navRef}
            aria-label={t('shellNavAriaLabel')}
            className={`relative z-10 flex ${horizontal ? 'items-center overflow-x-hidden shrink-0' : 'h-full min-h-0 overflow-y-auto overflow-x-hidden'} ${className}`}
            style={{
                flexDirection: horizontal ? 'row' : 'column',
                gap: horizontal ? 'var(--sarak-layout-gap-sm, 8px)' : VERTICAL_NAV_GAP,
                padding: horizontal ? 'var(--sarak-layout-gap-md, 16px)' : VERTICAL_NAV_PADDING,
            }}
        >
            {brand && (brand.name || brand.logoUrl) ? <ShellNavBrand brand={brand} horizontal={horizontal} /> : null}

            {Array.from(groups.entries()).map(([category, groupItems], index) => (
                <React.Fragment key={category || 'raiz'}>
                    {horizontal && index > 0 ? (
                        // Grupos viram separadores na horizontal (o rótulo de categoria some).
                        <span
                            aria-hidden="true"
                            className="self-stretch shrink-0"
                            style={{ visibility: indexOf(groupItems[0]) >= firstHidden ? 'hidden' : undefined, width: 'var(--sarak-border-width, 1px)', background: 'var(--sarak-topbar-group-separator-color, var(--sarak-card-border-color, rgba(255,255,255,0.09)))' }}
                        />
                    ) : null}
                    <div
                        className="flex"
                        style={{
                            flexDirection: horizontal ? 'row' : 'column',
                            alignItems: horizontal ? 'center' : undefined,
                            // Espaço ENTRE itens do grupo é o "gap de aba" do cromo —
                            // antes lia `--sarak-layout-gap-sm`, que o painel não alcançava
                            // (`tabGap` do schema ficava sem consumidor aqui). Fallback igual
                            // ao valor anterior: zero mudança sem o token.
                            gap: horizontal
                                ? 'var(--sarak-tab-gap, 8px)'
                                : 'calc(var(--sarak-tab-gap, 8px) * 0.5)',
                        }}
                    >
                        {category && !horizontal && !collapsed ? (
                            // Título de seção da anatomia antiga: caixa alta, negrito e espaçamento largo, na cor do texto da barra.
                            <div
                                className="truncate text-sm font-bold uppercase select-none"
                                style={{
                                    color: 'var(--sarak-sidebar-category-color, var(--sarak-on-sidebar, rgba(242,246,251,0.72)))',
                                    letterSpacing: CATEGORY_TRACKING,
                                    paddingInline: `calc(${VERTICAL_NAV_GAP} * 1.5)`,
                                    marginTop: VERTICAL_NAV_GAP,
                                }}
                            >
                                {category}
                            </div>
                        ) : null}
                        {groupItems.map(renderItem)}
                    </div>
                </React.Fragment>
            ))}

            {horizontal ? (
                <ShellNavMore
                    hiddenItems={hiddenItems}
                    activeRoute={activeRoute}
                    visible={hasMore}
                    start={overflow.moreStart}
                    collapsed={collapsed}
                    onToggle={expansion.toggle}
                    onSelect={select}
                />
            ) : null}
        </nav>
    );
};

export default SarakShellNav;
