import React from 'react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    Tooltip as RechartsTooltip, BarChart, Bar,
} from 'recharts';
import type { EChartsTheme } from './useEChartsTheme';
import type { SarakChartDataItem, SarakChartType } from './builders/types';

interface RechartsChartProps {
    type: SarakChartType;
    data: SarakChartDataItem[];
    config?: {
        xAxisKey?: string;
        dataKey?: string;
        showAnimation?: boolean;
        thickness?: number;
    };
    theme: EChartsTheme;
    ariaLabel: string;
}

function buildRechartsContent({ type, data, config, theme }: RechartsChartProps): React.ReactElement {
    if (type === 'bar') {
        return (
            <BarChart data={data}>
                <XAxis dataKey={config?.xAxisKey || 'name'} hide />
                <YAxis hide />
                <RechartsTooltip />
                <Bar
                    dataKey={config?.dataKey || 'value'}
                    fill={theme.primaryColor}
                    isAnimationActive={config?.showAnimation ?? true}
                />
            </BarChart>
        );
    }

    return (
        <LineChart data={data}>
            <XAxis dataKey={config?.xAxisKey || 'name'} hide />
            <YAxis hide />
            <RechartsTooltip />
            <Line
                type="monotone"
                dataKey={config?.dataKey || 'value'}
                stroke={theme.primaryColor}
                strokeWidth={config?.thickness ?? theme.chartThickness}
                dot={false}
                isAnimationActive={config?.showAnimation ?? true}
            />
        </LineChart>
    );
}

function RechartsChart(props: RechartsChartProps): React.ReactElement {
    return (
        <div
            className="w-full h-full min-h-[var(--sarak-chart-engine-min-h,180px)] p-2"
            role="img"
            aria-label={props.ariaLabel}
        >
            <ResponsiveContainer width="100%" height="100%">
                {buildRechartsContent(props)}
            </ResponsiveContainer>
        </div>
    );
}

export default RechartsChart;
