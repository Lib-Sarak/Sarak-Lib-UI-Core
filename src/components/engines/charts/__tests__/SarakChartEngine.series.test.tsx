import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import SarakChartEngine, { type SarakChartEngineProps } from '../SarakChartEngine';

const capturedCharts = vi.hoisted(() => ({ options: [] as unknown[], events: [] as unknown[] }));

vi.mock('echarts-for-react', async () => {
    const ReactModule = await import('react');
    return {
        default: ({ option, onEvents }: { option: unknown; onEvents?: unknown }) => {
            capturedCharts.options.push(option);
            capturedCharts.events.push(onEvents);
            return ReactModule.createElement('div');
        },
    };
});

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

const CHART_SAMPLE_VALUE = 12;
const CURRENT_SERIES_VALUE = 10;
const FORECAST_SERIES_VALUE = 8;
const REMAINING_SERIES_VALUE = 8;
const INITIAL_REMAINING_VALUE = 12;
const INITIAL_IDEAL_VALUE = 10;
const FINAL_IDEAL_VALUE = 5;
const chartData = [{ name: 'A', value: CHART_SAMPLE_VALUE }];

function renderChart(
    props: Partial<SarakChartEngineProps>,
    design: Record<string, unknown> = {},
): ReturnType<typeof render> {
    const value = { design } as unknown as SarakUIContextType;
    return render(
        <UIContext.Provider value={value}>
            <SarakChartEngine data={chartData} {...props} />
        </UIContext.Provider>,
    );
}

function readOption(
    props: Partial<SarakChartEngineProps>,
    design: Record<string, unknown> = {},
): Record<string, unknown> {
    const view = renderChart(props, design);
    const option = capturedCharts.options.at(-1);
    view.unmount();
    if (!option || typeof option !== 'object') throw new Error('O ECharts não recebeu uma opção.');
    return option as Record<string, unknown>;
}

function firstSeries(option: Record<string, unknown>): Record<string, unknown> {
    return (option.series as Array<Record<string, unknown>>)[0];
}

function readSeriesColor(series: Record<string, unknown>): unknown {
    const itemStyle = series.itemStyle as Record<string, unknown>;
    const color = itemStyle.color as { colorStops?: Array<{ color: string }> };
    return color.colorStops?.[0]?.color ?? color;
}

beforeEach(() => {
    capturedCharts.options.splice(0);
    capturedCharts.events.splice(0);
});

afterEach(() => vi.restoreAllMocks());

describe('múltiplas barras', () => {
    it('desenha barras com cores sucessivas da paleta', () => {
        const option = readOption({
            type: 'bar',
            data: [{ name: 'A', actual: CURRENT_SERIES_VALUE, forecast: FORECAST_SERIES_VALUE }],
            series: [{ key: 'actual' }, { key: 'forecast' }],
        }, { chartColorPalette: 'crimson', secondaryColor: 'dodgerblue' });
        const series = option.series as Array<Record<string, unknown>>;

        expect(series).toHaveLength(2);
        expect(series.map(readSeriesColor)).toEqual(['crimson', 'dodgerblue']);
    });
});

describe('empilhamento e orientação', () => {
    it('empilha as séries e troca os eixos na orientação horizontal', () => {
        const option = readOption({
            type: 'bar',
            data: [{ name: 'A', actual: CURRENT_SERIES_VALUE, forecast: FORECAST_SERIES_VALUE }],
            series: [{ key: 'actual' }, { key: 'forecast' }],
            stacked: true,
            orientation: 'horizontal',
        });
        const series = option.series as Array<Record<string, unknown>>;

        expect(series[0].stack).toBeTruthy();
        expect(series[1].stack).toBe(series[0].stack);
        expect((option.xAxis as Record<string, unknown>).type).toBe('value');
        expect((option.yAxis as Record<string, unknown>).type).toBe('category');
        expect((option.yAxis as Record<string, unknown>).data).toEqual(['A']);
    });
});

