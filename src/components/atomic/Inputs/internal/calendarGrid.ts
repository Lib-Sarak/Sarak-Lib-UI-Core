/**
 * Grade de calendário (Spec 11, Regra 1) — helper puro sobre `date-fns`.
 * Monta a matriz semanas × dias de um mês (com os dias "vazantes" do mês vizinho
 * para completar as bordas), sem React e sem `any`. Reusado pelo SarakDatePicker.
 */
import { eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';

export interface CalendarCell {
    /** Data do dia. */
    date: Date;
    /** True quando o dia pertence ao mês anterior/seguinte (fora do mês em foco). */
    outside: boolean;
}

export type WeekStart = 0 | 1;

/** Constrói a matriz de semanas (cada uma com 7 células) que cobre o mês de `month`. */
export const buildMonthMatrix = (month: Date, weekStartsOn: WeekStart = 0): CalendarCell[][] => {
    const monthIndex = month.getMonth();
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7).map((date: Date) => ({ date, outside: date.getMonth() !== monthIndex })));
    }
    return weeks;
};
