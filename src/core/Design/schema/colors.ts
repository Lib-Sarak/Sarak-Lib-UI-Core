import { ComponentSchema } from '../types';

/**
 * SCHEMA: PALETAS & CORES
 * Gerencia a linguagem cromática e cores semânticas do sistema.
 */
export const ColorsSchema: ComponentSchema = {
    id: 'colors',
    label: 'Paletas e Gradientes',
    pilar: 'brand',
    subcategory: 'Cores principais e ambiente',
    tokens: [
        {
            id: 'colorPalette',
            label: 'Paleta Ativa (Preset)',
            category: 'Paletas',
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
            category: 'Paletas',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--primary-color', '--theme-primary', '--sarak-primary-color']
        },
        {
            id: 'secondaryColor',
            label: 'Cor Secundária',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#7000ff',
            generateVariants: true,
            cssVars: ['--secondary-color', '--theme-secondary', '--sarak-secondary-color']
        },
        {
            id: 'tertiaryColor',
            label: 'Cor Terciária',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--tertiary-color', '--theme-tertiary', '--sarak-tertiary-color']
        },
        {
            id: 'accentColor',
            label: 'Cor de Acento (Accent)',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#ff00d4',
            cssVars: ['--theme-accent', '--sarak-accent-color']
        },
        {
            id: 'surfaceColor',
            label: 'Cor de Superfície',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#1e293b',
            cssVars: ['--theme-surface', '--sarak-surface-color']
        },
        {
            id: 'textureColor',
            label: 'Cor da Textura',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--theme-texture-color', '--sarak-texture-color']
        },
        {
            id: 'titleColor',
            label: 'Cor do Título',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--theme-title-color', '--sarak-title-color']
        },
        {
            id: 'colorDepth',
            label: 'Profundidade da Cor',
            category: 'Ambiente Cromático',
            type: 'number',
            defaultValue: 1,
            min: 1,
            max: 5,
            cssVars: ['--sarak-color-depth']
        },
        {
            id: 'colorVariation',
            label: 'Variação da Cor',
            category: 'Ambiente Cromático',
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
            category: 'Cores de Superfície',
            type: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-bg-body', '--theme-bg']
        },
        {
            id: 'colorBgLayer1',
            label: 'Background Layer 1',
            category: 'Cores de Superfície',
            type: 'color',
            defaultValue: '#0f0f0f',
            cssVars: ['--sarak-bg-layer-1', '--theme-surface-1']
        },
        {
            id: 'colorBgLayer2',
            label: 'Background Layer 2',
            category: 'Cores de Superfície',
            type: 'color',
            defaultValue: '#1a1a1a',
            cssVars: ['--sarak-bg-layer-2', '--theme-surface-2']
        },
        {
            id: 'colorBgModal',
            label: 'Background Modais',
            category: 'Cores de Superfície',
            type: 'color',
            defaultValue: 'rgba(15, 15, 15, 0.8)',
            cssVars: ['--sarak-bg-modal', '--theme-modal-bg']
        },
        // --- CORES DE COMPONENTES ---
        {
            id: 'cardBackgroundColor',
            label: 'Background dos Cards',
            category: 'Componentes',
            type: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.6)',
            cssVars: ['--card-bg', '--theme-surface', '--theme-card', '--sarak-card-bg', '--theme-card-bg']
        },
        {
            id: 'cardBorderColor',
            label: 'Borda dos Cards',
            category: 'Componentes',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color', '--theme-card-border']
        }
    ]
};
