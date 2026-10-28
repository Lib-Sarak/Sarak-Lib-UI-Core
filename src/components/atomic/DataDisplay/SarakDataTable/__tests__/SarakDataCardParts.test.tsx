import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakValueColumn } from '../columnValue';
import { DataCardBody, DetailCard, GroupCard, SubtotalCard, TotalsCard } from '../SarakDataCardParts';
import type { SarakDataCardsProps } from '../SarakDataCards';
import type { SarakDisplayRow } from '../tableDisplayRows';

interface Row { id: number; amount: number }

const rows: Row[] = [{ id: 1, amount: 10 }, { id: 2, amount: 5 }];
const amountColumn: SarakValueColumn<Row> = { id: 'amount', aggregate: 'sum' };
const totals = [{ column: amountColumn, header: 'Valor' }, { column: { id: 'id' } as SarakValueColumn<Row>, header: 'Id' }];
const dataDisplay = (extra: Partial<Extract<SarakDisplayRow<Row>, { kind: 'data' }>> = {}): Extract<SarakDisplayRow<Row>, { kind: 'data' }> => ({
    kind: 'data', id: 'row:1', entry: { row: rows[0], index: 0, key: 1 }, depth: 0, expandable: false, expanded: false, hasChildren: false, ...extra,
});
const cardProps = (extra: Partial<SarakDataCardsProps<Row>> = {}): SarakDataCardsProps<Row> => ({
    columns: [{ id: 'amount', header: 'Valor', format: { type: 'number' } }], rows, locale: 'en-US', ...extra,
});

describe('SarakDataCardParts', () => {
    it('TotalsCard é um grupo com nome e um campo por coluna com agregação', () => {
        render(<TotalsCard columns={totals} rows={rows} title="Totais" locale="en-US" />);
        const group = screen.getByRole('group', { name: 'Totais' });
        expect(group).toHaveTextContent('Valor');
        expect(group).toHaveTextContent('15');
        expect(group).not.toHaveTextContent('Id');
    });

    it('SubtotalCard usa o título traduzido', () => {
        render(<SubtotalCard columns={totals} display={{ kind: 'subtotal', id: 's', groupKey: 'A', rows }} locale="en-US" />);
        expect(screen.getByRole('group', { name: 'Subtotal' })).toBeInTheDocument();
    });

    it('GroupCard avisa o id ao alternar', () => {
        const onToggleGroup = vi.fn();
        render(<GroupCard display={{ kind: 'group', id: 'group:A', groupKey: 'A', rows, expanded: false }} onToggleGroup={onToggleGroup} />);
        const toggle = screen.getByRole('button', { name: 'Expandir grupo A' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(toggle);
        expect(onToggleGroup).toHaveBeenCalledWith('group:A');
    });

    it('DetailCard renderiza o conteúdo expandido', () => {
        render(<DetailCard display={{ kind: 'detail', id: 'd', entry: { row: rows[0], index: 0, key: 1 } }} renderExpanded={(row) => <p>Linha {row.id}</p>} />);
        expect(screen.getByText('Linha 1')).toBeInTheDocument();
    });

    it('DataCardBody formata pelo locale e oferece seleção e expansão por nome acessível', () => {
        const onToggleRow = vi.fn();
        const onToggleExpand = vi.fn();
        render(<DataCardBody props={cardProps({ selectable: true, selectedKeys: new Set(), onToggleRow, onToggleExpand })} display={dataDisplay({ expandable: true })} />);
        expect(screen.getByText('10')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 1' }));
        expect(onToggleRow).toHaveBeenCalledWith(1, true);
        fireEvent.click(screen.getByRole('button', { name: 'Expandir linha' }));
        expect(onToggleExpand).toHaveBeenCalledWith(1);
    });
});
