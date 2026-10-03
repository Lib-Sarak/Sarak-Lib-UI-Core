import { useSarakUIOptional } from '../Provider/SarakUIProvider';
import { LANGUAGES } from '../Discovery/constants';
import { LIBRARY_TEXT_CATALOG, LIBRARY_TEXT_FALLBACK_LANGUAGE, type LibraryTextKey, type SarakLibraryLanguage } from './catalog';

const SUPPORTED_LANGUAGES: ReadonlySet<string> = new Set(LANGUAGES.map((lang) => lang.id));

/** R34: sem Provider, ou idioma fora dos seis oferecidos, cai no português — a base da lib. */
export const resolveLibraryLanguage = (language: unknown): SarakLibraryLanguage =>
    typeof language === 'string' && SUPPORTED_LANGUAGES.has(language)
        ? (language as SarakLibraryLanguage)
        : LIBRARY_TEXT_FALLBACK_LANGUAGE;

const interpolate = (template: string, vars?: Record<string, string | number>): string => {
    if (!vars) return template;
    return Object.entries(vars).reduce(
        (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
        template,
    );
};

export type LibraryTextFn = (key: LibraryTextKey, vars?: Record<string, string | number>) => string;

/**
 * Lê o texto da PRÓPRIA lib no idioma que vale (`useSarakUI().design.language`,
 * specs/09 §4.7). Nunca lança — usa `useSarakUIOptional` (R34, "átomo renderiza
 * sem Provider"): sem Provider, ou idioma fora dos seis, o texto sai em português
 * (specs/10 §3.6, "os textos da própria lib seguem o idioma que vale").
 */
export const useLibraryText = (): LibraryTextFn => {
    const sarak = useSarakUIOptional();
    const language = resolveLibraryLanguage(sarak?.design?.language);

    return (key, vars) => interpolate(LIBRARY_TEXT_CATALOG[key][language], vars);
};
