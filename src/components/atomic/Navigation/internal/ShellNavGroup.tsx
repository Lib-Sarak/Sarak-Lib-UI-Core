import React, { useCallback, useId, useRef, useState } from 'react';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakMenuItem } from '../SarakMenuItem';
import type { SarakShellNavItem } from '../SarakShellNav';
import { ShellNavEntry } from './ShellNavEntry';
import { ShellNavFlyout } from './ShellNavFlyout';
import { containsRoute } from './shellNavTree';

export interface ShellNavGroupProps {
    item: SarakShellNavItem;
    activeRoute?: string;
    horizontal: boolean;
    collapsed: boolean;
    /** Estado do painel na própria barra (lateral aberta); balões têm estado próprio. */
    expanded: boolean;
    onToggle: (item: SarakShellNavItem) => void;
    onSelect?: (route: string) => void;
}

const MOTION = 'var(--duration-fast, 0.2s)';

/**
 * Item com filhos. O pai é um botão com seta, `aria-expanded` e `aria-controls`; a rota dele não navega. Na lateral
 * aberta (e na gaveta do celular) os filhos abrem na própria barra, com rolagem; na lateral recolhida e na topbar
 * abrem num balão ao lado do item. Um nível só de aninhamento.
 */
export const ShellNavGroup: React.FC<ShellNavGroupProps> = ({ item, activeRoute, horizontal, collapsed, expanded, onToggle, onSelect }) => {
    const panelId = useId();
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [flyoutOpen, setFlyoutOpen] = useState(false);
    const closeFlyout = useCallback(() => setFlyoutOpen(false), []);
    const useFlyout = collapsed || horizontal;
    const open = useFlyout ? flyoutOpen : expanded;
    const hasActiveChild = containsRoute(item, activeRoute);
    const children = item.children ?? [];

    const select = onSelect
        ? (route: string): void => {
            closeFlyout();
            onSelect(route);
        }
        : undefined;
    const toggle = (): void => (useFlyout ? setFlyoutOpen((current) => !current) : onToggle(item));

    return (
        <div ref={anchorRef} data-sarak-nav-group="true" className={horizontal ? 'relative inline-flex shrink-0' : 'flex min-w-0'} style={horizontal ? undefined : { flexDirection: 'column' }}>
            <SarakMenuItem
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                disabled={item.disabled}
                collapsed={collapsed}
                orientation={horizontal ? 'horizontal' : 'vertical'}
                aria-expanded={open}
                aria-controls={useFlyout && !open ? undefined : panelId}
                aria-haspopup={useFlyout ? 'true' : undefined}
                className="relative"
                style={hasActiveChild && !open ? { color: 'var(--sarak-nav-active-color, #19e3f0)' } : undefined}
                onClick={toggle}
            >
                {collapsed ? null : (
                    <SarakIcon
                        name={horizontal ? 'ChevronDown' : 'ChevronRight'}
                        size={14}
                        className="shrink-0 motion-reduce:transition-none"
                        style={{ transform: !horizontal && open ? 'rotate(90deg)' : undefined, transition: `transform ${MOTION}` }}
                    />
                )}
            </SarakMenuItem>
            {useFlyout ? (
                open && (
                    <ShellNavFlyout id={panelId} label={item.label} anchorRef={anchorRef} placement={horizontal ? 'below' : 'side'} onClose={closeFlyout}>
                        {children.map((child) => (
                            <ShellNavEntry key={child.route} item={child} isActive={child.route === activeRoute} horizontal={false} collapsed={false} onSelect={select} />
                        ))}
                    </ShellNavFlyout>
                )
            ) : (
                <div
                    id={panelId}
                    data-state={expanded ? 'open' : 'closed'}
                    className="grid min-w-0 motion-reduce:transition-none"
                    style={{
                        gridTemplateRows: expanded ? '1fr' : '0fr',
                        visibility: expanded ? 'visible' : 'hidden',
                        transition: `grid-template-rows ${MOTION} ease, visibility ${MOTION}`,
                    }}
                >
                    <div role="group" aria-label={item.label} className="flex min-h-0 overflow-hidden" style={{ flexDirection: 'column', gap: 'calc(var(--sarak-tab-gap, 8px) * 0.5)' }}>
                        {children.map((child) => (
                            <ShellNavEntry key={child.route} item={child} isActive={child.route === activeRoute} horizontal={false} collapsed={false} onSelect={onSelect} nested />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShellNavGroup;
