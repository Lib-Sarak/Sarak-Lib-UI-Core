import { blankCssComments, lineAt } from './text';

export interface SelectorHit {
    selector: string;
    index: number;
    line: number;
}

/** `.sarak-<x>` e `[class*="sarak"]`/`[class^="sarak"]`: classe interna da lib, que muda sem aviso. */
const INTERNAL_CLASS = /\.sarak-[\w-]+|\[class[*^$~|]?=\s*["']?\.?sarak[^\]]*\]/g;

export const findInternalClassSelectors = (text: string): SelectorHit[] => {
    const clean = blankCssComments(text);
    return [...clean.matchAll(INTERNAL_CLASS)].map((match) => ({
        selector: match[0],
        index: match.index ?? 0,
        line: lineAt(clean, match.index ?? 0),
    }));
};

/** Métodos cujo primeiro argumento é seletor de DOM ou de teste. */
export const SELECTOR_METHODS: ReadonlySet<string> = new Set([
    'querySelector',
    'querySelectorAll',
    'closest',
    'matches',
    'locator',
    '$',
    '$$',
]);
