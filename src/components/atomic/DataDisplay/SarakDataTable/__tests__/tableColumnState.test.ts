import { describe, expect, it } from 'vitest';
import { columnNeighbor, moveColumnTo, resolveColumnOrder, toggleColumnHidden, withColumnWidth } from '../tableColumnState';

describe('tableColumnState', () => {
    it('ignora id que saiu e acrescenta coluna nova ao fim', () => {
        expect(resolveColumnOrder(['a', 'b', 'c'], ['c', 'gone', 'a'])).toEqual(['c', 'a', 'b']);
        expect(resolveColumnOrder(['a', 'b'], undefined)).toEqual(['a', 'b']);
    });

    it('alterna a visibilidade sem perder o resto do estado', () => {
        const hidden = toggleColumnHidden({ widths: { a: 10 } }, 'a');
        expect(hidden).toEqual({ widths: { a: 10 }, hidden: ['a'] });
        expect(toggleColumnHidden(hidden, 'a').hidden).toEqual([]);
    });

    it('move a coluna e para nas pontas', () => {
        expect(moveColumnTo({}, ['a', 'b', 'c'], 'c', -1).order).toEqual(['a', 'c', 'b']);
        const edge = { hidden: [] };
        expect(moveColumnTo(edge, ['a', 'b'], 'a', -1)).toBe(edge);
        expect(moveColumnTo(edge, ['a', 'b'], 'x', 1)).toBe(edge);
    });

    it('acha a vizinha, ou nada na ponta', () => {
        expect(columnNeighbor(['a', 'b'], 'a', 1)).toBe('b');
        expect(columnNeighbor(['a', 'b'], 'a', -1)).toBeNull();
    });

    it('grava a largura por coluna', () => {
        expect(withColumnWidth({ widths: { a: 1 } }, 'b', 2).widths).toEqual({ a: 1, b: 2 });
    });
});
