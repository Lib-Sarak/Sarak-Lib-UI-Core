// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sarakReorder, sarakComputeOffsets, sarakWidthOf, nextTableSort, sortTableRows, pinnedStyle, type SarakColumn } from '../columnModel';

interface Row {
    name: string;
}

const cols: Array<SarakColumn<Row>> = [
    { id: 'a', header: 'A', width: 100, pinned: 'left' },
    { id: 'b', header: 'B', width: 200 },
    { id: 'c', header: 'C', width: 80, pinned: 'right' },
];

describe('Spec 12 (Onda 9) — columnModel', () => {
    it('reorder move a coluna de origem para a posição da coluna de destino', () => {
        expect(sarakReorder(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
        expect(sarakReorder(['a', 'b', 'c'], 'a', 'a')).toEqual(['a', 'b', 'c']);
    });

    it('widthOf prioriza a largura controlada sobre o default da coluna', () => {
        expect(sarakWidthOf(cols[0], {})).toBe(100);
        expect(sarakWidthOf(cols[0], { a: 250 })).toBe(250);
        expect(sarakWidthOf({ id: 'x', header: 'X' }, {})).toBe(160);
    });

    it('computeOffsets acumula sticky left/right e soma a largura total', () => {
        const offsets = sarakComputeOffsets(cols, {});
        expect(offsets.left).toEqual({ a: 0 });
        expect(offsets.right).toEqual({ c: 0 });
        expect(offsets.total).toBe(380);
    });

    it('computeOffsets empilha múltiplas colunas congeladas do mesmo lado', () => {
        const stacked: Array<SarakColumn<Row>> = [
            { id: 'a', header: 'A', width: 100, pinned: 'left' },
            { id: 'b', header: 'B', width: 120, pinned: 'left' },
            { id: 'c', header: 'C', width: 80 },
        ];
        const offsets = sarakComputeOffsets(stacked, {});
        expect(offsets.left).toEqual({ a: 0, b: 100 });
    });

    it('nextTableSort percorre crescente, decrescente e sem ordenação', () => {
        const ascending = nextTableSort(null, 'name');
        const descending = nextTableSort(ascending, 'name');
        expect(ascending).toEqual({ columnId: 'name', direction: 'asc' });
        expect(descending).toEqual({ columnId: 'name', direction: 'desc' });
        expect(nextTableSort(descending, 'name')).toBeNull();
        expect(nextTableSort(descending, 'role')).toEqual({ columnId: 'role', direction: 'asc' });
    });

    it('sortTableRows ordena por número e texto preservando a posição original nos empates', () => {
        const records = [
            { name: 'Beto', score: 2 },
            { name: 'ana', score: 1 },
            { name: 'Ana', score: 1 },
        ];
        expect(sortTableRows(records, { columnId: 'score', direction: 'asc' }, (row, id) => row[id as keyof typeof row])
            .map(({ row }) => row.name)).toEqual(['ana', 'Ana', 'Beto']);
        expect(sortTableRows(records, { columnId: 'name', direction: 'desc' }, (row, id) => row[id as keyof typeof row])
            .map(({ row }) => row.name)).toEqual(['Beto', 'ana', 'Ana']);
    });

    it('pinnedStyle desloca a primeira coluna congelada após a coluna de seleção', () => {
        expect(pinnedStyle(cols[0], sarakComputeOffsets(cols, {}), 'surface', 48).left).toBe(48);
        expect(pinnedStyle(cols[2], sarakComputeOffsets(cols, {}), 'surface', 48).right).toBe(0);
    });
});
