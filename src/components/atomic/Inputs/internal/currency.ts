export interface ParsedCurrencyValue {
    value: number | null;
    negativeOnly: boolean;
}

const getNumberPart = (parts: Intl.NumberFormatPart[], type: Intl.NumberFormatPartTypes): string | undefined =>
    parts.find((part) => part.type === type)?.value;

export const formatCurrencyValue = (value: number | null | undefined, locale: string, currency: string): string => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
};

export const formatCurrencyEditValue = (value: number | null, locale: string, currency: string): string => {
    if (value === null) return '';
    const maximumFractionDigits = new Intl.NumberFormat(locale, { style: 'currency', currency })
        .resolvedOptions().maximumFractionDigits;
    return new Intl.NumberFormat(locale, {
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(value);
};

export const parseCurrencyValue = (input: string, locale: string): ParsedCurrencyValue => {
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(-12345.6);
    const decimal = getNumberPart(parts, 'decimal') ?? '.';
    const group = getNumberPart(parts, 'group') ?? ',';
    const minusSign = getNumberPart(parts, 'minusSign') ?? '-';
    const isNegative = input.includes(minusSign) || input.includes('-') || input.includes('−');
    const withoutGroups = group ? input.split(group).join('') : input;
    const decimalPosition = withoutGroups.indexOf(decimal);
    const wholePart = decimalPosition < 0 ? withoutGroups : withoutGroups.slice(0, decimalPosition);
    const fractionPart = decimalPosition < 0 ? '' : withoutGroups.slice(decimalPosition + decimal.length);
    const wholeDigits = wholePart.replace(/\D/g, '');
    const fractionDigits = fractionPart.replace(/\D/g, '');

    if (wholeDigits.length + fractionDigits.length === 0) {
        return { value: null, negativeOnly: isNegative };
    }

    const sign = isNegative ? '-' : '';
    const fraction = decimalPosition < 0 ? '' : `.${fractionDigits}`;
    const value = Number(`${sign}${wholeDigits || '0'}${fraction}`);
    return { value: Number.isFinite(value) ? value : null, negativeOnly: false };
};
