import React from 'react';
import { SarakMenuItem } from '../SarakMenuItem';
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

const NESTED_INDENT_STYLE: React.CSSProperties = { paddingInlineStart: 'calc(var(--sarak-layout-gap-md, 16px) * 1.5)' };

/**
 * Item folha da navegação. Composição atômica (R10): `SarakMenuItem` já nasce com métrica de lista, não de botão de
 * ação — nenhuma neutralização por `style` é necessária. `className="relative"` ancora o marcador do item ativo,
 * equivalente ao do `SidebarNav` do Shell (`navActiveMarkerColor`/`navActiveMarkerGlow`).
 */
export const ShellNavEntry: React.FC<ShellNavEntryProps> = ({ item, isActive, horizontal, collapsed, onSelect, nested = false }) => (
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
        style={nested ? NESTED_INDENT_STYLE : undefined}
    />
);

export default ShellNavEntry;
