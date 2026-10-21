import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import SarakChartEngine, { type SarakChartEngineProps } from '../SarakChartEngine';

const capturedCharts = vi.hoisted(() => ({ options: [] as unknown[] }));

vi.mock('echarts-for-react', async () => {
    const ReactModule = await import('react');
    return {
        default: ({ option }: { option: unknown }) => {
            capturedCharts.options.push(option);
            return ReactModule.createElement('div');
        },
    };
});

const THEME = {
    chartColorPalette: '#2a78d6',
    statusSuccessColor: 'seagreen',
    statusErrorColor: 'crimson',
};
const INCREASE_STEP = 10;
const DECREASE_STEP = -4;
const CLOSING_TOTAL = 6;
const CROSSING_DROP = -15;
const CROSSING_FINAL = -5;
const SANKEY_FLOW = 5;
const CALENDAR_BUSY_DAY = 3;
const CALENDAR_QUIET_DAY = 1;

function renderChart(props: Partial<SarakChartEngineProps>, design: Record<string, unknown> = THEME): ReturnType<typeof render> {
    const value = { design } as unknown as SarakUIContextType;
    return render(
        <UIContext.Provider value={value}>
            <SarakChartEngine data={[]} {...props} />
        </UIContext.Provider>,
    );
}

function readOption(props: Partial<SarakChartEngineProps>): Record<string, unknown> {
    const view = renderChart(props);
    const option = capturedCharts.options.at(-1);
    view.unmount();
    if (!option || typeof option !== 'object') throw new Error('O ECharts não recebeu uma opção.');
    return option as Record<string, unknown>;
}

function seriesOf(option: Record<string, unknown>): Array<Record<string, unknown>> {
    return option.series as Array<Record<string, unknown>>;
}

function valuesOf(series: Record<string, unknown>): unknown[] {
    return (series.data as Array<{ value: number } | null>).map((point) => point && point.value);
}

function colorOf(series: Record<string, unknown>): unknown {
    return (series.itemStyle as Record<string, unknown>).color;
}

beforeEach(() => {
    capturedCharts.options.splice(0);
});

afterEach(() => vi.restoreAllMocks());

describe('waterfall', () => {
    const data = [
        { name: 'Receita', value: INCREASE_STEP },
        { name: 'Custo', value: DECREASE_STEP },
        { name: 'Resultado', total: true },
    ];

    it('fecha o acumulado de +10, −4 e total em 6', () => {
        const [base, increase, decrease, total] = seriesOf(readOption({ type: 'waterfall', data }));

        expect(base.data).toEqual([0, CLOSING_TOTAL, 0]);
        expect(valuesOf(increase)).toEqual([INCREASE_STEP, null, null]);
        expect(valuesOf(decrease)).toEqual([null, -DECREASE_STEP, null]);
        expect(valuesOf(total)).toEqual([null, null, CLOSING_TOTAL]);
    });

    it('colore positivo, negativo e total pelos tokens do tema', () => {
        const [base, increase, decrease, total] = seriesOf(readOption({ type: 'waterfall', data }));

        expect(colorOf(increase)).toBe(THEME.statusSuccessColor);
        expect(colorOf(decrease)).toBe(THEME.statusErrorColor);
        expect(colorOf(total)).toBe(THEME.chartColorPalette);
        expect(colorOf(base)).toBe('transparent');
    });

    it('divide em dois o trecho que cruza o zero, mantendo a cor do tipo', () => {
        const crossing = [
            { name: 'Início', value: INCREASE_STEP },
            { name: 'Queda', value: CROSSING_DROP },
            { name: 'Fim', total: true },
        ];
        const [base, , decrease, total, rest] = seriesOf(readOption({ type: 'waterfall', data: crossing }));
        const remainder = (rest.data as Array<Record<string, unknown> | null>)[1];

        expect(base.data).toEqual([0, 0, 0]);
        expect(valuesOf(decrease)[1]).toBe(INCREASE_STEP);
        expect(remainder?.value).toBe(CROSSING_FINAL);
        expect((remainder?.itemStyle as Record<string, unknown>).color).toBe(THEME.statusErrorColor);
        expect(valuesOf(total)[2]).toBe(CROSSING_FINAL);
    });

    it('mostra a variação com sinal e escapa o nome no tooltip', () => {
        const option = readOption({ type: 'waterfall', data: [{ name: '<b>x</b>', value: INCREASE_STEP }] });
        const tooltip = option.tooltip as { trigger: string; formatter: (params: unknown) => string };

        expect(tooltip.trigger).toBe('item');
        expect(tooltip.formatter({ name: '<b>x</b>', data: { delta: INCREASE_STEP } })).toBe('&lt;b&gt;x&lt;/b&gt;: +10');
    });

    it('não desenha legenda nem usa eixos de outra orientação', () => {
        const option = readOption({
            type: 'waterfall', data, legend: true, orientation: 'horizontal', stacked: false,
        });

        expect(option.legend).toEqual({ show: false });
        expect((option.xAxis as Record<string, unknown>).type).toBe('category');
        expect((option.xAxis as Record<string, unknown>).data).toEqual(['Receita', 'Custo', 'Resultado']);
    });
});

