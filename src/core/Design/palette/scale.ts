import { oklchToRgbGamutMapped } from './color-space';
import type { SarakOklchColor, PaletteScaleName, PaletteScales, SarakPaletteSeeds, RgbColor } from './types';

/** O "tom" da cor da semente, exata: a âncora que o preenchimento da marca usa nos dois modos. */
export const PALETTE_BASE_TONE = 0;

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

/**
 * Régua da neutra, que pinta o fundo: o corpo não é branco nem preto puro (0,965 no claro, 0,165 no escuro) e as
 * camadas vizinhas diferem em pelo menos 0,03 de luminosidade. Os demais tons seguem a régua compartilhada.
 */
export const PALETTE_NEUTRAL_LIGHTNESS_SCALE = [
    { tone: 50, lightness: 0.965 },
    { tone: 100, lightness: 0.933 },
    { tone: 200, lightness: 0.901 },
    { tone: 300, lightness: 0.81 },
    { tone: 400, lightness: 0.72 },
    { tone: 500, lightness: 0.62 },
    { tone: 600, lightness: 0.52 },
    { tone: 700, lightness: 0.40 },
    { tone: 800, lightness: 0.229 },
    { tone: 900, lightness: 0.197 },
    { tone: 950, lightness: 0.165 },
] as const;

/** Reduz o croma nas pontas da escala para que os tons claros e escuros não vibrem. */
export const PALETTE_CHROMA_CURVE = [0.24, 0.38, 0.56, 0.72, 0.88, 1, 1, 0.9, 0.76, 0.56, 0.34] as const;

/** A neutra não reduz o croma nas pontas: é nelas que o fundo carrega o tingido da paleta. */
const NEUTRAL_CHROMA_CURVE = PALETTE_CHROMA_CURVE.map(() => 1);

/**
 * A secundária pinta cabeçalhos, tabela e botão secundário nas pontas da escala; ali o croma é mais baixo que o da
 * curva compartilhada, para o tingido de um matiz distante da base acompanhar o fundo em vez de competir com ele.
 * Os tons do meio (borda, texto, gráfico) seguem a curva compartilhada.
 */
export const PALETTE_SECONDARY_CHROMA_CURVE = [0.14, 0.22, 0.56, 0.72, 0.88, 1, 1, 0.9, 0.76, 0.34, 0.2] as const;

const SCALE_NAMES: PaletteScaleName[] = [
    'primary', 'secondary', 'accent', 'neutral', 'success', 'error', 'warning', 'info',
];

const CHROMA_CURVE_BY_SCALE: Partial<Record<PaletteScaleName, readonly number[]>> = {
    secondary: PALETTE_SECONDARY_CHROMA_CURVE,
};

type ScaleRuler = readonly { tone: number; lightness: number }[];

const createScale = (
    seed: SarakOklchColor,
    ruler: ScaleRuler,
    curve: readonly number[],
): Record<number, RgbColor> => {
    const scale: Record<number, RgbColor> = { [PALETTE_BASE_TONE]: oklchToRgbGamutMapped(seed) };
    ruler.forEach(({ tone, lightness }, index) => {
        const chroma = seed.chroma * curve[index];
        scale[tone] = oklchToRgbGamutMapped({ lightness, chroma, hue: seed.hue });
    });
    return scale;
};

export const createPaletteScales = (seeds: SarakPaletteSeeds): PaletteScales => {
    const scales = {} as PaletteScales;
    SCALE_NAMES.forEach((name) => {
        scales[name] = name === 'neutral'
            ? createScale(seeds[name], PALETTE_NEUTRAL_LIGHTNESS_SCALE, NEUTRAL_CHROMA_CURVE)
            : createScale(seeds[name], PALETTE_LIGHTNESS_SCALE, CHROMA_CURVE_BY_SCALE[name] ?? PALETTE_CHROMA_CURVE);
    });
    return scales;
};
