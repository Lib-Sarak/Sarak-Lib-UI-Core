import { describe, expect, it } from 'vitest';
import { resolveRowCells } from '../columnSpan';
import type { SpanColumn } from '../columnSpan';

interface Row { total: boolean }
type Col = SpanColumn<Row> & { width: number };

const widthOf = (column: Col): number => column.width;
const columns = (): Col[] => [
    { id: 'a', width: 100, pinned: 'left', colSpan: (row) => row.total ? 3 : undefined },
    { id: 'b', width: 50, pinned: 'left' },
    { id: 'c', width: 70 },
    { id: 'd', width: 30 },
];

describe('resolveRowCells', () => {
    it('sem colSpan, uma célula por coluna', () => {
        expect(resolveRowCells(columns(), { total: false }, widthOf).map((cell) => cell.column.id)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('colSpan cobre as seguintes e soma a largura, parando na fronteira de congelamento', () => {
        const cells = resolveRowCells(columns(), { total: true }, widthOf);
        expect(cells.map((cell) => [cell.column.id, cell.span, cell.width])).toEqual([['a', 2, 150], ['c', 1, 70], ['d', 1, 30]]);
    });

    it('colSpan maior que o restante é limitado', () => {
        const wide: Col[] = [{ id: 'a', width: 10, colSpan: () => 9 }, { id: 'b', width: 10 }];
        expect(resolveRowCells(wide, { total: true }, widthOf)).toEqual([{ column: wide[0], span: 2, width: 20 }]);
    });
});
