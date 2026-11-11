import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDraftToast } from '../useDraftToast';

describe('useDraftToast', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('mostra o aviso e o apaga depois de 3 s', () => {
        const { result } = renderHook(() => useDraftToast());
        act(() => { result.current.showToast('success', 'ok'); });
        expect(result.current.toast).toEqual({ type: 'success', message: 'ok' });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(result.current.toast).toBeNull();
    });

    it('o segundo aviso não é apagado pelo timer do primeiro', () => {
        const { result } = renderHook(() => useDraftToast());
        act(() => { result.current.showToast('success', 'primeiro'); });
        act(() => { vi.advanceTimersByTime(1000); });
        act(() => { result.current.showToast('warning', 'segundo'); });
        act(() => { vi.advanceTimersByTime(2500); });
        expect(result.current.toast?.message).toBe('segundo');
    });

    it('não deixa timer pendente depois de desmontar', () => {
        const { result, unmount } = renderHook(() => useDraftToast());
        act(() => { result.current.showToast('success', 'x'); });
        unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});
