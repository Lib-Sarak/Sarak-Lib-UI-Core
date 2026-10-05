import { useCallback, useEffect, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useSearchShortcut } from '../../../shared/hooks/useSearchShortcut';
import {
    splitChromeWidgetsByPlacement,
    type ChromePreferencesPlacement,
    type ChromeWidgetsPlacement,
} from '../../../core/Provider/utils/chromePreferencePlacement';
import { isChromeWidgetEnabled, type SarakChromeWidgets } from './chromeWidgets';
import { PREFERENCE_IDS, type SarakChromeWidgetId, type SarakPreferenceId } from '../../../core/Provider/preferencesTypes';

export interface ChromeDefaultWidgetsOptions {
    /** O consumidor trouxe o próprio `search`? Com ele, a busca — e o atalho — são do
     * consumidor, não da lib: o default (widget + atalho + `SarakSearch`) fica fora. */
    hasCustomSearch?: boolean;
    /** O consumidor entregou uma identidade para o widget de usuário? */
    hasUser?: boolean;
    hasLogout?: boolean;
    hasNotifications?: boolean;
    hasNotificationHandler?: boolean;
}

export interface ChromeDefaultWidgetsState {
    /** Falso fora do `SarakUIProvider`. */
    hasProvider: boolean;
    showSearch: boolean;
    showSearchInMenu: boolean;
    showSearchOffered: boolean;
    showThemeToggle: boolean;
    showUser: boolean;
    showUserInMenu: boolean;
    showUserOffered: boolean;
    showNotifications: boolean;
    showNotificationsInMenu: boolean;
    showNotificationsOffered: boolean;
    showCollapse: boolean;
    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    toggleNavHidden: () => void;
    /** Onde cada preferência aparece na barra (Spec 05 — barra configurável pelo
     *  administrador): `pinned` já respeita o teto de `widgets.themeToggle`/
     *  `widgets.collapse`; `menu` é o conteúdo do ⚙ "Preferências" (fixadas
     *  inclusive). Vazio fora do `SarakUIProvider` — nenhum widget default monta ali. */
    preferencePlacement: ChromePreferencesPlacement;
    widgetPlacement: ChromeWidgetsPlacement;
}

const WARNED_WIDGET_CONFIGURATIONS = new Set<string>();

const isPreferenceId = (id: SarakChromeWidgetId): id is SarakPreferenceId =>
    (PREFERENCE_IDS as readonly SarakChromeWidgetId[]).includes(id);

const EMPTY_WIDGET_PLACEMENT: ChromeWidgetsPlacement = { pinned: [], offered: [], menu: [] };

const resolveWidgetPlacement = (
    hasProvider: boolean,
    design: Record<string, unknown> | undefined,
    widgets: SarakChromeWidgets,
): ChromeWidgetsPlacement => {
    if (!hasProvider) return EMPTY_WIDGET_PLACEMENT;
    return splitChromeWidgetsByPlacement(design, {
        search: isChromeWidgetEnabled(widgets.search) && design?.chromeSearchPosition !== 'off',
        colorMode: isChromeWidgetEnabled(widgets.themeToggle),
        navCollapsed: isChromeWidgetEnabled(widgets.collapse),
        user: isChromeWidgetEnabled(widgets.user) && design?.chromeUserPosition !== 'off',
        notifications: isChromeWidgetEnabled(widgets.notifications) && design?.chromeNotificationsPosition !== 'off',
    });
};

const resolvePreferencePlacement = (placement: ChromeWidgetsPlacement): ChromePreferencesPlacement => ({
    pinned: placement.pinned.filter(isPreferenceId),
    offered: placement.offered.filter(isPreferenceId),
    menu: placement.menu.filter(isPreferenceId),
});

const resolveWidgetVisibility = (
    placement: ChromeWidgetsPlacement,
    hasCustomSearch: boolean,
): Pick<ChromeDefaultWidgetsState,
    | 'showSearch'
    | 'showSearchInMenu'
    | 'showSearchOffered'
    | 'showThemeToggle'
    | 'showUser'
    | 'showUserInMenu'
    | 'showUserOffered'
    | 'showNotifications'
    | 'showNotificationsInMenu'
    | 'showNotificationsOffered'
