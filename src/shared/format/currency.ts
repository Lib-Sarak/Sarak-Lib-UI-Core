import { formatCurrencyValue } from '../../components/atomic/Inputs/internal/currency';
import { resolveIntlLocale } from './locale';

export const sarakFormatCurrency = (
    value: number | null | undefined,
    currency: string,
    locale?: string,
): string => {
    if (value === null || value === undefined || !Number.isFinite(value)) return '';
    return formatCurrencyValue(value, resolveIntlLocale(locale), currency);
};
