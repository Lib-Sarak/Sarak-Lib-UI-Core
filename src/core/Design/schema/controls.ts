import { ComponentSchema } from '../types';

/**
 * SCHEMA: CONTROLS
 * Define a anatomia de elementos interativos (Buttons, Inputs, Selects).
 */
export const ControlsSchema: ComponentSchema = {
    id: 'controls',
    label: 'Controles & Interação',
    tokens: [
        // --- ANATOMIA GERAL ---
        {
            id: 'controlHeightMd',
            label: 'Altura (Médio)',
            category: 'Anatomia: Geral',
            type: 'slider',
            unit: 'px',
            constraints: { min: 24, max: 64 },
            defaultValue: 40,
            cssVars: ['--sarak-control-h-md']
        },
        {
            id: 'controlPaddingX',
            label: 'Padding Horizontal',
            category: 'Anatomia: Geral',
            type: 'slider',
            unit: 'px',
            constraints: { min: 4, max: 32 },
            defaultValue: 16,
            cssVars: ['--sarak-control-px']
        },
        {
            id: 'controlBorderWidth',
            label: 'Espessura da Borda',
            category: 'Anatomia: Geral',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 4 },
            defaultValue: 1,
            cssVars: ['--sarak-control-bw']
        },

        // --- FOCUS RING ---
        {
            id: 'focusRingWidth',
            label: 'Largura do Anel',
            category: 'Estado: Foco',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 6 },
            defaultValue: 2,
            cssVars: ['--sarak-focus-width']
        },
        {
            id: 'focusRingOffset',
            label: 'Afastamento (Offset)',
            category: 'Estado: Foco',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 8 },
            defaultValue: 2,
            cssVars: ['--sarak-focus-offset']
        },
        {
            id: 'focusRingColor',
            label: 'Cor do Foco',
            category: 'Estado: Foco',
            type: 'color',
            defaultValue: '#3b82f6',
            cssVars: ['--sarak-focus-color']
        },

        // --- INPUTS & CAMPOS ---
        {
            id: 'inputBgOpacity',
            label: 'Opacidade do Fundo',
            category: 'Inputs: Estilo',
            type: 'slider',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-input-bg-opacity']
        },
        {
            id: 'inputTextSize',
            label: 'Tamanho da Fonte',
            category: 'Inputs: Estilo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 24 },
            defaultValue: 14,
            cssVars: ['--sarak-input-fz']
        }
    ]
};
