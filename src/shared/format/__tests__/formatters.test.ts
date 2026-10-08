import { describe, expect, it } from 'vitest';
import { sarakFormatCurrency, sarakFormatDate, sarakFormatNumber, sarakFormatPercent } from '../index';

describe('formatadores públicos Sarak — locale explícito', () => {
    it('formata número conforme o locale informado', () => {
        expect(sarakFormatNumber(1234.5, 'en-US')).toBe('1,234.5');
        expect(sarakFormatNumber(1234.5, 'de-DE')).toBe('1.234,5');
    });

    it('reaproveita o formatador de moeda existente', () => {
        expect(sarakFormatCurrency(1234.5, 'USD', 'en-US')).toBe('$1,234.50');
        expect(sarakFormatCurrency(1234.5, 'EUR', 'de-DE')).toContain('1.234,50');
    });

    it('interpreta percentual como razão e adapta separadores ao locale', () => {
        expect(sarakFormatPercent(0.125, 'en-US')).toBe('12.5%');
        expect(sarakFormatPercent(0.125, 'de-DE')).toContain('12,5');
    });

    it('formata a mesma data em locales diferentes e rejeita datas inválidas', () => {
        const date = new Date('2024-01-02T00:00:00.000Z');
        const options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeZone: 'UTC' };
        expect(sarakFormatDate(date, 'en-US', options)).toBe('1/2/24');
        expect(sarakFormatDate(date, 'de-DE', options)).toBe('02.01.24');
        expect(sarakFormatDate('invalid', 'en-US')).toBe('');
    });

    it('retorna vazio para valores numéricos ausentes ou não finitos', () => {
        expect(sarakFormatNumber(null, 'en-US')).toBe('');
        expect(sarakFormatCurrency(Number.POSITIVE_INFINITY, 'USD', 'en-US')).toBe('');
        expect(sarakFormatPercent(Number.NaN, 'en-US')).toBe('');
    });
});
