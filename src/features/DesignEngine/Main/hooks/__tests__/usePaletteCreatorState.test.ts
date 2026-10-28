import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePaletteCreatorState } from '../usePaletteCreatorState';

describe('usePaletteCreatorState', () => {
    it('começa análoga, só com a cor-base, e a entrada é válida', () => {
        const { result } = renderHook(() => usePaletteCreatorState('#2563eb'));
        expect(result.current.input).toEqual({ type: 'analogous', base: '#2563eb' });
    });

    it('a entrada acompanha o tipo e as sementes opcionais ligadas', () => {
        const { result } = renderHook(() => usePaletteCreatorState('#2563eb'));
        act(() => {
            result.current.setType('triadic');
            result.current.setSecondary('#16a34a');
            result.current.setAccent('#f59e0b');
        });
        expect(result.current.input).toEqual({ type: 'triadic', base: '#2563eb', secondary: '#16a34a', accent: '#f59e0b' });
        act(() => result.current.setSecondary(undefined));
        expect(result.current.input).toEqual({ type: 'triadic', base: '#2563eb', accent: '#f59e0b' });
    });

    it('uma cor fora de hex (alfa, rgba) é ignorada e a semente fica como estava', () => {
        const { result } = renderHook(() => usePaletteCreatorState('#2563eb'));
        act(() => result.current.setBase('rgba(10, 20, 30, 0.5)'));
        expect(result.current.base).toBe('#2563eb');
        expect(result.current.input).toEqual({ type: 'analogous', base: '#2563eb' });
        act(() => result.current.setBase('#aa3366'));
        expect(result.current.base).toBe('#aa3366');
    });
});
