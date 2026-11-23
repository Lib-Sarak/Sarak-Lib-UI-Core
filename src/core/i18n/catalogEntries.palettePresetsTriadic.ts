import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes, nos seis idiomas, das paletas prontas triádicas. */
export const CATALOG_PALETTE_PRESETS_TRIADIC = {
    palettePresetCyberIndigo: {
        pt: 'Cyber índigo', en: 'Cyber indigo', es: 'Cyber índigo',
        fr: 'Cyber indigo', de: 'Cyber Indigo', it: 'Cyber indigo',
    },
    palettePresetCitrusCorporativo: {
        pt: 'Cítrico corporativo', en: 'Corporate citrus', es: 'Cítrico corporativo',
        fr: "Agrume d'entreprise", de: 'Corporate Citrus', it: 'Agrume aziendale',
    },
    palettePresetAmethystPro: {
        pt: 'Ametista profissional', en: 'Professional amethyst', es: 'Amatista profesional',
        fr: 'Améthyste professionnelle', de: 'Professioneller Amethyst', it: 'Ametista professionale',
    },
    palettePresetTitaniumPro: {
        pt: 'Titânio profissional', en: 'Professional titanium', es: 'Titanio profesional',
        fr: 'Titane professionnel', de: 'Professionelles Titan', it: 'Titanio professionale',
    },
    palettePresetNovaCorporate: {
        pt: 'Nova corporativa', en: 'Corporate nova', es: 'Nova corporativa',
        fr: "Nova d'entreprise", de: 'Corporate Nova', it: 'Nova aziendale',
    },
    palettePresetNeonAcidLime: {
        pt: 'Lima ácida neon', en: 'Neon acid lime', es: 'Lima ácida neón',
        fr: 'Citron vert néon', de: 'Neon Acid Lime', it: 'Lime acido neon',
    },
    palettePresetWarmAmberExecutive: {
        pt: 'Âmbar executivo quente', en: 'Warm executive amber', es: 'Ámbar ejecutivo cálido',
        fr: 'Ambre exécutif chaud', de: 'Warmer Executive Amber', it: 'Ambra esecutiva calda',
    },
    palettePresetWarmRubyExecutive: {
        pt: 'Rubi executivo quente', en: 'Warm executive ruby', es: 'Rubí ejecutivo cálido',
        fr: 'Rubis exécutif chaud', de: 'Warmer Executive Rubin', it: 'Rubino esecutivo caldo',
    },
    palettePresetDynamicVioletTech: {
        pt: 'Violeta tech dinâmico', en: 'Dynamic tech violet', es: 'Violeta tech dinámico',
        fr: 'Violet tech dynamique', de: 'Dynamisches Tech Violett', it: 'Viola tech dinamico',
    },
} satisfies Record<string, LibraryTextEntry>;
