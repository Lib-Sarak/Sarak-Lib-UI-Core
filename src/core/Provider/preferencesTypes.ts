import type { PreferenceId, PreferencePosition } from '../Design/schema/preferences';

export type { PreferenceId, PreferencePosition };
export { PREFERENCE_IDS, PREFERENCE_POSITION_TOKEN_IDS, isPreferenceOffered } from '../Design/schema/preferences';

export type SarakColorModePreference = 'light' | 'dark' | 'system';
export type SarakFontSizePreference = 'sm' | 'md' | 'lg';
export type SarakNavigationStylePreference = 'topbar' | 'sidebar';

/**
 * As cinco preferências do usuário — camada separada do tema, sobreposta ao
 * design efetivo ao renderizar e NUNCA gravada como tema.
 */
export interface SarakUserPreferences {
    colorMode?: SarakColorModePreference;
    fontSize?: SarakFontSizePreference;
    navigationStyle?: SarakNavigationStylePreference;
    navCollapsed?: boolean;
    language?: string;
}

/** Porta opcional do host para guardar preferência por usuário no servidor
 *  (ADR-011, mesmo espírito): a lib não conhece o usuário — quem associa a
 *  preferência a ele é o host, pela própria closure do callback. */
export interface SarakPreferencesOptions {
    storageKey?: string;
    onSave?: (preferences: SarakUserPreferences) => Promise<void> | void;
    onLoad?: () => Promise<SarakUserPreferences> | SarakUserPreferences;
}
