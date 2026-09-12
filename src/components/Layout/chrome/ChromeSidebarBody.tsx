import React from 'react';
import { SarakShellNav, type ShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { ShellSearchWidget } from '../../atomic/Navigation/ShellSearchWidget';
import { ShellLanguageSelector } from '../../atomic/Navigation/ShellLanguageSelector';
import { ShellFontSizeControl } from '../../atomic/Navigation/ShellFontSizeControl';
import { ShellNavigationStyleControl } from '../../atomic/Navigation/ShellNavigationStyleControl';
import { ShellPreferencesMenu } from '../../atomic/Navigation/ShellPreferencesMenu';
import { SarakSearch } from '../../atomic/Inputs/SarakSearch';
import type { ShellUser } from '../../../core/Shell/Components/types';
import { ChromeFrame } from './ChromeFrame';
import { ChromeBrand, ChromeSearchSlot, ChromeSidebarSlot, ChromeTopbarSlot } from './ChromeSlots';
import { ChromeCollapseToggle } from './ChromeCollapseToggle';
import { ChromeUserThemeGroup } from './ChromeUserThemeGroup';
import { resolveChromeAsidePositionClass, resolveChromeBodyDirectionClass, resolveChromeContentAlignmentClass } from './chromeStructuralStyles';
import { useChromeAutoHide } from './useChromeAutoHide';
import { useChromeDesignTokens } from './useChromeDesignTokens';
import { useChromeDefaultWidgets } from './useChromeDefaultWidgets';
import type { SarakChromeWidgets } from './chromeWidgets';

export interface ChromeSidebarBodyProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    nav: ShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    topbarStart?: React.ReactNode;
    endSlot?: React.ReactNode;
    sidebarHeader?: React.ReactNode;
    sidebarFooter?: React.ReactNode;
    search?: React.ReactNode;
    banner?: React.ReactNode;
    footer?: React.ReactNode;
    decoration?: React.ReactNode;
    /** Identidade exibida no widget de usuário default (fora do slot `sidebarFooter`). */
    user?: ShellUser;
    logout?: () => void;
    /** Opt-out dos widgets default (busca/tema/usuário/colapso) — omitir liga os quatro. */
    widgets?: SarakChromeWidgets;
    className: string;
    rootStyle: React.CSSProperties;
    children: React.ReactNode;
}

/**
 * Corpo do modo SIDEBAR do `SarakAppChrome` — extraído de `SarakAppChrome.tsx`
 * para o arquivo caber no teto de 250 linhas (R9) antes de ganhar o consumo
 * dos tokens de cromo que faltavam.
 */
