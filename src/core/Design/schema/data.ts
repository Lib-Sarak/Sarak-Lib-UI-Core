import { ComponentSchema } from '../types';

/**
 * SCHEMA: GRÁFICOS & VISUALIZAÇÃO
 * Governa a estética de gráficos analíticos e indicadores de dados.
 */
export const DataSchema: ComponentSchema = {
    id: 'data',
    label: 'Gráficos & Dados',
    tokens: [
        {
            id: 'chartColorPalette',
            label: 'Paleta de Cores (Série)',
            type: 'color', // Futuramente pode ser um array, por enquanto cor base
            description: 'Cor base da primeira série de dados nos gráficos (linhas, barras, setores). É o ponto de partida da paleta usada pelo motor de gráficos para colorir séries — normalmente espelha a cor primária do sistema.',
            axis: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-chart-primary']
        },
        {
            id: 'chartGridOpacity',
            label: 'Opacidade da Grade',
            type: 'slider',
            description: 'Opacidade das linhas de grade de fundo dos gráficos (eixos de referência horizontal/vertical). Valores baixos mantêm a grade discreta, só como guia visual; valores mais altos a tornam mais proeminente.',
            axis: 'color',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-chart-grid-opacity']
        },
        {
            id: 'chartTooltipBg',
            label: 'Fundo do Tooltip',
            type: 'color',
            description: 'Cor de fundo do tooltip exibido ao passar o mouse sobre um ponto de dado no gráfico — deve ter contraste alto contra o texto do tooltip e se destacar do fundo do gráfico.',
            axis: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.9)',
            cssVars: ['--sarak-chart-tooltip-bg']
        },
        {
            id: 'chartType',
            label: 'Tipo de Gráfico',
            type: 'select',
            description: 'Tipo de visualização usado para renderizar os dados (linhas, barras, pizza/donut, radar, dispersão, mapa de calor ou gauge). Cada tipo comunica um tipo de informação diferente — ex. linhas para tendência ao longo do tempo, pizza para proporção de um todo.',
            defaultValue: 'line',
            options: [
                { value: 'line', label: 'Lines' },
                { value: 'area', label: 'Area/Preenchido' },
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
            type: 'boolean',
            description: 'Liga/desliga a exibição das linhas de grade de fundo do gráfico. Desligue para um visual mais limpo/minimalista quando os valores exatos importam menos que a tendência geral.',
            defaultValue: true
        },
        {
            id: 'chartThickness',
            label: 'Espessura da Linha',
            type: 'slider',
            description: 'Espessura, em pixels, das linhas de série em gráficos de linha/área. Linhas mais grossas têm mais presença visual mas podem sobrepor pontos de dados próximos; linhas finas favorecem precisão.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 1, max: 8, step: 1 },
            defaultValue: 2,
            cssVars: ['--sarak-chart-thickness']
        },
        {
            id: 'chartSmoothing',
            label: 'Suavização da Linha',
            type: 'boolean',
            description: 'Quando ativo, curva suavemente as linhas de série (spline) em vez de conectar os pontos com segmentos retos — visual mais orgânico, mas pode distorcer levemente a leitura exata de picos/vales.',
            axis: 'geometry',
            defaultValue: true
        }
    ]
};
