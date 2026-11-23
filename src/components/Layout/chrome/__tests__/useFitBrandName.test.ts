import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { useFitBrandName } from '../useFitBrandName';
import { useRef } from 'react';

const Probe = ({ name }: { name: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    useFitBrandName(ref, name);
    return createElement('span', { ref, 'data-testid': 'nome', style: { maxWidth: 'min(120px, 100%)', fontSize: '20px' } }, name);
};

/** Mede como um navegador: a caixa é larga demais enquanto a fonte passa do limite dado. */
const stubLayout = (element: HTMLElement, fitsAtPx: number, fitsOnlyWhenWide = false): void => {
    Object.defineProperty(element, 'clientWidth', { configurable: true, get: () => 100 });
    Object.defineProperty(element, 'scrollHeight', { configurable: true, get: () => 0 });
    Object.defineProperty(element, 'scrollWidth', {
        configurable: true,
        get: () => {
            const size = parseFloat(element.style.fontSize || '20');
            const wide = element.style.maxWidth === '100%';
            return size <= fitsAtPx || (fitsOnlyWhenWide && wide) ? 100 : 160;
        },
    });
};

describe('useFitBrandName', () => {
    it('sem layout (jsdom), não força tamanho: vale a fonte do tema', () => {
        const { getByTestId } = render(createElement(Probe, { name: 'Sarak OS' }));
        expect(getByTestId('nome').style.fontSize).toBe(''); // nenhuma redução inline: vale a fonte do tema
    });

    it('reduz a fonte de 1 em 1 px até a palavra caber, sem passar do piso do rótulo do item', () => {
        const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(((element: Element) => ({
            fontSize: (element as HTMLElement).style.fontSize || '20px',
        })) as never);
        const { getByTestId, rerender } = render(createElement(Probe, { name: 'A' }));
        const node = getByTestId('nome');
        stubLayout(node, 17);
        rerender(createElement(Probe, { name: 'Sarak OS' }));
        expect(node.style.fontSize).toBe('17px');
        spy.mockRestore();
    });
});
