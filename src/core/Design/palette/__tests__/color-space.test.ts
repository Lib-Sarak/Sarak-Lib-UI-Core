// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { hexToOklch, oklchToHex, parseHexColor, rgbToOklch } from '../color-space';

describe('palette color-space', () => {
    it('round-trips common sRGB colors through OKLCH', () => {
        ['#000000', '#ffffff', '#2563eb', '#eab308', '#d946ef'].forEach((hex) => {
            const oklch = hexToOklch(hex);
            expect(oklch).not.toBeNull();
            expect(oklchToHex(oklch!)).toBe(hex);
        });
    });

    it('reduces chroma to fit sRGB while preserving lightness and hue', () => {
        const source = { lightness: 0.64, chroma: 0.7, hue: 285 };
        const output = parseHexColor(oklchToHex(source));
        expect(output).not.toBeNull();
        const converted = rgbToOklch(output!);
        expect(converted.lightness).toBeCloseTo(source.lightness, 2);
        expect(converted.hue).toBeCloseTo(source.hue, 0);
        expect(converted.chroma).toBeLessThan(source.chroma);
    });

    it('rejects malformed hex and supports short hex notation', () => {
        expect(parseHexColor('#abc')).toEqual({ red: 170, green: 187, blue: 204 });
        expect(parseHexColor('#12xz56')).toBeNull();
        expect(hexToOklch('transparent')).toBeNull();
    });
});
