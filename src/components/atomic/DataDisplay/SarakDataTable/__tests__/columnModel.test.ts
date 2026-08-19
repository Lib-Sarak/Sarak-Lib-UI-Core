// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { reorder, computeOffsets, widthOf, type SarakColumn } from '../columnModel';

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
        expect(reorder(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
        expect(reorder(['a', 'b', 'c'], 'a', 'a')).toEqual(['a', 'b', 'c']);
    });

    it('widthOf prioriza a largura controlada sobre o default da coluna', () => {
        expect(widthOf(cols[0], {})).toBe(100);
        expect(widthOf(cols[0], { a: 250 })).toBe(250);
        expect(widthOf({ id: 'x', header: 'X' }, {})).toBe(160);
    });

    it('computeOffsets acumula sticky left/right e soma a largura total', () => {
        const offsets = computeOffsets(cols, {});
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
        const offsets = computeOffsets(stacked, {});
        expect(offsets.left).toEqual({ a: 0, b: 100 });
    });
});
