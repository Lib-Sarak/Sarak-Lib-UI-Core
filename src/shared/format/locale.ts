export const resolveIntlLocale = (locale?: string): string =>
    locale ?? new Intl.NumberFormat().resolvedOptions().locale;
