import type { SarakPaletteInput } from './types';

/**
 * O catálogo de paletas prontas. Um preset é só a ENTRADA do cálculo
 * (`{ type, base, secondary?, accent? }`): a escala, o mapa de papéis e a correção
 * de contraste são do motor, nunca editados aqui. Escolher uma entrada nova é a
 * curadoria; a cor de cada tom sai do cálculo.
 *
 * O id nunca pode ser `default`, `matrix`, `neon`, `slate` nem `sunset`: eram os
 * valores do `colorPalette` antigo (outro significado) e podem estar em tema salvo
 * por importador — um id igual aplicaria uma paleta que ninguém escolheu.
 *
 * A semente que o preset não declara sai do ângulo do tipo; a que declara fica a até 15° dele. A base de dez presets
 * tem luminosidade OKLCH entre 0,55 e 0,60, onde o texto da marca anda pouco nos dois modos; os outros cinco são
 * vivos (base clara ou de croma baixo) de propósito, e o texto deles anda mais.
 */
export const SARAK_PALETTE_PRESETS: Readonly<Record<string, SarakPaletteInput>> = {
    oceano: { type: 'analogous', base: '#356fed' },
    'ciano-violeta': { type: 'analogous', base: '#19e3f0' },
    'verde-neon': { type: 'complementary', base: '#00ff6a' },
    'cobalto-vivo': { type: 'complementary', base: '#3c6afa' },
    'azul-projeto': { type: 'complementary', base: '#6fa3d9' },
    'amarelo-contraste': { type: 'complementary', base: '#ffd400' },
    'grafite-rosa': { type: 'triadic', base: '#647a8c', secondary: '#c1657e', accent: '#75894b' },
    'terra-argila': { type: 'monochromatic', base: '#687f39' },
    'ambar-industrial': { type: 'monochromatic', base: '#ff9a1f' },
    'tinta-vinho': { type: 'monochromatic', base: '#857461' },
    'rosa-synthwave': { type: 'split-complementary', base: '#d33880' },
    'coral-cinetico': { type: 'split-complementary', base: '#d74033' },
    'verde-tecnico': { type: 'triadic', base: '#218856' },
    'ametista-petroleo': { type: 'triadic', base: '#8465c2' },
    'rosa-pastel': { type: 'triadic', base: '#ce475c' },
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
