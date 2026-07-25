import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

    it('booleano vira Ativo/Inativo (paridade com a tabela)', () => {
        render(<SarakTableCards rows={ROWS} columns={COLUMNS} columnLabels={LABELS} />);
        expect(screen.getByText('Ativo')).toBeInTheDocument();
        expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('em loading mostra cards de esqueleto (sem valor)', () => {
        const { container } = render(<SarakTableCards rows={[]} columns={COLUMNS} columnLabels={LABELS} loading />);
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(3);
    });

    it('o container não estoura horizontalmente (maxWidth 100%)', () => {
        const { container } = render(<SarakTableCards rows={ROWS} columns={COLUMNS} columnLabels={LABELS} />);
        const list = container.querySelector('[data-sarak-tablecards]') as HTMLElement;
        expect(list.style.maxWidth).toBe('100%');
    });
});
