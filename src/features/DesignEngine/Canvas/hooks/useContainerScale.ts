import { useEffect, useRef, useState } from 'react';

// Largura de referência em que o mock de app foi pensado para caber sem cortar (mesma
// referência do breakpoint do dual-view, `panelResponsive.presets.ts`) — abaixo dela o
// preview reduz proporcionalmente, até o piso `MIN_SCALE`; acima dela nunca ultrapassa
// `MAX_SCALE` (o teto que o código já usava para o modo single-view, 0.95).
const SCALE_REFERENCE_WIDTH = 1280;
const MIN_SCALE = 0.5;
const MAX_SCALE = 0.95;

/**
 * Escala o "gêmeo digital" pela largura REAL do container onde o preview está montado
 * (plan-36), não mais uma constante assumindo viewport. `fallback` é usado até a
 * primeira medição resolver, e para sempre em ambiente sem `ResizeObserver` (SSR,
 * jsdom em teste): nenhum consumidor perde o número que já tinha.
 */
export const useContainerScale = (fallback: number) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(fallback);

    useEffect(() => {
        const node = containerRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width;
            if (!width || width < 100) return;
            setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / SCALE_REFERENCE_WIDTH)));
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return { containerRef, scale };
};
