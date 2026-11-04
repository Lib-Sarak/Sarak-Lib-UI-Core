import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PreviewToolbar } from '../PreviewToolbar';

const createProps = (overrides: Partial<React.ComponentProps<typeof PreviewToolbar>> = {}): React.ComponentProps<typeof PreviewToolbar> => ({
    previewDevice: 'desktop',
    setPreviewDevice: vi.fn(),
    mode: 'dark',
    onModeChange: vi.fn(),
    activePreviewApp: 'dashboard',
    selectPreviewApp: vi.fn(),
    ...overrides
});

describe('PreviewToolbar — espiada', () => {
    it('avisa que é só uma prévia enquanto espia, e volta à dica ao sair', () => {
        const { rerender } = render(<PreviewToolbar {...createProps({ isPeeking: true })} />);
        expect(screen.getByRole('status')).toHaveTextContent('Prévia: nada foi gravado');

        rerender(<PreviewToolbar {...createProps({ isPeeking: false })} />);
        expect(screen.queryByRole('status')).toBeNull();
        expect(screen.getByText(/Passe o mouse numa opção/)).toBeInTheDocument();
    });
});

describe('PreviewToolbar — dispositivo, modo e tela', () => {
    it('expõe os três dispositivos e encaminha a troca ao estado do preview', async () => {
        const user = userEvent.setup();
        const setPreviewDevice = vi.fn();
        render(<PreviewToolbar {...createProps({ setPreviewDevice })} />);

        await user.click(screen.getByRole('button', { name: 'Tablet' }));

        expect(screen.getByRole('group', { name: 'Dispositivo do preview' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true');
        expect(setPreviewDevice).toHaveBeenCalledWith('tablet');
    });

    it('troca o modo claro/escuro pela barra e marca o que está valendo', async () => {
        const user = userEvent.setup();
        const onModeChange = vi.fn();
        render(<PreviewToolbar {...createProps({ mode: 'dark', onModeChange })} />);

        const group = screen.getByRole('group', { name: 'Modo de cor da prévia' });
        expect(group).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Escuro' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'false');

        await user.click(screen.getByRole('button', { name: 'Claro' }));
        expect(onModeChange).toHaveBeenCalledWith('light');
    });

    it('escolhe a tela de amostra por uma lista que traz as 6 principais, as adicionais e "Mais telas"', async () => {
        const user = userEvent.setup();
        const selectPreviewApp = vi.fn();
        render(<PreviewToolbar {...createProps({ selectPreviewApp })} />);

        const select = screen.getByRole('combobox', { name: 'Tela de amostra' });
        expect(select).toHaveValue('dashboard');
        const labels = Array.from(select.querySelectorAll('option')).map((option) => option.textContent);
        expect(labels).toEqual(expect.arrayContaining(['Painel', 'Formulário', 'Tabela', 'Texto', 'Gráficos', 'Tipografia', 'Matriz', 'Mais telas']));

        await user.selectOptions(select, 'tabela');
        expect(selectPreviewApp).toHaveBeenCalledWith('tabela');
    });

    it('não tem mais o interruptor de empilhar previews: a galeria não abre sobre a prévia', () => {
        render(<PreviewToolbar {...createProps()} />);
        expect(screen.queryByRole('switch', { name: 'Empilhar previews' })).toBeNull();
    });
});
