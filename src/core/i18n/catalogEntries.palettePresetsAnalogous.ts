import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes, nos seis idiomas, das paletas prontas análogas. */
export const CATALOG_PALETTE_PRESETS_ANALOGOUS = {
    palettePresetNeptorAzul: {
        pt: 'Neptor azul', en: 'Neptor blue', es: 'Neptor azul',
        fr: 'Neptor bleu', de: 'Neptor Blau', it: 'Neptor blu',
    },
    palettePresetEsmeraldaCorporate: {
        pt: 'Esmeralda corporativa', en: 'Corporate emerald', es: 'Esmeralda corporativa',
        fr: "Émeraude d'entreprise", de: 'Corporate Smaragd', it: 'Smeraldo aziendale',
    },
    palettePresetTealExecutivo: {
        pt: 'Teal executivo', en: 'Executive teal', es: 'Teal ejecutivo',
        fr: 'Teal exécutif', de: 'Executive Teal', it: 'Teal esecutivo',
    },
    palettePresetSafiraModerna: {
        pt: 'Safira moderna', en: 'Modern sapphire', es: 'Zafiro moderno',
        fr: 'Saphir moderne', de: 'Modernes Saphir', it: 'Zaffiro moderno',
    },
    palettePresetOlivaIndustrial: {
        pt: 'Oliva industrial', en: 'Industrial olive', es: 'Oliva industrial',
        fr: 'Olive industrielle', de: 'Industrielles Oliv', it: 'Oliva industriale',
    },
    palettePresetPetroleoProfundo: {
        pt: 'Petróleo profundo', en: 'Deep petroleum', es: 'Petróleo profundo',
        fr: 'Pétrole profond', de: 'Tiefes Petroleum', it: 'Petrolio profondo',
    },
    palettePresetForestTech: {
        pt: 'Floresta tecnológica', en: 'Tech forest', es: 'Bosque tecnológico',
        fr: 'Forêt technologique', de: 'Technischer Wald', it: 'Foresta tecnologica',
    },
    palettePresetOceanBreeze: {
        pt: 'Brisa do oceano', en: 'Ocean breeze', es: 'Brisa del océano',
        fr: 'Brise océanique', de: 'Meeresbrise', it: 'Brezza oceanica',
    },
    palettePresetArcticExec: {
        pt: 'Ártico executivo', en: 'Executive arctic', es: 'Ártico ejecutivo',
        fr: 'Arctique exécutif', de: 'Executive Arktis', it: 'Artico esecutivo',
    },
    palettePresetNeoMatrix: {
        pt: 'Matrix moderna', en: 'Modern matrix', es: 'Matrix moderna',
        fr: 'Matrice moderne', de: 'Moderne Matrix', it: 'Matrix moderna',
    },
    palettePresetNeonMatrixGreen: {
        pt: 'Matrix neon verde', en: 'Matrix neon green', es: 'Verde matrix neón',
        fr: 'Vert matrix néon', de: 'Matrix Neon Grün', it: 'Verde matrix neon',
    },
    palettePresetSoftLavenderMist: {
        pt: 'Névoa lavanda soft', en: 'Soft lavender mist', es: 'Niebla lavanda suave',
        fr: 'Brume lavande douce', de: 'Sanfter Lavendel', it: 'Nebbia lavanda soft',
    },
    palettePresetSoftSageClean: {
        pt: 'Sálvia clean soft', en: 'Soft sage clean', es: 'Salvia limpia suave',
        fr: 'Sauge propre douce', de: 'Sanfter Salbei', it: 'Salvia clean soft',
    },
    palettePresetSoftRoseQuartz: {
        pt: 'Quartzo rosa soft', en: 'Soft rose quartz', es: 'Cuarzo rosa suave',
        fr: 'Quartz rose doux', de: 'Sanfter Rosenquarz', it: 'Quarzo rosa soft',
    },
    palettePresetSoftSkyMinimal: {
        pt: 'Céu minimal soft', en: 'Soft sky minimal', es: 'Cielo minimal suave',
        fr: 'Ciel minimal doux', de: 'Sanfter Himmel', it: 'Cielo minimal soft',
    },
    palettePresetWarmTerraCotta: {
        pt: 'Terracota quente', en: 'Warm terracotta', es: 'Terracota cálida',
        fr: 'Terracotta chaude', de: 'Warmes Terrakotta', it: 'Terracotta calda',
    },
    palettePresetWarmSunsetGold: {
        pt: 'Ouro pôr do sol', en: 'Sunset gold warm', es: 'Oro atardecer cálido',
        fr: 'Or coucher de soleil chaud', de: 'Sonnenuntergang Gold', it: 'Oro tramonto caldo',
    },
    palettePresetCoolCloudAzure: {
        pt: 'Azure cloud cool', en: 'Cool cloud azure', es: 'Azure cloud frío',
        fr: 'Azure cloud frais', de: 'Kühles Cloud Azure', it: 'Azure cloud cool',
    },
    palettePresetCoolMidnightBlue: {
        pt: 'Azul meia-noite cool', en: 'Cool midnight blue', es: 'Azul medianoche frío',
        fr: 'Bleu minuit frais', de: 'Kühles Mitternachtsblau', it: 'Blu mezzanotte cool',
    },
    palettePresetCoolArcticSteel: {
        pt: 'Aço ártico cool', en: 'Cool arctic steel', es: 'Acero ártico frío',
        fr: 'Acier arctique frais', de: 'Kühler Arktisstahl', it: 'Acciaio artico cool',
    },
    palettePresetDynamicEmeraldFlow: {
        pt: 'Esmeralda flow dinâmico', en: 'Dynamic emerald flow', es: 'Esmeralda flow dinámico',
        fr: 'Flux émeraude dynamique', de: 'Dynamischer Smaragd-Flow', it: 'Flusso smeraldo dinamico',
    },
    palettePresetDynamicIndigoCore: {
        pt: 'Núcleo índigo dinâmico', en: 'Dynamic indigo core', es: 'Núcleo índigo dinámico',
        fr: 'Noyau indigo dynamique', de: 'Dynamischer Indigo-Kern', it: 'Nucleo indigo dinamico',
    },
} satisfies Record<string, LibraryTextEntry>;
