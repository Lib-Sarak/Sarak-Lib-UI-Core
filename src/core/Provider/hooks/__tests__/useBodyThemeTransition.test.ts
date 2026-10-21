import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBodyThemeTransition } from '../useBodyThemeTransition';

afterEach(() => {
    document.body.removeAttribute('data-sarak-theme-ready');
    vi.unstubAllGlobals();
});

describe('useBodyThemeTransition', () => {
    it('habilita a transição após dois quadros e restaura o atributo anterior', () => {
        const frames: FrameRequestCallback[] = [];
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            frames.push(callback);
            return frames.length;
        });
        const cancelFrame = vi.fn();
        vi.stubGlobal('cancelAnimationFrame', cancelFrame);
        document.body.setAttribute('data-sarak-theme-ready', 'anterior');

        const { unmount } = renderHook(() => useBodyThemeTransition(false));
        expect(frames).toHaveLength(1);
        expect(document.body.getAttribute('data-sarak-theme-ready')).toBe('anterior');

        act(() => frames.shift()?.(0));
        expect(frames).toHaveLength(1);
        expect(document.body.getAttribute('data-sarak-theme-ready')).toBe('anterior');

        act(() => frames.shift()?.(16));
        expect(document.body.getAttribute('data-sarak-theme-ready')).toBe('true');

        unmount();
        expect(document.body.getAttribute('data-sarak-theme-ready')).toBe('anterior');
        expect(cancelFrame).toHaveBeenCalledTimes(2);
    });

    it('não altera o body em modo embarcado', () => {
        const requestFrame = vi.fn();
        vi.stubGlobal('requestAnimationFrame', requestFrame);

        renderHook(() => useBodyThemeTransition(true));

        expect(requestFrame).not.toHaveBeenCalled();
        expect(document.body.hasAttribute('data-sarak-theme-ready')).toBe(false);
    });
});
