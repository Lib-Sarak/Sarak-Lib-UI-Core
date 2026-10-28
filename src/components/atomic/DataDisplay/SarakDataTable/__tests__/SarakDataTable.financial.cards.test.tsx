import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SarakDataTableImpl from '../SarakDataTableImpl';
import type { SarakColumn } from '../columnModel';
import { SarakDeviceProvider } from '../../../../../core/Provider/DeviceProvider';

vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (index: number) => number }) => {
        const sizes = Array.from({ length: count }, (_, index) => estimateSize(index));
        const starts = sizes.map((_, index) => sizes.slice(0, index).reduce((total, size) => total + size, 0));
        return {
            getTotalSize: () => sizes.reduce((total, size) => total + size, 0),
            getVirtualItems: () => Array.from({ length: count }, (_, index) => ({ index, key: index, start: starts[index], size: sizes[index] })),
            measureElement: vi.fn(),
        };
    },
}));

interface Entry { id: number; name: string; amount: number; group: string }

const entries: Entry[] = [
    { id: 1, name: 'Aluguel', amount: 1000, group: 'Fixas' },
    { id: 2, name: 'Mercado', amount: 300.5, group: 'Variáveis' },
];
const columns: Array<SarakColumn<Entry>> = [
    { id: 'name', header: 'Nome' },
    { id: 'amount', header: 'Valor', format: { type: 'currency', currency: 'BRL' }, aggregate: 'sum' },
];
const plain = (text: string | null): string => (text ?? '').replace(/\s/g, ' ');

const renderCards = (props: Record<string, unknown> = {}): ReturnType<typeof render> =>
    render(
        <SarakDeviceProvider overrideDevice="smartphone">
            <SarakDataTableImpl columns={columns} rows={entries} height={600} {...props} />
        </SarakDeviceProvider>,
    );

describe('SarakDataTable no celular (cartões)', () => {
    it('formata o valor no cartão e mostra o rodapé de totais', () => {
        const { container } = renderCards();
        expect(container.querySelector('[data-sarak-datacards]')).not.toBeNull();
        expect(plain(container.querySelector('[data-column-id="amount"]')?.textContent ?? '')).toContain('R$ 1.000,00');
        const footer = screen.getByRole('group', { name: 'Totais' });
        expect(plain(footer.textContent)).toContain('R$ 1.300,50');
    });

    it('grupo, subtotal e expansão também funcionam no cartão', () => {
        const { container } = renderCards({ groupBy: { key: 'group' }, renderExpanded: (row: Entry) => <p>Detalhe de {row.name}</p> });
        expect(container.querySelector('[data-sarak-group="Fixas"]')).not.toBeNull();
        expect(screen.getAllByRole('group', { name: 'Subtotal' })).toHaveLength(2);
        fireEvent.click(screen.getAllByRole('button', { name: 'Expandir linha' })[0]);
        expect(screen.getByText('Detalhe de Aluguel')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Recolher grupo Fixas' }));
        expect(screen.queryByText('Aluguel')).toBeNull();
    });

    it('a árvore indenta o cartão do filho', () => {
        const tree = [{ id: 1, name: 'Ativo', amount: 0, group: 'x', children: [{ id: 2, name: 'Caixa', amount: 1, group: 'x' }] }];
        renderCards({ rows: tree, getChildren: (row: { children?: unknown[] }) => row.children, defaultExpandedDepth: 1 });
        const cards = screen.getAllByRole('listitem');
        expect(cards[1].style.marginLeft).toContain('* 1');
    });
});
