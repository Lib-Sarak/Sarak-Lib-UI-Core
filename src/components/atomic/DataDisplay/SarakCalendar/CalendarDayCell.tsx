/**
 * Célula de um dia do SarakCalendar: número do dia, chips dos eventos e o "+N" de excedente.
 *
 * Contêiner estreito (abaixo da faixa de tablet, medido pelo `@container` que o SarakCalendar
 * planta na raiz; classes em `calendarLayout.ts`): o chip mostra só um ponto na cor do tom e
 * deixa o toque passar para a célula, que chama `onDayClick`. Contêiner largo: o chip mostra o
 * título.
 */

import React from 'react';
import { SarakButton } from '../../Buttons/SarakButton';
import { useLibraryText, type LibraryTextFn } from '../../../../core/i18n/useLibraryText';
import { CALENDAR_CELL_CLASS, CALENDAR_CHIP_CLASS, CALENDAR_CHIP_DOT_CLASS, CALENDAR_CHIP_LABEL_CLASS } from './calendarLayout';
import { calendarDayKey, calendarToneColor, type CalendarDayEvent, type SarakCalendarEvent } from './calendarEvents';

export interface CalendarDayCellProps {
    date: Date;
    /** Dia do mês vizinho, só para completar a semana: aparece esmaecido. */
    outside: boolean;
    isToday: boolean;
    /** Dia que recebe o `Tab` (foco itinerante): só ele e os chips dele são tabuláveis. */
    isActive: boolean;
    /** A data por extenso, no idioma da lib; a célula soma a ela a contagem de eventos. */
    dateLabel: string;
    events: CalendarDayEvent[];
    maxEvents: number;
    onDayClick?: (date: Date) => void;
    onEventClick?: (event: SarakCalendarEvent) => void;
    renderEvent?: (event: SarakCalendarEvent) => React.ReactNode;
    onFocusDay: (date: Date) => void;
}

const GAP_XS = 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)';
const RADIUS = 'var(--sarak-card-radius, 8px)';
const MUTED = 'var(--sarak-text-muted, var(--theme-muted, currentColor))';
const MAIN = 'var(--sarak-text-main, var(--color-theme-title, inherit))';
const CAPTION = 'var(--sarak-type-scale-caption, 12px)';

const cellStyle = (outside: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: GAP_XS,
    minWidth: 0,
    padding: GAP_XS,
    borderTop: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)',
    opacity: outside ? 0.45 : 1,
    cursor: 'pointer',
});

const dayNumberStyle = (isToday: boolean): React.CSSProperties => ({
    alignSelf: 'flex-start',
    minWidth: 'calc(var(--sarak-type-scale-caption, 12px) * 1.8)',
    textAlign: 'center',
    borderRadius: RADIUS,
    fontSize: CAPTION,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: isToday ? 700 : 400,
    color: isToday ? 'var(--color-theme-on-primary, var(--theme-surface, inherit))' : MAIN,
    backgroundColor: isToday ? calendarToneColor('primary') : 'transparent',
});

const chipStyle: React.CSSProperties = {
    padding: 0,
    minHeight: 0,
    minWidth: 0,
    justifyContent: 'flex-start',
    background: 'transparent',
    border: 'none',
    color: MAIN,
    fontSize: CAPTION,
    overflow: 'hidden',
};

/** Data por extenso mais a contagem, no singular e no plural pelo catálogo de textos. */
export const dayAriaLabel = (text: LibraryTextFn, date: string, count: number): string => {
    if (count === 0) return text('calendarDayNoEvents', { date });
    if (count === 1) return text('calendarDayOneEvent', { date });
    return text('calendarDayEvents', { date, count });
};

