export type SarakDiffLineKind = 'same' | 'added' | 'removed';

export interface SarakDiffLine {
    kind: SarakDiffLineKind;
    text: string;
}

/** Acima deste número de células da tabela (linhas × linhas do miolo), o miolo vira "tudo removido, tudo adicionado". */
const MAX_TABLE_CELLS = 1_000_000;

const splitLines = (value: string): string[] => (value === '' ? [] : value.split(/\r?\n/));

const asLines = (kind: SarakDiffLineKind, texts: string[]): SarakDiffLine[] => texts.map((text) => ({ kind, text }));

/** Tabela do maior trecho comum: `table[i][j]` é o comprimento para `before[i..]` e `after[j..]`. */
const buildCommonTable = (before: string[], after: string[]): number[][] => {
    const table = Array.from({ length: before.length + 1 }, () => new Array<number>(after.length + 1).fill(0));
    for (let row = before.length - 1; row >= 0; row -= 1) {
        for (let column = after.length - 1; column >= 0; column -= 1) {
            table[row][column] = before[row] === after[column]
                ? table[row + 1][column + 1] + 1
                : Math.max(table[row + 1][column], table[row][column + 1]);
        }
    }
    return table;
};

const diffCore = (before: string[], after: string[]): SarakDiffLine[] => {
    if ((before.length + 1) * (after.length + 1) > MAX_TABLE_CELLS) {
        return [...asLines('removed', before), ...asLines('added', after)];
    }
    const table = buildCommonTable(before, after);
    const lines: SarakDiffLine[] = [];
    let row = 0;
    let column = 0;
    while (row < before.length && column < after.length) {
        if (before[row] === after[column]) {
            lines.push({ kind: 'same', text: before[row] });
            row += 1;
            column += 1;
            continue;
        }
        const keepsMoreByRemoving = table[row + 1][column] >= table[row][column + 1];
        lines.push({ kind: keepsMoreByRemoving ? 'removed' : 'added', text: keepsMoreByRemoving ? before[row] : after[column] });
        if (keepsMoreByRemoving) row += 1;
        else column += 1;
    }
    return [...lines, ...asLines('removed', before.slice(row)), ...asLines('added', after.slice(column))];
};

/**
 * Diferença por linha entre dois textos. Corta o início e o fim iguais antes de comparar, para que o custo
 * dependa só do trecho que mudou; se esse miolo ainda passar do limite de células, ele sai todo como removido
 * e adicionado, sem travar a aba. Função pura.
 */
export const sarakDiffLines = (beforeText: string, afterText: string): SarakDiffLine[] => {
    const before = splitLines(beforeText);
    const after = splitLines(afterText);
    let start = 0;
    while (start < before.length && start < after.length && before[start] === after[start]) start += 1;
    let endBefore = before.length;
    let endAfter = after.length;
    while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) {
        endBefore -= 1;
        endAfter -= 1;
    }
    return [
        ...asLines('same', before.slice(0, start)),
        ...diffCore(before.slice(start, endBefore), after.slice(start, endAfter)),
        ...asLines('same', before.slice(endBefore)),
    ];
};
