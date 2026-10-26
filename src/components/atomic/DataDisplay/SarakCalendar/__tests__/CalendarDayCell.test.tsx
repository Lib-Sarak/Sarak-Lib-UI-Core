import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
    CalendarDayCell,
    dayAriaLabel,
    type CalendarDayCellProps,
} from '../CalendarDayCell';
import type { CalendarDayEvent } from '../calendarEvents';

const DATE = new Date(2026, 9, 7);
const entry = (id: string, isStart = true, isEnd = true): CalendarDayEvent => ({
    event: { id, title: `Evento ${id}`, start: '2026-10-07' },
    isStart,
    isEnd,
});

const renderCell = (overrides: Partial<CalendarDayCellProps> = {}) =>
    render(
        <CalendarDayCell
            date={DATE}
            outside={false}
            isToday={false}
            isActive
            dateLabel="quarta-feira, 7 de outubro de 2026"
            events={[]}
            maxEvents={3}
            onFocusDay={vi.fn()}
            {...overrides}
        />,
    );

describe('CalendarDayCell', () => {
    it('o nome acessível soma a data à contagem, no singular e no plural', () => {
        renderCell({ events: [entry('a')] });
        expect(screen.getByRole('gridcell', { name: 'quarta-feira, 7 de outubro de 2026, 1 evento' })).toBeInTheDocument();
        const text = (key: string, vars?: Record<string, string | number>) => `${key}:${JSON.stringify(vars)}`;
        expect(dayAriaLabel(text, 'd', 0)).toBe('calendarDayNoEvents:{"date":"d"}');
        expect(dayAriaLabel(text, 'd', 4)).toBe('calendarDayEvents:{"date":"d","count":4}');
    });

    it('marca dia de fora do mês e hoje', () => {
        renderCell({ outside: true, isToday: true });
        const cell = screen.getByRole('gridcell');
        expect(cell).toHaveAttribute('data-outside', 'true');
        expect(cell).toHaveAttribute('aria-current', 'date');
    });

    it('o chip marca início e fim e o clique nele chama onEventClick, não onDayClick', () => {
        const onEventClick = vi.fn();
        const onDayClick = vi.fn();
        renderCell({ events: [entry('a', true, false)], onEventClick, onDayClick });
        const chip = screen.getByRole('button', { name: 'Evento a' });
        expect(chip).toHaveAttribute('data-event-start', 'true');
        expect(chip).not.toHaveAttribute('data-event-end');
        fireEvent.click(chip);
        expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
        expect(onDayClick).not.toHaveBeenCalled();
    });

    it('usa a cor de texto no número do dia e a cor de título no chip do evento', () => {
        renderCell({ events: [entry('a')] });
        const dayNumber = document.querySelector<HTMLElement>('[role="gridcell"] > span[aria-hidden="true"]');
        const eventChip = screen.getByRole('button', { name: 'Evento a' });

        expect(dayNumber?.style.color).toBe('var(--sarak-text-main, var(--theme-text-primary, inherit))');
        expect(eventChip.style.color).toBe('var(--theme-title, var(--sarak-title-color, inherit))');
    });

    it('o clique na célula chama onDayClick com a data', () => {
        const onDayClick = vi.fn();
        renderCell({ onDayClick });
        fireEvent.click(screen.getByRole('gridcell'));
        expect(onDayClick).toHaveBeenCalledWith(DATE);
    });

    it('acima de maxEvents mostra +N, que chama onDayClick', () => {
        const onDayClick = vi.fn();
        renderCell({ events: [entry('a'), entry('b'), entry('c')], maxEvents: 1, onDayClick });
        expect(screen.getAllByRole('button', { name: /^Evento/ })).toHaveLength(1);
        const more = screen.getByRole('button', { name: 'Ver todos os eventos de quarta-feira, 7 de outubro de 2026' });
        expect(more).toHaveTextContent('+2');
        fireEvent.click(more);
        expect(onDayClick).toHaveBeenCalledTimes(1);
        expect(onDayClick).toHaveBeenCalledWith(DATE);
    });

    it('fora do dia ativo, a célula e os chips saem do Tab', () => {
        renderCell({ isActive: false, events: [entry('a')] });
        expect(screen.getByRole('gridcell')).toHaveAttribute('tabindex', '-1');
        expect(screen.getByRole('button', { name: 'Evento a' })).toHaveAttribute('tabindex', '-1');
    });

    it('o ponto não tem display inline (a classe de container query decide) e o chip troca a caixa do botão pela comum', () => {
        renderCell({ events: [entry('a')] });
        const chip = screen.getByRole('button', { name: 'Evento a' });
        const dot = chip.querySelector<HTMLElement>('span[aria-hidden="true"]')!;
        expect(dot.style.display).toBe('');
        const classes = chip.className.split(/\s+/);
        expect(classes).toEqual(expect.arrayContaining(['normal-case', 'tracking-normal', 'font-normal']));
        expect(classes).not.toContain('uppercase');
        expect(classes).not.toContain('font-black');
        expect(classes).not.toContain('tracking-widest');
    });

    it('renderEvent troca o conteúdo do chip e mantém o título como nome acessível', () => {
        renderCell({ events: [entry('a')], renderEvent: (event) => <strong>custom {event.id}</strong> });
        expect(screen.getByText('custom a')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Evento a' })).toBeInTheDocument();
    });
});
