import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakTableCards } from '../SarakTableCards';

const COLUMNS = ['nome', 'ativo'];
const LABELS = { nome: 'Nome', ativo: 'Situação' };
const ROWS = [{ id: 1, nome: 'Ana', ativo: true }, { id: 2, nome: 'Beto', ativo: false }];

describe('SarakTableCards (Spec 40.3 — L3, colapso mobile do denso genérico)', () => {
    it('renderiza 1 card por linha reusando os rótulos das colunas', () => {
        const { container } = render(<SarakTableCards rows={ROWS} columns={COLUMNS} columnLabels={LABELS} />);
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(2);
        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(screen.getAllByText('Nome')).toHaveLength(2); // rótulo repetido por card
    });

    it('exibe valores booleanos sem impor rótulos de domínio', () => {
        render(<SarakTableCards rows={ROWS} columns={COLUMNS} columnLabels={LABELS} />);
        expect(screen.getByText('true')).toBeInTheDocument();
        expect(screen.getByText('false')).toBeInTheDocument();
    });

    it('renderiza colunas semânticas, aplica alinhamento e aciona a linha por clique e teclado', () => {
        const onRowClick = vi.fn();
        const { container } = render(
            <SarakTableCards
                rows={ROWS}
                columns={[{ key: 'nome', label: 'Pessoa', render: (row) => <strong>{row.nome}</strong>, align: 'right' }]}
                columnLabels={{}}
                onRowClick={onRowClick}
            />,
        );

        const value = screen.getByText('Ana');
        const card = value.closest('[role="listitem"]') as HTMLElement;
        expect(value.tagName).toBe('STRONG');
        expect((value.parentElement as HTMLElement).style.textAlign).toBe('right');

        fireEvent.click(value);
        expect(onRowClick).toHaveBeenLastCalledWith(ROWS[0]);
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(onRowClick).toHaveBeenLastCalledWith(ROWS[0]);
        expect(onRowClick).toHaveBeenCalledTimes(2);
    });

    it('em loading mostra cards de esqueleto (sem valor)', () => {
        const onRowClick = vi.fn();
        const { container } = render(<SarakTableCards rows={[]} columns={COLUMNS} columnLabels={LABELS} loading onRowClick={onRowClick} />);
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(3);
        fireEvent.click(screen.getAllByRole('listitem')[0]);
        expect(onRowClick).not.toHaveBeenCalled();
    });

    it('o container não estoura horizontalmente (maxWidth 100%)', () => {
        const { container } = render(<SarakTableCards rows={ROWS} columns={COLUMNS} columnLabels={LABELS} />);
        const list = container.querySelector('[data-sarak-tablecards]') as HTMLElement;
        expect(list.style.maxWidth).toBe('100%');
    });

    it('mantém ordenação, seleção individual e seleção das linhas visíveis', () => {
        const onSort = vi.fn();
        const onToggleRow = vi.fn();
        const onToggleAll = vi.fn();
        render(
            <SarakTableCards
                rows={ROWS}
                columns={COLUMNS}
                columnLabels={LABELS}
                selectable
                selectedKeys={new Set([1])}
                partiallySelected
                sortableColumns={COLUMNS}
                onSort={onSort}
                onToggleRow={onToggleRow}
                onToggleAll={onToggleAll}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por nome' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 2' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));

        expect(onSort).toHaveBeenCalledWith('nome');
        expect(onToggleRow).toHaveBeenCalledWith(2, true);
        expect(onToggleAll).toHaveBeenCalledWith(true);
    });
});
