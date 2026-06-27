import * as echarts from 'echarts';
import type { ChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

export const buildRadarConfig = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    radar: {
        indicator: data.map(item => ({ name: item[config?.xAxisKey || 'name'], max: 1000 })),
        splitArea: { show: false },
        splitLine: { lineStyle: { color: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } },
        axisLine: { lineStyle: { color: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }
    },
    series: [{
        type: 'radar',
        data: [{
            value: data.map(item => item[config?.dataKey || 'value']),
            name: 'Métrica Sarak',
            symbol: 'none',
            areaStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                    { offset: 0, color: `rgba(${theme.primaryRGB}, 0.6)` },
                    { offset: 1, color: `rgba(${theme.secondaryRGB}, 0.2)` }
                ])
            },
            lineStyle: { color: theme.primaryColor, width: 2 }
        }]
    }]
});

export const buildGaugeSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: {
            show: true,
            width: 14,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: theme.primaryColor },
                    { offset: 1, color: theme.secondaryColor }
                ])
            }
        },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 14, color: [[1, theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
            valueAnimation: true,
            offsetCenter: [0, 0],
            fontSize: 28,
            fontWeight: '900',
            fontFamily: theme.headingFont || 'Inter',
            color: theme.isDark ? '#fff' : '#000',
            formatter: '{value}%'
        },
        data: [{ value: data[data.length - 1]?.[config?.dataKey || 'value'] || 75 }]
    }]
});

export const buildHeatmapSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    visualMap: {
        min: 0,
        max: 1000,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        show: false,
        inRange: { color: [`rgba(${theme.primaryRGB}, 0.1)`, theme.primaryColor, '#ef4444'] }
    },
    series: [{
        type: 'heatmap',
        data: data.map((item, i) => [i % 5, Math.floor(i / 5), item[config?.dataKey || 'value']]),
        label: { show: false },
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }]
});

export const buildFunnelSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 1000,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', fontSize: 10, fontFamily: theme.bodyFont },
        itemStyle: { borderColor: '#fff', borderWidth: 1, opacity: 0.7 },
        emphasis: { label: { fontSize: 20 } },
        data: data.map(item => ({ value: item[config?.dataKey || 'v'], name: item[config?.xAxisKey || 'name'] }))
    }]
});

export const buildTreeMapSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        name: 'TreeMap',
        type: 'treemap',
        visibleMin: 300,
        label: { show: true, formatter: '{b}', fontSize: 10, fontFamily: theme.bodyFont },
        itemStyle: { borderColor: '#fff', borderWidth: 1, gapWidth: 1 },
        upperLabel: { show: true, height: 20 },
        data: data.map(item => ({ value: item[config?.dataKey || 'v'], name: item[config?.xAxisKey || 'name'] }))
    }]
});

export const buildSunburstSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        type: 'sunburst',
        data: [
            { name: 'Node A', children: [{ name: 'A1', value: 10 }, { name: 'A2', value: 20 }] },
            { name: 'Node B', children: [{ name: 'B1', value: 15 }, { name: 'B2', value: 25 }] }
        ],
        radius: [0, '90%'],
        label: { rotate: 'radial', fontSize: 8, fontFamily: theme.bodyFont }
    }]
});
