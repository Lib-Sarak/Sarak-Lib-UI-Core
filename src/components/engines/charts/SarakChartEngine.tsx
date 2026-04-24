import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    Tooltip as RechartsTooltip, BarChart, Bar
} from 'recharts';
import { useEChartsTheme } from './SubEngines/useEChartsTheme';
import * as builders from './SubEngines/optionBuilders';

interface SarakChartEngineProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter' | 'heatmap';
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
 * Sarak Chart Engine v7.5 [Quantum Edition] - Refactored v7.2.5
 */
const SarakChartEngine: React.FC<SarakChartEngineProps> = ({ type, data, config }) => {
    const theme = useEChartsTheme();
    const engine = config?.engine || 'echarts';
    
    const getEChartsOption = useMemo(() => {
        if (engine !== 'echarts') return null;

        const xAxisData = data.map(item => item[config?.xAxisKey || 'name']);
        
        const base = {
            ...theme.baseOption,
            xAxis: type === 'pie' || type === 'radar' || type === 'gauge' ? undefined : {
                type: 'category',
                data: xAxisData,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { 
                    color: theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                    fontSize: 10,
                    fontFamily: theme.bodyFont || 'Inter',
                    margin: 15
                }
            },
            yAxis: type === 'pie' || type === 'radar' || type === 'gauge' ? undefined : {
                type: 'value',
                splitLine: { 
                    lineStyle: { 
                        color: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
                        type: 'solid' 
                    } 
                },
                axisLine: { show: false },
                axisLabel: { 
                    color: theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                    fontSize: 10,
                    fontFamily: theme.bodyFont || 'Inter'
                }
            },
            tooltip: {
                ...theme.baseOption.tooltip,
                trigger: type === 'pie' ? 'item' : 'axis',
            }
        };

        let typeSpecificConfig = {};
        switch (type) {
            case 'bar': typeSpecificConfig = builders.buildBarSeries(data, config, theme); break;
            case 'line': typeSpecificConfig = builders.buildLineSeries(data, config, theme, false); break;
            case 'area': typeSpecificConfig = builders.buildLineSeries(data, config, theme, true); break;
            case 'pie': typeSpecificConfig = builders.buildPieSeries(data, config, theme); break;
            case 'radar': typeSpecificConfig = builders.buildRadarConfig(data, config, theme); break;
            case 'gauge': typeSpecificConfig = builders.buildGaugeSeries(data, config, theme); break;
            case 'scatter': typeSpecificConfig = builders.buildScatterSeries(data, config, theme); break;
            case 'heatmap': typeSpecificConfig = builders.buildHeatmapSeries(data, config, theme); break;
        }

        return { ...base, ...typeSpecificConfig };
    }, [type, data, config, theme, engine]);

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
                        <Bar dataKey={config?.dataKey || 'value'} fill={theme.primaryColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <LineChart data={data}>
                        <XAxis dataKey={config?.xAxisKey || 'name'} hide />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey={config?.dataKey || 'value'} stroke={theme.primaryColor} strokeWidth={3} dot={false} />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default SarakChartEngine;
