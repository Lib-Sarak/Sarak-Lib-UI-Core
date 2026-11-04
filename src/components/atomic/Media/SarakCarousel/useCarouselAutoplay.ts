/**
 * Rotação automática do carrossel: gira no intervalo, pausa sob o mouse e o foco e pelo botão, e não gira de
 * jeito nenhum para quem pediu movimento reduzido (`prefers-reduced-motion`).
 */

import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface CarouselAutoplayInput {
    autoPlay: boolean;
    count: number;
    intervalMs: number;
    /** Chamado a cada tique; deve avançar um slide. */
    onAdvance: () => void;
}

export function useCarouselAutoplay({ autoPlay, count, intervalMs, onAdvance }: CarouselAutoplayInput) {
    const [paused, setPaused] = useState(false);
    const [held, setHeld] = useState(false);
    const advance = useRef(onAdvance);
    advance.current = onAdvance;
    const reduced = prefersReducedMotion();
    const playing = autoPlay && !reduced && !paused && !held && count > 1;
    useEffect(() => {
        if (!playing) return undefined;
        const timer = window.setInterval(() => advance.current(), intervalMs);
        return () => window.clearInterval(timer);
    }, [playing, intervalMs]);
    return { reduced, playing, paused, setPaused, setHeld };
}
