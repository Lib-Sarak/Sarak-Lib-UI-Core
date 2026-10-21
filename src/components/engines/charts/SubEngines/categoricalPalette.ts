import { contrastRatio, deltaE, hexToRgb, maxChroma, oklchToHex, rgbToOklch } from './oklch';
import type { Oklch } from './oklch';

/**
 * Paleta categórica do gráfico DERIVADA das cores de marca do tema.
 *
 * As quatro primeiras séries partem de `brand` (primária, secundária, destaque e terciária,
 * nesta ordem); as quatro seguintes são variações delas, com a luminosidade empurrada para
 * o outro lado da faixa. Cor de status nunca entra: ela é reservada a estado e vai com
 * ícone e rótulo (regra de cor de status da skill `dataviz`).
 *
 * Cada cor é ajustada ao critério computável do validador da `dataviz`, não ao gosto:
 * luminosidade OKLCH dentro da faixa do modo, croma acima do piso, contraste mínimo contra
 * a superfície, ΔE entre vizinhas ≥ 15 (visão normal) e ≥ 8 (protanopia e deuteranopia).
 * Quando a cor de marca já cumpre, ela passa intacta; senão a derivação a aproxima (a
 * luminosidade e o croma primeiro, depois o matiz).
 */

export type PaletteMode = 'light' | 'dark';

export interface PaletteInput {
    /** Cores de marca em hex, em ordem de série: primária, secundária, destaque, terciária. */
    brand: readonly string[];
    mode: PaletteMode;
    /** Superfície sobre a qual o gráfico é pintado (hex); decide o contraste mínimo. */
    surface: string;
}

export const PALETTE_SIZE = 8;
const BRAND_SLOTS = 4;

