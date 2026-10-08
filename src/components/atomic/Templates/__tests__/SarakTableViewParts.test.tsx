import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import type { TableInteractionsResult } from '../../DataDisplay/SarakDataTable/useTableInteractions';
import { SarakTableGrid, SarakTableToolbar, type SarakTableViewProps } from '../SarakTableViewParts';

interface Row extends Record<string, unknown> {
    id: number;
    name: string;
}

const row: Row = { id: 1, name: 'Ana' };

const createViewProps = (onRowClick: (row: Row) => void): SarakTableViewProps<Row> => {
    const interactions: TableInteractionsResult<Row> = {
        entries: [{ row, index: 0, key: row.id }],
        sort: null,
        selectedKeys: new Set(),
        allVisibleSelected: false,
        partiallySelected: false,
        changeSort: vi.fn(),
        toggleRow: vi.fn(),
        toggleAll: vi.fn(),
    };
    return {
        filteredData: [row],
        interactions,
        columns: [{ key: 'name', label: 'Nome', render: (value) => <strong>{value.name}</strong>, align: 'right' }],
        columnKeys: ['name'],
        columnLabels: { name: 'Nome' },
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
        headerClassName: 'header',
    };
};

describe('SarakTableToolbar', () => {
    it('apresenta o título e a contagem atual de linhas', () => {
        render(<SarakUIProvider><SarakTableToolbar {...createViewProps(vi.fn())} label="Pessoas" /></SarakUIProvider>);

        expect(screen.getByRole('heading', { name: 'Pessoas' })).toBeInTheDocument();
        expect(screen.getByText(/1/)).toBeInTheDocument();
    });
});

describe('SarakTableGrid', () => {
    it('renderiza célula customizada alinhada e encaminha o clique da linha', () => {
        const onRowClick = vi.fn();
        const props = createViewProps(onRowClick);
        const { container } = render(<SarakUIProvider><SarakTableGrid props={props} /></SarakUIProvider>);

        expect(screen.getByText('Ana').tagName).toBe('STRONG');
        expect((container.querySelector('tbody td') as HTMLElement).style.textAlign).toBe('right');
        fireEvent.click(container.querySelector('tbody tr') as HTMLElement);
        expect(onRowClick).toHaveBeenCalledWith(row);
    });
});
