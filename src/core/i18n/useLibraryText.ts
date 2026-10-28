import { primaryLanguage } from './resolveLanguage';
import { useSarakLanguage } from './useSarakLanguage';
import { LANGUAGES } from './languages';
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

export type LibraryTextFn = (key: LibraryTextKey, vars?: Record<string, string | number>) => string;

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

    return (key, vars) => interpolate(LIBRARY_TEXT_CATALOG[key][language], vars);
};
