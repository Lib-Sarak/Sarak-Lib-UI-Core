// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { resolveSchemaId } from '../useInspector';

const montar = (html: string): HTMLElement => {
    const raiz = document.createElement('div');
    raiz.innerHTML = html;
    return raiz.querySelector('[data-alvo]') as HTMLElement;
};

describe('resolveSchemaId', () => {
    it('agrupa pelo marcador exato do cartão', () => {
        expect(resolveSchemaId(montar('<div class="sarak-card"><div data-alvo></div></div>'))).toBe('cards');
    });

    it('não trata utilitária com "card" ou "panel" no nome como componente', () => {
        expect(resolveSchemaId(montar('<div class="card-grid-gap"><div data-alvo></div></div>'))).toBe('shell');
        expect(resolveSchemaId(montar('<div class="side-panel-wrap"><div data-alvo></div></div>'))).toBe('shell');
    });

    it('mantém controles e tipografia', () => {
        expect(resolveSchemaId(montar('<button><i data-alvo></i></button>'))).toBe('controls');
        expect(resolveSchemaId(montar('<p><b data-alvo></b></p>'))).toBe('typography');
    });
});
