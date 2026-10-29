import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useMemo } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactElement, ReactNode, Ref } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { resolveRowCells } from '../DataDisplay/SarakDataTable/columnSpan';
import { columnAlign, columnText, footerContent, hasFooter, isNumericFormat, toValueColumn } from '../DataDisplay/SarakDataTable/columnValue';
import type { SarakValueColumn } from '../DataDisplay/SarakDataTable/columnValue';
import { SarakExpandToggle } from '../DataDisplay/SarakDataTable/SarakTableControls';
import { SarakTableSortButton } from '../DataDisplay/SarakDataTable/SarakTableSortButton';
import type { SarakDisplayRow } from '../DataDisplay/SarakDataTable/tableDisplayRows';
import { useMotionTokens } from '../hooks/useMotionTokens';
import { SarakTableSelectionCheckbox } from './SarakTableCards';
import type { SarakTableColumn } from './SarakTableProps';
import type { SarakTableViewProps } from './SarakTableViewParts';

const ROW_ENTRY_OFFSET = 10;
const SKELETON_ROW_COUNT = 5;
/** Fundo da linha par: a cor do texto a 4% sobre o que há atrás, legível nos dois modos. */
const ZEBRA_ROW_CLASS = 'bg-[color-mix(in_srgb,currentColor_4%,transparent)]';

type GridColumn<TData> = SarakTableColumn<TData> & SarakValueColumn<TData>;

/** As linhas visuais da tabela; sem `displayRows`, uma linha de dado simples por entrada (rc.3). */
export const tableDisplayRowsOf = <TData extends Record<string, unknown>>(props: Pick<SarakTableViewProps<TData>, 'displayRows' | 'interactions'>): Array<SarakDisplayRow<TData>> =>
    props.displayRows ?? props.interactions.entries.map((entry) => ({ kind: 'data', id: `row:${String(entry.key)}`, entry, depth: 0, expandable: false, expanded: false, hasChildren: false }));

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

const cellStyle = <TData,>(column: GridColumn<TData>): CSSProperties => ({
    textAlign: columnAlign(column),
    fontVariantNumeric: isNumericFormat(column.format) ? 'tabular-nums' : undefined,
});

interface GridProps<TData extends Record<string, unknown>> {
    props: SarakTableViewProps<TData>;
}

const useGridColumns = <TData extends Record<string, unknown>>(columns: SarakTableColumn<TData>[]): Array<GridColumn<TData>> =>
    useMemo(() => columns.map((column) => ({ ...column, ...toValueColumn<TData>(column) })), [columns]);

const leadingCells = <TData extends Record<string, unknown>>(props: SarakTableViewProps<TData>, as: 'td' | 'th'): ReactNode => {
    const Cell = as;
    return (
        <>
            {props.selectable && <Cell className={props.cellDensityClass} aria-hidden="true" />}
            {props.renderExpanded && <Cell className={props.cellDensityClass} aria-hidden="true" />}
        </>
    );
};

