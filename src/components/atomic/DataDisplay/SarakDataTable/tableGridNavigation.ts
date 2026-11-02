const CELL_SELECTOR = '[data-editable-cell]';

const columnIdOf = (cell: Element): string | null | undefined => cell.closest('[data-column-id]')?.getAttribute('data-column-id');

const nextInRow = (cell: HTMLElement, row: Element, step: number): HTMLElement | undefined => {
    const cells = [...row.querySelectorAll<HTMLElement>(CELL_SELECTOR)];
    return cells[cells.indexOf(cell) + step];
};

const nextInColumn = (cell: HTMLElement, row: Element, step: number): HTMLElement | undefined => {
    const columnId = columnIdOf(cell);
    const rows = [...(row.parentElement?.querySelectorAll(':scope > [role="row"]') ?? [])];
    for (let index = rows.indexOf(row) + step; index >= 0 && index < rows.length; index += step) {
        const match = [...rows[index].querySelectorAll<HTMLElement>(CELL_SELECTOR)].find((candidate) => columnIdOf(candidate) === columnId);
        if (match) return match;
    }
    return undefined;
};

/** Move o foco entre as células editáveis com as setas; devolve se a tecla foi usada. */
export const moveCellFocus = (cell: HTMLElement, key: string): boolean => {
    const row = cell.closest('[role="row"]');
    if (!row) return false;
    const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
    const vertical = key === 'ArrowUp' || key === 'ArrowDown';
    if (!horizontal && !vertical) return false;
    const step = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
    const target = horizontal ? nextInRow(cell, row, step) : nextInColumn(cell, row, step);
    target?.focus();
    return true;
};
