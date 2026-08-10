import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { buildMonthMatrix, type WeekStart } from './calendarGrid';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakIconButton } from '../../Buttons/SarakIconButton';

// CalendarPanel é deliberadamente independente do SarakUIProvider (usado em contextos sem
// design system carregado) — por isso a grade de 7 colunas usa `gridTemplateColumns` direto
// em vez do hook `useStructuralStyles` (que exige o provider).
const WEEK_GRID_COLUMNS = 'repeat(7, minmax(0, 1fr))';

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

const DAY_PRIMARY = 'var(--sarak-primary-color,#3b82f6)';
const DAY_MUTED = 'var(--text-muted,#94a3b8)';

/** Cor/fundo da célula de dia por estado — via `style` (não `className`), porque o
 * preset `xs` do `SarakButton` já define cor de texto própria (variant ghost) e a
 * ordem de cascata entre classes Tailwind concorrentes não é garantida. */
const dayCellStyle = (outside: boolean, selected: boolean, between: boolean): React.CSSProperties => {
    // padding:0 neutraliza o preset xs (py-1.5/px-3): a célula de 32px não cabe o
    // padding fixo do átomo mais o número de 1-2 dígitos.
    const base: React.CSSProperties = { padding: 0 };
    if (selected) return { ...base, backgroundColor: DAY_PRIMARY, color: 'var(--color-theme-on-primary, #020617)', fontWeight: 700 };
    if (between) return { ...base, backgroundColor: `color-mix(in srgb, ${DAY_PRIMARY} 20%, transparent)`, color: DAY_MUTED };
    return { ...base, color: outside ? `color-mix(in srgb, ${DAY_MUTED} 30%, transparent)` : DAY_MUTED };
};

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
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>
                <NavButton label="Mês anterior" onClick={() => setViewMonth(addMonths(viewMonth, -1))} dir="prev" />
                <span className="text-sm font-bold capitalize text-[var(--text-muted,#94a3b8)]">
                    {format(viewMonth, 'MMMM yyyy', { locale })}
                </span>
                <NavButton label="Próximo mês" onClick={() => setViewMonth(addMonths(viewMonth, 1))} dir="next" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: WEEK_GRID_COLUMNS, marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
                {weekdays.map((day, i) => (
                    <span key={i} className="text-center text-2xs font-black uppercase text-[var(--text-muted,#94a3b8)]/50">
                        {day}
                    </span>
                ))}
            </div>

            <div ref={gridRef} role="grid" onKeyDown={handleKeyDown} className="grid" style={{ gridTemplateColumns: WEEK_GRID_COLUMNS, gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.125)' }}>
                {weeks.flat().map((cell) => {
                    const selected = isSelected(cell.date);
                    const between = inRange(cell.date);
                    return (
                        <SarakButton
                            key={format(cell.date, ISO)}
                            type="button"
                            role="gridcell"
                            data-iso={format(cell.date, ISO)}
                            aria-selected={selected}
                            tabIndex={isSameDay(cell.date, focused) ? 0 : -1}
                            onClick={() => onSelectDay(cell.date)}
                            onFocus={() => setFocused(cell.date)}
                            variant="ghost"
                            size="xs"
                            fullWidth
                            // Estado (cor/fundo) via `style`, não `className`: o preset xs do
                            // SarakButton já tem padding e cor de texto próprios (variant ghost),
                            // e a ordem de cascata entre classes Tailwind não é garantida —
                            // `style` sempre vence, então é o único jeito confiável de a célula
                            // selecionada/fora-do-mês continuar legível.
                            style={dayCellStyle(cell.outside, selected, between)}
                            className={`h-8 tabular-nums ${!selected ? 'hover:bg-[var(--sarak-primary-color,#3b82f6)]/10' : ''}`}
                        >
                            {cell.date.getDate()}
                        </SarakButton>
                    );
                })}
            </div>
        </div>
    );
};

const NavButton: React.FC<{ label: string; dir: 'prev' | 'next'; onClick: () => void }> = ({ label, dir, onClick }) => (
    <SarakIconButton
        variant="ghost"
        size="sm"
        aria-label={label}
        onClick={onClick}
        icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dir === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
        }
    />
);
