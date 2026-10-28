import { describe, expect, it } from 'vitest';
import { hasRenderableData, resolveChartType } from '../chartDataModel';

describe('resolveChartType', () => {
    it('a prop explícita vence; sem ela vale o tipo do tema; tipo desconhecido cai em line', () => {
        expect(resolveChartType('pie', 'bar')).toBe('pie');
        expect(resolveChartType(undefined, 'area')).toBe('area');
        expect(resolveChartType(undefined, 'inexistente')).toBe('line');
    });
});

describe('hasRenderableData', () => {
    it('vazio ou não array não é renderizável', () => {
        expect(hasRenderableData([], 'bar', 'value')).toBe(false);
        expect(hasRenderableData(undefined, 'bar', 'value')).toBe(false);
    });

    it('exige a chave de valor nos formatos comuns', () => {
        expect(hasRenderableData([{ value: 1 }], 'bar', 'value')).toBe(true);
        expect(hasRenderableData([{ value: null }, { other: 1 }], 'bar', 'value')).toBe(false);
    });

    it('candlestick e boxplot exigem os campos numéricos próprios', () => {
        expect(hasRenderableData([{ open: 1, close: 2, low: 0, high: 3 }], 'candlestick', 'value')).toBe(true);
        expect(hasRenderableData([{ open: 1 }], 'candlestick', 'value')).toBe(false);
        expect(hasRenderableData([{ value: [1, 2, 3, 4, 5] }], 'boxplot', 'value')).toBe(true);
        expect(hasRenderableData([{ value: [1, 2] }], 'boxplot', 'value')).toBe(false);
    });

    it('sunburst aceita filhos sem a chave de valor', () => {
        expect(hasRenderableData([{ children: [] }], 'sunburst', 'value')).toBe(true);
    });
});
