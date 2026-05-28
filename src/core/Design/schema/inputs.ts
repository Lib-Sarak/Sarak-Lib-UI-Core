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
            id: 'inputBorderRadius',
            label: 'Arredondamento (Texto)',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-input-border-radius']
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
            id: 'inputBorderColor',
            label: 'Cor da Borda do Input',
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
            label: 'Cor do Texto do Input',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-input-text-color']
        }
    ]
};

