import { beforeEach, describe, expect, it } from 'vitest';
import { moveCellFocus } from '../tableGridNavigation';

const cellOf = (row: number, column: string): HTMLElement =>
    document.querySelector(`[data-testid="${row}-${column}"]`) as HTMLElement;

const cell = (row: number, column: string, editable = true): string =>
    `<div data-column-id="${column}">${editable ? `<div tabindex="0" data-editable-cell="true" data-testid="${row}-${column}"></div>` : ''}</div>`;

beforeEach(() => {
    document.body.innerHTML = `<div>
        <div role="row">${cell(0, 'a')}${cell(0, 'b')}</div>
        <div role="row">${cell(1, 'a', false)}${cell(1, 'b')}</div>
        <div role="row">${cell(2, 'a')}${cell(2, 'b')}</div>
    </div>`;
});

describe('moveCellFocus', () => {
    it('anda na linha', () => {
        expect(moveCellFocus(cellOf(0, 'a'), 'ArrowRight')).toBe(true);
        expect(document.activeElement).toBe(cellOf(0, 'b'));
        moveCellFocus(cellOf(0, 'b'), 'ArrowLeft');
        expect(document.activeElement).toBe(cellOf(0, 'a'));
    });

    it('anda na coluna, pulando a linha sem célula editável nela', () => {
        moveCellFocus(cellOf(0, 'a'), 'ArrowDown');
        expect(document.activeElement).toBe(cellOf(2, 'a'));
        moveCellFocus(cellOf(2, 'a'), 'ArrowUp');
        expect(document.activeElement).toBe(cellOf(0, 'a'));
    });

    it('na borda a tecla é consumida e o foco fica', () => {
        cellOf(0, 'a').focus();
        expect(moveCellFocus(cellOf(0, 'a'), 'ArrowUp')).toBe(true);
        expect(document.activeElement).toBe(cellOf(0, 'a'));
    });

    it('outra tecla não é da grade', () => {
        expect(moveCellFocus(cellOf(0, 'a'), 'Tab')).toBe(false);
    });
});
