import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import * as ComponentModule from '../SarakTable';

// Isola o denso da rede — mesmo idioma de SarakTable.responsive.test.tsx.
vi.mock('../hooks/useSarakTableData', () => ({
    useSarakTableData: () => ({
        data: [
            { id: 1, nome: 'Beto', active: true },
            { id: 2, nome: 'Ana', active: false },
        ],
        filteredData: [
            { id: 1, nome: 'Beto', active: true },
            { id: 2, nome: 'Ana', active: false },
        ],
        loading: false,
        error: null,
        search: '',
        setSearch: () => undefined,
        fetchData: () => undefined,
    }),
}));

import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakTable', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `headerLayout` usa classe `@min-[…]` (container query), que só ativa
    // com um ancestral `container-type`. jsdom não avalia container query — prova só
    // que a raiz PLANTA `@container` (a query casar é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do cabeçalho responsivo', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakTable mapping={{ nome: 'Nome' }} />
            </SarakUIProvider>
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });

    it('ordena localmente em crescente, decrescente e sem ordenação', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakTable mapping={{ nome: 'Nome', active: 'Flag' }} />
            </SarakUIProvider>,
        );
        const readNames = () => Array.from(container.querySelectorAll('tbody tr td:first-child'))
            .map((cell) => cell.textContent);
        const sortButton = screen.getByRole('button', { name: 'Ordenar por nome' });

        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Ana', 'Beto']);
        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Beto', 'Ana']);
        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Beto', 'Ana']);
    });

    it('delega ordenação controlada e seleciona linha, parcial e todas as visíveis', () => {
        const onSortChange = vi.fn();
        const onSelectionChange = vi.fn();
        render(
            <SarakUIProvider>
                <SarakTable
                    mapping={{ nome: 'Nome', active: 'Flag' }}
                    sort={{ columnId: 'nome', direction: 'asc' }}
                    onSortChange={onSortChange}
                    selectable
                    onSelectionChange={onSelectionChange}
                />
            </SarakUIProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por nome' }));
        expect(onSortChange).toHaveBeenCalledWith({ columnId: 'nome', direction: 'desc' });
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 1' }));
        expect(onSelectionChange).toHaveBeenLastCalledWith([1]);
        expect((screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }) as HTMLInputElement).indeterminate).toBe(true);
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));
        expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2]);
    });
});
