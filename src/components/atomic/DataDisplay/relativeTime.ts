/**
 * Horário relativo ("há 3 horas") no locale que vale na tela (`useSarakLanguage`), para o fio de comentários e o
 * histórico. Usa `Intl.RelativeTimeFormat`: nenhuma tradução fica no catálogo.
 */

import { useSarakLanguage } from '../../../core/i18n/useSarakLanguage';

const SECONDS_PER_UNIT: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
];

export type SarakTimestamp = string | number | Date;

/** Data válida ou `null` — entrada inválida nunca vira "Invalid Date" na tela. */
export const parseTimestamp = (value: SarakTimestamp): Date | null => {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Diferença até `now` na maior unidade que cabe; menos de um minuto é "agora".
 * Data inválida devolve texto vazio.
 */
export const formatRelativeTime = (value: SarakTimestamp, locale: string, now: Date = new Date()): string => {
    const date = parseTimestamp(value);
    if (!date) return '';
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const match = SECONDS_PER_UNIT.find(([, seconds]) => Math.abs(diffSeconds) >= seconds);
    if (!match) return formatter.format(0, 'second');
    return formatter.format(Math.round(diffSeconds / match[1]), match[0]);
};

/** Formatador já preso ao locale que vale (`useSarakLanguage`; `pt-BR` sem Provider). */
export function useRelativeTime(): (value: SarakTimestamp) => string {
    const { locale } = useSarakLanguage();
    return (value) => formatRelativeTime(value, locale);
}
