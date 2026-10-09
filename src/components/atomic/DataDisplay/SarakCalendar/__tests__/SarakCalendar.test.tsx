import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakCalendar, capitalizeFirst } from '../SarakCalendar';
import type { SarakCalendarEvent } from '../calendarEvents';

// Outubro de 2026 começa numa quinta-feira. "Hoje" fica em junho, fora do mês exibido, para
// que o dia tabulável seja o 1.º do mês — exceto nos testes que fixam outro dia.
const OCTOBER = new Date(2026, 9, 1);
const fullDate = (date: Date) => new Intl.DateTimeFormat('pt', { dateStyle: 'full' }).format(date);
const cell = (key: string) => document.querySelector<HTMLElement>(`[role="gridcell"][data-date="${key}"]`)!;
const monthText = (date: Date) => new Intl.DateTimeFormat('pt', { month: 'long', year: 'numeric' }).format(date);
/** O título exibido: o texto do Intl com maiúscula só na primeira letra. */
const monthTitle = (date: Date) => capitalizeFirst(monthText(date), 'pt');

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 10));
});
afterEach(() => {
    vi.useRealTimers();
});

describe('SarakCalendar', () => {
    it('renderiza sem Provider uma grade com nome traduzido e o mês por Intl', () => {
        render(<SarakCalendar events={[]} defaultMonth={OCTOBER} />);
        expect(screen.getByRole('grid', { name: `Calendário de ${monthText(OCTOBER)}` })).toBeInTheDocument();
        expect(screen.getByText(monthTitle(OCTOBER))).toBeInTheDocument();
        expect(screen.queryAllByRole('button', { name: /Evento/ })).toHaveLength(0);
    });

    it('o título escreve o mês com maiúscula só na primeira letra, sem capitalizar cada palavra', () => {
        render(<SarakCalendar events={[]} defaultMonth={OCTOBER} />);
        expect(screen.getByText('Outubro de 2026')).toBeInTheDocument();
        expect(screen.queryByText('Outubro De 2026')).toBeNull();
    });

    it('capitalizeFirst preserva o resto do texto do Intl nos seis idiomas do catálogo', () => {
        const expected: Record<string, string> = {
            pt: 'Outubro de 2026', en: 'October 2026', es: 'Octubre de 2026',
            fr: 'Octobre 2026', de: 'Oktober 2026', it: 'Ottobre 2026',
        };
        for (const [language, title] of Object.entries(expected)) {
            const text = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(OCTOBER);
            expect(capitalizeFirst(text, language)).toBe(title);
        }
    });

    it('um evento de 3 dias aparece em 3 dias, com o primeiro e o último marcados', () => {
        const events: SarakCalendarEvent[] = [{ id: 'e1', title: 'Sprint', start: '2026-10-07', end: '2026-10-09' }];
        render(<SarakCalendar events={events} defaultMonth={OCTOBER} />);
        const chips = screen.getAllByRole('button', { name: 'Sprint' });
        expect(chips).toHaveLength(3);
        expect(within(cell('2026-10-07')).getByRole('button', { name: 'Sprint' })).toHaveAttribute('data-event-start', 'true');
        expect(within(cell('2026-10-08')).getByRole('button', { name: 'Sprint' })).not.toHaveAttribute('data-event-start');
        expect(within(cell('2026-10-09')).getByRole('button', { name: 'Sprint' })).toHaveAttribute('data-event-end', 'true');
    });

    it('acima de maxEventsPerDay o dia mostra +N, e o clique chama onDayClick', () => {
        const onDayClick = vi.fn();
        const events = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, title: `Tarefa ${id}`, start: '2026-10-20' }));
        render(<SarakCalendar events={events} defaultMonth={OCTOBER} onDayClick={onDayClick} />);
        const day = cell('2026-10-20');
        expect(within(day).getAllByRole('button', { name: /^Tarefa/ })).toHaveLength(3);
        fireEvent.click(within(day).getByRole('button', { name: /^Ver todos/ }));
        expect(within(day).getByText('+2')).toBeInTheDocument();
        expect(onDayClick).toHaveBeenCalledWith(new Date(2026, 9, 20));
    });

    it('cada dia tem aria-label com a data e a contagem', () => {
        render(<SarakCalendar events={[{ id: 'x', title: 'Entrega', start: '2026-10-12' }]} defaultMonth={OCTOBER} />);
        expect(cell('2026-10-12')).toHaveAttribute('aria-label', `${fullDate(new Date(2026, 9, 12))}, 1 evento`);
        expect(cell('2026-10-13')).toHaveAttribute('aria-label', `${fullDate(new Date(2026, 9, 13))}, sem eventos`);
    });

    it('não controlado: anterior, próximo e hoje mudam o mês sozinhos e avisam onMonthChange', () => {
        const onMonthChange = vi.fn();
        render(<SarakCalendar events={[]} defaultMonth={OCTOBER} onMonthChange={onMonthChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
        expect(screen.getByText(monthTitle(new Date(2026, 10, 1)))).toBeInTheDocument();
        expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 10, 1));
        fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
        fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
        expect(screen.getByText(monthTitle(new Date(2026, 8, 1)))).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
        expect(screen.getByText(monthTitle(new Date(2026, 5, 1)))).toBeInTheDocument();
        expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 5, 1));
    });

    it('controlado: a navegação só chama onMonthChange; o mês muda quando a prop muda', () => {
        const onMonthChange = vi.fn();
        const { rerender } = render(<SarakCalendar events={[]} month={OCTOBER} onMonthChange={onMonthChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
        expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 10, 1));
        expect(screen.getByText(monthTitle(OCTOBER))).toBeInTheDocument();
        rerender(<SarakCalendar events={[]} month={new Date(2026, 10, 1)} onMonthChange={onMonthChange} />);
        expect(screen.getByText(monthTitle(new Date(2026, 10, 1)))).toBeInTheDocument();
    });

    it('weekStartsOn 0 e 1 mudam a primeira coluna, com os nomes por Intl', () => {
        const weekday = (date: Date) => new Intl.DateTimeFormat('pt', { weekday: 'short' }).format(date);
        const { unmount } = render(<SarakCalendar events={[]} defaultMonth={OCTOBER} weekStartsOn={0} />);
        expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent(weekday(new Date(2026, 9, 4)));
        expect(screen.getAllByRole('gridcell')[0]).toHaveAttribute('data-date', '2026-09-27');
        unmount();
        render(<SarakCalendar events={[]} defaultMonth={OCTOBER} weekStartsOn={1} />);
        expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent(weekday(new Date(2026, 9, 5)));
        expect(screen.getAllByRole('gridcell')[0]).toHaveAttribute('data-date', '2026-09-28');
    });

    it('destaca hoje quando está no mês exibido', () => {
        vi.setSystemTime(new Date(2026, 9, 20, 9));
        render(<SarakCalendar events={[]} />);
        expect(cell('2026-10-20')).toHaveAttribute('aria-current', 'date');
        expect(cell('2026-10-20')).toHaveAttribute('tabindex', '0');
    });

    it('teclado: setas movem o foco entre dias e Enter no dia chama onDayClick', async () => {
        const onDayClick = vi.fn();
        const user = userEvent.setup();
        render(<SarakCalendar events={[]} defaultMonth={OCTOBER} onDayClick={onDayClick} />);
        cell('2026-10-01').focus();
        await user.keyboard('{ArrowRight}');
        expect(cell('2026-10-02')).toHaveFocus();
        await user.keyboard('{ArrowDown}');
        expect(cell('2026-10-09')).toHaveFocus();
        expect(cell('2026-10-09')).toHaveAttribute('tabindex', '0');
        expect(cell('2026-10-01')).toHaveAttribute('tabindex', '-1');
        await user.keyboard('{Enter}');
        expect(onDayClick).toHaveBeenCalledWith(new Date(2026, 9, 9));
    });

    it('teclado: sair pela borda do mês vira a página e leva o foco junto', async () => {
        const user = userEvent.setup();
        render(<SarakCalendar events={[]} defaultMonth={OCTOBER} />);
        cell('2026-10-01').focus();
        await user.keyboard('{ArrowLeft}');
        expect(screen.getByText(monthTitle(new Date(2026, 8, 1)))).toBeInTheDocument();
        expect(cell('2026-09-30')).toHaveFocus();
    });

    it('teclado: Enter no chip chama onEventClick e não onDayClick', async () => {
        const onEventClick = vi.fn();
        const onDayClick = vi.fn();
        const user = userEvent.setup();
        const event: SarakCalendarEvent = { id: 'c1', title: 'Revisão', start: '2026-10-01', meta: { card: 7 } };
        render(<SarakCalendar events={[event]} defaultMonth={OCTOBER} onEventClick={onEventClick} onDayClick={onDayClick} />);
        screen.getByRole('button', { name: 'Revisão' }).focus();
        await user.keyboard('{Enter}');
        expect(onEventClick).toHaveBeenCalledTimes(1);
        expect(onEventClick).toHaveBeenCalledWith(event);
        expect(onDayClick).not.toHaveBeenCalled();
    });

    it('planta @container na raiz, ancestral das classes de contêiner estreito dos dias', () => {
        const { container } = render(<SarakCalendar events={[]} defaultMonth={OCTOBER} className="extra" />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain('@container');
        expect(root.className).toContain('extra');
        expect(root.contains(cell('2026-10-01'))).toBe(true);
    });
});
