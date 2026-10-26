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

/** Chave companheira da identidade do tema aplicado, sem alterar o payload legado de design. */
export const resolveActiveThemeStorageKey = (storageKey: string): string => `${storageKey}::active-theme-id`;

export const readCachedActiveThemeId = (storageKey: string): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
        return window.localStorage.getItem(resolveActiveThemeStorageKey(storageKey)) || undefined;
    } catch (error) {
        console.error('[Sarak:Design] localStorage theme id load error:', error);
        return undefined;
    }
};

export const writeCachedActiveThemeId = (storageKey: string, activeThemeId?: string): void => {
    if (typeof window === 'undefined') return;
    const themeIdKey = resolveActiveThemeStorageKey(storageKey);
    if (activeThemeId) window.localStorage.setItem(themeIdKey, activeThemeId);
    else window.localStorage.removeItem(themeIdKey);
};
