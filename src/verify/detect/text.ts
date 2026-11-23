/** Utilitários de texto compartilhados pelos detectores. */

/** Linha (1-based) de um índice no texto. */
export const lineAt = (text: string, index: number): number => {
    let line = 1;
    for (let cursor = 0; cursor < index; cursor += 1) {
        if (text.charCodeAt(cursor) === 10) line += 1;
    }
    return line;
};

/** Troca comentários de bloco por espaços, preservando índices e quebras de linha. */
export const blankCssComments = (text: string): string =>
    text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
