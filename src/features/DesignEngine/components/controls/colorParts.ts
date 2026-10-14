import { parseToRgba } from '../../../../core/Provider/utils/color-engine';

/** Cor literal decomposta: o canal opaco em hex de 6 dígitos e o alfa de 0 a 1. */
export interface ColorParts {
    hex: string;
    alpha: number;
}

// sarak-allow-hardcode: o `<input type="color">` nativo só aceita hex — é o piso do seletor, não cor de tema.
// sarak-allow-fixed-color: o piso do seletor nativo (`<input type="color">` só aceita hex), não cor de tema.
const PICKER_FALLBACK_HEX = '#ffffff';
const HEX_LITERAL = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_LITERAL = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[0-9.]+\s*)?\)$/i;
const HSL_LITERAL = /^hsla?\(\s*(-?[\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+)(%?)\s*)?\)$/i;
const VAR_RESERVE = /^var\(--[\w-]+\s*,\s*(.+)\)$/;
const COMPUTED_RGB = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?)\s*)?\)$/i;
const COMPUTED_SRGB = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/i;
const HUE_DEGREES = 360;
const HUE_SECTORS = 6;
const PERCENT = 100;
const FULL_BYTE = 255;
const HEX_RADIX = 16;
const BYTE_CHARS = 2;

const channel = (n: number): string => Math.min(255, Math.max(0, Math.round(n))).toString(HEX_RADIX).padStart(BYTE_CHARS, '0');

const parseAlpha = (raw: string | undefined, percent: string | undefined): number => {
    if (raw === undefined) return 1;
    const parsed = parseFloat(raw);
    return Math.min(1, Math.max(0, percent ? parsed / PERCENT : parsed));
};

/** `hsl()`/`hsla()` → `{ hex, alpha }` (o `<input type="color">` e o alfa do painel só falam hex e 0–1). */
function parseHsl(text: string): ColorParts | null {
    const match = text.match(HSL_LITERAL);
    if (!match) return null;
    const hue = ((parseFloat(match[1]) % HUE_DEGREES) + HUE_DEGREES) % HUE_DEGREES;
    const saturation = Math.min(1, parseFloat(match[2]) / PERCENT);
    const lightness = Math.min(1, parseFloat(match[3]) / PERCENT);
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const sector = hue / (HUE_DEGREES / HUE_SECTORS);
    const second = chroma * (1 - Math.abs((sector % 2) - 1));
    const offset = lightness - chroma / 2;
    const [r, g, b] = [[chroma, second, 0], [second, chroma, 0], [0, chroma, second], [0, second, chroma], [second, 0, chroma], [chroma, 0, second]][Math.min(HUE_SECTORS - 1, Math.floor(sector))];
    const toByte = (unit: number): number => (unit + offset) * FULL_BYTE;
    return { hex: `#${channel(toByte(r))}${channel(toByte(g))}${channel(toByte(b))}`, alpha: parseAlpha(match[4], match[5]) };
}

/** `value` como cor literal (hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`, `transparent`), ou `null` — `var()` e `color-mix()` não são. */
export function parseLiteralColor(value: unknown): ColorParts | null {
    if (typeof value !== 'string') return null;
    const text = value.trim();
    const hsl = parseHsl(text);
    if (hsl) return hsl;
    const isLiteral = HEX_LITERAL.test(text) || RGB_LITERAL.test(text) || text.toLowerCase() === 'transparent';
    if (!isLiteral) return null;
    const { r, g, b, a } = parseToRgba(text);
    return { hex: `#${channel(r)}${channel(g)}${channel(b)}`, alpha: a };
}

/** A cor já resolvida pelo navegador (`rgb()`, `rgba()` ou `color(srgb …)`), como o computado devolve. */
function parseComputedColor(text: string): ColorParts | null {
    const rgb = text.match(COMPUTED_RGB);
    if (rgb) {
        return {
            hex: `#${channel(parseFloat(rgb[1]))}${channel(parseFloat(rgb[2]))}${channel(parseFloat(rgb[3]))}`,
            alpha: parseAlpha(rgb[4], rgb[5]),
        };
    }
    const srgb = text.match(COMPUTED_SRGB);
    if (!srgb) return null;
    const byte = (unit: string): string => channel(parseFloat(unit) * FULL_BYTE);
    return { hex: `#${byte(srgb[1])}${byte(srgb[2])}${byte(srgb[3])}`, alpha: parseAlpha(srgb[4], srgb[5]) };
}

/**
 * Pergunta ao navegador a cor que uma expressão (`var(--x)`, `color-mix(…)`) resolve a ele, com o alfa. Sem
 * documento, ou com o navegador sem suporte (a expressão fica inválida e o computado volta vazio), é `null`.
 */
function probeCssColor(text: string): ColorParts | null {
    if (typeof document === 'undefined' || !document.body) return null;
    const probe = document.createElement('span');
    try {
        probe.style.color = text;
        if (!probe.style.color) return null;
        document.body.appendChild(probe);
        return parseComputedColor(getComputedStyle(probe).color);
    } catch {
        return null;
    } finally {
        probe.remove();
    }
}

/**
 * A cor que `value` desenha, como hex opaco + alfa: o literal, o que o navegador resolve (`var()`,
 * `color-mix()`), ou a reserva literal de um `var(--x, #hex)`. `null` quando nada disso decide — o seletor
 * mostra o piso, mas nunca grava sem o usuário mexer.
 */
export function resolveColorParts(value: unknown): ColorParts | null {
    const direct = parseLiteralColor(value);
    if (direct || typeof value !== 'string') return direct;
    const probed = probeCssColor(value.trim());
    if (probed) return probed;
    const reserve = value.trim().match(VAR_RESERVE);
    return reserve ? parseLiteralColor(reserve[1]) : null;
}

/** O que o seletor nativo mostra: a cor que a expressão desenha, ou o piso. */
export function pickerHex(value: unknown): string {
    return resolveColorParts(value)?.hex ?? PICKER_FALLBACK_HEX;
}

/** Junta o hex opaco ao alfa: alfa cheio fica hex; abaixo disso, `rgba()` (que a validação aceita). */
export function composeColor(hex: string, alpha: number): string {
    if (alpha >= 1) return hex;
    const { r, g, b } = parseToRgba(hex);
    const rounded = Math.round(Math.max(0, alpha) * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${rounded})`;
}
