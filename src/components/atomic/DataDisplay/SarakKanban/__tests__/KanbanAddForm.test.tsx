import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KanbanAddForm } from '../KanbanAddForm';

const mount = (onSubmit = vi.fn()) => {
    render(<KanbanAddForm formKind="card" placeholder="Novo cartão" submitLabel="Adicionar cartão" onSubmit={onSubmit} />);
    return { onSubmit, input: screen.getByRole('textbox', { name: 'Novo cartão' }) as HTMLInputElement };
};

describe('KanbanAddForm', () => {
    it('envia o título sem espaços nas pontas e limpa o campo', () => {
        const { onSubmit, input } = mount();
        fireEvent.change(input, { target: { value: '  Revisar PR ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar cartão' }));
        expect(onSubmit).toHaveBeenCalledWith('Revisar PR');
        expect(input.value).toBe('');
    });

    it('título vazio ou só espaços não dispara nada', () => {
        const { onSubmit, input } = mount();
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar cartão' }));
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.submit(input.closest('form') as HTMLFormElement);
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
