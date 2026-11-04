// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { rgbToOklch } from '../color-space';
import { findMinimalShift, SHIFT_STEP, type ShiftScore } from '../contrast-shift';
import type { RgbColor } from '../types';

const ORIGIN: RgbColor = { red: 120, green: 120, blue: 200 };
const originLightness = rgbToOklch(ORIGIN).lightness;

/** Passa quando a luminosidade OKLCH da cor chega ao limite pedido, no sentido pedido. */
const passesAt = (limit: number, direction: 'darker' | 'lighter') => (color: RgbColor): ShiftScore => {
    const { lightness } = rgbToOklch(color);
    const margin = direction === 'darker' ? limit - lightness : lightness - limit;
    return { failedPairs: margin >= 0 ? 0 : 1, minimumRatio: 4.5 + margin * 10 };
};

describe('findMinimalShift', () => {
    it('a origem que já passa sai intacta, sem deslocamento', () => {
        const result = findMinimalShift(ORIGIN, () => ({ failedPairs: 0, minimumRatio: 5 }));
        expect(result.color).toBe(ORIGIN);
        expect(result.shift).toBe(0);
    });

    it('escurece o mínimo que o par pede, dentro da tolerância do passo', () => {
        const limit = originLightness - 0.1;
        const result = findMinimalShift(ORIGIN, passesAt(limit, 'darker'));
        expect(result.failedPairs).toBe(0);
        expect(rgbToOklch(result.color).lightness).toBeLessThanOrEqual(limit + 0.001);
        expect(result.shift).toBeLessThanOrEqual(0.1 + 2 * SHIFT_STEP);
        expect(result.shift).toBeGreaterThanOrEqual(0.1 - 2 * SHIFT_STEP);
    });

    it('clareia quando é o lado que passa', () => {
        const result = findMinimalShift(ORIGIN, passesAt(originLightness + 0.08, 'lighter'));
        expect(result.failedPairs).toBe(0);
        expect(rgbToOklch(result.color).lightness).toBeGreaterThan(originLightness);
    });

    it('sem solução, devolve a cor de maior contraste que a busca viu', () => {
        const result = findMinimalShift(ORIGIN, (color) => ({ failedPairs: 1, minimumRatio: 10 - rgbToOklch(color).lightness }));
        expect(result.failedPairs).toBe(1);
        expect(rgbToOklch(result.color).lightness).toBeLessThan(0.05);
    });
});
