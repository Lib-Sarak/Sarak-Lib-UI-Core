import React from 'react';
import { SarakIcon } from '../Icon/SarakIcon';

/**
 * SarakShellNav — Navegação de shell 100% orientada a dados (Spec 33 + Spec 14)
 *
 * Equivalente declarativo do menu do shell legado (Spec 04): recebe os módulos como
 * DADOS (`items`), agrupa por categoria, destaca o item ativo e delega a navegação ao
 * host — nunca manipula a URL. No manifesto, o par canônico é:
 *   props:   { "items": [...], "activeRoute": "{{$route}}" }
 *   actions: [{ "type": "navigate", "payload": { "to": "{{$event}}" } }]
 * O componente emite `onChange(route)` no clique/teclado; a Engine converte o valor
 * em `{{$event}}` para a cadeia de ações (LeafNode).
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
    /** Rota ativa — no manifesto, use `"{{$route}}"` (injetada pelo Renderer). */
    activeRoute?: string;
    /** Identidade exibida no topo do menu. */
    brand?: { name?: string; logoUrl?: string };
    /** Caminho TSX: callback direto. No manifesto a navegação sai por `onChange`. */
    onNavigate?: (route: string) => void;
    /** Caminho manifesto: a Engine injeta este handler e roda as `actions`. */
    onChange?: (route: string) => void;
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
    onSelect: (route: string) => void;
}> = ({ item, isActive, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(item.route)}
        aria-current={isActive ? 'page' : undefined}
        className={`w-full flex items-center text-left rounded-[var(--sarak-button-radius,8px)] transition-sarak cursor-pointer ${
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
    className = '',
}) => {
    const select = (route: string): void => {
        onNavigate?.(route);
        onChange?.(route);
    };

    const groups = groupByCategory(items ?? []);

    return (
        <nav
            aria-label="Navegação principal"
            className={`flex flex-col h-full min-h-0 overflow-y-auto ${className}`}
            style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-md, 16px)' }}
        >
            {brand && (brand.name || brand.logoUrl) ? (
                <div
                    className="flex items-center shrink-0"
                    style={{
                        gap: 'var(--sarak-layout-gap-sm, 8px)',
                        marginBottom: 'var(--sarak-layout-gap-md, 16px)',
                    }}
                >
                    {brand.logoUrl ? (
                        <img
                            src={brand.logoUrl}
                            alt={brand.name ?? 'Logo'}
                            className="object-contain"
                            style={{ height: 'var(--sarak-shell-brand-logo-size, 28px)' }}
                        />
                    ) : null}
                    {brand.name ? (
                        <span className="font-bold tracking-tight text-[var(--sarak-text-main,#ffffff)] truncate">
                            {brand.name}
                        </span>
                    ) : null}
                </div>
            ) : null}

            {Array.from(groups.entries()).map(([category, groupItems]) => (
                <div key={category || 'raiz'} className="flex flex-col" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' }}>
                    {category ? (
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
                            onSelect={select}
                        />
                    ))}
                </div>
            ))}
        </nav>
    );
};

export default SarakShellNav;
