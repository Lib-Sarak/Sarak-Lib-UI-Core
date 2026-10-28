import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { KanbanColumn } from '../KanbanColumn';
import { sarakColumnTotal } from '../kanbanModel';

const BRL = { type: 'currency', currency: 'BRL' } as const;
const NBSP = / /g;
const column = {
    id: 'won',
    title: 'Ganhas',
    cards: [{ id: 'a', title: 'A', value: 1000 }, { id: 'b', title: 'B', value: 250.5 }, { id: 'c', title: 'C' }],
};

const mount = (ui: React.ReactElement) => render(<DndContext>{ui}</DndContext>);
const totalText = (): string | undefined =>
    document.querySelector('[data-kanban-column-total]')?.textContent?.replace(NBSP, ' ');

describe('sarakColumnTotal', () => {
    it('soma só os valores finitos e devolve null quando nenhum cartão tem valor', () => {
        expect(sarakColumnTotal(column.cards)).toBe(1250.5);
        expect(sarakColumnTotal([{ id: 'x' }, { id: 'y', value: Number.NaN }])).toBeNull();
        expect(sarakColumnTotal([])).toBeNull();
    });
});

describe('KanbanColumn — value, valueFormat e columnTotal', () => {
    it('mostra o valor de cada cartão e a soma no cabeçalho, no formato pedido', () => {
        mount(<KanbanColumn column={column} valueFormat={BRL} />);

        expect(totalText()).toBe('R$ 1.250,50');
        expect(screen.getByText((text) => text.replace(NBSP, ' ') === 'R$ 1.000,00')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('sem nenhum value, o cabeçalho não ganha soma', () => {
        mount(<KanbanColumn column={{ ...column, cards: [{ id: 'a', title: 'A' }] }} valueFormat={BRL} />);

        expect(totalText()).toBeUndefined();
    });

    it('columnTotal false esconde a soma e função devolve o conteúdo próprio', () => {
        const hidden = mount(<KanbanColumn column={column} columnTotal={false} />);
        expect(totalText()).toBeUndefined();
        hidden.unmount();
        mount(<KanbanColumn column={column} columnTotal={(col) => `${col.cards.length} itens`} />);
        expect(totalText()).toBe('3 itens');
    });
});
