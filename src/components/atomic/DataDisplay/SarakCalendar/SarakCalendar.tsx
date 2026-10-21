/**
 * SarakCalendar — calendário mensal de eventos (os cartões de um quadro pelo prazo, por
 * exemplo). A grade vem da mesma matemática do SarakDatePicker (`buildMonthMatrix`); cada
 * evento aparece em todos os dias que cobre, com o primeiro e o último marcados.
 *
 * Grade navegável por teclado (`role="grid"`, foco itinerante): setas e PageUp/PageDown movem
 * o foco entre os dias, e virar a borda do mês vira a página; `Enter` no dia chama
 * `onDayClick`, no chip chama `onEventClick`. Mês, ano e dias da semana saem de `Intl`, no
 * idioma da lib. Renderiza sem `SarakUIProvider` (cai no português). Estilo só por token.
 *
 * Fora do contrato, por ora: arrastar evento entre dias, grade de horas, recorrência e fuso.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addMonths, isSameDay, isSameMonth, startOfDay, startOfMonth } from 'date-fns';
import { buildMonthMatrix, type SarakWeekStart } from '../../Inputs/internal/calendarGrid';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakIconButton } from '../../Buttons/SarakIconButton';
import { SarakIcon } from '../../Icon/SarakIcon';
import { useSarakUIOptional } from '../../../../core/Provider/SarakUIProvider';
import { resolveLibraryLanguage, useLibraryText } from '../../../../core/i18n/useLibraryText';
import { calendarDayKey, distributeCalendarEvents, moveCalendarFocus, type SarakCalendarEvent } from './calendarEvents';
import { CalendarDayCell } from './CalendarDayCell';

export interface SarakCalendarProps {
    /** Eventos do mês (e de fora dele: só os que tocam a grade visível aparecem). Vazio mostra a grade sem chips. */
    events: SarakCalendarEvent[];
    /** Mês exibido, no modo controlado: a navegação chama `onMonthChange` e quem chama atualiza esta prop. */
    month?: Date;
    /** Chamado a cada troca de mês com o primeiro dia do novo mês, nos dois modos. */
    onMonthChange?: (month: Date) => void;
    /** Mês inicial no modo não controlado (sem `month`). Omitido, abre no mês de hoje. */
    defaultMonth?: Date;
    /** Primeira coluna da semana: `0` domingo, `1` segunda. Omitido, `0`. */
    weekStartsOn?: SarakWeekStart;
    /** Clique ou `Enter` num chip de evento. */
    onEventClick?: (event: SarakCalendarEvent) => void;
    /** Clique ou `Enter` num dia, toque no dia em contêiner estreito, e o "+N" do dia cheio. */
    onDayClick?: (date: Date) => void;
    /** Conteúdo do chip no lugar do título. O nome acessível do chip continua sendo o título. */
    renderEvent?: (event: SarakCalendarEvent) => React.ReactNode;
    /** Quantos chips um dia mostra antes do "+N". Omitido, `3`. */
    maxEventsPerDay?: number;
    /** Nome acessível da grade. Omitido, usa o texto traduzido "Calendário de <mês e ano>". */
    label?: string;
    className?: string;
}

const GAP_SM = 'var(--sarak-layout-gap-sm, 8px)';
const WEEK_ROW: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: GAP_SM };
const weekdayStyle: React.CSSProperties = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    textTransform: 'capitalize',
    fontSize: 'var(--sarak-type-scale-caption, 12px)',
    color: 'var(--sarak-text-muted, var(--theme-muted, currentColor))',
};

/** Mês exibido: o da prop no modo controlado, o interno no não controlado. */
function useCalendarMonth(month: Date | undefined, defaultMonth: Date | undefined, onMonthChange?: (month: Date) => void) {
    const [internal, setInternal] = useState(() => startOfMonth(defaultMonth ?? new Date()));
    const viewMonth = month ? startOfMonth(month) : internal;
    const changeMonth = (next: Date) => {
        const first = startOfMonth(next);
        if (!month) setInternal(first);
        onMonthChange?.(first);
    };
    return [viewMonth, changeMonth] as const;
}

/** Formatadores no idioma da lib: mês e ano do título, dia da semana e data por extenso. */
function useCalendarFormats() {
    const language = resolveLibraryLanguage(useSarakUIOptional()?.design?.language);
    return useMemo(
        () => ({
            language,
            month: new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }),
            weekday: new Intl.DateTimeFormat(language, { weekday: 'short' }),
            weekdayLong: new Intl.DateTimeFormat(language, { weekday: 'long' }),
            day: new Intl.DateTimeFormat(language, { dateStyle: 'full' }),
        }),
        [language],
    );
}

/**
 * Maiúscula só na primeira letra do mês e ano do `Intl` (`outubro de 2026` → `Outubro de 2026`). O
 * `text-transform: capitalize` do CSS poria maiúscula em cada palavra, inclusive na preposição.
 */
export const capitalizeFirst = (text: string, language: string): string =>
    text.charAt(0).toLocaleUpperCase(language) + text.slice(1);

