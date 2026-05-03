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
            label: 'Raio da Borda (Geral)',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 60,
            defaultValue: 24,
            cssVars: ['--card-radius']
        },
        {
            id: 'borderRadiusSm',
            label: 'Raio - Pequeno (SM)',
            category: 'Geometria Escala',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 30,
            defaultValue: 12,
            cssVars: ['--radius-sm']
        },
        {
            id: 'borderRadiusMd',
            label: 'Raio - Médio (MD)',
            category: 'Geometria Escala',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 60,
            defaultValue: 24,
            cssVars: ['--radius-md']
        },
        {
            id: 'borderRadiusLg',
            label: 'Raio - Grande (LG)',
            category: 'Geometria Escala',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 100,
            defaultValue: 40,
            cssVars: ['--radius-lg']
        },
        {
            id: 'cardPadding',
            label: 'Padding (Geral)',
            category: 'Espaçamento',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 80,
            defaultValue: 32,
            cssVars: ['--card-padding']
        },
        {
            id: 'cardPaddingSm',
            label: 'Padding - Pequeno (SM)',
            category: 'Espaçamento Escala',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 40,
            defaultValue: 16,
            cssVars: ['--padding-sm']
        },
        {
            id: 'cardPaddingMd',
            label: 'Padding - Médio (MD)',
            category: 'Espaçamento Escala',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 80,
            defaultValue: 32,
            cssVars: ['--padding-md']
        },
        {
            id: 'cardPaddingLg',
            label: 'Padding - Grande (LG)',
            category: 'Espaçamento Escala',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 120,
            defaultValue: 48,
            cssVars: ['--padding-lg']
        },
        {
            id: 'cardBorderStyle',
            label: 'Estilo da Borda',
            category: 'Bordas',
            type: 'select',
            options: [
                { id: 'solid', label: 'Sólida' },
                { id: 'dashed', label: 'Tracejada' },
                { id: 'dotted', label: 'Pontilhada' },
                { id: 'double', label: 'Dupla' }
            ],
            defaultValue: 'solid',
            cssVars: ['--card-border-style', '--border-style']
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
            options: [
                { id: 'none', label: 'Nenhuma' },
                { id: 'dots', label: 'Pontos' },
                { id: 'grid', label: 'Grelha' },
                { id: 'circuit', label: 'Circuito' },
                { id: 'noise', label: 'Ruído Industrial' }
            ],
            defaultValue: 'none',
            cssVars: ['--card-texture']
        },
        {
            id: 'cardNoiseOpacity',
            label: 'Opacidade da Textura',
            category: 'Superfície',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.01,
            defaultValue: 0.08,
            cssVars: ['--card-noise-opacity']
        },
        {
            id: 'cardPadding',
            label: 'Padding Interno',
            category: 'Espaçamento',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 80,
            defaultValue: 24,
            cssVars: ['--card-padding']
        },
        {
            id: 'cardShadowIntensity',
            label: 'Intensidade da Sombra',
            category: 'Efeitos',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.05,
            defaultValue: 0.3,
            cssVars: ['--card-shadow-intensity']
        }
    ]
};
