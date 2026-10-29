import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { buildMonthMatrix, type SarakWeekStart } from './calendarGrid';
import { findNextEnabledSarakDate, isDateWithinSarakBounds, toSarakIsoDate } from './datePresets';
import { SarakButton } from '../../Buttons/SarakButton';
import { CalendarPanelMonthNavigation } from './CalendarPanelMonthNavigation';

// CalendarPanel é deliberadamente independente do SarakUIProvider (usado em contextos sem
// design system carregado) — por isso a grade de 7 colunas usa `gridTemplateColumns` direto
// em vez do hook `useStructuralStyles` (que exige o provider).
const WEEK_GRID_COLUMNS = 'repeat(7, minmax(0, 1fr))';

export type { SarakWeekStart };

/**
 * Locale do `date-fns` passado adiante para `format`. Tipado de forma estrutural
 * (objeto opaco) porque o tipo nomeado `Locale` não resolve sob
 * `moduleResolution: node` — os locales reais (`ptBR`, etc.) são objetos atribuíveis.
 */
export type SarakDateLocale = object;

const ISO = 'yyyy-MM-dd';

export interface CalendarPanelProps {
    mode: 'single' | 'range';
    start: Date | null;
    end: Date | null;
    locale?: SarakDateLocale;
    weekStartsOn?: SarakWeekStart;
    min?: string;
    max?: string;
    isDateDisabled?: (iso: string) => boolean;
    onSelectDay: (date: Date) => void;
}

const DAY_PRIMARY = 'var(--sarak-primary-color,#19e3f0)';
const DAY_MUTED = 'var(--text-muted,rgba(242,246,251,0.55))';

/** Cor/fundo da célula de dia por estado — via `style` (não `className`), porque o
 * preset `xs` do `SarakButton` já define cor de texto própria (variant ghost) e a
 * ordem de cascata entre classes Tailwind concorrentes não é garantida. */
const dayCellStyle = (outside: boolean, selected: boolean, between: boolean): React.CSSProperties => {
    // padding:0 neutraliza o preset xs (py-1.5/px-3): a célula de 32px não cabe o
    // padding fixo do átomo mais o número de 1-2 dígitos.
    const base: React.CSSProperties = { padding: 0 };
    if (selected) return { ...base, backgroundColor: DAY_PRIMARY, color: 'var(--color-theme-on-primary, #020617)', fontWeight: 'bold' };
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
export const CalendarPanel = ({
    ...props
}: CalendarPanelProps): React.ReactElement => {
    const navigation = useCalendarPanelNavigation(props);
    return (
        <div className="w-64">
            <CalendarPanelMonthNavigation locale={props.locale} viewMonth={navigation.viewMonth} onChangeMonth={navigation.changeViewMonth} />
            <CalendarWeekdayHeader weekdays={navigation.weekdays} />
            <CalendarDayGrid {...props} navigation={navigation} />
        </div>
    );
};

interface CalendarNavigationState {
    gridRef: React.RefObject<HTMLDivElement>;
    focused: Date;
    setFocused: React.Dispatch<React.SetStateAction<Date>>;
    viewMonth: Date;
    weeks: ReturnType<typeof buildMonthMatrix>;
    weekdays: string[];
    isDisabledDate: (date: Date) => boolean;
    changeViewMonth: (monthOffset: number) => void;
    handleKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
}

const useCalendarPanelNavigation = (props: CalendarPanelProps): CalendarNavigationState => {
    const { start, locale, min, max, isDateDisabled, onSelectDay } = props;
    const weekStartsOn = props.weekStartsOn ?? 0;
    const gridRef = useRef<HTMLDivElement>(null);
    const [focused, setFocused] = useState<Date>(start ?? new Date());
    const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(start ?? new Date()));
    const weeks = useMemo(() => buildMonthMatrix(viewMonth, weekStartsOn), [viewMonth, weekStartsOn]);
    const weekdays = useMemo(() => weeks[0].map((cell) => format(cell.date, 'EEEEEE', { locale })), [weeks, locale]);
    const isDisabledDate = useCallback((date: Date): boolean => (
        !isDateWithinSarakBounds(date, min, max) || isDateDisabled?.(toSarakIsoDate(date)) === true
    ), [min, max, isDateDisabled]);
    const changeViewMonth = useCallback((monthOffset: number): void => {
        const nextMonth = addMonths(viewMonth, monthOffset);
        const firstEnabledDate = buildMonthMatrix(nextMonth, weekStartsOn)
            .flat()
            .find((cell) => isSameMonth(cell.date, nextMonth) && !isDisabledDate(cell.date))?.date;
        setViewMonth(startOfMonth(nextMonth));
        setFocused(firstEnabledDate ?? startOfMonth(nextMonth));
    }, [viewMonth, weekStartsOn, isDisabledDate]);

    useEffect(() => {
        synchronizeFocusedCalendarDate({ focused, viewMonth, weeks, isDisabledDate, setFocused, setViewMonth, gridRef });
    }, [focused, viewMonth, weeks, isDisabledDate]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        const nextDate = moveByKey(focused, event.key);
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!isDisabledDate(focused)) onSelectDay(focused);
            return;
        }
        if (!nextDate) return;
        event.preventDefault();
        const dayStep = event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1;
        const enabledDate = resolveEnabledCalendarDate(nextDate, dayStep, weeks, isDisabledDate);
        if (enabledDate) setFocused(enabledDate);
    };

    return { gridRef, focused, setFocused, viewMonth, weeks, weekdays, isDisabledDate, changeViewMonth, handleKeyDown };
};

