import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    readPersisted,
    writePersisted,
    removePersisted,
    namespacedKey,
    STORAGE_NAMESPACE,
} from '../safeStorage';

describe('Spec 28 — safeStorage (acesso guardado e namespaced)', () => {
    beforeEach(() => window.localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it('grava/lê primitivos (boolean, string, number) aplicando o prefixo @sarak: (Regra 3)', () => {
        writePersisted('flag', true);
        writePersisted('nome', 'Ana');
        writePersisted('qtd', 42);

        expect(readPersisted('flag')).toBe(true);
        expect(readPersisted('nome')).toBe('Ana');
        expect(readPersisted('qtd')).toBe(42);

        // A chave física carrega o namespace; sem prefixo não existe.
        expect(window.localStorage.getItem(namespacedKey('flag'))).toBe('true');
        expect(namespacedKey('flag')).toBe(`${STORAGE_NAMESPACE}flag`);
        expect(window.localStorage.getItem('flag')).toBeNull();
    });

    it('sensitive: ofusca em base64 no storage e desofusca na leitura (Regra 4)', () => {
        writePersisted('token', 'segredo', true);
        const raw = window.localStorage.getItem(namespacedKey('token'));

        expect(raw).not.toBeNull();
        expect(raw).not.toContain('segredo'); // não fica em claro
        expect(readPersisted('token', true)).toBe('segredo');
    });

    it('valor ausente devolve undefined; remove apaga a chave', () => {
        expect(readPersisted('inexistente')).toBeUndefined();
        writePersisted('x', 1);
        removePersisted('x');
        expect(readPersisted('x')).toBeUndefined();
    });

    it('storage bloqueado (modo anônimo): degrada para no-op sem lançar', () => {
        const setSpy = vi
            .spyOn(Storage.prototype, 'setItem')
            .mockImplementation(() => {
                throw new Error('storage bloqueado');
            });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        expect(() => writePersisted('k', 'v')).not.toThrow();
        expect(setSpy).toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
    });
});
