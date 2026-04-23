import React from 'react';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, AreaChart, Area, 
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useSarakUI } from '../../SarakUIProvider';

interface SarakChartEngineProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'radar';
    data: any[];
    config?: any;
}

/**
 * Sarak Chart Engine v7.0
 * High-end data visualization powered by Recharts (and soon ECharts).
 */
const SarakChartEngine: React.FC<SarakChartEngineProps> = ({ type, data, config }) => {
    const { primaryColor, chartShowGrid } = useSarakUI();

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        {chartShowGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />}
                        <XAxis 
                            dataKey={config?.xAxisKey || 'name'} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(15, 15, 20, 0.9)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={config?.dataKey || 'value'} 
                            stroke={primaryColor} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        {chartShowGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />}
                        <XAxis dataKey={config?.xAxisKey || 'name'} axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}/>
                        <Tooltip />
                        <Bar dataKey={config?.dataKey || 'value'} fill={primaryColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
            default:
                return (
                    <LineChart data={data}>
                        {chartShowGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />}
                        <XAxis dataKey={config?.xAxisKey || 'name'} axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}/>
                        <Tooltip />
                        <Line type="monotone" dataKey={config?.dataKey || 'value'} stroke={primaryColor} strokeWidth={3} dot={{ r: 4, fill: primaryColor }} activeDot={{ r: 8 }} />
                    </LineChart>
                );
        }
    };

    return (
        <div className="w-full h-full min-h-[300px] p-4 bg-[var(--theme-card)]/30 rounded-[var(--radius-theme)] border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default SarakChartEngine;
