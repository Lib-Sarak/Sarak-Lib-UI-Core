import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from '../Dispatcher/rateLimit';

describe('Spec 25 — Modificadores de taxa (Regra 3)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('debounce: 10 chamadas rápidas resultam em UMA execução (busca com debounce)', () => {
        const fn = vi.fn();
        const wrapped = debounce(fn, 1000);
        for (let i = 0; i < 10; i++) wrapped(`char-${i}`);
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenLastCalledWith('char-9');
    });

    it('throttle (leading): double-click dispara apenas a primeira', () => {
        const fn = vi.fn();
        const wrapped = throttle(fn, 500);
        wrapped();
        wrapped(); // dentro da janela → ignorado
        expect(fn).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(500);
        wrapped(); // janela liberada → dispara de novo
        expect(fn).toHaveBeenCalledTimes(2);
    });
});
