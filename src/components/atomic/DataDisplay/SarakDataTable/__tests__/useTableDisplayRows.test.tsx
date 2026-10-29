import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableDisplayRows } from '../useTableDisplayRows';
import type { UseTableDisplayRowsOptions } from '../useTableDisplayRows';

interface Node { id: number; group: string; children?: Node[] }

const tree: Node[] = [{ id: 1, group: 'A', children: [{ id: 10, group: 'A' }] }, { id: 2, group: 'B' }];
const options = (extra: Partial<UseTableDisplayRowsOptions<Node>> = {}): UseTableDisplayRowsOptions<Node> => ({
    entries: tree.map((row, index) => ({ row, index, key: row.id })), hasDetail: false, getChildren: (row) => row.children, getRowKey: (row) => row.id, ...extra,
});
const keys = (result: { current: { displayRows: ReturnType<typeof useTableDisplayRows<Node>>['displayRows'] } }): number[] =>
    result.current.displayRows.flatMap((row) => row.kind === 'data' ? [Number(row.entry.key)] : []);

describe('useTableDisplayRows', () => {
    it('parte recolhido e expande/recolhe pelo toggleRow, avisando onExpandedChange', () => {
        const onExpandedChange = vi.fn();
        const entries = options().entries;
        const { result } = renderHook(() => useTableDisplayRows(options({ entries, onExpandedChange })));
        expect(keys(result)).toEqual([1, 2]);
        act(() => result.current.toggleRow(1));
        expect(keys(result)).toEqual([1, 10, 2]);
        expect(onExpandedChange).toHaveBeenLastCalledWith([1]);
        act(() => result.current.toggleRow(1));
        expect(keys(result)).toEqual([1, 2]);
        expect(onExpandedChange).toHaveBeenLastCalledWith([]);
    });

    it('defaultExpandedDepth abre a árvore até a profundidade pedida', () => {
        const entries = options().entries;
        const { result } = renderHook(() => useTableDisplayRows(options({ entries, defaultExpandedDepth: 1 })));
        expect(keys(result)).toEqual([1, 10, 2]);
    });

    it('expandedKeys controla: toggleRow só avisa, não muda sozinho', () => {
        const onExpandedChange = vi.fn();
        const entries = options().entries;
        const { result } = renderHook(() => useTableDisplayRows(options({ entries, expandedKeys: [], onExpandedChange })));
        act(() => result.current.toggleRow(1));
        expect(onExpandedChange).toHaveBeenCalledWith([1]);
        expect(keys(result)).toEqual([1, 2]);
    });

    it('toggleGroup alterna o grupo e esconde as linhas dele', () => {
        const entries = options().entries;
        const { result } = renderHook(() => useTableDisplayRows(options({ entries, groupBy: { key: 'group' }, getChildren: undefined })));
        expect(keys(result)).toEqual([1, 2]);
        act(() => result.current.toggleGroup('group:A'));
        expect(keys(result)).toEqual([2]);
        act(() => result.current.toggleGroup('group:A'));
        expect(keys(result)).toEqual([1, 2]);
    });
});
