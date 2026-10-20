import type { SarakDesignToken } from '../../Design/types';
import { isOutsideTokenBounds } from '../../Design/utils/tokenBounds';

const FUNCTIONAL_RANGE_MIGRATION_TOKENS = new Set([
    'topbarCollapsedHeight',
    'focusRingWidth',
    'zIndexSidebar',
    'zIndexModal',
]);

export const warnForFunctionalRangeClamp = (
    key: string,
    value: unknown,
    token: SarakDesignToken,
    clampedValue: unknown,
): void => {
    if (!FUNCTIONAL_RANGE_MIGRATION_TOKENS.has(key) || !isOutsideTokenBounds(value, token)) return;
    console.warn(`[Sarak:Design] Token funcional "${key}" fora da faixa — valor ajustado ao limite.`, value, clampedValue);
};
