/**
 * Datas do SarakGantt no idioma da lib, pelo `Intl` (sem `text-transform` de CSS): a data por extenso para
 * leitor de tela e dica, e o rótulo curto de cada marca do cabeçalho conforme a escala. Sem Provider, português.
 */
import { useMemo } from 'react';
import { useSarakLanguage } from '../../../../core/i18n/useSarakLanguage';
import type { SarakGanttScale } from './ganttScale';

export interface GanttFormats {
    full: Intl.DateTimeFormat;
    /** Rótulo da marca: o número do dia; o dia e o mês do início da semana; o mês e o ano. */
    tick: (date: Date, scale: SarakGanttScale) => string;
    /**
     * Linha de cima, só na escala de dia: o mês, na 1.ª marca e no dia 1 (um dia é estreito demais para dia e
     * mês numa linha só); `null` nas outras.
     */
    tickContext: (date: Date, scale: SarakGanttScale, isFirst: boolean) => string | null;
}

export const buildGanttFormats = (locale: string): GanttFormats => {
    const full = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
    const day = new Intl.DateTimeFormat(locale, { day: 'numeric' });
    const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    const month = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });
    const monthOnly = new Intl.DateTimeFormat(locale, { month: 'short' });
    return {
        full,
        tick: (date, scale) => {
            if (scale === 'month') return month.format(date);
            return scale === 'week' ? dayMonth.format(date) : day.format(date);
        },
        tickContext: (date, scale, isFirst) =>
            scale === 'day' && (isFirst || date.getDate() === 1) ? monthOnly.format(date) : null,
    };
};

export const useGanttFormats = (): GanttFormats => {
    const { locale } = useSarakLanguage();
    return useMemo(() => buildGanttFormats(locale), [locale]);
};
