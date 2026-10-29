import { describe, expect, it } from 'vitest';
import { applyChartEnhancements, createChartValueFormatter } from '../chartEnhancements';
import type { ChartTheme } from '../builders/types';

const NBSP = / /g;
const theme = {
    textColor: 'gray',
    fontSize: 11,
    statusColors: { statusSuccessColor: 'green', statusWarningColor: 'orange', statusErrorColor: 'red', statusInfoColor: 'blue' },
} as unknown as ChartTheme;

describe('createChartValueFormatter', () => {
    it('sem formato não há formatter', () => {
        expect(createChartValueFormatter(undefined, 'pt-BR')).toBeUndefined();
    });

    it('formata número, moeda e percentual no locale pedido', () => {
        const brl = createChartValueFormatter({ type: 'currency', currency: 'BRL' }, 'pt-BR')!;
        const percent = createChartValueFormatter({ type: 'percent' }, 'en-US')!;
        const number = createChartValueFormatter({ type: 'number' }, 'de-DE')!;

        expect(brl(1234.5).replace(NBSP, ' ')).toBe('R$ 1.234,50');
        expect(percent(0.12)).toBe('12%');
        expect(number(1234.5)).toBe('1.234,5');
    });

    it('valor não numérico passa como texto e nulo vira vazio', () => {
        const format = createChartValueFormatter({ type: 'number' }, 'pt-BR')!;

        expect(format('n/d')).toBe('n/d');
        expect(format(null)).toBe('');
    });
});

describe('applyChartEnhancements', () => {
    it('não altera a opção recebida e devolve a mesma forma sem nenhuma prop nova', () => {
        const option = { xAxis: { type: 'category' }, yAxis: { type: 'value' }, series: [{ type: 'bar' }] };
        const result = applyChartEnhancements(option, { type: 'bar', theme });

        expect(result).toEqual(option);
    });

    it('ignora referência, zoom e pizza em tipo que não os comporta', () => {
        const option = { series: [{ type: 'radar' }] };
        const result = applyChartEnhancements(option, {
            type: 'radar', theme, referenceLines: [{ value: 1 }], zoom: true, pieLabel: 'percent',
        });

        expect(result).toEqual(option);
    });
});
