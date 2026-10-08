import { useMemo, useState } from 'react';
import type React from 'react';
import {
    defaultTableRowKey,
    nextTableSort,
    sortTableRows,
    type SarakTableSort,
    type TableRowEntry,
} from './columnModel';

export interface TableInteractionEntry<T> extends TableRowEntry<T> {
    key: React.Key;
}

export interface UseTableInteractionsOptions<T> {
    rows: T[];
    getRowKey?: (row: T, index: number) => React.Key;
    getSortValue: (row: T, columnId: string) => unknown;
    sort?: SarakTableSort | null;
    onSortChange?: (sort: SarakTableSort | null) => void;
    selectedKeys?: React.Key[];
    onSelectionChange?: (selectedKeys: React.Key[]) => void;
}

export interface TableInteractionsResult<T> {
    entries: Array<TableInteractionEntry<T>>;
    sort: SarakTableSort | null;
    selectedKeys: Set<React.Key>;
    allVisibleSelected: boolean;
    partiallySelected: boolean;
    changeSort: (columnId: string) => void;
    toggleRow: (key: React.Key, checked: boolean) => void;
    toggleAll: (checked: boolean) => void;
}

interface CreateEntriesOptions<T> {
    rows: T[];
    sort: SarakTableSort | null;
    controlled: boolean;
    getSortValue: (row: T, columnId: string) => unknown;
    getRowKey?: (row: T, index: number) => React.Key;
}

const createEntries = <T,>(
    { rows, sort, controlled, getSortValue, getRowKey }: CreateEntriesOptions<T>,
): Array<TableInteractionEntry<T>> => {
    const entries = controlled ? rows.map((row, index) => ({ row, index })) : sortTableRows(rows, sort, getSortValue);
    return entries.map((entry) => ({
        ...entry,
        key: getRowKey ? getRowKey(entry.row, entry.index) : defaultTableRowKey(entry.row, entry.index),
    }));
};

const updateKeys = (keys: React.Key[], key: React.Key, checked: boolean): React.Key[] => {
    const next = new Set(keys);
    if (checked) next.add(key);
    else next.delete(key);
    return Array.from(next);
};

export function useTableInteractions<T>({
    rows,
    getRowKey,
    getSortValue,
    sort: controlledSort,
    onSortChange,
    selectedKeys: controlledKeys,
    onSelectionChange,
}: UseTableInteractionsOptions<T>): TableInteractionsResult<T> {
    const [internalSort, setInternalSort] = useState<SarakTableSort | null>(null);
    const [internalKeys, setInternalKeys] = useState<React.Key[]>([]);
    const isSortControlled = controlledSort !== undefined;
    const sort = isSortControlled ? controlledSort : internalSort;
    const keys = controlledKeys ?? internalKeys;
    const selectedKeys = useMemo(() => new Set(keys), [keys]);
    const entries = useMemo(
        () => createEntries({ rows, sort, controlled: isSortControlled, getSortValue, getRowKey }),
        [rows, sort, isSortControlled, getSortValue, getRowKey],
    );
    const allVisibleSelected = entries.length > 0 && entries.every(({ key }) => selectedKeys.has(key));
    const partiallySelected = entries.some(({ key }) => selectedKeys.has(key)) && !allVisibleSelected;
    const publishKeys = (next: React.Key[]): void => {
        if (controlledKeys === undefined) setInternalKeys(next);
        onSelectionChange?.(next);
    };
    const changeSort = (columnId: string): void => {
        const next = nextTableSort(sort ?? null, columnId);
        if (!isSortControlled) setInternalSort(next);
        onSortChange?.(next);
    };
    const toggleRow = (key: React.Key, checked: boolean): void => publishKeys(updateKeys(keys, key, checked));
    const toggleAll = (checked: boolean): void => {
        const next = new Set(keys);
        entries.forEach(({ key }) => checked ? next.add(key) : next.delete(key));
        publishKeys(Array.from(next));
    };

    return { entries, sort: sort ?? null, selectedKeys, allVisibleSelected, partiallySelected, changeSort, toggleRow, toggleAll };
}
