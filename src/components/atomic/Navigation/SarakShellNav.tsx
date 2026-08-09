import React from 'react';
import { SarakIcon } from '../Icon/SarakIcon';
import { useNavigationStyle } from '../../../core/Provider/useNavigationStyle';

/**
 * SarakShellNav — Navegação de shell 100% orientada a dados (Spec 33 + Spec 14)
 *
 * Menu guiado por DADOS: recebe os módulos como `items`, agrupa por categoria, destaca
 * o item ativo e **delega a navegação ao host** — nunca manipula a URL. O consumidor
 * passa `activeRoute` (a rota atual, do roteador dele) e reage em `onNavigate`.
 */

/** Item de navegação do shell — espelho declarativo do `SarakModule` do Discovery. */
export interface ShellNavItem {
    /** Rótulo exibido no menu. */
    label: string;
    /** Rota destino (comparada com `activeRoute` para o destaque). */
    route: string;
    /** Nome do ícone (resolvido pelo `SarakIcon`/IconMap). */
    icon?: string;
    /** Agrupamento visual (itens sem categoria ficam no grupo raiz). */
    category?: string;
}

export interface SarakShellNavProps {
    /** Módulos/rotas do sistema, na ordem de exibição. */
    items: ShellNavItem[];
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
     * `'dock'`/`'glass'` do shell legado ficam fora desta spec (tratados como vertical).
     */
    orientation?: 'vertical' | 'horizontal' | 'auto';
    className?: string;
}

/** Agrupa preservando a ordem de aparição das categorias ('' = grupo raiz). */
const groupByCategory = (items: ShellNavItem[]): Map<string, ShellNavItem[]> => {
    const groups = new Map<string, ShellNavItem[]>();
    for (const item of items) {
        const key = item.category ?? '';
        const bucket = groups.get(key);
        if (bucket) {
            bucket.push(item);
        } else {
            groups.set(key, [item]);
        }
    }
    return groups;
};

const NavEntry: React.FC<{
    item: ShellNavItem;
    isActive: boolean;
    horizontal: boolean;
    onSelect: (route: string) => void;
}> = ({ item, isActive, horizontal, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(item.route)}
        aria-current={isActive ? 'page' : undefined}
        className={`${horizontal ? 'shrink-0' : 'w-full'} flex items-center text-left rounded-[var(--sarak-button-radius,8px)] transition-sarak cursor-pointer ${
            isActive
                ? 'bg-[var(--sarak-primary-color,#3b82f6)]/15 text-[var(--sarak-primary-color,#3b82f6)] font-medium'
                : 'text-[var(--text-muted,#94a3b8)] hover:text-[var(--sarak-text-main,#ffffff)] hover:bg-[var(--sarak-card-bg,rgba(255,255,255,0.04))]'
        }`}
        style={{
            gap: 'var(--sarak-layout-gap-sm, 8px)',
            paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
            paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.5)',
        }}
    >
        {item.icon ? <SarakIcon name={item.icon} size={18} /> : null}
        <span className="truncate text-sm">{item.label}</span>
    </button>
);

/** Menu vertical de shell guiado por dados, com grupos e estado ativo (Spec 33). */
export const SarakShellNav: React.FC<SarakShellNavProps> = ({
    items,
    activeRoute,
    brand,
    onNavigate,
    onChange,
    orientation = 'auto',
    className = '',
}) => {
    const navigationStyle = useNavigationStyle();
    // `auto` segue o Design Engine: só `topbar` vira horizontal (dock/glass = vertical).
    const resolved = orientation === 'auto'
        ? (navigationStyle === 'topbar' ? 'horizontal' : 'vertical')
        : orientation;
    const horizontal = resolved === 'horizontal';

    const select = (route: string): void => {
        onNavigate?.(route);
        onChange?.(route);
    };

    const groups = groupByCategory(items ?? []);

    return (
        <nav
            aria-label="Navegação principal"
            className={`flex ${horizontal ? 'items-center overflow-x-auto shrink-0' : 'h-full min-h-0 overflow-y-auto'} ${className}`}
            style={{
                flexDirection: horizontal ? 'row' : 'column',
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                padding: 'var(--sarak-layout-gap-md, 16px)',
            }}
        >
            {brand && (brand.name || brand.logoUrl) ? (
                <div
                    className="flex items-center shrink-0"
                    style={{
                        gap: 'var(--sarak-layout-gap-sm, 8px)',
                        marginBottom: horizontal ? undefined : 'var(--sarak-layout-gap-md, 16px)',
                        marginInlineEnd: horizontal ? 'var(--sarak-layout-gap-md, 16px)' : undefined,
                    }}
                >
                    {brand.logoUrl ? (
                        <img
                            src={brand.logoUrl}
                            alt={brand.name ?? 'Logo'}
                            className="object-contain"
                            style={{ height: 'var(--sarak-shell-brand-logo-size, 32px)' }}
                        />
                    ) : null}
                    {brand.name ? (
                        <span className="font-bold tracking-tight text-[var(--sarak-text-main,#ffffff)] truncate">
                            {brand.name}
                        </span>
                    ) : null}
                </div>
            ) : null}

            {Array.from(groups.entries()).map(([category, groupItems], index) => (
                <React.Fragment key={category || 'raiz'}>
                    {horizontal && index > 0 ? (
                        // Grupos viram separadores na horizontal (o rótulo de categoria some).
                        <span
                            aria-hidden="true"
                            className="self-stretch shrink-0"
                            style={{ width: 'var(--sarak-border-width, thin)', background: 'var(--sarak-card-border-color, rgba(255,255,255,0.1))' }}
                        />
                    ) : null}
                    <div
                        className="flex"
                        style={{
                            flexDirection: horizontal ? 'row' : 'column',
                            alignItems: horizontal ? 'center' : undefined,
                            gap: horizontal
                                ? 'var(--sarak-layout-gap-sm, 8px)'
                                : 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
                        }}
                    >
                        {category && !horizontal ? (
                            <div
                                className="text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,#94a3b8)] opacity-70 select-none"
                                style={{ paddingInline: 'var(--sarak-layout-gap-sm, 8px)', marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}
                            >
                                {category}
                            </div>
                        ) : null}
                        {groupItems.map((item) => (
                            <NavEntry
                                key={item.route}
                                item={item}
                                isActive={item.route === activeRoute}
                                horizontal={horizontal}
                                onSelect={select}
                            />
                        ))}
                    </div>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default SarakShellNav;
