/**
 * Modelo de dados do SarakKanban (Spec 12, Regra 3 · Onda 10).
 *
 * Lógica pura (sem React/DOM) de movimentação de cards entre colunas — testável de forma
 * isolada e reusada pelo componente no `drop`.
 */

export interface KanbanCard {
    id: string;
    title?: string;
    description?: string;
}

export interface KanbanColumn<C extends KanbanCard = KanbanCard> {
    id: string;
    title: string;
    cards: C[];
}

export interface CardMove {
    cardId: string;
    fromColumn: string;
    toColumn: string;
    /** Índice de destino dentro da coluna alvo. */
    toIndex: number;
}

/**
 * Move `cardId` de `fromColumn` para `toColumn` na posição `toIndex` (imutável).
 * Devolve as colunas inalteradas se o card/coluna não existirem.
 */
export const moveCard = <C extends KanbanCard>(
    columns: Array<KanbanColumn<C>>,
    cardId: string,
    fromColumn: string,
    toColumn: string,
    toIndex: number,
): Array<KanbanColumn<C>> => {
    const source = columns.find((col) => col.id === fromColumn);
    const card = source?.cards.find((c) => c.id === cardId);
    if (!source || !card) return columns;

    return columns.map((col) => {
        if (col.id === fromColumn && col.id === toColumn) {
            const without = col.cards.filter((c) => c.id !== cardId);
            const clamped = Math.min(Math.max(toIndex, 0), without.length);
            without.splice(clamped, 0, card);
            return { ...col, cards: without };
        }
        if (col.id === fromColumn) {
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === toColumn) {
            const next = col.cards.filter((c) => c.id !== cardId);
            const clamped = Math.min(Math.max(toIndex, 0), next.length);
            next.splice(clamped, 0, card);
            return { ...col, cards: next };
        }
        return col;
    });
};
