export const sarakFormatDate = (
    value: Date | string | number | null | undefined,
    locale?: string,
    options: Intl.DateTimeFormatOptions = {},
): string => {
    if (value === null || value === undefined) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale, options).format(date);
};
