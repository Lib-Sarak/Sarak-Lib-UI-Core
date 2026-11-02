import { describe, expect, it } from 'vitest';
import { resolveIconSlots } from '../iconSlots';

describe('resolveIconSlots', () => {
    it('sem ícone não há vaga', () => {
        expect(resolveIconSlots(undefined, undefined, undefined, 'left')).toEqual([]);
    });

    it('ícone único segue o lado do tema e é inerte', () => {
        expect(resolveIconSlots('i', undefined, undefined, 'right')).toEqual([{ node: 'i', side: 'right', interactive: false }]);
    });

    it('esquerdo e direito juntos: só o direito é interativo', () => {
        const slots = resolveIconSlots(undefined, 'l', 'r', 'left');
        expect(slots.map((slot) => [slot.side, slot.interactive])).toEqual([['left', false], ['right', true]]);
    });
});
