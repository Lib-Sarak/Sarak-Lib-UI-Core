import { describe, it, expect } from 'vitest';
import { clampToTokenBounds, getTokenBounds, isOffTokenGrid, isOutsideTokenBounds } from '../tokenBounds';
import type { SarakDesignToken } from '../../types';

const token = (patch: Partial<SarakDesignToken>): SarakDesignToken => ({ id: 't', label: 't', type: 'slider', defaultValue: 0, ...patch });

describe('tokenBounds', () => {
    it('constraints manda; min/max soltos só valem na falta delas', () => {
        expect(getTokenBounds(token({ constraints: { min: 1, max: 5, step: 1 }, min: 0, max: 100 }))).toEqual({ min: 1, max: 5, step: 1 });
        expect(getTokenBounds(token({ min: 2, max: 9 }))).toEqual({ min: 2, max: 9, step: undefined });
    });

    it('leva para a borda, e sem faixa devolve o próprio valor', () => {
        const bounded = token({ constraints: { min: 0, max: 10 } });
        expect(clampToTokenBounds(-3, bounded)).toBe(0);
        expect(clampToTokenBounds(99, bounded)).toBe(10);
        expect(clampToTokenBounds(42, token({}))).toBe(42);
    });

    it('vê o ponto responsivo fora da faixa', () => {
        const bounded = token({ constraints: { min: 0, max: 40 }, isResponsive: true });
        expect(isOutsideTokenBounds({ desk: 12, tab: 10, mob: 8 }, bounded)).toBe(false);
        expect(isOutsideTokenBounds({ desk: 12, tab: 10, mob: 80 }, bounded)).toBe(true);
        expect(isOutsideTokenBounds('texto', bounded)).toBe(false);
    });

    describe('isOffTokenGrid — a grade do passo, contada a partir do mínimo', () => {
        const stepped = token({ constraints: { min: 0, max: 1, step: 0.05 } });

        it('valor entre dois passos está fora; sobre um passo, dentro (inclusive com erro de ponto flutuante)', () => {
            expect(isOffTokenGrid(0.02, stepped)).toBe(true);
            expect(isOffTokenGrid(0.35, stepped)).toBe(false);
            expect(isOffTokenGrid(0.15, stepped)).toBe(false); // 0,15 / 0,05 = 2,9999999999999996
        });

        it('conta a partir do mínimo, não de zero', () => {
            const offset = token({ constraints: { min: 1, max: 4, step: 0.5 } });
            expect(isOffTokenGrid(1.5, offset)).toBe(false);
            expect(isOffTokenGrid(1.75, offset)).toBe(true);
        });

        it('sem passo declarado vale o do painel (1): 10,5 está fora, 10 dentro', () => {
            expect(isOffTokenGrid(10.5, token({}))).toBe(true);
            expect(isOffTokenGrid(10, token({}))).toBe(false);
        });

        it('o objeto responsivo basta um ponto fora; texto e cor não têm grade', () => {
            expect(isOffTokenGrid({ mob: 8, tab: 10.5, desk: 12 }, token({}))).toBe(true);
            expect(isOffTokenGrid({ mob: 8, tab: 10, desk: 12 }, token({}))).toBe(false);
            expect(isOffTokenGrid('#ff0000', token({}))).toBe(false);
        });
    });
});

