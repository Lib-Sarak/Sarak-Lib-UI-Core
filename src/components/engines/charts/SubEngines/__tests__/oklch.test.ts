import { describe, expect, it } from 'vitest';
import { contrastRatio, deltaE, hexToRgb, maxChroma, oklchToHex, rgbToHex, rgbToOklch } from '../oklch';

describe('oklch', () => {
    it('hex → OKLCH → hex devolve a cor (ida e volta)', () => {
        for (const hex of ['#2a78d6', '#eb6834', '#1baf7a', '#8a6cc2']) {
            const rgb = hexToRgb(hex);
            expect(rgb).not.toBeNull();
            expect(oklchToHex(rgbToOklch(rgb ?? [0, 0, 0]))).toBe(hex);
        }
    });

    it('hexToRgb recusa o que não é hex e aceita a forma curta', () => {
        expect(hexToRgb('nada')).toBeNull();
        expect(hexToRgb('#abc')).toEqual(hexToRgb('#aabbcc'));
    });

    it('rgbToHex limita os canais ao intervalo válido', () => {
        expect(rgbToHex([2, -1, 0.5])).toBe('#ff0080');
    });

    it('branco tem luminosidade 1 e preto 0', () => {
        expect(rgbToOklch([1, 1, 1]).L).toBeCloseTo(1, 2);
        expect(rgbToOklch([0, 0, 0]).L).toBeCloseTo(0, 2);
    });

    it('maxChroma é maior no meio da luminosidade que nas pontas', () => {
        expect(maxChroma(0.6, 250)).toBeGreaterThan(maxChroma(0.97, 250));
        expect(maxChroma(0.6, 250)).toBeGreaterThan(0);
    });

    it('deltaE é zero para a mesma cor e cresce com a diferença', () => {
        expect(deltaE('#336699', '#336699')).toBe(0);
        expect(deltaE('#336699', '#3a6a9a')).toBeLessThan(deltaE('#336699', '#993366'));
    });

    it('sob deuteranopia vermelho e verde de mesma luminosidade ficam mais próximos que sob visão normal', () => {
        expect(deltaE('#c84b4b', '#4b9a4b', 'deutan')).toBeLessThan(deltaE('#c84b4b', '#4b9a4b'));
    });

    it('contrastRatio: preto sobre branco é 21 e a razão é simétrica', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
        expect(contrastRatio('#336699', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#336699'), 5);
    });
});
