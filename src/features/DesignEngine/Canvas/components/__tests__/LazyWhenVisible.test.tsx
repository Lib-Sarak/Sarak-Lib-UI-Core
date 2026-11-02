import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LazyWhenVisible } from '../LazyWhenVisible';

describe('LazyWhenVisible', () => {
    afterEach(() => { vi.unstubAllGlobals(); });

    it('sem IntersectionObserver desenha na hora: perder o conteúdo seria pior que adiantá-lo', () => {
        const { getByText } = render(<LazyWhenVisible className="h-10"><span>conteúdo</span></LazyWhenVisible>);
        expect(getByText('conteúdo')).toBeInTheDocument();
    });

    it('com IntersectionObserver só desenha quando o espaço entra na área visível, e mantém depois', () => {
        let notify: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
        vi.stubGlobal('IntersectionObserver', class {
            constructor(callback: typeof notify) { notify = callback; }
            observe() {}
            disconnect() {}
        });
        const { container, queryByText } = render(<LazyWhenVisible className="h-10"><span>conteúdo</span></LazyWhenVisible>);
        const slot = container.firstElementChild as HTMLElement;

        expect(queryByText('conteúdo')).toBeNull();
        expect(slot).toHaveAttribute('data-sx-lazy', 'pending');
        expect(slot).toHaveClass('h-10');

        act(() => notify([{ isIntersecting: false }]));
        expect(queryByText('conteúdo')).toBeNull();

        act(() => notify([{ isIntersecting: true }]));
        expect(queryByText('conteúdo')).toBeInTheDocument();
        expect(slot).toHaveAttribute('data-sx-lazy', 'shown');
    });
});
