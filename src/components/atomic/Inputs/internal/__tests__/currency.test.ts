import { describe, expect, it } from 'vitest';
import { formatCurrencyEditValue, formatCurrencyValue, parseCurrencyValue } from '../currency';

const CURRENCY_TEST_VALUE = 1234.56;

describe('currency formatting', () => {
    it('formata zero como moeda sem tratá-lo como campo vazio', () => {
        expect(formatCurrencyValue(0, 'pt-BR', 'BRL')).toBe(
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0),
        );
    });

    it('usa a moeda e a locale informadas na formatação nativa', () => {
        expect(formatCurrencyValue(1234.5, 'en-US', 'USD')).toBe(
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5),
        );
    });

    it('mantém vazio para valor nulo', () => {
        expect(formatCurrencyValue(null, 'pt-BR', 'BRL')).toBe('');
    });

    it('formata o valor de edição sem agrupar nem completar casas decimais', () => {
        expect(formatCurrencyEditValue(1234.5, 'pt-BR', 'BRL')).toBe('1234,5');
    });
});

describe('currency parsing', () => {
    it('lê valor decimal negativo com os separadores da locale', () => {
        expect(parseCurrencyValue('-1.234,56', 'pt-BR')).toEqual({ value: -CURRENCY_TEST_VALUE, negativeOnly: false });
    });

    it('lê decimal em locale en-US', () => {
        expect(parseCurrencyValue('$1,234.56', 'en-US')).toEqual({ value: CURRENCY_TEST_VALUE, negativeOnly: false });
    });

    it('distingue zero de uma entrada vazia e preserva o sinal ainda sem dígitos', () => {
        expect(parseCurrencyValue('R$ 0,00', 'pt-BR')).toEqual({ value: 0, negativeOnly: false });
        expect(parseCurrencyValue('-', 'pt-BR')).toEqual({ value: null, negativeOnly: true });
        expect(parseCurrencyValue('', 'pt-BR')).toEqual({ value: null, negativeOnly: false });
    });
});
