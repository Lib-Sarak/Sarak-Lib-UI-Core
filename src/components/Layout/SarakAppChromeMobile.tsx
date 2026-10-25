import React, { useEffect, useState } from 'react';
import { SarakShellNav, type SarakShellNavItem } from '../atomic/Navigation/SarakShellNav';
import { SarakIcon } from '../atomic/Icon/SarakIcon';
import { SarakShellSearchWidget } from '../atomic/Navigation/SarakShellSearchWidget';
import { SarakSearch } from '../atomic/Inputs/SarakSearch';
import { useFocusTrap } from '../atomic/Modals/hooks/useFocusTrap';
import { SarakIconButton } from '../atomic/Buttons/SarakIconButton';
import type { SarakShellUser } from '../atomic/Navigation/SarakShellUserWidget';
import { renderShellPreferenceRow } from '../atomic/Navigation/shellPreferenceRow';
import { useLibraryText } from '../../core/i18n/useLibraryText';
import { ChromeFrame } from './chrome/ChromeFrame';
import { ChromeContentRegion } from './chrome/ChromeContentRegion';
import { ChromeBrand, ChromeSearchSlot, ChromeSidebarSlot, ChromeTopbarSlot } from './chrome/ChromeSlots';
import { ChromeUserThemeGroup } from './chrome/ChromeUserThemeGroup';
import { ChromeBottomNav } from './chrome/ChromeBottomNav';
import { ChromeMobileDrawer } from './chrome/ChromeMobileDrawer';
import { chromeNoiseLayerStyle } from './chrome/noiseTexture';
import { resolveMobileNavigationMode } from './chrome/mobileNavigation';
import { ChromeNotificationsWidget, type SarakChromeNotification } from './chrome/ChromeNotificationsWidget';
import {
    resolveChromeBackground,
    resolveChromeContentStyle,
    resolveChromeSurfaceBorderStyle,
} from './chrome/chromeStructuralStyles';
import { useChromeDesignTokens } from './chrome/useChromeDesignTokens';
import { useChromeDefaultWidgets } from './chrome/useChromeDefaultWidgets';
import type { SarakChromeWidgets } from './chrome/chromeWidgets';
import { getSarakSearchItems } from './chrome/navItem';

/**
 * Cromo móvel com barra compacta, navegação por drawer e foco acessível.
 * Os slots de sidebar migram para a gaveta; os de topo ficam junto da marca.
 * `mobileNavigationStyle` decide entre drawer, barra inferior ou seleção automática.
 */
export interface SarakAppChromeMobileProps {
    children: React.ReactNode;
    secondaryContent?: React.ReactNode;
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    nav: SarakShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    /** Slot `topbarEnd` (alias legado `topbarActions`) — fim da barra compacta. */
    topbarActions?: React.ReactNode;
    /** Slot `topbarStart` — início da barra compacta, logo após a marca. */
    topbarStart?: React.ReactNode;
    /** Slot `search` — posicionado por `searchPositionSidebar` (é onde a sidebar existe no celular: o drawer). */
    search?: React.ReactNode;
    /** Slot `sidebarHeader` — migra para o topo do drawer (a sidebar do celular). */
    sidebarHeader?: React.ReactNode;
    /** Slot `sidebarFooter` — migra para o rodapé do drawer. */
    sidebarFooter?: React.ReactNode;
    /** Slot `banner` — faixa full-width no topo. */
    banner?: React.ReactNode;
    /** Slot `footer` — faixa full-width na base. */
    footer?: React.ReactNode;
    /** Slot `decoration` — camada decorativa atrás do cromo (aria-hidden, sem foco/toque). */
    decoration?: React.ReactNode;
    /** Identidade exibida no widget de usuário default, no rodapé do drawer. */
    user?: SarakShellUser;
    logout?: () => void;
    notifications?: SarakChromeNotification[];
    onNotificationSelect?: (notification: SarakChromeNotification) => void;
    /** Opt-out dos widgets default; o hambúrguer continua controlando a navegação no celular. */
    widgets?: SarakChromeWidgets;
    className?: string;
    rootStyle: React.CSSProperties;
}

const DRAWER_ID = 'sarak-chrome-drawer';

