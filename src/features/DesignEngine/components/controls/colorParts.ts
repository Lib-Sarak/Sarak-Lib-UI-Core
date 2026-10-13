import { parseToRgba } from '../../../../core/Provider/utils/color-engine';

/** Cor literal decomposta: o canal opaco em hex de 6 dígitos e o alfa de 0 a 1. */
export interface ColorParts {
    hex: string;
    alpha: number;
}

// sarak-allow-hardcode: o `<input type="color">` nativo só aceita hex — é o piso do seletor, não cor de tema.
const PICKER_FALLBACK_HEX = '#ffffff';
const HEX_LITERAL = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_LITERAL = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[0-9.]+\s*)?\)$/i;
const VAR_RESERVE = /^var\(--[\w-]+\s*,\s*(.+)\)$/;
const HEX_RADIX = 16;
const BYTE_CHARS = 2;

const channel = (n: number): string => Math.min(255, Math.max(0, Math.round(n))).toString(HEX_RADIX).padStart(BYTE_CHARS, '0');

/** `value` como cor literal (hex, `rgb()`/`rgba()`, `transparent`), ou `null` — `var()`, `color-mix()`, `hsl()` não são. */
export function parseLiteralColor(value: unknown): ColorParts | null {
    if (typeof value !== 'string') return null;
    const text = value.trim();
    const isLiteral = HEX_LITERAL.test(text) || RGB_LITERAL.test(text) || text.toLowerCase() === 'transparent';
    if (!isLiteral) return null;
    const { r, g, b, a } = parseToRgba(text);
    return { hex: `#${channel(r)}${channel(g)}${channel(b)}`, alpha: a };
}

/** O que o seletor nativo mostra: a cor literal, a reserva literal de um `var(--x, #hex)`, ou o piso. */
export function pickerHex(value: unknown): string {
    const direct = parseLiteralColor(value);
    if (direct) return direct.hex;
    const reserve = typeof value === 'string' ? value.trim().match(VAR_RESERVE) : null;
    const fromReserve = reserve ? parseLiteralColor(reserve[1]) : null;
    return fromReserve ? fromReserve.hex : PICKER_FALLBACK_HEX;
}

/** Junta o hex opaco ao alfa: alfa cheio fica hex; abaixo disso, `rgba()` (que a validação aceita). */
export function composeColor(hex: string, alpha: number): string {
    if (alpha >= 1) return hex;
    const { r, g, b } = parseToRgba(hex);
    const rounded = Math.round(Math.max(0, alpha) * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${rounded})`;
}
