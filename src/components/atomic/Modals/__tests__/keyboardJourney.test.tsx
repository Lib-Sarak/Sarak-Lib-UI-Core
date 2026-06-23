import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SarakModal } from '../SarakModal';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

/**
 * E2E de acessibilidade (Spec 41) — jornada COMPLETA só com teclado:
 * abrir o modal → preencher o form → submeter, e devolução de foco ao fechar.
 */
const Journey: React.FC<{ onSubmit: (value: string) => void }> = ({ onSubmit }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    return (
        <SarakUIProvider>
            <button onClick={() => setOpen(true)}>Abrir</button>
            <SarakModal
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Cadastro"
                footer={<button onClick={() => onSubmit(value)}>Enviar</button>}
            >
                <input aria-label="Nome" value={value} onChange={(e) => setValue(e.target.value)} />
            </SarakModal>
        </SarakUIProvider>
    );
};

describe('Jornada só-teclado (Spec 41 — E2E)', () => {
    it('abre o modal, preenche e submete o formulário usando apenas o teclado', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<Journey onSubmit={onSubmit} />);

        // Foca o gatilho e o ativa por teclado → abre o modal.
        const trigger = screen.getByText('Abrir');
        trigger.focus();
        await user.keyboard('{Enter}');

        // Ao abrir, o foco entrou no modal (focus trap).
        const dialog = await screen.findByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);

        // Preenche o campo, Tab até o botão e submete — tudo por teclado.
        const input = screen.getByLabelText('Nome');
        await user.type(input, 'Joao');
        expect(input).toHaveValue('Joao');

        await user.tab();
        expect(screen.getByText('Enviar')).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(onSubmit).toHaveBeenCalledWith('Joao');
    });

    it('fecha no ESC e devolve o foco ao gatilho (restauração)', async () => {
        const user = userEvent.setup();
        render(<Journey onSubmit={vi.fn()} />);

        const trigger = screen.getByText('Abrir');
        trigger.focus();
        await user.keyboard('{Enter}');
        expect(await screen.findByRole('dialog')).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(trigger).toHaveFocus();
    });
});
