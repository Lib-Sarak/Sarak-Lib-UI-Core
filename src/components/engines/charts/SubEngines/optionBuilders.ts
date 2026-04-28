import * as echarts from 'echarts';

export const buildBarSeries = (data: any[], config: any, theme: any) => ({
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

export const buildLineSeries = (data: any[], config: any, theme: any, isArea: boolean) => ({
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

export const buildPieSeries = (data: any[], config: any, theme: any) => ({
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

export const buildRadarConfig = (data: any[], config: any, theme: any) => ({
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

export const buildGaugeSeries = (data: any[], config: any, theme: any) => ({
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

export const buildScatterSeries = (data: any[], config: any, theme: any) => ({
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

export const buildHeatmapSeries = (data: any[], config: any, theme: any) => ({
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

export const buildFunnelSeries = (data: any[], config: any, theme: any) => ({
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

export const buildTreeMapSeries = (data: any[], config: any, theme: any) => ({
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

export const buildCandlestickSeries = (data: any[], config: any, theme: any) => ({
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

export const buildSunburstSeries = (data: any[], config: any, theme: any) => ({
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

export const buildBoxPlotSeries = (data: any[], config: any, theme: any) => ({
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

export const buildHistogramSeries = (data: any[], config: any, theme: any) => ({
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
