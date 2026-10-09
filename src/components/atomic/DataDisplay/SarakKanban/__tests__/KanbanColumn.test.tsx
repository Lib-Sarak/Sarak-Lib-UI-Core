import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { SarakIcon } from '../../../Icon/SarakIcon';
import { KanbanColumn } from '../KanbanColumn';

const column = { id: 'todo', title: 'A fazer', cards: [{ id: 'a', title: 'Tarefa A' }, { id: 'b', title: 'Tarefa B' }] };

const mount = (ui: React.ReactElement) => render(<DndContext>{ui}</DndContext>);

describe('KanbanColumn', () => {
    it('mostra o título, a contagem e os cartões na ordem', () => {
        mount(<KanbanColumn column={column} />);
        expect(screen.getByRole('region', { name: 'A fazer' })).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(Array.from(document.querySelectorAll('[data-card-id]')).map((el) => el.getAttribute('data-card-id'))).toEqual(['a', 'b']);
    });

    it('coluna vazia mostra o estado vazio traduzido', () => {
        mount(<KanbanColumn column={{ ...column, cards: [] }} />);
        expect(screen.getByText('Nenhum cartão')).toBeInTheDocument();
    });

    it('sem onCardAdd e sem eventos de coluna, não há campo de criação nem menu', () => {
        mount(<KanbanColumn column={column} />);
        expect(document.querySelector('[data-kanban-add]')).toBeNull();
        expect(screen.queryByRole('button', { name: /Opções da coluna/ })).toBeNull();
    });

    it('com onCardAdd, o rodapé cria o cartão naquela coluna', () => {
        const onCardAdd = vi.fn();
        mount(<KanbanColumn column={column} onCardAdd={onCardAdd} />);
        const input = screen.getByRole('textbox', { name: 'Novo cartão' });
        fireEvent.change(input, { target: { value: 'Outro' } });
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar cartão' }));
        expect(onCardAdd).toHaveBeenCalledWith('todo', 'Outro');
    });

    it('o botão do menu renderiza o ícone da porta de ícones, não um glifo de texto', () => {
        const reference = render(<SarakIcon name="MoreHorizontal" />);
        const expected = reference.container.querySelector('svg')?.outerHTML;
        reference.unmount();
        expect(expected).toBeTruthy();

        mount(<KanbanColumn column={column} onColumnDelete={vi.fn()} />);
        const button = screen.getByRole('button', { name: 'Opções da coluna A fazer' });
        expect(button.querySelector('svg')?.outerHTML).toBe(expected);
        expect(button.textContent).not.toContain('⋯');
    });

    it('o menu abre com os itens dos eventos presentes e fecha ao escolher', () => {
        const onColumnDelete = vi.fn();
        mount(<KanbanColumn column={column} onColumnDelete={onColumnDelete} />);
        fireEvent.click(screen.getByRole('button', { name: 'Opções da coluna A fazer' }), { clientX: 5, clientY: 5 });
        fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir coluna' }));
        expect(onColumnDelete).toHaveBeenCalledWith('todo');
        expect(screen.queryByRole('menuitem')).toBeNull();
    });
});