const SarakTableGridHeader = <TData extends Record<string, unknown>>({ props, columns }: GridProps<TData> & { columns: Array<GridColumn<TData>> }): ReactElement => {
    const text = useLibraryText();
    const { interactions, cellDensityClass, selectable } = props;
    return (
        <thead><tr className="bg-[var(--sarak-table-header-bg,rgba(255,255,255,0.03))] border-b border-[var(--border-color,rgba(255,255,255,0.09))]">
            {selectable && <th className={cellDensityClass}><SarakTableSelectionCheckbox label={text('selectAllVisibleRows')} checked={interactions.allVisibleSelected} indeterminate={interactions.partiallySelected} onChange={interactions.toggleAll} /></th>}
            {props.renderExpanded && <th className={cellDensityClass} aria-hidden="true" />}
            {columns.map((column) => <th key={column.key} scope="col" className={'text-2xs font-black text-theme-muted uppercase ' + cellDensityClass} style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)', textAlign: columnAlign(column) }}>{column.sortable === false ? column.label : <SarakTableSortButton columnId={column.key} label={column.label} sort={interactions.sort} onSort={interactions.changeSort} />}</th>)}
        </tr></thead>
    );
};

interface DataRowProps<TData extends Record<string, unknown>> extends GridProps<TData> {
    display: Extract<SarakDisplayRow<TData>, { kind: 'data' }>;
    index: number;
    columns: Array<GridColumn<TData>>;
}

/**
 * A linha recebe a `ref` do `AnimatePresence mode="popLayout"` (que a mede ao sair) e a repassa ao
 * `motion.tr`; sem o `forwardRef` o React avisa "Function components cannot be given refs".
 */
const SarakTableGridRowBase = <TData extends Record<string, unknown>>({ props, display, index, columns }: DataRowProps<TData>, ref: Ref<HTMLTableRowElement>): ReactElement => {
    const text = useLibraryText();
    const { staggerDelay } = useMotionTokens();
    const { row, key } = display.entry;
    const cells = resolveRowCells(columns.map((column) => ({ ...column, id: column.key })), row, () => 1);
    const zebra = props.zebraStriping === true && index % 2 === 1;
    return (
        <motion.tr ref={ref} key={key} initial={{ opacity: 0, y: ROW_ENTRY_OFFSET }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * staggerDelay }} className={['border-b border-[var(--sarak-table-border,rgba(255,255,255,0.05))] hover:bg-[var(--sarak-table-row-hover,rgba(255,255,255,0.02))] transition-colors group', zebra ? ZEBRA_ROW_CLASS : ''].join(' ')} tabIndex={props.onRowClick ? 0 : undefined} onClick={(event) => handleTableRowClick(event, row, props.onRowClick)} onKeyDown={(event) => handleTableRowKeyDown(event, row, props.onRowClick)}>
            {props.selectable && <td className={props.cellDensityClass}><SarakTableSelectionCheckbox label={text('selectRow', { row: String(key) })} checked={props.interactions.selectedKeys.has(key)} onChange={(checked) => props.interactions.toggleRow(key, checked)} /></td>}
            {props.renderExpanded && <td className={props.cellDensityClass}><SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseRow' : 'tableExpandRow')} onToggle={() => props.toggleRow?.(key)} /></td>}
            {cells.map(({ column, span }) => {
                const Cell = column.rowHeader ? 'th' : 'td';
                const source = columns.find((candidate) => candidate.key === column.id) as GridColumn<TData>;
                return <Cell key={column.id} {...(column.rowHeader ? { scope: 'row' } : null)} colSpan={span > 1 ? span : undefined} className={[column.rowHeader ? 'text-left' : '', 'font-medium', 'text-theme-text', props.density === 'compact' ? 'text-xs' : 'text-sm', props.cellDensityClass].join(' ')} style={cellStyle(source)}>{source.render ? source.render(row) : columnText(row, source, props.locale)}</Cell>;
            })}
        </motion.tr>
    );
};

const SarakTableGridRow = forwardRef(SarakTableGridRowBase) as <TData extends Record<string, unknown>>(
    props: DataRowProps<TData> & { ref?: Ref<HTMLTableRowElement> },
) => ReactElement;

const createSkeletonRows = (columnKeys: string[], selectable: boolean, cellDensityClass: string): ReactElement[] =>
    Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
        <tr key={'skeleton-' + rowIndex} className="animate-pulse">
            {selectable && <td className={cellDensityClass} />}
            {columnKeys.map((column) => <td key={'skeleton-' + column} className={cellDensityClass}><div className="h-4 bg-[var(--sarak-table-header-bg,rgba(255,255,255,0.03))] rounded-[var(--sarak-skeleton-row-radius,4px)] w-3/4" /></td>)}
        </tr>
    ));

