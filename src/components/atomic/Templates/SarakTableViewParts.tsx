import type { CSSProperties, Key, ReactElement, ReactNode } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakInput } from '../Inputs';
import { SarakIconButton } from '../Buttons';
import type { SarakValueColumn } from '../DataDisplay/SarakDataTable/columnValue';
import type { SarakDisplayRow } from '../DataDisplay/SarakDataTable/tableDisplayRows';
import type { TableInteractionsResult } from '../DataDisplay/SarakDataTable/useTableInteractions';
import type { SarakTableColumn } from './SarakTableProps';

export interface SarakTableViewProps<TData extends Record<string, unknown>> {
    filteredData: TData[];
    interactions: TableInteractionsResult<TData>;
    columns: SarakTableColumn<TData>[];
    columnKeys: string[];
    columnLabels: Record<string, string>;
    label?: string;
    role: 'primary' | 'secondary' | 'neutral' | 'accent';
    density: 'compact' | 'standard' | 'spacious';
    loading: boolean;
    error: string | null;
    hasData?: boolean;
    updatedAt?: Date | null;
    collapseToCards: boolean;
    canRefresh: boolean;
    showSearch: boolean;
    selectable: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onRetry?: () => void;
    onRowClick?: (row: TData) => void;
    emptyMessage?: string;
    cellDensityClass: string;
    /** Alterna o fundo das linhas pares (`tableZebraStriping`); omitido, sem listras. */
    zebraStriping?: boolean;
    containerClassName: string;
    containerStyle?: CSSProperties;
    /** Linhas visuais (grupo, subtotal, detalhe); ausente = uma linha de dado por entrada. */
    displayRows?: Array<SarakDisplayRow<TData>>;
    toggleRow?: (key: Key) => void;
    toggleGroup?: (groupId: string) => void;
    renderExpanded?: (row: TData) => ReactNode;
    /** Linhas sobre as quais o rodapé agrega; ausente = as linhas filtradas. */
    footerRows?: TData[];
    valueColumns?: Array<SarakValueColumn<TData>>;
    locale?: string;
    /** Mostra o botão de exportar CSV na barra. */
    exportable?: boolean;
    onExport?: () => void;
}

type SarakTableToolbarProps<TData extends Record<string, unknown>> = Pick<
    SarakTableViewProps<TData>,
    'label' | 'role' | 'density' | 'filteredData' | 'loading' | 'showSearch' | 'canRefresh' | 'search' | 'onSearchChange' | 'onRefresh' | 'exportable' | 'onExport'
> & {
    headerClassName: string;
    headerStyle?: CSSProperties;
};

const TableHeading = <TData extends Record<string, unknown>>({ label, role, density, filteredData }: SarakTableToolbarProps<TData>): ReactElement => {
    const text = useLibraryText();
    const headingClass = ['font-black', 'text-theme-title', 'tracking-tight', density === 'spacious' ? 'text-2xl' : 'text-xl'].join(' ');
    return (
        <div>
            {label && <h3 className={headingClass} style={{ fontWeight: 'var(--sarak-h1-weight,800)', color: role === 'primary' ? 'var(--sarak-primary-color,#19e3f0)' : 'var(--color-theme-title,currentColor)' }}>{label}</h3>}
            <p className="text-theme-muted text-xs">{text('tableRowsFound', { count: filteredData.length })}</p>
        </div>
    );
};

const TableControls = <TData extends Record<string, unknown>>({ loading, showSearch, canRefresh, search, onSearchChange, onRefresh, exportable, onExport }: SarakTableToolbarProps<TData>): ReactElement => {
    const text = useLibraryText();
    return (
        <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
            {showSearch && <div className="w-full md:w-64"><SarakInput type="text" placeholder={text('searchPlaceholder')} value={search} onChange={(event) => onSearchChange(event.target.value)} leftIcon={<SarakIcon name="Search" size={16} />} /></div>}
            {exportable && <SarakIconButton icon={<SarakIcon name="Download" size={16} />} onClick={onExport} variant="secondary" aria-label={text('tableExportCsv')} />}
            {canRefresh && <SarakIconButton icon={<SarakIcon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />} onClick={onRefresh} variant="secondary" aria-label={text('retry')} />}
        </div>
    );
};

export const SarakTableToolbar = <TData extends Record<string, unknown>>(
    props: SarakTableToolbarProps<TData>,
): ReactElement => {
    return (
        <div className={props.headerClassName} style={props.headerStyle}>
            <TableHeading {...props} />
            <TableControls {...props} />
        </div>
    );
};

export { SarakTableGrid } from './SarakTableGrid';
