import { renderHook } from '@testing-library/react';
import { useCardLayoutStyles } from '../useCardLayoutStyles';
import { describe, it, expect } from 'vitest';

describe('useCardLayoutStyles', () => {
    it('deve retornar as classes padrao quando design for vazio', () => {
        const { result } = renderHook(() => useCardLayoutStyles({}));

        expect(result.current.containerClass).toBe('flex flex-col');
        expect(result.current.contentClass).toBe('relative z-10 flex flex-1 w-full flex-col h-full justify-between items-start text-left');
        expect(result.current.headerClass).toBe('flex w-full mb-4 justify-between items-start');
        expect(result.current.footerClass).toBe('flex gap-2 w-full mt-auto justify-start');
    });

    it('deve mapear a direcao "row" corretamente', () => {
        const { result } = renderHook(() => useCardLayoutStyles({
            cardLayoutDirection: 'row'
        }));

        expect(result.current.containerClass).toContain('flex-row');
        expect(result.current.contentClass).toContain('flex-row');
        expect(result.current.headerClass).toContain('flex-col gap-2');
    });

    it('deve mapear a direcao "row" com imagem a direita (row-reverse)', () => {
        const { result } = renderHook(() => useCardLayoutStyles({
            cardLayoutDirection: 'row',
            cardImagePosition: 'right'
        }));

        expect(result.current.containerClass).toContain('flex-row-reverse');
    });

    it('deve mapear alinhamentos centrais (center)', () => {
        const { result } = renderHook(() => useCardLayoutStyles({
            cardTextAlign: 'center'
        }));

        expect(result.current.containerClass).toBe('flex flex-col');
        expect(result.current.contentClass).toContain('justify-center items-center text-center');
        expect(result.current.footerClass).toContain('justify-center');
    });

    it('deve mapear alinhamentos a direita (right)', () => {
        const { result } = renderHook(() => useCardLayoutStyles({
            cardTextAlign: 'right'
        }));

        expect(result.current.containerClass).toBe('flex flex-col');
        expect(result.current.contentClass).toContain('justify-end items-end text-right');
        expect(result.current.footerClass).toContain('justify-end');
    });
});
