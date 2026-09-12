import { describe, it, expect, vi, afterEach } from 'vitest';
import { validatePreferences } from '../validatePreferences';

describe('validatePreferences (preferência como dado hostil)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('entrada vazia/inválida devolve objeto vazio, sem lançar', () => {
        expect(validatePreferences(null)).toEqual({});
        expect(validatePreferences(undefined)).toEqual({});
        expect(validatePreferences('string')).toEqual({});
        expect(validatePreferences([1, 2, 3])).toEqual({});
    });

    it('aceita as cinco preferências dentro do domínio fechado', () => {
        const input = { colorMode: 'dark', fontSize: 'lg', navigationStyle: 'topbar', navCollapsed: true, language: 'pt-BR' };
        expect(validatePreferences(input)).toEqual(input);
    });

    it('descarta valor fora do domínio de cada preferência, com UM warn por chamada', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = validatePreferences({ colorMode: 'roxo', fontSize: 'xl', navCollapsed: 'sim' });

        expect(result).toEqual({});
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('colorMode');
        expect(warn.mock.calls[0][0]).toContain('fontSize');
        expect(warn.mock.calls[0][0]).toContain('navCollapsed');
    });

    it('descarta chave desconhecida, mantendo as válidas', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = validatePreferences({ colorMode: 'light', chaveInventada: 'x' });

        expect(result).toEqual({ colorMode: 'light' });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('chaveInventada');
    });

    it('idioma fora do formato de código de locale é descartado', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(validatePreferences({ language: '<script>' })).toEqual({});
    });

    it('nada inválido: nenhum warn é emitido', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        validatePreferences({ colorMode: 'system' });
        expect(warn).not.toHaveBeenCalled();
    });
});
