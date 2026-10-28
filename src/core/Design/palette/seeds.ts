import { hexToOklch } from './color-space';
import type { OklchColor, PaletteInput, PaletteSeeds } from './types';

const NEUTRAL_CHROMA = 0.008;
const STATUS_CHROMA = 0.16;
/** Matizes semânticos fixos; as escalas harmonizam apenas a luminosidade. */
const STATUS_HUES = {
    success: 145,
    error: 25,
    warning: 85,
    info: 245,
} as const;

const rotateHue = (color: OklchColor, degrees: number, chromaFactor: number = 1): OklchColor => ({
    ...color,
    hue: (color.hue + degrees + 360) % 360,
    chroma: color.chroma * chromaFactor,
});

const getGeneratedHues = (input: PaletteInput, base: OklchColor): [number, number] => {
    switch (input.type) {
        case 'monochromatic':
            return [0, 0];
        case 'analogous':
            return [-30, 30];
        case 'complementary':
            return [30, 180];
        case 'split-complementary':
            return [150, 210];
        case 'triadic':
            return [120, 240];
        default:
            return [base.hue, base.hue];
    }
};

const parseOptionalSeed = (value: string | undefined, generated: OklchColor): OklchColor =>
    value ? hexToOklch(value) ?? generated : generated;

const createStatusSeed = (hue: number, base: OklchColor): OklchColor => ({
    lightness: base.lightness,
    chroma: STATUS_CHROMA,
    hue,
});

export const createPaletteSeeds = (input: PaletteInput): PaletteSeeds => {
    const base = hexToOklch(input.base);
    if (!base) throw new Error('A cor base da paleta deve ser um hexadecimal válido.');
    const [secondaryHue, accentHue] = getGeneratedHues(input, base);
    const secondary = parseOptionalSeed(input.secondary, rotateHue(base, secondaryHue, 0.82));
    const accent = parseOptionalSeed(input.accent, rotateHue(base, accentHue, 0.72));
    return {
        primary: base,
        secondary,
        accent,
        neutral: { lightness: base.lightness, chroma: NEUTRAL_CHROMA, hue: base.hue },
        success: createStatusSeed(STATUS_HUES.success, base),
        error: createStatusSeed(STATUS_HUES.error, base),
        warning: createStatusSeed(STATUS_HUES.warning, base),
        info: createStatusSeed(STATUS_HUES.info, base),
    };
};
