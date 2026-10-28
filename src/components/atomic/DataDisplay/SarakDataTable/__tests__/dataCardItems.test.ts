import { describe, expect, it } from 'vitest';
import { cardItemsOf } from '../dataCardItems';
import type { SarakDisplayRow } from '../tableDisplayRows';

interface Row { id: number }

describe('cardItemsOf', () => {
    it('devolve as linhas visuais recebidas', () => {
        const displayRows: Array<SarakDisplayRow<Row>> = [{ kind: 'subtotal', id: 's', groupKey: 'A', rows: [] }];
        expect(cardItemsOf({ displayRows, rows: [] })).toBe(displayRows);
    });

    it('sem displayRows, uma linha de dado por row usando rowKeys e rowIndexes', () => {
        const items = cardItemsOf<Row>({ rows: [{ id: 7 }, { id: 8 }], rowKeys: ['a', 'b'], rowIndexes: [5, 6] });
        expect(items).toHaveLength(2);
        expect(items[1]).toMatchObject({ kind: 'data', id: 'row:b', entry: { key: 'b', index: 6 }, expandable: false });
    });

    it('sem rowKeys usa getRowKey e, sem ele, a posição', () => {
        expect(cardItemsOf<Row>({ rows: [{ id: 7 }], getRowKey: (row) => `k${row.id}` })[0]).toMatchObject({ id: 'row:k7' });
        expect(cardItemsOf<Row>({ rows: [{ id: 7 }] })[0]).toMatchObject({ id: 'row:0' });
    });
});
