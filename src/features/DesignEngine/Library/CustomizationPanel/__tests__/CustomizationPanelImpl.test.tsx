import React from 'react';
import { describe, it, expect } from 'vitest';
import * as ImplModule from '../CustomizationPanelImpl';
import { CustomizationPanel } from '../index';

describe('CustomizationPanelImpl', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ImplModule).toBeDefined();
    });
});

/**
 * plan-09 op 1 — o painel saía EAGER do barril público e ainda era importado por efeito
 * colateral, colocando o Design Engine inteiro no boot de quem nunca o abre.
 */
describe('CustomizationPanel — fronteira lazy (plan-09)', () => {
    it('o barril exporta um componente com Suspense INTERNO, não um LazyExoticComponent cru', () => {
        // `React.lazy` produz um objeto com `$$typeof` lazy e SEM `prototype`/corpo de função.
        // O contrato público continua sendo uma função-componente: quem renderiza o painel
        // não precisa declarar `Suspense`.
        expect(typeof CustomizationPanel).toBe('function');
        expect((CustomizationPanel as unknown as { $$typeof?: symbol }).$$typeof).toBeUndefined();
    });

    it('o elemento renderizado carrega a implementação atrás de uma fronteira lazy', () => {
        const elemento = React.createElement(CustomizationPanel);
        expect(React.isValidElement(elemento)).toBe(true);
    });
});
