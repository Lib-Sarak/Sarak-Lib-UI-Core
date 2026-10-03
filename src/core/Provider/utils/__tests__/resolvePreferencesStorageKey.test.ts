import { describe, it, expect } from 'vitest';
import { resolvePreferencesStorageKey } from '../resolvePreferencesStorageKey';
import type { SarakUIOptions } from '../../types';

describe('resolvePreferencesStorageKey', () => {
    it('sem configuração, usa a chave default — DIFERENTE da chave do tema', () => {
        const key = resolvePreferencesStorageKey(undefined);
        expect(key).toBe('sarak-ui-preferences-v1');
    });

    it('respeita `options.preferences.storageKey` quando informado', () => {
        const options: SarakUIOptions = { preferences: { storageKey: 'minha-chave' } };
        expect(resolvePreferencesStorageKey(options)).toBe('minha-chave');
    });

    it('compõe com o MESMO tenant do tema (`persistence.tenantId`)', () => {
        const options: SarakUIOptions = { persistence: { tenantId: 'acme' } };
        expect(resolvePreferencesStorageKey(options)).toBe('sarak-ui-preferences-v1::tenant:acme');
    });
});
