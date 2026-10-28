import { parseHexColor } from './color-space';
import { SARAK_PALETTE_PRESETS } from './presets';
import type { PaletteInput, SarakPaletteType } from './types';

const PALETTE_TYPE_PATTERN = 'monochromatic|analogous|complementary|split-complementary|triadic';
const HEX_PATTERN = '#(?:[0-9a-f]{3}|[0-9a-f]{6})';
const CUSTOM_PALETTE_PATTERN = new RegExp(
    `^custom:(${PALETTE_TYPE_PATTERN}):(${HEX_PATTERN})(?:,sec=(${HEX_PATTERN}))?(?:,acc=(${HEX_PATTERN}))?$`,
    'i',
);

export const parsePaletteValue = (value: unknown): PaletteInput | null => {
    if (typeof value !== 'string') return null;
    const preset = SARAK_PALETTE_PRESETS[value];
    if (preset) return { ...preset };
    const match = value.match(CUSTOM_PALETTE_PATTERN);
    if (!match || !parseHexColor(match[2])) return null;
    if (match[3] && !parseHexColor(match[3])) return null;
    if (match[4] && !parseHexColor(match[4])) return null;
    return {
        type: match[1].toLowerCase() as SarakPaletteType,
        base: match[2],
        ...(match[3] ? { secondary: match[3] } : {}),
        ...(match[4] ? { accent: match[4] } : {}),
    };
};

export const isValidPaletteValue = (value: unknown): value is string => parsePaletteValue(value) !== null;
