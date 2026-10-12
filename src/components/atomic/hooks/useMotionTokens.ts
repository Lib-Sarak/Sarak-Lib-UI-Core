import { useMemo } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';

/** Os quatro números de um `cubic-bezier(x1, y1, x2, y2)`, no formato que o `framer-motion` aceita em `ease`. */
export type CubicBezier = [number, number, number, number];

/** Curva de entrada e atraso de cascata de fábrica — o mesmo `defaultValue` dos tokens `motion*`. */
const DEFAULT_EASE_IN: CubicBezier = [0.4, 0, 1, 1];
const DEFAULT_STAGGER_SECONDS = 0.05;

const CUBIC_BEZIER = /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;

/**
 * Lê a string do token (`cubic-bezier(0.4, 0, 1, 1)`) como os quatro números do `framer-motion`.
 * Qualquer outra forma (`linear`, `ease-in`, texto livre do painel) devolve `undefined`: quem chama
 * cai na curva de fábrica em vez de animar com um valor que o motor de movimento não entende.
 */
export const parseCubicBezier = (value: unknown): CubicBezier | undefined => {
    if (typeof value !== 'string') return undefined;
    const match = CUBIC_BEZIER.exec(value.trim());
    if (!match) return undefined;
    const numbers = match.slice(1).map(Number);
    return numbers.every(Number.isFinite) ? (numbers as CubicBezier) : undefined;
};

export interface MotionTokens {
    /** Curva de entrada (`motionEaseIn`): a saída de uma sobreposição começa devagar e acelera. */
    easeIn: CubicBezier;
    /** Atraso, em segundos, entre um item e o próximo de uma entrada em cascata (`motionStaggerDelay`). */
    staggerDelay: number;
}

/**
 * Tokens de movimento que o `framer-motion` precisa em JavaScript (CSS não os alcança): a curva da
 * saída das sobreposições e o atraso da entrada em cascata. Sem `SarakUIProvider`, valem os de fábrica.
 */
export const useMotionTokens = (): MotionTokens => {
    const design = useSarakUIOptional()?.design;
    const easeIn = design?.motionEaseIn;
    const staggerDelay = design?.motionStaggerDelay;
    return useMemo(
        () => ({
            easeIn: parseCubicBezier(easeIn) ?? DEFAULT_EASE_IN,
            staggerDelay: typeof staggerDelay === 'number' && Number.isFinite(staggerDelay) ? Math.max(0, staggerDelay) : DEFAULT_STAGGER_SECONDS,
        }),
        [easeIn, staggerDelay],
    );
};
