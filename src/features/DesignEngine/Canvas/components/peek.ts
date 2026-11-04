import { useCallback, useEffect, useRef } from 'react';
import type { SarakDesignState } from '../../../../core/Provider/types';

/** Quem recebe a espiada: os tokens a compor por cima do rascunho, ou `null` para voltar ao rascunho. */
export type PeekHandler = (tokens: Partial<SarakDesignState> | null) => void;

/** Espera antes de compor a espiada: atravessar a lista com o mouse não faz a prévia piscar a cada opção. */
export const PEEK_DELAY_MS = 150;

/** Em aparelho sem ponteiro que paire (toque), o toque já escolhe: não há espiada. */
export const canPeekHere = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return !window.matchMedia('(hover: none)').matches;
};

interface PeekHandlers {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
}

/**
 * Os eventos que fazem uma opção espiar. `getTokens` devolve o que compor, ou `null` quando ainda não dá
 * (tema que não chegou): a prévia fica como está. Nada aqui grava no rascunho.
 */
export const usePeekHandlers = (
    onPeek: PeekHandler | undefined,
    getTokens: () => Partial<SarakDesignState> | null,
): PeekHandlers => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const peeking = useRef(false);
    const latest = useRef({ onPeek, getTokens });
    latest.current = { onPeek, getTokens };

    const clearTimer = useCallback(() => {
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
    }, []);

    const stop = useCallback(() => {
        clearTimer();
        if (!peeking.current) return;
        peeking.current = false;
        latest.current.onPeek?.(null);
    }, [clearTimer]);

    const start = useCallback(() => {
        if (!latest.current.onPeek || !canPeekHere()) return;
        clearTimer();
        timer.current = setTimeout(() => {
            timer.current = null;
            const tokens = latest.current.getTokens();
            if (!tokens) return;
            peeking.current = true;
            latest.current.onPeek?.(tokens);
        }, PEEK_DELAY_MS);
    }, [clearTimer]);

    useEffect(() => stop, [stop]);

    return { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop };
};
