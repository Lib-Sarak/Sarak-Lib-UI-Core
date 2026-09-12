import { useEffect } from 'react';
import { validatePreferences } from '../utils/validatePreferences';
import type { SarakPreferencesOptions, SarakUserPreferences } from '../preferencesTypes';

/**
 * Carrega preferências da porta remota opcional (`options.preferences.onLoad`)
 * uma vez, quando o Provider hidrata — funde POR CIMA do que já veio do
 * `localStorage`, nunca troca a fonte inteira: preferência é dado leve, sem a
 * disputa de `strategy` que o tema tem (ADR-009).
 */
export const usePreferencesRemoteLoader = (
    isHydrated: boolean,
    onLoad: SarakPreferencesOptions['onLoad'],
    onLoaded: (preferences: SarakUserPreferences) => void,
): void => {
    useEffect(() => {
        if (!isHydrated || !onLoad) return;
        let cancelled = false;

        Promise.resolve(onLoad())
            .then((remote) => {
                if (cancelled) return;
                onLoaded(validatePreferences(remote));
            })
            .catch((error) => console.error('[Sarak:Preferences] Load error:', error));

        return () => {
            cancelled = true;
        };
    }, [isHydrated, onLoad, onLoaded]);
};
