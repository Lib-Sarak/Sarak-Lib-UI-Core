import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import SarakChartEngine, { type SarakChartEngineProps } from '../SarakChartEngine';

const capturedCharts = vi.hoisted(() => ({ options: [] as unknown[], styles: [] as unknown[] }));

vi.mock('echarts-for-react', async () => {
    const ReactModule = await import('react');
    return {
        default: ({ option }: { option: unknown }) => {
            capturedCharts.options.push(option);
            return ReactModule.createElement('div');
        },
    };
});

const DESIGN = {
    chartColorPalette: '#2a78d6',
    statusSuccessColor: 'seagreen',
    statusWarningColor: 'goldenrod',
    statusErrorColor: 'crimson',
};
const BRL = { type: 'currency', currency: 'BRL' } as const;
const SALES = 1234.5;
const DATA = [{ name: 'Jan', value: SALES }, { name: 'Fev', value: 2000 }];
const NBSP = / /g;

type Option = Record<string, unknown>;

function readOption(props: Partial<SarakChartEngineProps>, language = 'pt-BR'): Option {
    const value = {
        design: DESIGN,
        options: { i18n: { language } },
    } as unknown as SarakUIContextType;
    const view = render(
        <UIContext.Provider value={value}>
            <SarakChartEngine data={DATA} {...props} />
        </UIContext.Provider>,
    );
    const option = capturedCharts.options.at(-1);
    view.unmount();
    if (!option || typeof option !== 'object') throw new Error('O ECharts não recebeu uma opção.');
    return option as Option;
}

function seriesOf(option: Option): Array<Record<string, unknown>> {
    return option.series as Array<Record<string, unknown>>;
}

function axisFormatter(option: Option, axis: 'xAxis' | 'yAxis', index = 0): (value: unknown) => string {
    const target = option[axis];
    const resolved = (Array.isArray(target) ? target[index] : target) as { axisLabel: { formatter: (value: unknown) => string } };
    return resolved.axisLabel.formatter;
}

function plain(text: string): string {
    return text.replace(NBSP, ' ');
}

