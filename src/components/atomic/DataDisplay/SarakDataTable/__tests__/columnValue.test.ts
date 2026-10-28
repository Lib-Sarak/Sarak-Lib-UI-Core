import { describe, expect, it } from 'vitest';
import type { SarakValueColumn } from '../columnValue';
import {
    aggregateText, columnAlign, columnSearchText, columnSortValue, columnText, columnValue, footerContent,
    formatByValueFormat, hasFooter, isNumericFormat, sarakAggregate, toValueColumn,
} from '../columnValue';
import { sortTableRows } from '../columnModel';

interface Row extends Record<string, unknown> {
    id: number;
    name: string;
    amount: number;
}

const BRL = { type: 'currency', currency: 'BRL' } as const;
const rows: Row[] = [
    { id: 1, name: 'Aluguel', amount: 1000 },
    { id: 2, name: 'Água', amount: 200 },
    { id: 3, name: 'Luz', amount: 300.5 },
];
const amount = (extra: Partial<SarakValueColumn<Row>> = {}): SarakValueColumn<Row> => ({ id: 'amount', ...extra });
const plain = (text: string): string => text.replace(/\s/g, ' ');

describe('columnValue — leitura e formato', () => {
    it('lê pelo accessor e, sem ele, por row[id]', () => {
        expect(columnValue(rows[0], amount())).toBe(1000);
        expect(columnValue(rows[0], amount({ accessor: (row) => row.amount * 2 }))).toBe(2000);
    });

    it('formata moeda, percentual, número e data pelo locale', () => {
        expect(plain(formatByValueFormat(1000, BRL, 'pt-BR'))).toBe('R$ 1.000,00');
        expect(formatByValueFormat(0.12, { type: 'percent' }, 'pt-BR')).toBe('12%');
        expect(formatByValueFormat(1234.5, { type: 'number' }, 'en-US')).toBe('1,234.5');
        expect(formatByValueFormat('2026-10-27T12:00:00Z', { type: 'date', options: { timeZone: 'UTC' } }, 'pt-BR')).toBe('27/10/2026');
    });

    it('sem formato mantém o String(amount) da rc.3 e nulo vira vazio', () => {
        expect(formatByValueFormat(42, undefined)).toBe('42');
        expect(formatByValueFormat(null, BRL)).toBe('');
        expect(formatByValueFormat('abc', BRL, 'pt-BR')).toBe('abc');
    });

    it('numérico com formato alinha à direita; o alinhamento declarado vence', () => {
        expect(isNumericFormat(BRL)).toBe(true);
        expect(isNumericFormat({ type: 'date' })).toBe(false);
        expect(columnAlign({ ...amount({ format: BRL }) })).toBe('right');
        expect(columnAlign({ ...amount({ format: BRL }), align: 'center' })).toBe('center');
        expect(columnAlign({ id: 'name' })).toBe('left');
    });
});

describe('columnValue — ordem e busca pelo valor certo', () => {
    it('ordena pelo valor bruto: "R$ 200" vem antes de "R$ 1.000"', () => {
        const column = amount({ format: BRL });
        const sorted = sortTableRows(rows, { columnId: 'amount', direction: 'asc' }, (row) => columnSortValue(row, column));
        expect(sorted.map(({ row }) => plain(columnText(row, column, 'pt-BR')))).toEqual(['R$ 200,00', 'R$ 300,50', 'R$ 1.000,00']);
    });

    it('sortValue vence o accessor', () => {
        const column = amount({ sortValue: (row) => row.name });
        expect(columnSortValue(rows[0], column)).toBe('Aluguel');
    });

    it('a busca usa o texto exibido e searchValue a sobrepõe', () => {
        const column = amount({ format: BRL });
        expect(columnSearchText(rows[0], column, 'pt-BR')).toContain('1.000,00');
        expect(columnSearchText(rows[0], { ...column, searchValue: () => 'mensal' }, 'pt-BR')).toBe('mensal');
    });
});

describe('columnValue — agregação', () => {
    it.each([
        ['sum', 1500.5], ['avg', 1500.5 / 3], ['count', 3], ['min', 200], ['max', 1000],
    ] as const)('%s', (aggregate, expected) => {
        expect(sarakAggregate(rows, amount({ aggregate }))).toBeCloseTo(expected);
    });

    it('aceita função própria e coluna de Table (key)', () => {
        const column = { key: 'amount', aggregate: (values: unknown[], all: Row[]) => `${values.length}/${all.length}` };
        expect(sarakAggregate(rows, column)).toBe('3/3');
    });

    it('sem aggregate devolve undefined; sem números, avg é undefined e sum é 0', () => {
        expect(sarakAggregate(rows, amount())).toBeUndefined();
        expect(sarakAggregate(rows, { id: 'name', aggregate: 'sum' })).toBe(0);
        expect(sarakAggregate(rows, { id: 'name', aggregate: 'avg' })).toBeUndefined();
    });

    it('count não leva o formato de moeda; o rodapé usa o formato nos demais', () => {
        expect(aggregateText(3, amount({ aggregate: 'count', format: BRL }), 'pt-BR')).toBe('3');
        expect(plain(String(footerContent(rows, amount({ aggregate: 'sum', format: BRL }), 'pt-BR')))).toBe('R$ 1.500,50');
    });

    it('footer próprio (nó ou função) vence o agregado e hasFooter enxerga ambos', () => {
        expect(footerContent(rows, amount({ footer: 'Total' }))).toBe('Total');
        expect(footerContent(rows, amount({ aggregate: 'sum', footer: ({ value, rows: all }) => `${String(value)}|${all.length}` }))).toBe('1500.5|3');
        expect(footerContent(rows, amount())).toBeNull();
        expect(hasFooter([amount(), amount({ footer: 'x' })])).toBe(true);
        expect(hasFooter([amount()])).toBe(false);
    });

    it('toValueColumn aceita id ou key', () => {
        expect(toValueColumn<Row>({ key: 'name' }).id).toBe('name');
        expect(toValueColumn<Row>({ id: 'amount' }).id).toBe('amount');
    });
});
