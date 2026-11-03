import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakAuditLog, type SarakAuditEntry } from '../SarakAuditLog';

vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (index: number) => number }) => {
        const sizes = Array.from({ length: count }, (_, index) => estimateSize(index));
        const starts = sizes.map((_, index) => sizes.slice(0, index).reduce((total, size) => total + size, 0));
        return {
            getTotalSize: () => sizes.reduce((total, size) => total + size, 0),
            getVirtualItems: () => Array.from({ length: count }, (_, index) => ({ index, key: index, start: starts[index], size: sizes[index] })),
            measureElement: vi.fn(),
        };
    },
}));

// A tabela é carregada sob demanda: com a máquina ocupada, o primeiro import passa de 1 s.
const LAZY_LOAD = { timeout: 8000 };

const entries: SarakAuditEntry[] = [
    { id: '1', actor: 'ana', action: 'login', target: 'Sessão 8', at: '2026-05-02T10:00:00Z', detail: <p>IP 10.0.0.1</p> },
    { id: '2', actor: 'beto', action: 'excluir', target: 'Pedido 12', at: '2026-05-01T09:30:00Z' },
];

describe('SarakAuditLog', () => {
    it('mostra ator, ação, alvo e data de cada registro', async () => {
        render(<SarakAuditLog entries={entries} />);

        expect(await screen.findByText('Pedido 12', {}, LAZY_LOAD)).toBeInTheDocument();
        ['Quem', 'Ação', 'Alvo', 'Quando'].forEach((header) => expect(screen.getByText(header)).toBeInTheDocument());
        expect(screen.getByText('ana')).toBeInTheDocument();
        expect(screen.getByText('excluir')).toBeInTheDocument();
        expect(document.querySelectorAll('time')).toHaveLength(2);
    });

    it('data inválida não derruba o visor: a linha aparece sem dateTime e as outras seguem', async () => {
        const broken: SarakAuditEntry[] = [{ id: '9', actor: 'caio', action: 'editar', target: 'Item 9', at: 'ontem à noite' }, ...entries];
        render(<SarakAuditLog entries={broken} />);

        expect(await screen.findByText('Item 9', {}, LAZY_LOAD)).toBeInTheDocument();
        expect(screen.getByText('Pedido 12')).toBeInTheDocument();
        const times = document.querySelectorAll('time');
        expect(times).toHaveLength(3);
        expect(times[0]).not.toHaveAttribute('datetime');
        expect(times[1]).toHaveAttribute('datetime');
    });

    it('sem registros, mostra o texto de vazio', async () => {
        render(<SarakAuditLog entries={[]} />);

        expect(await screen.findByText('Nenhum registro de auditoria.', {}, LAZY_LOAD)).toBeInTheDocument();
    });

    it('o detalhe expande pela linha que o tem', async () => {
        render(<SarakAuditLog entries={entries} />);
        await screen.findByText('Pedido 12', {}, LAZY_LOAD);
        await userEvent.click(screen.getAllByRole('button', { name: 'Expandir linha' })[0]);

        expect(screen.getByText('IP 10.0.0.1')).toBeInTheDocument();
    });

    it('sem onFiltersChange, não há campo de filtro', async () => {
        render(<SarakAuditLog entries={entries} />);
        await screen.findByText('Pedido 12', {}, LAZY_LOAD);

        expect(screen.queryByLabelText('Buscar na auditoria')).not.toBeInTheDocument();
    });

    it('os filtros saem por props: busca e seletores devolvem o filtro completo', async () => {
        const onFiltersChange = vi.fn();
        render(<SarakAuditLog entries={entries} filters={{ actor: 'ana' }} onFiltersChange={onFiltersChange} actors={['ana', 'beto']} actions={['login', 'excluir']} />);
        await screen.findByText('Pedido 12', {}, LAZY_LOAD);
        await userEvent.type(screen.getByLabelText('Buscar na auditoria'), 'x');
        await userEvent.selectOptions(screen.getByLabelText('Filtrar por ação'), 'excluir');

        expect(onFiltersChange).toHaveBeenNthCalledWith(1, { actor: 'ana', query: 'x' });
        expect(onFiltersChange).toHaveBeenNthCalledWith(2, { actor: 'ana', action: 'excluir' });
        expect(screen.getByLabelText('Filtrar por ator')).toHaveValue('ana');
    });

    it('a paginação é do servidor: só aparece com mais de uma página e devolve a escolhida', async () => {
        const onPageChange = vi.fn();
        const { rerender } = render(<SarakAuditLog entries={entries} page={1} pageSize={2} totalItems={2} onPageChange={onPageChange} />);
        await screen.findByText('Pedido 12', {}, LAZY_LOAD);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

        rerender(<SarakAuditLog entries={entries} page={1} pageSize={2} totalItems={6} onPageChange={onPageChange} />);
        await userEvent.click(screen.getByRole('button', { name: /^2$|Página 2|2/ }));

        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
