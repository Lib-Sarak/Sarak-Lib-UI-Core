import { ComponentSchema } from '../types';

/**
 * SCHEMA: CAMPOS DE ENTRADA & FORMULÁRIOS
 * Governa campos de texto, seletores binários e elementos de entrada.
 */
export const InputsSchema: ComponentSchema = {
    id: 'inputs',
    label: 'Campo de Entrada (Input)',
    tokens: [
        {
            id: 'formLayoutDirection',
            label: 'Direção do Formulário',
            type: 'select',
            constraints: {
                options: [
                    { id: 'stack', value: 'stack', label: 'Empilhado (Top)' },
                    { id: 'inline', value: 'inline', label: 'Em linha (Left)' }
                ]
            },
            defaultValue: 'stack'
        },
        {
            id: 'inputIconPosition',
            label: 'Posição do Ícone',
            type: 'select',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left'
        },
        {
            id: 'inputBorderRadius',
            label: 'Arredondamento',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-input-border-radius']
        },
        {
            id: 'inputPadding',
            label: 'Espaçamento Interno (Y)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 32 },
            defaultValue: 12,
            cssVars: ['--sarak-input-padding']
        },
        {
            id: 'inputBorderType',
            label: 'Estilo da Borda',
            type: 'select',
            options: [
                { id: 'solid', label: 'Sólida' },
                { id: 'dashed', label: 'Tracejada' },
                { id: 'none', label: 'Nenhuma' },
                { id: 'underline', label: 'Apenas Linha Inferior' }
            ],
            defaultValue: 'solid',
            cssVars: ['--sarak-input-border-type']
        },
        {
            id: 'inputBg',
            label: 'Fundo do Input',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            generateVariants: true,
            cssVars: ['--sarak-input-bg']
        },
        {
            id: 'inputBackdropBlur',
            label: 'Desfoque de Fundo (Blur)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 0,
            cssVars: ['--sarak-input-backdrop-blur']
        },
        {
            id: 'inputShadow',
            label: 'Sombra / Neumorphism',
            type: 'text',
            defaultValue: 'none',
            cssVars: ['--sarak-input-shadow']
        },
        {
            id: 'inputBorderColor',
            label: 'Cor da Borda',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-input-border-color']
        },
        {
            id: 'inputFocusBorderColor',
            label: 'Cor da Borda (Foco)',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-input-focus-border-color']
        },
        {
            id: 'inputTextColor',
            label: 'Cor do Texto',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-input-text-color']
        },
        {
            id: 'inputIconColor',
            label: 'Cor dos Ícones',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.5)',
            cssVars: ['--sarak-input-icon-color']
        },
        {
            id: 'inputErrorColor',
            label: 'Cor de Erro',
            type: 'color',
            defaultValue: '#ff4d4f',
            cssVars: ['--sarak-input-error-color']
        },
        {
            id: 'inputSuccessColor',
            label: 'Cor de Sucesso',
            type: 'color',
            defaultValue: '#52c41a',
            cssVars: ['--sarak-input-success-color']
        },

        // --- MULTI-SELECT (Spec 27) ---
        {
            id: 'multiSelectInputMinWidth',
            label: 'Multi-Select: Largura Mínima do Input Interno',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 2, max: 16 },
            defaultValue: 6,
            cssVars: ['--sarak-multi-select-input-min-width']
        },

        // --- COMMAND SEARCH / PALETTE (Spec 27) ---
        {
            id: 'searchBackdropBlur',
            label: 'Search Palette: Desfoque do Backdrop',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 8,
            cssVars: ['--sarak-search-backdrop-blur']
        }
    ]
};
