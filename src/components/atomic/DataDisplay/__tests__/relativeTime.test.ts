// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { formatRelativeTime, parseTimestamp } from '../relativeTime';

const NOW = new Date('2026-10-09T12:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
    it('usa a maior unidade que cabe, no idioma pedido', () => {
        expect(formatRelativeTime(ago(3 * HOUR), 'pt', NOW)).toBe('há 3 horas');
        expect(formatRelativeTime(ago(3 * HOUR), 'en', NOW)).toBe('3 hours ago');
        expect(formatRelativeTime(ago(5 * 60_000), 'en', NOW)).toBe('5 minutes ago');
        expect(formatRelativeTime(ago(40 * DAY), 'en', NOW)).toBe('last month');
        expect(formatRelativeTime(ago(800 * DAY), 'en', NOW)).toBe('2 years ago');
    });

    it('datas futuras e "ontem" (numeric auto)', () => {
        expect(formatRelativeTime(new Date(NOW.getTime() + 2 * DAY), 'pt', NOW)).toBe('depois de amanhã');
        expect(formatRelativeTime(ago(DAY), 'pt', NOW)).toBe('ontem');
    });

    it('menos de um minuto é "agora"', () => {
        expect(formatRelativeTime(ago(20_000), 'pt', NOW)).toBe('agora');
        expect(formatRelativeTime(ago(20_000), 'en', NOW)).toBe('now');
    });

    it('aceita string ISO e número (ms)', () => {
        expect(formatRelativeTime(ago(2 * HOUR).toISOString(), 'en', NOW)).toBe('2 hours ago');
        expect(formatRelativeTime(ago(2 * HOUR).getTime(), 'en', NOW)).toBe('2 hours ago');
    });

    it('data inválida devolve texto vazio, nunca "Invalid Date"', () => {
        expect(formatRelativeTime('não é data', 'pt', NOW)).toBe('');
        expect(parseTimestamp('não é data')).toBeNull();
        expect(parseTimestamp('2026-10-09')).toBeInstanceOf(Date);
    });
});