export const ChromeSidebarBody: React.FC<ChromeSidebarBodyProps> = ({
    brand, logo, nav, activeRoute, onNavigate, topbarStart, endSlot, sidebarHeader, sidebarFooter,
    search, banner, footer, decoration, user, logout, widgets, className, rootStyle, children,
}) => {
    const { sidebarPosition, contentAlignment, isNavHidden, isAutoHideEnabled, searchPositionSidebar } = useChromeDesignTokens();
    const { isVisible, sensorProps, surfaceProps } = useChromeAutoHide(isAutoHideEnabled);
    const w = useChromeDefaultWidgets(widgets, { hasCustomSearch: Boolean(search), hasUser: Boolean(user) });
    const effectiveSearch = search ?? (w.showSearch
        ? <ShellSearchWidget variant={isNavHidden ? 'icon' : 'bar'} onClick={w.openSearch} />
        : null);
    const showFontSize = w.preferencePlacement.pinned.includes('fontSize');
    const showNavigationStyle = w.preferencePlacement.pinned.includes('navigationStyle');
    const showLanguage = w.preferencePlacement.pinned.includes('language');
    // Sidebar recolhida (ícone-only) não tem coluna para o controle com rótulo —
    // mas a preferência continua oferecida (Spec 05 §2.3, "nada some"), então o ⚙
    // a recebe, mesmo quando nenhuma está em posição `menu` (que já a levaria).
    const collapsedExtras = w.preferencePlacement.pinned.filter((id) => id !== 'colorMode' && id !== 'navCollapsed');
    const menuIdsToShow = isNavHidden && w.preferencePlacement.menu.length === 0 ? collapsedExtras : w.preferencePlacement.menu;
    const hasPreferencesMenu = menuIdsToShow.length > 0;

    return (
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            <div className={`relative flex flex-1 min-w-0 min-h-0 ${resolveChromeBodyDirectionClass(sidebarPosition)}`}>
                {isAutoHideEnabled && !isVisible && (
                    <div {...sensorProps} aria-hidden="true" className="fixed left-0 top-0 w-4 h-full z-[60] cursor-pointer" />
                )}
                {isVisible && (
                    <aside
                        {...surfaceProps}
                        className={`flex flex-col shrink-0 overflow-y-auto transition-[width] duration-300 ${resolveChromeAsidePositionClass(sidebarPosition)}`}
                        style={{
                            width: isNavHidden ? 'var(--sarak-sidebar-collapsed-width, 74px)' : 'var(--sarak-sidebar-width, 240px)',
                            margin: 'var(--sarak-tab-section-margin, 0px)',
                            background: 'var(--sarak-sidebar-bg, var(--theme-sidebar-bg, transparent))',
                            borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                        }}
                    >
                        <div className="flex items-center justify-between px-1">
                            <ChromeBrand brand={brand} logo={logo} compact={isNavHidden} />
                            {w.showCollapse && (
                                <ChromeCollapseToggle orientation="sidebar" collapsed={isNavHidden} onToggle={w.toggleNavHidden} />
                            )}
                        </div>
                        {/* Sem barra superior, `topbarStart`/`topbarEnd` degradam para topo/rodapé da sidebar. */}
                        <ChromeTopbarSlot region="start" className="px-2">{topbarStart}</ChromeTopbarSlot>
                        {searchPositionSidebar === 'top' && (
                            <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pb-2">{effectiveSearch}</ChromeSearchSlot>
                        )}
                        <ChromeSidebarSlot region="header">{sidebarHeader}</ChromeSidebarSlot>
                        {nav.length > 0 && (
                            <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={onNavigate} orientation="vertical" collapsed={isNavHidden} className="flex-1" />
                        )}
                        {searchPositionSidebar === 'bottom' && (
                            <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pt-2">{effectiveSearch}</ChromeSearchSlot>
                        )}
                        {/* Markup preservado byte a byte do `topbarActions` no modo sidebar (compat). */}
                        {endSlot && <div data-sarak-slot="topbarEnd" className="mt-auto p-2">{endSlot}</div>}
                        <ChromeSidebarSlot region="footer">{sidebarFooter}</ChromeSidebarSlot>
                        {!isNavHidden && (showFontSize || showNavigationStyle || showLanguage) && (
                            <div className="flex flex-col gap-2 px-2 py-1">
                                {showFontSize && <ShellFontSizeControl />}
                                {showNavigationStyle && <ShellNavigationStyleControl />}
                                {showLanguage && <ShellLanguageSelector variant="horizontal" />}
                            </div>
                        )}
                        <ChromeUserThemeGroup
                            showThemeToggle={w.showThemeToggle}
                            showUser={w.showUser}
                            user={user}
                            logout={logout}
                            variant={isNavHidden ? 'mini' : 'vertical'}
                        />
                        {hasPreferencesMenu && (
                            <div className="px-2 pb-1">
                                <ShellPreferencesMenu
                                    menuIds={menuIdsToShow}
                                    isNavHidden={isNavHidden}
                                    onToggleNavCollapsed={w.toggleNavHidden}
                                    align="start"
                                />
                            </div>
                        )}
                    </aside>
                )}
                <main
                    className={`relative flex-1 min-w-0 min-h-0 overflow-auto ${resolveChromeContentAlignmentClass(contentAlignment)}`}
                    style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}
                >
                    {children}
                </main>
            </div>
            {w.showSearch && (
                <SarakSearch
                    isOpen={w.isSearchOpen}
                    onClose={w.closeSearch}
                    items={nav.map((item) => ({ id: item.route, label: item.label, category: item.category }))}
                    onSelect={onNavigate}
                />
            )}
        </ChromeFrame>
    );
};

export default ChromeSidebarBody;
