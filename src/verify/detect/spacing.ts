const LENGTH = /^-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|pt)$/;
const CSS_FUNCTION = /^(?:var|calc|min|max|clamp)\(/;

/** Espaçamento válido: token do catálogo, comprimento CSS, `0` ou função CSS. */
export const isValidSpacing = (value: string, tokens: readonly string[]): boolean =>
    tokens.includes(value) || value === '0' || LENGTH.test(value) || CSS_FUNCTION.test(value);

/** O token que o autor provavelmente quis (`md` → `spacing-md`), tirado da lista de tokens. */
export const spacingSuggestion = (value: string, tokens: readonly string[]): string | undefined =>
    tokens.find((token) => token === `spacing-${value}` || token.endsWith(`-${value}`));
