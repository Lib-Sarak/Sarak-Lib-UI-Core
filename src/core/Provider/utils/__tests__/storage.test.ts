import { describe, it, expect, beforeEach } from 'vitest';
import { clearSarakStorage } from '../storage';
import { DEFAULT_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from '../../constants';

describe('clearSarakStorage (plan-08 F1 — a lib não apaga dado do host)', () => {
    beforeEach(() => localStorage.clear());

    it('CRITÉRIO: a chave alheia SOBREVIVE ao reset', () => {
        localStorage.setItem('token-de-sessao-do-host', 'abc123');
        localStorage.setItem('carrinho', '[{"id":1}]');
        localStorage.setItem(DEFAULT_STORAGE_KEY, '{"mode":"light"}');

        clearSarakStorage();

        expect(localStorage.getItem('token-de-sessao-do-host')).toBe('abc123');
        expect(localStorage.getItem('carrinho')).toBe('[{"id":1}]');
        expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull();
    });

    it('remove as chaves fixas da lib (design padrão e idioma)', () => {
        localStorage.setItem(DEFAULT_STORAGE_KEY, '{}');
        localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

        expect(clearSarakStorage().sort()).toEqual([DEFAULT_STORAGE_KEY, LANGUAGE_STORAGE_KEY].sort());
        expect(localStorage.length).toBe(0);
    });

    it('remove também a storageKey customizada do Provider', () => {
        localStorage.setItem('erp-earendel-design', '{}');
        localStorage.setItem('erp-earendel-sessao', 'nao-me-apague');

        expect(clearSarakStorage('erp-earendel-design')).toEqual(['erp-earendel-design']);
        expect(localStorage.getItem('erp-earendel-sessao')).toBe('nao-me-apague');
    });

    it('só reporta as chaves que existiam', () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt');
        expect(clearSarakStorage('nunca-gravada')).toEqual([LANGUAGE_STORAGE_KEY]);
    });
});
