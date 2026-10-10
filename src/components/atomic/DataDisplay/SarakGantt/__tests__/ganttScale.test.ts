import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays } from 'date-fns';
import { calendarToneColor } from '../../SarakCalendar/calendarEvents';
import {
    GANTT_DAY_WIDTH,
    buildGanttTicks,
    ganttBarGeometry,
    ganttDateToPixel,
    ganttPixelToDate,
    ganttRangeWidth,
    ganttToneColor,
    ganttVisibleBar,
    ganttVisibleProgress,
    resolveGanttRange,
    type SarakGanttScale,
} from '../ganttScale';

const START = new Date(2026, 9, 1);
const SCALES: SarakGanttScale[] = ['day', 'week', 'month'];

afterEach(() => {
    vi.useRealTimers();
});

describe('ganttDateToPixel / ganttPixelToDate', () => {
    it('data → pixel, com os números, nos três níveis', () => {
        const date = new Date(2026, 9, 8);
        expect(ganttDateToPixel(date, START, 'day')).toBe(7 * 32);
        expect(ganttDateToPixel(date, START, 'week')).toBe(7 * 12);
        expect(ganttDateToPixel(date, START, 'month')).toBe(7 * 4);
        expect(GANTT_DAY_WIDTH).toEqual({ day: 32, week: 12, month: 4 });
    });

    it('pixel → data, com os números: o pixel inicial, o último pixel do dia e o seguinte', () => {
        expect(ganttPixelToDate(224, START, 'day')).toEqual(new Date(2026, 9, 8));
        expect(ganttPixelToDate(255, START, 'day')).toEqual(new Date(2026, 9, 8));
        expect(ganttPixelToDate(256, START, 'day')).toEqual(new Date(2026, 9, 9));
        expect(ganttPixelToDate(95, START, 'week')).toEqual(new Date(2026, 9, 8));
        expect(ganttPixelToDate(31, START, 'month')).toEqual(new Date(2026, 9, 8));
    });

    it('ida e volta: todo pixel de cada dia, por 120 dias (inclui a troca de mês), volta para o mesmo dia', () => {
        for (const scale of SCALES) {
            const width = GANTT_DAY_WIDTH[scale];
            for (let offset = 0; offset < 120; offset += 1) {
                const date = addDays(START, offset);
                const x = ganttDateToPixel(date, START, scale);
                for (let inside = 0; inside < width; inside += 1) {
                    expect(ganttPixelToDate(x + inside, START, scale)).toEqual(date);
                }
            }
        }
    });

    it('data antes do início dá pixel negativo e volta para ela', () => {
        const before = new Date(2026, 8, 28);
        const x = ganttDateToPixel(before, START, 'day');
        expect(x).toBe(-3 * 32);
        expect(ganttPixelToDate(x, START, 'day')).toEqual(before);
    });
});

describe('ganttBarGeometry / ganttRangeWidth', () => {
    it('uma tarefa de 3 dias tem a largura de 3 dias em cada escala (fim inclusive)', () => {
        const range = { start: START, end: new Date(2026, 9, 31) };
        for (const scale of SCALES) {
            const bar = ganttBarGeometry(new Date(2026, 9, 5), new Date(2026, 9, 7), range, scale);
            expect(bar).toEqual({ x: 4 * GANTT_DAY_WIDTH[scale], width: 3 * GANTT_DAY_WIDTH[scale] });
        }
    });

    it('a largura do intervalo inclui o último dia inteiro', () => {
        expect(ganttRangeWidth({ start: START, end: new Date(2026, 9, 31) }, 'day')).toBe(31 * 32);
    });
});

describe('ganttVisibleBar / ganttVisibleProgress', () => {
    const range = { start: START, end: new Date(2026, 9, 10) };
    const visible = (start: Date, end: Date) => ganttVisibleBar(ganttBarGeometry(start, end, range, 'day'), range, 'day');

    it('barra dentro do intervalo sai inteira', () => {
        expect(visible(new Date(2026, 9, 3), new Date(2026, 9, 5))).toEqual({ x: 2 * 32, width: 3 * 32 });
    });

    it('barra que cruza uma borda é recortada nela', () => {
        expect(visible(new Date(2026, 8, 28), new Date(2026, 9, 2))).toEqual({ x: 0, width: 2 * 32 });
        expect(visible(new Date(2026, 9, 9), new Date(2026, 9, 14))).toEqual({ x: 8 * 32, width: 2 * 32 });
        expect(visible(new Date(2026, 8, 28), new Date(2026, 9, 14))).toEqual({ x: 0, width: 10 * 32 });
    });

    it('barra inteiramente fora, inclusive encostada na borda, não existe', () => {
        expect(visible(new Date(2026, 8, 20), new Date(2026, 8, 30))).toBeNull();
        expect(visible(new Date(2026, 9, 11), new Date(2026, 9, 12))).toBeNull();
    });

    it('o progresso termina no mesmo dia da barra inteira, recortado como ela', () => {
        const bar = { x: -2 * 32, width: 4 * 32 };
        const shown = { x: 0, width: 2 * 32 };
        expect(ganttVisibleProgress(bar, shown, 75)).toBe(50);
        expect(ganttVisibleProgress(bar, shown, 25)).toBe(0);
        expect(ganttVisibleProgress(bar, shown, 100)).toBe(100);
        expect(ganttVisibleProgress({ x: 0, width: 4 * 32 }, { x: 0, width: 2 * 32 }, 75)).toBe(100);
        expect(ganttVisibleProgress(shown, shown, 40)).toBe(40);
    });
});

