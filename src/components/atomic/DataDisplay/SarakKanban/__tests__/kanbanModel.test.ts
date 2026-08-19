// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { moveCard, type KanbanColumn } from '../kanbanModel';

const board = (): KanbanColumn[] => [
    { id: 'todo', title: 'To Do', cards: [{ id: 'a' }, { id: 'b' }] },
    { id: 'done', title: 'Done', cards: [{ id: 'c' }] },
];

describe('Spec 12 (Onda 10) — kanbanModel.moveCard', () => {
    it('move o card entre colunas, removendo da origem e inserindo no índice de destino', () => {
        const next = moveCard(board(), 'a', 'todo', 'done', 1);
        expect(next.find((c) => c.id === 'todo')!.cards.map((c) => c.id)).toEqual(['b']);
        expect(next.find((c) => c.id === 'done')!.cards.map((c) => c.id)).toEqual(['c', 'a']);
    });

    it('reordena dentro da mesma coluna sem duplicar o card', () => {
        const next = moveCard(board(), 'a', 'todo', 'todo', 2);
        expect(next.find((c) => c.id === 'todo')!.cards.map((c) => c.id)).toEqual(['b', 'a']);
    });

    it('é no-op quando o card ou a coluna de origem não existem', () => {
        const original = board();
        expect(moveCard(original, 'inexistente', 'todo', 'done', 0)).toBe(original);
    });
});
