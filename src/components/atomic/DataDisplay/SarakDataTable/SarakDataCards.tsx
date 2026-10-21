import type React from 'react';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SarakColumn, SarakTableSort } from './columnModel';
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
}

export default function SarakDataCards<T>(props: SarakDataCardsProps<T>): React.ReactElement {
    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({ count: props.rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => props.estimatedCardHeight ?? props.columns.length * 28 + 40, overscan: props.overscan ?? 6 });
    return <SarakDataCardsView props={props} scrollRef={scrollRef} totalSize={virtualizer.getTotalSize()} virtualRows={virtualizer.getVirtualItems()} measureElement={virtualizer.measureElement} />;
}
