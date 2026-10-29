/**
 * Modelo de dados do SarakKanban.
 *
 * Lógica pura (sem React/DOM) de movimentação de cards entre e dentro das colunas —
 * testável de forma isolada e usada pelo adaptador de arrastar (`useKanbanDrag`).
 */

import type { SarakCardMove, SarakKanbanCard, SarakKanbanColumn } from './kanbanTypes';

export type {
    SarakCardMove,
    SarakKanbanAssignee,
    SarakKanbanCard,
    SarakKanbanColumn,
    SarakKanbanPriority,
    SarakKanbanSubtasks,
} from './kanbanTypes';

type Board<C extends SarakKanbanCard> = Array<SarakKanbanColumn<C>>;

export interface SarakCardLocation {
    columnId: string;
    index: number;
}

const clampIndex = (index: number, length: number): number => Math.min(Math.max(index, 0), length);

/** Coluna e posição de um cartão; `null` se ele não existe. */
export const sarakLocateCard = <C extends SarakKanbanCard>(
    columns: Board<C>,
    cardId: string,
): SarakCardLocation | null => {
    for (const column of columns) {
        const index = column.cards.findIndex((card) => card.id === cardId);
        if (index >= 0) return { columnId: column.id, index };
    }
    return null;
};

/**
 * Move `cardId` de `fromColumn` para `toColumn` na posição `toIndex` (imutável).
 * Devolve as colunas inalteradas se o card/coluna não existirem.
 */
export const sarakMoveCard = <C extends SarakKanbanCard>(
    columns: Array<SarakKanbanColumn<C>>,
    cardId: string,
    fromColumn: string,
    toColumn: string,
    toIndex: number,
): Array<SarakKanbanColumn<C>> => {
    const source = columns.find((col) => col.id === fromColumn);
    const card = source?.cards.find((c) => c.id === cardId);
    if (!source || !card) return columns;

    return columns.map((col) => {
        if (col.id !== fromColumn && col.id !== toColumn) return col;
        const without = col.cards.filter((c) => c.id !== cardId);
        if (col.id !== toColumn) return { ...col, cards: without };
        without.splice(clampIndex(toIndex, without.length), 0, card);
        return { ...col, cards: without };
    });
};

/**
 * Pré-visualização durante o arrasto: se o cartão passou por cima de OUTRA coluna (ou de um
 * cartão dela), ele muda de coluna já; sobre a própria coluna não muda nada (a reordenação
 * visual é do contexto de ordenação). `placeAfter` diz se o ponteiro está na metade de baixo
 * do cartão-alvo.
 */
export const sarakPreviewOver = <C extends SarakKanbanCard>(
    columns: Board<C>,
    activeId: string,
    overId: string,
    placeAfter: boolean,
): Board<C> => {
    const from = sarakLocateCard(columns, activeId);
    const overColumn = columns.find((col) => col.id === overId);
    const overCard = overColumn ? null : sarakLocateCard(columns, overId);
    if (!from) return columns;
    if (overColumn && overColumn.id !== from.columnId) {
        return sarakMoveCard(columns, activeId, from.columnId, overColumn.id, overColumn.cards.length);
    }
    if (overCard && overCard.columnId !== from.columnId) {
        return sarakMoveCard(columns, activeId, from.columnId, overCard.columnId, overCard.index + (placeAfter ? 1 : 0));
    }
    return columns;
};

/**
 * Quadro final ao soltar: sobre um cartão da MESMA coluna, o ativo assume o índice dele;
 * sobre uma coluna vazia ou o espaço dela, vai ao fim; o resto já foi resolvido na
 * pré-visualização.
 */
export const sarakApplyDrop = <C extends SarakKanbanCard>(
    columns: Board<C>,
    activeId: string,
    overId: string,
): Board<C> => {
    const from = sarakLocateCard(columns, activeId);
    if (!from) return columns;
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
        const target = overColumn.cards.length - (overColumn.id === from.columnId ? 1 : 0);
        return sarakMoveCard(columns, activeId, from.columnId, overColumn.id, target);
    }
    const over = sarakLocateCard(columns, overId);
    if (!over || over.columnId !== from.columnId) return columns;
    return sarakMoveCard(columns, activeId, from.columnId, over.columnId, over.index);
};

/**
 * Descreve o movimento entre o quadro de ANTES e o de DEPOIS do arrasto. `null` quando o
 * cartão voltou ao mesmo lugar (nada a emitir).
 */
export const sarakDescribeMove = <C extends SarakKanbanCard>(
    before: Board<C>,
    after: Board<C>,
    cardId: string,
): SarakCardMove | null => {
    const from = sarakLocateCard(before, cardId);
    const to = sarakLocateCard(after, cardId);
    if (!from || !to) return null;
    if (from.columnId === to.columnId && from.index === to.index) return null;
    const cards = after.find((col) => col.id === to.columnId)?.cards ?? [];
    return {
        cardId,
        fromColumn: from.columnId,
        toColumn: to.columnId,
        fromIndex: from.index,
        toIndex: to.index,
        beforeCardId: cards[to.index - 1]?.id ?? null,
        afterCardId: cards[to.index + 1]?.id ?? null,
    };
};

/** Início do dia local de uma data ISO (`2026-10-31` é lido como dia local, não UTC). */
const startOfLocalDay = (value: string): Date | null => {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const parsed = dateOnly
        ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
        : new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/** Prazo vencido = dia do prazo anterior ao dia de hoje (o próprio dia ainda não está atrasado). */
/** Soma o `value` dos cartões; `null` quando nenhum cartão tem valor, para o cabeçalho não mostrar zero inventado. */
export const sarakColumnTotal = (cards: ReadonlyArray<SarakKanbanCard>): number | null => {
    const values = cards.map((card) => card.value).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0);
};

export const sarakIsOverdue = (dueDate: string, now: Date = new Date()): boolean => {
    const due = startOfLocalDay(dueDate);
    if (!due) return false;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return due.getTime() < today.getTime();
};

export const sarakParseDueDate = startOfLocalDay;
