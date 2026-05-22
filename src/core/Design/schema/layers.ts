import { ComponentSchema } from '../types';

/**
 * LAYERS SCHEMA (v13.0)
 * Controla a arquitetura de profundidade e empilhamento.
 * Gerencia Z-Index e a opacidade de camadas de fundo.
 */
export const LayersSchema: ComponentSchema = {
    id: 'layers',
    label: 'Camadas e Profundidade',
    tokens: [
        // --- ARQUITETURA DE Z-INDEX ---
        {
            id: 'zIndexBase',
            label: 'Base Z-Index',
            type: 'slider',
            constraints: { min: 0, max: 100, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-z-base']
        },
        {
            id: 'zIndexSidebar',
            label: 'Sidebar Z-Index',
            type: 'slider',
            constraints: { min: 100, max: 1000, step: 50 },
            defaultValue: 500,
            cssVars: ['--sarak-z-sidebar']
        },
        {
            id: 'zIndexModal',
            label: 'Modal Z-Index',
            type: 'slider',
            constraints: { min: 1000, max: 5000, step: 100 },
            defaultValue: 2000,
            cssVars: ['--sarak-z-modal']
        },
        {
            id: 'zIndexTooltip',
            label: 'Tooltip Z-Index',
            type: 'slider',
            constraints: { min: 5000, max: 9999, step: 100 },
            defaultValue: 9000,
            cssVars: ['--sarak-z-tooltip']
        },

        // --- BACKDROPS ---
        {
            id: 'layerBackdropBlur',
            label: 'Blur do Fundo (Modal)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40, step: 1 },
            defaultValue: 10,
            cssVars: ['--sarak-layer-backdrop-blur']
        },
        {
            id: 'layerBackdropOpacity',
            label: 'Escurecimento do Fundo',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-layer-backdrop-opacity']
        },

        // --- ELEVAÇÃO DINÂMICA ---
        {
            id: 'layerElevationFactor',
            label: 'Fator de Elevação',
            type: 'slider',
            constraints: { min: 0.5, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-layer-elevation-factor']
        }
    ]
};
