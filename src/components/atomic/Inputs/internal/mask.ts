import { findCursorAfterMaskCharacters } from './inputCaret';

const MASK_PRESETS: Record<string, string> = {
    cpf: '000.000.000-00',
    cnpj: 'CC.CCC.CCC/CCCC-00',
    cep: '00000-000',
};

const PHONE_LANDLINE_MASK = '(00) 0000-0000';
const PHONE_MOBILE_MASK = '(00) 00000-0000';
const ALPHANUMERIC_MASK_CHARACTER = 'C';

export interface MaskedValue {
    value: string;
    cleanValue: string;
}

const isMaskToken = (character: string): boolean => character === '0' || character === ALPHANUMERIC_MASK_CHARACTER;

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

const normalizeToMask = (value: string, pattern: string): string => {
    if (!pattern.includes(ALPHANUMERIC_MASK_CHARACTER)) return digitsOnly(value);

    const characters = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let characterIndex = 0;
    let normalized = '';
    for (const token of pattern) {
        if (!isMaskToken(token)) continue;
        while (characterIndex < characters.length) {
            const character = characters[characterIndex++];
            if (token === ALPHANUMERIC_MASK_CHARACTER || /\d/.test(character)) {
                normalized += character;
                break;
            }
        }
    }
    return normalized;
};

const resolveMaskPattern = (mask: string, digitCount: number): string => {
    if (mask === 'phone') return digitCount > 10 ? PHONE_MOBILE_MASK : PHONE_LANDLINE_MASK;
    return MASK_PRESETS[mask] ?? mask;
};

const formatCharacters = (characters: string, pattern: string): string => {
    if (![...pattern].some(isMaskToken)) return digitsOnly(characters);

    const limitedCharacters = characters.slice(0, [...pattern].filter(isMaskToken).length);
    let formatted = '';
    let placeholdersBefore = 0;
    let characterIndex = 0;

    for (const character of pattern) {
        if (isMaskToken(character)) {
            placeholdersBefore += 1;
            if (characterIndex < limitedCharacters.length) formatted += limitedCharacters[characterIndex++];
            continue;
        }
        if (limitedCharacters.length > 0 && (placeholdersBefore === 0 || limitedCharacters.length >= placeholdersBefore)) {
            formatted += character;
        }
    }

    return formatted;
};

export const formatMaskedValue = (value: string, mask: string): MaskedValue => {
    const rawDigits = digitsOnly(value);
    const pattern = resolveMaskPattern(mask, rawDigits.length);
    const cleanValue = normalizeToMask(value, pattern);
    const tokenCount = [...pattern].filter(isMaskToken).length;
    const limitedValue = tokenCount > 0 ? cleanValue.slice(0, tokenCount) : cleanValue;

    return { value: formatCharacters(limitedValue, pattern), cleanValue: limitedValue };
};

export const getMaskedCursorPosition = (
    formattedValue: string,
    charactersBeforeCursor: number,
    allowLetters: boolean = false,
): number => findCursorAfterMaskCharacters(formattedValue, charactersBeforeCursor, allowLetters);
