const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;
const CNPJ_BASE_LENGTH = 12;

const CPF_FIRST_WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const CPF_SECOND_WEIGHTS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export type SarakDocumentKind = 'cpf' | 'cnpj' | 'cep' | 'auto';

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

const cnpjCharactersOnly = (value: string): string => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CNPJ_LENGTH);

const stripDocumentSeparators = (value: string): string => value.replace(/[\s.\/-]/g, '');

const isRepeatedDigit = (value: string): boolean => /^(\d)\1+$/.test(value);

const isRepeatedCharacter = (value: string): boolean => /^(.)(\1)+$/.test(value);

const calculateCheckDigit = (values: number[], weights: number[]): number => {
    const remainder = values.reduce((sum, value, index) => sum + value * weights[index], 0) % 11;
    return remainder < 2 ? 0 : 11 - remainder;
};

const cpfCheckDigit = (digits: string, weights: number[]): number =>
    calculateCheckDigit([...digits].map((digit) => digit.charCodeAt(0) - 48), weights);

const cnpjCheckDigit = (characters: string, weights: number[]): number =>
    calculateCheckDigit([...characters].map((character) => character.charCodeAt(0) - 48), weights);

export const sarakIsValidCpf = (value: string): boolean => {
    const digits = stripDocumentSeparators(value);
    if (!/^\d{11}$/.test(digits) || isRepeatedDigit(digits)) return false;

    const firstDigit = cpfCheckDigit(digits.slice(0, 9), CPF_FIRST_WEIGHTS);
    const secondDigit = cpfCheckDigit(`${digits.slice(0, 9)}${firstDigit}`, CPF_SECOND_WEIGHTS);
    return digits.endsWith(`${firstDigit}${secondDigit}`);
};

export const sarakIsValidCnpj = (value: string): boolean => {
    const characters = stripDocumentSeparators(value).toUpperCase();
    if (!/^[A-Z0-9]{12}\d{2}$/.test(characters) || isRepeatedCharacter(characters)) return false;

    const base = characters.slice(0, CNPJ_BASE_LENGTH);
    const firstDigit = cnpjCheckDigit(base, CNPJ_FIRST_WEIGHTS);
    const secondDigit = cnpjCheckDigit(`${base}${firstDigit}`, CNPJ_SECOND_WEIGHTS);
    return characters.endsWith(`${firstDigit}${secondDigit}`);
};

const normalizeDocument = (value: string, kind: SarakDocumentKind): string => {
    if (kind === 'cnpj') return cnpjCharactersOnly(value);
    return digitsOnly(value);
};

const formatGroupedDocument = (value: string, separators: Record<number, string>): string => {
    let formatted = '';
    for (let index = 0; index < value.length; index += 1) {
        formatted += `${separators[index] ?? ''}${value[index]}`;
    }
    return formatted;
};

const resolveDocumentKind = (value: string): SarakDocumentKind => {
    const alphanumeric = cnpjCharactersOnly(value);
    if (/[A-Z]/.test(alphanumeric) || alphanumeric.length === CNPJ_LENGTH) return 'cnpj';

    const digits = digitsOnly(value);
    if (digits.length === CPF_LENGTH) return 'cpf';
    if (digits.length === 8) return 'cep';
    return 'auto';
};

export const sarakFormatDocument = (value: string, kind: SarakDocumentKind = 'auto'): string => {
    const resolvedKind = kind === 'auto' ? resolveDocumentKind(value) : kind;
    if (resolvedKind === 'auto') return value;

    const normalized = normalizeDocument(value, resolvedKind);
    if (resolvedKind === 'cpf') return formatGroupedDocument(normalized.slice(0, CPF_LENGTH), { 3: '.', 6: '.', 9: '-' });
    if (resolvedKind === 'cnpj') return formatGroupedDocument(normalized, { 2: '.', 5: '.', 8: '/', 12: '-' });
    return formatGroupedDocument(normalized.slice(0, 8), { 5: '-' });
};
