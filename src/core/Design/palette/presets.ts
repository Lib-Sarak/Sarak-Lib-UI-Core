import type { PaletteInput } from './types';

/**
 * O catálogo de paletas prontas. Um preset é só a ENTRADA do cálculo
 * (`{ type, base, secondary?, accent? }`): a escala, o mapa de papéis e a correção
 * de contraste são do motor, nunca editados aqui. Escolher uma entrada nova é a
 * curadoria; a cor de cada tom sai do cálculo.
 *
 * O id nunca pode ser `default`, `matrix`, `neon`, `slate` nem `sunset`: eram os
 * valores do `colorPalette` antigo (outro significado) e podem estar em tema salvo
 * por importador — um id igual aplicaria uma paleta que ninguém escolheu.
 */
export const SARAK_PALETTE_PRESETS: Readonly<Record<string, PaletteInput>> = {
    oceano: { type: 'analogous', base: '#2563eb' },
    'ciano-violeta': { type: 'analogous', base: '#19e3f0', secondary: '#7c5cff', accent: '#ff4fd8' },
    'verde-neon': { type: 'complementary', base: '#00ff6a', secondary: '#ff2bd6', accent: '#f9f871' },
    'cobalto-vivo': { type: 'complementary', base: '#2f5bff', secondary: '#cc2a73', accent: '#946c00' },
    'azul-projeto': { type: 'complementary', base: '#6fa3d9', secondary: '#bfe0ff', accent: '#ff6b6b' },
    'grafite-rosa': { type: 'complementary', base: '#526473', secondary: '#657b8d', accent: '#b43151' },
    'terra-argila': { type: 'complementary', base: '#3d4a24', secondary: '#a4532e', accent: '#a4532e' },
    'amarelo-contraste': { type: 'complementary', base: '#ffd400', secondary: '#5ce1ff', accent: '#ffd400' },
    'ambar-industrial': { type: 'monochromatic', base: '#ff9a1f', secondary: '#8a7a62', accent: '#ff3b1f' },
    'tinta-vinho': { type: 'monochromatic', base: '#6b6256', secondary: '#8a7f70', accent: '#9b1c2c' },
    'rosa-synthwave': { type: 'split-complementary', base: '#ff2e97', secondary: '#ff9e2c', accent: '#2de2e6' },
    'coral-cinetico': { type: 'split-complementary', base: '#ff3d2e', secondary: '#ffb000', accent: '#2ee6a6' },
    'verde-tecnico': { type: 'triadic', base: '#007a49', secondary: '#2b6cb0', accent: '#9b6200' },
    'ametista-petroleo': { type: 'triadic', base: '#6d4fa8', secondary: '#327d75', accent: '#b85381' },
    'rosa-pastel': { type: 'triadic', base: '#b02a45', secondary: '#7cc6fe', accent: '#ffd166' },
};

/** Chave do texto (em `catalogEntries.palette.ts`) que dá nome a cada preset, nos seis idiomas. */
export const SARAK_PALETTE_PRESET_TEXT_KEYS: Readonly<Record<string, string>> = {
    oceano: 'palettePresetOceano',
    'ciano-violeta': 'palettePresetCianoVioleta',
    'verde-neon': 'palettePresetVerdeNeon',
    'cobalto-vivo': 'palettePresetCobaltoVivo',
    'azul-projeto': 'palettePresetAzulProjeto',
    'grafite-rosa': 'palettePresetGrafiteRosa',
    'terra-argila': 'palettePresetTerraArgila',
    'amarelo-contraste': 'palettePresetAmareloContraste',
    'ambar-industrial': 'palettePresetAmbarIndustrial',
    'tinta-vinho': 'palettePresetTintaVinho',
    'rosa-synthwave': 'palettePresetRosaSynthwave',
    'coral-cinetico': 'palettePresetCoralCinetico',
    'verde-tecnico': 'palettePresetVerdeTecnico',
    'ametista-petroleo': 'palettePresetAmetistaPetroleo',
    'rosa-pastel': 'palettePresetRosaPastel',
};

/** Os valores do `colorPalette` antigo: nenhum preset pode usá-los como id. */
export const SARAK_LEGACY_PALETTE_IDS: readonly string[] = ['default', 'matrix', 'neon', 'slate', 'sunset'];
