import { parseToRgba } from '../../../../core/Provider/utils/color-engine';

const HEX_LITERAL = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_LITERAL = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[0-9.]+\s*)?\)$/i;
const HEX_RADIX = 16;
const BYTE_CHARS = 2;
const FULL_BYTE = 255;
const LINEAR_KNEE = 0.03928;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const LUMINANCE_RED = 0.2126;
const LUMINANCE_GREEN = 0.7152;
const LUMINANCE_BLUE = 0.0722;
const CONTRAST_OFFSET = 0.05;
// sarak-allow-hardcode: o `<input type="color">` nativo só aceita hex — é o piso do seletor, não cor de tema.
// sarak-allow-fixed-color: o piso do seletor nativo (`<input type="color">` só aceita hex), não cor de tema.
const PICKER_FALLBACK_HEX = '#000000';

/** `true` para hex ou `rgb()`/`rgba()` literal: as únicas formas que dá para medir sem o navegador. */
export const isLiteralColor = (value: string): boolean => HEX_LITERAL.test(value.trim()) || RGB_LITERAL.test(value.trim());

const channel = (n: number): string => Math.min(FULL_BYTE, Math.max(0, Math.round(n))).toString(HEX_RADIX).padStart(BYTE_CHARS, '0');

/** O que o seletor nativo mostra: o canal opaco da cor literal, ou o piso. */
export const toPickerHex = (value: string): string => {
    if (!isLiteralColor(value)) return PICKER_FALLBACK_HEX;
    const { r, g, b } = parseToRgba(value.trim());
    return `#${channel(r)}${channel(g)}${channel(b)}`;
};

const linearChannel = (byte: number): number => {
    const unit = byte / FULL_BYTE;
    return unit <= LINEAR_KNEE ? unit / LINEAR_DIVISOR : ((unit + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
};

const luminance = (value: string): number => {
    const { r, g, b } = parseToRgba(value.trim());
    return LUMINANCE_RED * linearChannel(r) + LUMINANCE_GREEN * linearChannel(g) + LUMINANCE_BLUE * linearChannel(b);
};

/** Razão de contraste WCAG entre duas cores literais; `null` quando alguma não é literal (`var()`, `color-mix()`). */
export const contrastRatio = (first: string, second: string): number | null => {
    if (!isLiteralColor(first) || !isLiteralColor(second)) return null;
    const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + CONTRAST_OFFSET) / (dark + CONTRAST_OFFSET);
};