interface CalendarHeaderProps {
    title: string;
    onPrevious: () => void;
    onToday: () => void;
    onNext: () => void;
}

function CalendarHeader({ title, onPrevious, onToday, onNext }: CalendarHeaderProps) {
    const text = useLibraryText();
    return (
        <div style={{ ...row, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span
                aria-live="polite"
                style={{
                    fontWeight: 'var(--sarak-body-weight, 400)',
                    color: 'var(--sarak-text-main, var(--color-theme-title, inherit))',
                }}
            >
                {title}
            </span>
            <div style={row}>
                <SarakIconButton variant="ghost" size="sm" icon={<SarakIcon name="ChevronLeft" />} aria-label={text('calendarPrevious')} onClick={onPrevious} />
                <SarakButton type="button" variant="ghost" size="sm" onClick={onToday}>{text('calendarToday')}</SarakButton>
                <SarakIconButton variant="ghost" size="sm" icon={<SarakIcon name="ChevronRight" />} aria-label={text('calendarNext')} onClick={onNext} />
            </div>
        </div>
    );
}

export function SarakCalendar({
    events,
    month,
    onMonthChange,
    defaultMonth,
    weekStartsOn = 0,
    onEventClick,
    onDayClick,
    renderEvent,
    maxEventsPerDay = 3,
    label,
    className,
}: SarakCalendarProps) {
    const text = useLibraryText();
    const formats = useCalendarFormats();
    const [viewMonth, changeMonth] = useCalendarMonth(month, defaultMonth, onMonthChange);
    const [focused, setFocused] = useState<Date>(() => startOfDay(new Date()));
    const gridRef = useRef<HTMLDivElement | null>(null);
    // Só a navegação por teclado move o foco do DOM: montar ou trocar o mês pelo botão não rouba o foco.
    const pendingFocus = useRef(false);

    const weeks = useMemo(() => buildMonthMatrix(viewMonth, weekStartsOn), [viewMonth, weekStartsOn]);
    const byDay = useMemo(
        () => distributeCalendarEvents(events, weeks[0][0].date, weeks[weeks.length - 1][6].date),
        [events, weeks],
    );
    // O dia tabulável: o que tem foco, se estiver no mês exibido; senão, o primeiro dia do mês.
    const active = isSameMonth(focused, viewMonth) ? focused : viewMonth;
    const activeKey = calendarDayKey(active);
    const today = startOfDay(new Date());
    const monthText = formats.month.format(viewMonth);

    useEffect(() => {
        if (!pendingFocus.current) return;
        pendingFocus.current = false;
        gridRef.current?.querySelector<HTMLElement>(`[data-date="${activeKey}"]`)?.focus();
    }, [activeKey, viewMonth]);

    const handleKeyDown = (keyEvent: React.KeyboardEvent<HTMLDivElement>) => {
        const isCell = (keyEvent.target as HTMLElement).getAttribute('role') === 'gridcell';
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            if (!isCell) return;
            keyEvent.preventDefault();
            onDayClick?.(active);
            return;
        }
        const next = moveCalendarFocus(active, keyEvent.key);
        if (!next) return;
        keyEvent.preventDefault();
        pendingFocus.current = true;
        setFocused(next);
        if (!isSameMonth(next, viewMonth)) changeMonth(next);
    };

    const goToday = () => {
        setFocused(today);
        changeMonth(today);
    };

    return (
        <section className={`@container ${className ?? ''}`} style={{ display: 'flex', flexDirection: 'column', gap: GAP_SM, minWidth: 0 }}>
            <CalendarHeader
                title={capitalizeFirst(monthText, formats.language)}
                onPrevious={() => changeMonth(addMonths(viewMonth, -1))}
                onToday={goToday}
                onNext={() => changeMonth(addMonths(viewMonth, 1))}
            />
            <div ref={gridRef} role="grid" aria-label={label ?? text('calendarLabel', { month: monthText })} onKeyDown={handleKeyDown}>
                <div role="row" style={WEEK_ROW}>
                    {weeks[0].map((cell) => (
                        <span key={cell.date.getDay()} role="columnheader" title={formats.weekdayLong.format(cell.date)} style={weekdayStyle}>
                            {formats.weekday.format(cell.date)}
                        </span>
                    ))}
                </div>
                {weeks.map((week) => (
                    <div key={calendarDayKey(week[0].date)} role="row" style={WEEK_ROW}>
                        {week.map((cell) => {
                            const key = calendarDayKey(cell.date);
                            return (
                                <CalendarDayCell
                                    key={key}
                                    date={cell.date}
                                    outside={cell.outside}
                                    isToday={isSameDay(cell.date, today)}
                                    isActive={key === activeKey}
                                    dateLabel={formats.day.format(cell.date)}
                                    events={byDay.get(key) ?? []}
                                    maxEvents={maxEventsPerDay}
                                    onDayClick={onDayClick}
                                    onEventClick={onEventClick}
                                    renderEvent={renderEvent}
                                    onFocusDay={setFocused}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default SarakCalendar;
