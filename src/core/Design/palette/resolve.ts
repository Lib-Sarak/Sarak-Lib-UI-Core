import { rgbToHex } from './color-space';
import { parsePaletteValue } from './parser';
import { createPaletteScales } from './scale';
import { createPaletteSeeds } from './seeds';
import { PALETTE_ROLE_MAP } from './role-map';
import { correctPaletteContrast } from './contrast';
import type { PaletteInput, PaletteMode, PaletteScales, RgbColor } from './types';

const formatColor = (rgb: RgbColor, alpha?: number): string => {
    if (alpha === undefined) return rgbToHex(rgb);
    const channels = [rgb.red, rgb.green, rgb.blue].map((channel) => Math.round(channel));
    return `rgba(${channels.join(', ')}, ${Number(alpha.toFixed(3))})`;
};

export const createPaletteColorMap = (scales: PaletteScales, mode: PaletteMode): Record<string, string> => {
    const colors: Record<string, string> = {};
    Object.entries(PALETTE_ROLE_MAP).forEach(([tokenId, role]) => {
        const tone = role.toneByMode[mode];
        colors[tokenId] = formatColor(scales[role.scale][tone], role.alpha);
    });
    return colors;
};

export const resolvePalette = (input: PaletteInput, mode: PaletteMode): Record<string, string> => {
    const seeds = createPaletteSeeds(input);
    const scales = createPaletteScales(seeds);
    return correctPaletteContrast(createPaletteColorMap(scales, mode), scales, mode);
};

export const sarakResolvePalette = (value: string, mode: PaletteMode): Record<string, string> => {
    const input = parsePaletteValue(value);
    if (!input) throw new TypeError('Valor de paleta inválido: use um preset conhecido ou uma entrada customizada válida.');
    return resolvePalette(input, mode);
};

const getPaletteValue = (
    themeDesign: Record<string, unknown>,
    hostConfig?: Record<string, unknown>,
): unknown => themeDesign.colorPalette ?? hostConfig?.colorPalette;

export const resolvePaletteForDesign = (
    themeDesign: Record<string, unknown>,
    hostConfig: Record<string, unknown> | undefined,
    mode: PaletteMode,
): Record<string, string> => {
    const input = parsePaletteValue(getPaletteValue(themeDesign, hostConfig));
    return input ? resolvePalette(input, mode) : {};
};
