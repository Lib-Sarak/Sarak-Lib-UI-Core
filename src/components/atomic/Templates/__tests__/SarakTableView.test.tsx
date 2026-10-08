import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import type { TableInteractionsResult } from '../../DataDisplay/SarakDataTable/useTableInteractions';
import { SarakTableView } from '../SarakTableView';
import type { SarakTableViewProps } from '../SarakTableViewParts';

interface Row extends Record<string, unknown> {
    id: number;
    nome: string;
}

const createInteractions = (row: Row): TableInteractionsResult<Row> => ({
    entries: [{ row, index: 0, key: row.id }],
    sort: null,
    selectedKeys: new Set(),
    allVisibleSelected: false,
    partiallySelected: false,
    changeSort: vi.fn(),
    toggleRow: vi.fn(),
    toggleAll: vi.fn(),
});

const createViewProps = (row: Row, onRowClick: (row: Row) => void): SarakTableViewProps<Row> => ({
    filteredData: [row],
    interactions: createInteractions(row),
    columns: [{ key: 'nome', label: 'Pessoa', render: (value) => <strong>{value.nome}</strong>, align: 'right' }],
    columnKeys: ['nome'],
    columnLabels: { nome: 'Pessoa' },
    role: 'neutral',
    density: 'standard',
    loading: false,
    error: null,
    collapseToCards: false,
    canRefresh: false,
    showSearch: false,
    selectable: false,
    search: '',
    onSearchChange: vi.fn(),
    onRefresh: vi.fn(),
    onRowClick,
    cellDensityClass: 'cell',
    containerClassName: 'container',
    containerStyle: {},
    headerClassName: 'header',
    headerStyle: {},
});

describe('SarakTableView', () => {
    it('renderiza valores customizados alinhados e encaminha o clique da linha', () => {
        const row: Row = { id: 1, nome: 'Beto' };
        const onRowClick = vi.fn();
        const { container } = render(
            <SarakUIProvider>
                <SarakTableView {...createViewProps(row, onRowClick)} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Beto').tagName).toBe('STRONG');
        expect((container.querySelector('tbody td') as HTMLElement).style.textAlign).toBe('right');
        fireEvent.click(container.querySelector('tbody tr') as HTMLElement);
        expect(onRowClick).toHaveBeenCalledWith(row);
    });
});
