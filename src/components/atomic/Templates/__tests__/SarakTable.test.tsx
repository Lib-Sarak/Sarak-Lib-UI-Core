import { afterEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import * as ComponentModule from '../SarakTable';

const tableState = vi.hoisted(() => ({
    data: [{ id: 1, nome: 'Beto', active: true }, { id: 2, nome: 'Ana', active: false }] as Array<Record<string, unknown>>,
    filteredData: [{ id: 1, nome: 'Beto', active: true }, { id: 2, nome: 'Ana', active: false }] as Array<Record<string, unknown>>,
    loading: false,
    error: null as string | null,
    search: '',
    setSearch: vi.fn(),
    loadData: vi.fn(),
}));

// Isola o denso da rede — mesmo idioma de SarakTable.responsive.test.tsx.
vi.mock('../hooks/useSarakTableData', () => ({
    useSarakTableData: () => tableState,
}));

import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

afterEach(() => {
    tableState.data = [{ id: 1, nome: 'Beto', active: true }, { id: 2, nome: 'Ana', active: false }];
    tableState.filteredData = tableState.data;
    tableState.loading = false;
    tableState.error = null;
    tableState.search = '';
    tableState.setSearch.mockClear();
    tableState.loadData.mockClear();
});

describe('SarakTable — superfície', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
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
});

describe('SarakTable — ordenação local', () => {
    it('ordena localmente em crescente, decrescente e sem ordenação', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakTable mapping={{ nome: 'Nome', active: 'Flag' }} />
            </SarakUIProvider>,
        );
        const readNames = (): Array<string | null> => Array.from(container.querySelectorAll('tbody tr td:first-child'))
            .map((cell) => cell.textContent);
        const sortButton = screen.getByRole('button', { name: 'Ordenar por nome' });

        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Ana', 'Beto']);
        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Beto', 'Ana']);
        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Beto', 'Ana']);
    });
});

describe('SarakTable — ordenação controlada e seleção', () => {
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

describe('SarakTable — célula e clique de linha', () => {
    it('renderiza a célula customizada, aplica alinhamento e encaminha o clique da linha', () => {
        const onRowClick = vi.fn();
        const { container } = render(
            <SarakUIProvider>
                <SarakTable
                    columns={[
                        { key: 'nome', label: 'Pessoa', render: (row) => <strong>{String(row.nome)}</strong>, align: 'right' },
                    ]}
                    onRowClick={onRowClick}
                    showSearch={false}
                    showRefresh={false}
                />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Beto').tagName).toBe('STRONG');
        expect((container.querySelector('tbody td') as HTMLElement).style.textAlign).toBe('right');
        fireEvent.click(container.querySelector('tbody tr') as HTMLElement);
        expect(onRowClick).toHaveBeenCalledWith(tableState.filteredData[0]);
    });
});

describe('SarakTable — estados de leitura', () => {
    it('mostra os estados carregando, vazio e erro com nova tentativa', () => {
        const loading = render(<SarakUIProvider><SarakTable loading /></SarakUIProvider>);
        expect(screen.getByRole('status')).toHaveTextContent('Carregando');
        loading.unmount();

        tableState.loading = false;
        tableState.data = [];
        tableState.filteredData = [];
        const empty = render(<SarakUIProvider><SarakTable /></SarakUIProvider>);
        expect(screen.getByText('Nenhum dado encontrado.')).toBeInTheDocument();
        empty.unmount();

        tableState.data = [{ id: 1, nome: 'Beto', active: true }];
        tableState.filteredData = tableState.data;
        const onRetry = vi.fn();
        render(<SarakUIProvider><SarakTable error="Indisponível" onRetry={onRetry} /></SarakUIProvider>);
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
