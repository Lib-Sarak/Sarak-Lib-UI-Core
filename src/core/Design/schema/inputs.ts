import { ComponentSchema } from '../types';

/**
 * SCHEMA: CAMPOS DE ENTRADA & FORMULÁRIOS
 * Governa campos de texto, seletores binários e elementos de entrada.
 */
export const InputsSchema: ComponentSchema = {
    id: 'inputs',
    label: 'Campo de Entrada (Input)',
    pilar: 'interaction',
    subcategory: 'Controles de Entrada',
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
        }
    ]
};