beforeEach(() => {
    capturedCharts.options.splice(0);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('valueFormat', () => {
    it('formata o eixo de valor e a dica em BRL no locale pt-BR', () => {
        const option = readOption({ type: 'bar', valueFormat: BRL });
        const tooltip = option.tooltip as { valueFormatter: (value: unknown) => string };

        expect(plain(axisFormatter(option, 'yAxis')(SALES))).toBe('R$ 1.234,50');
        expect(plain(tooltip.valueFormatter(SALES))).toBe('R$ 1.234,50');
    });

    it('usa o locale en-US quando o idioma da tela é en-US', () => {
        const option = readOption({ type: 'bar', valueFormat: BRL }, 'en-US');

        expect(axisFormatter(option, 'yAxis')(SALES)).toBe('R$1,234.50');
    });

    it('sem valueFormat o eixo fica como na rc.3, sem formatter', () => {
        const option = readOption({ type: 'bar' });

        expect((option.yAxis as { axisLabel: Record<string, unknown> }).axisLabel.formatter).toBeUndefined();
        expect((option.tooltip as Record<string, unknown>).valueFormatter).toBeUndefined();
    });

    it('formata o eixo de valor horizontal quando a orientação é horizontal', () => {
        const option = readOption({ type: 'bar', orientation: 'horizontal', series: [{ key: 'value' }], valueFormat: BRL });

        expect(plain(axisFormatter(option, 'xAxis')(SALES))).toBe('R$ 1.234,50');
    });

    it('series[].format vence o valueFormat no eixo direito e na dica da série', () => {
        const option = readOption({
            type: 'line',
            valueFormat: BRL,
            data: [{ name: 'Jan', value: 1, share: 0.25 }],
            series: [{ key: 'value' }, { key: 'share', axis: 'right', format: { type: 'percent' } }],
        });
        const [, shareSeries] = seriesOf(option);
        const sharePointer = (shareSeries.tooltip as { valueFormatter: (value: unknown) => string }).valueFormatter;

        expect(plain(axisFormatter(option, 'yAxis', 0)(1))).toBe('R$ 1,00');
        expect(plain(axisFormatter(option, 'yAxis', 1)(0.25))).toBe('25%');
        expect(plain(sharePointer(0.25))).toBe('25%');
        expect(seriesOf(option)[0].tooltip).toBeUndefined();
    });

    it('gauge sem % quando valueFormat não é percentual, com % quando é percentual ou omitido', () => {
        const detailOf = (props: Partial<SarakChartEngineProps>): Record<string, unknown> =>
            seriesOf(readOption({ type: 'gauge', data: [{ value: 50 }], ...props }))[0].detail as Record<string, unknown>;

        expect(detailOf({}).formatter).toBe('{value}%');
        expect(plain((detailOf({ valueFormat: BRL }).formatter as (value: unknown) => string)(50))).toBe('R$ 50,00');
        expect((detailOf({ valueFormat: { type: 'percent' } }).formatter as (value: unknown) => string)(50)).toBe('50%');
    });
});

describe('gauge', () => {
    it('aceita min e max próprios e calcula o percentual sobre essa escala', () => {
        const [series] = seriesOf(readOption({
            type: 'gauge', data: [{ value: 150 }], gauge: { min: 100, max: 200 }, valueFormat: { type: 'percent' },
        }));
        const detail = series.detail as { formatter: (value: unknown) => string };

        expect([series.min, series.max]).toEqual([100, 200]);
        expect(detail.formatter(150)).toBe('50%');
    });

    it('sem a prop gauge a escala segue 0 a 100', () => {
        const [series] = seriesOf(readOption({ type: 'gauge', data: [{ value: 5 }] }));

        expect([series.min, series.max]).toEqual([0, 100]);
    });
});

describe('referenceLines e referenceBands', () => {
    it('traça a linha no tom de status, tracejada, com o rótulo dado', () => {
        const [series] = seriesOf(readOption({
            type: 'bar',
            referenceLines: [{ value: 1500, label: 'Meta', tone: 'error', dashed: true }],
        }));
        const [line] = (series.markLine as { data: Array<Record<string, unknown>> }).data;

        expect(line.yAxis).toBe(1500);
        expect((line.lineStyle as Record<string, unknown>)).toEqual({ color: DESIGN.statusErrorColor, type: 'dashed' });
        expect((line.label as Record<string, unknown>).formatter).toBe('Meta');
    });

    it('usa o valor formatado como rótulo quando não há label e coordenada x na orientação horizontal', () => {
        const [series] = seriesOf(readOption({
            type: 'bar', orientation: 'horizontal', series: [{ key: 'value' }], valueFormat: BRL,
            referenceLines: [{ value: 1500 }],
        }));
        const [line] = (series.markLine as { data: Array<Record<string, unknown>> }).data;

        expect(line.xAxis).toBe(1500);
        expect(plain((line.label as { formatter: string }).formatter)).toBe('R$ 1.500,00');
    });

    it('põe a linha de eixo direito na série do eixo direito', () => {
        const option = readOption({
            type: 'line',
            data: [{ name: 'Jan', value: 1, share: 2 }],
            series: [{ key: 'value' }, { key: 'share', axis: 'right' }],
            referenceLines: [{ value: 2, axis: 'right', tone: 'success' }, { value: 1 }],
        });
        const [left, right] = seriesOf(option);

        expect((right.markLine as { data: unknown[] }).data).toHaveLength(1);
        expect((left.markLine as { data: Array<Record<string, unknown>> }).data[0].yAxis).toBe(1);
    });

    it('sombreia a faixa entre from e to no tom de aviso', () => {
        const [series] = seriesOf(readOption({
            type: 'line', referenceBands: [{ from: 1000, to: 1800, label: 'Faixa', tone: 'warning' }],
        }));
        const [[start, end]] = (series.markArea as { data: Array<Array<Record<string, unknown>>> }).data;

        expect([start.yAxis, end.yAxis]).toEqual([1000, 1800]);
        expect((start.itemStyle as Record<string, unknown>).color).toBe(DESIGN.statusWarningColor);
        expect(start.name).toBe('Faixa');
    });

    it('sem as props não há marcação nas séries', () => {
        const [series] = seriesOf(readOption({ type: 'bar' }));

        expect(series.markLine).toBeUndefined();
        expect(series.markArea).toBeUndefined();
    });
});

describe('zoom', () => {
    it('true monta o controle deslizante e reserva espaço no grid', () => {
        const option = readOption({ type: 'line', zoom: true });
        const baseBottom = (readOption({ type: 'line' }).grid as { bottom: number }).bottom;

        expect((option.dataZoom as Array<Record<string, unknown>>)[0]).toMatchObject({ type: 'slider', xAxisIndex: 0 });
        expect((option.grid as { bottom: number }).bottom).toBeGreaterThan(baseBottom);
    });

    it("'inside' zooma por gesto, sem controle", () => {
        const option = readOption({ type: 'line', zoom: 'inside' });

        expect(option.dataZoom).toEqual([{ type: 'inside', xAxisIndex: 0 }]);
    });

    it('omitido, não há dataZoom', () => {
        expect(readOption({ type: 'line' }).dataZoom).toBeUndefined();
    });
});

describe('pieLabel', () => {
    const slices = [{ name: 'A', value: 30 }, { name: 'B', value: 70 }];
    const labelOf = (pieLabel?: SarakChartEngineProps['pieLabel'], valueFormat?: SarakChartEngineProps['valueFormat']) =>
        seriesOf(readOption({ type: 'pie', data: slices, pieLabel, valueFormat }))[0].label as {
            show: boolean; formatter?: (params: unknown) => string;
        };

    it("'percent' mostra a fatia em percentual no locale da tela", () => {
        const label = labelOf('percent');

        expect(label.show).toBe(true);
        expect(label.formatter?.({ name: 'A', value: 30, percent: 30 })).toBe('30%');
    });

    it("'name-percent' junta nome e percentual; 'value' usa o valueFormat", () => {
        expect(labelOf('name-percent').formatter?.({ name: 'A', value: 30, percent: 12.5 })).toBe('A: 12,5%');
        expect(plain(labelOf('value', BRL).formatter?.({ name: 'A', value: 30, percent: 30 }) ?? '')).toBe('R$ 30,00');
        expect(labelOf('name').formatter?.({ name: 'A', value: 30, percent: 30 })).toBe('A');
    });

    it("'none' esconde o rótulo, inclusive no destaque", () => {
        const [series] = seriesOf(readOption({ type: 'pie', data: slices, pieLabel: 'none' }));

        expect(series.label).toEqual({ show: false });
        expect((series.emphasis as { label: { show: boolean } }).label.show).toBe(false);
    });

    it('omitido, mantém o rótulo da rc.3 (só no destaque)', () => {
        expect(labelOf().show).toBe(false);
    });
});

describe('height e aviso do Recharts', () => {
    it('height em número vira px no contêiner; omitido, não há style', () => {
        const value = { design: DESIGN } as unknown as SarakUIContextType;
        const view = render(
            <UIContext.Provider value={value}>
                <SarakChartEngine data={DATA} type="bar" height={320} />
            </UIContext.Provider>,
        );
        const box = view.container.querySelector('[role="img"]') as HTMLElement;

        expect(box.style.height).toBe('320px');
        view.unmount();
        const bare = render(
            <UIContext.Provider value={value}>
                <SarakChartEngine data={DATA} type="bar" />
            </UIContext.Provider>,
        );
        expect((bare.container.querySelector('[role="img"]') as HTMLElement).style.height).toBe('');
    });

    it('com recharts, as props novas entram no aviso de prop ignorada', async () => {
        vi.stubGlobal('ResizeObserver', class { observe(): void {} unobserve(): void {} disconnect(): void {} });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const value = { design: DESIGN } as unknown as SarakUIContextType;
        render(
            <UIContext.Provider value={value}>
                <SarakChartEngine
                    data={DATA}
                    type="bar"
                    config={{ engine: 'recharts' }}
                    valueFormat={BRL}
                    height={200}
                    referenceLines={[{ value: 1 }]}
                    referenceBands={[{ from: 1, to: 2 }]}
                    zoom
                    pieLabel="percent"
                    gauge={{ max: 10 }}
                />
            </UIContext.Provider>,
        );
        await vi.waitFor(() => expect(warn).toHaveBeenCalled());
        const message = String(warn.mock.calls[0][0]);

        ['valueFormat', 'height', 'referenceLines', 'referenceBands', 'zoom', 'pieLabel', 'gauge']
            .forEach((name) => expect(message).toContain(name));
    });
});
