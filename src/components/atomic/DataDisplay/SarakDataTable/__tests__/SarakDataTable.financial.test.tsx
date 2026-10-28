import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SarakDataTableImpl from '../SarakDataTableImpl';
import type { SarakDataTableProps } from '../SarakDataTableImpl';
import type { SarakColumn } from '../columnModel';

const WINDOW = 12;
const ROW_SIZE = 44;

// A janela do virtualizador é finita: só as primeiras WINDOW linhas visuais existem no DOM.
vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (index: number) => number }) => {
        const shown = Math.min(count, WINDOW);
        const sizes = Array.from({ length: count }, (_, index) => estimateSize(index));
        const starts = sizes.map((_, index) => sizes.slice(0, index).reduce((total, size) => total + size, 0));
        return {
            getTotalSize: () => sizes.reduce((total, size) => total + size, 0),
            getVirtualItems: () => Array.from({ length: shown }, (_, index) => ({ index, key: index, start: starts[index], size: sizes[index] })),
            measureElement: vi.fn(),
        };
    },
}));

interface Entry {
    id: number;
    name: string;
    amount: number;
    group?: string;
    children?: Entry[];
}

const BRL = { type: 'currency', currency: 'BRL' } as const;
const entries: Entry[] = [
    { id: 1, name: 'Aluguel', amount: 1000, group: 'Fixas' },
    { id: 2, name: 'Água', amount: 200, group: 'Fixas' },
    { id: 3, name: 'Mercado', amount: 300.5, group: 'Variáveis' },
];
const columns: Array<SarakColumn<Entry>> = [
    { id: 'name', header: 'Nome', width: 160, rowHeader: true },
    { id: 'amount', header: 'Valor', width: 140, format: BRL, aggregate: 'sum', sortable: true },
];
const plain = (text: string | null): string => (text ?? '').replace(/\s/g, ' ');
const renderTable = (props: Partial<SarakDataTableProps<Entry>> = {}): ReturnType<typeof render> =>
    render(<SarakDataTableImpl columns={columns} rows={entries} height={600} {...props} />);
const bodyRows = (): HTMLElement[] => screen.getAllByRole('row').filter((row) => row.hasAttribute('data-index'));
const cellOf = (row: HTMLElement, id: string): HTMLElement => row.querySelector(`[data-column-id="${id}"]`) as HTMLElement;

describe('SarakDataTable — formato, cabeçalho de linha e rodapé', () => {
    it('formata o valor, alinha à direita e usa números tabulares', () => {
        renderTable();
        const cell = cellOf(bodyRows()[0], 'amount');
        expect(plain(cell.textContent)).toBe('R$ 1.000,00');
        expect(cell.style.justifyContent).toBe('flex-end');
        expect(cell.style.fontVariantNumeric).toBe('tabular-nums');
    });

    it('rowHeader vira role="rowheader" na coluna marcada', () => {
        renderTable();
        expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['Aluguel', 'Água', 'Mercado']);
        expect(cellOf(bodyRows()[0], 'amount')).toHaveAttribute('role', 'cell');
    });

    it('mostra o rodapé em rowgroup com o agregado formatado', () => {
        renderTable();
        const footer = screen.getByRole('rowgroup', { name: 'Totais' });
        expect(plain(within(footer).getByText(/R\$/).textContent)).toBe('R$ 1.500,50');
    });

    it('sem aggregate nem footer, não há rodapé', () => {
        renderTable({ columns: columns.map((column) => ({ ...column, aggregate: undefined })) });
        expect(screen.queryByRole('rowgroup')).toBeNull();
    });

    it('footer próprio recebe o valor agregado e as linhas', () => {
        const footer = vi.fn(({ value, rows }: { value: unknown; rows: Entry[] }) => `Σ ${String(value)} em ${rows.length}`);
        renderTable({ columns: [columns[0], { ...columns[1], footer }] });
        expect(screen.getByText('Σ 1500.5 em 3')).toBeInTheDocument();
    });

    it('colSpan cobre a coluna seguinte e ela não é renderizada na linha', () => {
        renderTable({ columns: [{ ...columns[0], colSpan: (row) => row.id === 2 ? 2 : undefined }, columns[1]] });
        const rows = bodyRows();
        expect(cellOf(rows[1], 'amount')).toBeNull();
        expect(cellOf(rows[1], 'name').style.width).toBe('300px');
        expect(cellOf(rows[0], 'amount')).not.toBeNull();
    });

    it('accessor e searchValue/sortValue por coluna', () => {
        renderTable({ columns: [columns[0], { id: 'amount', header: 'Valor', width: 140, accessor: (row) => row.amount * 2, format: BRL }] });
        expect(plain(cellOf(bodyRows()[1], 'amount').textContent)).toBe('R$ 400,00');
    });
});

