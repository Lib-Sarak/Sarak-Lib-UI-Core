import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes, nos seis idiomas, das paletas prontas complementares divididas. */
export const CATALOG_PALETTE_PRESETS_SPLIT_COMPLEMENTARY = {
    palettePresetVioletaClinico: {
        pt: 'Violeta clínico', en: 'Clinical violet', es: 'Violeta clínico',
        fr: 'Violet clinique', de: 'Klinisches Violett', it: 'Viola clinico',
    },
    palettePresetBorealAurora: {
        pt: 'Aurora boreal', en: 'Aurora borealis', es: 'Aurora boreal',
        fr: 'Aurore boréale', de: 'Nordlicht', it: 'Aurora boreale',
    },
    palettePresetSunsetCorporate: {
        pt: 'Pôr do sol corporativo', en: 'Corporate sunset', es: 'Atardecer corporativo',
        fr: "Coucher de soleil d'entreprise", de: 'Corporate Sonnenuntergang', it: 'Tramonto aziendale',
    },
    palettePresetSolarFlarePro: {
        pt: 'Labareda solar pro', en: 'Solar flare pro', es: 'Bengala solar pro',
        fr: 'Éruption solaire pro', de: 'Sonneneruption Pro', it: 'Brillamento solare pro',
    },
    palettePresetCyberSlate: {
        pt: 'Ardósia cibernética', en: 'Cyber slate', es: 'Pizarra cibernética',
        fr: 'Ardoise cyber', de: 'Cyber Schiefer', it: 'Ardesia cyber',
    },
    palettePresetNeonElectricPurple: {
        pt: 'Roxo elétrico neon', en: 'Electric purple neon', es: 'Púrpura eléctrico neón',
        fr: 'Violet électrique néon', de: 'Elektrisches Violett', it: 'Viola elettrico neon',
    },
    palettePresetNeonLaserPink: {
        pt: 'Rosa laser neon', en: 'Neon laser pink', es: 'Rosa láser neón',
        fr: 'Rose laser néon', de: 'Neon Laser Pink', it: 'Rosa laser neon',
    },
    palettePresetSoftPeachElegant: {
        pt: 'Pêssego elegante soft', en: 'Soft peach elegant', es: 'Melocotón elegante suave',
        fr: 'Pêche élégante douce', de: 'Sanfter Pfirsich', it: 'Pesca elegante soft',
    },
    palettePresetDynamicAmberSpark: {
        pt: 'Fagulha âmbar dinâmica', en: 'Dynamic amber spark', es: 'Chispa ámbar dinámica',
        fr: 'Étincelle ambre dynamique', de: 'Dynamischer Bernstein-Funke', it: 'Scintilla ambra dinamica',
    },
} satisfies Record<string, LibraryTextEntry>;
