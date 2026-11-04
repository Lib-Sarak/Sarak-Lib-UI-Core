import { useCallback, useEffect, useRef, useState } from 'react';
import type { SarakShellNavItem } from '../SarakShellNav';
import { containsRoute, groupKey, initialExpansion, isNavGroup } from './shellNavTree';

export interface ShellNavExpansion {
    isExpanded: (item: SarakShellNavItem) => boolean;
    toggle: (item: SarakShellNavItem) => void;
}

/**
 * Quais grupos do menu estão abertos. Vários grupos podem ficar abertos ao mesmo tempo; o grupo do item ativo
 * abre sozinho, também quando a rota ativa muda para um filho de um grupo fechado.
 */
export const useShellNavExpansion = (items: SarakShellNavItem[], activeRoute: string | undefined): ShellNavExpansion => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => initialExpansion(items, activeRoute));

    // A lista chega, muitas vezes, como literal novo a cada render: só a MUDANÇA da rota ativa abre grupo, para um grupo
    // que o usuário fechou não reabrir a cada render do host.
    const itemsRef = useRef(items);
    itemsRef.current = items;

    useEffect(() => {
        if (activeRoute === undefined) return;
        setExpanded((current) => {
            const toOpen = itemsRef.current.filter((item) => isNavGroup(item) && containsRoute(item, activeRoute) && !current[groupKey(item)]);
            if (toOpen.length === 0) return current;
            return { ...current, ...Object.fromEntries(toOpen.map((item) => [groupKey(item), true])) };
        });
    }, [activeRoute]);

    const isExpanded = useCallback((item: SarakShellNavItem): boolean => Boolean(expanded[groupKey(item)]), [expanded]);
    const toggle = useCallback((item: SarakShellNavItem): void => {
        setExpanded((current) => ({ ...current, [groupKey(item)]: !current[groupKey(item)] }));
    }, []);

    return { isExpanded, toggle };
};
