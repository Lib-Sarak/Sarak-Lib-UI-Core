import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakApprovalQueue, type SarakApprovalItem } from '../SarakApprovalQueue';

const items: SarakApprovalItem[] = [
    { id: 'a', title: 'Cliente Alfa', requester: 'Ana', at: '2026-05-02T10:00:00Z', diff: { fields: [{ label: 'Limite', before: '100', after: '500' }] } },
    { id: 'b', title: 'Cliente Beta', diff: { fields: [{ label: 'Cidade', before: 'Rio', after: 'Recife' }] } },
];

const setup = (props: Partial<React.ComponentProps<typeof SarakApprovalQueue>> = {}) => {
    const handlers = { onApprove: vi.fn(), onReject: vi.fn() };
    render(<SarakApprovalQueue items={items} {...handlers} {...props} />);
    return handlers;
};

describe('SarakApprovalQueue', () => {
    it('mostra quem pediu, a diferença e as ações de cada item', () => {
        setup();

        expect(screen.getByText(/Pedido por Ana/)).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Aprovar' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Rejeitar' })).toHaveLength(2);
    });

    it('aprova um item pelo id', async () => {
        const { onApprove } = setup();
        await userEvent.click(screen.getAllByRole('button', { name: 'Aprovar' })[1]);

        expect(onApprove).toHaveBeenCalledWith(['b']);
    });

    it('rejeitar exige o motivo: sem ele, mostra o erro e não chama o host', async () => {
        const { onReject } = setup();
        await userEvent.click(screen.getAllByRole('button', { name: 'Rejeitar' })[0]);
        await userEvent.click(screen.getByRole('button', { name: 'Confirmar rejeição' }));

        expect(screen.getByText('Informe o motivo.')).toBeInTheDocument();
        expect(onReject).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText('Motivo da rejeição'), '  Fora da política ');
        await userEvent.click(screen.getByRole('button', { name: 'Confirmar rejeição' }));

        expect(onReject).toHaveBeenCalledWith(['a'], 'Fora da política');
        expect(screen.queryByLabelText('Motivo da rejeição')).not.toBeInTheDocument();
    });

    it('cancelar fecha o painel de motivo sem avisar o host', async () => {
        const { onReject } = setup();
        await userEvent.click(screen.getAllByRole('button', { name: 'Rejeitar' })[0]);
        await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByLabelText('Motivo da rejeição')).not.toBeInTheDocument();
        expect(onReject).not.toHaveBeenCalled();
    });

    it('em lote: seleciona todos, aprova os selecionados e limpa a seleção', async () => {
        const { onApprove } = setup();
        await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todos os itens' }));
        await userEvent.click(screen.getByRole('button', { name: 'Aprovar 2 selecionados' }));

        expect(onApprove).toHaveBeenCalledWith(['a', 'b']);
        expect(screen.queryByRole('button', { name: /selecionados/ })).not.toBeInTheDocument();
    });

    it('em lote: rejeita os marcados com um motivo só', async () => {
        const { onReject } = setup();
        await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar Cliente Alfa' }));
        await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar Cliente Beta' }));
        await userEvent.click(screen.getByRole('button', { name: 'Rejeitar 2 selecionados' }));
        await userEvent.type(screen.getByLabelText('Motivo da rejeição'), 'Duplicado');
        await userEvent.click(screen.getByRole('button', { name: /Confirmar rejeição/ }));

        expect(onReject).toHaveBeenCalledWith(['a', 'b'], 'Duplicado');
    });

    it('com o painel de motivo aberto, ocupada trava também "Confirmar rejeição"', async () => {
        const onReject = vi.fn();
        const { rerender } = render(<SarakApprovalQueue items={items} onApprove={vi.fn()} onReject={onReject} />);
        await userEvent.click(screen.getAllByRole('button', { name: 'Rejeitar' })[0]);
        await userEvent.type(screen.getByLabelText('Motivo da rejeição'), 'Duplicado');
        rerender(<SarakApprovalQueue items={items} busy onApprove={vi.fn()} onReject={onReject} />);

        expect(screen.getByRole('button', { name: 'Confirmar rejeição' })).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Confirmar rejeição' }));
        expect(onReject).not.toHaveBeenCalled();
    });

    it('ocupada, trava as ações; vazia, mostra o estado vazio', () => {
        const { unmount } = render(<SarakApprovalQueue items={items} busy onApprove={vi.fn()} onReject={vi.fn()} />);

        screen.getAllByRole('button', { name: 'Aprovar' }).forEach((button) => expect(button).toBeDisabled());
        unmount();
        render(<SarakApprovalQueue items={[]} onApprove={vi.fn()} onReject={vi.fn()} />);
        expect(screen.getByText('Nenhum item aguardando aprovação.')).toBeInTheDocument();
    });
});
