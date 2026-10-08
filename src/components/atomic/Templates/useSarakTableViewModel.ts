import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
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
    containerClassName: string;
    containerStyle: ReturnType<ReturnType<typeof useStructuralStyles>['getContainerStyles']>['style'];
    headerClassName: string;
    headerStyle: ReturnType<ReturnType<typeof useStructuralStyles>['getHeaderStyles']>['style'];
}

interface SarakTableColumns<TData> {
    columnKeys: string[];
    columnLabels: Record<string, string>;
    columns: SarakTableColumn<TData>[];
}

interface SarakTableViewModelInput<TData extends Record<string, unknown>> {
    props: SarakTableProps<TData>;
    tableData: ReturnType<typeof useSarakTableData<TData>>;
    layout: SarakTableLayout;
    columns: SarakTableColumns<TData>;
    interactions: TableInteractionsResult<TData>;
}

const useSarakTableLayout = (responsive: boolean): SarakTableLayout => {
    const { design } = useSarakUI();
    const device = useSarakDevice();
    const { cellDensityClass } = useTableLayoutStyles(design);
    const { getContainerStyles, getHeaderStyles } = useStructuralStyles();
    const container = getContainerStyles();
    const header = getHeaderStyles();
    return { collapseToCards: responsive && device === 'smartphone', cellDensityClass, containerClassName: container.className, containerStyle: container.style, headerClassName: header.className, headerStyle: header.style };
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

const createSarakTableViewProps = <TData extends Record<string, unknown>>({ props, tableData, layout, columns, interactions }: SarakTableViewModelInput<TData>): SarakTableViewProps<TData> => {
    const canRefresh = (props.showRefresh ?? true) && props.data === undefined && Boolean(props.load);
    const loading = props.loading ?? tableData.loading;
    const error = props.error === undefined ? tableData.error : props.error;
    return {
        filteredData: tableData.filteredData, interactions, columns: columns.columns, columnKeys: columns.columnKeys, columnLabels: columns.columnLabels,
        label: props.label, role: props.role ?? 'neutral', density: props.density ?? 'standard', loading, error,
        collapseToCards: layout.collapseToCards, canRefresh, showSearch: props.showSearch ?? true, selectable: props.selectable ?? false,
        search: tableData.search, onSearchChange: tableData.setSearch, onRefresh: () => void tableData.loadData(),
        onRetry: props.onRetry ?? (canRefresh ? () => void tableData.loadData() : undefined), onRowClick: props.onRowClick,
        emptyMessage: props.emptyMessage, cellDensityClass: layout.cellDensityClass, containerClassName: layout.containerClassName,
        containerStyle: layout.containerStyle, headerClassName: layout.headerClassName, headerStyle: layout.headerStyle,
    };
};

export const useSarakTableViewModel = <TData extends Record<string, unknown>>(
    props: SarakTableProps<TData>,
): SarakTableViewProps<TData> => {
    const layout = useSarakTableLayout(props.responsive ?? true);
    const tableData = useSarakTableData<TData>(props.data, props.load);
    const columns = createSarakTableColumns(props.columns, props.mapping, tableData.data);
    const interactions = useTableInteractions({ rows: tableData.filteredData, getRowKey: props.getRowKey, sort: props.sort, onSortChange: props.onSortChange, selectedKeys: props.selectedKeys, onSelectionChange: props.onSelectionChange, getSortValue: (row, columnId) => row[columnId] });
    return createSarakTableViewProps({ props, tableData, layout, columns, interactions });
};
