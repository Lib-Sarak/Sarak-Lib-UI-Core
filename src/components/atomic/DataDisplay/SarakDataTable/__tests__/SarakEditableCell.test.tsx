import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakColumn } from '../columnModel';
import { SarakEditableCell } from '../SarakEditableCell';

interface Row {
    name: string;
}

const ROW: Row = { name: 'Ana' };
const COLUMN: SarakColumn<Row> = { id: 'name', header: 'Nome', editable: true, validate: (value) => (value ? undefined : 'Obrigatório') };

const setup = (onCellEdit = vi.fn()) => {
    render(<SarakEditableCell row={ROW} column={COLUMN} onCellEdit={onCellEdit}>Ana</SarakEditableCell>);
    return onCellEdit;
};
const view = (): HTMLElement => screen.getByRole('button', { name: 'Editar Nome: Ana' });
const input = (): HTMLInputElement => screen.getByRole('textbox', { name: 'Nome' });
const open = (): void => { fireEvent.keyDown(view(), { key: 'Enter' }); };
const type = (value: string): void => { fireEvent.change(input(), { target: { value } }); };

describe('SarakEditableCell', () => {
    it('Enter abre, Enter confirma e o foco volta à célula', async () => {
        const onCellEdit = setup();
        open();
        type('Bia');
        fireEvent.keyDown(input(), { key: 'Enter' });
        await waitFor(() => expect(view()).toHaveFocus());
        expect(onCellEdit).toHaveBeenCalledWith(ROW, COLUMN, 'Bia');
    });

    it('clique e F2 também abrem', () => {
        setup();
        fireEvent.click(view());
        expect(input()).toHaveValue('Ana');
        fireEvent.keyDown(input(), { key: 'Escape' });
        fireEvent.keyDown(view(), { key: 'F2' });
        expect(input()).toBeInTheDocument();
    });

    it('Esc cancela sem salvar, mesmo com o blur que a saída dispara', async () => {
        const onCellEdit = setup();
        open();
        type('Bia');
        const field = input();
        fireEvent.keyDown(field, { key: 'Escape' });
        fireEvent.blur(field);
        await waitFor(() => expect(view()).toHaveFocus());
        expect(onCellEdit).not.toHaveBeenCalled();
    });

    it('sair do campo confirma', async () => {
        const onCellEdit = setup();
        open();
        type('Bia');
        fireEvent.blur(input());
        await waitFor(() => expect(onCellEdit).toHaveBeenCalledTimes(1));
    });

    it('sem mudança, fecha sem salvar', async () => {
        const onCellEdit = setup();
        open();
        fireEvent.keyDown(input(), { key: 'Enter' });
        await waitFor(() => expect(view()).toBeInTheDocument());
        expect(onCellEdit).not.toHaveBeenCalled();
    });

    it('validação mostra o erro na célula e não salva', async () => {
        const onCellEdit = setup();
        open();
        type('');
        fireEvent.keyDown(input(), { key: 'Enter' });
        await screen.findByText('Obrigatório');
        expect(input()).toHaveAttribute('aria-invalid', 'true');
        expect(onCellEdit).not.toHaveBeenCalled();
    });

    it('enquanto salva, o campo fica só leitura e um segundo Enter não salva de novo', async () => {
        let finish: () => void = () => undefined;
        const onCellEdit = setup(vi.fn(() => new Promise<void>((resolve) => { finish = resolve; })));
        open();
        type('Bia');
        fireEvent.keyDown(input(), { key: 'Enter' });
        await waitFor(() => expect(input()).toHaveAttribute('readonly'));
        expect(screen.getByRole('status')).toHaveTextContent('Salvando');
        fireEvent.keyDown(input(), { key: 'Enter' });
        expect(onCellEdit).toHaveBeenCalledTimes(1);
        await act(async () => finish());
        expect(view()).toBeInTheDocument();
    });

    it('falha ao salvar mantém o campo aberto com a mensagem, e dá para tentar de novo', async () => {
        const onCellEdit = setup(vi.fn().mockRejectedValueOnce(new Error('Sem permissão')).mockRejectedValueOnce(new TypeError('Cannot read properties of undefined')));
        open();
        type('Bia');
        fireEvent.keyDown(input(), { key: 'Enter' });
        await screen.findByText('Sem permissão');
        fireEvent.keyDown(input(), { key: 'Enter' });
        await screen.findByText('Não foi possível salvar.');
        expect(onCellEdit).toHaveBeenCalledTimes(2);
    });
});
