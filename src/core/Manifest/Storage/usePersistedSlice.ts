/**
 * Hook de Persistência de Fatia (Spec 28)
 *
 * Liga uma fatia do DataStore (em `path`) a uma chave de `localStorage`, fechando o
 * ciclo declarativo do `persistState`:
 *   1. hidrata o estado a partir do storage no mount, ANTES do paint (sem flicker);
 *   2. grava no storage sempre que a fatia muda;
 *   3. sincroniza entre abas (Regra 2): mudança externa do storage volta ao estado.
 *
 * Tudo guardado por `safeStorage` (degrada suave se o storage estiver bloqueado).
 */

import { useLayoutEffect, useRef } from 'react';
import type { SarakDataStore } from '../DataStore/SarakDataStore';
import { getByPath, type StateRecord } from '../DataStore/resolvePath';
import { readPersisted, writePersisted, subscribeStorage } from './safeStorage';

export const usePersistedSlice = (
    store: SarakDataStore<StateRecord> | undefined,
    path: string | undefined,
    key: string | undefined,
    sensitive = false,
): void => {
    // Espelha o último valor sincronizado para evitar regravações redundantes.
    const lastSynced = useRef<unknown>(undefined);

    useLayoutEffect(() => {
        if (!store || !path || !key) return undefined;

        // 1. Hidratação antes do paint: se houver valor salvo, semeia o estado.
        const stored = readPersisted(key, sensitive);
        if (stored !== undefined) {
            lastSynced.current = stored;
            store.set(path, stored);
        }

        // 2. Grava on-change: assina a fatia e persiste quando ela muda.
        const unsubscribeStore = store.subscribe(
            (state) => getByPath(state, path),
            () => {
                const current = store.get(path);
                if (Object.is(current, lastSynced.current)) return;
                lastSynced.current = current;
                writePersisted(key, current, sensitive);
            },
        );

        // 3. Sync entre abas: mudança externa do storage volta ao estado.
        const unsubscribeStorage = subscribeStorage(
            key,
            (value) => {
                lastSynced.current = value;
                store.set(path, value);
            },
            sensitive,
        );

        return () => {
            unsubscribeStore();
            unsubscribeStorage();
        };
    }, [store, path, key, sensitive]);
};
