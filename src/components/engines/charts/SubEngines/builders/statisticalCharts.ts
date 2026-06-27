import * as echarts from 'echarts';
import type { ChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

export const buildScatterSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        data: data.map((item, i) => [i, item[config?.dataKey || 'value']]),
        type: 'scatter',
        symbolSize: (value: number[]) => Math.sqrt(value[1]) * 1.5,
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

export const buildCandlestickSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    xAxis: { data: data.map(item => item.name) },
    series: [{
        type: 'candlestick',
        data: data.map(item => {
            const v = item.v as number;
            return [v - 10, v + 10, v - 20, v + 20];
        }),
        itemStyle: {
            color: theme.primaryColor,
            color0: '#ef4444',
            borderColor: theme.primaryColor,
            borderColor0: '#ef4444'
        }
    }]
});

export const buildBoxPlotSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
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

export const buildHistogramSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
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
