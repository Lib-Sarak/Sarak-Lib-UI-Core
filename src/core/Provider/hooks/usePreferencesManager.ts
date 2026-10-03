import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { validatePreferences } from '../utils/validatePreferences';
import { resolvePreferencesStorageKey } from '../utils/resolvePreferencesStorageKey';
import { usePreferencesSystemColorScheme } from './usePreferencesSystemColorScheme';
import { usePreferencesRemoteLoader } from './usePreferencesRemoteLoader';
import { usePreferencesStorageSync } from './usePreferencesStorageSync';
import type { SarakUIOptions } from '../types';
import type { SarakUserPreferences } from '../preferencesTypes';

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
export const usePreferencesManager = (options: SarakUIOptions, isHydrated: boolean) => {
    const storageKey = useMemo(
        () => resolvePreferencesStorageKey(options),
        [options?.preferences?.storageKey, options?.persistence?.tenantId],
    );
    const onSaveRef = useRef(options?.preferences?.onSave);
    onSaveRef.current = options?.preferences?.onSave;

    const [preferences, setPreferences] = useState<SarakUserPreferences>(() => readStoredPreferences(storageKey));
    const systemColorScheme = usePreferencesSystemColorScheme();

    const mergeRemote = useCallback((remote: SarakUserPreferences) => {
        setPreferences((prev) => ({ ...prev, ...remote }));
    }, []);
    usePreferencesRemoteLoader(isHydrated, options?.preferences?.onLoad, mergeRemote);
    usePreferencesStorageSync(isHydrated, storageKey, setPreferences);

    // IMEDIATA — nunca debounced. Preferência é uma escolha do usuário que
    // precisa sobreviver a uma navegação/recarregamento no instante seguinte
    // (o único consumidor real troca de módulo recarregando a página inteira);
    // esperar arrisca perder a escolha antes de ela ser gravada.
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(preferences));
        } catch (error) {
            console.error('[Sarak:Preferences] Save error:', error);
        }
        onSaveRef.current?.(preferences);
    }, [preferences, isHydrated, storageKey]);

    const updatePreferences = useCallback((partial: Partial<SarakUserPreferences>) => {
        setPreferences((prev) => validatePreferences({ ...prev, ...partial }));
    }, []);

    return { preferences, updatePreferences, systemColorScheme };
};
