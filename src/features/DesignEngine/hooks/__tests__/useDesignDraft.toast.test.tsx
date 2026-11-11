import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDesignDraft } from '../useDesignDraft';
import { SarakUIContextType } from '../../../../core/Provider/types';

const makeSarak = (): SarakUIContextType => ({
    draftDesign: null,
    systemDesign: { mode: 'dark', layout: 'glass' },
    allThemes: [],
    isDrafting: true,
    setIsDrafting: vi.fn(),
    lockDrafting: vi.fn(),
} as unknown as SarakUIContextType);

describe('useDesignDraft — prazo do toast', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('o segundo aviso fica o prazo inteiro dele, sem morrer no timer do primeiro', () => {
        const { result } = renderHook(() => useDesignDraft(makeSarak()));

        act(() => { result.current.showToast('success', 'primeiro'); });
        act(() => { vi.advanceTimersByTime(1000); });
        act(() => { result.current.showToast('warning', 'segundo'); });

        // 3,5 s desde o primeiro: o prazo dele (3 s) passou, o do segundo vence em 4 s
        act(() => { vi.advanceTimersByTime(2500); });
        expect(result.current.toast?.message).toBe('segundo');

        act(() => { vi.advanceTimersByTime(600); });
        expect(result.current.toast).toBeNull();
    });

    it('um aviso sozinho some no prazo de 3 s', () => {
        const { result } = renderHook(() => useDesignDraft(makeSarak()));
        act(() => { result.current.showToast('success', 'único'); });
        act(() => { vi.advanceTimersByTime(2900); });
        expect(result.current.toast?.message).toBe('único');
        act(() => { vi.advanceTimersByTime(200); });
        expect(result.current.toast).toBeNull();
    });

    it('nenhum timer fica pendente depois de desmontar', () => {
        const { result, unmount } = renderHook(() => useDesignDraft(makeSarak()));
        act(() => { result.current.showToast('success', 'aviso'); });
        expect(vi.getTimerCount()).toBeGreaterThan(0);
        unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});
