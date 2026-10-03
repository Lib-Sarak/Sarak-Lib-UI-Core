import React from 'react';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { SarakTableSortButton } from './SarakTableSortButton';
import { pinnedStyle, sarakWidthOf, SELECTION_COLUMN_WIDTH, type SarakPinnedOffsets, type SarakColumn, type SarakTableSort } from './columnModel';
import type { PointerEvent as ReactPointerEvent } from 'react';

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

export function SarakDataTableHeader<T>({
    columns,
    widths,
    offsets,
    background,
    headerHeight,
    dragId,
    sort,
    selectable,
    allVisibleSelected,
    partiallySelected,
    onDragStart,
    onDrop,
    onSort,
    onToggleAll,
    onResizeStart,
}: SarakDataTableHeaderProps<T>) {
    const selectionWidth = selectable ? SELECTION_COLUMN_WIDTH : 0;

    return (
        <div
            role="row"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 3,
                display: 'flex',
                height: headerHeight,
                background,
                borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,#334155))',
            }}
        >
            {selectable && (
                <div role="columnheader" aria-label="Seleção" style={{ width: selectionWidth, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SarakCheckbox
                        aria-label="Selecionar todas as linhas visíveis"
                        checked={allVisibleSelected}
                        indeterminate={partiallySelected}
                        onChange={(event) => onToggleAll(event.currentTarget.checked)}
                    />
                </div>
            )}
            {columns.map((column) => (
                <div
                    key={column.id}
                    role="columnheader"
                    draggable
                    onDragStart={() => onDragStart(column.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(column.id)}
                    data-column-id={column.id}
                    data-pinned={column.pinned ?? undefined}
                    style={{
                        width: sarakWidthOf(column, widths),
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 var(--sarak-table-padding, 12px)',
                        fontWeight: 600,
                        color: 'var(--color-theme-title,#ffffff)',
                        cursor: 'grab',
                        userSelect: 'none',
                        opacity: dragId === column.id ? 0.5 : 1,
                        ...pinnedStyle(column, offsets, background, selectionWidth),
                    }}
                >
                    {column.sortable ? (
                        <SarakTableSortButton columnId={column.id} label={column.header} sort={sort} onSort={onSort} />
                    ) : (
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {column.header}
                        </span>
                    )}
                    <span
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Redimensionar coluna ${column.id}`}
                        data-resize-handle={column.id}
                        onPointerDown={(event) => onResizeStart(event, column)}
                        onDragStart={(event) => event.preventDefault()}
                        style={{ width: 6, cursor: 'col-resize', alignSelf: 'stretch', flex: '0 0 auto' }}
                    />
                </div>
            ))}
        </div>
    );
}
