import { resolveStorageKey } from './resolveStorageKey';
import type { SarakUIOptions } from '../types';

const DEFAULT_PREFERENCES_STORAGE_KEY = 'sarak-ui-preferences-v1';

/**
 * Chave efetiva das preferências: o MESMO tenant do tema
 * (`persistence.tenantId`, fonte única em `resolveStorageKey`), mas um
 * `storageKey` PRÓPRIO — preferência nunca compartilha a chave do tema.
 */
export const resolvePreferencesStorageKey = (options: SarakUIOptions | undefined): string =>
    resolveStorageKey({
        storageKey: options?.preferences?.storageKey || DEFAULT_PREFERENCES_STORAGE_KEY,
        tenantId: options?.persistence?.tenantId,
    });
