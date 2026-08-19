// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { resolveResponsiveValue, isResponsiveValue } from '../resolveResponsiveValue';

describe('resolveResponsiveValue (Spec 40.3 — L2)', () => {
    it('deixa um valor escalar passar direto em qualquer dispositivo', () => {
        expect(resolveResponsiveValue('1fr 1fr', 'smartphone')).toBe('1fr 1fr');
        expect(resolveResponsiveValue(240, 'desktop')).toBe(240);
    });

    it('seleciona a camada do dispositivo ativo num ResponsiveValue (cascata mob/tab/desk)', () => {
        const rv = { mob: '1fr', tab: '1fr 1fr', desk: '1fr 1fr 1fr' };
        expect(resolveResponsiveValue(rv, 'smartphone')).toBe('1fr');
        expect(resolveResponsiveValue(rv, 'tablet')).toBe('1fr 1fr');
        expect(resolveResponsiveValue(rv, 'desktop')).toBe('1fr 1fr 1fr');
    });

    it('isResponsiveValue só é verdadeiro com as TRÊS camadas (não confunde objeto qualquer)', () => {
        expect(isResponsiveValue({ mob: 1, tab: 2, desk: 3 })).toBe(true);
        expect(isResponsiveValue({ mob: 1, tab: 2 })).toBe(false);
        expect(isResponsiveValue('1fr')).toBe(false);
        expect(isResponsiveValue(null)).toBe(false);
    });
});
