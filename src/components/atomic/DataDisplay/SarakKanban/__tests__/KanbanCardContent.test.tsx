import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KanbanCardContent } from '../KanbanCardContent';

describe('KanbanCardContent — cartão padrão', () => {
    beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 8, 12, 0)); });
    afterEach(() => { vi.useRealTimers(); });

    it('mostra só o id como título quando nada mais veio', () => {
        const { container } = render(<KanbanCardContent card={{ id: 'k1' }} />);
        expect(screen.getByText('k1')).toBeInTheDocument();
        expect(container.querySelector('img, [data-overdue]')).toBeNull();
    });

    it('código, título e descrição', () => {
        render(<KanbanCardContent card={{ id: 'k1', code: 'PRJ-12', title: 'Subir tela', description: 'Detalhe' }} />);
        expect(screen.getByText('PRJ-12')).toBeInTheDocument();
        expect(screen.getByText('Subir tela')).toBeInTheDocument();
        expect(screen.getByText('Detalhe')).toBeInTheDocument();
    });

    it('responsável: avatar com o nome (iniciais sem foto)', () => {
        render(<KanbanCardContent card={{ id: 'k1', assignee: { name: 'Ana Souza' } }} />);
        expect(screen.getByText('AS')).toBeInTheDocument();
    });

    it('prioridade: baixa, alta e urgente aparecem; a média NÃO', () => {
        const { rerender } = render(<KanbanCardContent card={{ id: 'k1', priority: 'low' }} />);
        expect(screen.getByText('Baixa')).toBeInTheDocument();
        rerender(<KanbanCardContent card={{ id: 'k1', priority: 'high' }} />);
        expect(screen.getByText('Alta')).toBeInTheDocument();
        rerender(<KanbanCardContent card={{ id: 'k1', priority: 'urgent' }} />);
        expect(screen.getByText('Urgente')).toBeInTheDocument();
        rerender(<KanbanCardContent card={{ id: 'k1', priority: 'medium' }} />);
        expect(screen.queryByText(/Baixa|Alta|Urgente|Média/)).toBeNull();
    });

    it('prazo futuro ou de hoje é normal; vencido sai marcado e pela cor de erro', () => {
        const { rerender } = render(<KanbanCardContent card={{ id: 'k1', dueDate: '2026-10-08' }} />);
        expect(screen.getByText(/^Prazo /)).not.toHaveAttribute('data-overdue');

        rerender(<KanbanCardContent card={{ id: 'k1', dueDate: '2026-10-07' }} />);
        const overdue = screen.getByText(/^Atrasado: /);
        expect(overdue).toHaveAttribute('data-overdue', 'true');
        expect(overdue.getAttribute('style')).toContain('--sarak-status-error-color');
    });

    it('contador de subtarefas feitas/total, com nome acessível', () => {
        render(<KanbanCardContent card={{ id: 'k1', subtasks: { done: 2, total: 5 } }} />);
        expect(screen.getByLabelText('2 de 5 subtarefas')).toHaveTextContent('2/5');
    });

    it('sem subtarefas (total 0) não mostra contador', () => {
        const { container } = render(<KanbanCardContent card={{ id: 'k1', subtasks: { done: 0, total: 0 } }} />);
        expect(container.textContent).toBe('k1');
    });
});
