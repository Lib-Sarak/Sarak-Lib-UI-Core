import { ComponentSchema } from '../types';

export const TEXTURE_OPTIONS = [
    { value: 'none', label: 'Nenhuma' },
    { value: 'grid', label: 'Grid Técnico' },
    { value: 'dots', label: 'Pontos (Dotted)' },
    { value: 'noise', label: 'Ruído Analógico' },
    { value: 'grain', label: 'Grão Fotográfico' },
    { value: 'mesh', label: 'Mesh Orgânico' },
    { value: 'waves', label: 'Ondas Senoidais' },
    { value: 'squares', label: 'Quadrados Industriais' },
    { value: 'stripes', label: 'Listras Militares' },
    { value: 'topo', label: 'Topografia' },
    { value: 'diamond', label: 'Diamante' },
    { value: 'prestige', label: 'Prestige' },
    { value: 'carbon', label: 'Fibra de Carbono' },
    { value: 'brushed', label: 'Metal Escovado' },
    { value: 'frosted', label: 'Vidro Fosco (Frosted)' },
    { value: 'circuit', label: 'Circuitos (Classic)' },
    { value: 'paper', label: 'Papel Craft' },
    { value: 'scanlines', label: 'Scanlines (CRT)' },
    { value: 'hexagon', label: 'Hexagonais (Céptico)' },
    { value: 'silk', label: 'Seda Líquida' },
    { value: 'blueprint', label: 'Blueprint (Cianótipo)' },
    { value: 'aurora', label: 'Aurora Boreal' },
    { value: 'stars', label: 'Campo Estelar' },
    { value: 'honeycomb', label: 'Favo de Mel' },
    { value: 'isometric', label: 'Projeção Isométrica' },
    { value: 'radar', label: 'Radar Tático' },
    { value: 'crosshatch', label: 'Crosshatch' },
    { value: 'micro-dots', label: 'Micro-Pontos' },
    { value: 'pinstripes', label: 'Pinstripes' },
    { value: 'constellation', label: 'Constelação' },
    { value: 'circuit-pro', label: 'Circuitos (Pro)' },
    { value: 'carbon-tech', label: 'Carbon Tech' },
    { value: 'topo-deep', label: 'Topografia Profunda' },
    { value: 'prism-mesh', label: 'Prism Mesh' },
    { value: 'cyber-binary', label: 'Código Binário' },
    { value: 'blueprint-pro', label: 'Blueprint Pro' },
    { value: 'wave-pulse', label: 'Pulso de Onda' },
    { value: 'wood', label: 'Madeira (Organic)' },
    { value: 'stucco', label: 'Stucco (Parede)' },
    { value: 'fluid', label: 'Fluido Dinâmico' },
    { value: 'nebula', label: 'Nebulosa' }
];

/**
 * Mapeamento 100% Granular: Atmosfera & Ambiente
 */
