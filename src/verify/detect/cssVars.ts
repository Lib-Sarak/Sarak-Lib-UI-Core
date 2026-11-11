import { blankCssComments, lineAt } from './text';

export interface VarReference {
    name: string;
    index: number;
    line: number;
}

const VAR_REFERENCE = /var\(\s*(--sarak-[\w-]+)/g;
const VAR_DECLARATION = /(--sarak-[\w-]+)['"]?\s*:/g;

/** Nomes `--sarak-*` que o próprio texto declara — o importador pode ter variável sua com o prefixo. */
export const declaredSarakVars = (text: string): Set<string> =>
    new Set([...text.matchAll(VAR_DECLARATION)].map((match) => match[1]));

/** Toda `var(--sarak-X…)` do texto (com ou sem reserva). Variável montada por concatenação não é vista. */
export const findSarakVarReferences = (text: string): VarReference[] => {
    const clean = blankCssComments(text);
    return [...clean.matchAll(VAR_REFERENCE)].map((match) => ({
        name: match[1],
        index: match.index ?? 0,
        line: lineAt(clean, match.index ?? 0),
    }));
};
