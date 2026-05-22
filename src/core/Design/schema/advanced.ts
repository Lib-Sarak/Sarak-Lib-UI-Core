import { ComponentSchema } from '../types';

/**
 * SCHEMA: COMPONENTES AVANÇADOS
 * Governa componentes de alta complexidade como o SarakExpandableMatrix.
 */
export const AdvancedSchema: ComponentSchema = {
    id: 'advanced',
    label: 'Componentes Avançados',
    tokens: [
        {
            id: 'matrixGap',
            label: 'Espaçamento da Matriz',
            type: 'slider',
            unit: 'px',
            constraints: { min: 4, max: 32 },
            defaultValue: 12,
            cssVars: ['--sarak-matrix-gap']
        },
        {
            id: 'matrixRadius',
            label: 'Arredondamento dos Itens',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-matrix-radius']
        },
        {
            id: 'matrixItemBg',
            label: 'Fundo do Item Pai',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-matrix-item-bg']
        },
        {
            id: 'matrixBorderColor',
            label: 'Cor da Borda Base',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-matrix-border-color']
        },
        {
            id: 'matrixSearchBg',
            label: 'Fundo da Busca',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-matrix-search-bg']
        },
        {
            id: 'matrixBlur',
            label: 'Desfoque de Vidro (Blur)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 10,
            cssVars: ['--sarak-matrix-blur']
        }
    ]
};
