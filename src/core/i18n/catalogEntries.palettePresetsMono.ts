import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes, nos seis idiomas, das paletas prontas monocromáticas. */
export const CATALOG_PALETTE_PRESETS_MONOCHROMATIC = {
    palettePresetGranitoCinza: {
        pt: 'Granito cinza', en: 'Gray granite', es: 'Granito gris',
        fr: 'Granit gris', de: 'Grauer Granit', it: 'Granito grigio',
    },
    palettePresetBronzeIndustrial: {
        pt: 'Bronze industrial', en: 'Industrial bronze', es: 'Bronce industrial',
        fr: 'Bronze industriel', de: 'Industrielle Bronze', it: 'Bronzo industriale',
    },
    palettePresetIndigoVelvet: {
        pt: 'Veludo índigo', en: 'Indigo velvet', es: 'Terciopelo índigo',
        fr: 'Velours indigo', de: 'Indigo Samt', it: 'Velluto indigo',
    },
    palettePresetEmeraldMist: {
        pt: 'Névoa esmeralda', en: 'Emerald mist', es: 'Niebla esmeralda',
        fr: 'Brume émeraude', de: 'Smaragdnebel', it: 'Nebbia smeraldo',
    },
    palettePresetRubyVelvet: {
        pt: 'Veludo rubi', en: 'Ruby velvet', es: 'Terciopelo rubí',
        fr: 'Velours rubis', de: 'Rubin Samt', it: 'Velluto rubino',
    },
} satisfies Record<string, LibraryTextEntry>;
