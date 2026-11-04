export interface SarakGridPosition {
    row: number;
    column: number;
}

export interface SarakGridSize {
    rows: number;
    columns: number;
}

const PAGE_STEP = 5;

const clamp = (value: number, last: number): number => Math.min(Math.max(value, 0), Math.max(last, 0));

/**
 * Próxima célula do teclado de grade (padrão ARIA grid): setas movem uma célula, Home/End vão ao início e ao fim
 * da linha, Ctrl+Home/End à primeira e à última célula, PageUp/PageDown saltam linhas. Devolve `null` para tecla
 * que a grade não usa, ou quando a posição não muda. Função pura.
 */
export const sarakNextGridPosition = (key: string, from: SarakGridPosition, size: SarakGridSize, ctrl = false): SarakGridPosition | null => {
    const lastRow = size.rows - 1;
    const lastColumn = size.columns - 1;
    const moves: Record<string, SarakGridPosition> = {
        ArrowUp: { row: from.row - 1, column: from.column },
        ArrowDown: { row: from.row + 1, column: from.column },
        ArrowLeft: { row: from.row, column: from.column - 1 },
        ArrowRight: { row: from.row, column: from.column + 1 },
        PageUp: { row: from.row - PAGE_STEP, column: from.column },
        PageDown: { row: from.row + PAGE_STEP, column: from.column },
        Home: ctrl ? { row: 0, column: 0 } : { row: from.row, column: 0 },
        End: ctrl ? { row: lastRow, column: lastColumn } : { row: from.row, column: lastColumn },
    };
    const target = moves[key];
    if (!target) return null;
    const next = { row: clamp(target.row, lastRow), column: clamp(target.column, lastColumn) };
    return next.row === from.row && next.column === from.column ? null : next;
};
