import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useChromeDefaultWidgets } from '../useChromeDefaultWidgets';

const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(SarakUIProvider, null, children);

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

    it('com Provider e sem `widgets`, os quatro defaults ligam', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets(), { wrapper });
        expect(result.current.hasProvider).toBe(true);
        expect(result.current.showSearch).toBe(true);
        expect(result.current.showThemeToggle).toBe(true);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
    });

    it('`false` isolado desliga só aquele campo — os demais continuam ligados', () => {
        const { result } = renderHook(() => useChromeDefaultWidgets({ themeToggle: false }), { wrapper });
        expect(result.current.showThemeToggle).toBe(false);
        expect(result.current.showSearch).toBe(true);
        expect(result.current.showUser).toBe(true);
        expect(result.current.showCollapse).toBe(true);
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
});
