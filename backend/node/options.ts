/**
 * Opções compartilhadas pelos 3 handlers (design/branding/themes) e pelo adaptador
 * Express. `resolveStorage` é o ponto único que decide qual `UIStorageAdapter`
 * usar (Spec 19 §2.2): `storage` explícito (Supabase/Firebase/adapter fake em
 * teste/…) tem prioridade; senão instancia o adapter de referência (pg/sqlite) a
 * partir de `connectionString`, com `schema`/`tablePrefix` aplicados.
 */
import { resolveDialect } from './dialect';
import { DEFAULT_PG_SCHEMA } from './schema';
import { DEFAULT_TABLE_PREFIX } from './schema.sqlite';
import { createPostgresStorageAdapter } from './adapters/postgresAdapter';
import { createSqliteStorageAdapter } from './adapters/sqliteAdapter';
import type { UIStorageAdapter } from './storageAdapter';

export interface UIPersistenceOptions {
    /** Connection string usada para instanciar o adapter de referência (pg ou sqlite). Ignorada se `storage` for informado. */
    connectionString?: string;
    /** Adapter próprio (Supabase/Firebase/API própria/…) — bypassa completamente pg/sqlite. */
    storage?: UIStorageAdapter;
    /** Schema Postgres do adapter de referência (default `'ui_core'`). Ignorado com `storage` ou dialeto SQLite. */
    schema?: string;
    /** Prefixo de tabela SQLite do adapter de referência (default `'ui_core_'`). Ignorado com `storage` ou dialeto Postgres. */
    tablePrefix?: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}

/** Alias mantido pelo nome histórico — mesmo shape de `UIPersistenceOptions`. */
export type DesignApiOptions = UIPersistenceOptions;

export function resolveStorage(options: UIPersistenceOptions): UIStorageAdapter {
    if (options.storage) return options.storage;

    if (!options.connectionString) {
        throw new Error(
            '[Sarak-UI-Core/bridge-node] Informe "storage" (adapter customizado) ou "connectionString" (adapter de referência pg/sqlite).',
        );
    }

    if (resolveDialect(options.connectionString) === 'postgres') {
        return createPostgresStorageAdapter({
            connectionString: options.connectionString,
            schema: options.schema ?? DEFAULT_PG_SCHEMA,
        });
    }

    return createSqliteStorageAdapter({
        connectionString: options.connectionString,
        tablePrefix: options.tablePrefix ?? DEFAULT_TABLE_PREFIX,
    });
}

export const resolveUserId = async (options: UIPersistenceOptions, req: Request): Promise<string | null> => {
    if (!options.getUserId) return null;
    const userId = await Promise.resolve(options.getUserId(req));
    return userId === 'anonymous' ? null : userId;
};
