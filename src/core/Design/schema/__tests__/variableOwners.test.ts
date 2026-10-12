import { describe, it, expect } from 'vitest';
import { sarakGetAllDesignTokens } from '../../master-map';

const ownersOf = (variable: string): string[] =>
    sarakGetAllDesignTokens()
        .filter((token) => (token.cssVars ?? []).includes(variable))
        .map((token) => token.id);

describe('uma variável tem um dono só', () => {
    it('--sarak-glass-blur é do glassBlur; o desfoque do cartão é --sarak-card-backdrop-blur', () => {
        expect(ownersOf('--sarak-glass-blur')).toEqual(['glassBlur']);
        expect(ownersOf('--sarak-card-backdrop-blur')).toEqual(['cardBackdropBlur']);
    });

    it('o alias --sarak-card-blur não é mais emitido por nenhum token', () => {
        expect(ownersOf('--sarak-card-blur')).toEqual([]);
    });
});
