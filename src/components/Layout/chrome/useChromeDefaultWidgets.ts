import { useCallback, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useSearchShortcut } from '../../../shared/hooks/useSearchShortcut';
import { isChromeWidgetEnabled, type SarakChromeWidgets } from './chromeWidgets';

export interface ChromeDefaultWidgetsOptions {
    /** O consumidor trouxe o próprio `search`? Com ele, a busca — e o atalho — são do
     * consumidor, não da lib: o default (widget + atalho + `SarakSearch`) fica fora. */
    hasCustomSearch?: boolean;
    /** O host entregou `user`? Sem identidade, o widget de usuário não tem o que
     * mostrar — nasce sem montar, em vez de inventar um nome. */
    hasUser?: boolean;
}

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
 * compartilham. A busca só está "em uso" — e só aí o atalho Ctrl/Cmd+K é escutado e o
 * `SarakSearch` (command palette) monta — quando o widget está ligado, há
 * `SarakUIProvider` **e** o consumidor não trouxe o próprio `search`; com o slot
 * preenchido, o teclado continua livre para o navegador e para o que o consumidor
 * montou ali. O widget de usuário, do mesmo jeito, só liga com `user` de verdade. O
 * colapso lê/grava `design.isNavHidden` — o mesmo token que o `SarakShell` já usa
 * (`useSarakShellUI.ts`).
 *
 * Nenhum widget monta sem `SarakUIProvider`: todos dependem de estado do Design Engine
 * (tema ativo, `applyConfig`) que só existe dentro dele.
 */
export const useChromeDefaultWidgets = (
    widgets: SarakChromeWidgets = {},
    options: ChromeDefaultWidgetsOptions = {},
): ChromeDefaultWidgetsState => {
    const { hasCustomSearch = false, hasUser = false } = options;
    const sarak = useSarakUIOptional();
    const hasProvider = Boolean(sarak);
    const showSearch = hasProvider && isChromeWidgetEnabled(widgets.search) && !hasCustomSearch;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const openSearch = useCallback(() => setIsSearchOpen(true), []);
    const closeSearch = useCallback(() => setIsSearchOpen(false), []);
    useSearchShortcut(openSearch, showSearch);

    const toggleNavHidden = useCallback(() => {
        sarak?.applyConfig({ isNavHidden: !sarak?.design?.isNavHidden });
    }, [sarak]);

    return {
        hasProvider,
        showSearch,
        showThemeToggle: hasProvider && isChromeWidgetEnabled(widgets.themeToggle),
        showUser: hasProvider && isChromeWidgetEnabled(widgets.user) && hasUser,
        showCollapse: hasProvider && isChromeWidgetEnabled(widgets.collapse),
        isSearchOpen: showSearch && isSearchOpen,
        openSearch,
        closeSearch,
        toggleNavHidden,
    };
};
