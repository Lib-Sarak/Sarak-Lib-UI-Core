import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { validatePreferences } from '../utils/validatePreferences';
import { resolvePreferencesStorageKey } from '../utils/resolvePreferencesStorageKey';
import { usePreferencesSystemColorScheme } from './usePreferencesSystemColorScheme';
import { usePreferencesRemoteLoader } from './usePreferencesRemoteLoader';
import { usePreferencesStorageSync } from './usePreferencesStorageSync';
import type { SarakUIOptions } from '../types';
import type {
    SarakColorModePreference,
    SarakPreferencesOptions,
    SarakUserPreferences,
} from '../preferencesTypes';

type PreferencesManagerResult = {
    preferences: SarakUserPreferences;
    updatePreferences: (partial: Partial<SarakUserPreferences>) => void;
    systemColorScheme: 'light' | 'dark';
};

const withHostDefaultColorMode = (
    preferences: SarakUserPreferences,
    defaultColorMode: SarakColorModePreference | undefined,
): SarakUserPreferences => {
    if (preferences.colorMode !== undefined || defaultColorMode === undefined) return preferences;
    return { ...preferences, colorMode: defaultColorMode };
};

type PreferencesPersistenceContext = {
    preferences: SarakUserPreferences;
    isHydrated: boolean;
    storageKey: string;
    shouldPersistPreferencesRef: MutableRefObject<boolean>;
    onSaveRef: MutableRefObject<SarakPreferencesOptions['onSave']>;
};

const usePersistedPreferences = (context: PreferencesPersistenceContext): void => {
    const {
        preferences,
        isHydrated,
        storageKey,
        shouldPersistPreferencesRef,
        onSaveRef,
    } = context;
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined' || !shouldPersistPreferencesRef.current) return;
        shouldPersistPreferencesRef.current = false;
        try {
            localStorage.setItem(storageKey, JSON.stringify(preferences));
        } catch (error) {
            console.error('[Sarak:Preferences] Save error:', error);
        }
        onSaveRef.current?.(preferences);
    }, [preferences, isHydrated, storageKey]);
};

const readStoredPreferences = (storageKey: string): SarakUserPreferences => {
    if (typeof window === 'undefined') return {};
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? validatePreferences(JSON.parse(saved)) : {};
    } catch {
        return {};
    }
};

/**
 * Camada de preferências do usuário — separada do tema por desenho: lê e
 * escreve a PRÓPRIA chave de `localStorage` (nunca a do tema), nunca chama
 * `persistDesign`/`persistence.onSave`, e não aparece no que o painel salva
 * como tema. `SarakUIProvider` sobrepõe o resultado ao design
 * (`overlayPreferences`) antes de expor `design`/`activeDesign` — esta
 * camada não sabe disso, só guarda e devolve o que foi escolhido.
 */
export const usePreferencesManager = (
    options: SarakUIOptions,
    isHydrated: boolean,
): PreferencesManagerResult => {
    const storageKey = useMemo(
        () => resolvePreferencesStorageKey(options),
        [options?.preferences?.storageKey, options?.persistence?.tenantId],
    );
    const onSaveRef = useRef(options?.preferences?.onSave);
    onSaveRef.current = options?.preferences?.onSave;

    const [preferences, setPreferences] = useState<SarakUserPreferences>(() => readStoredPreferences(storageKey));
    const shouldPersistPreferencesRef = useRef(false);
    const systemColorScheme = usePreferencesSystemColorScheme();
    const defaultColorMode = options?.preferences?.defaultColorMode;
    const preferencesWithHostDefault = useMemo(
        () => withHostDefaultColorMode(preferences, defaultColorMode),
        [preferences, defaultColorMode],
    );

    const mergeRemote = useCallback((remote: SarakUserPreferences) => {
        setPreferences((prev) => ({ ...prev, ...remote }));
    }, []);
    usePreferencesRemoteLoader(isHydrated, options?.preferences?.onLoad, mergeRemote);
    usePreferencesStorageSync(isHydrated, storageKey, setPreferences);

    // IMEDIATA — nunca debounced. Preferência é uma escolha do usuário que
    // precisa sobreviver a uma navegação/recarregamento no instante seguinte
    // (o único consumidor real troca de módulo recarregando a página inteira);
    // esperar arrisca perder a escolha antes de ela ser gravada.
    usePersistedPreferences({ preferences, isHydrated, storageKey, shouldPersistPreferencesRef, onSaveRef });

    const updatePreferences = useCallback((partial: Partial<SarakUserPreferences>) => {
        shouldPersistPreferencesRef.current = true;
        setPreferences((prev) => validatePreferences({ ...prev, ...partial }));
    }, []);

    return { preferences: preferencesWithHostDefault, updatePreferences, systemColorScheme };
};
