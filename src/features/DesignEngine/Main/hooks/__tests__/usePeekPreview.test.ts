import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

    it('a tela da espiada vem junto e some junto', () => {
        const { result } = renderHook(() => usePeekPreview());
        expect(result.current.peekScreen).toBeUndefined();

        act(() => result.current.onPeek({ tableZebraStriping: true }, 'tabela'));
        expect(result.current.peekScreen).toBe('tabela');

        act(() => result.current.onPeek(null));
        expect(result.current.peekScreen).toBeUndefined();
    });

    it('espiada sem tela deixa a prévia onde está', () => {
        const { result } = renderHook(() => usePeekPreview());
        act(() => result.current.onPeek({ primaryColor: '#ff0000' }));
        expect(result.current.peekScreen).toBeUndefined();
    });

    it('escolher durante a espiada mantém a tela a que ela levou', () => {
        const selectScreen = vi.fn();
        const choose = vi.fn();
        const { result } = renderHook(() => usePeekPreview(selectScreen));
        act(() => result.current.onPeek({ tableZebraStriping: true }, 'tabela'));
        result.current.keepPeekScreen(choose)({ tableZebraStriping: true }, true);
        expect(selectScreen).toHaveBeenCalledWith('tabela');
        expect(choose).toHaveBeenCalledWith({ tableZebraStriping: true }, true);
    });

    it('escolher sem espiada (ou sem tela) não muda a tela da prévia', () => {
        const selectScreen = vi.fn();
        const choose = vi.fn();
        const { result } = renderHook(() => usePeekPreview(selectScreen));
        result.current.keepPeekScreen(choose)('a');
        act(() => result.current.onPeek({ primaryColor: '#ff0000' }));
        result.current.keepPeekScreen(choose)('b');
        expect(selectScreen).not.toHaveBeenCalled();
        expect(choose).toHaveBeenCalledTimes(2);
    });

    it('o manipulador é estável entre renders', () => {
        const { result, rerender } = renderHook(() => usePeekPreview());
        const first = result.current.onPeek;
        rerender();
        expect(result.current.onPeek).toBe(first);
    });
});
