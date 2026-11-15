import React from 'react';
import { SarakShellLanguageSelector } from '../../atomic/Navigation/SarakShellLanguageSelector';
import { ShellFontSizeControl } from '../../atomic/Navigation/ShellFontSizeControl';
import { ShellNavigationStyleControl } from '../../atomic/Navigation/ShellNavigationStyleControl';
import { ShellPreferencesMenu } from '../../atomic/Navigation/ShellPreferencesMenu';
import { SarakShellThemeToggle } from '../../atomic/Navigation/SarakShellThemeToggle';
import { VERTICAL_NAV_GAP, VERTICAL_NAV_PADDING } from '../../atomic/Navigation/menuItemMetrics';
import type { SarakShellUser } from '../../atomic/Navigation/SarakShellUserWidget';
import type { SarakPreferenceId } from '../../../core/Provider/preferencesTypes';
import { ChromeBrand, ChromeSidebarSlot } from './ChromeSlots';
import { ChromeUserThemeGroup } from './ChromeUserThemeGroup';
import { ChromeNotificationsWidget, type SarakChromeNotification } from './ChromeNotificationsWidget';

export interface ChromeSidebarFooterProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    /** Marca na base (`sidebarLogoPlacement: 'bottom'`), acima do rodapé do consumidor. */
    showBrand: boolean;
    collapsed: boolean;
    endSlot?: React.ReactNode;
    sidebarFooter?: React.ReactNode;
    user?: SarakShellUser;
    logout?: () => void;
    notifications?: SarakChromeNotification[];
    onNotificationSelect?: (notification: SarakChromeNotification) => void;
    showNotifications: boolean;
    showThemeToggle: boolean;
    showUser: boolean;
    showFontSize: boolean;
    showNavigationStyle: boolean;
    showLanguage: boolean;
    hasPreferencesMenu: boolean;
    menuIds: SarakPreferenceId[];
    menuWidgets: React.ReactNode;
    onToggleNavCollapsed: () => void;
}

/**
 * Rodapé FIXO da lateral: não rola com a lista de navegação. Os controles são linhas com a métrica do item de menu, na
 * mesma coluna dos itens da lista: idioma e notificações (ícone, rótulo e indicador à direita), o modo quando fixado e o ⚙
 * em linha própria; abaixo, a faixa do usuário. Recolhida, cada controle é só o ícone, centrado no eixo da lista, e o que
 * não cabe sem rótulo vai para o menu ⚙.
 */
export const ChromeSidebarFooter: React.FC<ChromeSidebarFooterProps> = (props) => {
    const { collapsed, showFontSize, showNavigationStyle, showLanguage } = props;
    const showControls = !collapsed && (showFontSize || showNavigationStyle);
    const hasRows = showControls || (!collapsed && showLanguage) || props.showNotifications || props.showThemeToggle || props.hasPreferencesMenu;
    return (
        <div data-sarak-sidebar-footer="true" className="relative z-10 flex shrink-0 flex-col min-w-0">
            {/* Markup preservado byte a byte do `topbarActions` no modo sidebar (compat). */}
            {props.endSlot && <div data-sarak-slot="topbarEnd" className="mt-auto p-2">{props.endSlot}</div>}
            {props.showBrand && <ChromeBrand brand={props.brand} logo={props.logo} compact={collapsed} />}
            <ChromeSidebarSlot region="footer">{props.sidebarFooter}</ChromeSidebarSlot>
            {hasRows && (
                <div
                    data-sarak-footer-rows="true"
                    className="flex flex-col"
                    style={{ paddingInline: VERTICAL_NAV_PADDING, paddingBlock: VERTICAL_NAV_GAP, gap: VERTICAL_NAV_GAP }}
                >
                    {showControls && (
                        <div className="flex flex-col" style={{ gap: VERTICAL_NAV_GAP }}>
                            {showFontSize && <ShellFontSizeControl />}
                            {showNavigationStyle && <ShellNavigationStyleControl />}
                        </div>
                    )}
                    {!collapsed && showLanguage && <SarakShellLanguageSelector variant="vertical" />}
                    {props.showNotifications && (
                        <ChromeNotificationsWidget notifications={props.notifications} onSelect={props.onNotificationSelect} variant={collapsed ? 'mini' : 'vertical'} />
                    )}
                    {props.showThemeToggle && <SarakShellThemeToggle variant={collapsed ? 'mini' : 'vertical'} />}
                    {props.hasPreferencesMenu && (
                        <ShellPreferencesMenu
                            variant="row"
                            menuIds={props.menuIds}
                            isNavHidden={collapsed}
                            onToggleNavCollapsed={props.onToggleNavCollapsed}
                            additionalRows={props.menuWidgets}
                            align="start"
                        />
                    )}
                </div>
            )}
            <ChromeUserThemeGroup
                showThemeToggle={false}
                showUser={props.showUser}
                user={props.user}
                logout={props.logout}
                variant={collapsed ? 'mini' : 'vertical'}
            />
        </div>
    );
};

export default ChromeSidebarFooter;
