import { describe, expect, it } from 'vitest';
import { formatMaskedValue, getMaskedCursorPosition } from '../mask';

describe('formatMaskedValue', () => {
    it('aplica o preset CPF durante a digitação e retorna somente os dígitos', () => {
        expect(formatMaskedValue('123', 'cpf')).toEqual({ value: '123.', cleanValue: '123' });
    });

    it('formata CPF completo e descarta dígitos além do padrão', () => {
        expect(formatMaskedValue('123456789001', 'cpf')).toEqual({
            value: '123.456.789-00',
            cleanValue: '12345678900',
        });
    });

    it('aplica o preset CNPJ', () => {
        expect(formatMaskedValue('11222333000181', 'cnpj').value).toBe('11.222.333/0001-81');
    });

    it('normaliza CNPJ alfanumérico para maiúsculas e mantém DV numérico', () => {
        expect(formatMaskedValue('12abc34501de35', 'cnpj')).toEqual({
            value: '12.ABC.345/01DE-35',
            cleanValue: '12ABC34501DE35',
        });
    });

    it('aplica o preset de CEP', () => {
        expect(formatMaskedValue('12345678', 'cep')).toEqual({ value: '12345-678', cleanValue: '12345678' });
    });

    it('escolhe o formato telefônico brasileiro conforme a quantidade de dígitos', () => {
        expect(formatMaskedValue('1134567890', 'phone').value).toBe('(11) 3456-7890');
        expect(formatMaskedValue('11987654321', 'phone').value).toBe('(11) 98765-4321');
    });

    it('aceita padrão personalizado e exibe os dígitos sem máscara se não houver posição 0', () => {
        expect(formatMaskedValue('12345', '000-00').value).toBe('123-45');
        expect(formatMaskedValue('12-3', 'sem-placeholder').value).toBe('123');
    });
});

describe('getMaskedCursorPosition', () => {
    it('mantém o cursor após o separador inserido pela máscara', () => {
        expect(getMaskedCursorPosition('123.4', 3)).toBe(4);
    });

    it('mantém o cursor após caracteres alfanuméricos do CNPJ', () => {
        expect(getMaskedCursorPosition('12.ABC.345/01DE-35', 5, true)).toBe(7);
    });
});
