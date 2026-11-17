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
 * A faixa da marca: a altura do topo da área de conteúdo, linha embaixo na cor da borda da barra e o fundo da marca. O fundo é a
 * primária, então o que fica sobre ele (o nome, o monograma e a seta) lê o texto da marca, escolhido pelo contraste contra a faixa:
 * a seta é um botão fantasma, que pinta com `--sarak-primary-color`, e dentro da faixa essa variável é o texto da marca.
 */
const BAND_STYLE: React.CSSProperties = {
    height: 'var(--sarak-topbar-height, 64px)',
    borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-sidebar-border-color, var(--border-color, rgba(255,255,255,0.09)))',
    background: 'var(--sarak-sidebar-brand-bg, transparent)',
    color: 'var(--sarak-sidebar-brand-color, var(--sarak-on-sidebar, #f2f6fb))',
    ['--sarak-primary-color' as string]: 'var(--sarak-sidebar-brand-color, var(--sarak-on-sidebar, #f2f6fb))',
};

/**
 * Topo fixo da lateral: a faixa da marca e a seta de recolher. A altura segue a do topo da área de conteúdo
 * (`topbarHeight`), então a marca e o título da página alinham. Aberta, a marca (logo, ou monograma e nome) fica à
 * esquerda e a seta à direita; recolhida, a seta continua no alto e o símbolo da marca vem logo abaixo. Com a marca na
 * base, o topo é só a seta, sem faixa — e sem seta nem marca, não há topo.
 */
export const ChromeSidebarHeader: React.FC<ChromeSidebarHeaderProps> = ({
    brand, logo, showBrand, collapsed, showCollapse, onToggleCollapse,
}) => {
    if (!showBrand && !showCollapse) return null;
    const band = showBrand && !collapsed;
    return (
        <div
            data-sarak-sidebar-header="true"
            className={`relative z-10 flex shrink-0 items-center px-1 ${collapsed ? 'flex-col justify-center gap-2 py-2' : showBrand ? 'justify-between' : 'justify-end'}`}
            style={band ? BAND_STYLE : undefined}
        >
            {collapsed && showCollapse && (
                <ChromeCollapseToggle orientation="sidebar" collapsed onToggle={onToggleCollapse} />
            )}
            {showBrand && <ChromeBrand brand={brand} logo={logo} compact={collapsed} band />}
            {!collapsed && showCollapse && (
                <ChromeCollapseToggle orientation="sidebar" collapsed={false} onToggle={onToggleCollapse} />
            )}
        </div>
    );
};

export default ChromeSidebarHeader;
