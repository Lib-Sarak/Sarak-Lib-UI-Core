import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { CalendarPanel } from '../CalendarPanel';

const JAN_15 = new Date(2026, 0, 15);

describe('CalendarPanel', () => {
    it('deve renderizar a grade do mês com 7 colunas de cabeçalho', () => {
        render(<CalendarPanel mode="single" start={JAN_15} end={null} onSelectDay={() => undefined} />);
        // Sem `locale`, o date-fns usa o padrão en-US.
        expect(screen.getByText('January 2026')).toBeInTheDocument();
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('deve reportar o dia clicado', () => {
        const onSelectDay = vi.fn();
        render(<CalendarPanel mode="single" start={JAN_15} end={null} onSelectDay={onSelectDay} />);
        fireEvent.click(within(screen.getByRole('grid')).getByText('20'));
        const picked = onSelectDay.mock.calls[0][0] as Date;
        expect(picked.getDate()).toBe(20);
        expect(picked.getMonth()).toBe(0);
    });
});

describe('CalendarPanel — navegação e intervalo', () => {
    it('deve mover o foco com setas e selecionar com Enter', () => {
        const onSelectDay = vi.fn();
        render(<CalendarPanel mode="single" start={JAN_15} end={null} onSelectDay={onSelectDay} />);
        const grid = screen.getByRole('grid');
        fireEvent.keyDown(grid, { key: 'ArrowDown' }); // +7 dias → 22
        fireEvent.keyDown(grid, { key: 'Enter' });
        expect((onSelectDay.mock.calls[0][0] as Date).getDate()).toBe(22);
    });

    it('deve destacar os dias dentro do intervalo (modo range)', () => {
        render(
            <CalendarPanel mode="range" start={new Date(2026, 0, 10)} end={new Date(2026, 0, 20)} onSelectDay={() => undefined} />,
        );
        const day = within(screen.getByRole('grid')).getByRole('gridcell', { name: '15' });
        expect(day).toHaveClass('tabular-nums');
    });
});

describe('CalendarPanel — dias indisponíveis', () => {
    it('pula dias desabilitados no foco e não os seleciona pelo teclado', () => {
        const onSelectDay = vi.fn();
        render(
            <CalendarPanel
                mode="single"
                start={JAN_15}
                end={null}
                isDateDisabled={(iso) => iso === '2026-01-16'}
                onSelectDay={onSelectDay}
            />,
        );
        const grid = screen.getByRole('grid');
        const disabledDay = within(grid).getByRole('gridcell', { name: '16' });

        expect(disabledDay).toBeDisabled();
        fireEvent.keyDown(grid, { key: 'ArrowRight' });
        fireEvent.keyDown(grid, { key: 'Enter' });

        expect(within(grid).getByRole('gridcell', { name: '17' })).toHaveAttribute('tabindex', '0');
        expect(onSelectDay).toHaveBeenCalledWith(new Date(2026, 0, 17));
    });
});