export const AtmosphereSchema: ComponentSchema = {
    id: 'atmosphere',
    label: 'Fundo e Atmosfera',
    tokens: [
        // --- CORES DE SUPERFÍCIE ---
        {
            id: 'colorBgBody',
            label: 'Fundo Global (Body)',
            type: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-bg-body', '--theme-bg']
        },
        {
            id: 'colorBgLayer1',
            label: 'Background Layer 1',
            type: 'color',
            defaultValue: '#0f0f0f',
            cssVars: ['--sarak-bg-layer-1', '--theme-surface-1']
        },
        {
            id: 'colorBgLayer2',
            label: 'Background Layer 2',
            type: 'color',
            defaultValue: '#1a1a1a',
            cssVars: ['--sarak-bg-layer-2', '--theme-surface-2']
        },
        // --- BACKGROUND GLOBAL ---
        {
            id: 'bgBaseColor',
            label: 'Cor de Fundo Base',
            type: 'color',
            defaultValue: '#0a0a0c',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'bgGradientMode',
            label: 'Modo de Gradiente',
            type: 'select',
            options: [
                { value: 'none', label: 'Sólido' },
                { value: 'linear', label: 'Linear' },
                { value: 'radial', label: 'Radial' },
                { value: 'mesh', label: 'Mesh (Orgânico)' }
            ],
            defaultValue: 'linear',
            cssVars: ['--sarak-bg-gradient-mode']
        },
        {
            id: 'bgGradientAngle',
            label: 'Direção do Gradiente',
            type: 'slider',
            unit: 'deg',
            constraints: { min: 0, max: 360, step: 1 },
            defaultValue: 135,
            cssVars: ['--sarak-bg-gradient-angle']
        },
        // --- MATERIAIS ÓPTICOS ---
        {
            id: 'surfaceMaterial',
            label: 'Material da Superfície',
            type: 'select',
            options: [
                { value: 'frosted', label: 'Vidro Fosco (Frosted)' },
                { value: 'sleek', label: 'Polido (Sleek)' },
                { value: 'industrial', label: 'Industrial Chapa' },
                { value: 'organic', label: 'Orgânico Mate' }
            ],
            defaultValue: 'frosted',
            cssVars: ['--sarak-surface', '--surface-material']
        },
        {
            id: 'surfaceIntensity',
            label: 'Intensidade do Efeito de Superfície',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--surface-intensity', '--sarak-surface-intensity']
        },
        {
            id: 'borderType',
            label: 'Estilo da Moldura (Border)',
            type: 'select',
            options: [
                { value: 'solid', label: 'Sólido Padrão' },
                { value: 'cyber', label: 'Cyber Tech Segmentado' },
                { value: 'double', label: 'Dupla Linha' },
                { value: 'glow', label: 'Neon Glow' },
                { value: 'none', label: 'Sem Moldura' }
            ],
            defaultValue: 'solid',
            cssVars: ['--sarak-border-type', '--border-type']
        },
        {
            id: 'systemTone',
            label: 'Tom do Ambiente',
            type: 'select',
            options: [
                { value: 'dark', label: 'Escuro Profundo' },
                { value: 'light', label: 'Claro Cromado' },
                { value: 'cyber', label: 'Cibernético' },
                { value: 'tactical', label: 'Militar Tático' }
            ],
            defaultValue: 'dark',
            cssVars: ['--sarak-system-tone']
        },

        // --- TEXTURA & RUÍDO ---
        {
            id: 'texture',
            label: 'Textura Industrial (BG)',
            type: 'select',
            options: TEXTURE_OPTIONS,
            defaultValue: 'grid',
            cssVars: ['--sarak-bg-pattern-id', '--theme-texture']
        },
        {
            id: 'textureOpacity',
            label: 'Opacidade da Textura',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.1,
            cssVars: ['--sarak-bg-pattern-opacity', '--theme-texture-opacity']
        },
        {
            id: 'atmosphereNoiseOpacity',
            label: 'Opacidade do Ruído da Atmosfera',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-opacity', '--theme-noise-opacity']
        },
        {
            id: 'noiseIntensity',
            label: 'Intensidade de Ruído',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-opacity', '--theme-noise-opacity']
        },
        {
            id: 'bgNoiseDensity',
            label: 'Densidade de Ruído (BG)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-density']
        },
        {
            id: 'bgNoiseAnimation',
            label: 'Velocidade do Ruído',
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
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 200, step: 1 },
            defaultValue: 16,
            cssVars: ['--sarak-glass-blur']
        },
        {
            id: 'glassOpacity',
            label: 'Opacidade do Vidro',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity']
        },
        {
            id: 'glassSpecularity',
            label: 'Specularity (Brilho de Luz)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--sarak-glass-specularity']
        },
        {
            id: 'glassRoughness',
            label: 'Roughness (Rugosidade)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.05,
            cssVars: ['--sarak-glass-roughness']
        },
        {
            id: 'glassSaturation',
            label: 'Saturação do Vidro',
            type: 'slider',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1.2,
            cssVars: ['--sarak-glass-saturation']
        },

        // --- SOMBRAS E ELEVAÇÃO ---
        {
            id: 'shadowIntensity',
            label: 'Intensidade da Sombra',
            type: 'slider',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 0.5,
            cssVars: ['--shadow-intensity', '--sarak-shadow-intensity']
        },
        {
            id: 'layeredShadows',
            label: 'Sombras em Camadas (Layered)',
            type: 'slider',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1.0,
            cssVars: ['--sarak-layered-shadows']
        },
        {
            id: 'shadowOrientation',
            label: 'Orientação das Sombras',
            type: 'select',
            options: [
                { value: 'bottom', label: 'Projeção Inferior' },
                { value: 'center', label: 'Centro Uniforme' },
                { value: 'top', label: 'Superior Invertida' },
                { value: 'dynamic', label: 'Ângulo Dinâmico' }
            ],
            defaultValue: 'bottom',
            cssVars: ['--shadow-orientation']
        },
        {
            id: 'shadowColorMode',
            label: 'Colorização das Sombras',
            type: 'select',
            options: [
                { value: 'neutral', label: 'Neutro (Preto)' },
                { value: 'colored', label: 'Matizada (Colorida)' },
                { value: 'ambient', label: 'Ambiental Suave' }
            ],
            defaultValue: 'neutral',
            cssVars: ['--shadow-color-mode']
        },
        {
            id: 'shadowAmbientAlpha',
            label: 'Sombra: Contato (Ambient)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-shadow-ambient-alpha']
        },
        {
            id: 'shadowProjectionBlur',
            label: 'Sombra: Projeção (Blur)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 40,
            cssVars: ['--sarak-shadow-projection-blur']
        },
        {
            id: 'shadowProjectionAlpha',
            label: 'Sombra: Projeção (Alpha)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-shadow-projection-alpha']
        },

        // --- ESCUDOS DE SEGURANÇA ---
        {
            id: 'securityShieldGlow',
            label: 'Brilho do Escudo de Segurança',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 10,
            cssVars: ['--sarak-security-glow']
        },
        {
            id: 'securityPulseSpeed',
            label: 'Velocidade do Pulso (Escudo)',
            type: 'slider',
            unit: 's',
            constraints: { min: 0.5, max: 5.0, step: 0.1 },
            defaultValue: 2.0,
            cssVars: ['--sarak-security-pulse']
        },

        // --- EFEITOS CINEMATOGRÁFICOS ---
        {
            id: 'vignetteOpacity',
            label: 'Intensidade do Vignette',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-vignette-opacity']
        },
        {
            id: 'vignetteSoftness',
            label: 'Suavidade das Bordas',
            type: 'slider',
            constraints: { min: 0, max: 200 },
            defaultValue: 50,
            cssVars: ['--sarak-vignette-softness']
        },

        // --- PÓS-PROCESSAMENTO ---
        {
            id: 'globalSaturation',
            label: 'Saturação Global',
            type: 'slider',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-saturation']
        },
        {
            id: 'globalContrast',
            label: 'Contraste Global',
            type: 'slider',
            constraints: { min: 0.5, max: 3.0, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-contrast']
        },
        {
            id: 'contrastCurve',
            label: 'Curva de Contraste Cinematográfico',
            type: 'slider',
            constraints: { min: 0.5, max: 4.0, step: 0.1 },
            defaultValue: 1.0,
            cssVars: ['--contrast-curve', '--sarak-contrast-curve']
        }
    ]
};
