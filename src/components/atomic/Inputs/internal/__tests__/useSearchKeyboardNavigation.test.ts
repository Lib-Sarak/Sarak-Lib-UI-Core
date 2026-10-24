import type React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSearchKeyboardNavigation } from '../useSearchKeyboardNavigation';

const keyboardEvent = (key: string): React.KeyboardEvent<HTMLInputElement> => ({
    key,
    preventDefault: vi.fn(),
} as unknown as React.KeyboardEvent<HTMLInputElement>);

describe('useSearchKeyboardNavigation', () => {
    it('wraps arrows, selects the active result with Enter, and resets on query changes', () => {
        const onSelectActive = vi.fn();
        const { result, rerender } = renderHook(
            ({ query }) => useSearchKeyboardNavigation({ query, resultCount: 2, onSelectActive }),
            { initialProps: { query: 'pro' } },
        );

        const arrowDown = keyboardEvent('ArrowDown');
        act(() => result.current.handleKeyDown(arrowDown));
        expect(arrowDown.preventDefault).toHaveBeenCalledOnce();
        expect(result.current.activeIndex).toBe(1);

        act(() => result.current.handleKeyDown(keyboardEvent('Enter')));
        expect(onSelectActive).toHaveBeenCalledWith(1);

        act(() => result.current.handleKeyDown(keyboardEvent('ArrowDown')));
        expect(result.current.activeIndex).toBe(0);
        act(() => result.current.handleKeyDown(keyboardEvent('ArrowUp')));
        expect(result.current.activeIndex).toBe(1);

        rerender({ query: 'proje' });
        expect(result.current.activeIndex).toBe(0);
    });

    it('ignora Enter e setas sem resultados', () => {
        const onSelectActive = vi.fn();
        const { result } = renderHook(() => useSearchKeyboardNavigation({ query: '', resultCount: 0, onSelectActive }));
        const enter = keyboardEvent('Enter');

        act(() => result.current.handleKeyDown(enter));

        expect(onSelectActive).not.toHaveBeenCalled();
        expect(enter.preventDefault).not.toHaveBeenCalled();
    });
});
