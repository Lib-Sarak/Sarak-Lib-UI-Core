import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakColumn } from '../columnModel';
import { useEditableCell } from '../useEditableCell';

interface Row {
    amount: number | null;
}

const COLUMN: SarakColumn<Row> = { id: 'amount', header: 'Valor', accessor: (row) => row.amount };

describe('useEditableCell', () => {
    it('o rascunho parte do valor da coluna, sem o formato', () => {
        const { result } = renderHook(() => useEditableCell({ row: { amount: 1234.5 }, column: COLUMN, onCellEdit: vi.fn() }));
        act(() => result.current.begin());
        expect(result.current.draft).toBe('1234.5');
    });

    it('valor nulo edita como vazio', () => {
        const { result } = renderHook(() => useEditableCell({ row: { amount: null }, column: COLUMN, onCellEdit: vi.fn() }));
        expect(result.current.initial).toBe('');
    });

    it('sem edição aberta, confirmar não salva', async () => {
        const onCellEdit = vi.fn();
        const { result } = renderHook(() => useEditableCell({ row: { amount: 1 }, column: COLUMN, onCellEdit }));
        await act(() => result.current.commit(false));
        expect(onCellEdit).not.toHaveBeenCalled();
    });
});
