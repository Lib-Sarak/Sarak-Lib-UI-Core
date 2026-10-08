import type { ReactElement, Key } from 'react';
import type { SarakColumn, SarakPinnedOffsets } from './columnModel';
import type { TableInteractionEntry } from './useTableInteractions';
import { SarakDataTableRow } from './SarakDataTableRow';

export interface SarakDataTableVirtualRow<T> {
    entry: TableInteractionEntry<T>;
    virtualIndex: number;
    virtualKey: Key;
    start: number;
    size: number;
}

export interface SarakDataTableRowsProps<T> {
    columns: SarakColumn<T>[];
    rows: Array<SarakDataTableVirtualRow<T>>;
    widths: Record<string, number>;
    offsets: SarakPinnedOffsets;
    containerWidth: number;
    headerHeight: number;
    automaticHeight: boolean;
    cellBackground: string;
    selectable: boolean;
    selectedKeys: Set<Key>;
    onToggleRow: (key: Key, checked: boolean) => void;
    onRowClick?: (row: T) => void;
    measureElement: (element: Element | null) => void;
}

export function SarakDataTableRows<T>(props: SarakDataTableRowsProps<T>): ReactElement[] {
    return props.rows.map((row) => <SarakDataTableRow key={row.entry.key ?? row.virtualKey} row={row} props={props} />);
}
