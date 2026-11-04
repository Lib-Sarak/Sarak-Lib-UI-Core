import { describe, expect, it } from 'vitest';
import { sarakNextGridPosition } from '../permissionGrid';

const SIZE = { rows: 12, columns: 4 };

describe('sarakNextGridPosition', () => {
    it('as setas movem uma célula', () => {
        expect(sarakNextGridPosition('ArrowRight', { row: 1, column: 1 }, SIZE)).toEqual({ row: 1, column: 2 });
        expect(sarakNextGridPosition('ArrowLeft', { row: 1, column: 1 }, SIZE)).toEqual({ row: 1, column: 0 });
        expect(sarakNextGridPosition('ArrowDown', { row: 1, column: 1 }, SIZE)).toEqual({ row: 2, column: 1 });
        expect(sarakNextGridPosition('ArrowUp', { row: 1, column: 1 }, SIZE)).toEqual({ row: 0, column: 1 });
    });

    it('na borda não sai da grade: devolve null', () => {
        expect(sarakNextGridPosition('ArrowLeft', { row: 0, column: 0 }, SIZE)).toBeNull();
        expect(sarakNextGridPosition('ArrowDown', { row: 11, column: 3 }, SIZE)).toBeNull();
    });

    it('Home e End andam na linha; com Ctrl, vão aos cantos da grade', () => {
        expect(sarakNextGridPosition('End', { row: 3, column: 1 }, SIZE)).toEqual({ row: 3, column: 3 });
        expect(sarakNextGridPosition('Home', { row: 3, column: 2 }, SIZE)).toEqual({ row: 3, column: 0 });
        expect(sarakNextGridPosition('End', { row: 3, column: 1 }, SIZE, true)).toEqual({ row: 11, column: 3 });
        expect(sarakNextGridPosition('Home', { row: 3, column: 1 }, SIZE, true)).toEqual({ row: 0, column: 0 });
    });

    it('PageDown e PageUp saltam cinco linhas e param nas pontas', () => {
        expect(sarakNextGridPosition('PageDown', { row: 2, column: 1 }, SIZE)).toEqual({ row: 7, column: 1 });
        expect(sarakNextGridPosition('PageDown', { row: 9, column: 1 }, SIZE)).toEqual({ row: 11, column: 1 });
        expect(sarakNextGridPosition('PageUp', { row: 2, column: 1 }, SIZE)).toEqual({ row: 0, column: 1 });
    });

    it('tecla que a grade não usa devolve null', () => {
        expect(sarakNextGridPosition('a', { row: 1, column: 1 }, SIZE)).toBeNull();
    });
});
