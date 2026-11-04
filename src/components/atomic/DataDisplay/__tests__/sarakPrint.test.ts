import { afterEach, describe, expect, it, vi } from 'vitest';
import { sarakPrint } from '../sarakPrint';

const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);

afterEach(() => print.mockClear());

describe('sarakPrint', () => {
    it('sem elemento, imprime a página', () => {
        sarakPrint();
        expect(print).toHaveBeenCalledTimes(1);
        expect(document.documentElement).not.toHaveAttribute('data-sarak-printing');
    });

    it('com elemento, marca o alvo para o papel e limpa depois', () => {
        const element = document.createElement('div');
        print.mockImplementationOnce(() => {
            expect(element).toHaveAttribute('data-sarak-print-target');
            expect(document.documentElement).toHaveAttribute('data-sarak-printing');
        });
        sarakPrint(element);
        expect(print).toHaveBeenCalledTimes(1);
        window.dispatchEvent(new Event('afterprint'));
        expect(element).not.toHaveAttribute('data-sarak-print-target');
        expect(document.documentElement).not.toHaveAttribute('data-sarak-printing');
    });
});
