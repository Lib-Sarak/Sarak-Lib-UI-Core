import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import type { SarakColumn } from '../columnModel';
import { SarakTableColumnPanel } from '../SarakTableColumnPanel';
import type { DataTableColumns } from '../useDataTableColumns';

type Row = Record<string, unknown>;

const A: SarakColumn<Row> = { id: 'a', header: 'Nome' };
const B: SarakColumn<Row> = { id: 'b', header: <b>Valor</b> };

const columns = (over: Partial<DataTableColumns<Row>> = {}): DataTableColumns<Row> => ({
    allColumns: [A, B], ordered: [A, B], state: {}, toggleHidden: vi.fn(), moveColumn: vi.fn(), ...over,
} as unknown as DataTableColumns<Row>);

const setup = (value: DataTableColumns<Row>) => render(<SarakUIProvider><SarakTableColumnPanel columns={value} onClose={vi.fn()} /></SarakUIProvider>);

describe('SarakTableColumnPanel', () => {
    it('esconde e move pela coluna, com o id no lugar de cabeçalho que não é texto', () => {
        const value = columns();
        setup(value);
        fireEvent.click(screen.getByRole('checkbox', { name: 'Exibir coluna Nome' }));
        expect(value.toggleHidden).toHaveBeenCalledWith('a');
        fireEvent.click(screen.getByRole('button', { name: 'Mover b para antes' }));
        expect(value.moveColumn).toHaveBeenCalledWith('b', -1);
        fireEvent.click(screen.getByRole('button', { name: 'Mover Nome para depois' }));
        expect(value.moveColumn).toHaveBeenCalledWith('a', 1);
    });

    it('a última coluna visível não se esconde', () => {
        setup(columns({ ordered: [A], state: { hidden: ['b'] } }));
        expect(screen.getByRole('checkbox', { name: 'Exibir coluna Nome' })).toBeDisabled();
        expect(screen.getByRole('checkbox', { name: 'Exibir coluna b' })).not.toBeDisabled();
    });

    it('as pontas se anunciam sem perder o foco', () => {
        setup(columns());
        const first = screen.getByRole('button', { name: 'Mover Nome para antes' });
        expect(first).toHaveAttribute('aria-disabled', 'true');
        expect(first).not.toBeDisabled();
    });
});
