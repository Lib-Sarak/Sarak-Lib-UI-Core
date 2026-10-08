import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { VirtualItem } from '@tanstack/react-virtual';
import { describe, expect, it, vi } from 'vitest';
import { SarakDataCardsView } from '../SarakDataCardsView';
import type { SarakDataCardsProps } from '../SarakDataCards';

interface Row {
    id: number;
    name: string;
}

const row: Row = { id: 1, name: 'Ana' };
const CARD_HEIGHT = 48;
const virtualRows: VirtualItem[] = [{ key: 1, index: 0, start: 0, end: CARD_HEIGHT, size: CARD_HEIGHT, lane: 0 }];

describe('SarakDataCardsView', () => {
    it('renderiza valor customizado alinhado e encaminha ativação do cartão', () => {
        const onRowClick = vi.fn();
        const props: SarakDataCardsProps<Row> = {
            columns: [{ id: 'name', header: 'Nome', align: 'right', render: (value) => <strong>{value.name}</strong> }],
            rows: [row],
            rowKeys: [row.id],
            onRowClick,
        };
        const { container } = render(
            <SarakDataCardsView
                props={props}
                scrollRef={createRef<HTMLDivElement>()}
                totalSize={CARD_HEIGHT}
                virtualRows={virtualRows}
                measureElement={vi.fn()}
            />,
        );

        expect(screen.getByText('Ana').tagName).toBe('STRONG');
        expect((container.querySelector('[data-column-id="name"] > span:last-child') as HTMLElement).style.textAlign).toBe('right');
        fireEvent.click(screen.getByRole('listitem'));
        expect(onRowClick).toHaveBeenCalledWith(row);
    });
});
