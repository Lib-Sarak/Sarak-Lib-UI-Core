import { describe, it, expect } from 'vitest';
import { resolveStorageKey } from '../resolveStorageKey';
import { DEFAULT_STORAGE_KEY } from '../../constants';

describe('resolveStorageKey (ADR-009 §2.1 — chave composta por tenant)', () => {
    it('sem `persistence`, devolve a chave default da lib', () => {
        expect(resolveStorageKey(undefined)).toBe(DEFAULT_STORAGE_KEY);
    });

    it('sem `tenantId`, devolve o `storageKey` cru — comportamento de hoje', () => {
        expect(resolveStorageKey({ storageKey: 'erp-earendel-design' })).toBe('erp-earendel-design');
    });

    it('com `tenantId`, compõe `storageKey::tenant:tenantId`', () => {
        expect(resolveStorageKey({ storageKey: 'erp-earendel-design', tenantId: 'acme' })).toBe(
            'erp-earendel-design::tenant:acme',
        );
    });

    it('com `tenantId` e sem `storageKey`, compõe sobre a chave default', () => {
        expect(resolveStorageKey({ tenantId: 'acme' })).toBe(`${DEFAULT_STORAGE_KEY}::tenant:acme`);
    });

    it('dois tenants diferentes, mesma `storageKey`, produzem chaves distintas', () => {
        const base = { storageKey: 'shared-key' };
        const keyA = resolveStorageKey({ ...base, tenantId: 'tenant-a' });
        const keyB = resolveStorageKey({ ...base, tenantId: 'tenant-b' });
        expect(keyA).not.toBe(keyB);
    });

    it('`tenantId` vazio é tratado como ausente', () => {
        expect(resolveStorageKey({ storageKey: 'x', tenantId: '' })).toBe('x');
    });
});
