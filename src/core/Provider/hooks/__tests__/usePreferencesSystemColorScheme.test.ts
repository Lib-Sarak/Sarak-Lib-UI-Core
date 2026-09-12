import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreferencesSystemColorScheme } from '../usePreferencesSystemColorScheme';

/** jsdom não implementa `matchMedia` — o hook degrada para 'light' quando ele
 *  falta (ver `getSystemColorScheme`), então cada teste monta o próprio mock. */
const mockMatchMedia = (matches: boolean) => {
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const mql = {
        matches,
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
    };
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
    return {
        fireChange: (nextMatches: boolean) => listeners.forEach((cb) => cb({ matches: nextMatches } as MediaQueryListEvent)),
    };
};

describe('usePreferencesSystemColorScheme', () => {
    afterEach(() => {
        // @ts-expect-error — restaura o ambiente sem `matchMedia` entre testes.
        delete window.matchMedia;
    });

    it('sem `matchMedia` no ambiente, degrada para "light"', () => {
        const { result } = renderHook(() => usePreferencesSystemColorScheme());
        expect(result.current).toBe('light');
    });

    it('lê o esquema inicial do sistema operacional', () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => usePreferencesSystemColorScheme());
        expect(result.current).toBe('dark');
    });

    it('acompanha a troca do sistema em tempo real', () => {
        const { fireChange } = mockMatchMedia(false);
        const { result } = renderHook(() => usePreferencesSystemColorScheme());
        expect(result.current).toBe('light');

        act(() => fireChange(true));
        expect(result.current).toBe('dark');
    });
});
