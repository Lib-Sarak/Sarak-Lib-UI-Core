import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MINE_GROUP, useOpenGalleryGroups } from '../useOpenGalleryGroups';

describe('useOpenGalleryGroups', () => {
    it('parte do conjunto pedido, e alternar abre e fecha um grupo', () => {
        const { result } = renderHook(() => useOpenGalleryGroups(() => new Set(['analogous']), 0));
        expect([...result.current.opened]).toEqual(['analogous']);
        act(() => result.current.toggle('triadic'));
        expect([...result.current.opened]).toEqual(['analogous', 'triadic']);
        act(() => result.current.toggle('analogous'));
        expect([...result.current.opened]).toEqual(['triadic']);
    });

    it('quando uma paleta é salva, "Minhas paletas" abre; ao apagar, nada é aberto nem fechado', () => {
        const { result, rerender } = renderHook(({ count }) => useOpenGalleryGroups(() => new Set(), count), { initialProps: { count: 0 } });
        expect(result.current.opened.has(MINE_GROUP)).toBe(false);
        rerender({ count: 1 });
        expect(result.current.opened.has(MINE_GROUP)).toBe(true);
        act(() => result.current.toggle(MINE_GROUP));
        rerender({ count: 0 });
        expect(result.current.opened.has(MINE_GROUP)).toBe(false);
    });

    it('o grupo que o usuário fechou não reabre sozinho enquanto a contagem não cresce', () => {
        const { result, rerender } = renderHook(({ count }) => useOpenGalleryGroups(() => new Set([MINE_GROUP]), count), { initialProps: { count: 2 } });
        act(() => result.current.toggle(MINE_GROUP));
        rerender({ count: 2 });
        expect(result.current.opened.has(MINE_GROUP)).toBe(false);
    });
});
