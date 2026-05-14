import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Atmosfera & Ambiente
 */
export const AtmosphereSchema: ComponentSchema = {
    id: 'atmosphere',
    label: 'Ambiente e Atmosfera',
    pilar: 'surfaces',
    subcategory: 'Superfícies',
    tokens: [
        // --- CORES DE SUPERFÍCIE (Duplicado de Branding para Contexto) ---
        {
            id: 'colorBgBody',
            label: 'Fundo Global (Body)',
            category: 'Superfície',
            type: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-bg-body', '--theme-bg']
        },
        {
            id: 'colorBgLayer1',
            label: 'Background Layer 1',
            category: 'Superfície',
            type: 'color',
            defaultValue: '#0f0f0f',
            cssVars: ['--sarak-bg-layer-1', '--theme-surface-1']
        },
        {
            id: 'colorBgLayer2',
            label: 'Background Layer 2',
            category: 'Superfície',
            type: 'color',
            defaultValue: '#1a1a1a',
            cssVars: ['--sarak-bg-layer-2', '--theme-surface-2']
        },
        // --- BACKGROUND GLOBAL ---
        {
            id: 'bgBaseColor',
            label: 'Cor de Fundo Base',
            category: 'Superfície',
            type: 'color',
            defaultValue: '#0a0a0c',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'bgGradientMode',
            label: 'Modo de Gradiente',
            category: 'Superfície',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Sólido' },
                    { id: 'linear', label: 'Linear' },
                    { id: 'radial', label: 'Radial' },
                    { id: 'mesh', label: 'Mesh (Orgânico)' }
                ]
            },
            defaultValue: 'linear',
            cssVars: ['--sarak-bg-gradient-mode']
        },
        {
            id: 'bgGradientAngle',
            label: 'Direção do Gradiente',
            category: 'Superfície',
            type: 'slider',
            unit: 'deg',
            constraints: { min: 0, max: 360, step: 1 },
            defaultValue: 135,
            cssVars: ['--sarak-bg-gradient-angle']
        },

        // --- TEXTURA & RUÍDO ---
        {
            id: 'texture',
            label: 'Textura Industrial (BG)',
            category: 'Textura Industrial',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhuma' },
                    { id: 'grid', label: 'Grid Técnico' },
                    { id: 'dots', label: 'Pontos (Dotted)' },
                    { id: 'noise', label: 'Ruído Analógico' },
                    { id: 'grain', label: 'Grão Fotográfico' },
                    { id: 'mesh', label: 'Mesh Orgânico' },
                    { id: 'waves', label: 'Ondas Senoidais' },
                    { id: 'squares', label: 'Quadrados Industriais' },
                    { id: 'stripes', label: 'Listras Militares' },
                    { id: 'topo', label: 'Topografia' },
                    { id: 'diamond', label: 'Diamante' },
                    { id: 'prestige', label: 'Prestige' },
                    { id: 'carbon', label: 'Fibra de Carbono' },
                    { id: 'brushed', label: 'Metal Escovado' },
                    { id: 'frosted', label: 'Vidro Fosco (Frosted)' },
                    { id: 'circuit', label: 'Circuitos (Classic)' },
                    { id: 'paper', label: 'Papel Craft' },
                    { id: 'scanlines', label: 'Scanlines (CRT)' },
                    { id: 'hexagon', label: 'Hexagonais (Céptico)' },
                    { id: 'silk', label: 'Seda Líquida' },
                    { id: 'blueprint', label: 'Blueprint (Cianótipo)' },
                    { id: 'aurora', label: 'Aurora Boreal' },
                    { id: 'stars', label: 'Campo Estelar' },
                    { id: 'honeycomb', label: 'Favo de Mel' },
                    { id: 'isometric', label: 'Projeção Isométrica' },
                    { id: 'radar', label: 'Radar Tático' },
                    { id: 'crosshatch', label: 'Crosshatch' },
                    { id: 'micro-dots', label: 'Micro-Pontos' },
                    { id: 'pinstripes', label: 'Pinstripes' },
                    { id: 'constellation', label: 'Constelação' },
                    { id: 'circuit-pro', label: 'Circuitos (Pro)' },
                    { id: 'carbon-tech', label: 'Carbon Tech' },
                    { id: 'topo-deep', label: 'Topografia Profunda' },
                    { id: 'prism-mesh', label: 'Prism Mesh' },
                    { id: 'cyber-binary', label: 'Código Binário' },
                    { id: 'blueprint-pro', label: 'Blueprint Pro' },
                    { id: 'wave-pulse', label: 'Pulso de Onda' },
                    { id: 'wood', label: 'Madeira (Organic)' },
                    { id: 'stucco', label: 'Stucco (Parede)' },
                    { id: 'fluid', label: 'Fluido Dinâmico' },
                    { id: 'nebula', label: 'Nebulosa' }
                ]
            },
            defaultValue: 'grid',
            cssVars: ['--sarak-bg-pattern-id', '--theme-texture']
        },
        {
            id: 'textureOpacity',
            label: 'Opacidade da Textura',
            category: 'Textura Industrial',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.1,
            cssVars: ['--sarak-bg-pattern-opacity', '--theme-texture-opacity']
        },
        {
            id: 'bgNoiseDensity',
            label: 'Densidade de Ruído',
            category: 'Ruído Industrial',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-density']
        },
        {
            id: 'bgNoiseAnimation',
            label: 'Velocidade do Ruído',
            category: 'Ruído Industrial',
            type: 'slider',
            unit: 's',
            constraints: { min: 0, max: 10, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-noise-speed']
        },

        // --- GLASSMORPHISM PRO ---
        {
            id: 'glassBlur',
            label: 'Backdrop Blur (Profundidade)',
            category: 'Vidro: Óptica',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100, step: 1 },
            defaultValue: 16,
            cssVars: ['--sarak-glass-blur']
        },
        {
            id: 'glassSpecularity',
            label: 'Specularity (Brilho de Luz)',
            category: 'Vidro: Óptica',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--sarak-glass-specularity']
        },
        {
            id: 'glassRoughness',
            label: 'Roughness (Rugosidade)',
            category: 'Vidro: Óptica',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.05,
            cssVars: ['--sarak-glass-roughness']
        },
        {
            id: 'glassSaturation',
            label: 'Saturação do Vidro',
            category: 'Vidro: Óptica',
            type: 'slider',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1.2,
            cssVars: ['--sarak-glass-saturation']
        },

        // --- ORQUESTRAÇÃO DE SOMBRAS (ELEVAÇÃO) ---
        {
            id: 'shadowAmbientAlpha',
            label: 'Sombra: Contato (Ambient)',
            category: 'Sombras: Avançado',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-shadow-ambient-alpha']
        },
        {
            id: 'shadowProjectionBlur',
            label: 'Sombra: Projeção (Blur)',
            category: 'Sombras: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 40,
            cssVars: ['--sarak-shadow-projection-blur']
        },
        {
            id: 'shadowProjectionAlpha',
            label: 'Sombra: Projeção (Alpha)',
            category: 'Sombras: Avançado',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-shadow-projection-alpha']
        },

        // --- EFEITOS CINEMATOGRÁFICOS ---
        {
            id: 'vignetteOpacity',
            label: 'Intensidade do Vignette',
            category: 'Câmera & Viewport',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-vignette-opacity']
        },
        {
            id: 'vignetteSoftness',
            label: 'Suavidade das Bordas',
            category: 'Câmera & Viewport',
            type: 'slider',
            constraints: { min: 0, max: 100 },
            defaultValue: 50,
            cssVars: ['--sarak-vignette-softness']
        },

        // --- PÓS-PROCESSAMENTO ---
        {
            id: 'globalSaturation',
            label: 'Saturação Global',
            category: 'Pós-Processamento',
            type: 'slider',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-saturation']
        },
        {
            id: 'globalContrast',
            label: 'Contraste Global',
            category: 'Pós-Processamento',
            type: 'slider',
            constraints: { min: 0.5, max: 1.5, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-contrast']
        }
    ]
};
