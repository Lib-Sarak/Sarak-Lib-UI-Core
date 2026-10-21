import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakDataTableRows } from '../SarakDataTableRows';
import { sarakComputeOffsets, type SarakColumn } from '../columnModel';
import type { TableInteractionEntry } from '../useTableInteractions';

interface Row {
    id: number;
    name: string;
}

const columns: Array<SarakColumn<Row>> = [{ id: 'name', header: 'Nome' }];
const ROW_IDENTIFIER = 5;
const ROW_HEIGHT = 44;
const entry: TableInteractionEntry<Row> = { row: { id: ROW_IDENTIFIER, name: 'Ana' }, index: 0, key: ROW_IDENTIFIER };

describe('SarakDataTableRows', () => {
    it('renderiza os dados e encaminha a seleção de uma linha', () => {
        const onToggleRow = vi.fn();
        render(
            <SarakDataTableRows
                columns={columns}
                rows={[{ entry, virtualIndex: 0, virtualKey: 0, start: 0, size: ROW_HEIGHT }]}
                widths={{}}
                offsets={sarakComputeOffsets(columns, {})}
                containerWidth={208}
                headerHeight={44}
                automaticHeight={false}
                cellBackground="surface"
                selectable
                selectedKeys={new Set()}
                onToggleRow={onToggleRow}
                measureElement={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('checkbox', { name: `Selecionar linha ${ROW_IDENTIFIER}` }));

        expect(screen.getByRole('cell', { name: 'Ana' })).toBeInTheDocument();
        expect(onToggleRow).toHaveBeenCalledWith(ROW_IDENTIFIER, true);
    });
});

describe('SarakDataTableRows — alinhamento', () => {
    it('alinha a célula conforme a coluna', () => {
        const { container } = render(
            <SarakDataTableRows
                columns={[{ ...columns[0], align: 'right' }]}
                rows={[{ entry, virtualIndex: 0, virtualKey: 0, start: 0, size: ROW_HEIGHT }]}
                widths={{}}
                offsets={sarakComputeOffsets(columns, {})}
                containerWidth={160}
                headerHeight={44}
                automaticHeight={false}
                cellBackground="surface"
                selectable={false}
                selectedKeys={new Set()}
                onToggleRow={vi.fn()}
                measureElement={vi.fn()}
            />,
        );

        expect((container.querySelector('[role="cell"]') as HTMLElement).style.justifyContent).toBe('flex-end');
    });
});
