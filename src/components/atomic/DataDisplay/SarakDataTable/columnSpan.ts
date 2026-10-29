/**
 * `colSpan` por linha: a célula cobre as colunas seguintes, que deixam de ser renderizadas naquela
 * linha. A cobertura para antes de uma coluna com congelamento diferente — uma célula não pode
 * atravessar a fronteira de uma coluna fixa, senão o `sticky` dela desalinha.
 */

export interface SpanColumn<T> {
    id: string;
    pinned?: 'left' | 'right';
    colSpan?: (row: T) => number | undefined;
}

export interface ResolvedCell<C> {
    column: C;
    /** Quantas colunas a célula cobre (>= 1). */
    span: number;
    /** Soma das larguras das colunas cobertas. */
    width: number;
}

export function resolveRowCells<T, C extends SpanColumn<T>>(columns: C[], row: T, widthOf: (column: C) => number): Array<ResolvedCell<C>> {
    const cells: Array<ResolvedCell<C>> = [];
    let index = 0;
    while (index < columns.length) {
        const column = columns[index];
        const requested = Math.floor(column.colSpan?.(row) ?? 1);
        let span = 1;
        while (span < requested && index + span < columns.length && columns[index + span].pinned === column.pinned) span += 1;
        const width = columns.slice(index, index + span).reduce((sum, covered) => sum + widthOf(covered), 0);
        cells.push({ column, span, width });
        index += span;
    }
    return cells;
}
