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
    /** Render da célula; ausente = `String(row[id])`. */
    render?: (row: T, rowIndex: number) => React.ReactNode;
}

export const DEFAULT_COLUMN_WIDTH = 160;
export const MIN_COLUMN_WIDTH = 60;

/** Resolve a largura efetiva da coluna a partir do estado controlado + default. */
export const widthOf = <T,>(column: SarakColumn<T>, widths: Record<string, number>): number =>
    widths[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH;

/** Reordena `order` movendo `fromId` para a posição de `toId` (imutável). */
export const reorder = (order: string[], fromId: string, toId: string): string[] => {
    if (fromId === toId) return order;
    const next = order.filter((id) => id !== fromId);
    const target = next.indexOf(toId);
    if (target < 0) return order;
    next.splice(target, 0, fromId);
    return next;
};

export interface PinnedOffsets {
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
export const computeOffsets = <T,>(
    ordered: Array<SarakColumn<T>>,
    widths: Record<string, number>,
): PinnedOffsets => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};

    let leftAcc = 0;
    for (const column of ordered) {
        if (column.pinned === 'left') {
            left[column.id] = leftAcc;
            leftAcc += widthOf(column, widths);
        }
    }

    let rightAcc = 0;
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
        const column = ordered[i];
        if (column.pinned === 'right') {
            right[column.id] = rightAcc;
            rightAcc += widthOf(column, widths);
        }
    }

    const total = ordered.reduce((sum, column) => sum + widthOf(column, widths), 0);
    return { left, right, total };
};
