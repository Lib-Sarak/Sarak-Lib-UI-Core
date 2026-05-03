import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Controles de Interação
 */
export const ControlsSchema: ComponentSchema = {
    id: 'controls',
    label: 'Botões & Inputs',
    tokens: [
        {
            id: 'buttonRadius',
            label: 'Raio do Botão',
            category: 'Botões',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 40,
            defaultValue: 8,
            cssVars: ['--button-radius']
        },
        {
            id: 'buttonPadding',
            label: 'Padding do Botão',
            category: 'Botões',
            type: 'slider',
            unit: 'px',
            min: 4,
            max: 32,
            defaultValue: 12,
            cssVars: ['--button-padding']
        },
        {
            id: 'inputBackgroundColor',
            label: 'Cor de Fundo do Input',
            category: 'Inputs',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--input-bg']
        },
        {
            id: 'inputBorderWidth',
            label: 'Borda do Input',
            category: 'Inputs',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 4,
            defaultValue: 1,
            cssVars: ['--input-border-width']
        },
        {
            id: 'buttonHoverLift',
            label: 'Efeito de Elevação',
            category: 'Feedback',
            type: 'boolean',
            defaultValue: true
        }
    ]
};
