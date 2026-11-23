import { blankCssComments, lineAt } from './text';

export interface CssDeclaration {
    property: string;
    value: string;
    index: number;
    line: number;
}

export type LiteralKind = 'cor' | 'fonte';

const COLOR_PROPERTY = /^(?:color|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|text-decoration-color)$/;
const HEX_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
/** Nomes de cor CSS mais comuns. É um limite declarado: nomes raros não são vistos. */
const NAMED_COLOR = /\b(?:white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|gold|brown|cyan|magenta|navy|teal|lime|maroon|olive|aqua|fuchsia|coral|crimson|indigo|violet|tomato|salmon)\b/i;
const GENERIC_FONT = /^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|inherit|initial|unset|revert|)$/i;
const DECLARATION = /([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=[;}])/g;
const CALL_START = /^(?:var|url)\(/i;

const endOfCall = (value: string, start: number): number => {
    let depth = 0;
    for (let end = start; end < value.length; end += 1) {
        if (value[end] === '(') depth += 1;
        if (value[end] === ')') {
            depth -= 1;
            if (depth === 0) return end;
        }
    }
    return value.length - 1;
};

/** Remove `var(...)` (com a reserva dentro) e `url(...)`: o que está lá dentro é o padrão do token, não literal solto. */
export const stripVarAndUrl = (value: string): string => {
    let result = '';
    let cursor = 0;
    while (cursor < value.length) {
        if (CALL_START.test(value.slice(cursor))) {
            cursor = endOfCall(value, cursor) + 1;
        } else {
            result += value[cursor];
            cursor += 1;
        }
    }
    return result;
};

const hasLiteralColor = (value: string): boolean =>
    HEX_COLOR.test(value) || COLOR_FUNCTION.test(value) || NAMED_COLOR.test(value);

const hasLiteralFamily = (value: string): boolean =>
    value
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .some((item) => !GENERIC_FONT.test(item));

/** `cor` ou `fonte` quando a declaração traz literal fora de `var(--x, reserva)`; `null` quando passa. */
export const literalKindOf = (property: string, value: string): LiteralKind | null => {
    const bare = stripVarAndUrl(value);
    if (property === 'font-family') return hasLiteralFamily(bare) ? 'fonte' : null;
    if (COLOR_PROPERTY.test(property) && hasLiteralColor(bare)) return 'cor';
    return null;
};

/** Declarações `prop: valor` de um texto CSS, com a linha de cada uma. */
export const scanCssDeclarations = (text: string): CssDeclaration[] => {
    const clean = blankCssComments(text);
    return [...clean.matchAll(DECLARATION)].map((match) => ({
        property: match[1].toLowerCase(),
        value: match[2].trim(),
        index: match.index ?? 0,
        line: lineAt(clean, match.index ?? 0),
    }));
};

/** `backgroundColor` → `background-color`: a chave de um objeto de estilo vira propriedade CSS. */
export const cssPropertyOf = (key: string): string => key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
