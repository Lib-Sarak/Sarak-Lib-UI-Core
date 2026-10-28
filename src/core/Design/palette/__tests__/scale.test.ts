// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createPaletteScales, PALETTE_CHROMA_CURVE, PALETTE_LIGHTNESS_SCALE } from '../scale';
import { createPaletteSeeds } from '../seeds';

describe('createPaletteScales', () => {
    it('builds all eleven shared tones for every palette seed', () => {
        const scales = createPaletteScales(createPaletteSeeds({ type: 'analogous', base: '#2563eb' }));
        const expectedTones = PALETTE_LIGHTNESS_SCALE.map(({ tone }) => tone);
        Object.values(scales).forEach((scale) => expect(Object.keys(scale).map(Number)).toEqual(expectedTones));
    });

    it('uses the shared lightness ruler and chroma curve', () => {
        expect(PALETTE_LIGHTNESS_SCALE).toHaveLength(11);
        expect(PALETTE_CHROMA_CURVE).toHaveLength(PALETTE_LIGHTNESS_SCALE.length);
        expect(PALETTE_LIGHTNESS_SCALE[0].lightness).toBeGreaterThan(PALETTE_LIGHTNESS_SCALE.at(-1)!.lightness);
        expect(PALETTE_CHROMA_CURVE[5]).toBe(1);
    });
});
