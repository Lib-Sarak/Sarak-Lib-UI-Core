import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import SarakChartEngine, { type SarakChartEngineProps } from '../SarakChartEngine';

const capturedCharts = vi.hoisted(() => ({ options: [] as unknown[] }));

vi.mock('echarts-for-react', async () => {
    const ReactModule = await import('react');
    return {
        default: ({ option }: { option: unknown }) => {
            capturedCharts.options.push(option);
            return ReactModule.createElement('div', { 'data-testid': 'echarts-output' });
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

const FIRST_SAMPLE_VALUE = 12;
const SECOND_SAMPLE_VALUE = 24;
const SHORT_KEY_SAMPLE_VALUE = 30;
const chartData = [
    { name: 'A', value: FIRST_SAMPLE_VALUE },
    { name: 'B', value: SECOND_SAMPLE_VALUE },
];
const shortKeyChartData = [{ name: 'A', v: SHORT_KEY_SAMPLE_VALUE }];
const GRID_OPACITY_CHANGE = 0.31;
const THEME_LINE_THICKNESS = 6;
const PROP_LINE_THICKNESS = 7;

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

beforeEach(() => capturedCharts.options.splice(0));
afterEach(() => vi.restoreAllMocks());

describe('tokens do tema do gráfico', () => {
    it('usa chartColorPalette como primeira cor da série', () => {
        const option = readOption({ type: 'bar' }, { chartColorPalette: 'cornflowerblue' });
        expect(option.color).toEqual(expect.arrayContaining(['cornflowerblue']));
        expect((option.color as string[])[0]).toBe('cornflowerblue');
    });

    it('aplica chartGridOpacity às linhas dos eixos', () => {
        const option = readOption({ type: 'line' }, { chartGridOpacity: GRID_OPACITY_CHANGE });
        const yAxis = option.yAxis as Record<string, unknown>;
        const splitLine = yAxis.splitLine as Record<string, unknown>;
        expect((splitLine.lineStyle as Record<string, unknown>).opacity).toBe(GRID_OPACITY_CHANGE);
    });

    it('desliga a grade e aplica o fundo do tooltip pelo tema', () => {
        const option = readOption({ type: 'line' }, { chartShowGrid: false, chartTooltipBg: 'mediumseagreen' });
        const yAxis = option.yAxis as Record<string, unknown>;
        expect((yAxis.splitLine as Record<string, unknown>).show).toBe(false);
        expect((option.tooltip as Record<string, unknown>).backgroundColor).toBe('mediumseagreen');
    });

    it('usa chartThickness e chartSmoothing na série', () => {
        const option = readOption({ type: 'line' }, {
            chartThickness: THEME_LINE_THICKNESS,
            chartSmoothing: false,
        });
        const series = firstSeries(option);
        expect((series.lineStyle as Record<string, unknown>).width).toBe(THEME_LINE_THICKNESS);
        expect(series.smooth).toBe(false);
    });

    it('usa chartType do tema quando type não foi informado', () => {
        const option = readOption({}, { chartType: 'bar' });
        expect(firstSeries(option).type).toBe('bar');
    });
});

describe('resolução do tipo e da chave de dados', () => {
    it('prioriza type explícito sobre chartType do tema', () => {
        const option = readOption({ type: 'pie' }, { chartType: 'bar' });
        expect(firstSeries(option).type).toBe('pie');
    });

    it('preserva a chave v padrão de funil e treemap', () => {
        for (const type of ['funnel', 'treemap'] as const) {
            const option = readOption({ type, data: shortKeyChartData });
            expect((firstSeries(option).data as Array<Record<string, unknown>>)[0]).toEqual(
                expect.objectContaining({ value: SHORT_KEY_SAMPLE_VALUE }),
            );
        }
    });

    it('preserva a chave v padrão de histograma', () => {
        const option = readOption({ type: 'histogram', data: shortKeyChartData });
        expect(firstSeries(option).data).toEqual([SHORT_KEY_SAMPLE_VALUE]);
    });
});

describe('props visuais do motor', () => {
    it('aplica título, animação, gradiente e espessura configurados', () => {
        const option = readOption({
            type: 'area',
            config: { title: 'Receita', showAnimation: false, showGradients: false, thickness: PROP_LINE_THICKNESS },
        }, { chartColorPalette: 'darkorchid', chartThickness: 2 });
        const series = firstSeries(option);

        expect((option.title as Record<string, unknown>).text).toBe('Receita');
        expect(option.animation).toBe(false);
        expect((series.lineStyle as Record<string, unknown>).width).toBe(PROP_LINE_THICKNESS);
        expect((series.areaStyle as Record<string, unknown>).color).toBe('darkorchid');
    });

    it('desliga gradientes também na barra', () => {
        const option = readOption({ type: 'bar', config: { showGradients: false } }, {
            chartColorPalette: 'darkorchid',
        });
        const series = firstSeries(option);
        const emphasis = series.emphasis as Record<string, unknown>;
        expect((series.itemStyle as Record<string, unknown>).color).toBe('darkorchid');
        expect((emphasis.itemStyle as Record<string, unknown>).color).toBe('darkorchid');
    });
});

describe('estado vazio e acessibilidade', () => {
    it('renderiza SarakDataEmpty para dados vazios sem erro de console', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderChart({ data: [] });

        expect(screen.getByRole('status').getAttribute('data-sarak-data-empty')).toBe('true');
        expect(screen.getByText('Nenhum dado disponível para este gráfico.')).toBeTruthy();
        expect(consoleError).not.toHaveBeenCalled();
        expect(capturedCharts.options).toHaveLength(0);
    });

    it('renderiza SarakDataEmpty quando falta o campo da série', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderChart({ data: [{ name: 'A' }] });
        expect(screen.getByRole('status').getAttribute('data-sarak-data-empty')).toBe('true');
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('expõe rótulo acessível e ativa aria no ECharts', () => {
        const view = renderChart({ ariaLabel: 'Tendência mensal' }, { chartType: 'line' });
        const option = capturedCharts.options.at(-1) as Record<string, unknown>;
        const image = screen.getByRole('img');
        expect(image.getAttribute('aria-label')).toBe('Tendência mensal');
        expect(option.aria).toEqual(expect.objectContaining({ enabled: true }));
        view.unmount();
    });

    it('usa o rótulo acessível traduzido quando ariaLabel não vem do consumidor', () => {
        renderChart({ type: 'line' });
        expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Gráfico de dados');
    });
});

describe('compatibilidade do Recharts', () => {
    it('avisa uma vez quando recebe a prop stacked', () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const props: Partial<SarakChartEngineProps> = {
            config: { engine: 'recharts' },
            stacked: true,
        };
        renderChart(props);

        const chartWarnings = warning.mock.calls.filter(([message]) => String(message).includes('recharts não aplica'));
        expect(chartWarnings).toHaveLength(1);
        expect(String(chartWarnings[0][0])).toContain('stacked');
    });
});
