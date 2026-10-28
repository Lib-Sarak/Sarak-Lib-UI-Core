import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import type { TableInteractionsResult } from '../../DataDisplay/SarakDataTable/useTableInteractions';
import { SarakTableGrid, tableDisplayRowsOf } from '../SarakTableGrid';
import type { SarakTableViewProps } from '../SarakTableViewParts';

interface Row extends Record<string, unknown> { id: number; name: string }

const rows: Row[] = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Beto' }];
const interactions = {
    entries: rows.map((row, index) => ({ row, index, key: row.id })), sort: null, selectedKeys: new Set(), allVisibleSelected: false,
    partiallySelected: false, changeSort: () => undefined, toggleRow: () => undefined, toggleAll: () => undefined,
} as unknown as TableInteractionsResult<Row>;
const viewProps = (extra: Partial<SarakTableViewProps<Row>> = {}): SarakTableViewProps<Row> => ({
    filteredData: rows, interactions, columns: [{ key: 'name', label: 'Nome' }], columnKeys: ['name'], columnLabels: { name: 'Nome' }, role: 'neutral',
    density: 'standard', loading: false, error: null, collapseToCards: false, canRefresh: false, showSearch: false, selectable: false, search: '',
    onSearchChange: () => undefined, onRefresh: () => undefined, cellDensityClass: 'cell', containerClassName: 'c', ...extra,
});

describe('SarakTableGrid', () => {
    it('sem displayRows, uma linha de dado por entrada (rc.3)', () => {
        const display = tableDisplayRowsOf(viewProps());
        expect(display.map((row) => row.kind)).toEqual(['data', 'data']);
        expect(display[0]).toMatchObject({ id: 'row:1', expandable: false });
    });

    it('displayRows recebidas têm prioridade', () => {
        const custom = [{ kind: 'subtotal', id: 's', groupKey: 'A', rows }] as const;
        expect(tableDisplayRowsOf(viewProps({ displayRows: [...custom] }))).toHaveLength(1);
    });

    it('o cabeçalho usa scope="col" e o carregamento marca aria-busy e esqueleto', () => {
        const { container } = render(<SarakUIProvider><SarakTableGrid props={viewProps({ loading: true })} /></SarakUIProvider>);
        expect(container.querySelector('th[scope="col"]')).not.toBeNull();
        expect(container.querySelector('table')).toHaveAttribute('aria-busy', 'true');
        expect(container.querySelectorAll('tbody tr.animate-pulse')).toHaveLength(5);
    });

    it('sem rodapé declarado não há tfoot, e ele some durante o carregamento', () => {
        const withFooter = viewProps({ columns: [{ key: 'name', label: 'Nome', aggregate: 'count' }] });
        const { container, rerender } = render(<SarakUIProvider><SarakTableGrid props={withFooter} /></SarakUIProvider>);
        expect(container.querySelector('tfoot')).not.toBeNull();
        rerender(<SarakUIProvider><SarakTableGrid props={{ ...withFooter, loading: true }} /></SarakUIProvider>);
        expect(container.querySelector('tfoot')).toBeNull();
    });
});
