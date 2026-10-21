import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakDataTableRow } from '../SarakDataTableRow';
import type { SarakDataTableRowsProps, SarakDataTableVirtualRow } from '../SarakDataTableRows';

interface Row {
    id: number;
    name: string;
}

const row: Row = { id: 1, name: 'Ana' };
const ROW_HEIGHT = 40;
const TABLE_WIDTH = 100;
const HEADER_HEIGHT = 32;

const createProps = (onRowClick: (row: Row) => void): {
    row: SarakDataTableVirtualRow<Row>;
    props: SarakDataTableRowsProps<Row>;
} => ({
    row: { entry: { row, index: 0, key: row.id }, virtualIndex: 0, virtualKey: row.id, start: 0, size: ROW_HEIGHT },
    props: {
        columns: [{ id: 'name', header: 'Nome', align: 'right', render: (value) => <strong>{value.name}</strong> }],
        rows: [],
        widths: {},
        offsets: { left: {}, right: {}, total: TABLE_WIDTH },
        containerWidth: TABLE_WIDTH,
        headerHeight: HEADER_HEIGHT,
        automaticHeight: false,
        cellBackground: 'white',
        selectable: false,
        selectedKeys: new Set(),
        onToggleRow: vi.fn(),
        onRowClick,
        measureElement: vi.fn(),
    },
});

describe('SarakDataTableRow', () => {
    it('renderiza célula customizada alinhada e encaminha ativação da linha', () => {
        const onRowClick = vi.fn();
        const view = createProps(onRowClick);
        const { container } = render(<SarakDataTableRow {...view} />);

        expect(screen.getByText('Ana').tagName).toBe('STRONG');
        expect((container.querySelector('[role="cell"]') as HTMLElement).style.textAlign).toBe('right');
        fireEvent.click(screen.getByRole('row'));
        expect(onRowClick).toHaveBeenCalledWith(row);
    });
});
