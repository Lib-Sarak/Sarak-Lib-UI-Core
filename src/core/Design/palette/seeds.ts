import { hexToOklch } from './color-space';
import type { SarakOklchColor, SarakPaletteInput, SarakPaletteSeeds } from './types';

/** O tingido do fundo: croma OKLCH da neutra, entre o piso e o teto; uma base quase cinza tinge menos, para não virar cor. */
const NEUTRAL_TINT = { min: 0.016, max: 0.026, share: 0.1, saturationGate: 0.03 } as const;
const STATUS_CHROMA = 0.16;
/** Matizes semânticos fixos; as escalas harmonizam apenas a luminosidade. */
const STATUS_HUES = {
    success: 145,
    error: 25,
    warning: 85,
    info: 245,
} as const;

const rotateHue = (color: SarakOklchColor, degrees: number, chromaFactor: number = 1): SarakOklchColor => ({
    ...color,
    hue: (color.hue + degrees + 360) % 360,
    chroma: color.chroma * chromaFactor,
});

const getGeneratedHues = (input: SarakPaletteInput, base: SarakOklchColor): [number, number] => {
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

const parseOptionalSeed = (value: string | undefined, generated: SarakOklchColor): SarakOklchColor =>
    value ? hexToOklch(value) ?? generated : generated;

const createStatusSeed = (hue: number, base: SarakOklchColor): SarakOklchColor => ({
    lightness: base.lightness,
    chroma: STATUS_CHROMA,
    hue,
});

const getNeutralTint = (base: SarakOklchColor): number => {
    const tint = Math.min(NEUTRAL_TINT.max, Math.max(NEUTRAL_TINT.min, base.chroma * NEUTRAL_TINT.share));
    return tint * Math.min(1, base.chroma / NEUTRAL_TINT.saturationGate);
};

export const createPaletteSeeds = (input: SarakPaletteInput): SarakPaletteSeeds => {
    const base = hexToOklch(input.base);
    if (!base) throw new Error('A cor base da paleta deve ser um hexadecimal válido.');
    const [secondaryHue, accentHue] = getGeneratedHues(input, base);
    const secondary = parseOptionalSeed(input.secondary, rotateHue(base, secondaryHue, 0.82));
    const accent = parseOptionalSeed(input.accent, rotateHue(base, accentHue, 0.72));
    return {
        primary: base,
        secondary,
        accent,
        neutral: { lightness: base.lightness, chroma: getNeutralTint(base), hue: base.hue },
        success: createStatusSeed(STATUS_HUES.success, base),
        error: createStatusSeed(STATUS_HUES.error, base),
        warning: createStatusSeed(STATUS_HUES.warning, base),
        info: createStatusSeed(STATUS_HUES.info, base),
    };
};
