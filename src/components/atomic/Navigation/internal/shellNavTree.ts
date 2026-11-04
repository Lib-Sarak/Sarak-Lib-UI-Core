import type { SarakShellNavItem } from '../SarakShellNav';

/** Item com filhos é um grupo recolhível; item sem `children` segue um item comum. */
export const isNavGroup = (item: SarakShellNavItem): boolean => Boolean(item.children && item.children.length > 0);

/** O item (ou algum filho) aponta para a rota ativa. */
export const containsRoute = (item: SarakShellNavItem, route: string | undefined): boolean =>
    route !== undefined && (item.route === route || (item.children ?? []).some((child) => child.route === route));

/** Chave estável do grupo: a rota do pai (não navegável quando há filhos) mais o rótulo, para pais sem rota própria. */
export const groupKey = (item: SarakShellNavItem): string => `${item.route}::${item.label}`;

/** Agrupa preservando a ordem de aparição das categorias ('' = grupo raiz). */
export const groupByCategory = (items: SarakShellNavItem[]): Map<string, SarakShellNavItem[]> => {
    const groups = new Map<string, SarakShellNavItem[]>();
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

/** Grupos abertos de saída: os de `defaultExpanded` e o que contém a rota ativa. */
export const initialExpansion = (items: SarakShellNavItem[], activeRoute: string | undefined): Record<string, boolean> => {
    const expanded: Record<string, boolean> = {};
    for (const item of items) {
        if (!isNavGroup(item)) continue;
        if (item.defaultExpanded || containsRoute(item, activeRoute)) expanded[groupKey(item)] = true;
    }
    return expanded;
};
