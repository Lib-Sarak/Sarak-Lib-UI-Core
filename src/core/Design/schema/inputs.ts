import { ComponentSchema } from '../types';

/**
 * SCHEMA: CAMPOS DE ENTRADA & FORMULÁRIOS
 * Governa campos de texto, seletores binários e elementos de entrada.
 */
export const InputsSchema: ComponentSchema = {
    id: 'inputs',
    label: 'Campos de Texto (Inputs)',
    pilar: 'interaction',
    subcategory: 'Campos de Texto (Inputs)',
    tokens: [
        {
            id: 'inputBorderRadius',
            label: 'Arredondamento (Texto)',
            category: 'Inputs de Texto',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 8,
            cssVars: ['--sarak-input-border-radius']
        },
        {
            id: 'inputBg',
            label: 'Fundo do Input',
            category: 'Inputs de Texto',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            generateVariants: true,
            cssVars: ['--sarak-input-bg']
        },
        {
            id: 'switchTrackActiveBg',
            label: 'Cor: Switch Ativo',
            category: 'Switches & Toggles',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-switch-active-bg']
        },
        {
            id: 'switchThumbBg',
            label: 'Cor: Switch Botão',
            category: 'Switches & Toggles',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-switch-thumb']
        },
        {
            id: 'checkboxActiveColor',
            label: 'Cor do Check Selecionado',
            category: 'Checkboxes & Radios',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-checkbox-active']
        }
    ]
};
