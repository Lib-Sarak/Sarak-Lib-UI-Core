import { describe, expect, it } from 'vitest';
import { resolveMoreStart, resolveOverflowStart, type OverflowCell } from '../horizontalOverflow';

/** Sete itens de 100 px com vão de 8 px: o último termina em 7 × 100 + 6 × 8 = 748. */
const SEVEN: OverflowCell[] = Array.from({ length: 7 }, (_, index) => ({ left: index * 108, right: index * 108 + 100 }));
const MORE_WIDTH = 80;
const GAP = 8;

describe('resolveOverflowStart — onde a lista horizontal passa a ir para o "Mais"', () => {
    it('tudo cabe: nenhum item vai para o "Mais"', () => {
        expect(resolveOverflowStart(SEVEN, 748, MORE_WIDTH, GAP)).toBe(7);
        expect(resolveOverflowStart(SEVEN, 900, MORE_WIDTH, GAP)).toBe(7);
    });

    it('um pixel a menos e o último sai; o "Mais" toma o lugar e leva mais um item se não couber ao lado', () => {
        // Sobram 747: o botão (80 + 8) precisa do fim, então só cabe quem termina até 747 − 88 = 659 (o 6º termina em 640).
        expect(resolveOverflowStart(SEVEN, 747, MORE_WIDTH, GAP)).toBe(6);
        // 700: limite 612, e o 6º (termina em 640) já não cabe com o botão; o 5º (532) cabe.
        expect(resolveOverflowStart(SEVEN, 700, MORE_WIDTH, GAP)).toBe(5);
    });

    it('barra estreita: o que ficou é o prefixo da lista, e o resto todo vai para o "Mais"', () => {
        expect(resolveOverflowStart(SEVEN, 300, MORE_WIDTH, GAP)).toBe(2);
        expect(resolveOverflowStart(SEVEN, 150, MORE_WIDTH, GAP)).toBe(0);
    });

    it('sem largura medida (jsdom) ou sem itens, não esconde nada', () => {
        expect(resolveOverflowStart(SEVEN, 0, MORE_WIDTH, GAP)).toBe(7);
        expect(resolveOverflowStart([], 500, MORE_WIDTH, GAP)).toBe(0);
    });
});

describe('resolveMoreStart — onde o "Mais" começa', () => {
    it('a um vão do último item que ficou', () => {
        expect(resolveMoreStart(SEVEN, 5, GAP)).toBe(4 * 108 + 100 + GAP);
        expect(resolveMoreStart(SEVEN, 1, GAP)).toBe(100 + GAP);
    });

    it('sem item visível abre a área', () => {
        expect(resolveMoreStart(SEVEN, 0, GAP)).toBe(0);
        expect(resolveMoreStart([], 0, GAP)).toBe(0);
    });
});
