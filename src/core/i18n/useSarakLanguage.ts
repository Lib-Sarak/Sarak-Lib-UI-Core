import { useCallback } from 'react';
import { useSarakUIOptional } from '../Provider/SarakUIProvider';
import { languageCode, resolveSarakLanguage, toIntlLocale } from './resolveLanguage';

export interface SarakLanguageState {
    /** O código do sistema (`pt-BR`). */
    language: string;
    /** BCP-47 usado na formatação (`pt` sem região → `pt-BR`). */
    locale: string;
    languages: string[];
    /** Mesmo caminho do seletor: avisa `onLanguageChange` e, sem idioma controlado, grava a preferência. */
    setLanguage: (code: string) => void;
}

/**
 * O idioma que vale na tela — fonte única dos textos da lib, da formatação e do seletor.
 * Nunca lança: sem Provider, devolve português e `setLanguage` não faz nada (R34).
 */
export const useSarakLanguage = (): SarakLanguageState => {
    const sarak = useSarakUIOptional();
    const i18n = sarak?.options?.i18n;
    const updatePreferences = sarak?.updatePreferences;
    const language = resolveSarakLanguage({
        i18n,
        preferenceLanguage: sarak?.preferences?.language,
        designLanguage: sarak?.design?.language,
    });
    const languages = (i18n?.languages ?? sarak?.design?.enabledLanguages ?? []).map(languageCode);
    const onLanguageChange = i18n?.onLanguageChange;
    const controlled = Boolean(i18n?.language);

    const setLanguage = useCallback((code: string) => {
        if (!controlled) updatePreferences?.({ language: code });
        onLanguageChange?.(code);
    }, [controlled, updatePreferences, onLanguageChange]);

    return { language, locale: toIntlLocale(language), languages, setLanguage };
};
