import { ComponentSchema } from '../types';

/**
 * SCHEMA: GRÁFICOS & VISUALIZAÇÃO
 * Governa a estética de gráficos analíticos e indicadores de dados.
 */
export const DataSchema: ComponentSchema = {
    id: 'data',
    label: 'Gráficos & Dados',
    pilar: 'systems',
    subcategory: 'Visualização de Dados',
    tokens: [
        {
            id: 'chartColorPalette',
            label: 'Paleta de Cores (Série)',
            category: 'Visualização',
            type: 'color', // Futuramente pode ser um array, por enquanto cor base
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-chart-primary']
        },
        {
            id: 'chartGridOpacity',
            label: 'Opacidade da Grade',
            category: 'Anatomia',
            type: 'slider',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-chart-grid-opacity']
        },
        {
            id: 'chartTooltipBg',
            label: 'Fundo do Tooltip',
            category: 'Anatomia',
            type: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.9)',
            cssVars: ['--sarak-chart-tooltip-bg']
        },
        {
            id: 'chartType',
            label: 'Tipo de Gráfico',
            category: 'Visualização',
            type: 'select',
            defaultValue: 'line',
            options: [
                { value: 'line', label: 'Lines' },
                { value: 'bar', label: 'Bars' },
                { value: 'pie', label: 'Pie/Donut' },
                { value: 'radar', label: 'Radar' },
                { value: 'scatter', label: 'Scatter' },
                { value: 'heatmap', label: 'Heatmap' },
                { value: 'gauge', label: 'Gauge' }
            ]
        },
        {
            id: 'chartShowGrid',
            label: 'Mostrar Grid de Fundo',
            category: 'Visualização',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'chartThickness',
            label: 'Espessura da Linha',
            category: 'Visualização',
            type: 'slider',
            unit: 'px',
            constraints: { min: 1, max: 8, step: 1 },
            defaultValue: 2,
            cssVars: ['--sarak-chart-thickness']
        },
        {
            id: 'chartSmoothing',
            label: 'Suavização da Linha',
            category: 'Visualização',
            type: 'boolean',
            defaultValue: true
        }
    ]
};
