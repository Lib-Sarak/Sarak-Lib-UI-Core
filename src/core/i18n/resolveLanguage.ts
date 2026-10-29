import type { SarakI18nLanguage, SarakI18nOptions } from './types';

export const DEFAULT_SARAK_LANGUAGE = 'pt';
const DEFAULT_SARAK_LOCALE = 'pt-BR';

interface LanguageSources {
    i18n?: SarakI18nOptions;
    preferenceLanguage?: string;
    designLanguage?: string;
}

/** Parte primária de um código BCP-47: `pt-BR` → `pt`. */
export const primaryLanguage = (code: string): string => code.split(/[-_]/)[0].toLowerCase();

/**
 * Resolução ÚNICA do idioma: `i18n.language` (controlado) > preferência gravada > `design.language` > `pt`.
 * Sem `options.i18n` a fonte é só o design efetivo (que já embute a preferência oferecida pelo tema).
 */
export const resolveSarakLanguage = ({ i18n, preferenceLanguage, designLanguage }: LanguageSources): string =>
    i18n?.language || (i18n ? preferenceLanguage : undefined) || designLanguage || DEFAULT_SARAK_LANGUAGE;

/** Código BCP-47 para o `Intl`: `pt` sem região vira `pt-BR`; código inválido cai em `pt-BR`. */
export const toIntlLocale = (code: string): string => {
    const normalized = code.replace('_', '-');
    const candidate = normalized.toLowerCase() === 'pt' ? DEFAULT_SARAK_LOCALE : normalized;
    try {
        return Intl.getCanonicalLocales(candidate)[0] ?? DEFAULT_SARAK_LOCALE;
    } catch {
        return DEFAULT_SARAK_LOCALE;
    }
};

export const languageCode = (entry: SarakI18nLanguage): string => (typeof entry === 'string' ? entry : entry.code);