const labelStyle = (entry: CalendarDayEvent): React.CSSProperties => {
    const tone = calendarToneColor(entry.event.tone);
    return {
        padding: `0 ${GAP_XS}`,
        textAlign: 'start',
        backgroundColor: `color-mix(in srgb, ${tone} 18%, transparent)`,
        borderInlineStart: entry.isStart ? `calc(${GAP_XS} * 1.5) solid ${tone}` : undefined,
        borderStartStartRadius: entry.isStart ? RADIUS : 0,
        borderEndStartRadius: entry.isStart ? RADIUS : 0,
        borderStartEndRadius: entry.isEnd ? RADIUS : 0,
        borderEndEndRadius: entry.isEnd ? RADIUS : 0,
    };
};

// Sem `display` aqui: o estilo inline venceria a classe de container query que esconde o ponto no largo.
const dotStyle = (entry: CalendarDayEvent): React.CSSProperties => ({
    width: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.75)',
    aspectRatio: '1',
    borderRadius: '50%',
    backgroundColor: calendarToneColor(entry.event.tone),
});

interface CalendarEventChipProps {
    entry: CalendarDayEvent;
    tabbable: boolean;
    onEventClick?: (event: SarakCalendarEvent) => void;
    renderEvent?: (event: SarakCalendarEvent) => React.ReactNode;
}

function CalendarEventChip({ entry, tabbable, onEventClick, renderEvent }: CalendarEventChipProps) {
    const { event } = entry;
    const activate = () => onEventClick?.(event);

    return (
        <SarakButton
            type="button"
            variant="ghost"
            size="xs"
            data-event-id={event.id}
            data-event-start={entry.isStart ? 'true' : undefined}
            data-event-end={entry.isEnd ? 'true' : undefined}
            aria-label={event.title}
            tabIndex={tabbable ? 0 : -1}
            className={CALENDAR_CHIP_CLASS}
            style={chipStyle}
            onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                activate();
            }}
            onKeyDown={(keyEvent) => {
                if (keyEvent.key !== 'Enter') return;
                // Enter é do chip, não do dia: sem isto a grade também chamaria `onDayClick`.
                keyEvent.preventDefault();
                keyEvent.stopPropagation();
                activate();
            }}
        >
            <span aria-hidden="true" className={CALENDAR_CHIP_DOT_CLASS} style={dotStyle(entry)} />
            <span className={CALENDAR_CHIP_LABEL_CLASS} style={labelStyle(entry)}>
                {renderEvent ? renderEvent(event) : event.title}
            </span>
        </SarakButton>
    );
}

export function CalendarDayCell(props: CalendarDayCellProps) {
    const { date, outside, isToday, isActive, dateLabel, events, maxEvents, onDayClick, onEventClick, renderEvent, onFocusDay } = props;
    const text = useLibraryText();
    const visible = events.slice(0, Math.max(maxEvents, 0));
    const hidden = events.length - visible.length;
    const label = dayAriaLabel(text, dateLabel, events.length);

    return (
        <div
            role="gridcell"
            data-date={calendarDayKey(date)}
            data-outside={outside ? 'true' : undefined}
            data-today={isToday ? 'true' : undefined}
            aria-label={label}
            aria-current={isToday ? 'date' : undefined}
            tabIndex={isActive ? 0 : -1}
            className={CALENDAR_CELL_CLASS}
            style={cellStyle(outside)}
            onFocus={() => onFocusDay(date)}
            onClick={() => onDayClick?.(date)}
        >
            <span aria-hidden="true" style={dayNumberStyle(isToday)}>{date.getDate()}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: GAP_XS, minWidth: 0 }}>
                {visible.map((entry) => (
                    <CalendarEventChip key={entry.event.id} entry={entry} tabbable={isActive} onEventClick={onEventClick} renderEvent={renderEvent} />
                ))}
                {hidden > 0 && (
                    <SarakButton
                        type="button"
                        variant="ghost"
                        size="xs"
                        data-calendar-more="true"
                        aria-label={text('calendarMoreLabel', { date: dateLabel })}
                        tabIndex={isActive ? 0 : -1}
                        style={{ ...chipStyle, color: MUTED }}
                        onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            onDayClick?.(date);
                        }}
                    >
                        {text('calendarMore', { count: hidden })}
                    </SarakButton>
                )}
            </div>
        </div>
    );
}

export default CalendarDayCell;
