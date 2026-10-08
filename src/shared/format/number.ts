export const sarakFormatNumber = (
    value: number | null | undefined,
    locale?: string,
    options: Intl.NumberFormatOptions = {},
): string => {
    if (value === null || value === undefined || !Number.isFinite(value)) return '';
    return new Intl.NumberFormat(locale, options).format(value);
};
