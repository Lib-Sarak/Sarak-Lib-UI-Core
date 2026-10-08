import type { CSSProperties, ReactElement, PointerEvent as ReactPointerEvent } from 'react';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { SarakTableSortButton } from './SarakTableSortButton';
import { pinnedStyle, sarakWidthOf, SELECTION_COLUMN_WIDTH } from './columnModel';
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
    allVisibleSelected: boolean;
    partiallySelected: boolean;
    onDragStart: (columnId: string) => void;
    onDrop: (columnId: string) => void;
    onSort: (columnId: string) => void;
    onToggleAll: (checked: boolean) => void;
    onResizeStart: (event: ReactPointerEvent, column: SarakColumn<T>) => void;
}

interface SarakDataTableHeaderCellProps<T> {
    column: SarakColumn<T>;
    props: SarakDataTableHeaderProps<T>;
    selectionWidth: number;
}

const SarakDataTableResizeHandle = <T,>({ column, onResizeStart }: Pick<SarakDataTableHeaderCellProps<T>, 'column'> & Pick<SarakDataTableHeaderProps<T>, 'onResizeStart'>): ReactElement => (
    <span role="separator" aria-orientation="vertical" aria-label={`Redimensionar coluna ${column.id}`} data-resize-handle={column.id} onPointerDown={(event) => onResizeStart(event, column)} onDragStart={(event) => event.preventDefault()} style={{ width: RESIZE_HANDLE_WIDTH, cursor: 'col-resize', alignSelf: 'stretch', flex: '0 0 auto' }} />
);

const SarakDataTableHeaderLabel = <T,>({ column, props }: SarakDataTableHeaderCellProps<T>): ReactElement => {
    const alignment = column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start';
    if (column.sortable) {
        return <div style={{ width: '100%', display: 'flex', justifyContent: alignment }}><SarakTableSortButton columnId={column.id} label={column.header} sort={props.sort} onSort={props.onSort} /></div>;
    }
    return <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: column.align ?? 'left' }}>{column.header}</span>;
};

const SarakDataTableHeaderCell = <T,>({ column, props, selectionWidth }: SarakDataTableHeaderCellProps<T>): ReactElement => {
    const style: CSSProperties = {
        width: sarakWidthOf(column, props.widths), flex: '0 0 auto', display: 'flex', alignItems: 'center',
        justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start',
        padding: '0 var(--sarak-table-padding, 12px)', fontWeight: HEADER_FONT_WEIGHT, color: 'var(--color-theme-title,#ffffff)',
        cursor: 'grab', userSelect: 'none', opacity: props.dragId === column.id ? 0.5 : 1,
        ...pinnedStyle(column, props.offsets, props.background, selectionWidth),
    };
    return (
        <div role="columnheader" draggable onDragStart={() => props.onDragStart(column.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => props.onDrop(column.id)} data-column-id={column.id} data-pinned={column.pinned ?? undefined} style={style}>
            <SarakDataTableHeaderLabel column={column} props={props} selectionWidth={selectionWidth} />
            <SarakDataTableResizeHandle column={column} onResizeStart={props.onResizeStart} />
        </div>
    );
};

export function SarakDataTableHeader<T>(props: SarakDataTableHeaderProps<T>): ReactElement {
    const selectionWidth = props.selectable ? SELECTION_COLUMN_WIDTH : 0;
    return (
        <div role="row" style={{ position: 'sticky', top: 0, zIndex: HEADER_STICKY_LAYER, display: 'flex', height: props.headerHeight, background: props.background, borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,#334155))' }}>
            {props.selectable && <div role="columnheader" aria-label="Seleção" style={{ width: selectionWidth, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SarakCheckbox aria-label="Selecionar todas as linhas visíveis" checked={props.allVisibleSelected} indeterminate={props.partiallySelected} onChange={(event) => props.onToggleAll(event.currentTarget.checked)} /></div>}
            {props.columns.map((column) => <SarakDataTableHeaderCell key={column.id} column={column} props={props} selectionWidth={selectionWidth} />)}
        </div>
    );
}
