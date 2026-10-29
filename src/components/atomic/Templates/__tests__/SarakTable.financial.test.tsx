import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import type { SarakDeviceType } from '../../../../core/Provider/DeviceProvider';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { sarakDownloadCsv } from '../../DataDisplay/SarakDataTable/tableCsv';
import { SarakTable } from '../SarakTable';
import type { SarakTableProps } from '../SarakTable';
import type { SarakTableColumn } from '../SarakTableProps';

vi.mock('../../DataDisplay/SarakDataTable/tableCsv', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../DataDisplay/SarakDataTable/tableCsv')>()),
    sarakDownloadCsv: vi.fn(),
}));

interface Entry extends Record<string, unknown> {
    id: number;
    name: string;
    amount: number;
    group: string;
}

const BRL = { type: 'currency', currency: 'BRL' } as const;
const entries: Entry[] = [
    { id: 1, name: 'Aluguel', amount: 1000, group: 'Fixas' },
    { id: 2, name: 'Água', amount: 200, group: 'Fixas' },
    { id: 3, name: 'Mercado', amount: 300.5, group: 'Variáveis' },
];
const columns: Array<SarakTableColumn<Entry>> = [
    { key: 'name', label: 'Nome', rowHeader: true },
    { key: 'amount', label: 'Valor', format: BRL, aggregate: 'sum' },
];
const plain = (text: string | null): string => (text ?? '').replace(/\s/g, ' ');

const renderTable = (props: Partial<SarakTableProps<Entry>> = {}, device: SarakDeviceType = 'desktop'): ReturnType<typeof render> =>
    render(
        <SarakUIProvider>
            <SarakDeviceProvider overrideDevice={device}>
                <SarakTable<Entry> data={entries} columns={columns} getRowKey={(row) => row.id} {...props} />
            </SarakDeviceProvider>
        </SarakUIProvider>,
    );
const bodyRows = (container: HTMLElement): HTMLElement[] => Array.from(container.querySelectorAll('tbody tr'));

