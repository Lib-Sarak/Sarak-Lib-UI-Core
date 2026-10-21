import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakPagination, sarakBuildPaginationRange } from '../SarakPagination';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('Spec 14 — buildPaginationRange (cortes precisos)', () => {
    it('sem reticências quando total ≤ maxVisible', () => {
        expect(sarakBuildPaginationRange(1, 5, 7)).toEqual([1, 2, 3, 4, 5]);
    });

    it('compacta o miolo com reticências no centro', () => {
        expect(sarakBuildPaginationRange(5, 10, 7)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    });

    it('início: reticências só à direita', () => {
        expect(sarakBuildPaginationRange(1, 10, 7)).toEqual([1, 2, 'ellipsis', 10]);
    });

    it('fim: reticências só à esquerda', () => {
        expect(sarakBuildPaginationRange(10, 10, 7)).toEqual([1, 'ellipsis', 9, 10]);
    });

    it('total zero devolve lista vazia', () => {
        expect(sarakBuildPaginationRange(1, 0)).toEqual([]);
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

describe('Spec 97 — SarakPagination: tamanho e resumo', () => {
    it('muda o tamanho da página e mostra o intervalo e a página atual', () => {
        const onPageSizeChange = vi.fn();
        render(
            <SarakPagination
                current={2}
                pageSize={10}
                pageSizeOptions={[10, 20]}
                totalItems={95}
                onPageSizeChange={onPageSizeChange}
                onChange={() => {}}
            />,
        );

        expect(screen.getByText('11–20 de 95 · Página 2 de 10')).toBeInTheDocument();
        fireEvent.click(within(screen.getByRole('group', { name: 'Itens por página' })).getByRole('button', { name: '20' }));
        expect(onPageSizeChange).toHaveBeenCalledWith(20);
    });
});

// os textos da própria lib seguem o idioma que vale (R34: sem Provider, sai em português).
describe('SarakPagination — idioma que vale', () => {
    it('sem Provider, os rótulos saem em português', () => {
        render(<SarakPagination current={2} total={5} onChange={() => {}} />);
        expect(screen.getByLabelText('Paginação')).toBeInTheDocument();
        expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
        expect(screen.getByLabelText('Próxima página')).toBeInTheDocument();
    });

    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakPagination current={2} total={5} onChange={() => {}} />
            </SarakUIProvider>,
        );
        expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
        expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
        expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('traduz os resumos para o idioma selecionado', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakPagination current={2} total={10} pageSize={10} totalItems={95} onChange={() => {}} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('11–20 of 95 · Page 2 of 10')).toBeInTheDocument();
    });
});
