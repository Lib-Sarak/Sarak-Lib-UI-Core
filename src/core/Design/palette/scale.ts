import { oklchToRgbGamutMapped } from './color-space';
import type { OklchColor, PaletteScaleName, PaletteScales, PaletteSeeds, RgbColor } from './types';

/** Régua compartilhada de luminosidade: mesma hierarquia para qualquer semente. */
export const PALETTE_LIGHTNESS_SCALE = [
    { tone: 50, lightness: 0.98 },
    { tone: 100, lightness: 0.95 },
    { tone: 200, lightness: 0.90 },
    { tone: 300, lightness: 0.82 },
    { tone: 400, lightness: 0.72 },
    { tone: 500, lightness: 0.63 },
    { tone: 600, lightness: 0.53 },
    { tone: 700, lightness: 0.42 },
    { tone: 800, lightness: 0.31 },
    { tone: 900, lightness: 0.22 },
    { tone: 950, lightness: 0.14 },
] as const;

/** Reduz o croma nas pontas da escala para que os tons claros e escuros não vibrem. */
export const PALETTE_CHROMA_CURVE = [0.24, 0.38, 0.56, 0.72, 0.88, 1, 1, 0.9, 0.76, 0.56, 0.34] as const;

const SCALE_NAMES: PaletteScaleName[] = [
    'primary', 'secondary', 'accent', 'neutral', 'success', 'error', 'warning', 'info',
];

const createScale = (seed: OklchColor): Record<number, RgbColor> => {
    const scale: Record<number, RgbColor> = {};
    PALETTE_LIGHTNESS_SCALE.forEach(({ tone, lightness }, index) => {
        const chroma = seed.chroma * PALETTE_CHROMA_CURVE[index];
        scale[tone] = oklchToRgbGamutMapped({ lightness, chroma, hue: seed.hue });
    });
    return scale;
};

export const createPaletteScales = (seeds: PaletteSeeds): PaletteScales => {
    const scales = {} as PaletteScales;
    SCALE_NAMES.forEach((name) => {
        scales[name] = createScale(seeds[name]);
    });
    return scales;
};
