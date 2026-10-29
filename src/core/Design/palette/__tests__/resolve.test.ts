// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sarakGetAllDesignTokens } from '../../master-map';
import { sarakGetDefaultDesignState } from '../../master-map';
import { evaluatePair } from '../../../../../gates/scripts/audit/verify_contrast';
import { PAIRS } from '../contrast-pairs';
import { createPaletteScales } from '../scale';
import { createPaletteSeeds } from '../seeds';
import { PALETTE_ROLE_MAP } from '../role-map';
import { createPaletteColorMap, resolvePalette, sarakResolvePalette } from '../resolve';
import type { SarakPaletteMode, SarakPaletteType } from '../types';

const EXTREME_PALETTE_BASES = ['#dfff00', '#00ffff', '#ff00ff', '#010203', '#fefefe', '#808080'];
const PALETTE_TYPES: SarakPaletteType[] = [
    'monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic',
];
const PALETTE_MODES: SarakPaletteMode[] = ['light', 'dark'];

const getPairFailures = (colors: Record<string, string>): string[] => {
    const design = { ...sarakGetDefaultDesignState(), ...colors };
    return PAIRS.flatMap((pair) => {
        const result = evaluatePair(pair, design);
        return result.pulado || !result.pass ? [`${pair.fg} → ${pair.bgChain.join(' → ')}`] : [];
    });
};

describe('palette resolver', () => {
    it('is deterministic and returns every token covered by the role map', () => {
        const first = sarakResolvePalette('oceano', 'light');
        const second = sarakResolvePalette('oceano', 'light');
        expect(first).toEqual(second);
        expect(Object.keys(first).sort()).toEqual(Object.keys(PALETTE_ROLE_MAP).sort());
    });

    it('returns only string color values for all schema color tokens', () => {
        const colors = resolvePalette({ type: 'analogous', base: '#2563eb' }, 'dark');
        const schemaColors = sarakGetAllDesignTokens()
            .filter((token) => token.type === 'color')
            .map((token) => token.id);
        expect(Object.keys(colors).sort()).toEqual(schemaColors.sort());
        expect(Object.values(colors).every((value) => typeof value === 'string')).toBe(true);
    });

    it('rejects unknown palette identifiers at the public helper boundary', () => {
        expect(() => sarakResolvePalette('missing-preset', 'dark')).toThrow(TypeError);
    });

});

describe('palette contrast correction', () => {
    it('passes every contrast pair for the preset in both modes', () => {
        PALETTE_MODES.forEach((mode) => {
            expect(getPairFailures(sarakResolvePalette('oceano', mode))).toEqual([]);
        });
    });

    it('passes every contrast pair for extreme colors, harmonies, and modes', () => {
        const cases = EXTREME_PALETTE_BASES.flatMap((base) => PALETTE_TYPES.flatMap((type) => PALETTE_MODES.map((mode) =>
            resolvePalette({ type, base }, mode),
        )));
        cases.forEach((colors) => expect(getPairFailures(colors)).toEqual([]));
    });

    it('corrects a failing mapped pair instead of only passing by its initial tones', () => {
        const input = { type: 'analogous' as const, base: '#dfff00' };
        const scales = createPaletteScales(createPaletteSeeds(input));
        const uncorrectedColors = createPaletteColorMap(scales, 'light');
        const correctedColors = resolvePalette(input, 'light');

        expect(getPairFailures(uncorrectedColors).length).toBeGreaterThan(0);
        expect(getPairFailures(correctedColors)).toEqual([]);
    });
});
