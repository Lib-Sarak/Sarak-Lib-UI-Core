/**
 * Matemática de cor em OKLab/OKLCH usada pela paleta categórica do gráfico.
 *
 * Só o que a derivação precisa: sRGB ↔ OKLCH, o maior croma que cabe no gamut sRGB, a
 * distância perceptual (ΔE em OKLab ×100, a mesma métrica do validador da skill
 * `dataviz`) sob visão normal e sob simulação de protanopia/deuteranopia (Machado,
 * Oliveira e Fernandes, 2009, severidade 1.0), e o contraste WCAG.
 */

export interface Oklch { L: number; C: number; h: number }
type Rgb = [number, number, number];
type Lab = [number, number, number];
export type VisionKind = 'normal' | 'protan' | 'deutan';

const MACHADO: Record<Exclude<VisionKind, 'normal'>, number[][]> = {
    protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
};

const GAMUT_SEARCH_STEPS = 18;
const GAMUT_EPSILON = 1e-4;

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** `#rgb` ou `#rrggbb` → sRGB 0..1; `null` se não for um hex. */
export function hexToRgb(hex: string): Rgb | null {
    const raw = hex.trim().replace(/^#/, '');
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as Rgb;
}

export function rgbToHex(rgb: Rgb): string {
    return `#${rgb.map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function linearToLab([r, g, b]: Rgb): Lab {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
    ];
}

function labToLinear([L, a, b]: Lab): Rgb {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
}

export function rgbToOklch(rgb: Rgb): Oklch {
    const [L, a, b] = linearToLab(rgb.map(toLinear) as Rgb);
    const h = (Math.atan2(b, a) * 180) / Math.PI;
    return { L, C: Math.hypot(a, b), h: (h + 360) % 360 };
}

function oklchToLinear({ L, C, h }: Oklch): Rgb {
    const rad = (h * Math.PI) / 180;
    return labToLinear([L, C * Math.cos(rad), C * Math.sin(rad)]);
}

const inGamut = (rgb: Rgb): boolean => rgb.every((c) => c >= -GAMUT_EPSILON && c <= 1 + GAMUT_EPSILON);

/** Maior croma, em `L` e `h` dados, que ainda cabe no sRGB. */
export function maxChroma(L: number, h: number): number {
    let lo = 0;
    let hi = 0.4;
    for (let i = 0; i < GAMUT_SEARCH_STEPS; i++) {
        const mid = (lo + hi) / 2;
        if (inGamut(oklchToLinear({ L, C: mid, h }))) lo = mid;
        else hi = mid;
    }
    return lo;
}

/** OKLCH → hex sRGB, reduzindo o croma até caber no gamut. */
export function oklchToHex(color: Oklch): string {
    const C = Math.min(color.C, maxChroma(color.L, color.h));
    return rgbToHex(oklchToLinear({ ...color, C }).map(toGamma) as Rgb);
}

function simulate(linear: Rgb, kind: VisionKind): Rgb {
    if (kind === 'normal') return linear;
    const m = MACHADO[kind];
    return m.map((row) => clamp01(row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2])) as Rgb;
}

/** ΔE em OKLab ×100 entre dois hex, sob a visão pedida. */
export function deltaE(hexA: string, hexB: string, kind: VisionKind = 'normal'): number {
    const [a, b] = [hexA, hexB].map((hex) => {
        const rgb = hexToRgb(hex) ?? ([0, 0, 0] as Rgb);
        return linearToLab(simulate(rgb.map(toLinear) as Rgb, kind));
    });
    return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function luminance(hex: string): number {
    const [r, g, b] = (hexToRgb(hex) ?? [0, 0, 0]).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre dois hex. */
export function contrastRatio(hexA: string, hexB: string): number {
    const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}
