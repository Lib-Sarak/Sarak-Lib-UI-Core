/**
 * Achata grupos, subtotais, linhas expandidas e árvore em UMA lista de linhas visuais, para a
 * virtualização continuar valendo (uma linha visual = uma entrada). Lógica pura, sem React.
 */

import type { Key, ReactNode } from 'react';
import { defaultTableRowKey } from './columnModel';
import type { TableInteractionEntry } from './useTableInteractions';

export interface SarakTableGroupBy<T> {
    /** Campo da linha, ou função que devolve a chave do grupo. */
    key: string | ((row: T) => string);
    label?: (key: string, rows: T[]) => ReactNode;
    /** Padrão `true`. */
    subtotals?: boolean;
    /** Padrão `true`. */
    defaultExpanded?: boolean;
}

export type SarakDisplayRow<T> =
    | { kind: 'data'; id: string; entry: TableInteractionEntry<T>; depth: number; expandable: boolean; expanded: boolean; hasChildren: boolean }
    | { kind: 'group'; id: string; groupKey: string; rows: T[]; expanded: boolean; label?: (key: string, rows: T[]) => ReactNode }
    | { kind: 'subtotal'; id: string; groupKey: string; rows: T[] }
    | { kind: 'detail'; id: string; entry: TableInteractionEntry<T> };

export interface BuildDisplayRowsOptions<T> {
    entries: Array<TableInteractionEntry<T>>;
    groupBy?: SarakTableGroupBy<T>;
    /** A linha tem conteúdo expansível (`renderExpanded`). */
    hasDetail: boolean;
    getChildren?: (row: T) => T[] | undefined;
    getRowKey?: (row: T, index: number) => Key;
    isRowExpanded: (key: Key, depth: number) => boolean;
    isGroupExpanded: (groupId: string, defaultExpanded: boolean) => boolean;
}

export const groupKeyOf = <T,>(groupBy: SarakTableGroupBy<T>, row: T): string => {
    const key = typeof groupBy.key === 'function' ? groupBy.key(row) : (row as Record<string, unknown>)[groupBy.key];
    return key === null || key === undefined ? '' : String(key);
};

export const groupIdOf = (groupKey: string): string => `group:${groupKey}`;

const expandRows = <T,>(entries: Array<TableInteractionEntry<T>>, depth: number, options: BuildDisplayRowsOptions<T>): Array<SarakDisplayRow<T>> => {
    const out: Array<SarakDisplayRow<T>> = [];
    entries.forEach((entry) => {
        const children = options.getChildren?.(entry.row) ?? [];
        const hasChildren = children.length > 0;
        const expandable = hasChildren || options.hasDetail;
        const expanded = expandable && options.isRowExpanded(entry.key, depth);
        out.push({ kind: 'data', id: `row:${String(entry.key)}`, entry, depth, expandable, expanded, hasChildren });
        if (!expanded) return;
        if (options.hasDetail) out.push({ kind: 'detail', id: `detail:${String(entry.key)}`, entry });
        if (hasChildren) out.push(...expandRows(childEntries(children, entry.key, options), depth + 1, options));
    });
    return out;
};

const childEntries = <T,>(children: T[], parentKey: Key, options: BuildDisplayRowsOptions<T>): Array<TableInteractionEntry<T>> =>
    children.map((row, index) => {
        const own = options.getRowKey ? options.getRowKey(row, index) : defaultTableRowKey(row, index);
        const isIndexKey = own === index && (typeof row !== 'object' || row === null || !('id' in row));
        return { row, index, key: isIndexKey ? `${String(parentKey)}/${index}` : own };
    });

const partitionByGroup = <T,>(entries: Array<TableInteractionEntry<T>>, groupBy: SarakTableGroupBy<T>): Map<string, Array<TableInteractionEntry<T>>> => {
    const groups = new Map<string, Array<TableInteractionEntry<T>>>();
    entries.forEach((entry) => {
        const key = groupKeyOf(groupBy, entry.row);
        groups.set(key, [...(groups.get(key) ?? []), entry]);
    });
    return groups;
};

/** Monta a lista visual; sem `groupBy`, sem árvore e sem expansão devolve só as linhas de dado. */
export function buildDisplayRows<T>(options: BuildDisplayRowsOptions<T>): Array<SarakDisplayRow<T>> {
    const { groupBy } = options;
    if (!groupBy) return expandRows(options.entries, 0, options);
    const out: Array<SarakDisplayRow<T>> = [];
    partitionByGroup(options.entries, groupBy).forEach((groupEntries, groupKey) => {
        const rows = groupEntries.map(({ row }) => row);
        const expanded = options.isGroupExpanded(groupIdOf(groupKey), groupBy.defaultExpanded ?? true);
        out.push({ kind: 'group', id: groupIdOf(groupKey), groupKey, rows, expanded, label: groupBy.label });
        if (!expanded) return;
        out.push(...expandRows(groupEntries, 0, options));
        if (groupBy.subtotals ?? true) out.push({ kind: 'subtotal', id: `subtotal:${groupKey}`, groupKey, rows });
    });
    return out;
}
