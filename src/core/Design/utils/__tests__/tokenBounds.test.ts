import { describe, it, expect } from 'vitest';
import { clampToTokenBounds, getTokenBounds, isOutsideTokenBounds } from '../tokenBounds';
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
});
