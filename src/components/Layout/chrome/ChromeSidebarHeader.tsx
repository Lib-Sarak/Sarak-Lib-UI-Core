import React from 'react';
import { ChromeBrand } from './ChromeSlots';
import { ChromeCollapseToggle } from './ChromeCollapseToggle';

export interface ChromeSidebarHeaderProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    /** Marca no topo (`sidebarLogoPlacement: 'top'`); na base ela vai para o rodapé e aqui sobra só o recolher. */
    showBrand: boolean;
    collapsed: boolean;
    showCollapse: boolean;
    onToggleCollapse: () => void;
}

/**
 * Topo fixo da lateral: a marca e a seta de recolher. A altura segue a do topo da área de conteúdo
 * (`topbarHeight`), então a marca e o título da página alinham. Aberta, a marca fica à esquerda e a seta à direita;
 * recolhida, a seta continua no alto e a marca (só o símbolo) vem logo abaixo. A seta é sempre a mesma, com rótulo
 * acessível que troca com o estado.
 */
export const ChromeSidebarHeader: React.FC<ChromeSidebarHeaderProps> = ({
    brand, logo, showBrand, collapsed, showCollapse, onToggleCollapse,
}) => (
    <div
        data-sarak-sidebar-header="true"
        className={`relative z-10 flex shrink-0 items-center px-1 ${collapsed ? 'flex-col justify-center' : 'justify-between'}`}
        style={{ minHeight: 'var(--sarak-topbar-height, 64px)' }}
    >
        {collapsed && showCollapse && (
            <ChromeCollapseToggle orientation="sidebar" collapsed onToggle={onToggleCollapse} />
        )}
        {showBrand && <ChromeBrand brand={brand} logo={logo} compact={collapsed} />}
        {!collapsed && showCollapse && (
            <ChromeCollapseToggle orientation="sidebar" collapsed={false} onToggle={onToggleCollapse} />
        )}
    </div>
);

export default ChromeSidebarHeader;
