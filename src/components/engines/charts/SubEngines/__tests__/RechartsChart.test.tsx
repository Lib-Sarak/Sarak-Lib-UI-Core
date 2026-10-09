import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RechartsChart from '../RechartsChart';
import type { EChartsTheme } from '../useEChartsTheme';

vi.mock('recharts', async () => {
    const ReactModule = await import('react');
    const ChartPart = ({ children }: { children?: React.ReactNode }): React.ReactElement => (
        ReactModule.createElement('div', null, children)
    );
    return {
        ResponsiveContainer: ChartPart,
        LineChart: ChartPart,
        Line: ChartPart,
        XAxis: ChartPart,
        YAxis: ChartPart,
        Tooltip: ChartPart,
        BarChart: ChartPart,
        Bar: ChartPart,
    };
});

const SAMPLE_CHART_THICKNESS = 3;
const SAMPLE_CHART_VALUE = 12;
const chartTheme = { primaryColor: 'royalblue', chartThickness: SAMPLE_CHART_THICKNESS } as EChartsTheme;
const chartData = [{ name: 'A', value: SAMPLE_CHART_VALUE }];

describe('RechartsChart', () => {
    it('expõe a imagem com o rótulo acessível recebido', () => {
        render(
            <RechartsChart
                type="bar"
                data={chartData}
                config={{ showAnimation: false }}
                theme={chartTheme}
                ariaLabel="Receita mensal"
            />,
        );

        expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Receita mensal');
    });
});
