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
            id: 'colorPrimary',
            label: 'Cor Primária (Base)',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--theme-primary', '--sarak-color-primary']
        },
        {
            id: 'colorSecondary',
            label: 'Cor Secundária',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#7000ff',
            generateVariants: true,
            cssVars: ['--theme-secondary', '--sarak-secondary-color']
        },
        {
            id: 'colorAccent',
            label: 'Cor de Acento (Accent)',
            category: 'Paletas',
            type: 'color',
            defaultValue: '#ff00d4',
            cssVars: ['--theme-accent', '--sarak-accent-color']
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
        }
    ]
};
