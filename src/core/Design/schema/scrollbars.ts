import { ComponentSchema } from '../types';

/**
 * SCROLLBARS SCHEMA (v13.0)
 * Define a estética da navegação vertical e horizontal.
 * Essencial para remover o aspecto de "navegador padrão".
 */
export const ScrollbarsSchema: ComponentSchema = {
    id: 'scrollbars',
    label: 'Barras de Rolagem',
    pilar: 'navigation',
    subcategory: 'Barras de Rolagem',
    tokens: [
        // --- DIMENSÕES ---
        {
            id: 'scrollWidth',
            label: 'Largura da Barra',
            category: 'Dimensões',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 12, step: 1 },
            defaultValue: 6,
            cssVars: ['--sarak-scroll-width']
        },
        {
            id: 'scrollRadius',
            label: 'Arredondamento (Thumb)',
            category: 'Dimensões',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10, step: 1 },
            defaultValue: 10,
            cssVars: ['--sarak-scroll-radius']
        },

        // --- CORES & OPACIDADE ---
        {
            id: 'scrollTrackOpacity',
            label: 'Opacidade do Trilho',
            category: 'Trilho (Track)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.05,
            cssVars: ['--sarak-scroll-track-opacity']
        },
        {
            id: 'scrollThumbColor',
            label: 'Cor do Cursor (Thumb)',
            category: 'Cursor (Thumb)',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-scroll-thumb-color']
        },
        {
            id: 'scrollThumbOpacity',
            label: 'Opacidade (Thumb)',
            category: 'Cursor (Thumb)',
            type: 'slider',
            constraints: { min: 0.1, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-scroll-thumb-opacity']
        },
        {
            id: 'scrollThumbHoverOpacity',
            label: 'Opacidade ao Hover',
            category: 'Cursor (Thumb)',
            type: 'slider',
            constraints: { min: 0.2, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--sarak-scroll-thumb-hover-opacity']
        },

        // --- COMPORTAMENTO ---
        {
            id: 'scrollPadding',
            label: 'Espaçamento (Padding)',
            category: 'Comportamento',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 4, step: 1 },
            defaultValue: 2,
            cssVars: ['--sarak-scroll-padding']
        }
    ]
};
