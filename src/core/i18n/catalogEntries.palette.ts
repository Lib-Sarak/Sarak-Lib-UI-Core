import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes dos tipos de harmonia oferecidos pelo motor de paletas. */
export const CATALOG_PALETTE = {
    paletteTypeMonochromatic: {
        pt: 'Monocromática', en: 'Monochromatic', es: 'Monocromática',
        fr: 'Monochromatique', de: 'Monochromatisch', it: 'Monocromatica',
    },
    paletteTypeAnalogous: {
        pt: 'Análoga', en: 'Analogous', es: 'Análoga',
        fr: 'Analogue', de: 'Benachbart', it: 'Analoga',
    },
    paletteTypeComplementary: {
        pt: 'Complementar', en: 'Complementary', es: 'Complementaria',
        fr: 'Complémentaire', de: 'Komplementär', it: 'Complementare',
    },
    paletteTypeSplitComplementary: {
        pt: 'Complementar dividida', en: 'Split complementary', es: 'Complementaria dividida',
        fr: 'Complémentaire divisée', de: 'Geteilt komplementär', it: 'Complementare divisa',
    },
    paletteTypeTriadic: {
        pt: 'Triádica', en: 'Triadic', es: 'Triádica',
        fr: 'Triadique', de: 'Triadisch', it: 'Triadica',
    },
} satisfies Record<string, LibraryTextEntry>;
