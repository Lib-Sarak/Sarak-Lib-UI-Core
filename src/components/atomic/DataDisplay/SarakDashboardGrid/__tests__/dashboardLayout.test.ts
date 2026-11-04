import { describe, expect, it } from 'vitest';
import {
    compactDashboardLayout,
    completeDashboardLayout,
    moveDashboardItem,
    readingOrder,
    resizeDashboardItem,
    type SarakDashboardLayoutItem,
} from '../dashboardLayout';

const layout: SarakDashboardLayoutItem[] = [
    { id: 'a', x: 0, y: 0, w: 4, h: 2 },
    { id: 'b', x: 4, y: 0, w: 4, h: 2 },
    { id: 'c', x: 0, y: 2, w: 4, h: 2 },
];
const find = (list: SarakDashboardLayoutItem[], id: string) => list.find((item) => item.id === id)!;

describe('dashboardLayout', () => {
    it('move o widget uma célula para a direita', () => {
        expect(find(moveDashboardItem(layout, 'b', 'ArrowRight', 12), 'b').x).toBe(5);
    });

    it('não passa da borda esquerda nem da direita', () => {
        expect(find(moveDashboardItem(layout, 'a', 'ArrowLeft', 12), 'a').x).toBe(0);
        const atEdge = [{ id: 'a', x: 8, y: 0, w: 4, h: 2 }];
        expect(find(moveDashboardItem(atEdge, 'a', 'ArrowRight', 12), 'a').x).toBe(8);
    });

    it('ao descer sobre outro widget, os dois trocam de lugar e nada se sobrepõe', () => {
        const moved = moveDashboardItem(layout, 'a', 'ArrowDown', 12);
        expect(find(moved, 'c').y).toBe(0);
        expect(find(moved, 'a').y).toBe(2);
    });

    it('ao subir sobre outro widget, também troca', () => {
        const moved = moveDashboardItem(layout, 'c', 'ArrowUp', 12);
        expect(find(moved, 'c').y).toBe(0);
        expect(find(moved, 'a').y).toBe(2);
    });

    it('mover para o lado de um vizinho empurra o vizinho para baixo', () => {
        const moved = moveDashboardItem([{ id: 'a', x: 0, y: 0, w: 4, h: 2 }, { id: 'b', x: 4, y: 0, w: 4, h: 2 }], 'a', 'ArrowRight', 12);
        expect(find(moved, 'a')).toMatchObject({ x: 1, y: 0 });
        expect(find(moved, 'b').y).toBe(2);
    });

    it('tecla que não é seta, ou id desconhecido, devolve o mesmo layout', () => {
        expect(moveDashboardItem(layout, 'a', 'Enter', 12)).toEqual(layout);
        expect(moveDashboardItem(layout, 'zzz', 'ArrowDown', 12)).toEqual(layout);
        expect(resizeDashboardItem(layout, 'a', 'Enter', 12)).toEqual(layout);
    });

    it('redimensiona respeitando o mínimo e as colunas', () => {
        const small = [{ id: 'a', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 }];
        const shrunk = find(resizeDashboardItem(small, 'a', 'ArrowLeft', 12), 'a');
        expect(shrunk.w).toBe(2);
        expect(find(resizeDashboardItem(small, 'a', 'ArrowUp', 12), 'a').h).toBe(2);
        const wide = [{ id: 'a', x: 10, y: 0, w: 2, h: 1 }];
        expect(find(resizeDashboardItem(wide, 'a', 'ArrowRight', 12), 'a').w).toBe(2);
        expect(find(resizeDashboardItem(wide, 'a', 'ArrowDown', 12), 'a').h).toBe(2);
    });

    it('compacta para cima', () => {
        const loose = [{ id: 'a', x: 0, y: 5, w: 4, h: 2 }];
        expect(find(compactDashboardLayout(loose), 'a').y).toBe(0);
    });

    it('a ordem de leitura vai de cima para baixo e da esquerda para a direita', () => {
        expect(readingOrder(layout)).toEqual(['a', 'b', 'c']);
    });

    it('widget sem item recebe um padrão no fim e item sem widget é descartado', () => {
        const completed = completeDashboardLayout(['a', 'novo'], layout, 12);
        expect(completed.map((item) => item.id)).toEqual(['a', 'novo']);
        expect(find(completed, 'novo')).toMatchObject({ x: 0, w: 4, h: 2 });
        expect(find(completed, 'novo').y).toBeGreaterThanOrEqual(2);
    });
});
