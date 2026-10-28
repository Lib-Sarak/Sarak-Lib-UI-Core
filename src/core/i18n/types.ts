/** Idioma do sistema importador: código BCP-47, com rótulo opcional para o seletor. */
export type SarakI18nLanguage = string | { code: string; label: string };

/**
 * `options.i18n` do `SarakUIProvider` — o sistema declara o idioma e a lib o segue e o avisa.
 * Omitida, a fonte é `design.language`, como antes.
 */
export interface SarakI18nOptions {
    /** Os idiomas DO SISTEMA, em BCP-47 (`'pt-BR'`, `'en-US'`); omitida, o seletor lista os do tema. */
    languages?: SarakI18nLanguage[];
    /** Controlado: o idioma atual do i18n do sistema. Com ele, a troca no seletor não grava preferência. */
    language?: string;
    /** O usuário trocou no seletor; o i18n do sistema deve trocar junto. */
    onLanguageChange?: (code: string) => void;
}
