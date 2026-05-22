import { ComponentSchema } from '../types';

/**
 * SCHEMA: PALETAS & CORES
 * Gerencia a linguagem cromática e cores semânticas do sistema.
 */
export const ColorsSchema: ComponentSchema = {
    id: 'colors',
    label: 'Paletas e Gradientes',
    tokens: [
        {
            id: 'colorPalette',
            label: 'Paleta Ativa (Preset)',
            type: 'select',
            defaultValue: 'default',
            options: [
                { value: 'default', label: 'Padrão (Cyberpunk)' },
                { value: 'neon', label: 'Neon Glow' },
                { value: 'matrix', label: 'Green Matrix' },
                { value: 'slate', label: 'Slate Industrial' },
                { value: 'sunset', label: 'Sunset Orange' }
            ]
        },
        {
            id: 'primaryColor',
            label: 'Cor Primária (Base)',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--primary-color', '--theme-primary', '--sarak-primary-color', '--sarak-color-primary']
        },
        {
            id: 'secondaryColor',
            label: 'Cor Secundária',
            type: 'color',
            defaultValue: '#7000ff',
            generateVariants: true,
            cssVars: ['--secondary-color', '--theme-secondary', '--sarak-secondary-color', '--sarak-color-secondary']
        },
        {
            id: 'tertiaryColor',
            label: 'Cor Terciária',
            type: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--tertiary-color', '--theme-tertiary', '--sarak-tertiary-color', '--sarak-color-tertiary']
        },
        {
            id: 'accentColor',
            label: 'Cor de Acento (Accent)',
            type: 'color',
            defaultValue: '#ff00d4',
            cssVars: ['--theme-accent', '--sarak-accent-color']
        },
        {
            id: 'surfaceColor',
            label: 'Cor de Superfície',
            type: 'color',
            defaultValue: '#1e293b',
            cssVars: ['--theme-surface', '--sarak-surface-color']
        },
        {
            id: 'textureColor',
            label: 'Cor da Textura',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--theme-texture-color', '--sarak-texture-color']
        },
        {
            id: 'titleColor',
            label: 'Cor do Título',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--theme-title-color', '--sarak-title-color']
        },
        {
            id: 'colorDepth',
            label: 'Profundidade da Cor',
            type: 'number',
            defaultValue: 1,
            min: 1,
            max: 5,
            cssVars: ['--sarak-color-depth']
        },
        {
            id: 'colorVariation',
            label: 'Variação da Cor',
            type: 'number',
            defaultValue: 1,
            min: 1,
            max: 5,
            cssVars: ['--sarak-color-variation']
        },
        // --- CORES DE SUPERFÍCIE ---
        {
            id: 'colorBgBody',
            label: 'Background Geral (Body)',
            type: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-bg-body', '--theme-bg', '--theme-body', '--bg-body', '--sarak-bg-base']
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
        {
            id: 'colorBgModal',
            label: 'Background Modais',
            type: 'color',
            defaultValue: 'rgba(15, 15, 15, 0.8)',
            cssVars: ['--sarak-bg-modal', '--theme-modal-bg']
        },
        // --- CORES DE COMPONENTES ---
        {
            id: 'cardBackgroundColor',
            label: 'Background dos Cards',
            type: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.6)',
            cssVars: ['--card-bg', '--theme-surface', '--theme-card', '--sarak-card-bg', '--theme-card-bg']
        },
        {
            id: 'cardBorderColor',
            label: 'Borda dos Cards',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color', '--theme-card-border']
        }
    ]
};
