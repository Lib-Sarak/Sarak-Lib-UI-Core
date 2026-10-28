import { useCallback, useMemo, useState } from 'react';
import type { Key } from 'react';
import { buildDisplayRows } from './tableDisplayRows';
import type { SarakDisplayRow, SarakTableGroupBy } from './tableDisplayRows';
import type { TableInteractionEntry } from './useTableInteractions';

export interface UseTableDisplayRowsOptions<T> {
    entries: Array<TableInteractionEntry<T>>;
    groupBy?: SarakTableGroupBy<T>;
    hasDetail: boolean;
    getChildren?: (row: T) => T[] | undefined;
    getRowKey?: (row: T, index: number) => Key;
    defaultExpandedDepth?: number;
    expandedKeys?: Key[];
    onExpandedChange?: (keys: Key[]) => void;
}

export interface TableDisplayRowsResult<T> {
    displayRows: Array<SarakDisplayRow<T>>;
    toggleRow: (key: Key) => void;
    toggleGroup: (groupId: string) => void;
}

/**
 * Estado de expansão (linhas e grupos) + a lista visual achatada. `expandedKeys` controla as linhas;
 * sem ele, a tabela guarda só o que o usuário alternou e parte de `defaultExpandedDepth` (árvore).
 */
export function useTableDisplayRows<T>(options: UseTableDisplayRowsOptions<T>): TableDisplayRowsResult<T> {
    const { expandedKeys, onExpandedChange, defaultExpandedDepth = 0 } = options;
    const [rowOverrides, setRowOverrides] = useState<Map<Key, boolean>>(() => new Map());
    const [groupOverrides, setGroupOverrides] = useState<Map<string, boolean>>(() => new Map());
    const controlled = useMemo(() => (expandedKeys ? new Set(expandedKeys) : null), [expandedKeys]);
    const isRowExpanded = useCallback((key: Key, depth: number): boolean => {
        if (controlled) return controlled.has(key);
        return rowOverrides.get(key) ?? depth < defaultExpandedDepth;
    }, [controlled, rowOverrides, defaultExpandedDepth]);
    const isGroupExpanded = useCallback((groupId: string, fallback: boolean): boolean => groupOverrides.get(groupId) ?? fallback, [groupOverrides]);
    const { entries, groupBy, hasDetail, getChildren, getRowKey } = options;
    const displayRows = useMemo(
        () => buildDisplayRows({ entries, groupBy, hasDetail, getChildren, getRowKey, isRowExpanded, isGroupExpanded }),
        [entries, groupBy, hasDetail, getChildren, getRowKey, isRowExpanded, isGroupExpanded],
    );
    const toggleRow = (key: Key): void => {
        const open = displayRows.flatMap((row) => row.kind === 'data' && row.expanded ? [row.entry.key] : []);
        const next = open.includes(key) ? open.filter((item) => item !== key) : [...open, key];
        if (!controlled) {
            setRowOverrides((previous) => {
                const merged = new Map(previous);
                [...open, ...next].forEach((item) => merged.set(item, next.includes(item)));
                return merged;
            });
        }
        onExpandedChange?.(next);
    };
    const toggleGroup = (groupId: string): void => {
        const row = displayRows.find((item) => item.kind === 'group' && item.id === groupId);
        setGroupOverrides((previous) => new Map(previous).set(groupId, !(row?.kind === 'group' && row.expanded)));
    };
    return { displayRows, toggleRow, toggleGroup };
}
