// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { isValidPaletteValue, parsePaletteValue } from '../parser';

describe('palette value parser', () => {
    it('resolves the small built-in preset registry', () => {
        expect(parsePaletteValue('oceano')).toEqual({ type: 'analogous', base: '#2563eb' });
    });

    it('parses custom palettes with optional secondary and accent seeds', () => {
        expect(parsePaletteValue('custom:triadic:#abc,sec=#123456,acc=#abcdef')).toEqual({
            type: 'triadic', base: '#abc', secondary: '#123456', accent: '#abcdef',
        });
    });

    it('rejects unknown presets, unsupported colors, legacy separators, and malformed option order', () => {
        [
            'unknown',
            'custom:analogous:red',
            'custom:unknown:#123456',
            'custom:triadic:#123456,acc=#000,sec=#fff',
            'custom:triadic:#123456;sec=#000;acc=#fff',
        ]
            .forEach((value) => expect(isValidPaletteValue(value)).toBe(false));
        expect(isValidPaletteValue('custom:complementary:#123456,sec=#fff')).toBe(true);
    });
});
