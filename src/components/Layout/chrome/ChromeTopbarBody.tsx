import React from 'react';
import { SarakShellNav, type ShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { ShellSearchWidget } from '../../atomic/Navigation/ShellSearchWidget';
import { SarakSearch } from '../../atomic/Inputs/SarakSearch';
import type { ShellUser } from '../../../core/Shell/Components/types';
import { ChromeFrame } from './ChromeFrame';
import { ChromeBrand, ChromeSearchSlot, ChromeTopbarSlot } from './ChromeSlots';
import { ChromeCollapseToggle } from './ChromeCollapseToggle';
import { ChromeUserThemeGroup } from './ChromeUserThemeGroup';
import { resolveChromeContentAlignmentClass, resolveChromeNavbarLayoutClass } from './chromeStructuralStyles';
import { useChromeAutoHide } from './useChromeAutoHide';
import { useChromeDesignTokens } from './useChromeDesignTokens';
import { useChromeDefaultWidgets } from './useChromeDefaultWidgets';
import type { SarakChromeWidgets } from './chromeWidgets';

export interface ChromeTopbarBodyProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    nav: ShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    topbarStart?: React.ReactNode;
    endSlot?: React.ReactNode;
    search?: React.ReactNode;
    banner?: React.ReactNode;
    footer?: React.ReactNode;
    decoration?: React.ReactNode;
    /** Identidade exibida no widget de usuário default (fora do slot `topbarEnd`). */
    user?: ShellUser;
    logout?: () => void;
    /** Opt-out dos widgets default (busca/tema/usuário/colapso) — omitir liga os quatro. */
    widgets?: SarakChromeWidgets;
    className: string;
    rootStyle: React.CSSProperties;
    children: React.ReactNode;
}

/**
 * Corpo do modo TOPBAR do `SarakAppChrome` — extraído de `SarakAppChrome.tsx`
 * pelo mesmo motivo do `ChromeSidebarBody` (teto de 250 linhas, R9).
 */
export const ChromeTopbarBody: React.FC<ChromeTopbarBodyProps> = ({
    brand, logo, nav, activeRoute, onNavigate, topbarStart, endSlot,
    search, banner, footer, decoration, user, logout, widgets, className, rootStyle, children,
}) => {
    const { navbarLayout, contentAlignment, isNavHidden, isAutoHideEnabled, searchPositionTopbar } = useChromeDesignTokens();
    const { isVisible, sensorProps, surfaceProps } = useChromeAutoHide(isAutoHideEnabled);
    const w = useChromeDefaultWidgets(widgets);
    const effectiveSearch = search ?? (w.showSearch
        ? <ShellSearchWidget variant={isNavHidden ? 'icon' : 'bar'} onClick={w.openSearch} />
        : null);
    const showEndGroup = Boolean(endSlot) || (Boolean(effectiveSearch) && searchPositionTopbar === 'right') || w.showThemeToggle || w.showUser;

    return (
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            {isAutoHideEnabled && !isVisible && (
                <div {...sensorProps} aria-hidden="true" className="fixed left-0 top-0 w-full h-4 z-[60] cursor-pointer" />
            )}
            {isVisible && (
                <header
                    {...surfaceProps}
                    className={`relative flex items-center gap-4 px-4 shrink-0 border-b transition-[height] duration-300 ${resolveChromeNavbarLayoutClass(navbarLayout)}`}
                    style={{
                        height: isNavHidden ? 'var(--sarak-topbar-collapsed-height, 40px)' : 'var(--sarak-topbar-height, 64px)',
                        margin: 'var(--sarak-tab-section-margin, 0px)',
                        background: 'var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))',
                        borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                    }}
                >
                    {w.showCollapse && (
                        <ChromeCollapseToggle orientation="topbar" collapsed={isNavHidden} onToggle={w.toggleNavHidden} />
                    )}
                    <ChromeBrand brand={brand} logo={logo} horizontal compact={isNavHidden} />
                    <ChromeTopbarSlot region="start">{topbarStart}</ChromeTopbarSlot>
                    {searchPositionTopbar !== 'right' && (
                        <ChromeSearchSlot position={searchPositionTopbar} className={searchPositionTopbar === 'center' ? 'mx-auto' : ''}>
                            {effectiveSearch}
                        </ChromeSearchSlot>
                    )}
                    {nav.length > 0 && (
                        <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={onNavigate} orientation="horizontal" collapsed={isNavHidden} className="flex-1 min-w-0" />
                    )}
                    {/* Um único `ml-auto` no agrupador — dois irmãos com `ml-auto` dividiriam o
                        espaço livre entre si (regra de auto-margin do flexbox) e abririam um
                        vão indesejado entre a busca e o `topbarEnd` quando não há nav. */}
                    {showEndGroup && (
                        <div className="ml-auto flex items-center gap-2 min-w-0 shrink-0">
                            {searchPositionTopbar === 'right' && (
                                <ChromeSearchSlot position={searchPositionTopbar}>{effectiveSearch}</ChromeSearchSlot>
                            )}
                            <ChromeTopbarSlot region="end">{endSlot}</ChromeTopbarSlot>
                            <ChromeUserThemeGroup
                                showThemeToggle={w.showThemeToggle}
                                showUser={w.showUser}
                                user={user}
                                logout={logout}
                                variant="horizontal"
                                className="flex items-center gap-2"
                            />
                        </div>
                    )}
                </header>
            )}
            <main
                className={`relative flex-1 min-w-0 min-h-0 overflow-auto ${resolveChromeContentAlignmentClass(contentAlignment)}`}
                style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}
            >
                {children}
            </main>
            {w.showSearch && <SarakSearch isOpen={w.isSearchOpen} onClose={w.closeSearch} />}
        </ChromeFrame>
    );
};

export default ChromeTopbarBody;
