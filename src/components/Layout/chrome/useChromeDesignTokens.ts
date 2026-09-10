import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';

export type ChromeSidebarPosition = 'left' | 'right' | 'floating';
export type ChromeNavbarLayout = 'sticky' | 'inline' | 'hidden';
export type ChromeContentAlignment = 'stretch' | 'center';
export type ChromeSearchPositionSidebar = 'top' | 'bottom' | 'hidden';
export type ChromeSearchPositionTopbar = 'left' | 'center' | 'right' | 'hidden';

export interface ChromeDesignTokens {
    sidebarPosition: ChromeSidebarPosition;
    navbarLayout: ChromeNavbarLayout;
    contentAlignment: ChromeContentAlignment;
    isNavHidden: boolean;
    isAutoHideEnabled: boolean;
    searchPositionSidebar: ChromeSearchPositionSidebar;
    searchPositionTopbar: ChromeSearchPositionTopbar;
}

/**
 * Leitura tolerante (Spec 18) dos tokens de cromo que `SarakAppChrome` passou a
 * consumir além de `navigationStyle` — que já tem porta própria,
 * `useNavigationStyle`, e não é repetida aqui. Degrada para o default do schema
 * fora do `SarakUIProvider` ou quando o tema não define o token — o mesmo
 * comportamento de hoje (`token.defaultValue`, `useDesignVariables.ts:72`).
 */
export const useChromeDesignTokens = (): ChromeDesignTokens => {
    const design = useSarakUIOptional()?.design;
    return {
        sidebarPosition: (design?.sidebarPosition as ChromeSidebarPosition) || 'left',
        navbarLayout: (design?.navbarLayout as ChromeNavbarLayout) || 'sticky',
        contentAlignment: (design?.contentAlignment as ChromeContentAlignment) || 'stretch',
        isNavHidden: design?.isNavHidden ?? false,
        isAutoHideEnabled: design?.isAutoHideEnabled ?? false,
        searchPositionSidebar: (design?.searchPositionSidebar as ChromeSearchPositionSidebar) || 'top',
        searchPositionTopbar: (design?.searchPositionTopbar as ChromeSearchPositionTopbar) || 'left',
    };
};
