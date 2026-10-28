import { describe, expect, it } from 'vitest';
import {
    countDigitsBeforeCursor,
    countMaskCharactersBeforeCursor,
    findCursorAfterDigits,
    findCursorAfterMaskCharacters,
} from '../inputCaret';

describe('inputCaret', () => {
    it('conta apenas dígitos antes da posição atual do cursor', () => {
        expect(countDigitsBeforeCursor('R$ 1.234,56', 9)).toBe(4);
    });

    it('reposiciona o cursor depois dos separadores entre os mesmos dígitos', () => {
        expect(findCursorAfterDigits('123.456', 3)).toBe(4);
    });

    it('posiciona o cursor depois de separadores finais de um grupo completo', () => {
        expect(findCursorAfterDigits('123.', 3)).toBe(4);
    });

    it('mantém o cursor junto ao primeiro dígito quando nenhum dígito veio antes', () => {
        expect(findCursorAfterDigits('R$ 12,00', 0)).toBe(3);
    });

    it('conta letras e dígitos do CNPJ no cursor, sem mudar a contagem de campos numéricos', () => {
        expect(countMaskCharactersBeforeCursor('12.AB', 5, true)).toBe(4);
        expect(countMaskCharactersBeforeCursor('12.AB', 5)).toBe(2);
    });

    it('reposiciona o cursor depois de letras e pontuação da máscara de CNPJ', () => {
        expect(findCursorAfterMaskCharacters('12.ABC.345/01DE-35', 5, true)).toBe(7);
    });
});
