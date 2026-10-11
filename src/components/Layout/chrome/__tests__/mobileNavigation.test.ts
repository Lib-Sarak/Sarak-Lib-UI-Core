import { describe, it, expect } from 'vitest';
import {
    BOTTOM_NAV_MAX_ITEMS,
    resolveMobileNavigationMode,
    resolveMobileNavigationStyle,
} from '../mobileNavigation';

// Prova a REGRA de escolha (função pura). Que a barra aparece na tela, e onde, é do
// `browser-tests/` — o jsdom não tem motor de layout.
describe('resolveMobileNavigationMode — onde a navegação mora no celular', () => {
    it('auto: barra na base com 3 itens e com exatamente o teto', () => {
        expect(resolveMobileNavigationMode('auto', 3)).toBe('bottom');
        expect(resolveMobileNavigationMode('auto', BOTTOM_NAV_MAX_ITEMS)).toBe('bottom');
    });

    it('auto: gaveta com 7 itens e com um a mais que o teto', () => {
        expect(resolveMobileNavigationMode('auto', 7)).toBe('drawer');
        expect(resolveMobileNavigationMode('auto', BOTTOM_NAV_MAX_ITEMS + 1)).toBe('drawer');
    });

    it('o teto é de 5 destinos', () => {
        expect(BOTTOM_NAV_MAX_ITEMS).toBe(5);
    });

    it('bottom força a barra mesmo acima do teto; drawer força a gaveta mesmo com poucos itens', () => {
        expect(resolveMobileNavigationMode('bottom', 9)).toBe('bottom');
        expect(resolveMobileNavigationMode('drawer', 2)).toBe('drawer');
    });

    it('sem destino nenhum não há barra, nem forçada', () => {
        expect(resolveMobileNavigationMode('auto', 0)).toBe('drawer');
        expect(resolveMobileNavigationMode('bottom', 0)).toBe('drawer');
    });
});

describe('resolveMobileNavigationStyle — leitura tolerante do token', () => {
    it('aceita os três valores do schema', () => {
        expect(resolveMobileNavigationStyle('auto')).toBe('auto');
        expect(resolveMobileNavigationStyle('bottom')).toBe('bottom');
        expect(resolveMobileNavigationStyle('drawer')).toBe('drawer');
    });

    it('ausente ou fora da lista cai em auto', () => {
        expect(resolveMobileNavigationStyle(undefined)).toBe('auto');
        expect(resolveMobileNavigationStyle('dock')).toBe('auto');
        expect(resolveMobileNavigationStyle(3)).toBe('auto');
    });
});
