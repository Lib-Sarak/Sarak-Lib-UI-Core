export const sarakFormatPercent = (
    value: number | null | undefined,
    locale?: string,
    options: Omit<Intl.NumberFormatOptions, 'style'> = {},
): string => {
    if (value === null || value === undefined || !Number.isFinite(value)) return '';
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2, ...options, style: 'percent' }).format(value);
};
