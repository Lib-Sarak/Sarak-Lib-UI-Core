import type { SarakPaletteInput } from './types';

/**
 * O catálogo de paletas prontas. Um preset é só a ENTRADA do cálculo
 * (`{ type, base, secondary, accent }`): a escala, o mapa de papéis e a correção
 * de contraste são do motor, nunca editados aqui. Escolher uma entrada nova é a
 * curadoria; a cor de cada tom sai do cálculo.
 *
 * O id nunca pode ser `default`, `matrix`, `neon`, `slate` nem `sunset`: eram os
 * valores do `colorPalette` antigo (outro significado) e podem estar em tema salvo
 * por importador — um id igual aplicaria uma paleta que ninguém escolheu.
 *
 * Cada preset declara as três sementes: a secundária e o acento chegam à tela (subtítulo, ênfase, gráfico, marcador), então a
 * luminosidade deles foi escolhida junto com a cor. A semente declarada pode sair até 45° do ângulo do tipo; as que passam disso
 * são exceções nomeadas no teste de harmonia. A base de treze presets tem luminosidade OKLCH entre 0,50 e 0,62, onde o texto da
 * marca anda pouco nos dois modos; os outros seis são vivos (base clara) de propósito, e o texto deles anda mais.
 */
export const SARAK_PALETTE_PRESETS: Readonly<Record<string, SarakPaletteInput>> = {
    oceano: { type: 'analogous', base: '#356fed', secondary: '#0070a6', accent: '#7e6ef2' },
    'ciano-violeta': { type: 'triadic', base: '#19e3f0', secondary: '#7e5acc', accent: '#c38400' },
    'ciano-azul': { type: 'analogous', base: '#19e3f0', secondary: '#518133', accent: '#0091c9' },
    'verde-neon': { type: 'complementary', base: '#00ff6a', secondary: '#007f7f', accent: '#d25bcb' },
    'cobalto-vivo': { type: 'complementary', base: '#3c6afa', secondary: '#7a53c4', accent: '#b48630' },
    'azul-projeto': { type: 'complementary', base: '#6fa3d9', secondary: '#8e6099', accent: '#b68852' },
    'amarelo-contraste': { type: 'complementary', base: '#ffd400', secondary: '#3e8343', accent: '#9e6de7' },
    'grafite-rosa': { type: 'triadic', base: '#617b91', secondary: '#ba4760', accent: '#8f914e' },
    'terra-argila': { type: 'monochromatic', base: '#b25c32', secondary: '#83685c', accent: '#c6753b' },
    'oliva-viva': { type: 'monochromatic', base: '#67832a', secondary: '#69735a', accent: '#679647' },
    'oliva-dourada': { type: 'monochromatic', base: '#7d7a15', secondary: '#717156', accent: '#89953b' },
    'ambar-industrial': { type: 'monochromatic', base: '#ff9a1f', secondary: '#806a57', accent: '#bc7d19' },
    'tinta-vinho': { type: 'monochromatic', base: '#b45476', secondary: '#83656e', accent: '#c26578' },
    'tinta-azul': { type: 'monochromatic', base: '#5279ac', secondary: '#676f7a', accent: '#6e8cc3' },
    'rosa-synthwave': { type: 'split-complementary', base: '#d33880', secondary: '#00837e', accent: '#4790d8' },
    'coral-cinetico': { type: 'split-complementary', base: '#d74033', secondary: '#008265', accent: '#0099b3' },
    'verde-tecnico': { type: 'triadic', base: '#218856', secondary: '#346fa9', accent: '#c67600' },
    'ametista-petroleo': { type: 'triadic', base: '#8a62d4', secondary: '#a97e2c', accent: '#007785' },
    'rosa-pastel': { type: 'triadic', base: '#c8425e', secondary: '#558113', accent: '#528ed9' },
};

/** Chave do texto (em `catalogEntries.palette.ts`) que dá nome a cada preset, nos seis idiomas. */
export const SARAK_PALETTE_PRESET_TEXT_KEYS: Readonly<Record<string, string>> = {
    oceano: 'palettePresetOceano',
    'ciano-violeta': 'palettePresetCianoVioleta',
    'ciano-azul': 'palettePresetCianoAzul',
    'verde-neon': 'palettePresetVerdeNeon',
    'cobalto-vivo': 'palettePresetCobaltoVivo',
    'azul-projeto': 'palettePresetAzulProjeto',
    'grafite-rosa': 'palettePresetGrafiteRosa',
    'terra-argila': 'palettePresetTerraArgila',
    'oliva-viva': 'palettePresetOlivaViva',
    'oliva-dourada': 'palettePresetOlivaDourada',
    'amarelo-contraste': 'palettePresetAmareloContraste',
    'ambar-industrial': 'palettePresetAmbarIndustrial',
    'tinta-vinho': 'palettePresetTintaVinho',
    'tinta-azul': 'palettePresetTintaAzul',
    'rosa-synthwave': 'palettePresetRosaSynthwave',
    'coral-cinetico': 'palettePresetCoralCinetico',
    'verde-tecnico': 'palettePresetVerdeTecnico',
    'ametista-petroleo': 'palettePresetAmetistaPetroleo',
    'rosa-pastel': 'palettePresetRosaPastel',
};

/** Os valores do `colorPalette` antigo: nenhum preset pode usá-los como id. */
export const SARAK_LEGACY_PALETTE_IDS: readonly string[] = ['default', 'matrix', 'neon', 'slate', 'sunset'];
