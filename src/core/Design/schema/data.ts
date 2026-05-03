import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Visualização de Dados
 */
export const DataSchema: ComponentSchema = {
    id: 'data',
    label: 'Dados & Gráficos',
    tokens: [
        {
            id: 'chartStyle',
            label: 'Estilo do Gráfico',
            category: 'Gráficos',
            type: 'select',
            options: [
                { id: 'flat', label: 'Flat' },
                { id: 'glow', label: 'Neon Glow' },
                { id: 'gradient', label: 'Gradiente' }
            ],
            defaultValue: 'glow',
            cssVars: ['--chart-style']
        },
        {
            id: 'chartThickness',
            label: 'Espessura da Linha',
            category: 'Gráficos',
            type: 'slider',
            min: 1,
            max: 10,
            defaultValue: 2,
            cssVars: ['--chart-thickness']
        },
        {
            id: 'tableDensity',
            label: 'Densidade da Tabela',
            category: 'Tabelas',
            type: 'select',
            options: [
                { id: 'compact', label: 'Compacta' },
                { id: 'standard', label: 'Padrão' },
                { id: 'spacious', label: 'Espaçosa' }
            ],
            defaultValue: 'standard',
            cssVars: ['--table-density']
        }
    ]
};
