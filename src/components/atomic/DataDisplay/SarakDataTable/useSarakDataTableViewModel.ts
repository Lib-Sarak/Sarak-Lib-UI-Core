import React, { useCallback, useMemo, useRef, useState } from 'react';
import { requireTanstackUseVirtualizer } from '../optional-tanstack-virtualizer';
import { useSarakLanguage } from '../../../../core/i18n/useSarakLanguage';
import { sarakComputeOffsets, sarakReorder, sarakWidthOf, SARAK_MIN_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn, SarakPinnedOffsets } from './columnModel';
import { columnSearchText, columnSortValue, columnValue, toValueColumn } from './columnValue';
import type { SarakValueColumn } from './columnValue';
import { EXPANDER_WIDTH } from './dataTableCell';
import type { SarakDataTableProps } from './SarakDataTableImpl';
import type { SarakDataTableVirtualRow } from './SarakDataTableRows';
import type { SarakDisplayRow } from './tableDisplayRows';
import { useTableDisplayRows } from './useTableDisplayRows';
import { useTableInteractions } from './useTableInteractions';
import type { TableInteractionsResult } from './useTableInteractions';
import type { SarakDeviceType } from '../../../../core/Provider/DeviceProvider';

/** Largura da coluna do botão de expandir quando a tabela tem `renderExpanded` e não é árvore. */

const DETAIL_ROW_ESTIMATE = 120;

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
    displayRows: Array<SarakDisplayRow<T>>;
    toggleRow: (key: React.Key) => void;
    toggleGroup: (groupId: string) => void;
    footerRows: T[];
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
    displayRows: Array<SarakDisplayRow<T>>;
    toggleRow: (key: React.Key) => void;
    toggleGroup: (groupId: string) => void;
    /** As linhas de dado (sem filhos nem detalhe) sobre as quais o rodapé agrega. */
    footerRows: T[];
    /** A coluna do botão de expandir aparece (há `renderExpanded` e não há árvore). */
    hasExpander: boolean;
    locale: string;
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

const estimateDisplayHeight = <T,>(props: SarakDataTableProps<T>, display: SarakDisplayRow<T> | undefined): number => {
    const headerHeight = props.headerHeight ?? 44;
    if (display?.kind === 'detail') return DETAIL_ROW_ESTIMATE;
    return estimateRowHeight(props.rowHeight ?? 44, headerHeight, display?.kind === 'data' ? display.entry.row : undefined);
};

/** Linhas que atendem à busca: algum campo, pelo texto exibido (ou `searchValue`), contém o termo. */
const filterBySearch = <T,>(rows: T[], columns: Array<SarakValueColumn<T>>, query: string | undefined, locale: string): T[] => {
    const term = query?.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => columns.some((column) => columnSearchText(row, column, locale).toLowerCase().includes(term)));
};

/** O item virtual de uma linha que não é de dado ainda precisa de uma entrada: usa a 1ª linha do grupo. */
const entryOf = <T,>(display: SarakDisplayRow<T>): SarakDataTableVirtualRow<T>['entry'] =>
    display.kind === 'group' || display.kind === 'subtotal'
        ? { row: display.rows[0], index: -1, key: display.id }
        : display.entry;

const useRowState = <T,>(props: SarakDataTableProps<T>, valueColumns: Array<SarakValueColumn<T>>, locale: string): SarakDataTableRowState<T> => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const rows = useMemo(() => filterBySearch(props.rows, valueColumns, props.searchQuery, locale), [props.rows, valueColumns, props.searchQuery, locale]);
    const byId = useMemo(() => new Map(valueColumns.map((column) => [column.id, column])), [valueColumns]);
    const getSortValue = useCallback((row: T, columnId: string): unknown => {
        const column = byId.get(columnId);
        return column ? columnSortValue(row, column) : (row as Record<string, unknown>)[columnId];
    }, [byId]);
    const interactions = useTableInteractions({ rows, getRowKey: props.getRowKey, sort: props.sort, onSortChange: props.onSortChange, selectedKeys: props.selectedKeys, onSelectionChange: props.onSelectionChange, totalCount: props.totalCount, selectAll: props.selectAll, onSelectAllChange: props.onSelectAllChange, getSortValue });
    const { displayRows, toggleRow, toggleGroup } = useTableDisplayRows({
        entries: interactions.entries, groupBy: props.groupBy, hasDetail: Boolean(props.renderExpanded), getChildren: props.getChildren,
        getRowKey: props.getRowKey, defaultExpandedDepth: props.defaultExpandedDepth, expandedKeys: props.expandedKeys, onExpandedChange: props.onExpandedChange,
    });
    const virtualizer = requireTanstackUseVirtualizer()({
        count: displayRows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (index) => estimateDisplayHeight(props, displayRows[index]),
        overscan: props.overscan ?? 8,
    });
    const virtualRows = virtualizer.getVirtualItems().flatMap((item) => {
        const display = displayRows[item.index];
        return display ? [{ entry: entryOf(display), display, virtualIndex: item.index, virtualKey: item.key, start: item.start, size: item.size }] : [];
    });
    const footerRows = useMemo(() => interactions.entries.map(({ row }) => row), [interactions.entries]);
    return { scrollRef, interactions, virtualRows, displayRows, toggleRow, toggleGroup, footerRows, virtualTotalSize: virtualizer.getTotalSize(), measureElement: virtualizer.measureElement };
};

export const useSarakDataTableViewModel = <T,>(props: SarakDataTableProps<T>, device: SarakDeviceType): SarakDataTableViewModel<T> => {
    const { locale } = useSarakLanguage();
    const columnState = useColumnState(props.columns, props.onColumnResize, props.onColumnReorder);
    const valueColumns = useMemo(() => props.columns.map((column) => toValueColumn<T>(column)), [props.columns]);
    const rowState = useRowState(props, valueColumns, locale);
    const offsets = sarakComputeOffsets(columnState.ordered, columnState.widths);
    const hasExpander = Boolean(props.renderExpanded) && !props.getChildren;
    const leadingWidth = (props.selectable ? SELECTION_COLUMN_WIDTH : 0) + (hasExpander ? EXPANDER_WIDTH : 0);
    return {
        props, collapseToCards: (props.responsive ?? true) && device === 'smartphone', widths: columnState.widths,
        ordered: columnState.ordered, offsets, containerWidth: offsets.total + leadingWidth,
        dragId: columnState.dragId, setDragId: columnState.setDragId, onDrop: columnState.onDrop,
        onResizeStart: columnState.onResizeStart, scrollRef: rowState.scrollRef, interactions: rowState.interactions,
        virtualRows: rowState.virtualRows, displayRows: rowState.displayRows, toggleRow: rowState.toggleRow, toggleGroup: rowState.toggleGroup,
        footerRows: rowState.footerRows, hasExpander, locale,
        virtualTotalSize: rowState.virtualTotalSize, virtualizerMeasureElement: rowState.measureElement,
        isAutomaticRowHeight: props.rowHeight === 'auto',
    };
};
