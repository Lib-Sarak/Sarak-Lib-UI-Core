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
            constraints: {
                options: [
                    { id: 'standard', label: 'Sarak Standard' },
                    { id: 'glow', label: 'Neon Glow' },
                    { id: 'tech', label: 'Industrial Tech' },
                    { id: 'minimal', label: 'Ultra Minimal' }
                ],
            },
            defaultValue: 'glow',
            cssVars: ['--chart-style']
        },
        {
            id: 'chartPalette',
            label: 'Paleta de Cores',
            category: 'Gráficos',
            type: 'select',
            constraints: {
                options: [
                    { id: 'standard', label: 'Sarak Standard' },
                    { id: 'vibrant', label: 'Vibrant Data' },
                    { id: 'monochrome', label: 'Monochrome Tech' }
                ],
            },
            defaultValue: 'standard',
            cssVars: ['--chart-palette']
        },
        {
            id: 'chartType',
            label: 'Tipo de Gráfico Padrão',
            category: 'Gráficos',
            type: 'select',
            constraints: {
                options: [
                    { id: 'bar', label: 'Barras' },
                    { id: 'line', label: 'Linhas' },
                    { id: 'area', label: 'Área' },
                    { id: 'pie', label: 'Pizza' },
                    { id: 'gauge', label: 'Gauge' }
                ],
            },
            defaultValue: 'bar',
            cssVars: ['--chart-type']
        },
        {
            id: 'chartThickness',
            label: 'Espessura da Linha',
            category: 'Gráficos',
            type: 'slider',
            constraints: {
                min: 1,
                max: 10,
            },
            defaultValue: 2,
            cssVars: ['--chart-thickness', '--sarak-chart-thickness']
        },
        {
            id: 'chartSmoothing',
            label: 'Suavização (Smoothing)',
            category: 'Gráficos',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'chartShowGrid',
            label: 'Exibir Grid no Gráfico',
            category: 'Gráficos',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'tableDensity',
            label: 'Densidade da Tabela',
            category: 'Tabelas',
            type: 'select',
            constraints: {
                options: [
                    { id: 'compact', label: 'Compacta' },
                    { id: 'standard', label: 'Padrão' },
                    { id: 'comfortable', label: 'Confortável' }
                ],
            },
            defaultValue: 'standard',
            cssVars: ['--table-density', '--sarak-table-density']
        },
        {
            id: 'gridGap',
            label: 'Espaçamento do Grid',
            category: 'Layout de Dados',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 60,
            },
            defaultValue: 24,
            cssVars: ['--sarak-grid-gap']
        },
        {
            id: 'gridRadius',
            label: 'Raio de Borda (Elementos Internos)',
            category: 'Layout de Dados',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 30,
            },
            defaultValue: 12,
            cssVars: ['--sarak-grid-radius']
        }
    ]
};
