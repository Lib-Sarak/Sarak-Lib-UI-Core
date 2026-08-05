import { DEFAULT_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from '../constants';

/**
 * As chaves de `localStorage` que a lib grava na origem do host, além da
 * `persistence.storageKey` configurada pelo consumidor (que entra em runtime).
 *
 * Fonte única do "o que é nosso": quem passar a persistir algo novo acrescenta
 * a chave aqui, senão o reset de fábrica deixa resíduo.
 */
const OWNED_STORAGE_KEYS: readonly string[] = [DEFAULT_STORAGE_KEY, LANGUAGE_STORAGE_KEY];

/**
 * Apaga **só o que a lib gravou** — nunca `localStorage.clear()`.
 *
 * A origem do `localStorage` é do host: token de sessão, preferências e carrinho
 * moram nela. Limpar a origem inteira para "restaurar o tema" destrói dado de
 * terceiro; por isso o reset de fábrica remove chave a chave.
 *
 * @param storageKey Chave de persistência ativa do Provider (`persistence.storageKey`).
 *                   Omitida, só as chaves fixas são removidas.
 * @returns As chaves que existiam e foram removidas (vazio em ambiente sem `localStorage`).
 */
export const clearSarakStorage = (storageKey?: string): string[] => {
    if (typeof localStorage === 'undefined') return [];

    const candidates = new Set<string>(OWNED_STORAGE_KEYS);
    if (storageKey) candidates.add(storageKey);

    const removed = [...candidates].filter((key) => localStorage.getItem(key) !== null);
    removed.forEach((key) => localStorage.removeItem(key));
    return removed;
};
