import React, { useRef } from 'react';
import { SarakShellNav, type SarakShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { SarakShellSearchWidget } from '../../atomic/Navigation/SarakShellSearchWidget';
import { SarakSearch } from '../../atomic/Inputs/SarakSearch';
import type { SarakShellUser } from '../../atomic/Navigation/SarakShellUserWidget';
import { ChromeFrame } from './ChromeFrame';
import { ChromeContentRegion } from './ChromeContentRegion';
import { ChromeSearchSlot, ChromeSidebarSlot, ChromeTopbarSlot } from './ChromeSlots';
import { ChromeSidebarHeader } from './ChromeSidebarHeader';
import { ChromeSidebarFooter } from './ChromeSidebarFooter';
import { ChromeSidebarResizeHandle } from './ChromeSidebarResizeHandle';
import { useSidebarResize } from './useSidebarResize';
import { resolveChromeToneStyle } from './chromeToneStyle';
import { ChromeUserWidget } from './ChromeUserThemeGroup';
import { ChromeNotificationsWidget, type SarakChromeNotification } from './ChromeNotificationsWidget';
import { resolveChromeAsidePositionClass, resolveChromeBodyDirectionClass, resolveChromeBackground, resolveChromeContentStyle, resolveChromeSurfaceBorderStyle } from './chromeStructuralStyles';
import { useChromeAutoHide } from './useChromeAutoHide';
import { useChromeDesignTokens } from './useChromeDesignTokens';
import { useChromeDefaultWidgets } from './useChromeDefaultWidgets';
import { chromeNoiseLayerStyle } from './noiseTexture';
import type { SarakChromeWidgets } from './chromeWidgets';
import { getSarakSearchItems } from './navItem';

export interface ChromeSidebarBodyProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    nav: SarakShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    topbarStart?: React.ReactNode;
    endSlot?: React.ReactNode;
    sidebarHeader?: React.ReactNode;
    sidebarFooter?: React.ReactNode;
    secondaryContent?: React.ReactNode;
    search?: React.ReactNode;
    banner?: React.ReactNode;
    footer?: React.ReactNode;
    decoration?: React.ReactNode;
    /** Identidade exibida no widget de usuário default (fora do slot `sidebarFooter`). */
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
 * Corpo do modo SIDEBAR do `SarakAppChrome` — extraído de `SarakAppChrome.tsx`
 * para o arquivo caber no teto de 250 linhas (R9) antes de ganhar o consumo
 * dos tokens de cromo que faltavam.
 */
export const ChromeSidebarBody: React.FC<ChromeSidebarBodyProps> = ({
    brand, logo, nav, activeRoute, onNavigate, topbarStart, endSlot, sidebarHeader, sidebarFooter, secondaryContent,
    search, banner, footer, decoration, user, logout, notifications, onNotificationSelect, widgets, className, rootStyle, children,
}) => {
    const {
        sidebarPosition, layoutDensity, maxContentWidth, isSplitViewEnabled, isNavHidden, isAutoHideEnabled,
        searchPositionSidebar, sidebarBorderSide, sidebarBorderStyle, sidebarBackgroundStyle,
        sidebarLogoPlacement, sidebarTone, sidebarResizable,
    } = useChromeDesignTokens();
    const asideRef = useRef<HTMLElement>(null);
    const resize = useSidebarResize(asideRef, sidebarPosition === 'right' ? 'right' : 'left');
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
            compact={isNavHidden}
            onClick={w.openSearch}
            items={getSarakSearchItems(nav)}
            onSelect={onNavigate ? (item) => onNavigate(item.id) : undefined}
        />
        : null);
    const showFontSize = w.preferencePlacement.pinned.includes('fontSize');
    const showNavigationStyle = w.preferencePlacement.pinned.includes('navigationStyle');
    const showLanguage = w.preferencePlacement.pinned.includes('language');
    // Sidebar recolhida (ícone-only) não tem coluna para o controle com rótulo —
    // mas a preferência continua oferecida (Spec 05 §2.3, "nada some"), então o ⚙
    // a recebe, mesmo quando nenhuma está em posição `menu` (que já a levaria).
    const collapsedExtras = w.preferencePlacement.pinned.filter((id) => id !== 'colorMode' && id !== 'navCollapsed');
    const menuIdsToShow = isNavHidden ? [...new Set([...w.preferencePlacement.menu, ...collapsedExtras])] : w.preferencePlacement.menu;
    const menuWidgets = (
        <>
            {w.showSearchInMenu && <SarakShellSearchWidget variant="icon" onClick={w.openSearch} />}
            {w.showUserInMenu && <ChromeUserWidget user={user} logout={logout} variant="vertical" />}
            {w.showNotificationsInMenu && <ChromeNotificationsWidget notifications={notifications} onSelect={onNotificationSelect} variant="vertical" />}
        </>
    );
    const hasPreferencesMenu = w.widgetPlacement.menu.length > 0 || menuIdsToShow.length > 0;

    return (
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            <div className={`relative flex flex-1 min-w-0 min-h-0 ${resolveChromeBodyDirectionClass(sidebarPosition)}`}>
                {isAutoHideEnabled && !isVisible && (
                    <div {...sensorProps} aria-hidden="true" className="fixed left-0 top-0 w-4 h-full z-[60] cursor-pointer" />
                )}
                {isVisible && (
                    <aside
                        {...surfaceProps}
                        ref={asideRef}
                        // Sem rolagem na barra inteira: só a lista de navegação rola (e só na vertical); o topo e o rodapé ficam fixos.
                        className={`relative flex flex-col shrink-0 overflow-hidden ${resize.width === null ? 'transition-[width,min-width] duration-[var(--duration-normal,0.3s)]' : ''} ${resolveChromeAsidePositionClass(sidebarPosition)}`}
                        style={{
                            // `zIndexSidebar`: o empilhamento da sidebar sobre o conteúdo (os popovers do cromo nascem dela).
                            zIndex: 'var(--sarak-z-sidebar, 500)',
                            width: isNavHidden
                                ? 'var(--sarak-sidebar-collapsed-width, 74px)'
                                : resize.width !== null ? `${resize.width}px` : 'var(--sarak-sidebar-width, 240px)',
                            // `sidebarMinWidth`/`sidebarMaxWidth` (Spec 05 §2.4) — limitam a
                            // largura efetiva mesmo sem redimensionamento por arraste (que o
                            // cromo apresentacional não tem). O piso é da lateral aberta: recolhida,
                            // quem manda é `sidebarCollapsedWidth` (um piso de 150 a manteria em 150+).
                            minWidth: isNavHidden ? 0 : 'var(--sidebar-min-width, 150px)',
                            maxWidth: 'var(--sidebar-max-width, 450px)',
                            margin: 'var(--sarak-tab-section-margin, 8px)',
                            height: 'calc(100% - (var(--sarak-tab-section-margin, 8px) * 2))',
                            background: resolveChromeBackground(sidebarBackgroundStyle, '--sarak-sidebar-bg', 'var(--theme-sidebar-bg, transparent)'),
                            ...resolveChromeSurfaceBorderStyle({
                                side: sidebarBorderSide,
                                style: sidebarBorderStyle,
                                widthVariable: '--sarak-sidebar-border-width',
                                colorVariable: '--sarak-sidebar-border-color',
                                surface: 'sidebar',
                                sidebarPosition,
                            }),
                            // `sidebarBlur`/`sidebarShadow` (Spec 05 §2.4) — sombra no lugar do shadow-2xl.
                            backdropFilter: 'blur(var(--sarak-sidebar-blur, 10px))',
                            boxShadow: 'var(--sarak-sidebar-shadow, 10px 0 30px rgba(0,0,0,0.5))', // sarak-allow-hardcode: fallback = defaultValue do token
                            ...resolveChromeToneStyle(sidebarTone, 'sidebar'),
                        }}
                    >
                        {/* `sidebarNoiseOpacity` (Spec 05 §2.4). */}
                        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay" style={chromeNoiseLayerStyle('--sarak-sidebar-noise-opacity', sidebarBackgroundStyle === 'texture')} />
                        <ChromeSidebarHeader
                            brand={brand}
                            logo={logo}
                            showBrand={sidebarLogoPlacement === 'top'}
                            collapsed={isNavHidden}
                            showCollapse={w.showCollapse}
                            onToggleCollapse={w.toggleNavHidden}
                        />
                        {/* Sem barra superior, `topbarStart`/`topbarEnd` degradam para topo/rodapé da sidebar. */}
                        <ChromeTopbarSlot region="start" className="px-2">{topbarStart}</ChromeTopbarSlot>
                        {searchPositionSidebar === 'top' && (
                            <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pb-2">{effectiveSearch}</ChromeSearchSlot>
                        )}
                        <ChromeSidebarSlot region="header">{sidebarHeader}</ChromeSidebarSlot>
                        {nav.length > 0 && (
                            <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={onNavigate} orientation="vertical" collapsed={isNavHidden} className="flex-1 min-h-0" />
                        )}
                        {searchPositionSidebar === 'bottom' && (
                            <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pt-2">{effectiveSearch}</ChromeSearchSlot>
                        )}
                        <ChromeSidebarFooter
                            brand={brand}
                            logo={logo}
                            showBrand={sidebarLogoPlacement === 'bottom'}
                            collapsed={isNavHidden}
                            endSlot={endSlot}
                            sidebarFooter={sidebarFooter}
                            user={user}
                            logout={logout}
                            notifications={notifications}
                            onNotificationSelect={onNotificationSelect}
                            showNotifications={w.showNotifications}
                            showThemeToggle={w.showThemeToggle}
                            showUser={w.showUser}
                            showFontSize={showFontSize}
                            showNavigationStyle={showNavigationStyle}
                            showLanguage={showLanguage}
                            hasPreferencesMenu={hasPreferencesMenu}
                            menuIds={menuIdsToShow}
                            menuWidgets={menuWidgets}
                            onToggleNavCollapsed={w.toggleNavHidden}
                        />
                        {sidebarResizable && !isNavHidden && (
                            <ChromeSidebarResizeHandle resize={resize} side={sidebarPosition === 'right' ? 'right' : 'left'} />
                        )}
                    </aside>
                )}
                <ChromeContentRegion
                    secondaryContent={secondaryContent}
                    isSplitViewEnabled={isSplitViewEnabled}
                    className={`relative flex-1 min-w-0 min-h-0 overflow-auto`}
                    style={{ color: 'var(--text-main, var(--theme-text-primary, inherit))', ...resolveChromeContentStyle(layoutDensity, maxContentWidth) }}
                >
                    {children}
                </ChromeContentRegion>
            </div>
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

export default ChromeSidebarBody;
