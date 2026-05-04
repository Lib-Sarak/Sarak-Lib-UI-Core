import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Tipografia
 */
export const TypographySchema: ComponentSchema = {
    id: 'typography',
    label: 'Tipografia & Escrita',
    tokens: [
        {
            id: 'fontScale',
            label: 'Escala de Fonte',
            category: 'Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'pp', label: 'Extra Pequena (PP)' },
                    { id: 'p', label: 'Pequena (P)' },
                    { id: 'm', label: 'Média (M)' },
                    { id: 'g', label: 'Grande (G)' },
                    { id: 'gg', label: 'Extra Grande (GG)' }
                ],
            },
            defaultValue: 'm',
            cssVars: ['--font-scale']
        },
        {
            id: 'headingFont',
            label: 'Fonte de Títulos',
            category: 'Famílias',
            type: 'font',
            defaultValue: "'Outfit', sans-serif",
            cssVars: ['--font-heading']
        },
        {
            id: 'bodyFont',
            label: 'Fonte de Corpo',
            category: 'Famílias',
            type: 'font',
            defaultValue: "'Inter', sans-serif",
            cssVars: ['--font-main']
        },
        {
            id: 'headingWeight',
            label: 'Peso dos Títulos',
            category: 'Estilo',
            type: 'select',
            constraints: {
                options: [
                    { id: '400', label: 'Regular' },
                    { id: '600', label: 'Semi-Bold' },
                    { id: '700', label: 'Bold' },
                    { id: '900', label: 'Black' }
                ],
            },
            defaultValue: '700',
            cssVars: ['--font-weight-heading']
        },
        {
            id: 'headingLetterSpacing',
            label: 'Espaçamento de Letras',
            category: 'Estilo',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: -5,
                max: 10,
                step: 0.5,
            },
            defaultValue: 0,
            cssVars: ['--letter-spacing-heading']
        }
    ]
};
