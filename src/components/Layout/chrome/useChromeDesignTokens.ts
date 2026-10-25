import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { resolveMaxContentWidth } from '../../../core/Design/schema/system';
import { resolveMobileNavigationStyle, type ChromeMobileNavigationStyle } from './mobileNavigation';
import { useNavigationAppearance, type NavigationAppearance } from '../../../core/Provider/useNavigationAppearance';

export type ChromeSidebarPosition = 'left' | 'right' | 'floating';
export type ChromeNavbarLayout = 'sticky' | 'inline' | 'hidden';
export type ChromeLayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type ChromeSearchPositionSidebar = 'top' | 'bottom';
export type ChromeSearchPositionTopbar = 'left' | 'center' | 'right' | 'hidden';

export interface ChromeDesignTokens extends NavigationAppearance {
    sidebarPosition: ChromeSidebarPosition;
    navbarLayout: ChromeNavbarLayout;
    layoutDensity: ChromeLayoutDensity;
    maxContentWidth: string;
    isSplitViewEnabled: boolean;
    isNavHidden: boolean;
    isAutoHideEnabled: boolean;
    searchPositionSidebar: ChromeSearchPositionSidebar;
    searchPositionTopbar: ChromeSearchPositionTopbar;
    mobileNavigationStyle: ChromeMobileNavigationStyle;
}

const resolveSidebarSearchPosition = (value: unknown): ChromeSearchPositionSidebar =>
    value === 'bottom' ? 'bottom' : 'top';

const resolveLayoutDensity = (value: unknown): ChromeLayoutDensity =>
    value === 'compact' || value === 'spacious' ? value : 'comfortable';

/**
 * Leitura tolerante (Spec 18) dos tokens de cromo que `SarakAppChrome` passou a
 * consumir além de `navigationStyle` — que já tem porta própria,
 * `useNavigationStyle`, e não é repetida aqui. Degrada para o default do schema
 * fora do `SarakUIProvider` ou quando o tema não define o token — o mesmo
 * comportamento de hoje (`token.defaultValue`, `useDesignVariables.ts:72`).
 */
export const useChromeDesignTokens = (): ChromeDesignTokens => {
    const design = useSarakUIOptional()?.design;
    const navigationAppearance = useNavigationAppearance();
    return {
        ...navigationAppearance,
        sidebarPosition: (design?.sidebarPosition as ChromeSidebarPosition) || 'left',
        navbarLayout: (design?.navbarLayout as ChromeNavbarLayout) || 'sticky',
        layoutDensity: resolveLayoutDensity(design?.layoutDensity),
        maxContentWidth: resolveMaxContentWidth(design?.maxContentWidth),
        isSplitViewEnabled: design?.isSplitViewEnabled ?? false,
        isNavHidden: design?.isNavHidden ?? false,
        isAutoHideEnabled: design?.isAutoHideEnabled ?? false,
        searchPositionSidebar: resolveSidebarSearchPosition(design?.searchPositionSidebar),
        searchPositionTopbar: (design?.searchPositionTopbar as ChromeSearchPositionTopbar) || 'left',
        mobileNavigationStyle: resolveMobileNavigationStyle(design?.mobileNavigationStyle),
    };
};
