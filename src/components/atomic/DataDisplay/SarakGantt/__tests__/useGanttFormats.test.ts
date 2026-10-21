import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildGanttFormats, useGanttFormats } from '../useGanttFormats';

const intl = (options: Intl.DateTimeFormatOptions, date: Date) => new Intl.DateTimeFormat('pt', options).format(date);

describe('buildGanttFormats', () => {
    const formats = buildGanttFormats('pt');
    const mid = new Date(2026, 9, 14);
    const first = new Date(2026, 10, 1);

    it('dia: sempre só o número; o mês vai na linha de cima, na primeira marca e no dia 1', () => {
        expect(formats.tick(mid, 'day')).toBe(intl({ day: 'numeric' }, mid));
        expect(formats.tick(first, 'day')).toBe(intl({ day: 'numeric' }, first));
        expect(formats.tickContext(mid, 'day', false)).toBeNull();
        expect(formats.tickContext(mid, 'day', true)).toBe(intl({ month: 'short' }, mid));
        expect(formats.tickContext(first, 'day', false)).toBe(intl({ month: 'short' }, first));
    });

    it('semana: dia e mês do início; mês: mês e ano, como o Intl escreve; sem linha de cima', () => {
        expect(formats.tick(mid, 'week')).toBe(intl({ day: 'numeric', month: 'short' }, mid));
        expect(formats.tick(mid, 'month')).toBe(intl({ month: 'short', year: 'numeric' }, mid));
        expect(formats.tickContext(first, 'week', true)).toBeNull();
        expect(formats.tickContext(first, 'month', true)).toBeNull();
    });

    it('a data por extenso sai no idioma pedido', () => {
        expect(buildGanttFormats('en').full.format(mid)).toBe(new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(mid));
    });
});

describe('useGanttFormats', () => {
    it('sem Provider, português', () => {
        const { result } = renderHook(() => useGanttFormats());
        expect(result.current.full.format(new Date(2026, 9, 14))).toBe(intl({ dateStyle: 'medium' }, new Date(2026, 9, 14)));
    });
});
