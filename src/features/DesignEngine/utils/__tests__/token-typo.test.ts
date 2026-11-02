import { describe, it, expect } from 'vitest';
import { closestWord, correctTerms } from '../token-typo';

const vocabulary = new Set(['sombra', 'tipografia', 'tooltip']);

describe('token-typo', () => {
    it('acha a palavra mais próxima dentro da tolerância', () => {
        expect(closestWord('sombrra', vocabulary, 1)).toBe('sombra');
        expect(closestWord('tipografa', vocabulary, 1)).toBe('tipografia');
    });

    it('palavra longa ganha um erro a mais', () => {
        expect(closestWord('tipografiaa', vocabulary, 0)).toBe('tipografia');
    });

    it('palavra curta, conhecida ou distante não é trocada', () => {
        expect(closestWord('som', vocabulary, 2)).toBeNull();
        expect(closestWord('sombra', vocabulary, 1)).toBeNull();
        expect(closestWord('xyzqwk', vocabulary, 1)).toBeNull();
    });

    it('correctTerms devolve null quando nada mudou', () => {
        expect(correctTerms(['sombra'], vocabulary, 1)).toBeNull();
        expect(correctTerms(['cor', 'sombrra'], vocabulary, 1)).toEqual(['cor', 'sombra']);
    });
});
