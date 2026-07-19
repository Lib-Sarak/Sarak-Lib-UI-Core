import { describe, it, expect } from 'vitest';
import { sanitizeIdentifier } from '../identifiers';

describe('sanitizeIdentifier', () => {
    it('aceita identificadores válidos (letras, números, "_", "-")', () => {
        expect(sanitizeIdentifier('ui_core', 'schema')).toBe('ui_core');
        expect(sanitizeIdentifier('MeuSchema', 'schema')).toBe('MeuSchema');
        expect(sanitizeIdentifier('meu_app_', 'tablePrefix')).toBe('meu_app_');
        expect(sanitizeIdentifier('_private-9', 'schema')).toBe('_private-9');
    });

    it('rejeita identificador com tentativa de injection', () => {
        expect(() => sanitizeIdentifier('"a";DROP TABLE users;--', 'schema')).toThrow(/schema/);
        expect(() => sanitizeIdentifier('a"."b', 'schema')).toThrow();
    });

    it('rejeita identificador vazio ou começando por dígito', () => {
        expect(() => sanitizeIdentifier('', 'tablePrefix')).toThrow();
        expect(() => sanitizeIdentifier('9start', 'tablePrefix')).toThrow();
    });

    it('rejeita espaço e ponto', () => {
        expect(() => sanitizeIdentifier('meu schema', 'schema')).toThrow();
        expect(() => sanitizeIdentifier('meu.schema', 'schema')).toThrow();
    });
});
