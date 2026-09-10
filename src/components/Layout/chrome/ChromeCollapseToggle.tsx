import React from 'react';
import { SarakIcon } from '../../atomic/Icon/SarakIcon';
import { SarakIconButton } from '../../atomic/Buttons/SarakIconButton';

export interface ChromeCollapseToggleProps {
    /** Onde o toggle mora — muda só o ícone (chevron na sidebar, hambúrguer na topbar). */
    orientation: 'sidebar' | 'topbar';
    /** Estado atual de `design.isNavHidden`. */
    collapsed: boolean;
    onToggle: () => void;
}

/**
 * Toggle de colapso da navegação (widget default do cromo apresentacional) — o mesmo
 * papel do chevron/hambúrguer do `SarakShell` (`SidebarNav.tsx`/`TopbarNav.tsx`),
 * reimplementado aqui porque o cromo apresentacional não compartilha componente de UI
 * com o Shell (só o token `isNavHidden`).
 */
export const ChromeCollapseToggle: React.FC<ChromeCollapseToggleProps> = ({ orientation, collapsed, onToggle }) => (
    <SarakIconButton
        type="button"
        onClick={onToggle}
        variant="ghost"
        size="sm"
        data-sarak-widget="collapse"
        className="shrink-0"
        aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
        icon={<SarakIcon name={orientation === 'topbar' ? 'Menu' : 'ChevronLeft'} size={16} />}
    />
);

export default ChromeCollapseToggle;
