import { describe, it, expect } from 'vitest';
import { composeColor, parseLiteralColor, pickerHex } from '../colorParts';

describe('colorParts', () => {
    it('decompõe hex, rgba e transparent; var() e color-mix não são literais', () => {
        expect(parseLiteralColor('#336699')).toEqual({ hex: '#336699', alpha: 1 });
        expect(parseLiteralColor('rgba(51, 102, 153, 0.25)')).toEqual({ hex: '#336699', alpha: 0.25 });
        expect(parseLiteralColor('#33669980')?.alpha).toBeCloseTo(0.5, 1);
        expect(parseLiteralColor('transparent')).toEqual({ hex: '#000000', alpha: 0 });
        expect(parseLiteralColor('var(--x, #fff)')).toBeNull();
        expect(parseLiteralColor('color-mix(in srgb, red 10%, blue)')).toBeNull();
    });

    it('o seletor mostra a reserva literal de um var() e cai no piso quando não há', () => {
        expect(pickerHex('var(--sarak-primary-color, #00f2ff)')).toBe('#00f2ff');
        expect(pickerHex('var(--sarak-primary-color)')).toBe('#ffffff');
        expect(pickerHex('color-mix(in srgb, red 10%, blue)')).toBe('#ffffff');
    });

    it('compõe: alfa cheio fica hex, abaixo disso vira rgba()', () => {
        expect(composeColor('#00ff00', 1)).toBe('#00ff00');
        expect(composeColor('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
    });
});
