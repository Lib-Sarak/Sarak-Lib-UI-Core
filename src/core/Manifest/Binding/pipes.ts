/**
 * Pipes de Formatação (Spec 24 — Regra 2)
 *
 * Registro de funções formatadoras PURAS aplicadas no template via `|`
 * (ex.: `{{valor | currency: 'BRL'}}`). Cada pipe recebe o valor resolvido e
 * argumentos string do template, e devolve sempre uma `string` (Regra 4 — nunca
 * HTML cru; sanitização rica fica no `SarakMarkdownRenderer`, Spec 15).
 *
 * Contrato Zero Any: o valor de entrada é `unknown`; nenhuma `any` na fronteira.
 */

import { format, parseISO } from 'date-fns';

/**
 * Assinatura de um pipe: transforma um valor resolvido em texto, com argumentos
 * literais (string) extraídos do template após o `:`.
 */
export type Pipe = (value: unknown, ...args: string[]) => string;

const registry = new Map<string, Pipe>();

/** Registra (ou substitui) um pipe pelo nome. API pública (importador). */
export const registerPipe = (name: string, pipe: Pipe): void => {
    registry.set(name, pipe);
};

/** Recupera um pipe pelo nome, ou `undefined` se não cadastrado. */
export const getPipe = (name: string): Pipe | undefined => registry.get(name);

/** True se o pipe está registrado. */
export const hasPipe = (name: string): boolean => registry.has(name);

// ---------------------------------------------------------------------------
// Pipes nativos obrigatórios (Spec 24, Regra 2)
// ---------------------------------------------------------------------------

const toNumber = (value: unknown): number =>
    typeof value === 'number' ? value : Number(value);

/** `currency` — formata um número como moeda. Args: [código ISO = 'BRL', locale = 'pt-BR']. */
const currencyPipe: Pipe = (value, currencyCode = 'BRL', locale = 'pt-BR') => {
    const num = toNumber(value);
    if (!Number.isFinite(num)) return '';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(num);
};

const toDate = (value: unknown): Date | null => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'string') {
        const iso = parseISO(value);
        if (!Number.isNaN(iso.getTime())) return iso;
        const loose = new Date(value);
        return Number.isNaN(loose.getTime()) ? null : loose;
    }
    return null;
};

/**
 * Normaliza tokens "amigáveis" em maiúsculas (`DD/MM/YYYY`) para os tokens
 * Unicode do date-fns (`dd/MM/yyyy`), sem tocar em `MM`/`HH`/`mm`/`ss`.
 */
const normalizeDateFormat = (fmt: string): string =>
    fmt.replace(/Y/g, 'y').replace(/D/g, 'd');

/** `date` — formata uma data (Date | timestamp | ISO). Arg: [formato = 'dd/MM/yyyy']. */
const datePipe: Pipe = (value, fmt = 'dd/MM/yyyy') => {
    const d = toDate(value);
    if (!d) return '';
    return format(d, normalizeDateFormat(fmt));
};

/** `capitalize` — primeira letra maiúscula, restante inalterado. */
const capitalizePipe: Pipe = (value) => {
    const s = String(value ?? '');
    return s.length === 0 ? '' : s.charAt(0).toUpperCase() + s.slice(1);
};

/** `uppercase` — texto em caixa alta. */
const uppercasePipe: Pipe = (value) => String(value ?? '').toUpperCase();

/** `lowercase` — texto em caixa baixa. */
const lowercasePipe: Pipe = (value) => String(value ?? '').toLowerCase();

registerPipe('currency', currencyPipe);
registerPipe('date', datePipe);
registerPipe('capitalize', capitalizePipe);
registerPipe('uppercase', uppercasePipe);
registerPipe('lowercase', lowercasePipe);