describe('SarakDataTable — ordem e busca pelo valor certo', () => {
    it('ordena o texto "R$ 200" antes de "R$ 1.000" pelo valor bruto', () => {
        renderTable();
        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por amount' }));
        expect(bodyRows().map((row) => plain(cellOf(row, 'amount').textContent))).toEqual(['R$ 200,00', 'R$ 300,50', 'R$ 1.000,00']);
    });

    it('sortValue ordena por outro campo', () => {
        renderTable({ columns: [columns[0], { ...columns[1], sortValue: (row) => row.name }] });
        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por amount' }));
        expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['Água', 'Aluguel', 'Mercado']);
    });

    it('a busca casa o texto formatado, não o número bruto', () => {
        renderTable({ searchQuery: '1.000,00' });
        expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['Aluguel']);
    });

    it('searchValue define o texto buscável da coluna', () => {
        renderTable({ columns: [columns[0], { ...columns[1], searchValue: (row) => `cod-${row.id}` }], searchQuery: 'cod-3' });
        expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['Mercado']);
    });

    it('sem searchQuery não há filtro', () => {
        renderTable();
        expect(bodyRows()).toHaveLength(3);
    });
});

describe('SarakDataTable — agrupamento, expansão e árvore', () => {
    it('agrupa com cabeçalho expansível e subtotal por grupo', () => {
        renderTable({ groupBy: { key: 'group' } });
        const rows = screen.getAllByRole('row');
        expect(rows.some((row) => row.getAttribute('data-sarak-group') === 'Fixas')).toBe(true);
        const subtotal = rows.find((row) => row.getAttribute('data-sarak-subtotal') === 'Fixas') as HTMLElement;
        expect(plain(subtotal.textContent)).toContain('R$ 1.200,00');
        expect(within(subtotal).getByText('Subtotal')).toBeInTheDocument();
    });

    it('o botão do grupo recolhe as linhas e o subtotal', () => {
        renderTable({ groupBy: { key: 'group' } });
        const toggle = screen.getByRole('button', { name: 'Recolher grupo Fixas' });
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(toggle);
        expect(screen.getByRole('button', { name: 'Expandir grupo Fixas' })).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Aluguel')).toBeNull();
        expect(screen.getByText('Mercado')).toBeInTheDocument();
    });

    it('subtotals:false e defaultExpanded:false', () => {
        renderTable({ groupBy: { key: 'group', subtotals: false, defaultExpanded: false } });
        expect(screen.queryByText('Aluguel')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Expandir grupo Fixas' }));
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
        expect(screen.getAllByRole('row').some((row) => row.hasAttribute('data-sarak-subtotal'))).toBe(false);
    });

    it('renderExpanded: o botão tem aria-expanded e revela o conteúdo', () => {
        renderTable({ renderExpanded: (row) => <p>Detalhe de {row.name}</p> });
        const toggle = screen.getAllByRole('button', { name: 'Expandir linha' })[0];
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(toggle);
        expect(screen.getByText('Detalhe de Aluguel')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Recolher linha' })[0]).toHaveAttribute('aria-expanded', 'true');
    });

    it('expandedKeys controla e onExpandedChange avisa', () => {
        const onExpandedChange = vi.fn();
        renderTable({ renderExpanded: (row) => <p>Detalhe de {row.name}</p>, expandedKeys: [2], onExpandedChange, getRowKey: (row) => row.id });
        expect(screen.getByText('Detalhe de Água')).toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('button', { name: 'Expandir linha' })[0]);
        expect(onExpandedChange).toHaveBeenCalledWith([2, 1]);
        expect(screen.queryByText('Detalhe de Aluguel')).toBeNull();
    });

    const tree: Entry[] = [
        { id: 1, name: 'Ativo', amount: 0, children: [{ id: 11, name: 'Caixa', amount: 10, children: [{ id: 111, name: 'Cofre', amount: 5 }] }] },
        { id: 2, name: 'Passivo', amount: 0 },
    ];

    it('tree-table: a 1ª coluna ganha o botão e o filho aparece ao expandir', () => {
        renderTable({ rows: tree, getChildren: (row) => row.children });
        expect(screen.queryByText('Caixa')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Expandir linha' }));
        expect(screen.getByText('Caixa')).toBeInTheDocument();
        expect(screen.queryByText('Cofre')).toBeNull();
    });

    it('defaultExpandedDepth abre a profundidade pedida e indenta por nível', () => {
        renderTable({ rows: tree, getChildren: (row) => row.children, defaultExpandedDepth: 2 });
        expect(screen.getByText('Cofre')).toBeInTheDocument();
        const indent = cellOf(bodyRows()[2], 'name').querySelector('[data-tree-depth]');
        expect(indent).toHaveAttribute('data-tree-depth', '2');
    });

    it('com 1.000 linhas agrupadas, só a janela visível fica no DOM', () => {
        const many = Array.from({ length: 1000 }, (_, id) => ({ id, name: `Item ${id}`, amount: id, group: `G${id % 10}` }));
        renderTable({ rows: many, groupBy: { key: 'group' } });
        expect(screen.getAllByRole('row').length).toBeLessThanOrEqual(WINDOW + 2);
        expect(screen.queryByText('Item 999')).toBeNull();
    });

    it('com 1.000 raízes em árvore, só a janela visível fica no DOM', () => {
        const many = Array.from({ length: 1000 }, (_, id) => ({ id, name: `Conta ${id}`, amount: id, children: [{ id: id + 5000, name: 'Sub', amount: 1 }] }));
        renderTable({ rows: many, getChildren: (row) => row.children, defaultExpandedDepth: 1 });
        expect(screen.getAllByRole('row').length).toBeLessThanOrEqual(WINDOW + 2);
    });
});

describe('SarakDataTable — reordenar, estados e seleção', () => {
    it('reorderable:false tira o arraste dos cabeçalhos; o padrão mantém', () => {
        const { unmount } = renderTable();
        expect(screen.getAllByRole('columnheader').filter((header) => header.getAttribute('draggable') === 'true')).toHaveLength(2);
        unmount();
        renderTable({ reorderable: false });
        expect(screen.getAllByRole('columnheader').filter((header) => header.getAttribute('draggable') === 'true')).toHaveLength(0);
    });

    it('erro com linhas mantém as linhas e põe o aviso acima (Q2)', () => {
        renderTable({ error: 'Falhou' });
        expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
        expect(bodyRows()).toHaveLength(3);
    });

    it('erro sem linhas só mostra o aviso', () => {
        renderTable({ rows: [], error: 'Falhou' });
        expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
        expect(screen.queryByRole('table')).toBeNull();
    });

    it('loading com linhas mantém as linhas com aria-busy (Q2)', () => {
        renderTable({ loading: true });
        expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
        expect(bodyRows()).toHaveLength(3);
    });

    it('loading sem linhas desenha o esqueleto, 8 linhas por padrão e skeletonRows configura', () => {
        const { container, unmount } = renderTable({ rows: [], loading: true });
        expect(container.querySelectorAll('[data-sarak-skeleton] .animate-pulse')).toHaveLength(8);
        expect(screen.getByRole('status')).toHaveTextContent('Carregando');
        unmount();
        const second = renderTable({ rows: [], loading: true, skeletonRows: 3 });
        expect(second.container.querySelectorAll('[data-sarak-skeleton] .animate-pulse')).toHaveLength(3);
    });

    it('a caixa do cabeçalho e as das linhas têm nome acessível', () => {
        renderTable({ selectable: true, getRowKey: (row) => row.id });
        expect(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeInTheDocument();
    });

    it('página inteira marcada com totalCount maior oferece "Selecionar todos os N"', () => {
        const onSelectAllChange = vi.fn();
        const onSelectionChange = vi.fn();
        renderTable({ selectable: true, getRowKey: (row) => row.id, totalCount: 500, onSelectAllChange, onSelectionChange });
        expect(screen.queryByRole('button', { name: 'Selecionar todos os 500' })).toBeNull();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));
        fireEvent.click(screen.getByRole('button', { name: 'Selecionar todos os 500' }));
        expect(onSelectAllChange).toHaveBeenCalledWith(true);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        expect(screen.getByText('Todos os 500 itens estão selecionados.')).toBeInTheDocument();
    });

    it('com selectAll, desmarcar uma linha a põe nas exceções e limpar volta ao normal', () => {
        const onSelectionChange = vi.fn();
        const onSelectAllChange = vi.fn();
        renderTable({ selectable: true, getRowKey: (row) => row.id, totalCount: 500, selectAll: true, selectedKeys: [], onSelectionChange, onSelectAllChange });
        const first = screen.getByRole('checkbox', { name: 'Selecionar linha 1' });
        expect(first).toBeChecked();
        fireEvent.click(first);
        expect(onSelectionChange).toHaveBeenLastCalledWith([1]);
        fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
        expect(onSelectAllChange).toHaveBeenCalledWith(false);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('com selectAll e uma exceção, a linha excetuada fica desmarcada', () => {
        renderTable({ selectable: true, getRowKey: (row) => row.id, totalCount: 500, selectAll: true, selectedKeys: [2] });
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 2' })).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeChecked();
    });
});
