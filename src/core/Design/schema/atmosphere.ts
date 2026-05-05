import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Atmosfera & Ambiente
 */
export const AtmosphereSchema: ComponentSchema = {
    id: 'atmosphere',
    label: 'Atmosfera & Ambiente',
    tokens: [
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
            id: 'bgPatternId',
            label: 'ID da Textura (Pattern)',
            category: 'Textura Industrial',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhuma' },
                    { id: 'circuit', label: 'Circuitos' },
                    { id: 'grid', label: 'Grid Técnico' },
                    { id: 'stars', label: 'Estelar' },
                    { id: 'hex', label: 'Hexagonais' }
                ]
            },
            defaultValue: 'grid',
            cssVars: ['--sarak-bg-pattern-id']
        },
        {
            id: 'bgPatternOpacity',
            label: 'Opacidade da Textura',
            category: 'Textura Industrial',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.1,
            cssVars: ['--sarak-bg-pattern-opacity']
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

        // --- GLASSMORPHISM ---
        {
            id: 'glassBlur',
            label: 'Backdrop Blur',
            category: 'Efeitos de Vidro',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100, step: 1 },
            defaultValue: 16,
            cssVars: ['--sarak-glass-blur']
        },
        {
            id: 'glassSaturation',
            label: 'Multiplicador de Saturação',
            category: 'Efeitos de Vidro',
            type: 'slider',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1.2,
            cssVars: ['--sarak-glass-saturation']
        },
        {
            id: 'glassEdgeColor',
            label: 'Cor da Iluminação de Borda',
            category: 'Efeitos de Vidro',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-glass-edge-color']
        },
        {
            id: 'glassEdgeWidth',
            label: 'Largura da Borda de Vidro',
            category: 'Efeitos de Vidro',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 5, step: 0.5 },
            defaultValue: 1,
            cssVars: ['--sarak-glass-edge-width']
        },

        // --- ELEVAÇÃO ---
        {
            id: 'shadowGlobalColor',
            label: 'Cor da Sombra Global',
            category: 'Elevação',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.8)',
            cssVars: ['--sarak-shadow-color']
        },
        {
            id: 'elevationIntensity',
            label: 'Intensidade de Oclusão Ambiente',
            category: 'Elevação',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.3,
            cssVars: ['--sarak-ao-intensity']
        }
    ]
};
