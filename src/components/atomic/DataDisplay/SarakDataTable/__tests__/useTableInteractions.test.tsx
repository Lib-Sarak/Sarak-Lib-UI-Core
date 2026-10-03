import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableInteractions } from '../useTableInteractions';

interface Row {
    id: number;
    name: string;
    score: number;
}

const rows: Row[] = [
    { id: 1, name: 'Beto', score: 2 },
    { id: 2, name: 'Ana', score: 1 },
];

const getSortValue = (row: Row, columnId: string) => row[columnId as keyof Row];

describe('useTableInteractions', () => {
    it('ordena localmente e percorre os três estados do cabeçalho', () => {
        const { result } = renderHook(() => useTableInteractions({ rows, getSortValue }));

        expect(result.current.entries.map(({ row }) => row.name)).toEqual(['Beto', 'Ana']);
        act(() => result.current.changeSort('name'));
        expect(result.current.entries.map(({ row }) => row.name)).toEqual(['Ana', 'Beto']);
        act(() => result.current.changeSort('name'));
        expect(result.current.entries.map(({ row }) => row.name)).toEqual(['Beto', 'Ana']);
        act(() => result.current.changeSort('name'));
        expect(result.current.entries.map(({ row }) => row.name)).toEqual(['Beto', 'Ana']);
        expect(result.current.sort).toBeNull();
    });

    it('com sort controlado, notifica a próxima direção sem reordenar os dados recebidos', () => {
        const onSortChange = vi.fn();
        const { result } = renderHook(() => useTableInteractions({
            rows,
            sort: { columnId: 'name', direction: 'asc' },
            onSortChange,
            getSortValue,
        }));

        act(() => result.current.changeSort('name'));

        expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'desc' });
        expect(result.current.entries.map(({ row }) => row.name)).toEqual(['Beto', 'Ana']);
    });

    it('seleciona uma linha e sinaliza seleção parcial', () => {
        const onSelectionChange = vi.fn();
        const { result } = renderHook(() => useTableInteractions({ rows, getSortValue, onSelectionChange }));

        act(() => result.current.toggleRow(1, true));

        expect(onSelectionChange).toHaveBeenCalledWith([1]);
        expect(result.current.selectedKeys.has(1)).toBe(true);
        expect(result.current.allVisibleSelected).toBe(false);
        expect(result.current.partiallySelected).toBe(true);
    });

    it('seleciona e desmarca todas as linhas visíveis preservando chaves externas', () => {
        const onSelectionChange = vi.fn();
        const { result } = renderHook(() => useTableInteractions({
            rows,
            getSortValue,
            selectedKeys: [99],
            onSelectionChange,
        }));

        act(() => result.current.toggleAll(true));
        expect(onSelectionChange).toHaveBeenLastCalledWith([99, 1, 2]);
        act(() => result.current.toggleAll(false));
        expect(onSelectionChange).toHaveBeenLastCalledWith([99]);
    });
});
