import { describe, expect, it } from 'vitest';
import {
    calendarDayKey,
    calendarToneColor,
    distributeCalendarEvents,
    moveCalendarFocus,
    parseCalendarDay,
    type SarakCalendarEvent,
    type SarakCalendarTone,
} from '../calendarEvents';

const OCT_GRID_START = new Date(2026, 8, 27);
const OCT_GRID_END = new Date(2026, 10, 7);

describe('parseCalendarDay', () => {
    it('lê AAAA-MM-DD como a meia-noite LOCAL, sem fuso', () => {
        const day = parseCalendarDay('2026-10-07');
        expect(day).toEqual(new Date(2026, 9, 7));
    });

    it('tira a hora de um Date', () => {
        expect(parseCalendarDay(new Date(2026, 9, 7, 23, 59))).toEqual(new Date(2026, 9, 7));
    });

    it('texto fora do formato, dia inexistente e Date inválido devolvem null', () => {
        expect(parseCalendarDay('07/10/2026')).toBeNull();
        expect(parseCalendarDay('2026-02-30')).toBeNull();
        expect(parseCalendarDay(new Date('nada'))).toBeNull();
    });
});

describe('distributeCalendarEvents', () => {
    it('um evento de 3 dias ocupa os 3 dias, com o primeiro e o último marcados', () => {
        const events: SarakCalendarEvent[] = [{ id: 'e1', title: 'Sprint', start: '2026-10-07', end: '2026-10-09' }];
        const byDay = distributeCalendarEvents(events, OCT_GRID_START, OCT_GRID_END);

        expect([...byDay.keys()]).toEqual(['2026-10-07', '2026-10-08', '2026-10-09']);
        expect(byDay.get('2026-10-07')?.[0]).toMatchObject({ isStart: true, isEnd: false });
        expect(byDay.get('2026-10-08')?.[0]).toMatchObject({ isStart: false, isEnd: false });
        expect(byDay.get('2026-10-09')?.[0]).toMatchObject({ isStart: false, isEnd: true });
    });

    it('evento de um dia (sem fim) é início e fim ao mesmo tempo', () => {
        const byDay = distributeCalendarEvents([{ id: 'e', title: 'Entrega', start: new Date(2026, 9, 15) }], OCT_GRID_START, OCT_GRID_END);
        expect(byDay.get('2026-10-15')).toEqual([expect.objectContaining({ isStart: true, isEnd: true })]);
    });

    it('fim antes do início vira evento de um dia só', () => {
        const byDay = distributeCalendarEvents([{ id: 'e', title: 'x', start: '2026-10-10', end: '2026-10-08' }], OCT_GRID_START, OCT_GRID_END);
        expect([...byDay.keys()]).toEqual(['2026-10-10']);
    });

    it('recorta o evento nas bordas da grade, sem marcar início ou fim que caem fora dela', () => {
        const events: SarakCalendarEvent[] = [{ id: 'e', title: 'Longo', start: '2026-09-20', end: '2026-09-28' }];
        const byDay = distributeCalendarEvents(events, OCT_GRID_START, OCT_GRID_END);
        expect([...byDay.keys()]).toEqual(['2026-09-27', '2026-09-28']);
        expect(byDay.get('2026-09-27')?.[0].isStart).toBe(false);
        expect(byDay.get('2026-09-28')?.[0].isEnd).toBe(true);
    });

    it('descarta evento fora da grade ou com início ilegível, e mantém a ordem de entrada no dia', () => {
        const events: SarakCalendarEvent[] = [
            { id: 'fora', title: 'x', start: '2026-12-01' },
            { id: 'ruim', title: 'x', start: 'amanhã' },
            { id: 'a', title: 'A', start: '2026-10-05' },
            { id: 'b', title: 'B', start: '2026-10-05' },
        ];
        const byDay = distributeCalendarEvents(events, OCT_GRID_START, OCT_GRID_END);
        expect([...byDay.keys()]).toEqual(['2026-10-05']);
        expect(byDay.get('2026-10-05')?.map((entry) => entry.event.id)).toEqual(['a', 'b']);
    });

    it('lista vazia devolve mapa vazio', () => {
        expect(distributeCalendarEvents([], OCT_GRID_START, OCT_GRID_END).size).toBe(0);
    });
});

describe('calendarToneColor', () => {
    it('todo tom é variável do design, nunca hexadecimal; sem tom, primary', () => {
        const tones: SarakCalendarTone[] = ['primary', 'success', 'warning', 'danger', 'info', 'muted'];
        for (const tone of tones) {
            expect(calendarToneColor(tone)).toMatch(/^var\(--/);
            expect(calendarToneColor(tone)).not.toMatch(/#/);
        }
        expect(calendarToneColor(undefined)).toBe(calendarToneColor('primary'));
    });
});

describe('moveCalendarFocus', () => {
    const base = new Date(2026, 9, 15);

    it('setas andam um dia ou uma semana; PageUp/PageDown, um mês', () => {
        expect(calendarDayKey(moveCalendarFocus(base, 'ArrowLeft')!)).toBe('2026-10-14');
        expect(calendarDayKey(moveCalendarFocus(base, 'ArrowRight')!)).toBe('2026-10-16');
        expect(calendarDayKey(moveCalendarFocus(base, 'ArrowUp')!)).toBe('2026-10-08');
        expect(calendarDayKey(moveCalendarFocus(base, 'ArrowDown')!)).toBe('2026-10-22');
        expect(calendarDayKey(moveCalendarFocus(base, 'PageUp')!)).toBe('2026-09-15');
        expect(calendarDayKey(moveCalendarFocus(base, 'PageDown')!)).toBe('2026-11-15');
    });

    it('tecla que não navega, inclusive nome herdado de Object, devolve null', () => {
        expect(moveCalendarFocus(base, 'a')).toBeNull();
        expect(moveCalendarFocus(base, 'constructor')).toBeNull();
    });
});
