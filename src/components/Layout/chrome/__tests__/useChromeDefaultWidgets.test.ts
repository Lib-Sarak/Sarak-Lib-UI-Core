import React from 'react';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useChromeDefaultWidgets } from '../useChromeDefaultWidgets';

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement(SarakUIProvider, null, children);

const pinnedCollapseWrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => React.createElement(
    SarakUIProvider,
    {
        config: { preferenceNavCollapsePosition: 'pinned' },
        children,
    },
);

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
        expect(result.current.showThemeToggle).toBe(false);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
        expect(result.current.widgetPlacement.menu).toEqual(expect.arrayContaining([
            'colorMode', 'fontSize', 'navigationStyle', 'navCollapsed',
        ]));
        expect(result.current.widgetPlacement.pinned).toEqual(expect.arrayContaining([
            'language', 'search', 'user', 'notifications',
        ]));
    });

    it('com recolher pinned, oferece o controle para a barra', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper: pinnedCollapseWrapper });
        expect(result.current.showCollapse).toBe(true);
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

describe('o recolher é lido por barra', () => {
    const topbarPinnedWrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => React.createElement(
        SarakUIProvider,
        { config: { preferenceNavCollapsePositionTopbar: 'pinned' }, children },
    );
    const topbarOffWrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => React.createElement(
        SarakUIProvider,
        { config: { preferenceNavCollapsePositionTopbar: 'off' }, children },
    );

    it('com o padrão, a lateral mostra a seta e o topo não mostra o ≡', () => {
        const { result: sidebar } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'sidebar' }), { wrapper });
        const { result: topbar } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'topbar' }), { wrapper });
        expect(sidebar.current.showCollapse).toBe(true);
        expect(topbar.current.showCollapse).toBe(false);
    });

    it('o topo mostra o ≡ quando o sistema o liga pelo token do topo, e a lateral não muda', () => {
        const { result: topbar } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'topbar' }), { wrapper: topbarPinnedWrapper });
        const { result: sidebar } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'sidebar' }), { wrapper: topbarPinnedWrapper });
        expect(topbar.current.showCollapse).toBe(true);
        expect(sidebar.current.showCollapse).toBe(true);
    });

    it('o topo "não oferecido" tira o recolher da barra e do menu do topo', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'topbar' }), { wrapper: topbarOffWrapper });
        expect(result.current.widgetPlacement.offered).not.toContain('navCollapsed');
    });

    it('o valor gravado para a lateral continua valendo para ela e não liga o ≡ do topo', () => {
        const { result: sidebar } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'sidebar' }), { wrapper: pinnedCollapseWrapper });
        const { result: topbar } = renderHook(() => useChromeDefaultWidgets(undefined, { bar: 'topbar' }), { wrapper: pinnedCollapseWrapper });
        expect(sidebar.current.showCollapse).toBe(true);
        expect(topbar.current.showCollapse).toBe(false);
    });
});

describe('widget que o sistema não ligou (usuário e notificações)', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('em produção, sem identidade, o usuário não aparece nem é oferecido', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        expect(result.current.showUser).toBe(false);
        expect(result.current.showUserOffered).toBe(false);
        expect(result.current.widgetPlacement.offered).not.toContain('user');
    });

    it('em produção, sem notificações ou sem o seletor, as notificações não aparecem', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const { result: semItens } = renderHook(() => useChromeDefaultWidgets(undefined, { hasNotificationHandler: true }), { wrapper });
        const { result: semSeletor } = renderHook(() => useChromeDefaultWidgets(undefined, { hasNotifications: true }), { wrapper });
        expect(semItens.current.showNotifications).toBe(false);
        expect(semSeletor.current.showNotifications).toBe(false);
    });

    it('em produção, ligados (identidade + sair; itens + seletor), os dois aparecem', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const { result } = renderHook(
            () => useChromeDefaultWidgets(undefined, { hasUser: true, hasLogout: true, hasNotifications: true, hasNotificationHandler: true }),
            { wrapper },
        );
        expect(result.current.showUser).toBe(true);
        expect(result.current.showNotifications).toBe(true);
    });

    it('fora de produção, sem dado, os dois continuam aparecendo (linha apagada) e o aviso único sai no console', () => {
        vi.stubEnv('NODE_ENV', 'development');
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { result } = renderHook(() => useChromeDefaultWidgets(undefined, { hasLogout: true }), { wrapper });
        expect(result.current.showUser).toBe(true);
        expect(result.current.showNotifications).toBe(true);
        expect(warning).toHaveBeenCalled();
        warning.mockRestore();
    });
});
