import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip as RechartsTooltip, Legend, AreaChart, Area, 
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useSarakUI } from '../../SarakUIProvider';

interface SarakChartEngineProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge';
    data: any[];
    config?: {
        xAxisKey?: string;
        dataKey?: string;
        engine?: 'recharts' | 'echarts';
        title?: string;
        showGradients?: boolean;
        showAnimation?: boolean;
        thickness?: number;
    };
}

/**
 * Sarak Chart Engine v7.5 [Quantum Edition]
 * High-end data visualization powered by Recharts and Apache ECharts.
 */
const SarakChartEngine: React.FC<SarakChartEngineProps> = ({ type, data, config }) => {
    const { primaryColor, mode, bodyFont, headingFont } = useSarakUI();
    
    // Normalize engine selection - ECharts is the premium default
    const engine = config?.engine || 'echarts';
    const isDark = mode === 'dark';
    
    // --- ECharts Logic ---
    const getEChartsOption = useMemo(() => {
        if (engine !== 'echarts') return null;

        const xAxisData = data.map(item => item[config?.xAxisKey || 'name']);
        const seriesData = data.map(item => item[config?.dataKey || 'value']);
        
        const primaryRGB = hexToRgb(primaryColor || '#3b82f6');
        const secondaryColor = '#8b5cf6'; // Purple accent
        const secondaryRGB = hexToRgb(secondaryColor);

        const baseOption: any = {
            backgroundColor: 'transparent',
            color: [primaryColor, secondaryColor, '#10b981', '#f59e0b', '#ef4444'],
            tooltip: {
                trigger: type === 'pie' ? 'item' : 'axis',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 16,
                backdropFilter: 'blur(12px)',
                textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 11, fontFamily: bodyFont || 'Inter' },
                padding: [12, 18],
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 15,
                extraCssText: 'box-shadow: 0 0 20px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.05);'
            },
            grid: {
                top: 40,
                bottom: 30,
                left: 20,
                right: 20,
                containLabel: true
            },
            xAxis: type === 'pie' || type === 'radar' ? undefined : {
                type: 'category',
                data: xAxisData,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { 
                    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                    fontSize: 10,
                    fontFamily: bodyFont || 'Inter',
                    margin: 15
                }
            },
            yAxis: type === 'pie' || type === 'radar' ? undefined : {
                type: 'value',
                splitLine: { 
                    lineStyle: { 
                        color: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
                        type: 'solid' 
                    } 
                },
                axisLine: { show: false },
                axisLabel: { 
                    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                    fontSize: 10,
                    fontFamily: bodyFont || 'Inter'
                }
            },
            animationDuration: 2500,
            animationEasing: 'elasticOut'
        };

        switch (type) {
            case 'bar':
                baseOption.series = [{
                    data: seriesData,
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        borderRadius: [10, 10, 2, 2],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: primaryColor },
                            { offset: 1, color: `rgba(${primaryRGB}, 0.1)` }
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#fff' },
                                { offset: 1, color: primaryColor }
                            ]),
                            shadowBlur: 20,
                            shadowColor: `rgba(${primaryRGB}, 0.4)`
                        }
                    }
                }];
                break;

            case 'line':
            case 'area':
                baseOption.series = [{
                    data: seriesData,
                    type: 'line',
                    smooth: 0.4,
                    symbol: 'circle',
                    symbolSize: 10,
                    lineStyle: { 
                        width: 5, 
                        color: primaryColor,
                        shadowColor: `rgba(${primaryRGB}, 0.5)`,
                        shadowBlur: 15,
                        shadowOffsetY: 8
                    },
                    itemStyle: { 
                        color: primaryColor, 
                        borderWidth: 3, 
                        borderColor: isDark ? '#0f172a' : '#fff',
                        shadowBlur: 5,
                        shadowColor: 'rgba(0,0,0,0.2)'
                    },
                    areaStyle: type === 'area' ? {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: `rgba(${primaryRGB}, 0.5)` },
                            { offset: 0.5, color: `rgba(${primaryRGB}, 0.1)` },
                            { offset: 1, color: `rgba(${primaryRGB}, 0)` }
                        ])
                    } : undefined,
                    emphasis: {
                        scale: 1.5,
                        itemStyle: {
                            shadowBlur: 15,
                            shadowColor: primaryColor
                        }
                    }
                }];
                break;

            case 'pie':
                baseOption.series = [{
                    name: 'Distribuição',
                    type: 'pie',
                    radius: ['55%', '85%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 12,
                        borderColor: isDark ? '#0f172a' : '#fff',
                        borderWidth: 4
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: 'bold',
                            fontFamily: headingFont || 'Inter',
                            color: isDark ? '#fff' : '#000'
                        },
                        itemStyle: {
                            shadowBlur: 20,
                            shadowColor: 'rgba(0,0,0,0.2)'
                        }
                    },
                    data: data.map(item => ({
                        value: item[config?.dataKey || 'value'],
                        name: item[config?.xAxisKey || 'name']
                    }))
                }];
                break;

            case 'radar':
                baseOption.radar = {
                    indicator: data.map(item => ({ name: item[config?.xAxisKey || 'name'], max: 1000 })),
                    splitArea: { show: false },
                    splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } },
                    axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }
                };
                baseOption.series = [{
                    type: 'radar',
                    data: [{
                        value: seriesData,
                        name: 'Métrica Sarak',
                        symbol: 'none',
                        areaStyle: {
                            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                                { offset: 0, color: `rgba(${primaryRGB}, 0.6)` },
                                { offset: 1, color: `rgba(${secondaryRGB}, 0.2)` }
                            ])
                        },
                        lineStyle: { color: primaryColor, width: 2 }
                    }]
                }];
                break;

            case 'scatter':
                baseOption.series = [{
                    data: data.map((item, i) => [i, item[config?.dataKey || 'value']]),
                    type: 'scatter',
                    symbolSize: (data: any) => Math.sqrt(data[1]) * 1.5,
                    itemStyle: {
                        color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                            { offset: 0, color: `rgba(${primaryRGB}, 1)` },
                            { offset: 1, color: `rgba(${secondaryRGB}, 0.4)` }
                        ]),
                        shadowBlur: 10,
                        shadowColor: `rgba(${primaryRGB}, 0.5)`
                    }
                }];
                break;

            case 'heatmap':
                baseOption.visualMap = {
                    min: 0,
                    max: 1000,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '0%',
                    show: false,
                    inRange: { color: [`rgba(${primaryRGB}, 0.1)`, primaryColor, '#ef4444'] }
                };
                baseOption.series = [{
                    type: 'heatmap',
                    data: data.map((item, i) => [i % 5, Math.floor(i / 5), item[config?.dataKey || 'value']]),
                    label: { show: false },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }];
                break;

            case 'gauge':
                baseOption.series = [{
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
                                { offset: 0, color: primaryColor },
                                { offset: 1, color: secondaryColor }
                            ])
                        }
                    },
                    pointer: { show: false },
                    axisLine: { lineStyle: { width: 14, color: [[1, isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)']] } },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    detail: {
                        valueAnimation: true,
                        offsetCenter: [0, 0],
                        fontSize: 28,
                        fontWeight: '900',
                        fontFamily: headingFont || 'Inter',
                        color: isDark ? '#fff' : '#000',
                        formatter: '{value}%'
                    },
                    data: [{ value: seriesData[seriesData.length - 1] || 75 }]
                }];
                break;
        }

        return baseOption;
    }, [type, data, config, primaryColor, isDark, bodyFont, headingFont]);

    // --- Helpers ---
    function hexToRgb(hex: string): string {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
    }

    if (engine === 'echarts') {
        return (
            <div className="w-full h-full min-h-[180px] p-2">
                <ReactECharts 
                    option={getEChartsOption} 
                    style={{ height: '100%', width: '100%' }}
                    settings={{ notMerge: true }}
                />
            </div>
        );
    }

    // --- Legacy Recharts Fallback ---
    return (
        <div className="w-full h-full min-h-[180px] p-2">
            <ResponsiveContainer width="100%" height="100%">
                {type === 'bar' ? (
                    <BarChart data={data}>
                        <XAxis dataKey={config?.xAxisKey || 'name'} hide />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Bar dataKey={config?.dataKey || 'value'} fill={primaryColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <LineChart data={data}>
                        <XAxis dataKey={config?.xAxisKey || 'name'} hide />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey={config?.dataKey || 'value'} stroke={primaryColor} strokeWidth={3} dot={false} />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default SarakChartEngine;
