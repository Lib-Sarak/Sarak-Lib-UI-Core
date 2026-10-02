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
const entry: TableInteractionEntry<Row> = { row: { id: 5, name: 'Ana' }, index: 0, key: 5 };

describe('SarakDataTableRows', () => {
    it('renderiza os dados e encaminha a seleção de uma linha', () => {
        const onToggleRow = vi.fn();
        render(
            <SarakDataTableRows
                columns={columns}
                rows={[{ entry, virtualIndex: 0, virtualKey: 0, start: 0 }]}
                widths={{}}
                offsets={sarakComputeOffsets(columns, {})}
                containerWidth={208}
                headerHeight={44}
                rowHeight={44}
                cellBackground="surface"
                selectable
                selectedKeys={new Set()}
                onToggleRow={onToggleRow}
            />,
        );

        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 5' }));

        expect(screen.getByRole('cell', { name: 'Ana' })).toBeInTheDocument();
        expect(onToggleRow).toHaveBeenCalledWith(5, true);
    });
});
