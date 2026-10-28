import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableInteractions } from '../useTableInteractions';
import type { UseTableInteractionsOptions } from '../useTableInteractions';

interface Row { id: number }

const rows: Row[] = [{ id: 1 }, { id: 2 }];
const setup = (extra: Partial<UseTableInteractionsOptions<Row>> = {}) =>
    renderHook((props: Partial<UseTableInteractionsOptions<Row>>) => useTableInteractions<Row>({ rows, getSortValue: () => null, ...extra, ...props }));

describe('useTableInteractions — todos os N do servidor', () => {
    it('só oferece selecionar todos com a página marcada e totalCount maior', () => {
        const { result } = setup({ totalCount: 50 });
        expect(result.current.canSelectAllTotal).toBe(false);
        act(() => result.current.toggleAll(true));
        expect(result.current.canSelectAllTotal).toBe(true);
    });

    it('sem totalCount ou com totalCount igual às linhas, não oferece', () => {
        const { result } = setup({ totalCount: 2 });
        act(() => result.current.toggleAll(true));
        expect(result.current.canSelectAllTotal).toBe(false);
        const other = setup();
        act(() => other.result.current.toggleAll(true));
        expect(other.result.current.canSelectAllTotal).toBe(false);
    });

    it('selectAllTotal liga o modo, zera as exceções e avisa', () => {
        const onSelectAllChange = vi.fn();
        const onSelectionChange = vi.fn();
        const { result } = setup({ totalCount: 50, onSelectAllChange, onSelectionChange });
        act(() => result.current.toggleAll(true));
        act(() => result.current.selectAllTotal?.());
        expect(onSelectAllChange).toHaveBeenCalledWith(true);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        expect(result.current.selectAll).toBe(true);
        expect(result.current.allVisibleSelected).toBe(true);
    });

    it('com selectAll, desmarcar põe a chave nas exceções e marcar a tira', () => {
        const { result } = setup({ totalCount: 50, selectAll: true, selectedKeys: [] });
        act(() => result.current.toggleRow(1, false));
        expect(result.current.selectedKeys.has(1)).toBe(true);
        const controlled = setup({ totalCount: 50, selectAll: true, selectedKeys: [1], onSelectionChange: vi.fn() });
        expect(controlled.result.current.selectedKeys.has(1)).toBe(false);
        expect(controlled.result.current.selectedKeys.has(2)).toBe(true);
        expect(controlled.result.current.partiallySelected).toBe(true);
    });

    it('clearSelection desliga o modo e limpa; toggleAll(false) no modo faz o mesmo', () => {
        const onSelectAllChange = vi.fn();
        const onSelectionChange = vi.fn();
        const { result } = setup({ totalCount: 50, selectAll: true, selectedKeys: [], onSelectAllChange, onSelectionChange });
        act(() => result.current.toggleAll(false));
        expect(onSelectAllChange).toHaveBeenLastCalledWith(false);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        act(() => result.current.toggleAll(true));
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        act(() => result.current.clearSelection?.());
        expect(onSelectAllChange).toHaveBeenLastCalledWith(false);
    });
});