const SarakTableGridBody = <TData extends Record<string, unknown>>({ props, columns }: GridProps<TData> & { columns: Array<GridColumn<TData>> }): ReactElement => {
    const text = useLibraryText();
    const displayRows = tableDisplayRowsOf(props);
    return (
        <tbody>
            <AnimatePresence mode="popLayout">
                {props.loading
                    ? createSkeletonRows(props.columnKeys, props.selectable, props.cellDensityClass)
                    : displayRows.map((display, index) => renderDisplayRow({ props, display, index, columns, text }))}
            </AnimatePresence>
        </tbody>
    );
};

interface DisplayRowArgs<TData extends Record<string, unknown>> extends GridProps<TData> {
    display: SarakDisplayRow<TData>;
    index: number;
    columns: Array<GridColumn<TData>>;
    text: LibraryTextFn;
}

/**
 * Devolve o elemento direto do `AnimatePresence mode="popLayout"`: o `popLayout` injeta `ref` em cada
 * filho, então ele tem de ser o `forwardRef` da linha ou um elemento DOM — nunca um componente comum.
 */
const renderDisplayRow = <TData extends Record<string, unknown>>({ props, display, index, columns, text }: DisplayRowArgs<TData>): ReactElement => {
    const width = columns.length + (props.selectable ? 1 : 0) + (props.renderExpanded ? 1 : 0);
    if (display.kind === 'data') return <SarakTableGridRow key={display.id} props={props} display={display} index={index} columns={columns} />;
    if (display.kind === 'detail') return <tr key={display.id}><td colSpan={width} className={props.cellDensityClass}>{props.renderExpanded?.(display.entry.row)}</td></tr>;
    if (display.kind === 'group') {
        const label: ReactNode = display.label ? display.label(display.groupKey, display.rows) : display.groupKey;
        return <tr key={display.id} data-sarak-group={display.groupKey} className="font-semibold"><td colSpan={width} className={props.cellDensityClass}><span className="inline-flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}><SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseGroup' : 'tableExpandGroup', { group: display.groupKey })} onToggle={() => props.toggleGroup?.(display.id)} />{label}</span></td></tr>;
    }
    return <tr key={display.id} data-sarak-subtotal={display.groupKey} className="font-semibold">{leadingCells(props, 'td')}<TotalsCells props={props} rows={display.rows} columns={columns} leading={text('tableSubtotal')} as="td" /></tr>;
};

interface TotalsCellsProps<TData extends Record<string, unknown>> extends GridProps<TData> {
    rows: TData[];
    columns: Array<GridColumn<TData>>;
    leading?: string;
    as: 'td' | 'th';
}

const TotalsCells = <TData extends Record<string, unknown>>({ props, rows, columns, leading, as: Cell }: TotalsCellsProps<TData>): ReactElement => (
    <>
        {columns.map((column, index) => (
            <Cell key={column.key} className={props.cellDensityClass} style={cellStyle(column)}>{footerContent(rows, column, props.locale) ?? (index === 0 ? leading : null)}</Cell>
        ))}
    </>
);

const SarakTableGridFooter = <TData extends Record<string, unknown>>({ props, columns }: GridProps<TData> & { columns: Array<GridColumn<TData>> }): ReactElement | null => {
    if (!hasFooter(columns) || props.loading) return null;
    return <tfoot><tr className="font-semibold border-t border-[var(--border-color,rgba(255,255,255,0.09))]">{leadingCells(props, 'td')}<TotalsCells props={props} rows={props.footerRows ?? props.filteredData} columns={columns} as="td" /></tr></tfoot>;
};

export const SarakTableGrid = <TData extends Record<string, unknown>>({ props }: GridProps<TData>): ReactElement => {
    const columns = useGridColumns(props.columns);
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-busy={props.loading ? true : undefined}>
                <SarakTableGridHeader props={props} columns={columns} />
                <SarakTableGridBody props={props} columns={columns} />
                <SarakTableGridFooter props={props} columns={columns} />
            </table>
        </div>
    );
};
