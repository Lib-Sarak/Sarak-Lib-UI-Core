import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { KanbanCard, KanbanCardShell } from '../KanbanCard';

const card = { id: 'a', title: 'Tarefa A' };

const mount = (ui: React.ReactElement) =>
    render(<DndContext><SortableContext items={['a']}>{ui}</SortableContext></DndContext>);

describe('KanbanCard', () => {
    it('é um artigo identificado, arrastável por atributos de acessibilidade, com o conteúdo padrão', () => {
        mount(<KanbanCard card={card} columnId="todo" />);
        const article = document.querySelector('[data-card-id="a"]') as HTMLElement;
        expect(article).toHaveAttribute('aria-roledescription');
        expect(article).toHaveAttribute('tabindex', '0');
        expect(screen.getByText('Tarefa A')).toBeInTheDocument();
    });

    it('renderCard vence o conteúdo padrão', () => {
        mount(<KanbanCard card={card} columnId="todo" renderCard={(c, col) => <i>{c.id}@{col}</i>} />);
        expect(screen.getByText('a@todo')).toBeInTheDocument();
        expect(screen.queryByText('Tarefa A')).toBeNull();
    });

    it('clique e Enter abrem o cartão; sem onCardClick, Enter não faz nada', () => {
        const onCardClick = vi.fn();
        mount(<KanbanCard card={card} columnId="todo" onCardClick={onCardClick} />);
        const article = document.querySelector('[data-card-id="a"]') as HTMLElement;
        fireEvent.click(article);
        fireEvent.keyDown(article, { key: 'Enter', code: 'Enter' });
        expect(onCardClick).toHaveBeenCalledTimes(2);
        expect(onCardClick).toHaveBeenLastCalledWith(card, 'todo');
    });

    it('a casca do cartão flutuante não é um alvo de soltura nem tem id de cartão', () => {
        render(<KanbanCardShell card={card} columnId="todo" />);
        const shell = document.querySelector('[data-kanban-overlay="true"]') as HTMLElement;
        expect(shell).toHaveTextContent('Tarefa A');
        expect(shell).not.toHaveAttribute('data-card-id');
    });
});
