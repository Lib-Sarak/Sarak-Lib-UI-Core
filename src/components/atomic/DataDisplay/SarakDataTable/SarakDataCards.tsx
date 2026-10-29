import type React from 'react';
import { useMemo, useRef } from 'react';
import { requireTanstackUseVirtualizer } from '../optional-tanstack-virtualizer';
import type { SarakColumn, SarakTableSort } from './columnModel';
import { hasFooter } from './columnValue';
import { cardItemsOf } from './dataCardItems';
import type { SarakDisplayRow } from './tableDisplayRows';
import { SarakDataCardsView } from './SarakDataCardsView';

export interface SarakDataCardsProps<T> {
    columns: Array<SarakColumn<T>>;
    rows: T[];
    height?: number | string;
    estimatedCardHeight?: number;
    overscan?: number;
    getRowKey?: (row: T, index: number) => React.Key;
    rowKeys?: React.Key[];
    rowIndexes?: number[];
    sort?: SarakTableSort | null;
    onSort?: (columnId: string) => void;
    selectable?: boolean;
    selectedKeys?: Set<React.Key>;
    allVisibleSelected?: boolean;
    partiallySelected?: boolean;
    onToggleRow?: (key: React.Key, checked: boolean) => void;
    onToggleAll?: (checked: boolean) => void;
    onRowClick?: (row: T) => void;
    className?: string;
    /** Linhas visuais (grupo, subtotal, detalhe, árvore); ausente = uma linha de dado por `rows`. */
    displayRows?: Array<SarakDisplayRow<T>>;
    /** Linhas sobre as quais o rodapé agrega; ausente, sem rodapé. */
    footerRows?: T[];
    locale?: string;
    renderExpanded?: (row: T) => React.ReactNode;
    onToggleExpand?: (key: React.Key) => void;
    onToggleGroup?: (groupId: string) => void;
}

export default function SarakDataCards<T>(props: SarakDataCardsProps<T>): React.ReactElement {
    const scrollRef = useRef<HTMLDivElement>(null);
    const items = useMemo(() => cardItemsOf(props), [props.displayRows, props.rows, props.rowKeys, props.rowIndexes, props.getRowKey]);
    const footerCount = props.footerRows && hasFooter(props.columns) ? 1 : 0;
    const virtualizer = requireTanstackUseVirtualizer()({ count: items.length + footerCount, getScrollElement: () => scrollRef.current, estimateSize: () => props.estimatedCardHeight ?? props.columns.length * 28 + 40, overscan: props.overscan ?? 6 });
    return <SarakDataCardsView props={props} scrollRef={scrollRef} totalSize={virtualizer.getTotalSize()} virtualRows={virtualizer.getVirtualItems()} measureElement={virtualizer.measureElement} />;
}