const resolveEnabledCalendarDate = (
    date: Date,
    dayStep: number,
    weeks: ReturnType<typeof buildMonthMatrix>,
    isDisabledDate: (candidate: Date) => boolean,
): Date | null => isDisabledDate(date)
    ? findNextEnabledSarakDate(date, dayStep, weeks.flat().length, isDisabledDate)
    : date;

interface CalendarFocusSyncOptions {
    focused: Date;
    viewMonth: Date;
    weeks: ReturnType<typeof buildMonthMatrix>;
    isDisabledDate: (date: Date) => boolean;
    setFocused: React.Dispatch<React.SetStateAction<Date>>;
    setViewMonth: React.Dispatch<React.SetStateAction<Date>>;
    gridRef: React.RefObject<HTMLDivElement>;
}

const synchronizeFocusedCalendarDate = (options: CalendarFocusSyncOptions): void => {
    const { focused, viewMonth, weeks, isDisabledDate, setFocused, setViewMonth, gridRef } = options;
    if (isDisabledDate(focused)) {
        const nextEnabledDate = findNextEnabledSarakDate(focused, 1, weeks.flat().length, isDisabledDate);
        if (nextEnabledDate) setFocused(nextEnabledDate);
        return;
    }
    if (!isSameMonth(focused, viewMonth)) {
        setViewMonth(startOfMonth(focused));
        return;
    }
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${format(focused, ISO)}"]`)?.focus();
};

const CalendarWeekdayHeader = ({ weekdays }: { weekdays: string[] }): React.ReactElement => (
    <div className="grid" style={{ gridTemplateColumns: WEEK_GRID_COLUMNS, marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
        {weekdays.map((day, index) => (
            <span key={index} className="text-center text-2xs font-black uppercase text-[var(--text-muted,rgba(242,246,251,0.55))]/50">
                {day}
            </span>
        ))}
    </div>
);

interface CalendarDayGridProps extends Pick<CalendarPanelProps, 'mode' | 'start' | 'end' | 'onSelectDay'> {
    navigation: CalendarNavigationState;
}

const CalendarDayGrid = ({ mode, start, end, onSelectDay, navigation }: CalendarDayGridProps): React.ReactElement => (
    <div
        ref={navigation.gridRef}
        role="grid"
        onKeyDown={navigation.handleKeyDown}
        className="grid"
        style={{ gridTemplateColumns: WEEK_GRID_COLUMNS, gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.125)' }}
    >
        {navigation.weeks.flat().map((cell) => (
            <CalendarDayCell
                key={format(cell.date, ISO)}
                cell={cell}
                mode={mode}
                start={start}
                end={end}
                onSelectDay={onSelectDay}
                navigation={navigation}
            />
        ))}
    </div>
);

interface CalendarDayCellProps extends Pick<CalendarPanelProps, 'mode' | 'start' | 'end' | 'onSelectDay'> {
    cell: ReturnType<typeof buildMonthMatrix>[number][number];
    navigation: CalendarNavigationState;
}

const CalendarDayCell = ({ cell, mode, start, end, onSelectDay, navigation }: CalendarDayCellProps): React.ReactElement => {
    const selected = (!!start && isSameDay(cell.date, start)) || (!!end && isSameDay(cell.date, end));
    const between = mode === 'range' && !!start && !!end && isWithinInterval(cell.date, { start, end });
    const disabled = navigation.isDisabledDate(cell.date);
    return (
        <SarakButton
            type="button"
            role="gridcell"
            data-iso={format(cell.date, ISO)}
            aria-selected={selected}
            disabled={disabled}
            tabIndex={!disabled && isSameDay(cell.date, navigation.focused) ? 0 : -1}
            onClick={() => { if (!disabled) onSelectDay(cell.date); }}
            onFocus={() => { if (!disabled) navigation.setFocused(cell.date); }}
            variant="ghost"
            size="xs"
            fullWidth
            style={dayCellStyle(cell.outside, selected, between)}
            className={`h-8 tabular-nums ${!selected ? 'hover:bg-[var(--sarak-primary-color,#19e3f0)]/10' : ''}`}
        >
            {cell.date.getDate()}
        </SarakButton>
    );
};

