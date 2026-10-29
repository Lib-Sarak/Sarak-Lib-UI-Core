import type { CSSProperties, ReactElement, KeyboardEvent, MouseEvent } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import type { SarakColumn } from './columnModel';
import { sarakWidthOf, SELECTION_COLUMN_WIDTH } from './columnModel';
import { resolveRowCells } from './columnSpan';
import { columnText } from './columnValue';
import { dataCellStyle, EXPANDER_WIDTH, SPECIAL_ROW_BORDER, TREE_INDENT } from './dataTableCell';
import type { SarakDataTableRowsProps, SarakDataTableVirtualRow } from './SarakDataTableRows';
import { SarakExpandToggle } from './SarakTableControls';

interface SarakDataTableRowProps<T> {
    row: SarakDataTableVirtualRow<T>;
    props: SarakDataTableRowsProps<T>;
}

interface SarakDataTableCellProps<T> {
    column: SarakColumn<T>;
    width: number;
    row: SarakDataTableVirtualRow<T>;
    props: SarakDataTableRowsProps<T>;
}

/** Fundo da linha alternada: a cor do texto a 4% sobre o que há atrás, legível nos dois modos. */
const ZEBRA_BACKGROUND = 'color-mix(in srgb, currentColor 4%, transparent)';

const isInteractiveTarget = (target: EventTarget): boolean =>
    target instanceof Element && Boolean(target.closest('button,input,a,select,textarea,[role="button"],[role="checkbox"]'));

const handleRowClick = <T,>(event: MouseEvent<HTMLDivElement>, row: T, onRowClick?: (row: T) => void): void => {
    if (!isInteractiveTarget(event.target)) onRowClick?.(row);
};

const handleRowKeyDown = <T,>(event: KeyboardEvent<HTMLDivElement>, row: T, onRowClick?: (row: T) => void): void => {
    if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    onRowClick?.(row);
};

const SarakDataTableCell = <T,>({ column, width, row, props }: SarakDataTableCellProps<T>): ReactElement => {
    const text = useLibraryText();
    const display = row.display?.kind === 'data' ? row.display : null;
    const isTreeCell = Boolean(display) && props.treeColumnId === column.id;
    const content = column.render ? column.render(row.entry.row, row.entry.index) : columnText(row.entry.row, column, props.locale);
    const toggle = isTreeCell && display?.expandable
        ? <SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseRow' : 'tableExpandRow')} onToggle={() => props.onToggleExpand?.(row.entry.key)} />
        : null;
    return (
        <div role={column.rowHeader ? 'rowheader' : 'cell'} data-column-id={column.id} style={dataCellStyle(column, width, props)}>
            {isTreeCell && display && <span aria-hidden="true" data-tree-depth={display.depth} style={{ display: 'inline-block', width: `calc(${TREE_INDENT} * ${display.depth})`, flex: '0 0 auto' }} />}
            {isTreeCell && <span style={{ display: 'inline-flex', width: 'var(--sarak-layout-gap-md, 16px)', flex: '0 0 auto' }}>{toggle}</span>}
            {content}
        </div>
    );
};

const ExpanderCell = <T,>({ row, props }: Pick<SarakDataTableCellProps<T>, 'row' | 'props'>): ReactElement => {
    const text = useLibraryText();
    const display = row.display?.kind === 'data' ? row.display : null;
    return (
        <div role="cell" style={{ width: EXPANDER_WIDTH, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {display && (
                <SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseRow' : 'tableExpandRow')} onToggle={() => props.onToggleExpand?.(row.entry.key)} />
            )}
        </div>
    );
};

export function SarakDataTableRow<T>({ row, props }: SarakDataTableRowProps<T>): ReactElement {
    const text = useLibraryText();
    const { entry, virtualIndex, virtualKey, start, size } = row;
    const selectionWidth = props.selectable ? SELECTION_COLUMN_WIDTH : 0;
    const style: CSSProperties = {
        position: 'absolute', top: props.headerHeight + start, left: 0, display: 'flex', width: props.containerWidth,
        height: props.automaticHeight ? undefined : size,
        borderBottom: SPECIAL_ROW_BORDER,
        ...(props.zebra && virtualIndex % 2 === 1 ? { backgroundColor: ZEBRA_BACKGROUND } : null),
    };
    const cells = resolveRowCells(props.columns, entry.row, (column) => sarakWidthOf(column, props.widths));
    return (
        <div key={entry.key ?? virtualKey} role="row" data-index={virtualIndex} ref={props.automaticHeight ? props.measureElement : undefined} tabIndex={props.onRowClick ? 0 : undefined} onClick={(event) => handleRowClick(event, entry.row, props.onRowClick)} onKeyDown={(event) => handleRowKeyDown(event, entry.row, props.onRowClick)} style={style}>
            {props.selectable && <div role="cell" aria-label={text('tableSelectionColumn')} style={{ width: selectionWidth, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SarakCheckbox aria-label={text('selectRow', { row: String(entry.key) })} checked={props.selectedKeys.has(entry.key)} onChange={(event) => props.onToggleRow(entry.key, event.currentTarget.checked)} /></div>}
            {props.hasExpander && <ExpanderCell row={row} props={props} />}
            {cells.map(({ column, width }) => <SarakDataTableCell key={column.id} column={column} width={width} row={row} props={props} />)}
        </div>
    );
}
