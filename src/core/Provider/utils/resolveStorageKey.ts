import { DEFAULT_STORAGE_KEY } from '../constants';
import type { SarakUIOptions } from '../types';

/**
 * A chave efetiva de persistência (ADR-009 §2.1): `storageKey` cru, ou
 * `` `${storageKey}::tenant:${tenantId}` `` quando `persistence.tenantId` está
 * presente. Fonte única — todo ponto de leitura/escrita de `localStorage` e o
 * filtro de `crossTabSync` consomem esta função, nunca compõem a chave por
 * conta própria.
 */
export const resolveStorageKey = (persistence?: SarakUIOptions['persistence']): string => {
    const base = persistence?.storageKey || DEFAULT_STORAGE_KEY;
    const tenantId = persistence?.tenantId;
    return tenantId ? `${base}::tenant:${tenantId}` : base;
};
