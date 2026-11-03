import type { ComponentPreset } from './cards';

/** Sombra: intensidade, cor (por modo, nunca por valor) e projeção. */
export const SHADOW_PRESETS: ComponentPreset[] = [
    {
        id: 'shadow-none',
        name: 'Sem sombra',
        description: 'Tudo no mesmo plano: a hierarquia vem de borda e cor.',
        keywords: ['nenhuma', 'none', 'plano', 'flat'],
        design: { shadowIntensity: 0, layeredShadows: 0, shadowProjectionBlur: 0, shadowProjectionAlpha: 0 },
    },
    {
        id: 'shadow-soft',
        name: 'Suave',
        description: 'Sombra leve e espalhada, só para descolar os blocos do fundo.',
        keywords: ['suave', 'soft', 'leve', 'discreta'],
        design: { shadowIntensity: 0.4, layeredShadows: 1, shadowColorMode: 'neutral', shadowProjectionBlur: 36, shadowProjectionAlpha: 0.15, shadowAmbientAlpha: 0.3 },
    },
    {
        id: 'shadow-defined',
        name: 'Definida',
        description: 'Sombra curta e firme: o contorno dos blocos fica nítido.',
        keywords: ['definida', 'defined', 'firme', 'nitida'],
        design: { shadowIntensity: 1, layeredShadows: 1.2, shadowColorMode: 'neutral', shadowProjectionBlur: 16, shadowProjectionAlpha: 0.35, shadowAmbientAlpha: 0.4 },
    },
    {
        id: 'shadow-colored',
        name: 'Colorida',
        description: 'A sombra toma a cor da marca, como uma luz que vaza por baixo.',
        keywords: ['colorida', 'colored', 'marca', 'tingida'],
        design: { shadowIntensity: 0.9, layeredShadows: 1, shadowColorMode: 'colored', shadowProjectionBlur: 50, shadowProjectionAlpha: 0.3 },
    },
    {
        id: 'shadow-ambient',
        name: 'Ambiente',
        description: 'Sombra larga que segue a cor do fundo, como luz de ambiente.',
        keywords: ['ambiente', 'ambient', 'luz', 'difusa'],
        design: { shadowIntensity: 0.7, layeredShadows: 1, shadowColorMode: 'ambient', shadowAmbientAlpha: 0.65, shadowProjectionBlur: 90, shadowProjectionAlpha: 0.22 },
    },
    {
        id: 'shadow-dramatic',
        name: 'Dramática',
        description: 'Sombra pesada em camadas, com projeção enorme: peso e profundidade.',
        keywords: ['dramatica', 'dramatic', 'pesada', 'profunda'],
        design: { shadowIntensity: 1.7, layeredShadows: 1.7, shadowColorMode: 'neutral', shadowProjectionBlur: 140, shadowProjectionAlpha: 0.45 },
    },
];

/** Direção da sombra: uma opção de `shadowOrientation` por preset. */
export const SHADOW_DIRECTION_PRESETS: ComponentPreset[] = [
    { id: 'shadow-dir-bottom', name: 'Para baixo', description: 'A luz vem de cima e a sombra cai embaixo.', keywords: ['baixo', 'bottom', 'queda'], design: { shadowOrientation: 'bottom' } },
    { id: 'shadow-dir-center', name: 'Centralizada', description: 'A sombra se espalha igual em volta, como um halo.', keywords: ['centro', 'center', 'halo'], design: { shadowOrientation: 'center' } },
    { id: 'shadow-dir-top', name: 'Para cima', description: 'A sombra sobe, como se o bloco flutuasse de baixo para cima.', keywords: ['cima', 'top', 'sobe'], design: { shadowOrientation: 'top' } },
    { id: 'shadow-dir-diagonal', name: 'Diagonal', description: 'A sombra cai para baixo e para a direita.', keywords: ['diagonal', 'direita', 'bottom-right'], design: { shadowOrientation: 'bottom-right' } },
    { id: 'shadow-dir-follow', name: 'Segue a luz', description: 'A sombra muda de lado conforme o ponteiro se move.', keywords: ['dinamica', 'dynamic', 'ponteiro', 'cursor'], design: { shadowOrientation: 'dynamic' } },
];

