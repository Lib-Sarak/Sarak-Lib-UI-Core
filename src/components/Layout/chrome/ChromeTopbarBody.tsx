import React from 'react';
import { SarakShellNav, type SarakShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { SarakShellSearchWidget } from '../../atomic/Navigation/SarakShellSearchWidget';
import { SarakShellLanguageSelector } from '../../atomic/Navigation/SarakShellLanguageSelector';
import { ShellFontSizeControl } from '../../atomic/Navigation/ShellFontSizeControl';
import { ShellNavigationStyleControl } from '../../atomic/Navigation/ShellNavigationStyleControl';
import { ShellPreferencesMenu } from '../../atomic/Navigation/ShellPreferencesMenu';
import { SarakSearch } from '../../atomic/Inputs/SarakSearch';
import type { SarakShellUser } from '../../atomic/Navigation/SarakShellUserWidget';
import { ChromeFrame } from './ChromeFrame';
import { ChromeBrand, ChromeSearchSlot, ChromeTopbarSlot } from './ChromeSlots';
import { ChromeCollapseToggle } from './ChromeCollapseToggle';
import { ChromeUserThemeGroup, ChromeUserWidget } from './ChromeUserThemeGroup';
import { ChromeNotificationsWidget, type SarakChromeNotification } from './ChromeNotificationsWidget';
import { resolveChromeContentAlignmentClass, resolveChromeNavbarLayoutClass } from './chromeStructuralStyles';
import { useChromeAutoHide } from './useChromeAutoHide';
import { useChromeDesignTokens } from './useChromeDesignTokens';
import { useChromeDefaultWidgets } from './useChromeDefaultWidgets';
import { chromeNoiseLayerStyle } from './noiseTexture';
import type { SarakChromeWidgets } from './chromeWidgets';
import { getSarakSearchItems } from './navItem';

export interface ChromeTopbarBodyProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    nav: SarakShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    topbarStart?: React.ReactNode;
    endSlot?: React.ReactNode;
    search?: React.ReactNode;
    banner?: React.ReactNode;
    footer?: React.ReactNode;
    decoration?: React.ReactNode;
    /** Identidade exibida no widget de usuário default (fora do slot `topbarEnd`). */
    user?: SarakShellUser;
    logout?: () => void;
    notifications?: SarakChromeNotification[];
    onNotificationSelect?: (notification: SarakChromeNotification) => void;
    /** Opt-out dos widgets default; omitir mantém a composição de fábrica ativa. */
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
    search, banner, footer, decoration, user, logout, notifications, onNotificationSelect, widgets, className, rootStyle, children,
}) => {
    const { navbarLayout, contentAlignment, isNavHidden, isAutoHideEnabled, searchPositionTopbar } = useChromeDesignTokens();
    const { isVisible, sensorProps, surfaceProps } = useChromeAutoHide(isAutoHideEnabled);
    const w = useChromeDefaultWidgets(widgets, {
        hasCustomSearch: Boolean(search),
        hasUser: Boolean(user),
        hasLogout: Boolean(logout),
        hasNotifications: Boolean(notifications?.length),
        hasNotificationHandler: Boolean(onNotificationSelect),
    });
    const effectiveSearch = search ?? (w.showSearch
        ? <SarakShellSearchWidget
            variant={isNavHidden ? 'icon' : 'bar'}
            onClick={w.openSearch}
            items={getSarakSearchItems(nav)}
            onSelect={onNavigate ? (item) => onNavigate(item.id) : undefined}
        />
        : null);
    const showFontSize = w.preferencePlacement.pinned.includes('fontSize');
    const showNavigationStyle = w.preferencePlacement.pinned.includes('navigationStyle');
    const showLanguage = w.preferencePlacement.pinned.includes('language');
    const menuWidgets = (
        <>
            {w.showSearchInMenu && <SarakShellSearchWidget variant="icon" onClick={w.openSearch} />}
            {w.showUserInMenu && <ChromeUserWidget user={user} logout={logout} variant="vertical" />}
            {w.showNotificationsInMenu && <ChromeNotificationsWidget notifications={notifications} onSelect={onNotificationSelect} variant="vertical" />}
        </>
    );
    const hasMenuWidgets = w.widgetPlacement.menu.length > 0;
    const showEndGroup = Boolean(endSlot) || (Boolean(effectiveSearch) && searchPositionTopbar === 'right')
        || w.showThemeToggle || w.showUser || w.showNotifications || showFontSize || showNavigationStyle || showLanguage || hasMenuWidgets;

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
                    {/* `topbarNoiseOpacity` (Spec 05 §2.4). */}
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none mix-blend-overlay" style={chromeNoiseLayerStyle('--sarak-topbar-noise-opacity')} />
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
                            {showFontSize && <ShellFontSizeControl />}
                            {showNavigationStyle && <ShellNavigationStyleControl />}
                            {showLanguage && <SarakShellLanguageSelector variant="horizontal" />}
                            <ChromeUserThemeGroup
                                showThemeToggle={w.showThemeToggle}
                                showUser={w.showUser}
                                user={user}
                                logout={logout}
                                variant="horizontal"
                                className="flex items-center gap-2"
                            />
                            {w.showNotifications && <ChromeNotificationsWidget notifications={notifications} onSelect={onNotificationSelect} variant="horizontal" />}
                            {hasMenuWidgets && (
                                <ShellPreferencesMenu
                                    menuIds={w.preferencePlacement.menu}
                                    isNavHidden={isNavHidden}
                                    onToggleNavCollapsed={w.toggleNavHidden}
                                    additionalRows={menuWidgets}
                                />
                            )}
                        </div>
                    )}
                </header>
            )}
            <main
                data-sarak-content
                className={`relative flex-1 min-w-0 min-h-0 overflow-auto ${resolveChromeContentAlignmentClass(contentAlignment)}`}
                style={{ color: 'var(--text-main, var(--color-theme-title, inherit))', padding: 'var(--sarak-layout-padding, 16px)' }}
            >
                {children}
            </main>
            {w.showSearchOffered && (
                <SarakSearch
                    isOpen={w.isSearchOpen}
                    onClose={w.closeSearch}
            items={getSarakSearchItems(nav)}
            onSelect={onNavigate}
                />
            )}
        </ChromeFrame>
    );
};

export default ChromeTopbarBody;
