import { useMemo } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';

/** Os quatro números de um `cubic-bezier(x1, y1, x2, y2)`, no formato que o `framer-motion` aceita em `ease`. */
export type CubicBezier = [number, number, number, number];

/** Curva de entrada e atraso de cascata de fábrica — o mesmo `defaultValue` dos tokens `motion*`. */
const DEFAULT_EASE_IN: CubicBezier = [0.4, 0, 1, 1];
const DEFAULT_STAGGER_SECONDS = 0.05;
/** Durações de fábrica — o mesmo `defaultValue` dos tokens `motionDuration*`. */
const DEFAULT_FAST_SECONDS = 0.2;
const DEFAULT_NORMAL_SECONDS = 0.3;
const DEFAULT_SLOW_SECONDS = 0.6;

const finiteSeconds = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;

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
    /** Durações, em segundos, de `motionDurationFast`/`Normal`/`Slow`; com `reducedMotion` ligado, todas 0. */
    durations: { fast: number; normal: number; slow: number };
}

/**
 * Tokens de movimento que o `framer-motion` precisa em JavaScript (CSS não os alcança): a curva da
 * saída das sobreposições e o atraso da entrada em cascata. Sem `SarakUIProvider`, valem os de fábrica.
 */
export const useMotionTokens = (): MotionTokens => {
    const design = useSarakUIOptional()?.design;
    const easeIn = design?.motionEaseIn;
    const staggerDelay = design?.motionStaggerDelay;
    const fast = design?.motionDurationFast;
    const normal = design?.motionDurationNormal;
    const slow = design?.motionDurationSlow;
    const reduced = design?.reducedMotion === true;
    return useMemo(
        () => ({
            easeIn: parseCubicBezier(easeIn) ?? DEFAULT_EASE_IN,
            staggerDelay: typeof staggerDelay === 'number' && Number.isFinite(staggerDelay) ? Math.max(0, staggerDelay) : DEFAULT_STAGGER_SECONDS,
            durations: reduced
                ? { fast: 0, normal: 0, slow: 0 }
                : {
                    fast: finiteSeconds(fast, DEFAULT_FAST_SECONDS),
                    normal: finiteSeconds(normal, DEFAULT_NORMAL_SECONDS),
                    slow: finiteSeconds(slow, DEFAULT_SLOW_SECONDS),
                },
        }),
        [easeIn, staggerDelay, fast, normal, slow, reduced],
    );
};
