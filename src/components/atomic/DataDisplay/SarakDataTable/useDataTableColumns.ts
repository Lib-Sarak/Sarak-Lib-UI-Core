import type React from 'react';
import { useMemo, useState } from 'react';
import { sarakReorder, sarakWidthOf, SARAK_MIN_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn } from './columnModel';
import type { SarakDataTableProps } from './SarakDataTableImpl';
import { COLUMN_RESIZE_STEP, columnNeighbor, moveColumnTo, resolveColumnOrder, toggleColumnHidden, withColumnWidth } from './tableColumnState';
import type { SarakColumnState } from './tableColumnState';

export interface DataTableColumns<T> {
    widths: Record<string, number>;
    /** Colunas visíveis, na ordem efetiva. */
    ordered: SarakColumn<T>[];
    /** Todas as colunas, escondidas inclusive, na ordem efetiva (o painel lista estas). */
    allColumns: SarakColumn<T>[];
    state: SarakColumnState;
    /** O consumidor pediu colunas configuráveis: há botão, painel e alça por teclado. */
    managed: boolean;
    dragId: string | null;
    setDragId: (columnId: string | null) => void;
    onDrop: (columnId: string) => void;
    onResizeStart: (event: React.PointerEvent, column: SarakColumn<T>) => void;
    onResizeKey: (event: React.KeyboardEvent, column: SarakColumn<T>) => void;
    toggleHidden: (columnId: string) => void;
    moveColumn: (columnId: string, delta: number) => void;
    commitState: (next: SarakColumnState) => void;
    resetState: () => void;
}

const initialState = <T,>(columns: SarakColumn<T>[], base: SarakColumnState | undefined): SarakColumnState => ({
    ...base,
    order: base?.order ?? columns.map((column) => column.id),
});

const EMPTY_WIDTHS: Record<string, number> = {};

const minimumOf = <T,>(column: SarakColumn<T>): number => column.minWidth ?? SARAK_MIN_COLUMN_WIDTH;

/** Sem as props de coluna, a ordem é a do estado inicial: coluna que entra depois não aparece, como sempre foi. */
const useOrderedColumns = <T,>(columns: SarakColumn<T>[], state: SarakColumnState, managed: boolean) => useMemo(() => {
    const byId = new Map(columns.map((column) => [column.id, column]));
    const order = managed ? resolveColumnOrder(columns.map((column) => column.id), state.order) : state.order ?? [];
    const allColumns = order.map((id) => byId.get(id)).filter((column): column is SarakColumn<T> => Boolean(column));
    const hidden = new Set(state.hidden ?? []);
    return { order, allColumns, ordered: allColumns.filter((column) => !hidden.has(column.id)) };
}, [columns, state.order, state.hidden, managed]);

interface ResizeOptions<T> {
    widths: Record<string, number>;
    state: SarakColumnState;
    commitState: (next: SarakColumnState) => void;
    onColumnResize: SarakDataTableProps<T>['onColumnResize'];
}

/** Largura por ponteiro e por teclado; durante o arraste a largura é só visual e o estado muda ao soltar. */
const useColumnResize = <T,>({ widths, state, commitState, onColumnResize }: ResizeOptions<T>) => {
    const [liveWidth, setLiveWidth] = useState<{ id: string; width: number } | null>(null);
    const commitWidth = (column: SarakColumn<T>, width: number): void => {
        commitState(withColumnWidth(state, column.id, width));
        onColumnResize?.(column.id, width);
    };
    const onResizeStart = (event: React.PointerEvent, column: SarakColumn<T>): void => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startWidth = sarakWidthOf(column, widths);
        const widthAt = (pointer: PointerEvent): number => Math.max(minimumOf(column), startWidth + pointer.clientX - startX);
        const move = (pointer: PointerEvent): void => setLiveWidth({ id: column.id, width: widthAt(pointer) });
        const finish = (pointer: PointerEvent): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', finish);
            setLiveWidth(null);
            commitWidth(column, widthAt(pointer));
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', finish);
    };
    const onResizeKey = (event: React.KeyboardEvent, column: SarakColumn<T>): void => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        event.stopPropagation();
        const delta = event.key === 'ArrowRight' ? COLUMN_RESIZE_STEP : -COLUMN_RESIZE_STEP;
        commitWidth(column, Math.max(minimumOf(column), sarakWidthOf(column, widths) + delta));
    };
    return { liveWidth, onResizeStart, onResizeKey };
};

export const useDataTableColumns = <T,>(props: SarakDataTableProps<T>): DataTableColumns<T> => {
    const { columns, columnState, defaultColumnState, onColumnStateChange, onColumnResize, onColumnReorder } = props;
    const managed = columnState !== undefined || defaultColumnState !== undefined || onColumnStateChange !== undefined || props.views !== undefined;
    const [internal, setInternal] = useState<SarakColumnState>(() => initialState(columns, defaultColumnState));
    const [dragId, setDragId] = useState<string | null>(null);
    const state = columnState ?? internal;
    const { order, allColumns, ordered } = useOrderedColumns(columns, state, managed);
    const commitState = (next: SarakColumnState): void => {
        if (columnState === undefined) setInternal(next);
        onColumnStateChange?.(next);
    };
    const storedWidths = state.widths ?? EMPTY_WIDTHS;
    const resize = useColumnResize<T>({ widths: storedWidths, state, commitState, onColumnResize });
    const { liveWidth } = resize;
    const widths = useMemo(() => (liveWidth ? { ...storedWidths, [liveWidth.id]: liveWidth.width } : storedWidths), [storedWidths, liveWidth]);
    const onDrop = (toId: string): void => {
        if (dragId && dragId !== toId) {
            commitState({ ...state, order: sarakReorder(order, dragId, toId) });
            onColumnReorder?.(dragId, toId);
        }
        setDragId(null);
    };
    const moveColumn = (columnId: string, delta: number): void => {
        const neighbor = columnNeighbor(order, columnId, delta);
        if (neighbor === null) return;
        commitState(moveColumnTo(state, order, columnId, delta));
        onColumnReorder?.(columnId, neighbor);
    };
    return {
        widths, ordered, allColumns, state, managed, dragId, setDragId, onDrop, onResizeStart: resize.onResizeStart, onResizeKey: resize.onResizeKey, moveColumn, commitState,
        toggleHidden: (columnId) => commitState(toggleColumnHidden(state, columnId)),
        resetState: () => commitState(initialState(columns, defaultColumnState)),
    };
};
