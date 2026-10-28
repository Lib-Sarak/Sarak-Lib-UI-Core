import { useCallback, useMemo } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { useSarakLanguage } from '../../../core/i18n/useSarakLanguage';
import { columnSearchText, columnSortValue, toValueColumn } from '../DataDisplay/SarakDataTable/columnValue';
import type { SarakValueColumn } from '../DataDisplay/SarakDataTable/columnValue';
import { useTableDisplayRows } from '../DataDisplay/SarakDataTable/useTableDisplayRows';
import { sarakTableToCsv, sarakDownloadCsv } from '../DataDisplay/SarakDataTable/tableCsv';
import { useTableLayoutStyles } from '../Tables/hooks/useTableLayoutStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakTableData } from './hooks/useSarakTableData';
import { useTableInteractions } from '../DataDisplay/SarakDataTable/useTableInteractions';
import type { TableInteractionsResult } from '../DataDisplay/SarakDataTable/useTableInteractions';
import type { SarakTableProps, SarakTableColumn } from './SarakTable';
import type { SarakTableViewProps } from './SarakTableViewParts';

interface SarakTableLayout {
    collapseToCards: boolean;
    cellDensityClass: string;
    zebraStriping: boolean;
    containerClassName: string;
    containerStyle: ReturnType<ReturnType<typeof useStructuralStyles>['getContainerStyles']>['style'];
}

interface SarakTableColumns<TData> {
    columnKeys: string[];
    columnLabels: Record<string, string>;
    columns: SarakTableColumn<TData>[];
}

interface SarakTableViewModelInput<TData extends Record<string, unknown>> {
    props: SarakTableProps<TData>;
    locale: string;
    valueColumns: Array<SarakValueColumn<TData>>;
    displayRows: ReturnType<typeof useTableDisplayRows<TData>>;
    tableData: ReturnType<typeof useSarakTableData<TData>>;
    layout: SarakTableLayout;
    columns: SarakTableColumns<TData>;
    interactions: TableInteractionsResult<TData>;
}

const useSarakTableLayout = (responsive: boolean): SarakTableLayout => {
    const { design } = useSarakUI();
    const device = useSarakDevice();
    const { cellDensityClass } = useTableLayoutStyles(design);
    const { getContainerStyles } = useStructuralStyles();
    const container = getContainerStyles();
    return { collapseToCards: responsive && device === 'smartphone', cellDensityClass, zebraStriping: design.tableZebraStriping === true, containerClassName: container.className, containerStyle: container.style };
};

const createSarakTableColumns = <TData extends Record<string, unknown>>(
    customColumns: SarakTableColumn<TData>[] | undefined,
    mapping: Record<string, string> | undefined,
    rows: TData[],
): SarakTableColumns<TData> => {
    const columnKeys = customColumns?.map((column) => column.key)
        ?? (mapping ? Object.keys(mapping) : rows.length > 0 ? Object.keys(rows[0]).filter((key) => !key.startsWith('_')) : []);
    const customLabels = customColumns?.reduce<Record<string, string>>((labels, column) => {
        labels[column.key] = column.label;
        return labels;
    }, {});
    const columnLabels = customLabels
        ?? mapping
        ?? columnKeys.reduce<Record<string, string>>((labels, key) => ({ ...labels, [key]: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ') }), {});
    return { columnKeys, columnLabels, columns: customColumns ?? columnKeys.map((key) => ({ key, label: columnLabels[key] })) };
};

const exportCsv = <TData extends Record<string, unknown>>(props: SarakTableProps<TData>, columns: SarakTableColumn<TData>[], rows: TData[], locale: string): void => {
    const filename = typeof props.exportable === 'object' && props.exportable.filename ? props.exportable.filename : 'table.csv';
    sarakDownloadCsv(filename, sarakTableToCsv(columns, rows, { locale }));
};

const createSarakTableViewProps = <TData extends Record<string, unknown>>({ props, locale, valueColumns, displayRows, tableData, layout, columns, interactions }: SarakTableViewModelInput<TData>): SarakTableViewProps<TData> => {
    const canRefresh = (props.showRefresh ?? true) && props.data === undefined && Boolean(props.load);
    const loading = props.loading ?? tableData.loading;
    const error = props.error === undefined ? tableData.error : props.error;
    return {
        filteredData: tableData.filteredData, interactions, columns: columns.columns, columnKeys: columns.columnKeys, columnLabels: columns.columnLabels,
        label: props.label, role: props.role ?? 'neutral', density: props.density ?? 'standard', loading, error,
        hasData: tableData.data.length > 0, updatedAt: tableData.updatedAt,
        collapseToCards: layout.collapseToCards, canRefresh, showSearch: props.showSearch ?? true, selectable: props.selectable ?? false,
        search: tableData.search, onSearchChange: tableData.setSearch, onRefresh: () => void tableData.loadData(),
        onRetry: props.onRetry ?? (canRefresh ? () => void tableData.loadData() : undefined), onRowClick: props.onRowClick,
        emptyMessage: props.emptyMessage, cellDensityClass: layout.cellDensityClass, zebraStriping: layout.zebraStriping, containerClassName: layout.containerClassName,
        containerStyle: layout.containerStyle,
        displayRows: displayRows.displayRows, toggleRow: displayRows.toggleRow, toggleGroup: displayRows.toggleGroup, renderExpanded: props.renderExpanded,
        footerRows: tableData.filteredData, valueColumns, locale, exportable: Boolean(props.exportable),
        onExport: () => exportCsv(props, columns.columns, tableData.filteredData, locale),
    };
};

export const useSarakTableViewModel = <TData extends Record<string, unknown>>(
    props: SarakTableProps<TData>,
): SarakTableViewProps<TData> => {
    const layout = useSarakTableLayout(props.responsive ?? true);
    const { locale } = useSarakLanguage();
    const valueColumns = useMemo(() => (props.columns ?? []).map((column) => toValueColumn<TData>(column)), [props.columns]);
    const displayedText = useCallback((row: TData): string => valueColumns.map((column) => columnSearchText(row, column, locale)).join('\n'), [valueColumns, locale]);
    const tableData = useSarakTableData<TData>(props.data, props.load, props.updatedAt, { searchQuery: props.searchQuery, onSearchQueryChange: props.onSearchQueryChange, displayedText });
    const columns = createSarakTableColumns(props.columns, props.mapping, tableData.data);
    const getSortValue = useCallback((row: TData, columnId: string): unknown => {
        const column = valueColumns.find((candidate) => candidate.id === columnId);
        return column ? columnSortValue(row, column) : row[columnId];
    }, [valueColumns]);
    const interactions = useTableInteractions({ rows: tableData.filteredData, getRowKey: props.getRowKey, sort: props.sort, onSortChange: props.onSortChange, selectedKeys: props.selectedKeys, onSelectionChange: props.onSelectionChange, totalCount: props.totalCount, selectAll: props.selectAll, onSelectAllChange: props.onSelectAllChange, getSortValue });
    const displayRows = useTableDisplayRows({ entries: interactions.entries, groupBy: props.groupBy, hasDetail: Boolean(props.renderExpanded), getRowKey: props.getRowKey, expandedKeys: props.expandedKeys, onExpandedChange: props.onExpandedChange });
    return createSarakTableViewProps({ props, locale, valueColumns, displayRows, tableData, layout, columns, interactions });
};
