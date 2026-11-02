import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakColumn } from '../columnModel';
import type { SarakDataTableProps } from '../SarakDataTableImpl';
import { COLUMN_RESIZE_STEP } from '../tableColumnState';
import { useDataTableColumns } from '../useDataTableColumns';

type Row = Record<string, unknown>;

const COLUMNS: Array<SarakColumn<Row>> = [{ id: 'a', header: 'A', width: 100, minWidth: 90 }, { id: 'b', header: 'B' }, { id: 'c', header: 'C' }];
const hook = (props: Partial<SarakDataTableProps<Row>>) =>
    renderHook(() => useDataTableColumns<Row>({ columns: COLUMNS, rows: [], ...props }));
const ids = (columns: Array<SarakColumn<Row>>): string[] => columns.map((column) => column.id);
const arrow = (key: string): React.KeyboardEvent => ({ key, preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as React.KeyboardEvent;

describe('useDataTableColumns', () => {
    it('sem as props, não é gerenciada e coluna nova não entra na ordem', () => {
        const { result, rerender } = renderHook(({ columns }) => useDataTableColumns<Row>({ columns, rows: [] }), { initialProps: { columns: COLUMNS.slice(0, 2) } });
        expect(result.current.managed).toBe(false);
        rerender({ columns: COLUMNS });
        expect(ids(result.current.ordered)).toEqual(['a', 'b']);
    });

    it('gerenciada, coluna nova entra no fim', () => {
        const { result } = hook({ defaultColumnState: { order: ['b', 'a'] } });
        expect(ids(result.current.ordered)).toEqual(['b', 'a', 'c']);
    });

    it('esconde e move devolvendo o estado inteiro', () => {
        const onColumnStateChange = vi.fn();
        const { result } = hook({ onColumnStateChange });
        act(() => result.current.toggleHidden('b'));
        expect(ids(result.current.ordered)).toEqual(['a', 'c']);
        expect(ids(result.current.allColumns)).toEqual(['a', 'b', 'c']);
        act(() => result.current.moveColumn('c', -1));
        expect(onColumnStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ hidden: ['b'], order: ['a', 'c', 'b'] }));
    });

    it('controlada, só devolve o valor: quem muda a tela é o consumidor', () => {
        const onColumnStateChange = vi.fn();
        const { result } = hook({ columnState: { hidden: [] }, onColumnStateChange });
        act(() => result.current.toggleHidden('a'));
        expect(onColumnStateChange).toHaveBeenCalledWith({ hidden: ['a'] });
        expect(ids(result.current.ordered)).toEqual(['a', 'b', 'c']);
    });

    it('a seta muda a largura pelo passo e respeita o mínimo', () => {
        const onColumnResize = vi.fn();
        const { result } = hook({ onColumnResize, onColumnStateChange: vi.fn() });
        act(() => result.current.onResizeKey(arrow('ArrowRight'), COLUMNS[0]));
        expect(result.current.widths.a).toBe(100 + COLUMN_RESIZE_STEP);
        expect(onColumnResize).toHaveBeenCalledWith('a', 100 + COLUMN_RESIZE_STEP);
        act(() => result.current.onResizeKey(arrow('ArrowLeft'), COLUMNS[0]));
        act(() => result.current.onResizeKey(arrow('ArrowLeft'), COLUMNS[0]));
        expect(result.current.widths.a).toBe(COLUMNS[0].minWidth);
    });

    it('outra tecla na alça não mexe em nada', () => {
        const onColumnResize = vi.fn();
        const { result } = hook({ onColumnResize });
        act(() => result.current.onResizeKey(arrow('Enter'), COLUMNS[0]));
        expect(onColumnResize).not.toHaveBeenCalled();
    });

    it('voltar ao padrão restaura o estado inicial', () => {
        const { result } = hook({ defaultColumnState: { hidden: ['c'] } });
        act(() => result.current.toggleHidden('a'));
        act(() => result.current.resetState());
        expect(ids(result.current.ordered)).toEqual(['a', 'b']);
    });
});
