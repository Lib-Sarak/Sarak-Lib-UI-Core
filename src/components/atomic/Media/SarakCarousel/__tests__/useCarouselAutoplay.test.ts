import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { prefersReducedMotion, useCarouselAutoplay } from '../useCarouselAutoplay';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

const stubMotion = (reduced: boolean): void => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduced && query.includes('reduce'), media: query }));
};

describe('useCarouselAutoplay', () => {
    it('avança no intervalo, usando sempre o avanço mais novo', () => {
        stubMotion(false);
        vi.useFakeTimers();
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(({ advance }) => useCarouselAutoplay({ autoPlay: true, count: 3, intervalMs: 1000, onAdvance: advance }), { initialProps: { advance: first } });
        rerender({ advance: second });
        act(() => { vi.advanceTimersByTime(1000); });
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledOnce();
    });

    it('pausa pelo botão e sob o mouse/foco', () => {
        stubMotion(false);
        vi.useFakeTimers();
        const advance = vi.fn();
        const { result } = renderHook(() => useCarouselAutoplay({ autoPlay: true, count: 3, intervalMs: 1000, onAdvance: advance }));
        act(() => result.current.setHeld(true));
        act(() => { vi.advanceTimersByTime(3000); });
        expect(advance).not.toHaveBeenCalled();
        act(() => result.current.setHeld(false));
        act(() => result.current.setPaused(true));
        expect(result.current.playing).toBe(false);
    });

    it('não gira com movimento reduzido, sem autoPlay ou com um slide só', () => {
        stubMotion(true);
        expect(prefersReducedMotion()).toBe(true);
        expect(renderHook(() => useCarouselAutoplay({ autoPlay: true, count: 3, intervalMs: 1000, onAdvance: vi.fn() })).result.current.playing).toBe(false);
        stubMotion(false);
        expect(renderHook(() => useCarouselAutoplay({ autoPlay: false, count: 3, intervalMs: 1000, onAdvance: vi.fn() })).result.current.playing).toBe(false);
        expect(renderHook(() => useCarouselAutoplay({ autoPlay: true, count: 1, intervalMs: 1000, onAdvance: vi.fn() })).result.current.playing).toBe(false);
    });
});
