import { createElement, useRef } from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NAV_CELL_ATTRIBUTE, NAV_MORE_ATTRIBUTE, useHorizontalOverflow, type HorizontalOverflow } from '../useHorizontalOverflow';

const CELL_WIDTH = 100;

const mockLayout = (navWidth: number, scale = 1): void => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure(this: HTMLElement) {
        const cells = Array.from(document.querySelectorAll(`[${NAV_CELL_ATTRIBUTE}]`));
        const index = cells.indexOf(this);
        const box = (layoutLeft: number, layoutWidth: number): DOMRect => ({ left: layoutLeft * scale, right: (layoutLeft + layoutWidth) * scale, width: layoutWidth * scale, top: 0, bottom: 0, height: 0, x: layoutLeft * scale, y: 0, toJSON: () => ({}) });
        if (index >= 0) return box(index * CELL_WIDTH, CELL_WIDTH);
        if (this.hasAttribute(NAV_MORE_ATTRIBUTE)) return box(0, 60);
        return box(0, this.tagName === 'NAV' ? navWidth : 0);
    });
    // `offsetWidth` é a largura de layout (sem o `transform`); o `jsdom` não a calcula.
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function layoutWidth(this: HTMLElement) {
        return this.tagName === 'NAV' ? navWidth : 0;
    });
};

let result: HorizontalOverflow = { start: null, moreStart: 0 };

const Probe = ({ enabled }: { enabled: boolean }) => {
    const ref = useRef<HTMLElement | null>(null);
    result = useHorizontalOverflow(ref as React.RefObject<HTMLElement>, enabled, 'a|b|c|d');
    return createElement('nav', { ref }, ...[0, 1, 2, 3].map((key) => createElement('div', { key, [NAV_CELL_ATTRIBUTE]: 'true' })), createElement('div', { [NAV_MORE_ATTRIBUTE]: 'true' }));
};

afterEach(() => vi.restoreAllMocks());

describe('useHorizontalOverflow — o índice do primeiro item que vai para o "Mais"', () => {
    it('mede as células e o botão: com 250 px e o botão de 60, ficam os que terminam até 190', () => {
        mockLayout(250);
        render(createElement(Probe, { enabled: true }));
        expect(result.start).toBe(1);
        // O botão começa a um vão (0 aqui) do fim do 1º item.
        expect(result.moreStart).toBe(100);
    });

    it('numa barra reduzida por transform: scale, cabem os mesmos itens e o botão fica a um vão do último, em px de layout', () => {
        mockLayout(250, 0.5);
        render(createElement(Probe, { enabled: true }));
        expect(result.start).toBe(1);
        expect(result.moreStart).toBe(100);
    });

    it('cabendo tudo devolve o tamanho da lista', () => {
        mockLayout(500);
        render(createElement(Probe, { enabled: true }));
        expect(result.start).toBe(4);
    });

    it('desligado (lista vertical) não mede e devolve null', () => {
        mockLayout(100);
        render(createElement(Probe, { enabled: false }));
        expect(result.start).toBeNull();
    });
});
