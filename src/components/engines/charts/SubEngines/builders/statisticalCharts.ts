import * as echarts from 'echarts';
import type { SarakChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

const SCATTER_POINT_OPACITY = 0.7;
const BOXPLOT_FILL_OPACITY = 0.2;
const HISTOGRAM_BAR_OPACITY = 0.6;
const SCATTER_SHADOW_BLUR = 10;

function finiteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function getCandlestickValues(item: SarakChartDataItem): number[] | null {
    const values = [item.open, item.close, item.low, item.high];
    return values.every(finiteNumber) ? values : null;
}

function getBoxPlotValues(item: SarakChartDataItem, dataKey: string): number[] | null {
    const rawValues = item[dataKey] ?? item.boxplot;
    if (Array.isArray(rawValues) && rawValues.length === 5 && rawValues.every(finiteNumber)) return rawValues;

    const values = [item.min, item.q1, item.median, item.q3, item.max];
    return values.every(finiteNumber) ? values : null;
}

export const buildScatterSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        data: data.map((item, index) => [index, item[config?.dataKey || 'value']]),
        type: 'scatter',
        symbolSize: (value: number[]) => Math.sqrt(value[1]) * 1.5,
        itemStyle: {
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                { offset: 0, color: theme.primaryColor },
                { offset: 1, color: theme.secondaryColor },
            ]),
            opacity: SCATTER_POINT_OPACITY,
            shadowBlur: SCATTER_SHADOW_BLUR,
            shadowColor: theme.primaryColor,
        },
    }],
});

export const buildCandlestickSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => {
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
                color0: theme.palette[5],
                borderColor: theme.primaryColor,
                borderColor0: theme.palette[5],
            },
        }],
    };
};

export const buildBoxPlotSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        type: 'boxplot',
        data: data.flatMap((item) => {
            const values = getBoxPlotValues(item, config?.dataKey ?? 'boxplot');
            return values ? [values] : [];
        }),
        itemStyle: {
            borderColor: theme.primaryColor,
            borderWidth: theme.chartThickness,
            color: theme.primaryColor,
            opacity: BOXPLOT_FILL_OPACITY,
        },
    }],
});

export const buildHistogramSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        name: 'Histogram',
        type: 'bar',
        barWidth: '99%',
        data: data.map((item) => item[config?.dataKey || 'v']),
        itemStyle: {
            color: theme.primaryColor,
            opacity: HISTOGRAM_BAR_OPACITY,
            borderColor: theme.primaryColor,
            borderWidth: theme.borderWidth,
        },
    }],
});
