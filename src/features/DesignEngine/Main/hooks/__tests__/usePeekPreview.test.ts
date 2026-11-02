import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePeekPreview } from '../usePeekPreview';

describe('usePeekPreview', () => {
    it('guarda o que a prévia compõe e volta a nada ao receber null', () => {
        const { result } = renderHook(() => usePeekPreview());
        expect(result.current.peekTokens).toBeNull();
        expect(result.current.isPeeking).toBe(false);

        act(() => result.current.onPeek({ primaryColor: '#ff0000' }));
        expect(result.current.peekTokens).toEqual({ primaryColor: '#ff0000' });
        expect(result.current.isPeeking).toBe(true);

        act(() => result.current.onPeek(null));
        expect(result.current.isPeeking).toBe(false);
    });

    it('o manipulador é estável entre renders', () => {
        const { result, rerender } = renderHook(() => usePeekPreview());
        const first = result.current.onPeek;
        rerender();
        expect(result.current.onPeek).toBe(first);
    });
});
