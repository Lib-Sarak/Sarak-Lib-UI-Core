import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SarakKanbanImpl from '../SarakKanbanImpl';
import type { SarakKanbanColumn } from '../kanbanTypes';

const columns: SarakKanbanColumn[] = [
    { id: 'todo', title: 'To Do', cards: [{ id: 'a', title: 'Tarefa A' }] },
    { id: 'done', title: 'Done', cards: [] },
];

const columnEl = (id: string) => document.querySelector(`[data-column-id="${id}"]`) as HTMLElement;

describe('SarakKanban — compatibilidade do uso anterior', () => {
    it('<SarakKanban columns onCardMove renderCard /> renderiza colunas, contagem e o renderCard vence o padrão', () => {
        const renderCard = vi.fn((card) => <b>custom-{card.id}</b>);
        render(<SarakKanbanImpl columns={columns} onCardMove={vi.fn()} renderCard={renderCard} />);
        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('custom-a')).toBeInTheDocument();
        expect(screen.queryByText('Tarefa A')).toBeNull();
        expect(renderCard).toHaveBeenCalledWith(columns[0].cards[0], 'todo');
    });

    it('sem renderCard mostra o cartão padrão com o título', () => {
        render(<SarakKanbanImpl columns={columns} />);
        expect(within(columnEl('todo')).getByText('Tarefa A')).toBeInTheDocument();
    });

    it('ressincroniza quando o consumidor troca as colunas', () => {
        const { rerender } = render(<SarakKanbanImpl columns={columns} />);
        rerender(<SarakKanbanImpl columns={[{ id: 'todo', title: 'To Do', cards: [{ id: 'n', title: 'Nova' }] }]} />);
        expect(screen.getByText('Nova')).toBeInTheDocument();
        expect(screen.queryByText('Tarefa A')).toBeNull();
    });
});

describe('SarakKanban — eventos opcionais: sem o evento, sem o controle', () => {
    it('sem nenhum evento novo não há campo de criação, menu de coluna nem cartão clicável', () => {
        render(<SarakKanbanImpl columns={columns} />);
        expect(document.querySelector('[data-kanban-add]')).toBeNull();
        expect(screen.queryByRole('button', { name: /Opções da coluna/ })).toBeNull();
        expect(screen.getByText('Tarefa A').closest('article')).not.toHaveStyle({ cursor: 'pointer' });
    });

    it('onCardClick: clicar no cartão dispara com o cartão e a coluna', () => {
        const onCardClick = vi.fn();
        render(<SarakKanbanImpl columns={columns} onCardClick={onCardClick} />);
        fireEvent.click(screen.getByText('Tarefa A'));
        expect(onCardClick).toHaveBeenCalledWith(columns[0].cards[0], 'todo');
    });

    it('onCardAdd: o campo do rodapé da coluna cria o cartão com o título digitado', () => {
        const onCardAdd = vi.fn();
        render(<SarakKanbanImpl columns={columns} onCardAdd={onCardAdd} />);
        const form = within(columnEl('done')).getByRole('textbox', { name: 'Novo cartão' });
        fireEvent.change(form, { target: { value: '  Revisar  ' } });
        fireEvent.submit(form.closest('form') as HTMLFormElement);
        expect(onCardAdd).toHaveBeenCalledWith('done', 'Revisar');
        expect(document.querySelectorAll('[data-kanban-add="card"]')).toHaveLength(2);
    });

    it('onColumnAdd: o campo ao fim do quadro cria a coluna', () => {
        const onColumnAdd = vi.fn();
        render(<SarakKanbanImpl columns={columns} onColumnAdd={onColumnAdd} />);
        const input = screen.getByRole('textbox', { name: 'Nova coluna' });
        fireEvent.change(input, { target: { value: 'Revisão' } });
        fireEvent.submit(input.closest('form') as HTMLFormElement);
        expect(onColumnAdd).toHaveBeenCalledWith('Revisão');
    });

    it('onColumnRename e onColumnDelete: o menu da coluna oferece os dois e dispara', () => {
        const onColumnRename = vi.fn();
        const onColumnDelete = vi.fn();
        render(<SarakKanbanImpl columns={columns} onColumnRename={onColumnRename} onColumnDelete={onColumnDelete} />);

        fireEvent.click(screen.getByRole('button', { name: 'Opções da coluna Done' }), { clientX: 10, clientY: 10 });
        fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir coluna' }));
        expect(onColumnDelete).toHaveBeenCalledWith('done');

        fireEvent.click(screen.getByRole('button', { name: 'Opções da coluna To Do' }), { clientX: 10, clientY: 10 });
        fireEvent.click(screen.getByRole('menuitem', { name: 'Renomear coluna' }));
        const input = screen.getByRole('textbox', { name: 'Renomear coluna' });
        fireEvent.change(input, { target: { value: 'Backlog' } });
        fireEvent.submit(input.closest('form') as HTMLFormElement);
        expect(onColumnRename).toHaveBeenCalledWith('todo', 'Backlog');
    });

    it('só o evento passado liga o item de menu dele', () => {
        render(<SarakKanbanImpl columns={columns} onColumnDelete={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Opções da coluna Done' }), { clientX: 1, clientY: 1 });
        expect(screen.getByRole('menuitem', { name: 'Excluir coluna' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Renomear coluna' })).toBeNull();
    });
});
