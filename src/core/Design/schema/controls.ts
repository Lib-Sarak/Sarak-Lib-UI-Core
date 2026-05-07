import { ComponentSchema } from '../types';

/**
 * SCHEMA: CONTROLS
 * Define a anatomia de elementos interativos (Buttons, Inputs, Selects).
 */
export const ControlsSchema: ComponentSchema = {
    id: 'controls',
    label: 'Controles & Interação',
    pilar: 'visual',
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

        // --- ESTADOS DE INTERAÇÃO ---
        {
            id: 'controlOpacityDisabled',
            label: 'Opacidade (Desabilitado)',
            category: 'Estado: Desabilitado',
            type: 'slider',
            constraints: { min: 0.1, max: 0.8, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-control-disabled-opacity']
        },
        {
            id: 'controlColorError',
            label: 'Cor de Erro (Input/Border)',
            category: 'Estado: Feedback',
            type: 'color',
            defaultValue: '#ef4444',
            generateVariants: true,
            cssVars: ['--sarak-control-error']
        },
        {
            id: 'controlColorSuccess',
            label: 'Cor de Sucesso (Input/Border)',
            category: 'Estado: Feedback',
            type: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--sarak-control-success']
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

        // --- INPUTS & SELECTS ---
        {
            id: 'inputIconOpacity',
            label: 'Opacidade do Ícone',
            category: 'Inputs: Decoração',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-input-icon-opacity']
        },

        // --- SWITCHES & TOGGLES ---
        {
            id: 'switchTrackBg',
            label: 'Fundo do Trilho (Off)',
            category: 'Switches & Toggles',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-switch-bg']
        },
        {
            id: 'switchTrackActiveBg',
            label: 'Fundo do Trilho (On)',
            category: 'Switches & Toggles',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-switch-active-bg']
        },
        {
            id: 'switchThumbBg',
            label: 'Cor do Botão (Thumb)',
            category: 'Switches & Toggles',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-switch-thumb']
        },
        {
            id: 'switchBorderRadius',
            label: 'Raio do Switch',
            category: 'Switches & Toggles',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-switch-radius']
        },

        // --- CHECKBOXES & RADIOS ---
        {
            id: 'checkboxSize',
            label: 'Tamanho (Checkbox)',
            category: 'Checkboxes & Radios',
            type: 'slider',
            unit: 'px',
            constraints: { min: 12, max: 32 },
            defaultValue: 18,
            cssVars: ['--sarak-checkbox-size']
        },
        {
            id: 'checkboxActiveColor',
            label: 'Cor Selecionada',
            category: 'Checkboxes & Radios',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-checkbox-active']
        },

        // --- INPUTS & SELECTS ---
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
        },
        {
            id: 'inputIconSize',
            label: 'Tamanho do Ícone Interno',
            category: 'Inputs: Estilo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 24 },
            defaultValue: 14,
            cssVars: ['--sarak-input-icon-size']
        }
    ]
};
