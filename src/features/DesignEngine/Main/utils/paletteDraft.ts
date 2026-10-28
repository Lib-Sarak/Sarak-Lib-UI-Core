import { PALETTE_ROLE_MAP } from '../../../../core/Design/palette/role-map';
import { parsePaletteValue } from '../../../../core/Design/palette/parser';
import { resolvePalette } from '../../../../core/Design/palette/resolve';
import { parseHexColor } from '../../../../core/Design/palette/color-space';
import { SARAK_PALETTE_PRESETS, SARAK_PALETTE_PRESET_TEXT_KEYS } from '../../../../core/Design/palette/presets';
import { LIBRARY_TEXT_CATALOG, type LibraryTextKey } from '../../../../core/i18n/catalog';
import type { PaletteInput, PaletteMode, SarakPaletteType } from '../../../../core/Design/palette/types';

/** Ordem em que os tipos aparecem na galeria e no seletor. */
export const PALETTE_TYPES: readonly SarakPaletteType[] = [
    'monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic',
];

/** A chave de texto do nome de cada tipo de paleta. */
export const PALETTE_TYPE_TEXT_KEY: Record<SarakPaletteType, LibraryTextKey> = {
    monochromatic: 'paletteTypeMonochromatic',
    analogous: 'paletteTypeAnalogous',
    complementary: 'paletteTypeComplementary',
    'split-complementary': 'paletteTypeSplitComplementary',
    triadic: 'paletteTypeTriadic',
};

export interface PaletteGalleryEntry {
    id: string;
    /** Recuo: o id legível, usado só quando o preset não tem chave de texto no catálogo. */
    label: string;
    /** A chave do nome do preset no catálogo (seis idiomas); ausente quando o registro não a declara. */
    textKey?: LibraryTextKey;
    input: PaletteInput;
}

export interface PaletteGalleryGroup {
    type: SarakPaletteType;
    entries: PaletteGalleryEntry[];
}

/** A chave de texto do nome de um preset, só se o registro a declara e o catálogo a tem. */
export const presetTextKey = (id: string): LibraryTextKey | undefined => {
    const key = SARAK_PALETTE_PRESET_TEXT_KEYS[id];
    return key !== undefined && key in LIBRARY_TEXT_CATALOG ? (key as LibraryTextKey) : undefined;
};

/** Recuo do rótulo de um preset a partir do id (`ceu-aberto` → `Ceu aberto`). */
export const presetLabel = (id: string): string => {
    const spaced = id.replace(/[-_]+/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Agrupa o registro de presets por tipo, na ordem de `PALETTE_TYPES`; tipo sem preset não gera grupo. */
export const groupPresetsByType = (
    registry: Readonly<Record<string, PaletteInput>> = SARAK_PALETTE_PRESETS,
): PaletteGalleryGroup[] => PALETTE_TYPES
    .map((type) => ({
        type,
        entries: Object.entries(registry)
            .filter(([, input]) => input.type === type)
            .map(([id, input]) => ({ id, label: presetLabel(id), textKey: presetTextKey(id), input })),
    }))
    .filter((group) => group.entries.length > 0);

/** O valor de `colorPalette` de uma criação do usuário: `custom:<tipo>:<#base>[,sec=<#hex>][,acc=<#hex>]`. */
export const buildCustomPaletteValue = (input: PaletteInput): string => {
    const seeds = [
        input.secondary ? `,sec=${input.secondary}` : '',
        input.accent ? `,acc=${input.accent}` : '',
    ].join('');
    return `custom:${input.type}:${input.base}${seeds}`;
};

/** `null` quando alguma cor informada não é um hex que o motor entende. */
export const toValidPaletteInput = (input: PaletteInput): PaletteInput | null => {
    const colors = [input.base, input.secondary, input.accent].filter((color): color is string => color !== undefined);
    if (colors.some((color) => parseHexColor(color) === null)) return null;
    return parsePaletteValue(buildCustomPaletteValue(input)) ? input : null;
};

/** Os tokens de cor que a paleta calcula, no modo pedido; `{}` se o valor não for uma paleta. */
export const resolveDraftPalette = (value: unknown, mode: PaletteMode): Record<string, string> => {
    const input = parsePaletteValue(value);
    return input ? resolvePalette(input, mode) : {};
};

/**
 * Tokens de cor que o usuário ajustou à mão: os que a paleta calcula e cujo valor no rascunho
 * difere da referência (a paleta anterior no modo, ou o design aplicado quando não havia paleta).
 */
export const findManualColorAdjustments = (
    draft: Readonly<Record<string, unknown>>,
    reference: Readonly<Record<string, unknown>>,
): string[] => Object.keys(PALETTE_ROLE_MAP).filter((tokenId) => (
    draft[tokenId] !== undefined && draft[tokenId] !== reference[tokenId]
));

/** O que a troca de paleta grava no rascunho: o valor de `colorPalette` e as cores calculadas, poupando as mantidas. */
export const buildPaletteDraftPatch = (
    value: string,
    mode: PaletteMode,
    keptTokenIds: readonly string[] = [],
): Record<string, string> => {
    const kept = new Set(keptTokenIds);
    const colors = Object.entries(resolveDraftPalette(value, mode)).filter(([tokenId]) => !kept.has(tokenId));
    return { colorPalette: value, ...Object.fromEntries(colors) };
};
