import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakColumn } from '../columnModel';
import type { SarakDataTableRowsProps, SarakDataTableVirtualRow } from '../SarakDataTableRows';
import { SarakDataTableDetailRow, SarakDataTableFooter, SarakDataTableGroupRow, SarakDataTableSubtotalRow } from '../SarakDataTableSpecialRows';
import type { SarakDisplayRow } from '../tableDisplayRows';

interface Row { id: number; amount: number }

const rows: Row[] = [{ id: 1, amount: 10 }, { id: 2, amount: 5 }];
const columns: Array<SarakColumn<Row>> = [{ id: 'id', header: 'Id', width: 60 }, { id: 'amount', header: 'Valor', width: 80, aggregate: 'sum' }];
const entry = { row: rows[0], index: 0, key: 1 };
const virtual = (display: SarakDisplayRow<Row>): SarakDataTableVirtualRow<Row> => ({ entry, display, virtualIndex: 0, virtualKey: 0, start: 0, size: 40 });
const rowProps = (extra: Partial<SarakDataTableRowsProps<Row>> = {}): SarakDataTableRowsProps<Row> => ({
    columns, rows: [], widths: {}, offsets: { left: {}, right: {}, total: 140 }, containerWidth: 140, headerHeight: 40, automaticHeight: false,
    cellBackground: 'white', selectable: false, selectedKeys: new Set(), onToggleRow: vi.fn(), measureElement: vi.fn(), locale: 'en-US', ...extra,
});

describe('SarakDataTableSpecialRows', () => {
    it('a linha de grupo mostra o rótulo e o botão avisa o id do grupo', () => {
        const onToggleGroup = vi.fn();
        const display = { kind: 'group', id: 'group:Fixas', groupKey: 'Fixas', rows, expanded: true, label: (key: string) => `Grupo ${key}` } as const;
        render(<SarakDataTableGroupRow row={virtual(display)} display={display} props={rowProps({ onToggleGroup })} />);
        expect(screen.getByText('Grupo Fixas')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Recolher grupo Fixas' }));
        expect(onToggleGroup).toHaveBeenCalledWith('group:Fixas');
    });

    it('o subtotal agrega as linhas do grupo e rotula a primeira coluna sem agregado', () => {
        const display = { kind: 'subtotal', id: 'subtotal:A', groupKey: 'A', rows } as const;
        const { container } = render(<SarakDataTableSubtotalRow row={virtual(display)} display={display} props={rowProps()} />);
        expect(container.querySelector('[data-column-id="amount"]')).toHaveTextContent('15');
        expect(container.querySelector('[data-column-id="id"]')).toHaveTextContent('Subtotal');
    });

    it('o detalhe renderiza renderExpanded da linha', () => {
        const display = { kind: 'detail', id: 'detail:1', entry } as const;
        render(<SarakDataTableDetailRow row={virtual(display)} display={display} props={rowProps({ renderExpanded: (row) => <p>Linha {row.id}</p> })} />);
        expect(screen.getByText('Linha 1')).toBeInTheDocument();
    });

    it('o rodapé é um rowgroup com a linha de totais e deixa espaço para as colunas de serviço', () => {
        const { container } = render(<SarakDataTableFooter rows={rows} props={rowProps({ selectable: true, hasExpander: true })} top={100} height={40} />);
        const group = screen.getByRole('rowgroup', { name: 'Totais' });
        expect(group.style.top).toBe('100px');
        expect(container.querySelector('[data-column-id="amount"]')).toHaveTextContent('15');
        expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
        expect((container.querySelector('[aria-hidden="true"]') as HTMLElement).style.width).toBe('88px');
    });
});
