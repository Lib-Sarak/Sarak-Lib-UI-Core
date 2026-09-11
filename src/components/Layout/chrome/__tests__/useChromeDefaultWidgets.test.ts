import React from 'react';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useChromeDefaultWidgets } from '../useChromeDefaultWidgets';

const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(SarakUIProvider, null, children);

const pressCtrlK = () => fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

describe('useChromeDefaultWidgets', () => {
    it('fora do Provider: hasProvider falso, nenhum default liga (degradação)', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets());
        expect(result.current.hasProvider).toBe(false);
        expect(result.current.showSearch).toBe(false);
        expect(result.current.showThemeToggle).toBe(false);
        expect(result.current.showUser).toBe(false);
        expect(result.current.showCollapse).toBe(false);
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('fora do Provider, Ctrl/Cmd+K NÃO é escutado — o navegador continua livre', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets());
        pressCtrlK();
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('com Provider, `hasUser: true` e sem `widgets`, os quatro defaults ligam', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(undefined, { hasUser: true }), { wrapper });
        expect(result.current.hasProvider).toBe(true);
        expect(result.current.showSearch).toBe(true);
        expect(result.current.showThemeToggle).toBe(true);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
    });

    it('`false` isolado desliga só aquele campo — os demais continuam ligados', () => {
        const { result } = renderHook(
            () => useChromeDefaultWidgets({ themeToggle: false }, { hasUser: true }),
            { wrapper },
        );
        expect(result.current.showThemeToggle).toBe(false);
        expect(result.current.showSearch).toBe(true);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
    });

    it('sem `hasUser`, o widget de usuário não liga — mesmo com Provider e sem opt-out', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        expect(result.current.showUser).toBe(false);
    });

    it('`widgets.user: false` desliga mesmo com `hasUser: true`', () => {
        const { result } = renderHook(
            () => useChromeDefaultWidgets({ user: false }, { hasUser: true }),
            { wrapper },
        );
        expect(result.current.showUser).toBe(false);
    });

    it('openSearch/closeSearch alternam isSearchOpen', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        expect(result.current.isSearchOpen).toBe(false);
        act(() => result.current.openSearch());
        expect(result.current.isSearchOpen).toBe(true);
        act(() => result.current.closeSearch());
        expect(result.current.isSearchOpen).toBe(false);
    });

    it('toggleNavHidden inverte design.isNavHidden (o mesmo token que o SarakShell usa)', () => {
        const { result } = renderHook(() => {
            const w = useChromeDefaultWidgets();
            const { design } = useSarakUI();
            return { w, isNavHidden: design?.isNavHidden };
        }, { wrapper });

        expect(result.current.isNavHidden).toBeFalsy();
        act(() => result.current.w.toggleNavHidden());
        expect(result.current.isNavHidden).toBe(true);
        act(() => result.current.w.toggleNavHidden());
        expect(result.current.isNavHidden).toBe(false);
    });

    // O atalho e o palette só podem estar ativos quando a busca DEFAULT está de fato em
    // uso — nunca por opt-out, nem sem Provider, nem quando o consumidor trouxe o
    // próprio `search`.
    describe('o atalho Ctrl/Cmd+K só escuta quando a busca default está em uso', () => {
        it('widgets.search=false: o opt-out também desarma o atalho', () => {
            const { result } = renderHook(() => useChromeDefaultWidgets({ search: false }), { wrapper });
            expect(result.current.showSearch).toBe(false);
            pressCtrlK();
            expect(result.current.isSearchOpen).toBe(false);
        });

        it('hasCustomSearch=true: o slot do consumidor desarma o atalho da lib', () => {
            const { result } = renderHook(
                () => useChromeDefaultWidgets(undefined, { hasCustomSearch: true }),
                { wrapper },
            );
            expect(result.current.showSearch).toBe(false);
            pressCtrlK();
            expect(result.current.isSearchOpen).toBe(false);
        });

        it('sem nenhuma trava, o atalho abre a busca default', () => {
            const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
            pressCtrlK();
            expect(result.current.isSearchOpen).toBe(true);
        });
    });
});
