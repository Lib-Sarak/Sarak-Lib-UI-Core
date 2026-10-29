// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createPaletteSeeds } from '../seeds';

describe('createPaletteSeeds', () => {
    it('rotates analogous seeds by thirty degrees and accepts explicit overrides', () => {
        const defaults = createPaletteSeeds({ type: 'analogous', base: '#2563eb' });
        const overridden = createPaletteSeeds({ type: 'analogous', base: '#2563eb', secondary: '#00aa44' });
        expect(defaults.secondary.hue).toBeCloseTo((defaults.primary.hue + 330) % 360, 5);
        expect(defaults.accent.hue).toBeCloseTo((defaults.primary.hue + 30) % 360, 5);
        expect(overridden.secondary.hue).not.toBeCloseTo(defaults.secondary.hue, 1);
    });

    it('uses complementary, split-complementary, triadic, and monochromatic harmonies', () => {
        const baseHue = createPaletteSeeds({ type: 'analogous', base: '#2563eb' }).primary.hue;
        expect(createPaletteSeeds({ type: 'complementary', base: '#2563eb' }).accent.hue).toBeCloseTo((baseHue + 180) % 360, 5);
        expect(createPaletteSeeds({ type: 'split-complementary', base: '#2563eb' }).secondary.hue).toBeCloseTo((baseHue + 150) % 360, 5);
        expect(createPaletteSeeds({ type: 'triadic', base: '#2563eb' }).accent.hue).toBeCloseTo((baseHue + 240) % 360, 5);
        expect(createPaletteSeeds({ type: 'monochromatic', base: '#2563eb' }).accent.hue).toBeCloseTo(baseHue, 5);
    });

    it('keeps status hues fixed and gives neutrals near-zero chroma', () => {
        const seeds = createPaletteSeeds({ type: 'triadic', base: '#2563eb' });
        expect(seeds.success.hue).toBe(145);
        expect(seeds.error.hue).toBe(25);
        expect(seeds.warning.hue).toBe(85);
        expect(seeds.info.hue).toBe(245);
        expect(seeds.neutral.chroma).toBeLessThan(0.01);
    });
});
