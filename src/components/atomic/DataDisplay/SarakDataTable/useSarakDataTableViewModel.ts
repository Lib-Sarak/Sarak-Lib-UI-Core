import React, { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { sarakComputeOffsets, sarakReorder, sarakWidthOf, SARAK_MIN_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn, SarakPinnedOffsets } from './columnModel';
import type { SarakDataTableProps } from './SarakDataTableImpl';
import type { SarakDataTableVirtualRow } from './SarakDataTableRows';
import { useTableInteractions } from './useTableInteractions';
import type { TableInteractionsResult } from './useTableInteractions';
import type { SarakDeviceType } from '../../../../core/Provider/DeviceProvider';

interface SarakDataTableColumnState<T> {
    widths: Record<string, number>;
    ordered: SarakColumn<T>[];
    dragId: string | null;
    setDragId: (columnId: string | null) => void;
    onDrop: (columnId: string) => void;
    onResizeStart: (event: React.PointerEvent, column: SarakColumn<T>) => void;
}

interface SarakDataTableRowState<T> {
    scrollRef: React.RefObject<HTMLDivElement>;
    interactions: TableInteractionsResult<T>;
    virtualRows: SarakDataTableVirtualRow<T>[];
    virtualTotalSize: number;
    measureElement: (element: Element | null) => void;
}

export interface SarakDataTableViewModel<T> {
    props: SarakDataTableProps<T>;
    collapseToCards: boolean;
    widths: Record<string, number>;
    ordered: SarakColumn<T>[];
    offsets: SarakPinnedOffsets;
    containerWidth: number;
    dragId: string | null;
    setDragId: (columnId: string | null) => void;
    onDrop: (columnId: string) => void;
    onResizeStart: (event: React.PointerEvent, column: SarakColumn<T>) => void;
    scrollRef: React.RefObject<HTMLDivElement>;
    interactions: TableInteractionsResult<T>;
    virtualRows: SarakDataTableVirtualRow<T>[];
    virtualTotalSize: number;
    virtualizerMeasureElement: (element: Element | null) => void;
    isAutomaticRowHeight: boolean;
}

const useColumnState = <T,>(columns: SarakColumn<T>[], onColumnResize?: SarakDataTableProps<T>['onColumnResize'], onColumnReorder?: SarakDataTableProps<T>['onColumnReorder']): SarakDataTableColumnState<T> => {
    const [widths, setWidths] = useState<Record<string, number>>({});
    const [order, setOrder] = useState<string[]>(() => columns.map((column) => column.id));
    const [dragId, setDragId] = useState<string | null>(null);
    const byId = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
    const ordered = useMemo(() => order.map((id) => byId.get(id)).filter((column): column is SarakColumn<T> => Boolean(column)), [order, byId]);
    const onResizeStart = (event: React.PointerEvent, column: SarakColumn<T>): void => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startWidth = sarakWidthOf(column, widths);
        const minimum = column.minWidth ?? SARAK_MIN_COLUMN_WIDTH;
        const move = (pointer: PointerEvent): void => setWidths((previous) => ({ ...previous, [column.id]: Math.max(minimum, startWidth + pointer.clientX - startX) }));
        const finish = (pointer: PointerEvent): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', finish);
            onColumnResize?.(column.id, Math.max(minimum, startWidth + pointer.clientX - startX));
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', finish);
    };
    const onDrop = (toId: string): void => {
        if (dragId && dragId !== toId) {
            setOrder((previous) => sarakReorder(previous, dragId, toId));
            onColumnReorder?.(dragId, toId);
        }
        setDragId(null);
    };
    return { widths, ordered, dragId, setDragId, onDrop, onResizeStart };
};

const estimateRowHeight = <T,>(rowHeight: SarakDataTableProps<T>['rowHeight'], headerHeight: number, row: T | undefined): number => {
    const estimate = typeof rowHeight === 'function'
        ? (row === undefined ? headerHeight : rowHeight(row))
        : typeof rowHeight === 'number' ? rowHeight : headerHeight;
    return Number.isFinite(estimate) && estimate > 0 ? estimate : headerHeight;
};

const useRowState = <T,>(props: SarakDataTableProps<T>): SarakDataTableRowState<T> => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const interactions = useTableInteractions({ rows: props.rows, getRowKey: props.getRowKey, sort: props.sort, onSortChange: props.onSortChange, selectedKeys: props.selectedKeys, onSelectionChange: props.onSelectionChange, getSortValue: (row, columnId) => (row as Record<string, unknown>)[columnId] });
    const virtualizer = useVirtualizer({
        count: interactions.entries.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (index) => estimateRowHeight(props.rowHeight ?? 44, props.headerHeight ?? 44, interactions.entries[index]?.row),
        overscan: props.overscan ?? 8,
    });
    const virtualRows = virtualizer.getVirtualItems().flatMap((item) => {
        const entry = interactions.entries[item.index];
        return entry ? [{ entry, virtualIndex: item.index, virtualKey: item.key, start: item.start, size: item.size }] : [];
    });
    return { scrollRef, interactions, virtualRows, virtualTotalSize: virtualizer.getTotalSize(), measureElement: virtualizer.measureElement };
};

export const useSarakDataTableViewModel = <T,>(props: SarakDataTableProps<T>, device: SarakDeviceType): SarakDataTableViewModel<T> => {
    const columnState = useColumnState(props.columns, props.onColumnResize, props.onColumnReorder);
    const rowState = useRowState(props);
    const offsets = sarakComputeOffsets(columnState.ordered, columnState.widths);
    return {
        props, collapseToCards: (props.responsive ?? true) && device === 'smartphone', widths: columnState.widths,
        ordered: columnState.ordered, offsets, containerWidth: offsets.total + (props.selectable ? SELECTION_COLUMN_WIDTH : 0),
        dragId: columnState.dragId, setDragId: columnState.setDragId, onDrop: columnState.onDrop,
        onResizeStart: columnState.onResizeStart, scrollRef: rowState.scrollRef, interactions: rowState.interactions,
        virtualRows: rowState.virtualRows, virtualTotalSize: rowState.virtualTotalSize, virtualizerMeasureElement: rowState.measureElement,
        isAutomaticRowHeight: props.rowHeight === 'auto',
    };
};
