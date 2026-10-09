import type { ChartBuilderConfig, ChartOptionFragment, ChartTheme, SarakChartDataItem } from './types';

const ISO_DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const CALENDAR_MARGIN_FACTOR = 3;
const CALENDAR_MIN_ALPHA = 0.15;
const CALENDAR_MAX_ALPHA = 1;

type CalendarEntry = [string, number];

function padDatePart(value: number): string {
    return String(value).padStart(2, '0');
}

function formatDay(year: number, month: number, day: number): string {
    return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

function parseIsoDay(value: string): string | null {
    const match = ISO_DAY_PATTERN.exec(value.trim());
    if (!match) return null;
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const check = new Date(Date.UTC(year, month - 1, day));
    const isRealDay = check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
    return isRealDay ? formatDay(year, month, day) : null;
}

function parseDay(value: unknown): string | null {
    if (typeof value === 'string') return parseIsoDay(value);
    if (typeof value !== 'number' && !(value instanceof Date)) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return formatDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function toEntry(item: unknown, valueKey: string): CalendarEntry | null {
    if (typeof item !== 'object' || item === null) return null;
    const record = item as Record<string, unknown>;
    const day = parseDay(record.date);
    const value = record[valueKey];
    if (day === null || typeof value !== 'number' || !Number.isFinite(value)) return null;
    return [day, value];
}

/** Um dia repetido fica com o último valor; só os dias com dado entram na série. */
function collectEntries(data: unknown, valueKey: string): CalendarEntry[] {
    if (!Array.isArray(data)) return [];
    const byDay = new Map<string, number>();
    data.forEach((item) => {
        const entry = toEntry(item, valueKey);
        if (entry) byDay.set(entry[0], entry[1]);
    });
    return [...byDay.entries()].sort(([first], [second]) => first.localeCompare(second));
}

/** Há ao menos um item com `date` válida e valor numérico finito. */
export function hasCalendarData(data: unknown, valueKey: string): boolean {
    return collectEntries(data, valueKey).length > 0;
}

/** Dados de um só ano mostram o ano inteiro; senão, o intervalo do primeiro ao último dia. */
function resolveRange(entries: readonly CalendarEntry[]): string | string[] {
    const first = entries[0][0];
    const last = entries[entries.length - 1][0];
    return first.slice(0, 4) === last.slice(0, 4) ? first.slice(0, 4) : [first, last];
}

export const buildCalendarSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => {
    const entries = collectEntries(data, config?.dataKey || 'value');
    const values = entries.map(([, value]) => value);
    const margin = theme.axisLabelMargin * CALENDAR_MARGIN_FACTOR;
    const labelStyle = { color: theme.textColor, fontSize: theme.fontSize, fontFamily: theme.bodyFont };
    return {
        visualMap: {
            show: false,
            min: Math.min(0, ...values),
            max: Math.max(0, ...values),
            inRange: { color: [theme.primaryColor, theme.primaryColor], colorAlpha: [CALENDAR_MIN_ALPHA, CALENDAR_MAX_ALPHA] },
        },
        calendar: {
            range: resolveRange(entries),
            cellSize: 'auto',
            top: margin,
            left: margin,
            right: margin,
            itemStyle: { color: theme.surfaceColor, borderColor: theme.borderColor, borderWidth: theme.borderWidth },
            splitLine: { lineStyle: { color: theme.borderColor, width: theme.borderWidth } },
            dayLabel: labelStyle,
            monthLabel: labelStyle,
            yearLabel: labelStyle,
        },
        series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: entries }],
    };
};
