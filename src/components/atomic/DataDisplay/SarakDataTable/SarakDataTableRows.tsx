import type { ReactElement, ReactNode, Key } from 'react';
import type { SarakColumn, SarakPinnedOffsets } from './columnModel';
import type { SarakDisplayRow } from './tableDisplayRows';
import type { TableInteractionEntry } from './useTableInteractions';
import { SarakDataTableRow } from './SarakDataTableRow';
import { SarakDataTableDetailRow, SarakDataTableGroupRow, SarakDataTableSubtotalRow } from './SarakDataTableSpecialRows';

export interface SarakDataTableVirtualRow<T> {
    /** Para grupo e subtotal, uma entrada sintética (1ª linha do grupo) — só `display` os distingue. */
    entry: TableInteractionEntry<T>;
    /** O que a linha é; ausente = linha de dado simples. */
    display?: SarakDisplayRow<T>;
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
    /** Alterna o fundo das linhas ímpares do índice virtual (`tableZebraStriping`). */
    zebra?: boolean;
    selectable: boolean;
    selectedKeys: Set<Key>;
    onToggleRow: (key: Key, checked: boolean) => void;
    onRowClick?: (row: T) => void;
    measureElement: (element: Element | null) => void;
    /** Locale da formatação das células; ausente = o do ambiente. */
    locale?: string;
    /** Há a coluna do botão de expandir (`renderExpanded` sem árvore). */
    hasExpander?: boolean;
    /** Id da coluna que recebe a indentação e o botão da árvore. */
    treeColumnId?: string;
    renderExpanded?: (row: T) => ReactNode;
    onToggleExpand?: (key: Key) => void;
    onToggleGroup?: (groupId: string) => void;
}

const renderVirtualRow = <T,>(row: SarakDataTableVirtualRow<T>, props: SarakDataTableRowsProps<T>): ReactElement => {
    const key = row.display?.id ?? row.entry.key ?? row.virtualKey;
    if (row.display?.kind === 'group') return <SarakDataTableGroupRow key={key} row={row} display={row.display} props={props} />;
    if (row.display?.kind === 'subtotal') return <SarakDataTableSubtotalRow key={key} row={row} display={row.display} props={props} />;
    if (row.display?.kind === 'detail') return <SarakDataTableDetailRow key={key} row={row} display={row.display} props={props} />;
    return <SarakDataTableRow key={key} row={row} props={props} />;
};

export function SarakDataTableRows<T>(props: SarakDataTableRowsProps<T>): ReactElement[] {
    return props.rows.map((row) => renderVirtualRow(row, props));
}
