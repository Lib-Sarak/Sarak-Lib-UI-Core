/**
 * Bloco Funcional — Persistência de Estado Local (Onda 4: Spec 28)
 *
 * Storage namespaced/guardado + hook de ligação fatia-do-estado ↔ localStorage,
 * consumido pelo LeafNode quando um nó declara `persistState`.
 */

export {
    STORAGE_NAMESPACE,
    namespacedKey,
    readPersisted,
    writePersisted,
    removePersisted,
    subscribeStorage,
} from './safeStorage';
export { usePersistedSlice } from './usePersistedSlice';