/** Moldura: uma opção de `borderType` por preset. */
export const BORDER_PRESETS: ComponentPreset[] = [
    { id: 'border-solid', name: 'Sólida', description: 'Contorno comum, de uma linha só.', keywords: ['solida', 'solid', 'simples', 'padrao'], design: { borderType: 'solid' } },
    { id: 'border-cyber', name: 'Técnica', description: 'Moldura com cantos de mira e brilho na cor da textura.', keywords: ['tecnica', 'cyber', 'mira', 'hud'], design: { borderType: 'cyber' } },
    { id: 'border-double', name: 'Dupla', description: 'Duas linhas paralelas, como um filete de moldura clássica.', keywords: ['dupla', 'double', 'filete', 'classica'], design: { borderType: 'double' } },
    { id: 'border-glow', name: 'Com brilho', description: 'Contorno que irradia luz suave para fora.', keywords: ['brilho', 'glow', 'luz', 'neon'], design: { borderType: 'glow' } },
    { id: 'border-none', name: 'Sem moldura', description: 'Sem contorno: os blocos se separam só por fundo e sombra.', keywords: ['sem borda', 'none', 'nenhuma', 'limpa'], design: { borderType: 'none' } },
];

/** Material da superfície: uma opção de `surfaceMaterial` por preset. */
export const MATERIAL_PRESETS: ComponentPreset[] = [
    { id: 'material-frosted', name: 'Vidro fosco', description: 'Superfície translúcida que desfoca o que está atrás.', keywords: ['vidro', 'frosted', 'fosco', 'translucido'], design: { surfaceMaterial: 'frosted' } },
    { id: 'material-sleek', name: 'Polido', description: 'Superfície lisa, com um brilho sutil de acabamento.', keywords: ['polido', 'sleek', 'liso', 'brilho'], design: { surfaceMaterial: 'sleek' } },
    { id: 'material-industrial', name: 'Chapa industrial', description: 'Aparência de chapa de metal, firme e utilitária.', keywords: ['industrial', 'metal', 'chapa', 'aco'], design: { surfaceMaterial: 'industrial' } },
    { id: 'material-organic', name: 'Orgânico fosco', description: 'Acabamento mate e macio, sem reflexo.', keywords: ['organico', 'organic', 'mate', 'fosco'], design: { surfaceMaterial: 'organic' } },
];

/** Vidro: desfoque, opacidade, brilho especular, rugosidade e saturação de `.sarak-glass`. */
export const GLASS_PRESETS: ComponentPreset[] = [
    {
        id: 'glass-clear',
        name: 'Cristalino',
        description: 'Quase transparente, com desfoque leve: dá para ler o que está atrás.',
        keywords: ['cristalino', 'clear', 'transparente', 'leve'],
        design: { glassBlur: 8, glassOpacity: 0.05, glassSpecularity: 0.05, glassSaturation: 1, glassRoughness: 0.02, glassEdgeWidth: 1 },
    },
    {
        id: 'glass-frosted',
        name: 'Fosco',
        description: 'Desfoque médio e opacidade moderada: o vidro fosco de uso geral.',
        keywords: ['fosco', 'frosted', 'padrao', 'medio'],
        design: { glassBlur: 24, glassOpacity: 0.15, glassSpecularity: 0.1, glassSaturation: 1.2, glassRoughness: 0.05, glassEdgeWidth: 1 },
    },
    {
        id: 'glass-crystal',
        name: 'Facetado',
        description: 'Brilho especular alto e borda marcada: parece um cristal lapidado.',
        keywords: ['facetado', 'crystal', 'brilho', 'cristal'],
        design: { glassBlur: 14, glassOpacity: 0.1, glassSpecularity: 0.55, glassSaturation: 1.5, glassRoughness: 0.02, glassEdgeWidth: 2 },
    },
    {
        id: 'glass-heavy',
        name: 'Espesso',
        description: 'Desfoque pesado e opaco: o fundo vira só uma mancha de cor.',
        keywords: ['espesso', 'heavy', 'pesado', 'opaco'],
        design: { glassBlur: 64, glassOpacity: 0.25, glassSpecularity: 0.15, glassSaturation: 1.8, glassRoughness: 0.1, glassEdgeWidth: 1 },
    },
    {
        id: 'glass-vivid',
        name: 'Vívido',
        description: 'Saturação alta e superfície áspera: o vidro realça as cores do fundo.',
        keywords: ['vivido', 'vivid', 'saturado', 'colorido'],
        design: { glassBlur: 40, glassOpacity: 0.2, glassSpecularity: 0.2, glassSaturation: 2.6, glassRoughness: 0.35, glassEdgeWidth: 0 },
    },
];
