import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { buildMonthMatrix, type WeekStart } from './calendarGrid';

export type { WeekStart };

/**
 * Locale do `date-fns` passado adiante para `format`. Tipado de forma estrutural
 * (objeto opaco) porque o tipo nomeado `Locale` não resolve sob
 * `moduleResolution: node` — os locales reais (`ptBR`, etc.) são objetos atribuíveis.
 */
export type DateLocale = object;

const ISO = 'yyyy-MM-dd';

export interface CalendarPanelProps {
    mode: 'single' | 'range';
    start: Date | null;
    end: Date | null;
    locale?: DateLocale;
    weekStartsOn?: WeekStart;
    onSelectDay: (date: Date) => void;
}

/** Desloca o dia em foco conforme a tecla de seta (Spec 11, Regra 1 — teclado). */
const moveByKey = (date: Date, key: string): Date | null => {
    if (key === 'ArrowLeft') return addDays(date, -1);
    if (key === 'ArrowRight') return addDays(date, 1);
    if (key === 'ArrowUp') return addDays(date, -7);
    if (key === 'ArrowDown') return addDays(date, 7);
    if (key === 'PageUp') return addMonths(date, -1);
    if (key === 'PageDown') return addMonths(date, 1);
    return null;
};

/**
 * Painel de calendário do SarakDatePicker (Spec 11, Regra 1).
 * Grade de dias com `roving tabindex`: só o dia em foco é tabulável; as setas
 * movem o foco (e a página do mês quando cruzam a borda); Enter/Espaço seleciona.
 */
export const CalendarPanel: React.FC<CalendarPanelProps> = ({
    mode,
    start,
    end,
    locale,
    weekStartsOn = 0,
    onSelectDay,
}) => {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const [focused, setFocused] = useState<Date>(start ?? new Date());
    const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(start ?? new Date()));

    const weeks = useMemo(() => buildMonthMatrix(viewMonth, weekStartsOn), [viewMonth, weekStartsOn]);
    const weekdays = useMemo(
        () => weeks[0].map((cell) => format(cell.date, 'EEEEEE', { locale })),
        [weeks, locale],
    );

    // Após mover o foco por teclado: vira a página do mês se o dia saiu dele e, já na
    // página certa, move o foco do DOM para o dia ativo (um único efeito por `focused`).
    useEffect(() => {
        if (!isSameMonth(focused, viewMonth)) {
            setViewMonth(startOfMonth(focused));
            return;
        }
        const iso = format(focused, ISO);
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`)?.focus();
    }, [focused, viewMonth]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectDay(focused);
            return;
        }
        const next = moveByKey(focused, e.key);
        if (next) {
            e.preventDefault();
            setFocused(next);
        }
    };

    const isSelected = (date: Date): boolean =>
        (!!start && isSameDay(date, start)) || (!!end && isSameDay(date, end));
    const inRange = (date: Date): boolean =>
        mode === 'range' && !!start && !!end && isWithinInterval(date, { start, end });

    return (
        <div className="w-64">
            <div className="flex items-center justify-between mb-2">
                <NavButton label="Mês anterior" onClick={() => setViewMonth(addMonths(viewMonth, -1))} dir="prev" />
                <span className="text-sm font-bold capitalize text-[var(--text-muted,#94a3b8)]">
                    {format(viewMonth, 'MMMM yyyy', { locale })}
                </span>
                <NavButton label="Próximo mês" onClick={() => setViewMonth(addMonths(viewMonth, 1))} dir="next" />
            </div>

            <div className="grid grid-cols-7 mb-1">
                {weekdays.map((day, i) => (
                    <span key={i} className="text-center text-2xs font-black uppercase text-[var(--text-muted,#94a3b8)]/50">
                        {day}
                    </span>
                ))}
            </div>

            <div ref={gridRef} role="grid" onKeyDown={handleKeyDown} className="grid grid-cols-7 gap-0.5">
                {weeks.flat().map((cell) => {
                    const selected = isSelected(cell.date);
                    const between = inRange(cell.date);
                    return (
                        <button
                            key={format(cell.date, ISO)}
                            type="button"
                            role="gridcell"
                            data-iso={format(cell.date, ISO)}
                            aria-selected={selected}
                            tabIndex={isSameDay(cell.date, focused) ? 0 : -1}
                            onClick={() => onSelectDay(cell.date)}
                            onFocus={() => setFocused(cell.date)}
                            className={[
                                'h-8 w-8 rounded-md text-xs tabular-nums transition-colors',
                                cell.outside ? 'text-[var(--text-muted,#94a3b8)]/30' : 'text-[var(--text-muted,#94a3b8)]',
                                selected ? 'bg-[var(--sarak-primary-color,#3b82f6)] text-white font-bold' : '',
                                between && !selected ? 'bg-[var(--sarak-primary-color,#3b82f6)]/20' : '',
                                !selected ? 'hover:bg-[var(--sarak-primary-color,#3b82f6)]/10' : '',
                            ].join(' ')}
                        >
                            {cell.date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const NavButton: React.FC<{ label: string; dir: 'prev' | 'next'; onClick: () => void }> = ({ label, dir, onClick }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted,#94a3b8)] hover:bg-[var(--sarak-primary-color,#3b82f6)]/10"
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dir === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
        </svg>
    </button>
);
