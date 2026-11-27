import type { SarakLibraryLanguage } from './catalog.types';
import type { LAZY_CATALOG } from './lazyCatalogs.data';

/** As chaves e as entradas dos catálogos das peças opcionais — só tipo: nada daqui entra no boot. */
export type LazyCatalogEntries = typeof LAZY_CATALOG;
type LazyEntry = Record<SarakLibraryLanguage, string>;

let loaded: Readonly<Record<string, LazyEntry>> | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

/**
 * Começa a carga dos catálogos das peças opcionais (uma vez; chamadas repetidas dividem a mesma
 * promessa). Quem pede é a peça, ao ler o primeiro texto dela — o boot do consumidor não paga
 * por catálogo de peça que ele não usa. Falha de rede libera uma nova tentativa na próxima chamada.
 */
export const loadLazyCatalogs = (): Promise<void> => {
    if (loaded) return Promise.resolve();
    pending ??= import('./lazyCatalogs.data')
        .then((module) => {
            loaded = module.LAZY_CATALOG;
            listeners.forEach((listener) => listener());
        })
        .catch(() => {
            pending = null;
        });
    return pending;
};

export const isLazyCatalogLoaded = (): boolean => loaded !== null;

/** `undefined` enquanto o catálogo não chegou (ou se a chave não existe nele). */
export const lazyCatalogEntry = (key: string): LazyEntry | undefined => loaded?.[key];

export const subscribeLazyCatalogs = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};

/** Só para teste: volta ao estado de "não carregado". */
export const resetLazyCatalogsForTest = (): void => {
    loaded = null;
    pending = null;
};
