import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CalendarPanelMonthNavigation } from '../CalendarPanelMonthNavigation';

describe('CalendarPanelMonthNavigation', () => {
    it('mostra o mês e encaminha os deslocamentos anterior e próximo', () => {
        const onChangeMonth = vi.fn();
        render(<CalendarPanelMonthNavigation viewMonth={new Date(2026, 0, 15)} onChangeMonth={onChangeMonth} />);

        expect(screen.getByText('January 2026')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
        fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

        expect(onChangeMonth).toHaveBeenNthCalledWith(1, -1);
        expect(onChangeMonth).toHaveBeenNthCalledWith(2, 1);
    });
});
