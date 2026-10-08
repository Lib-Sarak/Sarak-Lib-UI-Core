import type { CSSProperties, ReactElement, KeyboardEvent, MouseEvent } from 'react';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import type { SarakColumn } from './columnModel';
import { pinnedStyle, sarakWidthOf, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakDataTableRowsProps, SarakDataTableVirtualRow } from './SarakDataTableRows';

interface SarakDataTableRowProps<T> {
    row: SarakDataTableVirtualRow<T>;
    props: SarakDataTableRowsProps<T>;
}

interface SarakDataTableCellProps<T> {
    column: SarakColumn<T>;
    row: SarakDataTableVirtualRow<T>;
    props: SarakDataTableRowsProps<T>;
    selectionWidth: number;
}

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

const SarakDataTableCell = <T,>({ column, row, props, selectionWidth }: SarakDataTableCellProps<T>): ReactElement => {
    const style: CSSProperties = {
        width: sarakWidthOf(column, props.widths),
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start',
        textAlign: column.align ?? 'left',
        padding: '0 var(--sarak-table-padding, 12px)',
        overflow: props.automaticHeight ? 'visible' : 'hidden',
        textOverflow: props.automaticHeight ? undefined : 'ellipsis',
        whiteSpace: props.automaticHeight ? 'normal' : 'nowrap',
        color: 'var(--sarak-text-main,#ffffff)',
        ...pinnedStyle(column, props.offsets, props.cellBackground, selectionWidth),
    };
    const value = column.render
        ? column.render(row.entry.row, row.entry.index)
        : String((row.entry.row as Record<string, unknown>)[column.id] ?? '');
    return <div role="cell" data-column-id={column.id} style={style}>{value}</div>;
};

export function SarakDataTableRow<T>({ row, props }: SarakDataTableRowProps<T>): ReactElement {
    const { entry, virtualIndex, virtualKey, start, size } = row;
    const selectionWidth = props.selectable ? SELECTION_COLUMN_WIDTH : 0;
    const style: CSSProperties = {
        position: 'absolute', top: props.headerHeight + start, left: 0, display: 'flex', width: props.containerWidth,
        height: props.automaticHeight ? undefined : size,
        borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,#334155))',
    };
    return (
        <div key={entry.key ?? virtualKey} role="row" data-index={virtualIndex} ref={props.automaticHeight ? props.measureElement : undefined} tabIndex={props.onRowClick ? 0 : undefined} onClick={(event) => handleRowClick(event, entry.row, props.onRowClick)} onKeyDown={(event) => handleRowKeyDown(event, entry.row, props.onRowClick)} style={style}>
            {props.selectable && <div role="cell" aria-label="Seleção" style={{ width: selectionWidth, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SarakCheckbox aria-label={`Selecionar linha ${String(entry.key)}`} checked={props.selectedKeys.has(entry.key)} onChange={(event) => props.onToggleRow(entry.key, event.currentTarget.checked)} /></div>}
            {props.columns.map((column) => <SarakDataTableCell key={column.id} column={column} row={row} props={props} selectionWidth={selectionWidth} />)}
        </div>
    );
}
