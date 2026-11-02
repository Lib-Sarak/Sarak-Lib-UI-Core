const MIN_TYPO_LENGTH = 4;
const LONG_TYPO_LENGTH = 8;

const levenshtein = (a: string, b: string, limit: number): number => {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
        const row = [i];
        for (let j = 1; j <= b.length; j += 1) {
            row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        previous = row;
    }
    return previous[b.length];
};

const typoLimit = (word: string, tolerance: number): number => (word.length >= LONG_TYPO_LENGTH ? tolerance + 1 : tolerance);

/** A palavra do vocabulário mais próxima (até `tolerance` erros; uma a mais em palavra longa); `null` se nenhuma. */
export const closestWord = (word: string, vocabulary: ReadonlySet<string>, tolerance: number): string | null => {
    if (word.length < MIN_TYPO_LENGTH || vocabulary.has(word)) return null;
    const limit = typoLimit(word, tolerance);
    let best: string | null = null;
    let bestDistance = limit + 1;
    vocabulary.forEach((candidate) => {
        const distance = levenshtein(word, candidate, limit);
        if (distance < bestDistance) { best = candidate; bestDistance = distance; }
    });
    return best;
};

/** Troca cada palavra desconhecida pela mais próxima do vocabulário; `null` se nenhuma mudou. */
export const correctTerms = (terms: string[], vocabulary: ReadonlySet<string>, tolerance: number): string[] | null => {
    const corrected = terms.map((term) => closestWord(term, vocabulary, tolerance) ?? term);
    return corrected.some((term, i) => term !== terms[i]) ? corrected : null;
};

