import React, { useEffect, useRef, useState } from 'react';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakLink } from '../Navigation/SarakLink';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { SarakTabItem } from './SarakTabs';

interface SarakTabsMenuProps {
    tabs: SarakTabItem[];
    activeTab: string;
    onSelect: (tab: SarakTabItem) => void;
    onNavigate?: (href: string, tab: SarakTabItem) => void;
    /** Seta para a esquerda no gatilho: devolve o foco à última aba visível da faixa. */
    onLeaveStart?: () => void;
}

const ITEM_STYLE: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    textAlign: 'start',
    minHeight: 'var(--sarak-touch-target-min, 44px)',
    paddingInline: 'var(--sarak-layout-gap-md, 16px)',
};

const MENU_STYLE: React.CSSProperties = {
    position: 'absolute',
    insetInlineEnd: 0,
    top: '100%',
    zIndex: 'var(--sarak-z-sidebar, 500)' as unknown as number,
    minWidth: 'max-content',
    borderRadius: 'var(--sarak-card-radius, 10px)',
};

/** Abas que não cabem na faixa: gatilho + menu com setas, Home/End, Esc e Tab. */
export const SarakTabsMenu = ({ tabs, activeTab, onSelect, onNavigate, onLeaveStart }: SarakTabsMenuProps): React.ReactElement | null => {
    const text = useLibraryText();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const items = (): HTMLElement[] => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const focusAt = (index: number): void => {
        const list = items();
        list[(index + list.length) % list.length]?.focus();
    };
    const close = (restoreFocus: boolean): void => {
        setOpen(false);
        if (restoreFocus) rootRef.current?.querySelector<HTMLElement>('[data-sarak-tabs-trigger]')?.focus();
    };

    useEffect(() => {
        if (!open) return undefined;
        focusAt(0);
        const onPointer = (event: MouseEvent): void => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onPointer, true);
        return () => document.removeEventListener('mousedown', onPointer, true);
    }, [open]);

    if (tabs.length === 0) return null;

    const onMenuKeyDown = (event: React.KeyboardEvent): void => {
        const current = items().indexOf(document.activeElement as HTMLElement);
        const moves: Record<string, () => void> = {
            ArrowDown: () => focusAt(current + 1),
            ArrowUp: () => focusAt(current - 1),
            Home: () => focusAt(0),
            End: () => focusAt(-1),
            Escape: () => close(true),
            Tab: () => close(false),
        };
        const move = moves[event.key];
        if (!move) return;
        if (event.key !== 'Tab') event.preventDefault();
        move();
    };

    const choose = (tab: SarakTabItem): void => {
        onSelect(tab);
        close(true);
    };

    return (
        <div ref={rootRef} className="relative shrink-0">
            <SarakButton
                data-sarak-tabs-trigger=""
                type="button"
                variant="ghost"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={text('tabsMoreLabel')}
                style={{ minHeight: 'var(--sarak-touch-target-min, 44px)', minWidth: 'var(--sarak-touch-target-min, 44px)' }}
                onClick={() => setOpen((value) => !value)}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); }
                    if (event.key === 'ArrowLeft' && onLeaveStart) { event.preventDefault(); onLeaveStart(); }
                }}
            >
                <SarakIcon name="MoreHorizontal" size="var(--sarak-body-size, 14px)" />
            </SarakButton>
            {open && (
                <div ref={menuRef} role="menu" className="card" style={MENU_STYLE} onKeyDown={onMenuKeyDown}>
                    {tabs.map((tab) => (
                        <TabsMenuItem key={tab.id} tab={tab} current={tab.id === activeTab} onChoose={choose} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

const TabsMenuItem = ({ tab, current, onChoose, onNavigate }: { tab: SarakTabItem; current: boolean; onChoose: (tab: SarakTabItem) => void; onNavigate?: (href: string, tab: SarakTabItem) => void }): React.ReactElement => {
    const label = <>{tab.icon}{tab.label}{tab.count !== undefined && <> <span className="tabular-nums">{tab.count}</span></>}</>;
    const shared = { role: 'menuitem', tabIndex: -1, 'aria-current': current ? ('true' as const) : undefined, style: ITEM_STYLE };
    if (tab.href !== undefined && !tab.disabled) {
        const href = tab.href;
        return <SarakLink {...shared} href={href} onClick={() => onChoose(tab)} onNavigate={onNavigate ? () => onNavigate(href, tab) : undefined} className="no-underline hover:no-underline">{label}</SarakLink>;
    }
    return <SarakButton {...shared} type="button" variant="ghost" disabled={tab.disabled} onClick={() => onChoose(tab)}>{label}</SarakButton>;
};
