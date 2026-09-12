import { useEffect } from 'react';
import { validatePreferences } from '../utils/validatePreferences';
import type { SarakUserPreferences } from '../preferencesTypes';

/**
 * Sincroniza preferências entre abas/apps da mesma origem — o mesmo mecanismo
 * de `useDesignStorageSync`, aplicado à chave própria das preferências
 * (`resolvePreferencesStorageKey`), nunca à do tema.
 */
export const usePreferencesStorageSync = (
    isHydrated: boolean,
    storageKey: string,
    onExternalChange: (preferences: SarakUserPreferences) => void,
): void => {
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;

        const handleStorage = (event: StorageEvent): void => {
            if (event.key !== storageKey || event.newValue == null) return;
            try {
                onExternalChange(validatePreferences(JSON.parse(event.newValue)));
            } catch {
                console.warn('[Sarak:Preferences] Recebido de outra aba/app é JSON inválido — descartado.');
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [isHydrated, storageKey, onExternalChange]);
};