export const SarakAppChromeMobile: React.FC<SarakAppChromeMobileProps> = ({
    children,
    secondaryContent,
    brand,
    logo,
    nav,
    activeRoute,
    onNavigate,
    topbarActions,
    topbarStart,
    search,
    sidebarHeader,
    sidebarFooter,
    banner,
    footer,
    decoration,
    user,
    logout,
    notifications,
    onNotificationSelect,
    widgets,
    className = '',
    rootStyle,
}) => {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const { containerRef, handleTrap } = useFocusTrap(open, close);
    const {
        layoutDensity, maxContentWidth, isSplitViewEnabled, searchPositionSidebar, mobileNavigationStyle,
        sidebarBorderSide, sidebarBorderStyle, sidebarBackgroundStyle, topbarBorderSide, topbarBorderStyle, topbarBackgroundStyle,
    } = useChromeDesignTokens();
    const navOnBottom = resolveMobileNavigationMode(mobileNavigationStyle, nav.length) === 'bottom';
    const t = useLibraryText();
    const w = useChromeDefaultWidgets(widgets, {
        hasCustomSearch: Boolean(search),
        hasUser: Boolean(user),
        hasLogout: Boolean(logout),
        hasNotifications: Boolean(notifications?.length),
        hasNotificationHandler: Boolean(onNotificationSelect),
    });
    const searchableItems = getSarakSearchItems(nav);
    const effectiveSearch = search ?? (w.showSearchOffered
        ? <SarakShellSearchWidget
            variant="bar"
            onClick={w.openSearch}
            items={searchableItems}
            onSelect={onNavigate ? (item) => handleSelect(item.id) : undefined}
        />
        : null);
    // No celular tudo o que é OFERECIDO vai para o drawer, fixado ou não (Spec 05 §2.3)
    // — não há distinção de "botão direto vs. dentro do ⚙" quando só existe uma barra.
    // `navCollapsed` fica de fora: o próprio hambúrguer já é o controle de colapso aqui.
    const mobileShowThemeToggle = w.preferencePlacement.offered.includes('colorMode');
    const extraPreferenceRows = w.preferencePlacement.offered.filter((id) => id !== 'colorMode' && id !== 'navCollapsed');
    // A marca aparece na barra compacta E no topo do drawer (mesma variante
    // horizontal nos dois — sempre foi assim).
    const brandNode = <ChromeBrand brand={brand} logo={logo} horizontal />;

    // Trava o scroll do corpo enquanto o drawer está aberto (não vaza rolagem por baixo).
    useEffect(() => {
        if (!open) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [open]);

    const handleSelect = (route: string) => {
        close();
        onNavigate?.(route);
    };

    return (
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            <header
                className="relative flex items-center shrink-0"
                style={{
                    height: 'var(--sarak-topbar-height, 64px)',
                    gap: 'var(--sarak-layout-gap-sm, 8px)',
                    paddingInline: 'var(--sarak-layout-gap-md, 16px)',
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
                <SarakIconButton
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={DRAWER_ID}
                    aria-label={open ? t('mobileMenuCloseAriaLabel') : t('mobileMenuOpenAriaLabel')}
                    className="relative z-10 shrink-0 rounded-[var(--sarak-card-radius,10px)] cursor-pointer text-[var(--sarak-text-main,var(--theme-text-primary,inherit))] hover:bg-[var(--sarak-card-bg,#101622)]"
                    style={{ width: 'var(--sarak-topbar-height, 56px)', height: 'var(--sarak-topbar-height, 56px)' }}
                    icon={<SarakIcon name={open ? 'X' : 'Menu'} size={22} />}
                />
                {brandNode}
                <ChromeTopbarSlot region="start" className="overflow-hidden">{topbarStart}</ChromeTopbarSlot>
                {topbarActions && <div data-sarak-slot="topbarEnd" className="relative z-10 flex items-center gap-2 shrink-0 ml-auto">{topbarActions}</div>}
                <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay" style={chromeNoiseLayerStyle('--sarak-topbar-noise-opacity', topbarBackgroundStyle === 'texture')} />
            </header>

            <ChromeMobileDrawer
                isOpen={open}
                drawerId={DRAWER_ID}
                onClose={close}
                onKeyDown={handleTrap}
                containerRef={containerRef}
                closeLabel={t('mobileMenuCloseAriaLabel')}
                backgroundStyle={sidebarBackgroundStyle}
                borderSide={sidebarBorderSide}
                borderStyle={sidebarBorderStyle}
            >
                {brand && <div className="px-2 py-3">{brandNode}</div>}
                {/* É onde a sidebar existe no celular — segue `searchPositionSidebar`. */}
                {searchPositionSidebar === 'top' && <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pb-2">{effectiveSearch}</ChromeSearchSlot>}
                <ChromeSidebarSlot region="header">{sidebarHeader}</ChromeSidebarSlot>
                {navOnBottom
                    ? <div aria-hidden="true" className="flex-1" />
                    : <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={handleSelect} orientation="vertical" className="flex-1" />}
                {searchPositionSidebar === 'bottom' && <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pt-2">{effectiveSearch}</ChromeSearchSlot>}
                <ChromeSidebarSlot region="footer">{sidebarFooter}</ChromeSidebarSlot>
                <ChromeUserThemeGroup
                    showThemeToggle={mobileShowThemeToggle}
                    showUser={w.showUserOffered}
                    user={user}
                    logout={logout}
                    variant="vertical"
                />
                {w.showNotificationsOffered && (
                    <ChromeNotificationsWidget notifications={notifications} onSelect={onNotificationSelect} variant="vertical" />
                )}
                {extraPreferenceRows.map((id) => renderShellPreferenceRow(id, {
                    isNavHidden: false,
                    onToggleNavCollapsed: w.toggleNavHidden,
                    t,
                }))}
            </ChromeMobileDrawer>

            <ChromeContentRegion
                secondaryContent={secondaryContent}
                isSplitViewEnabled={isSplitViewEnabled}
                className={`relative flex-1 min-w-0 min-h-0 overflow-auto`}
                style={{ color: 'var(--text-main, var(--theme-text-primary, inherit))', ...resolveChromeContentStyle(layoutDensity, maxContentWidth) }}
            >
                {children}
            </ChromeContentRegion>
            {navOnBottom && <ChromeBottomNav items={nav} activeRoute={activeRoute} onNavigate={onNavigate} />}
            {w.showSearchOffered && (
                <SarakSearch
                    isOpen={w.isSearchOpen}
                    onClose={w.closeSearch}
                    items={searchableItems}
                    onSelect={onNavigate ? handleSelect : undefined}
                />
            )}
        </ChromeFrame>
    );
};

export default SarakAppChromeMobile;