describe('sankey', () => {
    const links = [
        { source: 'Visitas', target: 'Cadastro', value: SANKEY_FLOW },
        { source: 'Visitas', target: 'Saída', value: SANKEY_FLOW },
        { source: 'Cadastro', target: 'Compra', value: SANKEY_FLOW },
    ];

    it('tira os nós das ligações, sem duplicar', () => {
        const option = readOption({ type: 'sankey', data: links });
        const [series] = seriesOf(option);

        expect(series.type).toBe('sankey');
        expect(series.data).toEqual([
            { name: 'Visitas' }, { name: 'Cadastro' }, { name: 'Saída' }, { name: 'Compra' },
        ]);
        expect(series.links).toHaveLength(links.length);
        expect(option.xAxis).toBeUndefined();
        expect(option.legend).toEqual({ show: false });
    });

    it('descarta a ligação que fecharia um ciclo e a que aponta para si mesma', () => {
        const cyclic = [
            ...links,
            { source: 'Compra', target: 'Visitas', value: SANKEY_FLOW },
            { source: 'Saída', target: 'Saída', value: SANKEY_FLOW },
        ];
        const [series] = seriesOf(readOption({ type: 'sankey', data: cyclic }));

        expect(series.links).toHaveLength(links.length);
    });
});

describe('radar e heatmap cartesiano', () => {
    const data = [
        { name: 'Alpha', value: 12 },
        { name: 'Beta', value: 24 },
        { name: 'Gamma', value: 36 },
    ];

    it('usa tooltip por item no radar, sem eixos cartesianos', () => {
        const option = readOption({ type: 'radar', data });

        expect(option.xAxis).toBeUndefined();
        expect(option.yAxis).toBeUndefined();
        expect((option.tooltip as Record<string, unknown>).trigger).toBe('item');
    });

    it('usa eixos categoria/categoria e tooltip por item no heatmap', () => {
        const option = readOption({ type: 'heatmap', data });
        const xAxis = option.xAxis as Record<string, unknown>;
        const yAxis = option.yAxis as Record<string, unknown>;

        expect(xAxis.type).toBe('category');
        expect(xAxis.data).toEqual([0, 1, 2, 3, 4]);
        expect(yAxis.type).toBe('category');
        expect(yAxis.data).toEqual([0]);
        expect((option.tooltip as Record<string, unknown>).trigger).toBe('item');
    });
});

describe('calendar', () => {
    const data = [
        { date: '2026-03-01', value: CALENDAR_QUIET_DAY },
        { date: '2026-03-03', value: CALENDAR_BUSY_DAY },
    ];

    it('deixa o dia sem dado fora da série, em vez de zero', () => {
        const option = readOption({ type: 'calendar', data });
        const [series] = seriesOf(option);

        expect(series.type).toBe('heatmap');
        expect(series.coordinateSystem).toBe('calendar');
        expect(series.data).toEqual([['2026-03-01', CALENDAR_QUIET_DAY], ['2026-03-03', CALENDAR_BUSY_DAY]]);
        expect((series.data as unknown[][]).some(([day]) => day === '2026-03-02')).toBe(false);
    });

    it('pinta a intensidade pela cor da primeira série e mostra o ano dos dados', () => {
        const option = readOption({ type: 'calendar', data });
        const visualMap = option.visualMap as { max: number; inRange: { color: string[] } };

        expect(visualMap.inRange.color).toEqual([THEME.chartColorPalette, THEME.chartColorPalette]);
        expect(visualMap.max).toBe(CALENDAR_BUSY_DAY);
        expect((option.calendar as Record<string, unknown>).range).toBe('2026');
    });

    it('usa o intervalo dos dados quando eles cruzam anos e aceita Date e ISO com hora', () => {
        const spanning = [
            { date: new Date(2025, 11, 30), value: CALENDAR_QUIET_DAY },
            { date: '2026-01-02T10:00:00Z', value: CALENDAR_BUSY_DAY },
        ];
        const option = readOption({ type: 'calendar', data: spanning });

        expect((option.calendar as Record<string, unknown>).range).toEqual(['2025-12-30', '2026-01-02']);
    });

    it('ignora dia que não existe e mantém o último valor de um dia repetido', () => {
        const messy = [
            { date: '2026-02-30', value: CALENDAR_BUSY_DAY },
            { date: '2026-03-01', value: CALENDAR_QUIET_DAY },
            { date: '2026-03-01', value: CALENDAR_BUSY_DAY },
        ];
        const [series] = seriesOf(readOption({ type: 'calendar', data: messy }));

        expect(series.data).toEqual([['2026-03-01', CALENDAR_BUSY_DAY]]);
    });
});

describe('dado inválido', () => {
    const invalidByType: Array<[NonNullable<SarakChartEngineProps['type']>, SarakChartEngineProps['data']]> = [
        ['waterfall', [{ name: 'A', value: 'dez' }, { name: 'B' }]],
        ['sankey', [{ source: 'A', value: SANKEY_FLOW }, { source: 'A', target: 'B', value: 'muito' }, { source: 'B', target: 'B', value: 1 }]],
        ['calendar', [{ date: 'ontem', value: 1 }, { date: '2026-03-01', value: 'alto' }, { value: 1 }]],
    ];

    it.each(invalidByType)('%s sem item aproveitável mostra o estado vazio, sem erro nem ECharts', (type, data) => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const view = renderChart({ type, data });

        expect(view.container.querySelector('[data-sarak-data-empty="true"]')).not.toBeNull();
        expect(capturedCharts.options).toHaveLength(0);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('waterfall aproveita os itens bons e trata o item sem número como variação zero', () => {
        const [base, increase] = seriesOf(readOption({
            type: 'waterfall', data: [{ name: 'A', value: INCREASE_STEP }, { name: 'B', value: 'x' }],
        }));

        expect(base.data).toEqual([0, INCREASE_STEP]);
        expect(valuesOf(increase)).toEqual([INCREASE_STEP, 0]);
    });
});
