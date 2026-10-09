import * as echarts from 'echarts';
import type { SarakChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

const DEFAULT_LINE_SMOOTHNESS = 0.4;
const AREA_GRADIENT_MIDPOINT = 0.5;
const AREA_FILL_OPACITY = 0.2;
const BAR_SERIES_OPACITY = 0.9;
const DEFAULT_LINE_SYMBOL_SIZE = 10;
const BAR_EMPHASIS_SHADOW_BLUR = 20;
const LINE_SHADOW_BLUR = 15;
const LINE_SHADOW_OFFSET_Y = 8;
const LINE_ITEM_SHADOW_BLUR = 5;
const LINE_EMPHASIS_SCALE = 1.5;
const LINE_EMPHASIS_SHADOW_BLUR = 15;
const PIE_EMPHASIS_SHADOW_BLUR = 20;

function getNextPaletteColor(theme: ChartTheme, color: string): string {
    const colorIndex = theme.palette.indexOf(color);
    if (colorIndex < 0 || theme.palette.length === 0) return theme.secondaryColor;
    return theme.palette[(colorIndex + 1) % theme.palette.length] ?? theme.secondaryColor;
}

function createBarColor(theme: ChartTheme, showGradients: boolean, seriesColor: string): unknown {
    if (!showGradients) return seriesColor;
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: seriesColor },
        { offset: 1, color: getNextPaletteColor(theme, seriesColor) },
    ]);
}

function createAreaStyle(
    theme: ChartTheme,
    showGradients: boolean,
    seriesColor: string,
): Record<string, unknown> | undefined {
    if (!showGradients) return { color: seriesColor, opacity: AREA_FILL_OPACITY };
    return {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: seriesColor },
            { offset: AREA_GRADIENT_MIDPOINT, color: seriesColor },
            { offset: 1, color: getNextPaletteColor(theme, seriesColor) },
        ]),
        opacity: AREA_FILL_OPACITY,
    };
}

export const buildBarSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        data: data.map((item) => item[config?.dataKey || 'value']),
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
            borderRadius: [10, 10, 2, 2],
            color: createBarColor(theme, config?.showGradients ?? true, config?.seriesColor ?? theme.primaryColor),
            opacity: BAR_SERIES_OPACITY,
        },
        emphasis: {
            itemStyle: {
                color: createBarColor(theme, config?.showGradients ?? true, config?.seriesColor ?? theme.primaryColor),
                shadowBlur: BAR_EMPHASIS_SHADOW_BLUR,
                shadowColor: config?.seriesColor ?? theme.primaryColor,
            },
        },
    }],
});

export const buildLineSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
    isArea: boolean,
): ChartOptionFragment => ({
    series: [{
        data: data.map((item) => item[config?.dataKey || 'value']),
        type: 'line',
        smooth: theme.chartSmoothing ? DEFAULT_LINE_SMOOTHNESS : false,
        symbol: 'circle',
        symbolSize: DEFAULT_LINE_SYMBOL_SIZE,
        lineStyle: {
            width: config?.thickness ?? theme.chartThickness,
            color: config?.seriesColor ?? theme.primaryColor,
            shadowColor: config?.seriesColor ?? theme.primaryColor,
            shadowBlur: LINE_SHADOW_BLUR,
            shadowOffsetY: LINE_SHADOW_OFFSET_Y,
        },
        itemStyle: {
            color: config?.seriesColor ?? theme.primaryColor,
            borderWidth: theme.borderWidth,
            borderColor: theme.surfaceColor,
            shadowBlur: LINE_ITEM_SHADOW_BLUR,
            shadowColor: config?.seriesColor ?? theme.primaryColor,
        },
        areaStyle: isArea
            ? createAreaStyle(theme, config?.showGradients ?? true, config?.seriesColor ?? theme.primaryColor)
            : undefined,
        emphasis: {
            scale: LINE_EMPHASIS_SCALE,
            itemStyle: {
                shadowBlur: LINE_EMPHASIS_SHADOW_BLUR,
                shadowColor: config?.seriesColor ?? theme.primaryColor,
            },
        },
    }],
});

export const buildPieSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        name: 'Distribuição',
        type: 'pie',
        radius: ['55%', '85%'],
        avoidLabelOverlap: true,
        itemStyle: {
            borderRadius: theme.borderRadius,
            borderColor: theme.surfaceColor,
            borderWidth: theme.borderWidth,
        },
        label: { show: false, position: 'center' },
        emphasis: {
            label: {
                show: true,
                fontSize: theme.fontSize,
                fontWeight: 'bold',
                fontFamily: theme.headingFont,
                color: theme.titleColor,
            },
            itemStyle: {
                shadowBlur: PIE_EMPHASIS_SHADOW_BLUR,
                shadowColor: theme.primaryColor,
            },
        },
        data: data.map((item) => ({
            value: item[config?.dataKey || 'value'],
            name: item[config?.xAxisKey || 'name'],
        })),
    }],
});