describe('mistura e legenda', () => {
    it('combina barra e linha, eixo direito e traço de referência', () => {
        const option = readOption({
            type: 'bar',
            data: [{ name: 'A', actual: CURRENT_SERIES_VALUE, ideal: INITIAL_REMAINING_VALUE }],
            series: [
                { key: 'actual', type: 'bar' },
                { key: 'ideal', type: 'line', axis: 'right', dashed: true },
            ],
        });
        const series = option.series as Array<Record<string, unknown>>;
        const axes = option.yAxis as Array<Record<string, unknown>>;

        expect(series.map((item) => item.type)).toEqual(['bar', 'line']);
        expect(axes).toHaveLength(2);
        expect(axes[1].position).toBe('right');
        expect(series[1].yAxisIndex).toBe(1);
        expect((series[1].lineStyle as Record<string, unknown>).type).toBe('dashed');
    });

    it('posiciona o eixo direito no topo quando a orientação é horizontal', () => {
        const option = readOption({
            type: 'bar',
            data: [{ name: 'A', actual: CURRENT_SERIES_VALUE }],
            series: [{ key: 'actual', axis: 'right' }],
            orientation: 'horizontal',
        });
        const series = option.series as Array<Record<string, unknown>>;
        const axes = option.xAxis as Array<Record<string, unknown>>;

        expect(axes).toHaveLength(2);
        expect(axes[1].position).toBe('top');
        expect(series[0].xAxisIndex).toBe(1);
    });
});

describe('legenda por quantidade de séries', () => {
    it('mostra legenda por padrão com várias séries e a oculta com uma', () => {
        const multiple = readOption({
            type: 'line',
            data: [{ name: 'A', actual: CURRENT_SERIES_VALUE, forecast: FORECAST_SERIES_VALUE }],
            series: [{ key: 'actual' }, { key: 'forecast' }],
        });
        const single = readOption({ type: 'line', series: [{ key: 'value' }] });

        expect(multiple.legend).toEqual(expect.objectContaining({ show: true }));
        expect(single.legend).toEqual({ show: false });
    });
});

describe('cor explícita', () => {
    it('resolve cor explícita pelo nome do token do tema', () => {
        const option = readOption({
            type: 'bar',
            data: [{ name: 'A', actual: CURRENT_SERIES_VALUE }],
            series: [{ key: 'actual', color: 'statusSuccessColor' }],
        }, { statusSuccessColor: 'seagreen' });

        expect(readSeriesColor(firstSeries(option))).toBe('seagreen');
    });
});

describe('evento de clique', () => {
    it('entrega a série, o índice e o registro original no clique', () => {
        const data = [{ name: 'A', actual: CURRENT_SERIES_VALUE, ideal: INITIAL_REMAINING_VALUE }];
        const onPointClick = vi.fn();
        renderChart({ type: 'line', data, series: [{ key: 'actual' }, { key: 'ideal' }], onPointClick });
        const events = capturedCharts.events.at(-1) as Record<string, (event: unknown) => void>;

        events.click({ seriesIndex: 1, dataIndex: 0 });

        expect(onPointClick).toHaveBeenCalledOnce();
        expect(onPointClick.mock.calls[0][0]).toEqual({ seriesKey: 'ideal', index: 0, datum: data[0] });
        expect(onPointClick.mock.calls[0][0].datum).toBe(data[0]);
    });
});

describe('formatos não cartesianos', () => {
    it('ignora séries, empilhamento e orientação nos formatos não cartesianos', () => {
        const option = readOption({
            type: 'pie',
            series: [{ key: 'missing', type: 'bar' }],
            stacked: true,
            orientation: 'horizontal',
        });

        expect(firstSeries(option).type).toBe('pie');
        expect((option.series as unknown[])).toHaveLength(1);
        expect(option.xAxis).toBeUndefined();
        expect(option.yAxis).toBeUndefined();
    });
});

describe('reprodução de burndown', () => {
    it('reproduz burndown com duas linhas no mesmo eixo de datas', () => {
        const dates = ['2026-10-01', '2026-10-02'];
        const option = readOption({
            type: 'line',
            data: [
                {
                    date: dates[0],
                    remaining: INITIAL_REMAINING_VALUE,
                    ideal: INITIAL_IDEAL_VALUE,
                },
                {
                    date: dates[1],
                    remaining: REMAINING_SERIES_VALUE,
                    ideal: FINAL_IDEAL_VALUE,
                },
            ],
            config: { xAxisKey: 'date' },
            series: [{ key: 'remaining' }, { key: 'ideal', dashed: true }],
        });
        const series = option.series as Array<Record<string, unknown>>;

        expect((option.xAxis as Record<string, unknown>).data).toEqual(dates);
        expect(series.map((item) => item.type)).toEqual(['line', 'line']);
        expect((series[1].lineStyle as Record<string, unknown>).type).toBe('dashed');
    });
});
