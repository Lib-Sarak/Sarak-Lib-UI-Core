import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { SarakColumn } from '../columnModel';

// jsdom não tem layout, então o virtualizador real materializa 0 cards (mesmo motivo
// pelo qual a suíte da tabela nunca afirma linhas virtualizadas). Aqui mockamos o
// virtualizador para renderizar TODOS os itens e provar o conteúdo do card de verdade.
vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => {
        const size = estimateSize();
        const items = Array.from({ length: count }, (_, index) => ({ index, key: index, start: index * size, size }));
        return {
            getTotalSize: () => count * size,
            getVirtualItems: () => items,
            measureElement: () => undefined,
        };
    },
}));

import SarakDataCards from '../SarakDataCards';

interface Row {
    name: string;
    role: string;
}

const columns: Array<SarakColumn<Row>> = [
    { id: 'name', header: 'Nome' },
    { id: 'role', header: 'Papel', render: (row) => <b>{row.role.toUpperCase()}</b> },
];

const rows: Row[] = [
    { name: 'Ana', role: 'gerente' },
    { name: 'Bruno', role: 'analista' },
];

const CARD_VIEWPORT_HEIGHT = 600;

describe('SarakDataCards — estrutura do cartão', () => {
    it('renderiza 1 card por linha (role=listitem) dentro de uma lista', () => {
        render(<SarakDataCards columns={columns} rows={rows} height={CARD_VIEWPORT_HEIGHT} />);
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('cada card usa o CABEÇALHO da coluna como rótulo (mesma definição de coluna)', () => {
        render(<SarakDataCards columns={columns} rows={rows} height={CARD_VIEWPORT_HEIGHT} />);
        // 2 linhas × 2 colunas → cada rótulo aparece 2×.
        expect(screen.getAllByText('Nome')).toHaveLength(2);
        expect(screen.getAllByText('Papel')).toHaveLength(2);
    });

    it('reusa o render() da coluna e o valor cru (mesmo contrato da tabela)', () => {
        render(<SarakDataCards columns={columns} rows={rows} height={CARD_VIEWPORT_HEIGHT} />);
        expect(screen.getByText('Ana')).toBeInTheDocument();      // valor cru (sem render)
        expect(screen.getByText('Bruno')).toBeInTheDocument();
        expect(screen.getByText('GERENTE')).toBeInTheDocument();  // via column.render
        expect(screen.getByText('ANALISTA')).toBeInTheDocument();
    });
});

describe('SarakDataCards — ativação', () => {
    it('encaminha o registro ao ativar um card', () => {
        const onRowClick = vi.fn();
        render(<SarakDataCards columns={columns} rows={rows} onRowClick={onRowClick} />);

        fireEvent.click(screen.getAllByRole('listitem')[0]);

        expect(onRowClick).toHaveBeenCalledWith(rows[0]);
    });
});

describe('SarakDataCards — layout e tokens', () => {
    it('o container contém o scroll (overflow-x hidden + maxWidth 100%) — zero overflow da página', () => {
        const { container } = render(<SarakDataCards columns={columns} rows={rows} height={CARD_VIEWPORT_HEIGHT} />);
        const list = container.querySelector('[data-sarak-datacards="true"]') as HTMLElement;
        expect(list.style.overflowX).toBe('hidden');
        expect(list.style.maxWidth).toBe('100%');
        expect(list.style.overflowY).toBe('auto');
    });

    it('Zero Hardcode: o card pinta superfície/raio por tokens --sarak-*', () => {
        render(<SarakDataCards columns={columns} rows={rows} height={CARD_VIEWPORT_HEIGHT} />);
        const card = screen.getAllByRole('listitem')[0];
        expect(card.getAttribute('style')).toContain('var(--sarak-card-bg');
        expect(card.getAttribute('style')).toContain('var(--sarak-card-radius');
    });
});
