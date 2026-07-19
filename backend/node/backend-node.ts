export { setupUIDatabase } from './database';
export type { SetupUIDatabaseOptions } from './database';
export { createDesignApiHandler } from './api';
export type { DesignApiOptions } from './api';
export { createBrandingApiHandler } from './branding';
export type { BrandingApiOptions } from './branding';
export { createSarakUIExpressMiddleware } from './expressAdapter';
export type { SarakUIMiddlewareOptions } from './expressAdapter';
export { createThemesApiHandler } from './themes';
export { getDesignCatalog, getDesignScaffold } from './catalog';
export type { DesignCatalogToken, DesignScaffoldToken } from './catalog';

// Porta de Persistência de UI (Spec 19) — a interface que qualquer storage
// (adapter próprio ou de referência) implementa, e as implementações de
// referência embarcadas (pg/sqlite) para quem quer instanciá-las diretamente.
export type {
    UIStorageAdapter,
    UIStorageScope,
    UITheme,
    UIThemeCreateInput,
    UIThemeUpdateInput,
    UIBranding,
} from './storageAdapter';
export type { UIPersistenceOptions } from './options';
export { createPostgresStorageAdapter } from './adapters/postgresAdapter';
export type { PostgresStorageAdapterOptions } from './adapters/postgresAdapter';
export { createSqliteStorageAdapter } from './adapters/sqliteAdapter';
export type { SqliteStorageAdapterOptions } from './adapters/sqliteAdapter';
