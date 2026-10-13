import { describe, it, expect } from 'vitest';
import { composeColor, parseLiteralColor, pickerHex, resolveColorParts } from '../colorParts';

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
        expect(pickerHex('color-mix(in srgb, red 10%, blue)')).toBe('#1a00e6'); // o que ele desenha, não o piso
    });

    it('compõe: alfa cheio fica hex, abaixo disso vira rgba()', () => {
        expect(composeColor('#00ff00', 1)).toBe('#00ff00');
        expect(composeColor('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
    });

    it('hsl() e hsla() são literais: o seletor mostra a cor e o alfa que eles desenham, não o piso', () => {
        expect(parseLiteralColor('hsl(120, 100%, 50%)')).toEqual({ hex: '#00ff00', alpha: 1 });
        expect(parseLiteralColor('hsl(0 100% 50%)')).toEqual({ hex: '#ff0000', alpha: 1 });
        expect(parseLiteralColor('hsla(240, 100%, 50%, 0.4)')).toEqual({ hex: '#0000ff', alpha: 0.4 });
        expect(parseLiteralColor('hsl(210 50% 40% / 25%)')?.alpha).toBe(0.25);
        expect(pickerHex('hsl(120, 100%, 50%)')).toBe('#00ff00');
    });

    it('resolveColorParts: a reserva literal de var() chega com o ALFA, não só o hex', () => {
        expect(resolveColorParts('var(--x, rgba(10, 20, 30, 0.5))')).toEqual({ hex: '#0a141e', alpha: 0.5 });
        expect(resolveColorParts('var(--x)')).toBeNull();
        expect(resolveColorParts(42)).toBeNull();
    });

    it('resolveColorParts: o que o navegador resolve (color-mix) vale, com o alfa do computado', () => {
        // `color-mix` não é literal: o seletor mostra o que ele desenha, e não o branco do piso.
        expect(parseLiteralColor('color-mix(in srgb, #ff0000 50%, transparent)')).toBeNull();
        const resolved = resolveColorParts('color-mix(in srgb, #ff0000 50%, transparent)');
        expect(resolved?.hex).toBe('#ff0000');
        expect(resolved?.alpha).toBeCloseTo(0.5, 1);
    });
});
