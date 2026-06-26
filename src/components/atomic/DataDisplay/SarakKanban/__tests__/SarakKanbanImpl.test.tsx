import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SarakKanbanImpl from '../SarakKanbanImpl';
import type { KanbanColumn } from '../kanbanModel';

const columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', cards: [{ id: 'a', title: 'Tarefa A' }] },
    { id: 'done', title: 'Done', cards: [] },
];

const columnEl = (id: string) => document.querySelector(`[data-column-id="${id}"]`) as HTMLElement;

describe('Spec 12 (Onda 10) — SarakKanban: drag-and-drop nativo', () => {
    it('renderiza colunas e cards com a contagem por coluna', () => {
        render(<SarakKanbanImpl columns={columns} />);
        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('Tarefa A')).toBeInTheDocument();
    });

    it('move o card no drop (drag_end origem→destino) e emite onCardMove imediatamente', () => {
        const onCardMove = vi.fn();
        render(<SarakKanbanImpl columns={columns} onCardMove={onCardMove} />);

        const card = document.querySelector('[data-card-id="a"]') as HTMLElement;
        fireEvent.dragStart(card);
        fireEvent.dragOver(columnEl('done'));
        fireEvent.drop(columnEl('done'));

        expect(onCardMove).toHaveBeenCalledWith({
            cardId: 'a',
            fromColumn: 'todo',
            toColumn: 'done',
            toIndex: 0,
        });
        // Atualização visual imediata: o card passa a viver na coluna "Done".
        expect(within(columnEl('done')).getByText('Tarefa A')).toBeInTheDocument();
        expect(within(columnEl('todo')).queryByText('Tarefa A')).toBeNull();
    });
});
