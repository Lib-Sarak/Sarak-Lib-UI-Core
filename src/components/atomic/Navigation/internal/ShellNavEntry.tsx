import React from 'react';
import { SarakMenuItem } from '../SarakMenuItem';
import { nestedMenuItemIndent } from '../menuItemMetrics';
import { useNavigationAppearance } from '../../../../core/Provider/useNavigationAppearance';
import type { SarakShellNavItem } from '../SarakShellNav';

export interface ShellNavEntryProps {
    item: SarakShellNavItem;
    isActive: boolean;
    horizontal: boolean;
    collapsed: boolean;
    onSelect?: (route: string) => void;
    /** Recuo dos filhos dentro de um grupo aberto na lateral. */
    nested?: boolean;
}


/**
 * Item folha da navegação. Composição atômica (R10): `SarakMenuItem` já nasce com métrica de lista, não de botão de
 * ação — nenhuma neutralização por `style` é necessária. `className="relative"` ancora o marcador do item ativo,
 * equivalente ao do `SidebarNav` do Shell (`navActiveMarkerColor`/`navActiveMarkerGlow`).
 */
export const ShellNavEntry: React.FC<ShellNavEntryProps> = ({ item, isActive, horizontal, collapsed, onSelect, nested = false }) => {
    const { sidebarItemDensity } = useNavigationAppearance();
    // A sub-aba recua até o rótulo do pai, pela métrica do item (não pelo espaçamento de página, que num tema largo a esmagava).
    const nestedStyle: React.CSSProperties | undefined = nested ? { paddingInlineStart: nestedMenuItemIndent(sidebarItemDensity) } : undefined;
    return (
        <SarakMenuItem
            href={item.route}
            target={item.target}
            disabled={item.disabled}
            badge={item.badge}
            onNavigate={onSelect}
            active={isActive}
            collapsed={collapsed}
            orientation={horizontal ? 'horizontal' : 'vertical'}
            icon={item.icon}
            label={item.label}
            className="relative"
            style={nestedStyle}
        />
    );
};

export default ShellNavEntry;
