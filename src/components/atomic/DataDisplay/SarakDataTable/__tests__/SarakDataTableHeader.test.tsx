import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakDataTableHeader } from '../SarakDataTableHeader';
import { sarakComputeOffsets, type SarakColumn } from '../columnModel';

interface Row {
    name: string;
}

const columns: Array<SarakColumn<Row>> = [{ id: 'name', header: 'Nome', sortable: true, pinned: 'left', align: 'right' }];

describe('SarakDataTableHeader', () => {
    it('expõe ordenação de coluna e alternância de todas as linhas', () => {
        const onSort = vi.fn();
        const onToggleAll = vi.fn();
        render(
            <SarakDataTableHeader
                columns={columns}
                widths={{}}
                offsets={sarakComputeOffsets(columns, {})}
                background="surface"
                headerHeight={44}
                dragId={null}
                sort={null}
                selectable
                allVisibleSelected={false}
                partiallySelected
                onDragStart={vi.fn()}
                onDrop={vi.fn()}
                onSort={onSort}
                onToggleAll={onToggleAll}
                onResizeStart={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por name' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));

        expect(onSort).toHaveBeenCalledWith('name');
        expect(onToggleAll).toHaveBeenCalledWith(true);
        expect(screen.getByRole('columnheader', { name: 'Seleção' })).toBeInTheDocument();
        expect((document.querySelector('[role="columnheader"][data-column-id="name"]') as HTMLElement).style.justifyContent).toBe('flex-end');
    });
});
