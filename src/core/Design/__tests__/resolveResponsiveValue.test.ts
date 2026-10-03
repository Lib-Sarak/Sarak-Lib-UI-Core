// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sarakResolveResponsiveValue, sarakIsResponsiveValue } from '../resolveResponsiveValue';

describe('resolveResponsiveValue (Spec 40.3 — L2)', () => {
    it('deixa um valor escalar passar direto em qualquer dispositivo', () => {
        expect(sarakResolveResponsiveValue('1fr 1fr', 'smartphone')).toBe('1fr 1fr');
        expect(sarakResolveResponsiveValue(240, 'desktop')).toBe(240);
    });

    it('seleciona a camada do dispositivo ativo num ResponsiveValue (cascata mob/tab/desk)', () => {
        const rv = { mob: '1fr', tab: '1fr 1fr', desk: '1fr 1fr 1fr' };
        expect(sarakResolveResponsiveValue(rv, 'smartphone')).toBe('1fr');
        expect(sarakResolveResponsiveValue(rv, 'tablet')).toBe('1fr 1fr');
        expect(sarakResolveResponsiveValue(rv, 'desktop')).toBe('1fr 1fr 1fr');
    });

    it('isResponsiveValue só é verdadeiro com as TRÊS camadas (não confunde objeto qualquer)', () => {
        expect(sarakIsResponsiveValue({ mob: 1, tab: 2, desk: 3 })).toBe(true);
        expect(sarakIsResponsiveValue({ mob: 1, tab: 2 })).toBe(false);
        expect(sarakIsResponsiveValue('1fr')).toBe(false);
        expect(sarakIsResponsiveValue(null)).toBe(false);
    });
});
