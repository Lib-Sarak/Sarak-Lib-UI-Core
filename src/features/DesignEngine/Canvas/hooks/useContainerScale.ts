import { useEffect, useRef, useState } from 'react';

// Largura de referência em que o mock de app foi pensado para caber sem cortar (mesma
// referência do breakpoint do dual-view, `panelResponsive.presets.ts`) — abaixo dela o
// preview reduz proporcionalmente, até o piso `MIN_SCALE`; acima dela nunca ultrapassa
// `MAX_SCALE` (o teto que o código já usava para o modo single-view, 0.95).
const SCALE_REFERENCE_WIDTH = 1280;
const MIN_SCALE = 0.5;
const MAX_SCALE = 0.95;

/** Como a prévia reduz: a largura do sistema que ela desenha e os limites da escala. `null` desenha em tamanho real (escala 1). */
export interface ContainerScaleRule {
    referenceWidth: number;
    minScale: number;
    maxScale: number;
}

const DEFAULT_RULE: ContainerScaleRule = { referenceWidth: SCALE_REFERENCE_WIDTH, minScale: MIN_SCALE, maxScale: MAX_SCALE };

/**
 * Escala o "gêmeo digital" pela largura REAL do container onde o preview está montado
 * (plan-36), não mais uma constante assumindo viewport. `fallback` é usado até a
 * primeira medição resolver, e para sempre em ambiente sem `ResizeObserver` (SSR,
 * jsdom em teste): nenhum consumidor perde o número que já tinha.
 * `rule` diz a largura do sistema desenhado: a prévia desktop desenha na largura da janela do sistema e reduz para caber;
 * `null` (tablet e celular) desenha na largura do aparelho, sem reduzir.
 */
export const useContainerScale = (fallback: number, rule: ContainerScaleRule | null = DEFAULT_RULE) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [measured, setMeasured] = useState(fallback);
    const { referenceWidth, minScale, maxScale } = rule ?? DEFAULT_RULE;
    const fixed = rule === null;

    useEffect(() => {
        const node = containerRef.current;
        if (fixed || !node || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width;
            if (!width || width < 100) return;
            setMeasured(Math.min(maxScale, Math.max(minScale, width / referenceWidth)));
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, [fixed, referenceWidth, minScale, maxScale]);

    return { containerRef, scale: fixed ? 1 : measured };
};
