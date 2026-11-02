import React, { useCallback, useMemo, useRef, useState } from 'react';
import { requireTanstackUseVirtualizer } from '../optional-tanstack-virtualizer';
import { useSarakLanguage } from '../../../../core/i18n/useSarakLanguage';
import { sarakComputeOffsets, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn, SarakPinnedOffsets } from './columnModel';
import { columnSearchText, columnSortValue, columnValue, toValueColumn } from './columnValue';
import type { SarakValueColumn } from './columnValue';
import { EXPANDER_WIDTH } from './dataTableCell';
import type { SarakDataTableProps } from './SarakDataTableImpl';
import type { SarakDataTableVirtualRow } from './SarakDataTableRows';
import type { SarakDisplayRow } from './tableDisplayRows';
import { useDataTableColumns } from './useDataTableColumns';
import type { DataTableColumns } from './useDataTableColumns';
import { useIsPrinting } from './useIsPrinting';
import { useTableDisplayRows } from './useTableDisplayRows';
import { useTableInteractions } from './useTableInteractions';
import type { DataTableInteractionsResult } from './useTableInteractions';
import { useTableViews } from './useTableViews';
import type { TableViews } from './useTableViews';
import type { SarakDeviceType } from '../../../../core/Provider/DeviceProvider';

/** Largura da coluna do botão de expandir quando a tabela tem `renderExpanded` e não é árvore. */

const DETAIL_ROW_ESTIMATE = 120;

interface SarakDataTableRowState<T> {
    scrollRef: React.RefObject<HTMLDivElement>;
    interactions: DataTableInteractionsResult<T>;
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
    interactions: DataTableInteractionsResult<T>;
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
    /** Colunas configuráveis: estado, painel e alça. */
    columns: DataTableColumns<T>;
    views: TableViews;
    /** Densidade de relatório: sem cromo, com todas as linhas no fluxo. */
    report: boolean;
    /** A página está sendo impressa: tabela inteira, sem colunas de serviço. */
    printing: boolean;
    /** Linhas no fluxo do documento, em vez da janela virtual. */
    flow: boolean;
    /** Colunas dos cartões: as configuradas, ou as declaradas quando não há configuração. */
    cardColumns: SarakColumn<T>[];
}

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

const useRowState = <T,>(props: SarakDataTableProps<T>, valueColumns: Array<SarakValueColumn<T>>, locale: string, flow: boolean): SarakDataTableRowState<T> => {
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
        count: flow ? 0 : displayRows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (index) => estimateDisplayHeight(props, displayRows[index]),
        overscan: props.overscan ?? 8,
    });
    const virtualRows = flow
        ? displayRows.map((display, index) => ({ entry: entryOf(display), display, virtualIndex: index, virtualKey: display.id, start: 0, size: 0 }))
        : virtualizer.getVirtualItems().flatMap((item) => {
            const display = displayRows[item.index];
            return display ? [{ entry: entryOf(display), display, virtualIndex: item.index, virtualKey: item.key, start: item.start, size: item.size }] : [];
        });
    const footerRows = useMemo(() => interactions.entries.map(({ row }) => row), [interactions.entries]);
    return { scrollRef, interactions, virtualRows, displayRows, toggleRow, toggleGroup, footerRows, virtualTotalSize: virtualizer.getTotalSize(), measureElement: virtualizer.measureElement };
};

export const useSarakDataTableViewModel = <T,>(props: SarakDataTableProps<T>, device: SarakDeviceType): SarakDataTableViewModel<T> => {
    const { locale } = useSarakLanguage();
    const printing = useIsPrinting();
    const report = props.density === 'report';
    const collapseToCards = (props.responsive ?? true) && device === 'smartphone' && !printing;
    const flow = (report || printing) && !collapseToCards;
    const columns = useDataTableColumns(props);
    const [viewQuery, setViewQuery] = useState<string | undefined>();
    const query = props.searchQuery ?? viewQuery;
    const valueColumns = useMemo(() => props.columns.map((column) => toValueColumn<T>(column)), [props.columns]);
    const rowState = useRowState({ ...props, searchQuery: query }, valueColumns, locale, flow);
    const views = useTableViews({
        views: props.views, activeView: props.activeView, onViewChange: props.onViewChange, onViewSave: props.onViewSave, onSearchQueryChange: props.onSearchQueryChange,
        query, setQuery: setViewQuery, columnState: columns.state, commitColumns: columns.commitState, resetColumns: columns.resetState,
        sort: rowState.interactions.sort, applySort: rowState.interactions.applySort,
    });
    const offsets = sarakComputeOffsets(columns.ordered, columns.widths);
    const hasExpander = Boolean(props.renderExpanded) && !props.getChildren && !printing;
    const leadingWidth = (props.selectable && !printing ? SELECTION_COLUMN_WIDTH : 0) + (hasExpander ? EXPANDER_WIDTH : 0);
    return {
        props, collapseToCards, widths: columns.widths,
        ordered: columns.ordered, offsets, containerWidth: offsets.total + leadingWidth,
        dragId: columns.dragId, setDragId: columns.setDragId, onDrop: columns.onDrop,
        onResizeStart: columns.onResizeStart, scrollRef: rowState.scrollRef, interactions: rowState.interactions,
        virtualRows: rowState.virtualRows, displayRows: rowState.displayRows, toggleRow: rowState.toggleRow, toggleGroup: rowState.toggleGroup,
        footerRows: rowState.footerRows, hasExpander, locale,
        virtualTotalSize: rowState.virtualTotalSize, virtualizerMeasureElement: rowState.measureElement,
        isAutomaticRowHeight: props.rowHeight === 'auto',
        columns, views, report, printing, flow, cardColumns: columns.managed ? columns.ordered : props.columns,
    };
};
