import { useSyncExternalStore } from 'react';
import { primaryLanguage } from './resolveLanguage';
import { useSarakLanguage } from './useSarakLanguage';
import { LANGUAGES } from './languages';
import { isLazyCatalogLoaded, lazyCatalogEntry, loadLazyCatalogs, subscribeLazyCatalogs } from './lazyCatalogs';
import { LIBRARY_TEXT_CATALOG, LIBRARY_TEXT_FALLBACK_LANGUAGE, type LibraryTextKey, type SarakLibraryLanguage } from './catalog';

const SUPPORTED_LANGUAGES: ReadonlySet<string> = new Set(LANGUAGES.map((lang) => lang.id));

/** R34: sem Provider, ou idioma fora dos seis oferecidos, cai no português — a base da lib. */
export const resolveLibraryLanguage = (language: unknown): SarakLibraryLanguage => {
    const primary = typeof language === 'string' ? primaryLanguage(language) : '';
    return SUPPORTED_LANGUAGES.has(primary) ? (primary as SarakLibraryLanguage) : LIBRARY_TEXT_FALLBACK_LANGUAGE;
};

const interpolate = (template: string, vars?: Record<string, string | number>): string => {
    if (!vars) return template;
    return Object.entries(vars).reduce(
        (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
        template,
    );
};

/** Com `count` igual a 1, a chave `<nome>One` (se existir) é a forma singular; sem ela, vale a própria chave. */
export const pluralKey = (key: LibraryTextKey, vars?: Record<string, string | number>): LibraryTextKey => {
    const singular = `${key}One`;
    return Number(vars?.count) === 1 && (singular in LIBRARY_TEXT_CATALOG || lazyCatalogEntry(singular) !== undefined)
        ? (singular as LibraryTextKey)
        : key;
};

/** O texto da chave: do boot, ou do catálogo de peça opcional — que pede a carga e só devolve quando ela chegou. */
const entryOf = (key: LibraryTextKey): Record<SarakLibraryLanguage, string> | undefined => {
    const eager = LIBRARY_TEXT_CATALOG[key];
    if (eager) return eager;
    void loadLazyCatalogs();
    return lazyCatalogEntry(key);
};

export type LibraryTextFn =(key: LibraryTextKey, vars?: Record<string, string | number>) => string;

/** O idioma do CATÁLOGO de textos (um dos seis) que vale agora — a mesma resolução do `useSarakLanguage`; não serve a `Intl`. */
export const useLibraryLanguage = (): SarakLibraryLanguage => resolveLibraryLanguage(useSarakLanguage().language);

/**
 * Lê o texto da PRÓPRIA lib no idioma que vale (`useSarakLanguage()`, specs/09 §4.7). Nunca
 * lança (R34, "átomo renderiza sem Provider"): sem Provider, ou idioma fora dos seis, o texto
 * sai em português (specs/10 §3.6). Serve só aos textos do catálogo — número e data usam o
 * `locale` do `useSarakLanguage`, não este idioma.
 */
export const useLibraryText = (): LibraryTextFn => {
    const language = useLibraryLanguage();
    // Reage à chegada do catálogo da peça: o primeiro quadro sai com texto vazio (nunca a chave crua) e o seguinte, com o texto.
    useSyncExternalStore(subscribeLazyCatalogs, isLazyCatalogLoaded, isLazyCatalogLoaded);

    return (key, vars) => interpolate(entryOf(pluralKey(key, vars))?.[language] ?? '', vars);
};
