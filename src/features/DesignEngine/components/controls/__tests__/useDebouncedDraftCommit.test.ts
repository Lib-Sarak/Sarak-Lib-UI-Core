import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebouncedDraftCommit } from '../useDebouncedDraftCommit';

describe('useDebouncedDraftCommit (plan-36)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('reflete o valor local IMEDIATAMENTE a cada commit, sem esperar o timer', () => {
        const onCommit = vi.fn();
        const { result } = renderHook(() => useDebouncedDraftCommit<number>(0, onCommit));

        act(() => {
            const [, commit] = result.current;
            commit(5);
        });

        expect(result.current[0]).toBe(5);
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('propaga para onCommit só depois de 150ms sem novo commit', () => {
        const onCommit = vi.fn();
        const { result } = renderHook(() => useDebouncedDraftCommit<number>(0, onCommit));

        act(() => {
            result.current[1](5);
        });
        act(() => {
            vi.advanceTimersByTime(149);
        });
        expect(onCommit).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(onCommit).toHaveBeenCalledWith(5);
    });

    it('N commits seguidos dentro da janela resultam em UMA única propagação, com o ÚLTIMO valor', () => {
        const onCommit = vi.fn();
        const { result } = renderHook(() => useDebouncedDraftCommit<number>(0, onCommit));

        act(() => {
            for (let i = 1; i <= 10; i += 1) {
                result.current[1](i);
                vi.advanceTimersByTime(50); // nunca deixa a janela de 150ms fechar
            }
        });

        expect(onCommit).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(onCommit).toHaveBeenCalledWith(10);
    });

    it('`value` de fora (reset externo) vence o estado local imediatamente', () => {
        const onCommit = vi.fn();
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedDraftCommit<number>(value, onCommit),
            { initialProps: { value: 5 } },
        );
        expect(result.current[0]).toBe(5);

        rerender({ value: 0 });
        expect(result.current[0]).toBe(0);
    });

    it('sempre usa o `onCommit` mais recente (ref), mesmo que a função mude entre o commit e o disparo do timer', () => {
        const firstOnCommit = vi.fn();
        const secondOnCommit = vi.fn();
        const { result, rerender } = renderHook(
            ({ onCommit }) => useDebouncedDraftCommit<number>(0, onCommit),
            { initialProps: { onCommit: firstOnCommit } },
        );

        act(() => {
            result.current[1](7);
        });
        rerender({ onCommit: secondOnCommit });

        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(firstOnCommit).not.toHaveBeenCalled();
        expect(secondOnCommit).toHaveBeenCalledWith(7);
    });

    it('desmontar com commit PENDENTE esvazia (flush) em vez de descartar — senão a edição some em silêncio (achado do veredito de 2026-08-12)', () => {
        const onCommit = vi.fn();
        const { result, unmount } = renderHook(() => useDebouncedDraftCommit<number>(0, onCommit));

        act(() => {
            result.current[1](9);
        });
        // Desmontar ANTES dos 150ms — ex.: o usuário trocou de pilar ou fechou o
        // painel no meio do arrasto. `onCommit` é `updateDraft`, que não desmonta
        // junto (mora em `useDesignDraft`, em `ThemeCustomizationTab`) — a edição
        // tem que chegar lá, não sumir.
        unmount();

        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(onCommit).toHaveBeenCalledWith(9);

        // E só UMA vez — o timer não pode disparar de novo depois do flush do unmount.
        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('desmontar SEM commit pendente não chama onCommit — nada a esvaziar', () => {
        const onCommit = vi.fn();
        const { unmount } = renderHook(() => useDebouncedDraftCommit<number>(0, onCommit));

        unmount();

        expect(onCommit).not.toHaveBeenCalled();
    });
});
