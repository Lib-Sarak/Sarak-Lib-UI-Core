import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SarakDataTableImpl from '../SarakDataTableImpl';
import type { SarakColumn } from '../columnModel';

vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (index: number) => number }) => ({
        getTotalSize: () => count * estimateSize(0),
        getVirtualItems: () => Array.from({ length: count }, (_, index) => ({ index, key: index, start: index * estimateSize(index), size: estimateSize(index) })),
        measureElement: vi.fn(),
    }),
}));

interface Row {
    id: number;
    name: string;
    amount: number;
}

const ROWS: Row[] = [{ id: 1, name: 'Ana', amount: 10 }, { id: 2, name: 'Beto', amount: 20 }];
const COLUMNS: Array<SarakColumn<Row>> = [
    { id: 'name', header: 'Nome', sortable: true, pinned: 'left' },
    { id: 'amount', header: 'Valor', format: { type: 'number' }, aggregate: 'sum' },
];

describe('SarakDataTable sem as props da tabela de trabalho', () => {
    it('mantém o DOM da tabela simples', () => {
        const { container } = render(<SarakDataTableImpl columns={COLUMNS} rows={ROWS} height={300} />);
        expect(container).toMatchSnapshot();
    });

    it('mantém o DOM da tabela com seleção e detalhe', () => {
        const { container } = render(<SarakDataTableImpl columns={COLUMNS} rows={ROWS} height={300} selectable renderExpanded={(row) => row.name} expandedKeys={[1]} />);
        expect(container).toMatchSnapshot();
    });
});
