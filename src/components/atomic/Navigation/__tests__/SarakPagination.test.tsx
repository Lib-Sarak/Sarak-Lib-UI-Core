import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakPagination, buildPaginationRange } from '../SarakPagination';

describe('Spec 14 — buildPaginationRange (cortes precisos)', () => {
    it('sem reticências quando total ≤ maxVisible', () => {
        expect(buildPaginationRange(1, 5, 7)).toEqual([1, 2, 3, 4, 5]);
    });

    it('compacta o miolo com reticências no centro', () => {
        expect(buildPaginationRange(5, 10, 7)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    });

    it('início: reticências só à direita', () => {
        expect(buildPaginationRange(1, 10, 7)).toEqual([1, 2, 'ellipsis', 10]);
    });

    it('fim: reticências só à esquerda', () => {
        expect(buildPaginationRange(10, 10, 7)).toEqual([1, 'ellipsis', 9, 10]);
    });

    it('total zero devolve lista vazia', () => {
        expect(buildPaginationRange(1, 0)).toEqual([]);
    });
});

describe('Spec 14 — SarakPagination', () => {
    it('renderiza reticências (…) ao exceder maxVisible', () => {
        render(<SarakPagination current={5} total={20} onChange={() => {}} />);
        expect(screen.getAllByText('…').length).toBeGreaterThan(0);
    });

    it('clicar numa página dispara onChange', () => {
        const onChange = vi.fn();
        render(<SarakPagination current={1} total={5} onChange={onChange} />);
        fireEvent.click(screen.getByText('3'));
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it('não dispara onChange ao clicar na página atual', () => {
        const onChange = vi.fn();
        render(<SarakPagination current={3} total={5} onChange={onChange} />);
        fireEvent.click(screen.getByText('3'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('o botão anterior fica desabilitado na primeira página', () => {
        render(<SarakPagination current={1} total={5} onChange={() => {}} />);
        expect(screen.getByLabelText('Página anterior')).toBeDisabled();
    });
});
