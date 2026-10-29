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
    /** Total no servidor; maior que as linhas visíveis, oferece "Selecionar todos os N". */
    totalCount?: number;
    /** Com `true`, `selectedKeys` passa a ser a lista de EXCEÇÕES (linhas desmarcadas). */
    selectAll?: boolean;
    onSelectAllChange?: (all: boolean) => void;
}

export interface TableInteractionsResult<T> {
    entries: Array<TableInteractionEntry<T>>;
    sort: SarakTableSort | null;
    /** As chaves marcadas entre as linhas visíveis (com `selectAll`, todas menos as exceções). */
    selectedKeys: Set<React.Key>;
    allVisibleSelected: boolean;
    partiallySelected: boolean;
    changeSort: (columnId: string) => void;
    toggleRow: (key: React.Key, checked: boolean) => void;
    toggleAll: (checked: boolean) => void;
    /** O modo "todos os N" está ligado. */
    selectAll?: boolean;
    totalCount?: number;
    /** O cabeçalho está marcado e há mais itens no servidor que na página. */
    canSelectAllTotal?: boolean;
    selectAllTotal?: () => void;
    clearSelection?: () => void;
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
    totalCount,
    selectAll: controlledSelectAll,
    onSelectAllChange,
}: UseTableInteractionsOptions<T>): TableInteractionsResult<T> {
    const [internalSort, setInternalSort] = useState<SarakTableSort | null>(null);
    const [internalKeys, setInternalKeys] = useState<React.Key[]>([]);
    const [internalSelectAll, setInternalSelectAll] = useState(false);
    const isSortControlled = controlledSort !== undefined;
    const sort = isSortControlled ? controlledSort : internalSort;
    const selectAll = controlledSelectAll ?? internalSelectAll;
    const keys = controlledKeys ?? internalKeys;
    const entries = useMemo(
        () => createEntries({ rows, sort, controlled: isSortControlled, getSortValue, getRowKey }),
        [rows, sort, isSortControlled, getSortValue, getRowKey],
    );
    const selectedKeys = useMemo(() => {
        const listed = new Set(keys);
        return selectAll ? new Set(entries.filter(({ key }) => !listed.has(key)).map(({ key }) => key)) : listed;
    }, [keys, selectAll, entries]);
    const allVisibleSelected = entries.length > 0 && entries.every(({ key }) => selectedKeys.has(key));
    const partiallySelected = entries.some(({ key }) => selectedKeys.has(key)) && !allVisibleSelected;
    const publishKeys = (next: React.Key[]): void => {
        if (controlledKeys === undefined) setInternalKeys(next);
        onSelectionChange?.(next);
    };
    const changeSelectAll = (all: boolean): void => {
        if (controlledSelectAll === undefined) setInternalSelectAll(all);
        onSelectAllChange?.(all);
    };
    const changeSort = (columnId: string): void => {
        const next = nextTableSort(sort ?? null, columnId);
        if (!isSortControlled) setInternalSort(next);
        onSortChange?.(next);
    };
    // Com selectAll, marcar a linha a TIRA das exceções e desmarcá-la a põe nelas.
    const toggleRow = (key: React.Key, checked: boolean): void => publishKeys(updateKeys(keys, key, selectAll ? !checked : checked));
    const clearSelection = (): void => {
        changeSelectAll(false);
        publishKeys([]);
    };
    const toggleAll = (checked: boolean): void => {
        if (selectAll) {
            if (checked) publishKeys([]);
            else clearSelection();
            return;
        }
        const next = new Set(keys);
        entries.forEach(({ key }) => checked ? next.add(key) : next.delete(key));
        publishKeys(Array.from(next));
    };
    const selectAllTotal = (): void => {
        changeSelectAll(true);
        publishKeys([]);
    };
    const canSelectAllTotal = !selectAll && allVisibleSelected && totalCount !== undefined && totalCount > entries.length;

    return { entries, sort: sort ?? null, selectedKeys, allVisibleSelected, partiallySelected, changeSort, toggleRow, toggleAll, selectAll, totalCount, canSelectAllTotal, selectAllTotal, clearSelection };
}
