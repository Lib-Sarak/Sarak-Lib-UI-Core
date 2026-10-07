import * as echarts from 'echarts';
import type { SarakChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

export const buildScatterSeries = (data: SarakChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
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

function finiteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function getCandlestickValues(item: SarakChartDataItem): number[] | null {
    const values = [item.open, item.close, item.low, item.high];
    return values.every(finiteNumber) ? values : null;
}

export const buildCandlestickSeries = (data: SarakChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => {
    const xAxisKey = config?.xAxisKey ?? 'name';
    const validItems = data.flatMap((item) => {
        const values = getCandlestickValues(item);
        return values ? [{ item, values }] : [];
    });

    return {
        xAxis: { data: validItems.map(({ item }) => item[xAxisKey]) },
        series: [{
            type: 'candlestick',
            data: validItems.map(({ values }) => [values[0], values[1], values[2], values[3]]),
            itemStyle: {
                color: theme.primaryColor,
                color0: '#ef4444',
                borderColor: theme.primaryColor,
                borderColor0: '#ef4444',
            },
        }],
    };
};

function getBoxPlotValues(item: SarakChartDataItem, dataKey: string): number[] | null {
    const rawValues = item[dataKey] ?? item.boxplot;
    if (Array.isArray(rawValues) && rawValues.length === 5 && rawValues.every(finiteNumber)) return rawValues;

    const values = [item.min, item.q1, item.median, item.q3, item.max];
    return values.every(finiteNumber) ? values : null;
}

export const buildBoxPlotSeries = (data: SarakChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        type: 'boxplot',
        data: data.flatMap((item) => {
            const values = getBoxPlotValues(item, config?.dataKey ?? 'boxplot');
            return values ? [values] : [];
        }),
        itemStyle: {
            borderColor: theme.primaryColor,
            borderWidth: 2,
            color: `rgba(${theme.primaryRGB}, 0.2)`,
        },
    }],
});

export const buildHistogramSeries = (data: SarakChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
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
