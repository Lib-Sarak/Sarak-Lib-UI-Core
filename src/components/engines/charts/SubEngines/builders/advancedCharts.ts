import * as echarts from 'echarts';
import type { SarakChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

const DEFAULT_GAUGE_VALUE = 0;
const DEFAULT_GAUGE_MAXIMUM = 100;
const HEATMAP_MAXIMUM = 1000;
const HEATMAP_EMPHASIS_SHADOW_BLUR = 10;
const RADAR_AREA_OPACITY = 0.6;
const GAUGE_TRACK_WIDTH = 14;
const GAUGE_START_ANGLE = 210;
const FUNNEL_VERTICAL_INSET = 60;
const FUNNEL_ITEM_OPACITY = 0.7;
const TREEMAP_VISIBLE_MINIMUM = 300;
const TREEMAP_HEADER_HEIGHT = 20;

export const buildRadarConfig = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    radar: {
        indicator: data.map((item) => ({ name: item[config?.xAxisKey || 'name'], max: HEATMAP_MAXIMUM })),
        splitArea: { show: false },
        splitLine: { lineStyle: { color: theme.borderColor, opacity: theme.chartGridOpacity } },
        axisLine: { lineStyle: { color: theme.borderColor, opacity: theme.chartGridOpacity } },
    },
    series: [{
        type: 'radar',
        data: [{
            value: data.map((item) => item[config?.dataKey || 'value']),
            name: 'Métrica',
            symbol: 'none',
            areaStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                    { offset: 0, color: theme.primaryColor },
                    { offset: 1, color: theme.secondaryColor },
                ]),
                opacity: RADAR_AREA_OPACITY,
            },
            lineStyle: { color: theme.primaryColor, width: theme.chartThickness },
        }],
    }],
});

function createGaugeProgress(theme: ChartTheme): Record<string, unknown> {
    return {
        show: true,
        width: GAUGE_TRACK_WIDTH,
        itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: theme.primaryColor },
                { offset: 1, color: theme.secondaryColor },
            ]),
        },
    };
}

function createGaugeAxisLine(theme: ChartTheme): Record<string, unknown> {
    return {
        lineStyle: {
            width: GAUGE_TRACK_WIDTH,
            color: [[1, theme.borderColor]],
            opacity: theme.chartGridOpacity,
        },
    };
}

function createGaugeDetail(theme: ChartTheme): Record<string, unknown> {
    return {
        valueAnimation: true,
        offsetCenter: [0, 0],
        fontSize: theme.fontSize,
        fontWeight: '900',
        fontFamily: theme.headingFont,
        color: theme.titleColor,
        formatter: '{value}%',
    };
}

export const buildGaugeSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => {
    const dataKey = config?.dataKey || 'value';
    const value = data[data.length - 1]?.[dataKey] ?? DEFAULT_GAUGE_VALUE;

    return {
        series: [{
            type: 'gauge',
            startAngle: GAUGE_START_ANGLE,
            endAngle: -30,
            min: 0,
            max: DEFAULT_GAUGE_MAXIMUM,
            progress: createGaugeProgress(theme),
            pointer: { show: false },
            axisLine: createGaugeAxisLine(theme),
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            detail: createGaugeDetail(theme),
            data: [{ value }],
        }],
    };
};

export const buildHeatmapSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    visualMap: {
        min: 0,
        max: HEATMAP_MAXIMUM,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        show: false,
        inRange: { color: [theme.surfaceColor, theme.primaryColor, theme.palette[5]] },
    },
    series: [{
        type: 'heatmap',
        data: data.map((item, index) => [index % 5, Math.floor(index / 5), item[config?.dataKey || 'value']]),
        label: { show: false },
        emphasis: {
            itemStyle: {
                shadowBlur: HEATMAP_EMPHASIS_SHADOW_BLUR,
                shadowColor: theme.primaryColor,
            },
        },
    }],
});

export const buildFunnelSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: FUNNEL_VERTICAL_INSET,
        bottom: FUNNEL_VERTICAL_INSET,
        width: '80%',
        min: 0,
        max: HEATMAP_MAXIMUM,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', fontSize: theme.fontSize, fontFamily: theme.bodyFont },
        itemStyle: { borderColor: theme.surfaceColor, borderWidth: theme.borderWidth, opacity: FUNNEL_ITEM_OPACITY },
        emphasis: { label: { fontSize: theme.fontSize * 2 } },
        data: data.map((item) => ({
            value: item[config?.dataKey || 'v'],
            name: item[config?.xAxisKey || 'name'],
        })),
    }],
});

export const buildTreeMapSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        name: 'TreeMap',
        type: 'treemap',
        visibleMin: TREEMAP_VISIBLE_MINIMUM,
        label: { show: true, formatter: '{b}', fontSize: theme.fontSize, fontFamily: theme.bodyFont },
        itemStyle: { borderColor: theme.surfaceColor, borderWidth: theme.borderWidth, gapWidth: 1 },
        upperLabel: { show: true, height: TREEMAP_HEADER_HEIGHT },
        data: data.map((item) => ({
            value: item[config?.dataKey || 'v'],
            name: item[config?.xAxisKey || 'name'],
        })),
    }],
});

export const buildSunburstSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => ({
    series: [{
        type: 'sunburst',
        data: data.map((item) => ({
            name: item[config?.xAxisKey || 'name'],
            value: item[config?.dataKey || 'value'],
            children: item.children,
        })),
        radius: [0, '90%'],
        label: { rotate: 'radial', fontSize: theme.fontSize, fontFamily: theme.bodyFont },
    }],
});
