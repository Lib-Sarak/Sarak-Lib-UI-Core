/**
 * Detecção de dialeto de banco (Postgres vs SQLite) a partir da connection string —
 * "zero-config": o consumidor continua chamando `setupUIDatabase(connectionString)`/
 * `createDesignApiHandler({ connectionString })` exatamente como hoje, sem parâmetro
 * novo. Qualquer string que não comece com `postgres://`/`postgresql://` é tratada
 * como caminho de arquivo SQLite (ou `:memory:`).
 */
export type SarakDbDialect = 'postgres' | 'sqlite';

const POSTGRES_PREFIXES = ['postgres://', 'postgresql://'];

export const resolveDialect = (connectionString: string): SarakDbDialect =>
    POSTGRES_PREFIXES.some((prefix) => connectionString.startsWith(prefix)) ? 'postgres' : 'sqlite';
