import { parseToRgba } from './color-engine';

/** Texto escuro e texto claro que o motor oferece sobre uma cor sólida. */
export const ON_COLOR_DARK = '#020617';
export const ON_COLOR_LIGHT = '#ffffff';

const LITERAL_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\(.+\)|transparent)$/i;

/** A cor é um literal que `parseToRgba` entende (hex, `rgb()`/`rgba()`, `transparent`) — `var()` e `color-mix()` não são. */
export const isLiteralColor = (color: unknown): color is string =>
    typeof color === 'string' && LITERAL_COLOR.test(color.trim());

const channelLuminance = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Luminância relativa WCAG de um RGB (0-255). */
export const relativeLuminance = (r: number, g: number, b: number): number =>
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);

/**
 * O texto (`ON_COLOR_DARK` ou `ON_COLOR_LIGHT`) de maior contraste WCAG sobre a cor sólida dada. Com
 * `bg` translúcido, compõe sobre `under` (o fundo que o sustenta) antes de medir. Entre as duas
 * opções a razão nunca fica abaixo de 4,5:1 para uma cor opaca — é o que dispensa o tema de
 * declarar o "texto sobre a cor" de cada badge, botão e bolha.
 */
export const pickOnColor = (bg: string, under: string = '#000000'): string => {
    const top = parseToRgba(bg);
    const base = parseToRgba(under);
    const mix = (a: number, b: number) => top.a * a + (1 - top.a) * b;
    const luminance = relativeLuminance(mix(top.r, base.r), mix(top.g, base.g), mix(top.b, base.b));
    const darkLuminance = relativeLuminance(2, 6, 23);
    const contrastDark = (luminance + 0.05) / (darkLuminance + 0.05);
    const contrastLight = 1.05 / (luminance + 0.05);
    return contrastDark >= contrastLight ? ON_COLOR_DARK : ON_COLOR_LIGHT;
};
