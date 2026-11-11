/** Sugestão de nomes próximos — tirada sempre da lista gerada que a regra consultou. */

const SUGGESTION_LIMIT = 3;
const MAX_EDIT_DISTANCE_RATIO = 0.4;

const editDistance = (left: string, right: string): number => {
    let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let row = 1; row <= left.length; row += 1) {
        const current = [row];
        for (let column = 1; column <= right.length; column += 1) {
            const substitution = previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1);
            current[column] = Math.min(previous[column] + 1, current[column - 1] + 1, substitution);
        }
        previous = current;
    }
    return previous[right.length];
};

/** Nomes parecidos pela grafia (ícone, tema, paleta): contido um no outro ou poucas edições. */
export const closestNames = (target: string, names: Iterable<string>): string[] => {
    const lowerTarget = target.toLowerCase();
    const scored: { name: string; score: number }[] = [];
    for (const name of names) {
        const lower = name.toLowerCase();
        const contained = lower.includes(lowerTarget) || lowerTarget.includes(lower);
        const distance = editDistance(lowerTarget, lower);
        const close = distance <= Math.max(1, Math.floor(lowerTarget.length * MAX_EDIT_DISTANCE_RATIO));
        if (contained || close) scored.push({ name, score: contained ? distance - lowerTarget.length : distance });
    }
    return scored
        .sort((left, right) => left.score - right.score || left.name.localeCompare(right.name))
        .slice(0, SUGGESTION_LIMIT)
        .map((entry) => entry.name);
};

const segmentsOf = (name: string): Set<string> => new Set(name.replace(/^--sarak-/, '').split('-'));

/** Variáveis `--sarak-*` parecidas pelos segmentos (`border-radius-md` ≈ `card-border-radius`). */
export const closestCssVars = (target: string, names: Iterable<string>): string[] => {
    const wanted = segmentsOf(target);
    const scored: { name: string; score: number }[] = [];
    for (const name of names) {
        const candidate = segmentsOf(name);
        const shared = [...wanted].filter((segment) => candidate.has(segment)).length;
        const score = shared / (wanted.size + candidate.size - shared);
        if (shared > 0 && score >= 0.3) scored.push({ name, score });
    }
    return scored
        .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
        .slice(0, SUGGESTION_LIMIT)
        .map((entry) => entry.name);
};

export const formatSuggestions = (names: string[]): string =>
    names.length > 0 ? ` Nomes parecidos: ${names.map((name) => `\`${name}\``).join(', ')}.` : '';
