import { useMemo } from 'react';
import { useSarakLanguage } from '../../../../core/i18n/useSarakLanguage';

export type SarakSystemTimestamp = Date | string | number;

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const PAD_WIDTH = 2;

const toDate = (value: SarakSystemTimestamp): Date | null => {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

/** Duração curta e legível: `12 s`, `2 min 05 s`, `1 h 02 min`. Valor inválido ou negativo vira `0 s`. */
export const formatSystemDuration = (milliseconds: number): string => {
    const totalSeconds = Number.isFinite(milliseconds) && milliseconds > 0 ? Math.floor(milliseconds / MS_PER_SECOND) : 0;
    const hours = Math.floor(totalSeconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR));
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
    const seconds = totalSeconds % SECONDS_PER_MINUTE;
    const pad = (part: number): string => String(part).padStart(PAD_WIDTH, '0');
    if (hours > 0) return `${hours} h ${pad(minutes)} min`;
    if (minutes > 0) return `${minutes} min ${pad(seconds)} s`;
    return `${seconds} s`;
};

export interface SarakSystemFormat {
    /** Data e hora no idioma que vale; texto vazio quando o valor não é uma data. */
    dateTime: (value: SarakSystemTimestamp) => string;
    /** Só a data, no idioma que vale. */
    date: (value: SarakSystemTimestamp) => string;
    /** Número no idioma que vale. */
    number: (value: number) => string;
}

/** Formatadores das telas de sistema: tudo segue o `locale` de `useSarakLanguage()`. */
export const useSystemFormat = (): SarakSystemFormat => {
    const { locale } = useSarakLanguage();
    return useMemo(() => {
        const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });
        const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
        const number = new Intl.NumberFormat(locale);
        return {
            dateTime: (value) => { const parsed = toDate(value); return parsed ? dateTime.format(parsed) : ''; },
            date: (value) => { const parsed = toDate(value); return parsed ? date.format(parsed) : ''; },
            number: (value) => number.format(value),
        };
    }, [locale]);
};
