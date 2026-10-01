import { findCursorAfterDigits } from './inputCaret';

const MASK_PRESETS: Record<string, string> = {
    cpf: '000.000.000-00',
    cnpj: '00.000.000/0000-00',
};

const PHONE_LANDLINE_MASK = '(00) 0000-0000';
const PHONE_MOBILE_MASK = '(00) 00000-0000';

export interface MaskedValue {
    value: string;
    cleanValue: string;
}

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

const resolveMaskPattern = (mask: string, digitCount: number): string => {
    if (mask === 'phone') return digitCount > 10 ? PHONE_MOBILE_MASK : PHONE_LANDLINE_MASK;
    return MASK_PRESETS[mask] ?? mask;
};

const formatDigits = (digits: string, pattern: string): string => {
    if (!pattern.includes('0')) return digits;

    const limitedDigits = digits.slice(0, [...pattern].filter((character) => character === '0').length);
    let formatted = '';
    let placeholdersBefore = 0;
    let digitIndex = 0;

    for (const character of pattern) {
        if (character === '0') {
            placeholdersBefore += 1;
            if (digitIndex < limitedDigits.length) formatted += limitedDigits[digitIndex++];
            continue;
        }
        if (limitedDigits.length > 0 && (placeholdersBefore === 0 || limitedDigits.length >= placeholdersBefore)) {
            formatted += character;
        }
    }

    return formatted;
};

export const formatMaskedValue = (value: string, mask: string): MaskedValue => {
    const cleanValue = digitsOnly(value);
    const pattern = resolveMaskPattern(mask, cleanValue.length);
    const digitLimit = [...pattern].filter((character) => character === '0').length;
    const limitedValue = digitLimit > 0 ? cleanValue.slice(0, digitLimit) : cleanValue;

    return { value: formatDigits(limitedValue, pattern), cleanValue: limitedValue };
};

export const getMaskedCursorPosition = (formattedValue: string, digitsBeforeCursor: number): number =>
    findCursorAfterDigits(formattedValue, digitsBeforeCursor);
