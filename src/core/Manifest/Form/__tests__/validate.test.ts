import { describe, it, expect } from 'vitest';
import { validateValue, firstErrorMessage } from '../validate';
import type { ValidationSchema } from '../../types';

describe('Spec 29 — Validador puro (validateValue)', () => {
    it('required: reprova vazio/null/undefined e aprova preenchido', () => {
        const schema: ValidationSchema = [{ rule: 'required', message: 'Obrigatório' }];
        expect(validateValue('', schema)).toEqual([{ rule: 'required', message: 'Obrigatório' }]);
        expect(validateValue('   ', schema)).toHaveLength(1);
        expect(validateValue(null, schema)).toHaveLength(1);
        expect(validateValue(undefined, schema)).toHaveLength(1);
        expect(validateValue('João', schema)).toEqual([]);
    });

    it('minLength/maxLength: respeitam os limites e ignoram vazio (é problema de required)', () => {
        const schema: ValidationSchema = [
            { rule: 'minLength', value: 3 },
            { rule: 'maxLength', value: 5 },
        ];
        expect(validateValue('ab', schema)).toEqual([
            { rule: 'minLength', message: 'Valor muito curto.' },
        ]);
        expect(validateValue('abcdef', schema)).toEqual([
            { rule: 'maxLength', message: 'Valor muito longo.' },
        ]);
        expect(validateValue('abcd', schema)).toEqual([]);
        // Vazio não dispara minLength (cabe ao required).
        expect(validateValue('', schema)).toEqual([]);
    });

    it('pattern: aplica regex customizada do JSON e blinda regex inválida', () => {
        const schema: ValidationSchema = [{ rule: 'pattern', value: '^[0-9]+$', message: 'Só números' }];
        expect(validateValue('abc', schema)).toEqual([{ rule: 'pattern', message: 'Só números' }]);
        expect(validateValue('123', schema)).toEqual([]);
        // Regex inválida não derruba o motor (sem match → sem erro).
        const broken: ValidationSchema = [{ rule: 'pattern', value: '([' }];
        expect(validateValue('qualquer', broken)).toEqual([]);
    });

    it('type: valida email, url e numero', () => {
        expect(validateValue('a@b.com', [{ rule: 'type', value: 'email' }])).toEqual([]);
        expect(validateValue('a@b', [{ rule: 'type', value: 'email' }])).toHaveLength(1);
        expect(validateValue('https://sarak.dev', [{ rule: 'type', value: 'url' }])).toEqual([]);
        expect(validateValue('not-url', [{ rule: 'type', value: 'url' }])).toHaveLength(1);
        expect(validateValue('-12.5', [{ rule: 'type', value: 'numero' }])).toEqual([]);
        expect(validateValue('12x', [{ rule: 'type', value: 'numero' }])).toHaveLength(1);
    });

    it('acumula múltiplos erros na ordem das regras e respeita mensagem custom (Regra 4)', () => {
        const schema: ValidationSchema = [
            { rule: 'required', message: 'A senha não pode estar vazia' },
            { rule: 'minLength', value: 8 },
        ];
        expect(firstErrorMessage('', schema)).toBe('A senha não pode estar vazia');
        expect(validateValue('123', schema).map((e) => e.rule)).toEqual(['minLength']);
    });

    it('schema vazio/ausente nunca acusa erro', () => {
        expect(validateValue('x', undefined)).toEqual([]);
        expect(validateValue('x', [])).toEqual([]);
    });
});
