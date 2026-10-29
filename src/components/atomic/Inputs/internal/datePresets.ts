import {
    addDays,
    endOfMonth,
    format,
    isValid,
    parse,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfQuarter,
    startOfYear,
    subMonths,
} from 'date-fns';

const ISO_DATE_FORMAT = 'yyyy-MM-dd';

export type SarakDatePickerValue = string | [string, string];

export type SarakDatePresetId =
    | 'today'
    | 'yesterday'
    | 'last7Days'
    | 'last30Days'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisQuarter'
    | 'thisYear';

export interface SarakDatePreset {
    label: string;
    value: SarakDatePickerValue | (() => SarakDatePickerValue);
}

export interface SarakDateInputParseOptions {
    mode: 'single' | 'range';
    rangeSeparator: string;
    displayFormat: string;
    locale?: object;
    min?: string;
    max?: string;
    isDateDisabled?: (iso: string) => boolean;
}

export const toSarakIsoDate = (date: Date): string => format(date, ISO_DATE_FORMAT);

export const parseSarakDateInput = (value: string, displayFormat: string, locale?: object): Date | null => {
    const normalizedValue = value.trim();
    if (!normalizedValue) return null;

    const parsedDate = parse(normalizedValue, displayFormat, new Date(), { locale });
    if (!isValid(parsedDate) || format(parsedDate, displayFormat, { locale }) !== normalizedValue) return null;
    return parsedDate;
};

export const isDateWithinSarakBounds = (date: Date, min?: string, max?: string): boolean => {
    const isoDate = toSarakIsoDate(date);
    return (!min || isoDate >= min) && (!max || isoDate <= max);
};

export const isSarakDateAllowed = (
    date: Date,
    min?: string,
    max?: string,
    isDateDisabled?: (iso: string) => boolean,
): boolean => isDateWithinSarakBounds(date, min, max) && isDateDisabled?.(toSarakIsoDate(date)) !== true;

export const parseSarakDatePickerInput = (
    value: string,
    options: SarakDateInputParseOptions,
): SarakDatePickerValue | null => {
    const { mode, rangeSeparator, displayFormat, locale, min, max, isDateDisabled } = options;
    const separator = rangeSeparator.trim();
    const separatorIndex = mode === 'range' ? value.indexOf(separator) : -1;
    const startText = separatorIndex < 0 ? value.trim() : value.slice(0, separatorIndex).trim();
    const endText = separatorIndex < 0 ? '' : value.slice(separatorIndex + separator.length).trim();
    const startDate = parseSarakDateInput(startText, displayFormat, locale);
    if (!startDate || !isSarakDateAllowed(startDate, min, max, isDateDisabled)) return null;
    if (mode === 'single') return toSarakIsoDate(startDate);
    if (!endText) return [toSarakIsoDate(startDate), ''];

    const endDate = parseSarakDateInput(endText, displayFormat, locale);
    if (!endDate || !isSarakDateAllowed(endDate, min, max, isDateDisabled)) return null;
    return startDate <= endDate
        ? [toSarakIsoDate(startDate), toSarakIsoDate(endDate)]
        : [toSarakIsoDate(endDate), toSarakIsoDate(startDate)];
};

export const normalizeSarakDatePresetForMode = (
    value: SarakDatePickerValue,
    mode: 'single' | 'range',
): SarakDatePickerValue => {
    if (mode === 'single') return Array.isArray(value) ? value[0] : value;
    return Array.isArray(value) ? value : [value, value];
};

export const areSarakDatePresetValuesAllowed = (
    value: SarakDatePickerValue,
    min?: string,
    max?: string,
    isDateDisabled?: (iso: string) => boolean,
): boolean => {
    const values = Array.isArray(value) ? value.filter(Boolean) : [value];
    return values.length > 0 && values.every((iso) => {
        const date = parseISO(iso);
        return isValid(date) && isSarakDateAllowed(date, min, max, isDateDisabled);
    });
};

export const findNextEnabledSarakDate = (
    startDate: Date,
    dayStep: number,
    maxSteps: number,
    isDisabled: (date: Date) => boolean,
): Date | null => {
    if (!dayStep || maxSteps < 1) return null;

    for (let step = 1; step <= maxSteps; step += 1) {
        const candidate = addDays(startDate, dayStep * step);
        if (!isDisabled(candidate)) return candidate;
    }
    return null;
};

const createRange = (start: Date, end: Date): [string, string] => [toSarakIsoDate(start), toSarakIsoDate(end)];

export const resolveSarakDatePreset = (
    presetId: SarakDatePresetId,
    referenceDate: Date = new Date(),
): SarakDatePickerValue => {
    const today = startOfDay(referenceDate);
    if (presetId === 'today') return toSarakIsoDate(today);
    if (presetId === 'yesterday') return toSarakIsoDate(addDays(today, -1));
    if (presetId === 'last7Days') return createRange(addDays(today, -6), today);
    if (presetId === 'last30Days') return createRange(addDays(today, -29), today);
    if (presetId === 'thisMonth') return createRange(startOfMonth(today), today);
    if (presetId === 'lastMonth') {
        const previousMonth = subMonths(today, 1);
        return createRange(startOfMonth(previousMonth), endOfMonth(previousMonth));
    }
    if (presetId === 'thisQuarter') return createRange(startOfQuarter(today), today);
    return createRange(startOfYear(today), today);
};
