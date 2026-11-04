import React from 'react';
import { SarakShellLanguageSelector } from '../../atomic/Navigation/SarakShellLanguageSelector';
import { ShellFontSizeControl } from '../../atomic/Navigation/ShellFontSizeControl';
import { ShellNavigationStyleControl } from '../../atomic/Navigation/ShellNavigationStyleControl';
import { ShellPreferencesMenu } from '../../atomic/Navigation/ShellPreferencesMenu';
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
 * Rodapé FIXO da lateral: não rola com a lista de navegação. Recolhida, as preferências viram um único ícone que abre
 * o menu (os controles com rótulo não cabem em 74 px).
 */
export const ChromeSidebarFooter: React.FC<ChromeSidebarFooterProps> = (props) => {
    const { collapsed, showFontSize, showNavigationStyle, showLanguage } = props;
    return (
        <div data-sarak-sidebar-footer="true" className="relative z-10 flex shrink-0 flex-col min-w-0">
            {/* Markup preservado byte a byte do `topbarActions` no modo sidebar (compat). */}
            {props.endSlot && <div data-sarak-slot="topbarEnd" className="mt-auto p-2">{props.endSlot}</div>}
            {props.showBrand && <ChromeBrand brand={props.brand} logo={props.logo} compact={collapsed} />}
            <ChromeSidebarSlot region="footer">{props.sidebarFooter}</ChromeSidebarSlot>
            {props.showNotifications && (
                <ChromeNotificationsWidget notifications={props.notifications} onSelect={props.onNotificationSelect} variant={collapsed ? 'mini' : 'vertical'} />
            )}
            {!collapsed && (showFontSize || showNavigationStyle || showLanguage) && (
                <div className="flex flex-col gap-2 px-2 py-1">
                    {showFontSize && <ShellFontSizeControl />}
                    {showNavigationStyle && <ShellNavigationStyleControl />}
                    {showLanguage && <SarakShellLanguageSelector variant="horizontal" />}
                </div>
            )}
            <ChromeUserThemeGroup
                showThemeToggle={props.showThemeToggle}
                showUser={props.showUser}
                user={props.user}
                logout={props.logout}
                variant={collapsed ? 'mini' : 'vertical'}
            />
            {props.hasPreferencesMenu && (
                <div className="px-2 pb-1">
                    <ShellPreferencesMenu
                        menuIds={props.menuIds}
                        isNavHidden={collapsed}
                        onToggleNavCollapsed={props.onToggleNavCollapsed}
                        additionalRows={props.menuWidgets}
                        align="start"
                    />
                </div>
            )}
        </div>
    );
};

export default ChromeSidebarFooter;
