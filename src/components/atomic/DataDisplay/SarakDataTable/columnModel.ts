/**
 * Modelo de colunas do SarakDataTable (Spec 12, Regra 2 · Onda 9).
 *
 * Lógica pura (sem React/DOM) de ordenação, largura e deslocamento das colunas
 * congeladas (pinned). Mantém o componente visual enxuto e testável de forma isolada.
 */

import React from 'react';

export interface SarakColumn<T> {
    /** Identidade estável da coluna (chave de largura/ordem/reorder). */
    id: string;
    /** Conteúdo do cabeçalho. */
    header: React.ReactNode;
    /** Largura inicial em px (default: `DEFAULT_COLUMN_WIDTH`). */
    width?: number;
    /** Largura mínima ao redimensionar em px (default: `MIN_COLUMN_WIDTH`). */
    minWidth?: number;
    /** Congelamento lateral; ausente = coluna rola normalmente. */
    pinned?: 'left' | 'right';
    /** Exibe controle de ordenação para esta coluna. */
    sortable?: boolean;
    /** Render da célula; ausente = `String(row[id])`. */
    render?: (row: T, rowIndex: number) => React.ReactNode;
}

export interface SarakTableSort {
    columnId: string;
    direction: 'asc' | 'desc';
}

export interface TableRowEntry<T> {
    row: T;
    /** Posição da linha antes da ordenação local. */
    index: number;
}

export const defaultTableRowKey = <T,>(row: T, index: number): React.Key => {
    if (typeof row !== 'object' || row === null || !('id' in row)) return index;
    const id = (row as { id?: unknown }).id;
    return typeof id === 'string' || typeof id === 'number' ? id : index;
};

export const nextTableSort = (current: SarakTableSort | null, columnId: string): SarakTableSort | null => {
    if (current?.columnId !== columnId) return { columnId, direction: 'asc' };
    if (current.direction === 'asc') return { columnId, direction: 'desc' };
    return null;
};

const compareSortValues = (left: unknown, right: unknown): number => {
    if (Object.is(left, right)) return 0;
    if (left === null || left === undefined) return -1;
    if (right === null || right === undefined) return 1;
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);

    const leftValue = left instanceof Date ? left.getTime() : String(left);
    const rightValue = right instanceof Date ? right.getTime() : String(right);
    if (typeof leftValue === 'number' && typeof rightValue === 'number') return leftValue - rightValue;
    return String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' });
};

export const sortTableRows = <T,>(
    rows: T[],
    sort: SarakTableSort | null,
    getSortValue: (row: T, columnId: string) => unknown,
): Array<TableRowEntry<T>> => {
    const entries = rows.map((row, index) => ({ row, index }));
    if (!sort) return entries;

    const direction = sort.direction === 'asc' ? 1 : -1;
    return entries.sort((left, right) => {
        const compared = compareSortValues(
            getSortValue(left.row, sort.columnId),
            getSortValue(right.row, sort.columnId),
        );
        return compared * direction || left.index - right.index;
    });
};

export const SARAK_DEFAULT_COLUMN_WIDTH = 160;
export const SARAK_MIN_COLUMN_WIDTH = 60;
export const SELECTION_COLUMN_WIDTH = 48;

/** Resolve a largura efetiva da coluna a partir do estado controlado + default. */
export const sarakWidthOf = <T,>(column: SarakColumn<T>, widths: Record<string, number>): number =>
    widths[column.id] ?? column.width ?? SARAK_DEFAULT_COLUMN_WIDTH;

export const pinnedStyle = <T,>(
    column: SarakColumn<T>,
    offsets: SarakPinnedOffsets,
    background: string,
    selectionWidth = 0,
): React.CSSProperties => {
    if (column.pinned === 'left') {
        return { position: 'sticky', left: offsets.left[column.id] + selectionWidth, zIndex: 2, background };
    }
    if (column.pinned === 'right') {
        return { position: 'sticky', right: offsets.right[column.id], zIndex: 2, background };
    }
    return {};
};

/** Reordena `order` movendo `fromId` para a posição de `toId` (imutável). */
export const sarakReorder = (order: string[], fromId: string, toId: string): string[] => {
    if (fromId === toId) return order;
    const next = order.filter((id) => id !== fromId);
    const target = next.indexOf(toId);
    if (target < 0) return order;
    next.splice(target, 0, fromId);
    return next;
};

export interface SarakPinnedOffsets {
    /** Deslocamento `left` acumulado por id de coluna congelada à esquerda. */
    left: Record<string, number>;
    /** Deslocamento `right` acumulado por id de coluna congelada à direita. */
    right: Record<string, number>;
    /** Soma das larguras de todas as colunas ordenadas. */
    total: number;
}

/**
 * Calcula os deslocamentos sticky das colunas congeladas na ordem atual:
 * left-pinned acumulam da esquerda; right-pinned acumulam da direita (ré).
 */
export const sarakComputeOffsets = <T,>(
    ordered: Array<SarakColumn<T>>,
    widths: Record<string, number>,
): SarakPinnedOffsets => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};

    let leftAcc = 0;
    for (const column of ordered) {
        if (column.pinned === 'left') {
            left[column.id] = leftAcc;
            leftAcc += sarakWidthOf(column, widths);
        }
    }

    let rightAcc = 0;
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
        const column = ordered[i];
        if (column.pinned === 'right') {
            right[column.id] = rightAcc;
            rightAcc += sarakWidthOf(column, widths);
        }
    }

    const total = ordered.reduce((sum, column) => sum + sarakWidthOf(column, widths), 0);
    return { left, right, total };
};
