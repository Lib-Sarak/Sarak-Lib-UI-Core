import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakChecklist } from '../SarakChecklist';

const items = [
    { id: 'a', label: 'Escrever teste', done: true },
    { id: 'b', label: 'Subir tela', done: false },
    { id: 'c', label: 'Revisar PR', done: false },
];

describe('SarakChecklist', () => {
    it('renderiza os itens com o estado marcado e um nome acessível traduzido', () => {
        render(<SarakChecklist items={items} onToggle={vi.fn()} />);
        expect(screen.getByRole('region', { name: 'Lista de verificação' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /Escrever teste/ })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: /Subir tela/ })).not.toBeChecked();
    });

    it('o rótulo passado vence o traduzido', () => {
        render(<SarakChecklist items={items} onToggle={vi.fn()} label="Subtarefas" />);
        expect(screen.getByRole('region', { name: 'Subtarefas' })).toBeInTheDocument();
    });

    it('marcar e desmarcar disparam onToggle com o id e o novo estado', () => {
        const onToggle = vi.fn();
        render(<SarakChecklist items={items} onToggle={onToggle} />);
        fireEvent.click(screen.getByRole('checkbox', { name: /Subir tela/ }));
        fireEvent.click(screen.getByRole('checkbox', { name: /Escrever teste/ }));
        expect(onToggle).toHaveBeenNthCalledWith(1, 'b', true);
        expect(onToggle).toHaveBeenNthCalledWith(2, 'a', false);
    });

    it('teclado: Tab chega ao item e Espaço o alterna', async () => {
        const onToggle = vi.fn();
        const user = userEvent.setup();
        render(<SarakChecklist items={items} onToggle={onToggle} />);
        await user.tab();
        expect(screen.getByRole('checkbox', { name: /Escrever teste/ })).toHaveFocus();
        await user.keyboard(' ');
        expect(onToggle).toHaveBeenCalledWith('a', false);
    });

    it('progresso: feitos de total na barra de progresso, só com showProgress', () => {
        const { rerender } = render(<SarakChecklist items={items} onToggle={vi.fn()} />);
        expect(screen.queryByRole('progressbar')).toBeNull();

        rerender(<SarakChecklist items={items} onToggle={vi.fn()} showProgress />);
        const bar = screen.getByRole('progressbar', { name: '1 de 3' });
        expect(bar).toHaveAttribute('aria-valuenow', '1');
        expect(bar).toHaveAttribute('aria-valuemax', '3');
        expect(screen.getAllByText('1 de 3').length).toBeGreaterThan(0);
    });

    it('progresso sem itens não divide por zero', () => {
        render(<SarakChecklist items={[]} onToggle={vi.fn()} showProgress />);
        const bar = screen.getByRole('progressbar', { name: '0 de 0' });
        expect(bar).toHaveAttribute('aria-valuenow', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '1');
    });

    it('estado vazio traduzido', () => {
        render(<SarakChecklist items={[]} onToggle={vi.fn()} />);
        expect(screen.getByText('Nenhum item')).toBeInTheDocument();
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('sem onAdd não há campo; com onAdd, o título sai sem espaços nas pontas e vazio é ignorado', () => {
        const { rerender } = render(<SarakChecklist items={items} onToggle={vi.fn()} />);
        expect(document.querySelector('[data-checklist-add]')).toBeNull();

        const onAdd = vi.fn();
        rerender(<SarakChecklist items={items} onToggle={vi.fn()} onAdd={onAdd} />);
        const input = screen.getByRole('textbox', { name: 'Novo item' }) as HTMLInputElement;
        fireEvent.submit(input.closest('form') as HTMLFormElement);
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.submit(input.closest('form') as HTMLFormElement);
        expect(onAdd).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: '  Deploy ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar item' }));
        expect(onAdd).toHaveBeenCalledWith('Deploy');
        expect(input.value).toBe('');
    });

    it('sem onRemove não há botão; com onRemove, cada item tem o seu e dispara com o id', () => {
        const { rerender } = render(<SarakChecklist items={items} onToggle={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /Remover item/ })).toBeNull();

        const onRemove = vi.fn();
        rerender(<SarakChecklist items={items} onToggle={vi.fn()} onRemove={onRemove} />);
        const row = document.querySelector('[data-checklist-item="b"]') as HTMLElement;
        fireEvent.click(within(row).getByRole('button', { name: 'Remover item Subir tela' }));
        expect(onRemove).toHaveBeenCalledWith('b');
        expect(within(row).getByRole('button').querySelector('svg')).not.toBeNull();
    });
});
