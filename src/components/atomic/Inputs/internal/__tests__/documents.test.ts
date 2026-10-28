import { describe, expect, it } from 'vitest';
import { sarakFormatDocument, sarakIsValidCpf, sarakIsValidCnpj } from '../documents';

describe('validação de documentos brasileiros', () => {
    it('valida CPF e rejeita dígito incorreto e sequências repetidas', () => {
        expect(sarakIsValidCpf('529.982.247-25')).toBe(true);
        expect(sarakIsValidCpf('529.982.247-24')).toBe(false);
        expect(sarakIsValidCpf('111.111.111-11')).toBe(false);
        expect(sarakIsValidCpf('529ABC98224725')).toBe(false);
    });

    it('valida CNPJ numérico e alfanumérico, rejeitando dígito incorreto', () => {
        expect(sarakIsValidCnpj('04.252.011/0001-10')).toBe(true);
        expect(sarakIsValidCnpj('04.252.011/0001-11')).toBe(false);
        expect(sarakIsValidCnpj('04.252.011/0001-10EXTRA')).toBe(false);
        // Exemplo de cálculo publicado pela Receita Federal: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
        expect(sarakIsValidCnpj('12.ABC.345/01DE-35')).toBe(true);
    });

    it('formata CPF, CNPJ alfanumérico e CEP em formato explícito ou automático', () => {
        expect(sarakFormatDocument('52998224725', 'cpf')).toBe('529.982.247-25');
        expect(sarakFormatDocument('12abc34501de35', 'cnpj')).toBe('12.ABC.345/01DE-35');
        expect(sarakFormatDocument('12345678')).toBe('12345-678');
        expect(sarakFormatDocument('52998224725')).toBe('529.982.247-25');
    });
});
