import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsPrinting } from '../useIsPrinting';

afterEach(() => vi.unstubAllGlobals());

describe('useIsPrinting', () => {
    it('acompanha o beforeprint e o afterprint', () => {
        const { result } = renderHook(() => useIsPrinting());
        expect(result.current).toBe(false);
        act(() => { window.dispatchEvent(new Event('beforeprint')); });
        expect(result.current).toBe(true);
        act(() => { window.dispatchEvent(new Event('afterprint')); });
        expect(result.current).toBe(false);
    });

    it('acompanha a mídia de impressão', () => {
        let listener: ((event: MediaQueryListEvent) => void) | undefined;
        const removeEventListener = vi.fn();
        vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: (_: string, handler: typeof listener) => { listener = handler; }, removeEventListener }));
        const { result, unmount } = renderHook(() => useIsPrinting());
        act(() => listener?.({ matches: true } as MediaQueryListEvent));
        expect(result.current).toBe(true);
        unmount();
        expect(removeEventListener).toHaveBeenCalled();
    });
});
