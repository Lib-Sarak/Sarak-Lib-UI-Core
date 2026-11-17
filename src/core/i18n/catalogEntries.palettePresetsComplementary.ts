import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes, nos seis idiomas, das paletas prontas complementares. */
export const CATALOG_PALETTE_PRESETS_COMPLEMENTARY = {
    palettePresetSolarEclipse: {
        pt: 'Eclipse solar', en: 'Solar eclipse', es: 'Eclipse solar',
        fr: 'Éclipse solaire', de: 'Sonnenfinsternis', it: 'Eclissi solare',
    },
    palettePresetRubiCorporativo: {
        pt: 'Rubi corporativo', en: 'Corporate ruby', es: 'Rubí corporativo',
        fr: "Rubis d'entreprise", de: 'Corporate Rubin', it: 'Rubino aziendale',
    },
    palettePresetMagmaIndustrial: {
        pt: 'Magma industrial', en: 'Industrial magma', es: 'Magma industrial',
        fr: 'Magma industriel', de: 'Industrielles Magma', it: 'Magma industriale',
    },
    palettePresetNeonCrimson: {
        pt: 'Crimson corporativo', en: 'Corporate crimson', es: 'Crimson corporativo',
        fr: "Crimson d'entreprise", de: 'Corporate Crimson', it: 'Crimson aziendale',
    },
    palettePresetRoyalAmber: {
        pt: 'Âmbar real', en: 'Royal amber', es: 'Ámbar real',
        fr: 'Ambre royal', de: 'Royal Bernstein', it: 'Ambra reale',
    },
    palettePresetEmeraldRoyal: {
        pt: 'Esmeralda real', en: 'Royal emerald', es: 'Esmeralda real',
        fr: 'Émeraude royale', de: 'Royal Smaragd', it: 'Smeraldo reale',
    },
    palettePresetNeonCyberCyan: {
        pt: 'Cyber cyan neon', en: 'Cyber cyan neon', es: 'Cian cyber neón',
        fr: 'Cyan cyber néon', de: 'Cyber Cyan Neon', it: 'Ciano cyber neon',
    },
    palettePresetNeonSunsetGlow: {
        pt: 'Brilho sunset neon', en: 'Neon sunset glow', es: 'Brillo sunset neón',
        fr: 'Éclat sunset néon', de: 'Neon Sunset Glühen', it: 'Luce sunset neon',
    },
    palettePresetContrastMaximumBlue: {
        pt: 'Azul alto contraste', en: 'High contrast blue', es: 'Azul alto contraste',
        fr: 'Bleu haut contraste', de: 'Kontrastreiches Blau', it: 'Blu alto contrasto',
    },
    palettePresetContrastDeepAmber: {
        pt: 'Âmbar alto contraste', en: 'High contrast amber', es: 'Ámbar alto contraste',
        fr: 'Ambre haut contraste', de: 'Kontrastreiches Amber', it: 'Ambra alto contrasto',
    },
    palettePresetContrastCrimsonAlert: {
        pt: 'Crimson de alerta', en: 'Alert crimson', es: 'Crimson de alerta',
        fr: "Crimson d'alerte", de: 'Alarm-Crimson', it: 'Crimson di allerta',
    },
    palettePresetContrastEmeraldOps: {
        pt: 'Esmeralda operações', en: 'Emerald operations', es: 'Esmeralda operaciones',
        fr: 'Opérations émeraude', de: 'Smaragd Operationen', it: 'Operazioni smeraldo',
    },
    palettePresetWarmCorporateCoral: {
        pt: 'Coral corporativo quente', en: 'Warm corporate coral', es: 'Coral corporativo cálido',
        fr: "Corail d'entreprise chaud", de: 'Warmes Korallenrot', it: 'Corale aziendale caldo',
    },
    palettePresetDynamicCrimsonPulse: {
        pt: 'Pulso crimson dinâmico', en: 'Dynamic crimson pulse', es: 'Pulso crimson dinámico',
        fr: 'Impulsion crimson dynamique', de: 'Dynamischer Crimson-Puls', it: 'Polso crimson dinamico',
    },
} satisfies Record<string, LibraryTextEntry>;
