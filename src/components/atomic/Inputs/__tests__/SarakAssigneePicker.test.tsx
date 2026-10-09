import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakAssigneePicker } from '../SarakAssigneePicker';

const people = [
    { id: 'p1', name: 'Ana Souza' },
    { id: 'p2', name: 'Bruno Lima' },
    { id: 'p3', name: 'Carla Dias' },
];

describe('SarakAssigneePicker', () => {
    it('mostra a pessoa escolhida (avatar com iniciais e nome) e o rótulo traduzido', () => {
        render(<SarakAssigneePicker people={people} value="p2" onChange={vi.fn()} />);
        const selected = document.querySelector('[data-assignee-selected="p2"]') as HTMLElement;
        expect(selected).toHaveTextContent('Bruno Lima');
        expect(selected).toHaveTextContent('BL');
        expect(screen.getByText('Responsável')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveAttribute('placeholder', 'Buscar pessoa');
    });

    it('sem valor, ou com id desconhecido, ninguém aparece como escolhido', () => {
        const { rerender } = render(<SarakAssigneePicker people={people} onChange={vi.fn()} />);
        expect(document.querySelector('[data-assignee-selected]')).toBeNull();
        rerender(<SarakAssigneePicker people={people} value="zz" onChange={vi.fn()} />);
        expect(document.querySelector('[data-assignee-selected]')).toBeNull();
        rerender(<SarakAssigneePicker people={people} value={null} onChange={vi.fn()} />);
        expect(document.querySelector('[data-assignee-selected]')).toBeNull();
    });

    it('mouse: digitar filtra pelo nome e clicar na opção dispara onChange com o id; a busca é limpa', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<SarakAssigneePicker people={people} onChange={onChange} />);
        const box = screen.getByRole('combobox') as HTMLInputElement;
        await user.type(box, 'car');
        expect(screen.queryByRole('option', { name: 'Ana Souza' })).toBeNull();
        await user.click(await screen.findByRole('option', { name: 'Carla Dias' }));
        expect(onChange).toHaveBeenCalledWith('p3');
        expect(box.value).toBe('');
    });

    it('teclado: digitar, seta para baixo e Enter escolhem a pessoa', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<SarakAssigneePicker people={people} onChange={onChange} />);
        await user.type(screen.getByRole('combobox'), 'bru');
        await screen.findByRole('option', { name: 'Bruno Lima' });
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onChange).toHaveBeenCalledWith('p2');
    });

    it('clearable: o botão remove o responsável (onChange(null)) e o nome acessível cita a pessoa; sem a prop, não há botão', () => {
        const onChange = vi.fn();
        const { rerender } = render(<SarakAssigneePicker people={people} value="p1" onChange={onChange} />);
        expect(screen.queryByRole('button', { name: /Remover responsável/ })).toBeNull();

        rerender(<SarakAssigneePicker people={people} value="p1" onChange={onChange} clearable />);
        const button = screen.getByRole('button', { name: 'Remover responsável Ana Souza' });
        expect(button.querySelector('svg')).not.toBeNull();
        fireEvent.click(button);
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('estado vazio: sem pessoas não há campo de busca', () => {
        render(<SarakAssigneePicker people={[]} onChange={vi.fn()} />);
        expect(screen.getByText('Nenhuma pessoa disponível')).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).toBeNull();
    });

    it('disabled trava a busca (somente leitura e aria-disabled) e desabilita o botão de remover; o rótulo passado vence', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<SarakAssigneePicker people={people} value="p1" onChange={onChange} clearable disabled label="Dono" />);
        const box = screen.getByRole('combobox', { name: 'Dono' });
        expect(box).toHaveAttribute('readonly');
        expect(box).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('button', { name: 'Remover responsável Ana Souza' })).toBeDisabled();

        await user.type(box, 'bru');
        expect(screen.queryByRole('option')).toBeNull();
        expect(onChange).not.toHaveBeenCalled();
    });
});
