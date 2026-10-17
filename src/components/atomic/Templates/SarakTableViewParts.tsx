import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { CSSProperties, ReactElement, KeyboardEvent, MouseEvent, Ref } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakIcon } from '../Icon/SarakIcon';
import { useMotionTokens } from '../hooks/useMotionTokens';
import { SarakInput } from '../Inputs';
import { SarakIconButton } from '../Buttons';
import { SarakTableSortButton } from '../DataDisplay/SarakDataTable/SarakTableSortButton';
import type { TableInteractionsResult } from '../DataDisplay/SarakDataTable/useTableInteractions';
import { SarakTableCards, SarakTableSelectionCheckbox } from './SarakTableCards';
import type { SarakTableColumn } from './SarakTableProps';

const ROW_ENTRY_OFFSET = 10;

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
}

type SarakTableToolbarProps<TData extends Record<string, unknown>> = Pick<
    SarakTableViewProps<TData>,
    'label' | 'role' | 'density' | 'filteredData' | 'loading' | 'showSearch' | 'canRefresh' | 'search' | 'onSearchChange' | 'onRefresh'
> & {
    headerClassName: string;
    headerStyle?: CSSProperties;
};

const TableHeading = <TData extends Record<string, unknown>>({ label, role, density, filteredData }: SarakTableToolbarProps<TData>): ReactElement => {
    const text = useLibraryText();
    const headingClass = ['font-black', 'text-theme-title', 'tracking-tight', density === 'spacious' ? 'text-2xl' : 'text-xl'].join(' ');
    return (
        <div>
            {label && <h3 className={headingClass} style={{ fontWeight: 'var(--sarak-h1-weight,900)', color: role === 'primary' ? 'var(--sarak-primary-color,#00f2ff)' : 'var(--color-theme-title,currentColor)' }}>{label}</h3>}
            <p className="text-theme-muted text-xs">{text('tableRowsFound', { count: filteredData.length })}</p>
        </div>
    );
};

