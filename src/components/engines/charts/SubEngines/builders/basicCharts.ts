import * as echarts from 'echarts';
import type { ChartDataItem, ChartBuilderConfig, ChartTheme, ChartOptionFragment } from './types';

export const buildBarSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        data: data.map(item => item[config?.dataKey || 'value']),
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
            borderRadius: [10, 10, 2, 2],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: theme.primaryColor },
                { offset: 1, color: `rgba(${theme.primaryRGB}, 0.1)` }
            ])
        },
        emphasis: {
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#fff' },
                    { offset: 1, color: theme.primaryColor }
                ]),
                shadowBlur: 20,
                shadowColor: `rgba(${theme.primaryRGB}, 0.4)`
            }
        }
    }]
});

export const buildLineSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme, isArea: boolean): ChartOptionFragment => ({
    series: [{
        data: data.map(item => item[config?.dataKey || 'value']),
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { 
            width: 5, 
            color: theme.primaryColor,
            shadowColor: `rgba(${theme.primaryRGB}, 0.5)`,
            shadowBlur: 15,
            shadowOffsetY: 8
        },
        itemStyle: { 
            color: theme.primaryColor, 
            borderWidth: 3, 
            borderColor: theme.isDark ? '#0f172a' : '#fff',
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.2)'
        },
        areaStyle: isArea ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `rgba(${theme.primaryRGB}, 0.5)` },
                { offset: 0.5, color: `rgba(${theme.primaryRGB}, 0.1)` },
                { offset: 1, color: `rgba(${theme.primaryRGB}, 0)` }
            ])
        } : undefined,
        emphasis: {
            scale: 1.5,
            itemStyle: {
                shadowBlur: 15,
                shadowColor: theme.primaryColor
            }
        }
    }]
});

export const buildPieSeries = (data: ChartDataItem[], config: ChartBuilderConfig | undefined, theme: ChartTheme): ChartOptionFragment => ({
    series: [{
        name: 'Distribuição',
        type: 'pie',
        radius: ['55%', '85%'],
        avoidLabelOverlap: true,
        itemStyle: {
            borderRadius: 12,
            borderColor: theme.isDark ? '#0f172a' : '#fff',
            borderWidth: 4
        },
        label: { show: false, position: 'center' },
        emphasis: {
            label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: theme.headingFont || 'Inter',
                color: theme.isDark ? '#fff' : '#000'
            },
            itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.2)' }
        },
        data: data.map(item => ({
            value: item[config?.dataKey || 'value'],
            name: item[config?.xAxisKey || 'name']
        }))
    }]
});
