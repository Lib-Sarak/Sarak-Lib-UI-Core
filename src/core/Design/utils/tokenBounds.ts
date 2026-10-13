import type { SarakDesignToken } from '../types';

/** Faixa que o painel desenha e que a validação aplica ao número de um token: uma só fonte. */
export interface TokenBounds {
    min?: number;
    max?: number;
    step?: number;
}

/** `constraints` manda; `min`/`max`/`step` soltos no token são a forma antiga e só valem na falta dela. */
export const getTokenBounds = (token: SarakDesignToken): TokenBounds => ({
    min: token.constraints?.min ?? token.min,
    max: token.constraints?.max ?? token.max,
    step: token.constraints?.step ?? token.step
});

/** Leva `value` para dentro de `[min, max]` do token. Sem faixa declarada, devolve o próprio valor. */
export const clampToTokenBounds = (value: number, token: SarakDesignToken): number => {
    const { min, max } = getTokenBounds(token);
    let result = value;
    if (typeof min === 'number') result = Math.max(result, min);
    if (typeof max === 'number') result = Math.min(result, max);
    return result;
};

/** O que o painel desenha quando o schema não declara faixa: o slider parte de 0 e anda de 1 em 1. */
const PANEL_DEFAULT_MIN = 0;
const PANEL_DEFAULT_STEP = 1;
const GRID_TOLERANCE = 1e-6;

/**
 * O valor (ou algum eixo `desk`/`tab`/`mob`) está FORA da grade do `step`, contada a partir do `min`. O
 * slider "encaixa" na grade ao ser mexido, então um valor de tema fora dela é desenhado de um jeito e
 * regravado de outro. Só números: texto, cor e enumeração não têm grade.
 */
export const isOffTokenGrid = (value: unknown, token: SarakDesignToken): boolean => {
    if (typeof value === 'number') {
        const { min, step } = getTokenBounds(token);
        const base = min ?? PANEL_DEFAULT_MIN;
        const width = step ?? PANEL_DEFAULT_STEP;
        const cells = (value - base) / width;
        return Math.abs(cells - Math.round(cells)) > GRID_TOLERANCE;
    }
    if (value === null || typeof value !== 'object') return false;
    return Object.values(value as Record<string, unknown>).some((axis) => isOffTokenGrid(axis, token));
};

/** O valor (ou algum eixo `desk`/`tab`/`mob`) cairia fora de `[min, max]` e a validação o cortaria. */
export const isOutsideTokenBounds = (value: unknown, token: SarakDesignToken): boolean => {
    if (typeof value === 'number') return clampToTokenBounds(value, token) !== value;
    if (value === null || typeof value !== 'object') return false;
    return Object.values(value as Record<string, unknown>).some((axis) => isOutsideTokenBounds(axis, token));
};
