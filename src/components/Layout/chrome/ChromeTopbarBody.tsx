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
import { ChromeContentRegion } from './ChromeContentRegion';
import { ChromeBrand, ChromeSearchSlot, ChromeTopbarSlot } from './ChromeSlots';
import { ChromeCollapseToggle } from './ChromeCollapseToggle';
import { ChromeUserThemeGroup, ChromeUserWidget } from './ChromeUserThemeGroup';
import { ChromeNotificationsWidget, type SarakChromeNotification } from './ChromeNotificationsWidget';
import { resolveChromeBackground, resolveChromeContentStyle, resolveChromeNavbarLayoutClass, resolveChromeSurfaceBorderStyle } from './chromeStructuralStyles';
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
    secondaryContent?: React.ReactNode;
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
    brand, logo, nav, activeRoute, onNavigate, topbarStart, endSlot, secondaryContent,
    search, banner, footer, decoration, user, logout, notifications, onNotificationSelect, widgets, className, rootStyle, children,
}) => {
    const {
        navbarLayout, layoutDensity, maxContentWidth, isSplitViewEnabled, isNavHidden, isAutoHideEnabled,
        searchPositionTopbar, topbarBorderSide, topbarBorderStyle, topbarBackgroundStyle,
    } = useChromeDesignTokens();
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
    // `center`: a busca ocupa o meio do espaço livre entre a navegação e o grupo final (não o centro geométrico da barra);
    // por isso a navegação deixa de tomar o espaço (`flex-1`) e a busca vem depois dela, num contêiner que o toma.
    const isSearchCentered = searchPositionTopbar === 'center' && Boolean(effectiveSearch);
    // A busca é a primeira a ceder (fator de encolhimento 40). A barra padrão pede a largura de `w-64` para o contêiner medir a si
    // mesmo e some quando o contêiner fica abaixo do mínimo útil do campo, em vez de se desenhar quebrada por cima da marca;
    // busca do consumidor e ícone só encolhem.
    // sarak-allow-hardcode: o menor contêiner de container query nomeado do Tailwind (16rem) já é a largura inteira da barra; o mínimo útil do campo não tem nome nem token.
    const searchSlotClass = search || isNavHidden ? '[flex-shrink:40]' : '@container w-64 [flex-shrink:40] @max-[10rem]:[&>*]:hidden';
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
                    className={`relative flex items-center shrink-0 transition-[height] duration-[var(--duration-normal,0.3s)] ${resolveChromeNavbarLayoutClass(navbarLayout)}`}
                    style={{
                        height: isNavHidden ? 'var(--sarak-topbar-collapsed-height, 48px)' : 'var(--sarak-topbar-height, 64px)',
                        margin: 'var(--sarak-tab-section-margin, 8px)',
                        paddingInline: 'var(--sarak-layout-gap-md, 16px)',
                        gap: 'var(--sarak-layout-gap-md, 16px)',
                        background: resolveChromeBackground(topbarBackgroundStyle, '--sarak-topbar-bg', 'var(--theme-topbar-bg, var(--theme-sidebar-bg, transparent))'),
                        ...resolveChromeSurfaceBorderStyle({
                            side: topbarBorderSide,
                            style: topbarBorderStyle,
                            widthVariable: '--sarak-topbar-border-width',
                            colorVariable: '--sarak-topbar-border-color',
                            surface: 'topbar',
                        }),
                        backdropFilter: 'blur(var(--sarak-topbar-blur, 0px))',
                        boxShadow: 'var(--sarak-topbar-shadow, none)',
                    }}
                >
                    {/* `topbarNoiseOpacity` (Spec 05 §2.4). */}
                    <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay" style={chromeNoiseLayerStyle('--sarak-topbar-noise-opacity', topbarBackgroundStyle === 'texture')} />
                    {w.showCollapse && (
                        <ChromeCollapseToggle orientation="topbar" collapsed={isNavHidden} onToggle={w.toggleNavHidden} />
                    )}
                    <ChromeBrand brand={brand} logo={logo} horizontal compact={isNavHidden} />
                    <ChromeTopbarSlot region="start">{topbarStart}</ChromeTopbarSlot>
                    {searchPositionTopbar !== 'right' && !isSearchCentered && (
                        <ChromeSearchSlot position={searchPositionTopbar} className={searchSlotClass}>{effectiveSearch}</ChromeSearchSlot>
                    )}
                    {nav.length > 0 && (
                        // O item de navegação nunca fica menor que o texto: a lista pede o tamanho do conteúdo (`auto`) e cede depois da
                        // busca. Quando a barra aperta, cede primeiro a busca (fator de encolhimento 40; o grupo final é rígido e os rótulos
                        // dos widgets indisponíveis somem abaixo do breakpoint `2xl`); o que ainda faltar a lista absorve (fator 1) e rola, com cada
                        // item inteiro, e o grupo final nunca passa da borda da barra.
                        <div data-sarak-slot="nav" className={`flex min-w-0 ${isSearchCentered ? 'flex-[0_1_auto]' : 'flex-[1_1_auto]'}`}>
                            <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={onNavigate} orientation="horizontal" collapsed={isNavHidden} className={isSearchCentered ? 'w-full min-w-0' : 'flex-1 min-w-0'} />
                        </div>
                    )}
                    {isSearchCentered && (
                        <div data-sarak-slot="search-center" className="flex flex-1 shrink-0 justify-center">
                            <ChromeSearchSlot position={searchPositionTopbar}>{effectiveSearch}</ChromeSearchSlot>
                        </div>
                    )}
                    {/* Um único `ml-auto` no agrupador — dois irmãos com `ml-auto` dividiriam o
                        espaço livre entre si (regra de auto-margin do flexbox) e abririam um
                        vão indesejado entre a busca e o `topbarEnd` quando não há nav. */}
                    {showEndGroup && (
                        <div className="relative z-10 ml-auto flex items-center gap-2 min-w-0 shrink-0">
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
            <ChromeContentRegion
                secondaryContent={secondaryContent}
                isSplitViewEnabled={isSplitViewEnabled}
                className={`relative flex-1 min-w-0 min-h-0 overflow-auto`}
                style={{ color: 'var(--text-main, var(--theme-text-primary, inherit))', ...resolveChromeContentStyle(layoutDensity, maxContentWidth) }}
            >
                {children}
            </ChromeContentRegion>
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
