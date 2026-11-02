// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
    createPaletteScales,
    PALETTE_BASE_TONE,
    PALETTE_CHROMA_CURVE,
    PALETTE_LIGHTNESS_SCALE,
    PALETTE_SECONDARY_CHROMA_CURVE,
} from '../scale';
import { createPaletteSeeds } from '../seeds';

describe('createPaletteScales', () => {
    it('builds all eleven shared tones for every palette seed', () => {
        const scales = createPaletteScales(createPaletteSeeds({ type: 'analogous', base: '#2563eb' }));
        const expectedTones = [PALETTE_BASE_TONE, ...PALETTE_LIGHTNESS_SCALE.map(({ tone }) => tone)];
        Object.values(scales).forEach((scale) => expect(Object.keys(scale).map(Number)).toEqual(expectedTones));
    });

    it('uses the shared lightness ruler and chroma curve', () => {
        expect(PALETTE_LIGHTNESS_SCALE).toHaveLength(11);
        expect(PALETTE_CHROMA_CURVE).toHaveLength(PALETTE_LIGHTNESS_SCALE.length);
        expect(PALETTE_LIGHTNESS_SCALE[0].lightness).toBeGreaterThan(PALETTE_LIGHTNESS_SCALE.at(-1)!.lightness);
        expect(PALETTE_CHROMA_CURVE[5]).toBe(1);
    });

    it('tinge os fundos da secundária menos que os da primária, sem mexer nos tons do meio', () => {
        expect(PALETTE_SECONDARY_CHROMA_CURVE).toHaveLength(PALETTE_LIGHTNESS_SCALE.length);
        PALETTE_SECONDARY_CHROMA_CURVE.forEach((factor, index) => {
            const isEdge = index <= 1 || index >= 9;
            if (isEdge) expect(factor, `tom ${PALETTE_LIGHTNESS_SCALE[index].tone}`).toBeLessThan(PALETTE_CHROMA_CURVE[index]);
            else expect(factor, `tom ${PALETTE_LIGHTNESS_SCALE[index].tone}`).toBe(PALETTE_CHROMA_CURVE[index]);
        });
        const seed = { lightness: 0.6, chroma: 0.16, hue: 200 };
        const scales = createPaletteScales({ ...createPaletteSeeds({ type: 'analogous', base: '#2563eb' }), primary: seed, secondary: seed });
        const chromaOf = (rgb: { red: number; green: number; blue: number }) => {
            const [min, max] = [Math.min(rgb.red, rgb.green, rgb.blue), Math.max(rgb.red, rgb.green, rgb.blue)];
            return max - min;
        };
        expect(chromaOf(scales.secondary[100])).toBeLessThan(chromaOf(scales.primary[100]));
        expect(chromaOf(scales.secondary[900])).toBeLessThan(chromaOf(scales.primary[900]));
        expect(scales.secondary[600]).toEqual(scales.primary[600]);
    });
});