const TableControls = <TData extends Record<string, unknown>>({ loading, showSearch, canRefresh, search, onSearchChange, onRefresh }: SarakTableToolbarProps<TData>): ReactElement => {
    const text = useLibraryText();
    return (
        <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
            {showSearch && <div className="w-full md:w-64"><SarakInput type="text" placeholder={text('searchPlaceholder')} value={search} onChange={(event) => onSearchChange(event.target.value)} leftIcon={<SarakIcon name="Search" size={16} />} /></div>}
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

interface SarakTableGridHeaderProps<TData extends Record<string, unknown>> {
    columns: SarakTableColumn<TData>[];
    interactions: TableInteractionsResult<TData>;
    selectable: boolean;
    cellDensityClass: string;
}

const SarakTableGridHeader = <TData extends Record<string, unknown>>({ columns, interactions, selectable, cellDensityClass }: SarakTableGridHeaderProps<TData>): ReactElement => {
    const text = useLibraryText();
    return (
        <thead><tr className="bg-[var(--sarak-table-header-bg,rgba(255,255,255,0.03))] border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
            {selectable && <th className={cellDensityClass}><SarakTableSelectionCheckbox label={text('selectAllVisibleRows')} checked={interactions.allVisibleSelected} indeterminate={interactions.partiallySelected} onChange={interactions.toggleAll} /></th>}
            {columns.map((column) => <th key={column.key} className={'text-2xs font-black text-theme-muted uppercase ' + cellDensityClass} style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)', textAlign: column.align ?? 'left' }}><SarakTableSortButton columnId={column.key} label={column.label} sort={interactions.sort} onSort={interactions.changeSort} /></th>)}
        </tr></thead>
    );
};

interface SarakTableGridRowProps<TData extends Record<string, unknown>> {
    row: TData;
    rowKey: React.Key;
    index: number;
    columns: SarakTableColumn<TData>[];
    density: SarakTableViewProps<TData>['density'];
    interactions: TableInteractionsResult<TData>;
    selectable: boolean;
    cellDensityClass: string;
    zebra: boolean;
    onRowClick?: (row: TData) => void;
}

const isInteractiveTarget = (target: EventTarget): boolean =>
    target instanceof Element && Boolean(target.closest('button,input,a,select,textarea,[role="button"],[role="checkbox"]'));

const handleTableRowClick = <TData,>(event: MouseEvent<HTMLTableRowElement>, row: TData, onRowClick?: (row: TData) => void): void => {
    if (!isInteractiveTarget(event.target)) onRowClick?.(row);
};

const handleTableRowKeyDown = <TData,>(event: KeyboardEvent<HTMLTableRowElement>, row: TData, onRowClick?: (row: TData) => void): void => {
    if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    onRowClick?.(row);
};

/**
 * A linha recebe a `ref` do `AnimatePresence mode="popLayout"` (que a mede ao sair) e a repassa ao
 * `motion.tr`; sem o `forwardRef` o React avisa "Function components cannot be given refs".
 */
const SarakTableGridRowBase = <TData extends Record<string, unknown>>({ row, rowKey, index, columns, density, interactions, selectable, cellDensityClass, zebra, onRowClick }: SarakTableGridRowProps<TData>, ref: Ref<HTMLTableRowElement>): ReactElement => {
    const text = useLibraryText();
    const { staggerDelay } = useMotionTokens();
    return (
        <motion.tr ref={ref} key={rowKey} initial={{ opacity: 0, y: ROW_ENTRY_OFFSET }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * staggerDelay }} className={['border-b border-[var(--sarak-table-border,rgba(255,255,255,0.05))] hover:bg-[var(--sarak-table-row-hover,rgba(255,255,255,0.02))] transition-colors group', zebra && index % 2 === 1 ? ZEBRA_ROW_CLASS : ''].join(' ')} tabIndex={onRowClick ? 0 : undefined} onClick={(event) => handleTableRowClick(event, row, onRowClick)} onKeyDown={(event) => handleTableRowKeyDown(event, row, onRowClick)}>
            {selectable && <td className={cellDensityClass}><SarakTableSelectionCheckbox label={text('selectRow', { row: String(rowKey) })} checked={interactions.selectedKeys.has(rowKey)} onChange={(checked) => interactions.toggleRow(rowKey, checked)} /></td>}
            {columns.map((column) => <td key={column.key} className={['font-medium', 'text-theme-text', density === 'compact' ? 'text-xs' : 'text-sm', cellDensityClass].join(' ')} style={{ textAlign: column.align ?? 'left' }}>{column.render ? column.render(row) : String(row[column.key] ?? '')}</td>)}
        </motion.tr>
    );
};

const SarakTableGridRow = forwardRef(SarakTableGridRowBase) as <TData extends Record<string, unknown>>(
    props: SarakTableGridRowProps<TData> & { ref?: Ref<HTMLTableRowElement> },
) => ReactElement;

/** Fundo da linha par: a cor do texto a 4% sobre o que há atrás, legível nos dois modos. */
const ZEBRA_ROW_CLASS = 'bg-[color-mix(in_srgb,currentColor_4%,transparent)]';

const SKELETON_ROW_COUNT = 5;

const createSkeletonRows = (columnKeys: string[], selectable: boolean, cellDensityClass: string): ReactElement[] =>
    Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
        <tr key={'skeleton-' + rowIndex} className="animate-pulse">
            {selectable && <td className={cellDensityClass} />}
            {columnKeys.map((column) => <td key={'skeleton-' + column} className={cellDensityClass}><div className="h-4 bg-[var(--sarak-table-header-bg,rgba(255,255,255,0.03))] rounded-[var(--sarak-skeleton-row-radius,4px)] w-3/4" /></td>)}
        </tr>
    ));

interface SarakTableGridBodyProps<TData extends Record<string, unknown>> {
    props: SarakTableViewProps<TData>;
}

const SarakTableGridBody = <TData extends Record<string, unknown>>({ props }: SarakTableGridBodyProps<TData>): ReactElement => (
    <tbody>
        <AnimatePresence mode="popLayout">
            {props.loading
                ? createSkeletonRows(props.columnKeys, props.selectable, props.cellDensityClass)
                : props.interactions.entries.map(({ row, key }, index) => <SarakTableGridRow key={key} row={row} rowKey={key} index={index} columns={props.columns} density={props.density} interactions={props.interactions} selectable={props.selectable} cellDensityClass={props.cellDensityClass} zebra={props.zebraStriping === true} onRowClick={props.onRowClick} />)}
        </AnimatePresence>
    </tbody>
);

export const SarakTableGrid = <TData extends Record<string, unknown>>({ props }: SarakTableGridBodyProps<TData>): ReactElement => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <SarakTableGridHeader columns={props.columns} interactions={props.interactions} selectable={props.selectable} cellDensityClass={props.cellDensityClass} />
            <SarakTableGridBody props={props} />
        </table>
    </div>
);
