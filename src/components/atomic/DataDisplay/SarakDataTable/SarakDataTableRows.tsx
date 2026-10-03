import React from 'react';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { pinnedStyle, sarakWidthOf, SELECTION_COLUMN_WIDTH, type SarakPinnedOffsets, type SarakColumn } from './columnModel';
import type { TableInteractionEntry } from './useTableInteractions';

export interface SarakDataTableVirtualRow<T> {
    entry: TableInteractionEntry<T>;
    virtualIndex: number;
    virtualKey: React.Key;
    start: number;
}

export interface SarakDataTableRowsProps<T> {
    columns: SarakColumn<T>[];
    rows: Array<SarakDataTableVirtualRow<T>>;
    widths: Record<string, number>;
    offsets: SarakPinnedOffsets;
    containerWidth: number;
    headerHeight: number;
    rowHeight: number;
    cellBackground: string;
    selectable: boolean;
    selectedKeys: Set<React.Key>;
    onToggleRow: (key: React.Key, checked: boolean) => void;
}

export function SarakDataTableRows<T>({
    columns,
    rows,
    widths,
    offsets,
    containerWidth,
    headerHeight,
    rowHeight,
    cellBackground,
    selectable,
    selectedKeys,
    onToggleRow,
}: SarakDataTableRowsProps<T>) {
    const selectionWidth = selectable ? SELECTION_COLUMN_WIDTH : 0;

    return rows.map(({ entry, virtualIndex, virtualKey, start }) => (
        <div
            key={entry.key ?? virtualKey}
            role="row"
            data-index={virtualIndex}
            style={{
                position: 'absolute',
                top: headerHeight + start,
                left: 0,
                display: 'flex',
                width: containerWidth,
                height: rowHeight,
                borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,#334155))',
            }}
        >
            {selectable && (
                <div role="cell" aria-label="Seleção" style={{ width: selectionWidth, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SarakCheckbox
                        aria-label={`Selecionar linha ${String(entry.key)}`}
                        checked={selectedKeys.has(entry.key)}
                        onChange={(event) => onToggleRow(entry.key, event.currentTarget.checked)}
                    />
                </div>
            )}
            {columns.map((column) => (
                <div
                    key={column.id}
                    role="cell"
                    data-column-id={column.id}
                    style={{
                        width: sarakWidthOf(column, widths),
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 var(--sarak-table-padding, 12px)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--sarak-text-main,#ffffff)',
                        ...pinnedStyle(column, offsets, cellBackground, selectionWidth),
                    }}
                >
                    {column.render
                        ? column.render(entry.row, entry.index)
                        : String((entry.row as Record<string, unknown>)[column.id] ?? '')}
                </div>
            ))}
        </div>
    ));
}
