export const DEFAULT_STORAGE_KEY = 'sarak-ui-design-v9.0';

/**
 * Legado: chave de `localStorage` que o `LanguageSelector` duplicado
 * (`atomic/Inputs/Controls.tsx`, removido) gravava direto, fora da camada de
 * preferências. Segue na lista do reset (`utils/storage.ts`) só para limpar o
 * resíduo de quem já a tinha salva — o seletor que fica é o `ShellLanguageSelector`,
 * que grava a preferência de idioma pelo caminho normal (`updatePreferences`).
 */
export const LANGUAGE_STORAGE_KEY = 'sarak_lang';

export const BEZIER_CURVES = {
    '--sarak-bezier-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--sarak-bezier-decelerate': 'cubic-bezier(0.0, 0, 0.2, 1)',
    '--sarak-bezier-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
    '--sarak-bezier-sharp': 'cubic-bezier(0.4, 0, 0.6, 1)'
};
