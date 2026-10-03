import { useSarakUI } from '../SarakUIProvider';
import type { SarakUserPreferences } from '../preferencesTypes';

export interface SarakPreferencesHook {
    preferences: SarakUserPreferences;
    updatePreferences: (partial: Partial<SarakUserPreferences>) => void;
}

/**
 * Leitura e escrita PÚBLICA das preferências do usuário — a camada
 * sobreposta ao tema, nunca gravada nele. É por aqui que uma barra de
 * preferências configurável monta, que uma tradução funcional liga o
 * idioma escolhido, e que o host lê a preferência de idioma para a própria
 * tradução.
 */
export const useSarakPreferences = (): SarakPreferencesHook => {
    const { preferences, updatePreferences } = useSarakUI();
    return { preferences, updatePreferences };
};
