// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
    sarakApplyDrop,
    sarakDescribeMove,
    sarakIsOverdue,
    sarakLocateCard,
    sarakMoveCard,
    sarakPreviewOver,
    type SarakKanbanColumn,
} from '../kanbanModel';

const board = (): SarakKanbanColumn[] => [
    { id: 'todo', title: 'To Do', cards: [{ id: 'a' }, { id: 'b' }] },
    { id: 'done', title: 'Done', cards: [{ id: 'c' }] },
];

const wide = (): SarakKanbanColumn[] => [
    { id: 'todo', title: 'To Do', cards: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    { id: 'doing', title: 'Doing', cards: [{ id: 'x' }, { id: 'y' }, { id: 'z' }] },
    { id: 'empty', title: 'Empty', cards: [] },
];

const ids = (columns: SarakKanbanColumn[], columnId: string) =>
    columns.find((col) => col.id === columnId)!.cards.map((c) => c.id);

describe('kanbanModel.moveCard', () => {
    it('move o card entre colunas, removendo da origem e inserindo no índice de destino', () => {
        const next = sarakMoveCard(board(), 'a', 'todo', 'done', 1);
        expect(ids(next, 'todo')).toEqual(['b']);
        expect(ids(next, 'done')).toEqual(['c', 'a']);
    });

    it('reordena dentro da mesma coluna sem duplicar o card', () => {
        const next = sarakMoveCard(board(), 'a', 'todo', 'todo', 2);
        expect(ids(next, 'todo')).toEqual(['b', 'a']);
    });

    it('é no-op quando o card ou a coluna de origem não existem', () => {
        const original = board();
        expect(sarakMoveCard(original, 'inexistente', 'todo', 'done', 0)).toBe(original);
    });
});

describe('kanbanModel — soltar no índice exato', () => {
    it('sobre um cartão de OUTRA coluna, a pré-visualização o põe no índice do alvo (acima) ou depois dele (abaixo)', () => {
        const above = sarakPreviewOver(wide(), 'a', 'y', false);
        expect(ids(above, 'doing')).toEqual(['x', 'a', 'y', 'z']);
        const below = sarakPreviewOver(wide(), 'a', 'y', true);
        expect(ids(below, 'doing')).toEqual(['x', 'y', 'a', 'z']);
    });

    it('sobre uma coluna vazia ou o espaço de outra coluna, vai ao fim dela', () => {
        expect(ids(sarakPreviewOver(wide(), 'a', 'empty', false), 'empty')).toEqual(['a']);
        expect(ids(sarakPreviewOver(wide(), 'a', 'doing', false), 'doing')).toEqual(['x', 'y', 'z', 'a']);
    });

    it('sobre a própria coluna, a pré-visualização não muda nada', () => {
        const original = wide();
        expect(sarakPreviewOver(original, 'a', 'c', true)).toBe(original);
        expect(sarakPreviewOver(original, 'a', 'todo', false)).toBe(original);
    });

    it('ao soltar sobre um cartão da mesma coluna, o ativo assume o índice dele', () => {
        expect(ids(sarakApplyDrop(wide(), 'a', 'c'), 'todo')).toEqual(['b', 'c', 'a']);
        expect(ids(sarakApplyDrop(wide(), 'c', 'a'), 'todo')).toEqual(['c', 'a', 'b']);
    });

    it('ao soltar sobre a própria coluna, vai ao fim dela', () => {
        expect(ids(sarakApplyDrop(wide(), 'a', 'todo'), 'todo')).toEqual(['b', 'c', 'a']);
    });
});

describe('kanbanModel.describeMove', () => {
    it('entre colunas: índices de origem e destino e os vizinhos finais', () => {
        const before = wide();
        const after = sarakMoveCard(before, 'a', 'todo', 'doing', 1);
        expect(sarakDescribeMove(before, after, 'a')).toEqual({
            cardId: 'a',
            fromColumn: 'todo',
            toColumn: 'doing',
            fromIndex: 0,
            toIndex: 1,
            beforeCardId: 'x',
            afterCardId: 'y',
        });
    });

    it('dentro da coluna: o toIndex é o índice FINAL e os vizinhos já desconsideram o cartão', () => {
        const before = wide();
        const after = sarakMoveCard(before, 'a', 'todo', 'todo', 2);
        expect(sarakDescribeMove(before, after, 'a')).toMatchObject({
            fromIndex: 0, toIndex: 2, beforeCardId: 'c', afterCardId: null,
        });
    });

    it('nas pontas, o vizinho ausente é null', () => {
        const before = wide();
        const first = sarakMoveCard(before, 'c', 'todo', 'doing', 0);
        expect(sarakDescribeMove(before, first, 'c')).toMatchObject({ toIndex: 0, beforeCardId: null, afterCardId: 'x' });
        const empty = sarakMoveCard(before, 'c', 'todo', 'empty', 0);
        expect(sarakDescribeMove(before, empty, 'c')).toMatchObject({ toIndex: 0, beforeCardId: null, afterCardId: null });
    });

    it('soltar no mesmo lugar não descreve movimento', () => {
        const before = wide();
        expect(sarakDescribeMove(before, sarakMoveCard(before, 'b', 'todo', 'todo', 1), 'b')).toBeNull();
        expect(sarakDescribeMove(before, before, 'a')).toBeNull();
    });
});

describe('kanbanModel — localizar e prazo', () => {
    it('localiza coluna e índice, ou null', () => {
        expect(sarakLocateCard(wide(), 'y')).toEqual({ columnId: 'doing', index: 1 });
        expect(sarakLocateCard(wide(), 'nada')).toBeNull();
    });

    it('prazo vence só depois do dia do prazo (o próprio dia não está atrasado)', () => {
        const now = new Date(2026, 9, 8, 15, 0);
        expect(sarakIsOverdue('2026-10-07', now)).toBe(true);
        expect(sarakIsOverdue('2026-10-08', now)).toBe(false);
        expect(sarakIsOverdue('2026-10-09', now)).toBe(false);
        expect(sarakIsOverdue('não é data', now)).toBe(false);
    });
});
