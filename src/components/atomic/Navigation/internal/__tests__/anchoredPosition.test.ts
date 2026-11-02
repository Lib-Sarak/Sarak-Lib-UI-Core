import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANCHORED_MARGIN, placeAnchored } from '../anchoredPosition';

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

describe('placeAnchored', () => {
    const original = { width: window.innerWidth, height: window.innerHeight };
    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
    });
    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', { value: original.width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: original.height, configurable: true });
    });

    const anchor = rect(10, 100, 50, 40);
    const popover = rect(0, 0, 200, 120);

    it('side: à direita da âncora, alinhado ao topo', () => {
        expect(placeAnchored(anchor, popover, 'side')).toEqual({ left: 60 + ANCHORED_MARGIN, top: 100 });
    });

    it('side-up: à direita da âncora, alinhado à base (gatilho no rodapé)', () => {
        expect(placeAnchored(anchor, popover, 'side-up')).toEqual({ left: 60 + ANCHORED_MARGIN, top: 140 - 120 });
    });

    it('below: abaixo, na borda inicial da âncora', () => {
        expect(placeAnchored(anchor, popover, 'below')).toEqual({ left: 10, top: 140 + ANCHORED_MARGIN });
    });

    it('below-end: abaixo, na borda final da âncora', () => {
        expect(placeAnchored(rect(700, 20, 50, 40), popover, 'below-end')).toEqual({ left: 750 - 200, top: 60 + ANCHORED_MARGIN });
    });

    it('nunca sai da janela: encosta na margem em cada eixo', () => {
        expect(placeAnchored(rect(950, 560, 40, 30), popover, 'side')).toEqual({ left: 1000 - 200 - ANCHORED_MARGIN, top: 600 - 120 - ANCHORED_MARGIN });
        expect(placeAnchored(rect(0, 0, 10, 10), popover, 'side-up')).toEqual({ left: 10 + ANCHORED_MARGIN, top: ANCHORED_MARGIN });
    });
});