describe('resolveGanttRange', () => {
    const spans = [
        { start: new Date(2026, 9, 7), end: new Date(2026, 9, 9) },
        { start: new Date(2026, 9, 14), end: new Date(2026, 9, 20) },
    ];

    it('dia: o intervalo das tarefas com 2 dias de cada lado', () => {
        expect(resolveGanttRange(spans, 'day')).toEqual({ start: new Date(2026, 9, 5), end: new Date(2026, 9, 22) });
    });

    it('semana: semanas inteiras (segunda a domingo), com uma de folga de cada lado', () => {
        // 07/10 (qua) − 1 semana → segunda 28/09; 20/10 (ter) + 1 semana = 27/10 → domingo 01/11.
        expect(resolveGanttRange(spans, 'week')).toEqual({ start: new Date(2026, 8, 28), end: new Date(2026, 10, 1) });
    });

    it('mês: os meses inteiros', () => {
        expect(resolveGanttRange(spans, 'month')).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) });
    });

    it('rangeStart/rangeEnd vencem a margem; fim antes do início vira um dia só', () => {
        expect(resolveGanttRange(spans, 'day', { rangeStart: '2026-10-01', rangeEnd: '2026-10-31' }))
            .toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) });
        expect(resolveGanttRange(spans, 'day', { rangeStart: '2026-10-10', rangeEnd: '2026-10-01' }))
            .toEqual({ start: new Date(2026, 9, 10), end: new Date(2026, 9, 10) });
    });

    it('sem tarefas, parte de hoje', () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 9, 9, 15));
        expect(resolveGanttRange([], 'day')).toEqual({ start: new Date(2026, 9, 7), end: new Date(2026, 9, 25) });
    });
});

describe('buildGanttTicks', () => {
    it('dia: uma marca por dia, cada uma com a largura de um dia', () => {
        const ticks = buildGanttTicks({ start: START, end: new Date(2026, 9, 7) }, 'day');
        expect(ticks).toHaveLength(7);
        expect(ticks.map((tick) => tick.x)).toEqual([0, 32, 64, 96, 128, 160, 192]);
    });

    it('semana: começa na segunda e recorta a primeira e a última nas bordas', () => {
        const ticks = buildGanttTicks({ start: START, end: new Date(2026, 9, 14) }, 'week');
        expect(ticks.map((tick) => [tick.date.getDate(), tick.x, tick.width])).toEqual([
            [1, 0, 4 * 12],
            [5, 4 * 12, 7 * 12],
            [12, 11 * 12, 3 * 12],
        ]);
    });

    it('mês: um por mês, com a largura dos dias dele', () => {
        const ticks = buildGanttTicks({ start: START, end: new Date(2026, 10, 30) }, 'month');
        expect(ticks.map((tick) => tick.width)).toEqual([31 * 4, 30 * 4]);
    });
});

describe('ganttToneColor', () => {
    it('os seis tons são as cores do design, sem hexadecimal', () => {
        for (const tone of ['primary', 'success', 'warning', 'danger', 'info', 'muted'] as const) {
            expect(ganttToneColor(tone)).toBe(calendarToneColor(tone));
            expect(ganttToneColor(tone)).not.toMatch(/#/);
        }
    });

    it('tom desconhecido (neutral, vindo de dado solto) ou ausente cai em primary: a barra nunca fica sem cor', () => {
        expect(ganttToneColor('neutral')).toBe(calendarToneColor('primary'));
        expect(ganttToneColor('constructor')).toBe(calendarToneColor('primary'));
        expect(ganttToneColor(undefined)).toBe(calendarToneColor('primary'));
    });
});
