import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Cards
 */
export const CardSchema: ComponentSchema = {
    id: 'cards',
    label: 'Cards & Superfícies',
    tokens: [
        {
            id: 'cardBorderRadius',
            label: 'Raio da Borda (Master)',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 60,
            },
            defaultValue: 12,
            cssVars: ['--radius-theme']
        },
        {
            id: 'borderRadiusSm',
            label: 'Raio - Pequeno (SM)',
            category: 'Geometria Escala',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 30,
            },
            defaultValue: 4,
            cssVars: ['--sarak-border-radius-sm']
        },
        {
            id: 'borderRadiusMd',
            label: 'Raio - Médio (MD)',
            category: 'Geometria Escala',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 60,
            },
            defaultValue: 8,
            cssVars: ['--sarak-border-radius-md']
        },
        {
            id: 'borderRadiusLg',
            label: 'Raio - Grande (LG)',
            category: 'Geometria Escala',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 100,
            },
            defaultValue: 12,
            cssVars: ['--sarak-border-radius-lg']
        },
        {
            id: 'cardPadding',
            label: 'Gap Layout (Geral)',
            category: 'Espaçamento',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 80,
            },
            defaultValue: 16,
            cssVars: ['--theme-gap']
        },
        {
            id: 'cardPaddingSm',
            label: 'Padding Card (SM)',
            category: 'Espaçamento Escala',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 40,
            },
            defaultValue: 12,
            cssVars: ['--sarak-card-padding-sm']
        },
        {
            id: 'cardPaddingMd',
            label: 'Padding Card (MD)',
            category: 'Espaçamento Escala',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 80,
            },
            defaultValue: 20,
            cssVars: ['--sarak-card-padding-md']
        },
        {
            id: 'cardPaddingLg',
            label: 'Padding Card (LG)',
            category: 'Espaçamento Escala',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 120,
            },
            defaultValue: 32,
            cssVars: ['--sarak-card-padding-lg']
        },
        {
            id: 'cardBorderStyle',
            label: 'Estilo da Borda',
            category: 'Bordas',
            type: 'select',
            constraints: {
                options: [
                    { id: 'solid', label: 'Sólida' },
                    { id: 'dashed', label: 'Tracejada' },
                    { id: 'dotted', label: 'Pontilhada' },
                    { id: 'double', label: 'Dupla' }
                ],
            },
            defaultValue: 'solid',
            cssVars: ['--card-border-style', '--border-style']
        },
        {
            id: 'cardBorderWidth',
            label: 'Espessura da Borda',
            category: 'Bordas',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 10,
            },
            defaultValue: 1,
            cssVars: ['--card-border-width', '--theme-border-width']
        },
        {
            id: 'cardBorderColor',
            label: 'Cor da Linha',
            category: 'Bordas',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border']
        },
        {
            id: 'cardBackgroundColor',
            label: 'Cor de Fundo',
            category: 'Superfície',
            type: 'color',
            defaultValue: 'rgba(30, 41, 59, 0.4)',
            cssVars: ['--card-bg', '--theme-surface']
        },
        {
            id: 'cardTexture',
            label: 'Textura de Fundo',
            category: 'Superfície',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhuma' },
                    { id: 'dots', label: 'Pontos' },
                    { id: 'grid', label: 'Grelha' },
                    { id: 'circuit', label: 'Circuito' },
                    { id: 'noise', label: 'Ruído Industrial' }
                ],
            },
            defaultValue: 'none',
            cssVars: ['--card-texture']
        },
        {
            id: 'cardNoiseOpacity',
            label: 'Opacidade da Textura',
            category: 'Superfície',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.01,
            },
            defaultValue: 0.08,
            cssVars: ['--card-noise-opacity']
        },
        {
            id: 'cardShadowIntensity',
            label: 'Intensidade da Sombra',
            category: 'Efeitos',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.05,
            },
            defaultValue: 0.3,
            cssVars: ['--card-shadow-intensity']
        },
        {
            id: 'cardHoverColor',
            label: 'Cor Hover',
            category: 'Interação',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-card-hover-color']
        },
        {
            id: 'cardActiveColor',
            label: 'Cor Ativa',
            category: 'Interação',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-card-active-color']
        },
        {
            id: 'cardSpotlight',
            label: 'Opacidade do Spotlight',
            category: 'Interação',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.05,
            },
            defaultValue: 0,
            cssVars: ['--spotlight-opacity']
        },
        {
            id: 'hoverLiftEnabled',
            label: 'Habilitar Elevação (Lift)',
            category: 'Efeitos de Mouse',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'spotlightEnabled',
            label: 'Habilitar Spotlight',
            category: 'Efeitos de Mouse',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'magneticPullEnabled',
            label: 'Tração Magnética',
            category: 'Efeitos de Mouse',
            type: 'boolean',
            defaultValue: false
        },
        {
            id: 'isGeometricCut',
            label: 'Corte Geométrico',
            category: 'Geometria',
            type: 'boolean',
            defaultValue: false
        }
    ]
};