const LIGHTNESS_BAND: Record<PaletteMode, readonly [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const CHROMA_FLOOR = 0.10;
const CHROMA_MARGIN = 0.012;
/**
 * Contraste mínimo contra a superfície, do desejado ao tolerado. O validador trata abaixo
 * de 3:1 como alívio (exige rótulo visível ou tabela), não como reprovação — e sobre uma
 * superfície de luminosidade média (um fundo azul-cianótipo) 3:1 dentro da faixa pode não
 * existir. Cada degrau só é usado quando o anterior não deixa nenhuma cor válida.
 */
const CONTRAST_STEPS = [3, 2.5, 2, 1.5] as const;
const LIGHTNESS_STEP = 0.02;
/** Folga interna da faixa: o arredondamento a 8 bits por canal desloca a luminosidade em ~0,003. */
const LIGHTNESS_MARGIN = 0.01;
const SURFACE_DARK_LUMINANCE = 0.18;
const NORMAL_FLOOR = 15;
const CVD_TARGET = 8;
const DISTINCT_FLOOR = 6;
const VARIATION_LIGHTNESS_STEP = 0.15;
const HUE_SHIFTS = [0, 25, -25, 50, -50, 80, -80, 110, -110, 145, -145, 180] as const;
const LIGHTNESS_OFFSETS = [0, -0.06, 0.06, -0.12, 0.12] as const;
const FALLBACK_BRAND = ['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981'] as const;

const isDarkSurface = (surface: string): boolean => {
    const rgb = hexToRgb(surface) ?? [0, 0, 0];
    return rgbToOklch(rgb).L < SURFACE_DARK_LUMINANCE + 0.3;
};

/** Cor OKLCH de croma suficiente no matiz dado, ou `null` se o matiz não alcança o piso nessa luminosidade. */
function colorAt(L: number, target: Oklch, h: number): string | null {
    const reachable = maxChroma(L, h);
    if (reachable < CHROMA_FLOOR + CHROMA_MARGIN / 2) return null;
    const C = Math.min(reachable, Math.max(target.C, CHROMA_FLOOR + CHROMA_MARGIN));
    return oklchToHex({ L, C, h });
}

/**
 * Ajusta um alvo OKLCH ao que o modo e a superfície aceitam. Se o contraste mínimo não
 * fecha, afasta a luminosidade da superfície em passos, dentro da faixa do modo;
 * `null` se nenhuma cor cabe.
 */
function fit(target: Oklch, input: PaletteInput, minContrast: number): string | null {
    const [bandLo, bandHi] = LIGHTNESS_BAND[input.mode];
    const [lo, hi] = [bandLo + LIGHTNESS_MARGIN, bandHi - LIGHTNESS_MARGIN];
    const h = ((target.h % 360) + 360) % 360;
    const direction = isDarkSurface(input.surface) ? LIGHTNESS_STEP : -LIGHTNESS_STEP;
    for (let L = Math.min(hi, Math.max(lo, target.L)); L >= lo - 1e-9 && L <= hi + 1e-9; L += direction) {
        const hex = colorAt(L, target, h);
        if (hex && contrastRatio(hex, input.surface) >= minContrast) return hex;
    }
    return null;
}

function adjacentScore(hex: string, previous: string): number {
    const cvd = Math.min(deltaE(hex, previous, 'protan'), deltaE(hex, previous, 'deutan'));
    return Math.min(deltaE(hex, previous) / NORMAL_FLOOR, cvd / CVD_TARGET);
}

function distinctFromAll(hex: string, chosen: readonly string[]): boolean {
    return chosen.every((other) => deltaE(hex, other) >= DISTINCT_FLOOR);
}

/** Alvos do slot em ordem de preferência: matiz da marca primeiro, depois afastando-se dele. */
function* candidates(target: Oklch, input: PaletteInput, minContrast: number): Generator<string> {
    for (const shift of HUE_SHIFTS) {
        for (const offset of LIGHTNESS_OFFSETS) {
            const hex = fit({ L: target.L + offset, C: target.C, h: target.h + shift }, input, minContrast);
            if (hex) yield hex;
        }
    }
}

interface Pick { hex: string; score: number; accepted: boolean }

function search(target: Oklch, chosen: readonly string[], input: PaletteInput, minContrast: number): Pick | null {
    const previous = chosen[chosen.length - 1];
    let best: Pick | null = null;
    for (const hex of candidates(target, input, minContrast)) {
        const score = previous ? adjacentScore(hex, previous) : 1;
        const accepted = score >= 1 && distinctFromAll(hex, chosen);
        if (accepted) return { hex, score, accepted };
        if (!best || score > best.score) best = { hex, score, accepted };
    }
    return best;
}

/** A primeira cor que cumpre tudo, no maior contraste possível; senão, a que chega mais perto. */
function pickSlot(target: Oklch, chosen: readonly string[], input: PaletteInput): string {
    let fallback: Pick | null = null;
    for (const minContrast of CONTRAST_STEPS) {
        const pick = search(target, chosen, input, minContrast);
        if (pick?.accepted) return pick.hex;
        if (pick && (!fallback || pick.score > fallback.score)) fallback = pick;
    }
    return fallback?.hex ?? FALLBACK_BRAND[0];
}

function brandTarget(hex: string, slot: number): Oklch {
    const rgb = hexToRgb(hex) ?? hexToRgb(FALLBACK_BRAND[slot % FALLBACK_BRAND.length]);
    return rgbToOklch(rgb ?? [0, 0, 0]);
}

function variationTarget(base: string, mode: PaletteMode): Oklch {
    const { L, C, h } = brandTarget(base, 0);
    const [lo, hi] = LIGHTNESS_BAND[mode];
    const towardLight = L < (lo + hi) / 2;
    return { L: towardLight ? L + VARIATION_LIGHTNESS_STEP : L - VARIATION_LIGHTNESS_STEP, C, h };
}

/** As `PALETTE_SIZE` cores categóricas, na ordem das séries. */
export function deriveCategoricalPalette(input: PaletteInput): string[] {
    const chosen: string[] = [];
    for (let slot = 0; slot < PALETTE_SIZE; slot++) {
        const target = slot < BRAND_SLOTS
            ? brandTarget(input.brand[slot] ?? FALLBACK_BRAND[slot], slot)
            : variationTarget(chosen[slot - BRAND_SLOTS], input.mode);
        chosen.push(pickSlot(target, chosen, input));
    }
    return chosen;
}
