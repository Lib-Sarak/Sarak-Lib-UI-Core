import { oklchToRgbGamutMapped, rgbToOklch } from './color-space';
import type { RgbColor } from './types';

/** Passo da busca, em luminosidade OKLCH: a tolerância declarada do deslocamento mínimo. */
export const SHIFT_STEP = 0.002;

/** Folga sobre o mínimo do par: a cor sai do arredondamento para hexadecimal ainda acima dele. */
export const SHIFT_CONTRAST_GUARD = 0.01;

const MAX_STEPS = Math.ceil(1 / SHIFT_STEP);

export interface ShiftScore {
    failedPairs: number;
    minimumRatio: number;
}

export interface ShiftResult extends ShiftScore {
    color: RgbColor;
    /** Quanto a luminosidade andou em relação à origem; zero quando a origem já passa. */
    shift: number;
}

type ScoreColor = (color: RgbColor) => ShiftScore;

const isBetter = (candidate: ShiftResult, current: ShiftResult | undefined): boolean => {
    if (!current) return true;
    if (candidate.failedPairs !== current.failedPairs) return candidate.failedPairs < current.failedPairs;
    return candidate.minimumRatio > current.minimumRatio;
};

const shiftedColor = (origin: RgbColor, steps: number, direction: 1 | -1): RgbColor | undefined => {
    const { lightness, chroma, hue } = rgbToOklch(origin);
    const next = lightness + direction * steps * SHIFT_STEP;
    if (next < 0 || next > 1) return undefined;
    return oklchToRgbGamutMapped({ lightness: next, chroma, hue });
};

/**
 * A cor de mesmo matiz e croma da `origin` com a MENOR mudança de luminosidade que passa em todos os pares.
 * A origem que já passa sai intacta; sem solução, a de maior contraste que a busca encontrou.
 */
export const findMinimalShift = (origin: RgbColor, score: ScoreColor): ShiftResult => {
    const unchanged = { ...score(origin), color: origin, shift: 0 };
    if (unchanged.failedPairs === 0) return unchanged;
    let best: ShiftResult = unchanged;
    for (let steps = 1; steps <= MAX_STEPS; steps += 1) {
        const level = ([1, -1] as const).flatMap((direction) => {
            const color = shiftedColor(origin, steps, direction);
            return color ? [{ ...score(color), color, shift: steps * SHIFT_STEP }] : [];
        });
        if (level.length === 0) break;
        const passing = level.filter((candidate) => candidate.failedPairs === 0);
        if (passing.length > 0) return passing.reduce((left, right) => (right.minimumRatio > left.minimumRatio ? right : left));
        best = level.reduce((left, right) => (isBetter(right, left) ? right : left), best);
    }
    return best;
};
