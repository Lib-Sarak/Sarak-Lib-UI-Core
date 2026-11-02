import { describe, expect, it } from 'vitest';
import { buildChartOption } from '../seriesModel';
import { applyChartRefinements } from '../chartRefinements';
import { ON_COLOR_DARK, ON_COLOR_LIGHT } from '../../../../../core/Provider/utils/on-color';
import type { ChartTheme } from '../builders/types';

const THEME = {
    palette: ['#1e3a8a', '#facc15', '#16a34a', '#9333ea'],
    primaryColor: '#1e3a8a',
    secondaryColor: '#facc15',
    statusColors: { statusSuccessColor: '#16a34a', statusWarningColor: '#d97706', statusErrorColor: '#dc2626', statusInfoColor: '#2563eb' },
    textColor: '#475569', titleColor: '#0f172a', surfaceColor: '#ffffff', borderColor: '#cbd5e1', bodyFont: 'Inter', headingFont: 'Inter',
    fontSize: 11, borderWidth: 1, borderRadius: 8, axisLabelMargin: 12, chartThickness: 2, chartGridOpacity: 0.05, chartShowGrid: true,
    chartSmoothing: true, chartTooltipBg: '#fff',
    baseOption: { aria: { enabled: true, decal: { show: false } }, tooltip: {}, grid: { right: 24 } },
} as unknown as ChartTheme;

const DATA = [
    { name: 'Aprovada', value: 1200000 },
    { name: 'Recusada', value: 0 },
    { name: 'Pendente', value: 300 },
];
const SHORT_KEY_DATA = DATA.map((item) => ({ name: item.name, v: item.value }));
const FUNNEL = [{ name: 'a', v: 500 }, { name: 'b', v: 120 }];

type Loose = Record<string, any>;

function build(type: 'bar' | 'pie' | 'funnel' | 'treemap', extra: Record<string, unknown> = {}, data: Array<Record<string, unknown>> = DATA): Loose {
    return buildChartOption({ type, data, theme: THEME, locale: 'pt-BR', ...extra }) as Loose;
}

describe('pattern', () => {
    it('sem pattern não há decal; com pattern o decal volta', () => {
        expect(build('bar').aria.decal.show).toBe(false);
        expect(build('bar', { pattern: true }).aria.decal.show).toBe(true);
    });
});

describe('getPointColor', () => {
    const getPointColor = (datum: Record<string, unknown>) => datum.name === 'Recusada' ? 'statusErrorColor' as const : undefined;

    it('pinta o item pelo token em bar de uma série, pie, funnel e treemap; undefined cai na paleta', () => {
        for (const type of ['bar', 'pie', 'funnel', 'treemap'] as const) {
            const data = type === 'funnel' || type === 'treemap' ? SHORT_KEY_DATA : DATA;
            const items = build(type, { getPointColor }, data).series[0].data;
            expect(items[1].itemStyle.color, type).toBe('#dc2626');
            expect(items[0].itemStyle, type).toBeUndefined();
        }
    });

    it('em bar com várias séries não toca nos itens', () => {
        const series = [{ key: 'value' }, { key: 'v' }];
        const option = build('bar', { getPointColor, series });
        expect(option.series[0].data).toEqual(DATA.map((item) => item.value));
    });
});

describe('rótulo interno', () => {
    it('funil e treemap escolhem texto escuro ou claro pelo fundo do item', () => {
        const data = [{ name: 'escuro', v: 5 }, { name: 'claro', v: 4 }];
        const getPointColor = (_: unknown, index: number) => index === 0 ? undefined : 'statusWarningColor' as const;
        for (const type of ['funnel', 'treemap'] as const) {
            const [dark, light] = build(type, { getPointColor: getPointColor as never }, data).series[0].data;
            expect(dark.label.color, type).toBe(ON_COLOR_LIGHT);
            expect(light.label.color, type).toBe(ON_COLOR_DARK);
        }
    });
});

describe('showValues e espessura', () => {
    it('formata o valor na ponta da barra pelo valueFormat e preserva o zero', () => {
        const option = build('bar', { showValues: true, valueFormat: { type: 'number' } });
        const { label } = option.series[0];
        expect(label.position).toBe('top');
        expect(label.formatter({ value: 1200000 })).toBe('1.200.000');
        expect(option.xAxis.data).toContain('Recusada');
        expect(option.series[0].data[1]).toBe(0);
    });

    it("'auto' esconde o que não cabe e a barra horizontal põe o valor à direita", () => {
        const option = build('bar', { showValues: 'auto', orientation: 'horizontal' });
        expect(option.series[0].labelLayout).toEqual({ hideOverlap: true });
        expect(option.series[0].label.position).toBe('right');
        expect(build('bar').series[0].label).toBeUndefined();
    });

    it('config.thickness vira barMaxWidth; sem ele a barra mantém 40%', () => {
        const thick = build('bar', { config: { thickness: 28 } }).series[0];
        expect(thick.barMaxWidth).toBe(28);
        expect(thick.barWidth).toBeUndefined();
        expect(build('bar').series[0].barWidth).toBe('40%');
    });
});

describe('funil', () => {
    it('escala pelo maior valor, funnel sobrescreve e os dados guardam o valor real', () => {
        const { series } = build('funnel', {}, FUNNEL);
        expect(series[0]).toMatchObject({ min: 0, max: 500 });
        expect(series[0].data.map((item: Loose) => item.value)).toEqual([500, 120]);
        expect(build('funnel', { funnel: { min: 10, max: 900 } }, FUNNEL).series[0]).toMatchObject({ min: 10, max: 900 });
    });

    it('a dica formata o valor recebido, não o normalizado', () => {
        const option = build('funnel', { valueFormat: { type: 'number' } }, FUNNEL);
        expect(option.tooltip.valueFormatter(500)).toBe('500');
    });
});

describe('eixo', () => {
    const MANY = Array.from({ length: 24 }, (_, index) => ({ name: `m${index}`, value: index * 1000 }));

    it('maxTicks reduz as marcas de categoria e do eixo de valor, e hideOverlap vale sempre', () => {
        const option = build('bar', { axis: { maxTicks: 6 } }, MANY);
        expect(option.xAxis.axisLabel).toMatchObject({ hideOverlap: true, interval: 3 });
        expect(option.yAxis.splitNumber).toBe(6);
        expect(build('bar', {}, MANY).xAxis.axisLabel.interval).toBeUndefined();
    });

    it('sem prop, a largura estreita decide quantas marcas cabem', () => {
        expect(build('bar', { width: 288 }, MANY).xAxis.axisLabel.interval).toBe(5);
    });

    it('a margem reserva o rótulo final', () => {
        expect(build('bar').grid.right).toBeGreaterThan(24);
    });

    it('compact abrevia o eixo no locale e a dica mantém o valor inteiro', () => {
        const option = build('bar', { axis: { compact: true }, valueFormat: { type: 'number' } });
        expect(option.yAxis.axisLabel.formatter(1200000).replace(/\s/g, ' ')).toBe('1,2 mi');
        expect(option.tooltip.valueFormatter(1200000)).toBe('1.200.000');
    });

    it('formatos sem eixo cartesiano passam intactos', () => {
        const option = { series: [{ type: 'pie' }] };
        expect(applyChartRefinements(option, { type: 'pie', theme: THEME, data: [] }).series).toEqual(option.series);
    });
});
