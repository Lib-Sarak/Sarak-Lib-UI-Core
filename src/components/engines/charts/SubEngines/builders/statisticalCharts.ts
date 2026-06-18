import * as echarts from 'echarts';

export const buildScatterSeries = (data: any[], config: any, theme: any): any => ({
    series: [{
        data: data.map((item, i) => [i, item[config?.dataKey || 'value']]),
        type: 'scatter',
        symbolSize: (data: any) => Math.sqrt(data[1]) * 1.5,
        itemStyle: {
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                { offset: 0, color: `rgba(${theme.primaryRGB}, 1)` },
                { offset: 1, color: `rgba(${theme.secondaryRGB}, 0.4)` }
            ]),
            shadowBlur: 10,
            shadowColor: `rgba(${theme.primaryRGB}, 0.5)`
        }
    }]
});

export const buildCandlestickSeries = (data: any[], config: any, theme: any): any => ({
    xAxis: { data: data.map(item => item.name) },
    series: [{
        type: 'candlestick',
        data: data.map(item => [item.v - 10, item.v + 10, item.v - 20, item.v + 20]),
        itemStyle: {
            color: theme.primaryColor,
            color0: '#ef4444',
            borderColor: theme.primaryColor,
            borderColor0: '#ef4444'
        }
    }]
});

export const buildBoxPlotSeries = (data: any[], config: any, theme: any): any => ({
    series: [{
        name: 'BoxPlot',
        type: 'boxplot',
        data: [
            [200, 300, 400, 500, 700],
            [300, 450, 550, 650, 850],
            [150, 250, 350, 450, 650]
        ],
        itemStyle: {
            borderColor: theme.primaryColor,
            borderWidth: 2,
            color: `rgba(${theme.primaryRGB}, 0.2)`
        }
    }]
});

export const buildHistogramSeries = (data: any[], config: any, theme: any): any => ({
    series: [{
        name: 'Histogram',
        type: 'bar',
        barWidth: '99%',
        data: data.map(item => item[config?.dataKey || 'v']),
        itemStyle: {
            color: `rgba(${theme.primaryRGB}, 0.6)`,
            borderColor: theme.primaryColor,
            borderWidth: 1
        }
    }]
});