describe('SarakTable — formato, cabeçalho de linha, colSpan e rodapé', () => {
    it('formata, alinha à direita e usa números tabulares', () => {
        const { container } = renderTable();
        const cell = container.querySelector('tbody tr td:last-child') as HTMLElement;
        expect(plain(cell.textContent)).toBe('R$ 1.000,00');
        expect(cell.style.textAlign).toBe('right');
        expect(cell.style.fontVariantNumeric).toBe('tabular-nums');
    });

    it('rowHeader renderiza th scope="row"', () => {
        const { container } = renderTable();
        const headers = container.querySelectorAll('tbody th[scope="row"]');
        expect(Array.from(headers).map((cell) => cell.textContent)).toEqual(['Aluguel', 'Água', 'Mercado']);
        expect(screen.getAllByRole('rowheader').length).toBeGreaterThanOrEqual(3);
    });

    it('o rodapé é um tfoot com o agregado formatado', () => {
        const { container } = renderTable();
        const footer = container.querySelector('tfoot') as HTMLElement;
        expect(plain(footer.textContent)).toContain('R$ 1.500,50');
    });

    it('sem aggregate nem footer não há tfoot', () => {
        const { container } = renderTable({ columns: columns.map((column) => ({ ...column, aggregate: undefined })) });
        expect(container.querySelector('tfoot')).toBeNull();
    });

    it('footer próprio recebe o valor agregado', () => {
        renderTable({ columns: [columns[0], { ...columns[1], footer: ({ value }) => `Total ${String(value)}` }] });
        expect(screen.getByText('Total 1500.5')).toBeInTheDocument();
    });

    it('colSpan cobre a coluna seguinte e ela some na linha', () => {
        const { container } = renderTable({ columns: [{ ...columns[0], colSpan: (row) => row.id === 2 ? 2 : undefined }, columns[1]] });
        const rows = bodyRows(container);
        expect(rows[1].children).toHaveLength(1);
        expect(rows[1].children[0]).toHaveAttribute('colspan', '2');
        expect(rows[0].children).toHaveLength(2);
    });

    it('sortable:false tira o botão de ordenar; o padrão da Table ordena tudo', () => {
        const { unmount } = renderTable();
        expect(screen.getByRole('button', { name: 'Ordenar por amount' })).toBeInTheDocument();
        unmount();
        renderTable({ columns: [columns[0], { ...columns[1], sortable: false }] });
        expect(screen.queryByRole('button', { name: 'Ordenar por amount' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Ordenar por name' })).toBeInTheDocument();
    });
});

describe('SarakTable — ordem e busca pelo valor certo', () => {
    it('"R$ 200" vem antes de "R$ 1.000" ao ordenar pelo valor bruto', () => {
        const { container } = renderTable();
        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por amount' }));
        expect(bodyRows(container).map((row) => plain(row.lastElementChild?.textContent ?? ''))).toEqual(['R$ 200,00', 'R$ 300,50', 'R$ 1.000,00']);
    });

    it('sortValue ordena por outro campo', () => {
        const { container } = renderTable({ columns: [columns[0], { ...columns[1], sortValue: (row) => row.name }] });
        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por amount' }));
        expect(Array.from(container.querySelectorAll('tbody th')).map((cell) => cell.textContent)).toEqual(['Água', 'Aluguel', 'Mercado']);
    });

    it('a busca digitada casa o texto formatado', () => {
        const { container } = renderTable();
        fireEvent.change(screen.getByPlaceholderText(/buscar|pesquisar/i), { target: { value: '300,50' } });
        expect(Array.from(container.querySelectorAll('tbody th')).map((cell) => cell.textContent)).toEqual(['Mercado']);
    });

    it('searchValue define o texto buscável', () => {
        const { container } = renderTable({ columns: [columns[0], { ...columns[1], searchValue: (row) => `cod-${row.id}` }], searchQuery: 'cod-2' });
        expect(Array.from(container.querySelectorAll('tbody th')).map((cell) => cell.textContent)).toEqual(['Água']);
    });

    it('searchQuery controla o campo e onSearchQueryChange avisa', () => {
        const onSearchQueryChange = vi.fn();
        renderTable({ searchQuery: 'Água', onSearchQueryChange });
        const input = screen.getByPlaceholderText(/buscar|pesquisar/i) as HTMLInputElement;
        expect(input.value).toBe('Água');
        fireEvent.change(input, { target: { value: 'x' } });
        expect(onSearchQueryChange).toHaveBeenCalledWith('x');
        expect(input.value).toBe('Água');
    });
});

describe('SarakTable — agrupamento, expansão e exportação', () => {
    it('agrupa com cabeçalho, subtotal e botão que recolhe', () => {
        const { container } = renderTable({ groupBy: { key: 'group' } });
        const subtotal = container.querySelector('tr[data-sarak-subtotal="Fixas"]') as HTMLElement;
        expect(plain(subtotal.textContent)).toContain('R$ 1.200,00');
        const toggle = screen.getByRole('button', { name: 'Recolher grupo Fixas' });
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(toggle);
        expect(screen.queryByText('Aluguel')).toBeNull();
        expect(container.querySelector('tr[data-sarak-subtotal="Fixas"]')).toBeNull();
        expect(screen.getByRole('button', { name: 'Expandir grupo Fixas' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('renderExpanded: botão com aria-expanded e linha de detalhe', () => {
        renderTable({ renderExpanded: (row) => <p>Detalhe de {row.name}</p> });
        const toggle = screen.getAllByRole('button', { name: 'Expandir linha' })[0];
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(toggle);
        expect(screen.getByText('Detalhe de Aluguel')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Recolher linha' })[0]).toHaveAttribute('aria-expanded', 'true');
    });

    it('expandedKeys controla e onExpandedChange avisa', () => {
        const onExpandedChange = vi.fn();
        renderTable({ renderExpanded: (row) => <p>Detalhe de {row.name}</p>, expandedKeys: [3], onExpandedChange });
        expect(screen.getByText('Detalhe de Mercado')).toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('button', { name: 'Expandir linha' })[0]);
        expect(onExpandedChange).toHaveBeenCalledWith([3, 1]);
    });

    it('exportable mostra o botão e baixa o CSV formatado com o rodapé', () => {
        renderTable({ exportable: { filename: 'faturas.csv' } });
        fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
        const [filename, csv] = vi.mocked(sarakDownloadCsv).mock.calls[0];
        expect(filename).toBe('faturas.csv');
        expect(csv.charCodeAt(0)).toBe(0xFEFF);
        expect(plain(csv)).toContain('Aluguel;R$ 1.000,00');
        expect(plain(csv)).toContain(';R$ 1.500,50');
    });

    it('sem exportable não há botão', () => {
        renderTable();
        expect(screen.queryByRole('button', { name: 'Exportar CSV' })).toBeNull();
    });
});

describe('SarakTable — seleção de todos os N do servidor', () => {
    it('oferece "Selecionar todos os N" e liga selectAll', () => {
        const onSelectAllChange = vi.fn();
        const onSelectionChange = vi.fn();
        renderTable({ selectable: true, totalCount: 90, onSelectAllChange, onSelectionChange });
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));
        fireEvent.click(screen.getByRole('button', { name: 'Selecionar todos os 90' }));
        expect(onSelectAllChange).toHaveBeenCalledWith(true);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('com selectAll, selectedKeys são exceções', () => {
        renderTable({ selectable: true, totalCount: 90, selectAll: true, selectedKeys: [2] });
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 2' })).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeChecked();
    });
});

describe('SarakTable — cartões no celular', () => {
    it('grupo, subtotal, expansão e rodapé também existem no cartão', () => {
        const { container } = renderTable({ groupBy: { key: 'group' }, renderExpanded: (row) => <p>Detalhe de {row.name}</p> }, 'smartphone');
        expect(container.querySelector('table')).toBeNull();
        expect(container.querySelector('[data-sarak-group="Fixas"]')).not.toBeNull();
        expect(screen.getAllByRole('group', { name: 'Subtotal' }).length).toBe(2);
        const footer = screen.getByRole('group', { name: 'Totais' });
        expect(plain(within(footer).getByText(/R\$/).textContent)).toBe('R$ 1.500,50');
        fireEvent.click(screen.getAllByRole('button', { name: 'Expandir linha' })[0]);
        expect(screen.getByText('Detalhe de Aluguel')).toBeInTheDocument();
    });
});
