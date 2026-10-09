/**
 * Escala do SarakGantt, sem React: data ↔ pixel nos três níveis (dia, semana, mês), intervalo padrão,
 * marcas do cabeçalho e cor por tom.
 *
 * A unidade é o DIA DE CALENDÁRIO LOCAL (as mesmas regras de data do SarakCalendar): a distância entre duas
 * datas é contada em dias de calendário, nunca em milissegundos, para o horário de verão não tirar nem pôr
 * uma fração de dia. Cada escala só muda quantos pixels um dia ocupa.
 */
import {
    addDays,
    addMonths,
    addWeeks,
    differenceInCalendarDays,
    endOfMonth,
    endOfWeek,
    isAfter,
    isBefore,
    max as maxDate,
    min as minDate,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { calendarToneColor, parseCalendarDay, type SarakCalendarDate, type SarakCalendarTone } from '../SarakCalendar/calendarEvents';

export type SarakGanttScale = 'day' | 'week' | 'month';

/** Os tons do Gantt são os do calendário: cores do design, nunca hexadecimal. */
export type SarakGanttTone = SarakCalendarTone;

/** Pixels que UM dia ocupa em cada escala. */
export const GANTT_DAY_WIDTH: Record<SarakGanttScale, number> = { day: 32, week: 12, month: 4 };

/** Semana começa na segunda (ISO 8601) nas marcas da escala de semana. */
const WEEK_STARTS_ON = 1;

export interface GanttRange {
    start: Date;
    /** Último dia, inclusive. */
    end: Date;
}

export interface GanttTick {
    date: Date;
    x: number;
    width: number;
}

/** Posição, em pixels, do INÍCIO do dia `date` a partir do início do intervalo. */
export const ganttDateToPixel = (date: Date, rangeStart: Date, scale: SarakGanttScale): number =>
    differenceInCalendarDays(date, rangeStart) * GANTT_DAY_WIDTH[scale];

/** O dia que contém o pixel `x`: qualquer pixel dentro do dia volta para ele. */
export const ganttPixelToDate = (x: number, rangeStart: Date, scale: SarakGanttScale): Date =>
    addDays(startOfDay(rangeStart), Math.floor(x / GANTT_DAY_WIDTH[scale]));

/** Largura total do intervalo, com o último dia inteiro. */
export const ganttRangeWidth = (range: GanttRange, scale: SarakGanttScale): number =>
    ganttDateToPixel(addDays(range.end, 1), range.start, scale);

/** Barra de uma tarefa: do início do primeiro dia ao fim do último (fim inclusive). */
export const ganttBarGeometry = (start: Date, end: Date, range: GanttRange, scale: SarakGanttScale): { x: number; width: number } => {
    const x = ganttDateToPixel(start, range.start, scale);
    return { x, width: ganttDateToPixel(addDays(end, 1), range.start, scale) - x };
};

const PADDING: Record<SarakGanttScale, (span: GanttRange) => GanttRange> = {
    day: ({ start, end }) => ({ start: addDays(start, -2), end: addDays(end, 2) }),
    week: ({ start, end }) => ({
        start: startOfWeek(addWeeks(start, -1), { weekStartsOn: WEEK_STARTS_ON }),
        end: startOfDay(endOfWeek(addWeeks(end, 1), { weekStartsOn: WEEK_STARTS_ON })),
    }),
    month: ({ start, end }) => ({ start: startOfMonth(start), end: startOfDay(endOfMonth(end)) }),
};

/**
 * Intervalo exibido: o das tarefas com uma margem por escala (2 dias; 1 semana inteira de cada lado; os meses
 * inteiros). `rangeStart`/`rangeEnd` vencem a margem. Sem tarefa nenhuma, o intervalo parte de hoje.
 */
export const resolveGanttRange = (
    spans: readonly GanttRange[],
    scale: SarakGanttScale,
    override: { rangeStart?: SarakCalendarDate; rangeEnd?: SarakCalendarDate } = {},
): GanttRange => {
    const today = startOfDay(new Date());
    const tasksSpan = spans.length
        ? { start: minDate(spans.map((span) => span.start)), end: maxDate(spans.map((span) => span.end)) }
        : { start: today, end: addDays(today, 14) };
    const padded = PADDING[scale](tasksSpan);
    const start = (override.rangeStart && parseCalendarDay(override.rangeStart)) || padded.start;
    const end = (override.rangeEnd && parseCalendarDay(override.rangeEnd)) || padded.end;
    return { start, end: isBefore(end, start) ? start : end };
};

const STEP: Record<SarakGanttScale, { first: (date: Date) => Date; next: (date: Date) => Date }> = {
    day: { first: (date) => date, next: (date) => addDays(date, 1) },
    week: { first: (date) => startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }), next: (date) => addWeeks(date, 1) },
    month: { first: (date) => startOfMonth(date), next: (date) => addMonths(date, 1) },
};

/** Marcas do cabeçalho: um dia, uma semana ou um mês cada, recortadas nas bordas do intervalo. */
export const buildGanttTicks = (range: GanttRange, scale: SarakGanttScale): GanttTick[] => {
    const { first, next } = STEP[scale];
    const ticks: GanttTick[] = [];
    for (let cursor = first(range.start); !isAfter(cursor, range.end); cursor = next(cursor)) {
        const from = isBefore(cursor, range.start) ? range.start : cursor;
        const nextStart = next(cursor);
        const to = isAfter(nextStart, addDays(range.end, 1)) ? addDays(range.end, 1) : nextStart;
        const x = ganttDateToPixel(from, range.start, scale);
        ticks.push({ date: from, x, width: ganttDateToPixel(to, range.start, scale) - x });
    }
    return ticks;
};

const KNOWN_TONES: ReadonlySet<string> = new Set(['primary', 'success', 'warning', 'danger', 'info', 'muted']);

/**
 * Cor da barra. Tom fora dos seis (um `neutral` vindo de dado solto, por exemplo) cai em `primary`: a barra
 * nunca fica sem cor.
 */
export const ganttToneColor = (tone: string | undefined): string =>
    calendarToneColor(tone && KNOWN_TONES.has(tone) ? (tone as SarakGanttTone) : 'primary');
