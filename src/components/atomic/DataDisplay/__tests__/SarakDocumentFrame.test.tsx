import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sarakDocumentScale, SarakDocumentFrame } from '../SarakDocumentFrame';

const A4_WIDTH = 794;

afterEach(() => vi.unstubAllGlobals());

const sheet = (): HTMLElement => document.querySelector('[data-sarak-document]') as HTMLElement;

describe('sarakDocumentScale', () => {
    it('fit só reduz', () => {
        expect(sarakDocumentScale('fit', 397, A4_WIDTH)).toBe(0.5);
        expect(sarakDocumentScale('fit', 2000, A4_WIDTH)).toBe(1);
        expect(sarakDocumentScale('fit', null, A4_WIDTH)).toBe(1);
        expect(sarakDocumentScale('fit', 0, A4_WIDTH)).toBe(1);
    });

    it('número fixa a escala', () => {
        expect(sarakDocumentScale(1.5, 397, A4_WIDTH)).toBe(1.5);
    });
});

describe('SarakDocumentFrame', () => {
    it('desenha o formato, com a altura como mínimo para documento longo', () => {
        const { rerender } = render(<SarakDocumentFrame>Nota</SarakDocumentFrame>);
        expect(sheet()).toHaveAttribute('data-sarak-document', 'a4');
        expect(sheet().style.width).toBe('794px');
        expect(sheet().style.minHeight).toBe('1123px');
        rerender(<SarakDocumentFrame format="letter">Nota</SarakDocumentFrame>);
        expect(sheet().style.width).toBe('816px');
        rerender(<SarakDocumentFrame format="phone">Nota</SarakDocumentFrame>);
        expect(sheet().style.width).toBe('390px');
    });

    it('as ações ficam fora do documento e marcadas para não imprimir', () => {
        render(<SarakDocumentFrame actions={<button>Imprimir</button>} label="Pedido">Nota</SarakDocumentFrame>);
        const action = screen.getByRole('button', { name: 'Imprimir' });
        expect(action.closest('[data-sarak-no-print]')).not.toBeNull();
        expect(sheet()).not.toContainElement(action);
        expect(screen.getByRole('region', { name: 'Pedido' })).toBeInTheDocument();
    });

    it('sem ações, não sobra faixa vazia', () => {
        render(<SarakDocumentFrame>Nota</SarakDocumentFrame>);
        expect(document.querySelector('[data-sarak-no-print]')).toBeNull();
    });

    it('ajusta ao contêiner observado e desliga o observador', () => {
        let notify: () => void = () => undefined;
        const disconnect = vi.fn();
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback: () => void) { notify = callback; }
            observe = vi.fn();
            disconnect = disconnect;
        });
        const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 397 } as DOMRect);
        const { unmount } = render(<SarakDocumentFrame>Nota</SarakDocumentFrame>);
        expect(sheet().style.zoom).toBe('0.5');
        measure.mockReturnValue({ width: 2000 } as DOMRect);
        act(() => notify());
        expect(sheet().style.zoom).toBe('1');
        unmount();
        expect(disconnect).toHaveBeenCalled();
        measure.mockRestore();
    });
});
