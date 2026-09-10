import { useCallback, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useSearchShortcut } from '../../../shared/hooks/useSearchShortcut';
import { isChromeWidgetEnabled, type SarakChromeWidgets } from './chromeWidgets';

export interface ChromeDefaultWidgetsState {
    /** Falso fora do `SarakUIProvider`. */
    hasProvider: boolean;
    showSearch: boolean;
    showThemeToggle: boolean;
    showUser: boolean;
    showCollapse: boolean;
    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    toggleNavHidden: () => void;
}

/**
 * Resolve o conjunto de widgets do cromo que nascem por padrão e o estado que eles
 * compartilham: a busca abre um único command palette (`SarakSearch`) por atalho
 * Ctrl/Cmd+K ou clique; o colapso lê/grava `design.isNavHidden` — o mesmo token que o
 * `SarakShell` já usa (`useSarakShellUI.ts`).
 *
 * Nenhum widget monta sem `SarakUIProvider`: todos dependem de estado do Design Engine
 * (tema ativo, `applyConfig`) que só existe dentro dele — sem Provider, o cromo
 * apresentacional se comporta exatamente como antes destes defaults.
 */
export const useChromeDefaultWidgets = (widgets: SarakChromeWidgets = {}): ChromeDefaultWidgetsState => {
    const sarak = useSarakUIOptional();
    const hasProvider = Boolean(sarak);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const openSearch = useCallback(() => setIsSearchOpen(true), []);
    const closeSearch = useCallback(() => setIsSearchOpen(false), []);
    useSearchShortcut(openSearch);

    const toggleNavHidden = useCallback(() => {
        sarak?.applyConfig({ isNavHidden: !sarak?.design?.isNavHidden });
    }, [sarak]);

    return {
        hasProvider,
        showSearch: hasProvider && isChromeWidgetEnabled(widgets.search),
        showThemeToggle: hasProvider && isChromeWidgetEnabled(widgets.themeToggle),
        showUser: hasProvider && isChromeWidgetEnabled(widgets.user),
        showCollapse: hasProvider && isChromeWidgetEnabled(widgets.collapse),
        isSearchOpen: hasProvider && isSearchOpen,
        openSearch,
        closeSearch,
        toggleNavHidden,
    };
};
