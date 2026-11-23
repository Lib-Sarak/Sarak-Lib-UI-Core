import React from 'react';
import { useNavigationAppearance } from '../../../core/Provider/useNavigationAppearance';
import { MENU_ITEM_TEXT_CLASS, resolveVerticalMenuItemClasses, VERTICAL_MENU_ICON_SIZE } from '../../atomic/Navigation/menuItemMetrics';

export interface ChromeUnavailableWidgetProps {
    label: string;
    icon: React.ReactNode;
    variant: 'horizontal' | 'vertical' | 'mini';
}

/** Na barra de topo o widget indisponível é uma caixa; na lateral ele é uma linha, sem caixa, com a métrica do item de menu. */
const HORIZONTAL_CLASS_NAME = 'flex items-center gap-2 rounded-xl border px-2 py-1.5 border-[var(--theme-border)] bg-[var(--theme-card)]/40';

/** Na barra de topo o rótulo cede o lugar à navegação abaixo do breakpoint `2xl` (fica o ícone; o nome acessível é o `aria-label`). */
const LABEL_CLASS_NAMES = {
    horizontal: 'hidden 2xl:inline text-xs',
    vertical: 'flex-1 min-w-0 truncate text-left',
    mini: '',
} as const;

export const ChromeUnavailableWidget: React.FC<ChromeUnavailableWidgetProps> = (
    { label, icon, variant }: ChromeUnavailableWidgetProps,
): React.ReactElement => {
    const { sidebarItemDensity } = useNavigationAppearance();
    const rowClassName = `flex items-center w-full min-w-0 rounded-[var(--sarak-nav-item-radius,12px)] ${resolveVerticalMenuItemClasses(sidebarItemDensity)} ${MENU_ITEM_TEXT_CLASS} ${variant === 'mini' ? 'justify-center' : ''}`;
    return (
        <div
            role="button"
            aria-disabled="true"
            aria-label={label}
            title={label}
            tabIndex={0}
            data-sarak-widget="unavailable"
            className={`cursor-not-allowed text-[var(--theme-muted)] opacity-55 ${variant === 'horizontal' ? HORIZONTAL_CLASS_NAME : rowClassName}`}
        >
            {variant === 'horizontal'
                ? icon
                : <span aria-hidden="true" className="shrink-0 inline-flex items-center justify-center" style={{ width: VERTICAL_MENU_ICON_SIZE, height: VERTICAL_MENU_ICON_SIZE }}>{icon}</span>}
            {variant !== 'mini' && <span className={LABEL_CLASS_NAMES[variant]}>{label}</span>}
        </div>
    );
};
