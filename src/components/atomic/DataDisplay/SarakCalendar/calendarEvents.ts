/**
 * Lógica pura do SarakCalendar, sem React: leitura das datas, distribuição de cada evento
 * nos dias que ele cobre, cor por tom e deslocamento do foco pelo teclado.
 *
 * Toda data é DIA DE CALENDÁRIO LOCAL: `AAAA-MM-DD` vira a meia-noite local (sem fuso, ao
 * contrário de `new Date('AAAA-MM-DD')`, que lê em UTC e pode cair no dia anterior) e um
 * `Date` perde a hora.
 */
import { addDays, addMonths, eachDayOfInterval, format, isAfter, isBefore, isSameDay, isValid, startOfDay } from 'date-fns';

export type SarakCalendarTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

/** `Date` ou texto `AAAA-MM-DD`. */
export type SarakCalendarDate = Date | string;

export interface SarakCalendarEvent {
    id: string;
    title: string;
    /** Primeiro dia do evento. */
    start: SarakCalendarDate;
    /** Último dia, inclusive. Omitido (ou antes do início), o evento ocupa só o dia do início. */
    end?: SarakCalendarDate;
    /** Cor do chip, pelas cores do design. Omitido, usa `primary`. */
    tone?: SarakCalendarTone;
    /** Dado livre de quem chama, devolvido intacto em `onEventClick`; a lib não o lê. */
    meta?: unknown;
}

/** Um evento num dia: o chip sabe se o dia é o primeiro e/ou o último do evento. */
export interface CalendarDayEvent {
    event: SarakCalendarEvent;
    isStart: boolean;
    isEnd: boolean;
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Chave estável de um dia, usada no mapa de eventos e no `data-date` da célula. */
export const calendarDayKey = (date: Date): string => format(date, 'yyyy-MM-dd');

/** Lê `Date` ou `AAAA-MM-DD` como dia local; texto em outro formato ou data inválida devolve `null`. */
export const parseCalendarDay = (value: SarakCalendarDate): Date | null => {
    if (value instanceof Date) return isValid(value) ? startOfDay(value) : null;
    const match = ISO_DAY.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return calendarDayKey(date) === value ? date : null;
};

const eventSpan = (event: SarakCalendarEvent): { start: Date; end: Date } | null => {
    const start = parseCalendarDay(event.start);
    if (!start) return null;
    const end = event.end === undefined ? null : parseCalendarDay(event.end);
    return { start, end: end && !isBefore(end, start) ? end : start };
};

/**
 * Distribui os eventos nos dias de `[gridStart, gridEnd]`: um item POR DIA COBERTO, com o
 * primeiro e o último dia marcados. Evento com início ilegível é descartado; a ordem de
 * entrada se mantém dentro de cada dia.
 */
export const distributeCalendarEvents = (
    events: readonly SarakCalendarEvent[],
    gridStart: Date,
    gridEnd: Date,
): Map<string, CalendarDayEvent[]> => {
    const byDay = new Map<string, CalendarDayEvent[]>();
    for (const event of events) {
        const span = eventSpan(event);
        if (!span || isAfter(span.start, gridEnd) || isBefore(span.end, gridStart)) continue;
        const from = isBefore(span.start, gridStart) ? gridStart : span.start;
        const to = isAfter(span.end, gridEnd) ? gridEnd : span.end;
        for (const day of eachDayOfInterval({ start: from, end: to })) {
            const key = calendarDayKey(day);
            const entry = { event, isStart: isSameDay(day, span.start), isEnd: isSameDay(day, span.end) };
            byDay.set(key, [...(byDay.get(key) ?? []), entry]);
        }
    }
    return byDay;
};

/** Cor de cada tom: só variáveis do design, com outra variável como reserva — nunca hexadecimal. */
const TONE_COLOR: Record<SarakCalendarTone, string> = {
    primary: 'var(--sarak-primary-color, var(--theme-primary, currentColor))',
    success: 'var(--sarak-status-success-color, var(--theme-success, currentColor))',
    warning: 'var(--sarak-status-warning-color, var(--theme-warning, currentColor))',
    danger: 'var(--sarak-status-error-color, var(--theme-error, currentColor))',
    info: 'var(--sarak-status-info-color, var(--theme-info, currentColor))',
    muted: 'var(--sarak-text-muted, var(--theme-muted, currentColor))',
};

export const calendarToneColor = (tone: SarakCalendarTone | undefined): string => TONE_COLOR[tone ?? 'primary'];

// `Map`, não objeto literal: a tecla vem do evento, e `obj[key]` alcançaria `Object.prototype`.
const KEY_STEP = new Map<string, (date: Date) => Date>([
    ['ArrowLeft', (date) => addDays(date, -1)],
    ['ArrowRight', (date) => addDays(date, 1)],
    ['ArrowUp', (date) => addDays(date, -7)],
    ['ArrowDown', (date) => addDays(date, 7)],
    ['PageUp', (date) => addMonths(date, -1)],
    ['PageDown', (date) => addMonths(date, 1)],
]);

/** Dia que recebe o foco depois da tecla; `null` quando a tecla não navega. */
export const moveCalendarFocus = (date: Date, key: string): Date | null => KEY_STEP.get(key)?.(date) ?? null;
