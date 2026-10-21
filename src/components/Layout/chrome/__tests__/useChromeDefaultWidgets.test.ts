import React from 'react';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useChromeDefaultWidgets } from '../useChromeDefaultWidgets';

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement(SarakUIProvider, null, children);

const menuWrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => React.createElement(
    SarakUIProvider,
    {
        config: {
            preferenceFontSizePosition: 'menu',
            preferenceNavigationStylePosition: 'menu',
            preferenceLanguagePosition: 'menu',
        },
        children,
    },
);

const pressCtrlK = (): void => {
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
};

describe('defaults do cromo', () => {
    it('avisa uma vez para uma conexão ausente mesmo após remontar o cromo', () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const firstMount = renderHook(
            () => useChromeDefaultWidgets(undefined, { hasNotifications: true }),
            { wrapper },
        );
        firstMount.unmount();
        renderHook(() => useChromeDefaultWidgets(undefined, { hasNotifications: true }), { wrapper });
        expect(warning).toHaveBeenCalledTimes(1);
        expect(warning.mock.calls[0][0]).toContain('onNotificationSelect');
        warning.mockRestore();
    });

    it('com Provider e `hasUser: true`, liga os defaults e oferece as preferências', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(undefined, { hasUser: true }), { wrapper });
        expect(result.current.hasProvider).toBe(true);
        expect(result.current.showSearch).toBe(true);
        expect(result.current.showThemeToggle).toBe(true);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
        expect(result.current.widgetPlacement.pinned).toEqual(expect.arrayContaining([
            'fontSize', 'navigationStyle', 'language',
        ]));
    });
});

describe('degradação sem Provider', () => {
    it('não liga defaults nem registra a busca', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets());
        expect(result.current.hasProvider).toBe(false);
        expect(result.current.showSearch).toBe(false);
        expect(result.current.showThemeToggle).toBe(false);
        expect(result.current.showUser).toBe(false);
        expect(result.current.showCollapse).toBe(false);
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('deixa Ctrl/Cmd+K livre para o navegador', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets());
        pressCtrlK();
        expect(result.current.isSearchOpen).toBe(false);
    });
});

describe('teto dos widgets de preferência', () => {
    it.each(['fontSize', 'navigationStyle', 'language'] as const)(
        '`widgets.%s: false` remove a preferência da barra e do menu',
        (id) => {
            const widgets = { [id]: false };
            const { result: pinnedResult } = renderHook(() => useChromeDefaultWidgets(widgets), { wrapper });
            const { result: menuResult } = renderHook(() => useChromeDefaultWidgets(widgets), { wrapper: menuWrapper });
            const { result: defaultMenuResult } = renderHook(() => useChromeDefaultWidgets(), { wrapper: menuWrapper });

            expect(pinnedResult.current.widgetPlacement.pinned).not.toContain(id);
            expect(pinnedResult.current.widgetPlacement.menu).not.toContain(id);
            expect(menuResult.current.widgetPlacement.pinned).not.toContain(id);
            expect(menuResult.current.widgetPlacement.menu).not.toContain(id);
            expect(defaultMenuResult.current.widgetPlacement.menu).toContain(id);
        },
    );
});

describe('opt-out dos widgets padrão', () => {
    it('`false` isolado desliga só aquele campo', () => {
        const { result } = renderHook(
            () => useChromeDefaultWidgets({ themeToggle: false }, { hasUser: true }),
            { wrapper },
        );
        expect(result.current.showThemeToggle).toBe(false);
        expect(result.current.showSearch).toBe(true);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
    });

    it('sem `hasUser`, oferece o widget para renderizar o estado desabilitado', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        expect(result.current.showUser).toBe(true);
        expect(result.current.showUserOffered).toBe(true);
    });

    it('`widgets.user: false` desliga mesmo com `hasUser: true`', () => {
        const { result } = renderHook(
            () => useChromeDefaultWidgets({ user: false }, { hasUser: true }),
            { wrapper },
        );
        expect(result.current.showUser).toBe(false);
    });
});

describe('ações do cromo', () => {
    it('openSearch/closeSearch alternam isSearchOpen', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        expect(result.current.isSearchOpen).toBe(false);
        act(() => result.current.openSearch());
        expect(result.current.isSearchOpen).toBe(true);
        act(() => result.current.closeSearch());
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('toggleNavHidden inverte design.isNavHidden', () => {
        const { result } = renderHook(() => {
            const widgets = useChromeDefaultWidgets();
            const { design } = useSarakUI();
            return { widgets, isNavHidden: design?.isNavHidden };
        }, { wrapper });
        expect(result.current.isNavHidden).toBeFalsy();
        act(() => result.current.widgets.toggleNavHidden());
        expect(result.current.isNavHidden).toBe(true);
        act(() => result.current.widgets.toggleNavHidden());
        expect(result.current.isNavHidden).toBe(false);
    });
});

describe('atalho Ctrl/Cmd+K', () => {
    it('widgets.search=false desarma o atalho', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets({ search: false }), { wrapper });
        expect(result.current.showSearch).toBe(false);
        pressCtrlK();
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('hasCustomSearch=true desarma o atalho da lib', () => {
        const { result } = renderHook(
            () => useChromeDefaultWidgets(undefined, { hasCustomSearch: true }),
            { wrapper },
        );
        expect(result.current.showSearch).toBe(false);
        pressCtrlK();
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('sem nenhuma trava, abre a busca default', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        pressCtrlK();
        expect(result.current.isSearchOpen).toBe(true);
    });
});
