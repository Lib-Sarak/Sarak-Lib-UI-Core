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

/** Chave companheira do registro de escolhas (o design gravado no formato de escolhas), ao lado do design completo. */
export const resolveDesignChoicesStorageKey = (storageKey: string): string => `${storageKey}::choices`;

/** O registro de escolhas do cache local, preso ao design completo que ele acompanha. */
export interface CachedDesignChoices {
    format: number;
    design: Record<string, unknown>;
    /** A assinatura do design completo gravado junto: outra aba com lib anterior regrava o completo e não toca nesta chave. */
    of: string;
}

/** Assinatura curta (djb2) do texto gravado na chave do design completo. */
export const signCachedDesign = (serialized: string): string => {
    let hash = 5381;
    for (let index = 0; index < serialized.length; index += 1) hash = ((hash * 33) ^ serialized.charCodeAt(index)) >>> 0;
    return hash.toString(36);
};

const isCachedDesignChoices = (value: unknown): value is CachedDesignChoices => {
    const record = value as CachedDesignChoices | null;
    return Boolean(record && typeof record === 'object' && typeof record.format === 'number' && typeof record.of === 'string'
        && record.design && typeof record.design === 'object' && !Array.isArray(record.design));
};

/** As escolhas guardadas junto do design completo `serialized`; `undefined` se não há registro ou ele é de outra gravação. */
export const readCachedDesignChoices = (storageKey: string, serialized: string): CachedDesignChoices | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
        const raw = window.localStorage.getItem(resolveDesignChoicesStorageKey(storageKey));
        const parsed: unknown = raw ? JSON.parse(raw) : undefined;
        return isCachedDesignChoices(parsed) && parsed.of === signCachedDesign(serialized) ? parsed : undefined;
    } catch (error) {
        console.error('[Sarak:Design] localStorage choices load error:', error);
        return undefined;
    }
};

/** Grava o design completo e, quando há, o registro de escolhas preso a ele; sem escolhas, o registro sai. */
export const writeCachedDesign = (storageKey: string, design: unknown, choices?: { format: number; design: Record<string, unknown> }): void => {
    if (typeof window === 'undefined') return;
    const serialized = JSON.stringify(design);
    window.localStorage.setItem(storageKey, serialized);
    const choicesKey = resolveDesignChoicesStorageKey(storageKey);
    if (choices) window.localStorage.setItem(choicesKey, JSON.stringify({ ...choices, of: signCachedDesign(serialized) }));
    else window.localStorage.removeItem(choicesKey);
};
