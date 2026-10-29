import { describe, expect, it } from 'vitest';
import { buildCartesianAxes, buildLegend } from '../cartesianLayout';
import type { ChartTheme } from '../builders/types';

const theme = {
    chartShowGrid: true, borderColor: 'gray', chartGridOpacity: 0.1, textColor: 'black', fontSize: 11,
    bodyFont: 'sans', axisLabelMargin: 8,
} as unknown as ChartTheme;
const base = { theme, hasRightAxis: false };
const CATEGORIES = ['Jan', 'Fev'];

type Axis = Record<string, unknown>;

describe('buildCartesianAxes', () => {
    it('vertical: categorias no eixo x, valor no y', () => {
        const axes = buildCartesianAxes({ ...base, type: 'bar', seriesChart: true }, CATEGORIES);

        expect((axes.xAxis as Axis).data).toEqual(CATEGORIES);
        expect((axes.yAxis as Axis).type).toBe('value');
    });

    it('horizontal troca os eixos', () => {
        const axes = buildCartesianAxes({ ...base, type: 'bar', seriesChart: true, orientation: 'horizontal' }, CATEGORIES);

        expect((axes.yAxis as Axis).data).toEqual(CATEGORIES);
        expect((axes.xAxis as Axis).type).toBe('value');
    });

    it('com série no eixo direito, o eixo de valor vira par e o segundo fica sem grade', () => {
        const axes = buildCartesianAxes({ ...base, type: 'line', seriesChart: true, hasRightAxis: true }, CATEGORIES);
        const [left, right] = axes.yAxis as Axis[];

        expect(left.position).toBeUndefined();
        expect(right.position).toBe('right');
        expect((right.splitLine as Axis).show).toBe(false);
    });

    it('formato fora de série não troca nem duplica eixos', () => {
        const axes = buildCartesianAxes({ ...base, type: 'pie', seriesChart: false }, CATEGORIES);

        expect(axes.xAxis).toBeUndefined();
    });
});

describe('buildLegend', () => {
    it('sem ajuste, aparece no topo só com mais de uma série', () => {
        expect(buildLegend(undefined, 1, theme)).toEqual({ legend: { show: false } });
        expect((buildLegend(undefined, 2, theme).legend as Axis).top).toBe(8);
    });

    it('bottom posiciona embaixo e false esconde', () => {
        expect((buildLegend('bottom', 1, theme).legend as Axis).bottom).toBe(8);
        expect(buildLegend(false, 3, theme)).toEqual({ legend: { show: false } });
    });
});