> => {
    const showSearchOffered = !hasCustomSearch && placement.offered.includes('search');
    return {
        showSearch: showSearchOffered && placement.pinned.includes('search'),
        showSearchInMenu: showSearchOffered && placement.menu.includes('search'),
        showSearchOffered,
        showThemeToggle: placement.pinned.includes('colorMode'),
        showUser: placement.pinned.includes('user'),
        showUserInMenu: placement.menu.includes('user'),
        showUserOffered: placement.offered.includes('user'),
        showNotifications: placement.pinned.includes('notifications'),
        showNotificationsInMenu: placement.menu.includes('notifications'),
        showNotificationsOffered: placement.offered.includes('notifications'),
    };
};

const getMissingWidgetConnections = (options: ChromeDefaultWidgetsOptions, placement: ChromeWidgetsPlacement): string[] => {
    const missing: string[] = [];
    if (placement.offered.includes('user')) {
        if (!options.hasUser) missing.push('user');
        if (!options.hasLogout) missing.push('logout');
    }
    if (placement.offered.includes('notifications')) {
        if (!options.hasNotifications) missing.push('notifications com itens');
        if (!options.hasNotificationHandler) missing.push('onNotificationSelect');
    }
    return missing;
};

const warnAboutMissingWidgetConnections = (missing: string[]): void => {
    if (process.env.NODE_ENV === 'production' || missing.length === 0) return;
    const warningKey = missing.join('|');
    if (WARNED_WIDGET_CONFIGURATIONS.has(warningKey)) return;
    WARNED_WIDGET_CONFIGURATIONS.add(warningKey);
    console.warn(`[Sarak] Conecte ${missing.join(', ')} ao SarakAppChrome para ativar os widgets correspondentes.`);
};

const useMissingWidgetConnectionWarning = (
    options: ChromeDefaultWidgetsOptions,
    placement: ChromeWidgetsPlacement,
): void => {
    const warningKey = getMissingWidgetConnections(options, placement).join('|');
    useEffect(() => {
        warnAboutMissingWidgetConnections(warningKey ? warningKey.split('|') : []);
    }, [warningKey]);
};

/**
 * Resolve o conjunto de widgets do cromo que nascem por padrão e o estado que eles
 * compartilham. A busca só está "em uso" — e só aí o atalho Ctrl/Cmd+K é escutado e o
 * `SarakSearch` (command palette) monta — quando o widget está ligado, há
 * `SarakUIProvider` **e** o consumidor não trouxe o próprio `search`; com o slot
 * preenchido, o teclado continua livre para o navegador e para o que o consumidor
 * montou ali. Usuário e notificações permanecem visíveis sem conexão, com estado
 * desabilitado. O colapso lê e grava `design.isNavHidden`.
 *
 * Nenhum widget monta sem `SarakUIProvider`: todos dependem de estado do Design Engine
 * (tema ativo, `applyConfig`) que só existe dentro dele.
 */
export const useChromeDefaultWidgets = (
    widgets: SarakChromeWidgets = {},
    options: ChromeDefaultWidgetsOptions = {},
): ChromeDefaultWidgetsState => {
    const sarak = useSarakUIOptional();
    const hasProvider = Boolean(sarak);
    const design = sarak?.design as unknown as Record<string, unknown> | undefined;
    const widgetPlacement = resolveWidgetPlacement(hasProvider, design, widgets);
    const preferencePlacement = resolvePreferencePlacement(widgetPlacement);
    const visibility = resolveWidgetVisibility(widgetPlacement, options.hasCustomSearch ?? false);
    useMissingWidgetConnectionWarning(options, widgetPlacement);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const openSearch = useCallback(() => setIsSearchOpen(true), []);
    const closeSearch = useCallback(() => setIsSearchOpen(false), []);
    useSearchShortcut(openSearch, visibility.showSearchOffered);

    // Grava PREFERÊNCIA de recolhimento, nunca o tema — `sarak.design` já é o
    // EFETIVO (tema + preferência sobreposta), então o valor lido aqui é o mesmo
    // que aparece na tela.
    const toggleNavHidden = useCallback(() => {
        sarak?.updatePreferences({ navCollapsed: !sarak?.design?.isNavHidden });
    }, [sarak]);

    // `colorMode`/`navCollapsed` já eram widget antes desta barra existir — o teto de
    // código continua vencendo a posição do tema (Spec 05 §2.2.1); as outras três
    // preferências não têm teto, só a posição decide.
    return {
        hasProvider,
        ...visibility,
        showCollapse: preferencePlacement.pinned.includes('navCollapsed'),
        isSearchOpen: visibility.showSearchOffered && isSearchOpen,
        openSearch,
        closeSearch,
        toggleNavHidden,
        preferencePlacement,
        widgetPlacement,
    };
};
