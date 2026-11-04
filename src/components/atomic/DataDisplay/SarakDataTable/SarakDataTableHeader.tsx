import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactElement, PointerEvent as ReactPointerEvent } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { SarakTableSortButton } from './SarakTableSortButton';
import { pinnedStyle, sarakWidthOf, SELECTION_COLUMN_WIDTH } from './columnModel';
import { columnAlign } from './columnValue';
import { EXPANDER_WIDTH, flowCellWidth, leadingWidthOf } from './dataTableCell';
import type { SarakPinnedOffsets, SarakColumn, SarakTableSort } from './columnModel';

const RESIZE_HANDLE_WIDTH = 6;
const HEADER_FONT_WEIGHT = 600;
const HEADER_STICKY_LAYER = 3;

export interface SarakDataTableHeaderProps<T> {
    columns: SarakColumn<T>[];
    widths: Record<string, number>;
    offsets: SarakPinnedOffsets;
    background: string;
    headerHeight: number;
    dragId: string | null;
    sort: SarakTableSort | null;
    selectable: boolean;
    /** Há a coluna do botão de expandir. */
    hasExpander?: boolean;
    /** Cabeçalhos arrastáveis; padrão `true`. */
    reorderable?: boolean;
    allVisibleSelected: boolean;
    partiallySelected: boolean;
    onDragStart: (columnId: string) => void;
    onDrop: (columnId: string) => void;
    onSort: (columnId: string) => void;
    onToggleAll: (checked: boolean) => void;
    onResizeStart: (event: ReactPointerEvent, column: SarakColumn<T>) => void;
    /** Com ela, a alça entra na ordem do Tab e responde às setas. */
    onResizeKey?: (event: ReactKeyboardEvent, column: SarakColumn<T>) => void;
    /** Cabeçalho no fluxo do documento: sem fixar, sem arrastar e sem alça. */
    flow?: boolean;
}

interface SarakDataTableHeaderCellProps<T> {
    column: SarakColumn<T>;
    props: SarakDataTableHeaderProps<T>;
    leadingWidth: number;
}

const SarakDataTableResizeHandle = <T,>({ column, onResizeStart, onResizeKey, widths }: Pick<SarakDataTableHeaderCellProps<T>, 'column'> & Pick<SarakDataTableHeaderProps<T>, 'onResizeStart' | 'onResizeKey' | 'widths'>): ReactElement => {
    const text = useLibraryText();
    const keyboard = onResizeKey ? { tabIndex: 0, 'aria-valuenow': sarakWidthOf(column, widths), onKeyDown: (event: ReactKeyboardEvent) => onResizeKey(event, column) } : null;
    return (
    <span role="separator" {...keyboard} aria-orientation="vertical" aria-label={text('tableResizeColumn', { column: column.id })} data-resize-handle={column.id} onPointerDown={(event) => onResizeStart(event, column)} onDragStart={(event) => event.preventDefault()} style={{ width: RESIZE_HANDLE_WIDTH, cursor: 'col-resize', alignSelf: 'stretch', flex: '0 0 auto' }} />
    );
};

const SarakDataTableHeaderLabel = <T,>({ column, props }: SarakDataTableHeaderCellProps<T>): ReactElement => {
    const align = columnAlign(column);
    const alignment = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
    if (column.sortable) {
        return <div style={{ width: '100%', display: 'flex', justifyContent: alignment }}><SarakTableSortButton columnId={column.id} label={column.header} sort={props.sort} onSort={props.onSort} /></div>;
    }
    return <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: align }}>{column.header}</span>;
};

const SarakDataTableHeaderCell = <T,>({ column, props, leadingWidth }: SarakDataTableHeaderCellProps<T>): ReactElement => {
    const reorderable = (props.reorderable ?? true) && !props.flow;
    const align = columnAlign(column);
    const width = sarakWidthOf(column, props.widths);
    const style: CSSProperties = {
        ...(props.flow ? flowCellWidth(width) : { width, flex: '0 0 auto' }), display: 'flex', alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        padding: '0 var(--sarak-table-padding, 12px)', fontWeight: HEADER_FONT_WEIGHT, color: 'var(--color-theme-title,#f2f6fb)',
        cursor: reorderable ? 'grab' : undefined, userSelect: 'none', opacity: props.dragId === column.id ? 0.5 : 1,
        ...(props.flow ? null : pinnedStyle(column, props.offsets, props.background, leadingWidth)),
    };
    return (
        <div role="columnheader" draggable={reorderable} onDragStart={() => props.onDragStart(column.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => props.onDrop(column.id)} data-column-id={column.id} data-pinned={column.pinned ?? undefined} style={style}>
            <SarakDataTableHeaderLabel column={column} props={props} leadingWidth={leadingWidth} />
            {!props.flow && <SarakDataTableResizeHandle column={column} widths={props.widths} onResizeStart={props.onResizeStart} onResizeKey={props.onResizeKey} />}
        </div>
    );
};

export function SarakDataTableHeader<T>(props: SarakDataTableHeaderProps<T>): ReactElement {
    const text = useLibraryText();
    const selectionWidth = props.selectable ? SELECTION_COLUMN_WIDTH : 0;
    const leadingWidth = leadingWidthOf(props);
    return (
        <div role="row" style={{ position: props.flow ? undefined : 'sticky', top: props.flow ? undefined : 0, zIndex: props.flow ? undefined : HEADER_STICKY_LAYER, display: 'flex', height: props.headerHeight, background: props.background, borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,rgba(255,255,255,0.09)))' }}>
            {props.selectable && <div role="columnheader" aria-label={text('tableSelectionColumn')} style={{ width: selectionWidth, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SarakCheckbox aria-label={text('selectAllVisibleRows')} checked={props.allVisibleSelected} indeterminate={props.partiallySelected} onChange={(event) => props.onToggleAll(event.currentTarget.checked)} /></div>}
            {props.hasExpander && <div role="columnheader" aria-hidden="true" style={{ width: EXPANDER_WIDTH, flex: '0 0 auto' }} />}
            {props.columns.map((column) => <SarakDataTableHeaderCell key={column.id} column={column} props={props} leadingWidth={leadingWidth} />)}
        </div>
    );
}
