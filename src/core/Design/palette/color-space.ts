import type { OklchColor, RgbColor } from './types';

const RGB_MAX = 255;
const GAMUT_ITERATIONS = 20;
const GAMUT_TOLERANCE = 0.000001;

export const parseHexColor = (value: string): RgbColor | null => {
    const normalized = value.trim().replace(/^#/, '');
    const expanded = normalized.length === 3
        ? normalized.split('').map((channel) => `${channel}${channel}`).join('')
        : normalized;
    if (!/^[\da-f]{6}$/i.test(expanded)) return null;
    return {
        red: Number.parseInt(expanded.slice(0, 2), 16),
        green: Number.parseInt(expanded.slice(2, 4), 16),
        blue: Number.parseInt(expanded.slice(4, 6), 16),
    };
};

const srgbToLinear = (channel: number): number => {
    const normalized = channel / RGB_MAX;
    return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (channel: number): number => channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * (channel ** (1 / 2.4)) - 0.055;

export const rgbToOklch = (rgb: RgbColor): OklchColor => {
    const red = srgbToLinear(rgb.red);
    const green = srgbToLinear(rgb.green);
    const blue = srgbToLinear(rgb.blue);
    const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
    const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
    const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
    const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const axisA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const axisB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const chroma = Math.hypot(axisA, axisB);
    const hue = chroma < GAMUT_TOLERANCE ? 0 : (Math.atan2(axisB, axisA) * 180 / Math.PI + 360) % 360;
    return { lightness, chroma, hue };
};

export const hexToOklch = (value: string): OklchColor | null => {
    const rgb = parseHexColor(value);
    return rgb ? rgbToOklch(rgb) : null;
};

export const oklchToRgb = ({ lightness, chroma, hue }: OklchColor): RgbColor => {
    const radians = hue * Math.PI / 180;
    const axisA = chroma * Math.cos(radians);
    const axisB = chroma * Math.sin(radians);
    const l = (lightness + 0.3963377774 * axisA + 0.2158037573 * axisB) ** 3;
    const m = (lightness - 0.1055613458 * axisA - 0.0638541728 * axisB) ** 3;
    const s = (lightness - 0.0894841775 * axisA - 1.291485548 * axisB) ** 3;
    return {
        red: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * RGB_MAX,
        green: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * RGB_MAX,
        blue: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * RGB_MAX,
    };
};

const isInSrgbGamut = ({ red, green, blue }: RgbColor): boolean =>
    [red, green, blue].every((channel) => channel >= -GAMUT_TOLERANCE && channel <= RGB_MAX + GAMUT_TOLERANCE);

export const oklchToRgbGamutMapped = (color: OklchColor): RgbColor => {
    const original = oklchToRgb(color);
    if (isInSrgbGamut(original)) return original;
    let chromaFloor = 0;
    let chromaCeiling = color.chroma;
    let best = oklchToRgb({ ...color, chroma: chromaFloor });
    for (let iteration = 0; iteration < GAMUT_ITERATIONS; iteration += 1) {
        const chroma = (chromaFloor + chromaCeiling) / 2;
        const candidate = oklchToRgb({ ...color, chroma });
        if (isInSrgbGamut(candidate)) {
            chromaFloor = chroma;
            best = candidate;
        } else {
            chromaCeiling = chroma;
        }
    }
    return best;
};

const channelToHex = (channel: number): string => Math.round(Math.max(0, Math.min(RGB_MAX, channel)))
    .toString(16)
    .padStart(2, '0');

export const oklchToHex = (color: OklchColor): string => {
    const rgb = oklchToRgbGamutMapped(color);
    return `#${channelToHex(rgb.red)}${channelToHex(rgb.green)}${channelToHex(rgb.blue)}`;
};

export const rgbToHex = (rgb: RgbColor): string =>
    `#${channelToHex(rgb.red)}${channelToHex(rgb.green)}${channelToHex(rgb.blue)}`;
