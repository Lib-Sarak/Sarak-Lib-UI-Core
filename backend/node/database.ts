import { Client } from 'pg';
import Database from 'better-sqlite3';
import { buildInitUiSchemaSql, DEFAULT_PG_SCHEMA } from './schema';
import { buildInitUiSchemaSqlite, buildSqliteSelfHealingColumns, DEFAULT_TABLE_PREFIX } from './schema.sqlite';
import { resolveDialect } from './dialect';

export interface SetupUIDatabaseOptions {
    /** Schema Postgres a inicializar (default `'ui_core'`). Ignorado em SQLite. */
    schema?: string;
    /** Prefixo das tabelas SQLite (default `'ui_core_'`). Ignorado em Postgres. */
    tablePrefix?: string;
}

async function setupPostgresDatabase(connectionString: string, schema: string): Promise<void> {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        console.log('🔄 [Sarak-UI-Core/bridge-node] Iniciando migração de UI no PostgreSQL...');
        await client.query(buildInitUiSchemaSql(schema));
        console.log(`✅ [Sarak-UI-Core/bridge-node] Schema "${schema}" inicializado com sucesso.`);

    } catch (error) {
        console.error('❌ [Sarak-UI-Core/bridge-node] Falha ao inicializar banco de dados UI:', error);
    } finally {
        await client.end();
    }
}

/** Colunas já existentes numa tabela SQLite (via `PRAGMA table_info`). */
const existingColumns = (db: Database.Database, table: string): Set<string> => {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    return new Set(rows.map((row) => row.name));
};

function setupSqliteDatabase(connectionString: string, tablePrefix: string): void {
    const db = new Database(connectionString);

    try {
        console.log('🔄 [Sarak-UI-Core/bridge-node] Iniciando migração de UI no SQLite...');
        db.exec(buildInitUiSchemaSqlite(tablePrefix));

        // Self-healing (equivalente ao bloco `DO $$` do lado Postgres): só adiciona a
        // coluna se a tabela já existir e ainda não tiver essa coluna.
        for (const healing of buildSqliteSelfHealingColumns(tablePrefix)) {
            const tableExists = db
                .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?")
                .get(healing.table);
            if (!tableExists) continue;
            if (existingColumns(db, healing.table).has(healing.column)) continue;
            db.exec(`ALTER TABLE ${healing.table} ADD COLUMN ${healing.ddlFragment}`);
        }

        console.log(`✅ [Sarak-UI-Core/bridge-node] Schema inicializado com sucesso (SQLite, prefixo "${tablePrefix}").`);
    } catch (error) {
        console.error('❌ [Sarak-UI-Core/bridge-node] Falha ao inicializar banco de dados UI (SQLite):', error);
    } finally {
        db.close();
    }
}

/**
 * Conecta ao banco de dados do sistema e executa a migração nativa do Sarak UI Core.
 * Cria a tabela `custom_themes` (+ demais) e aplica o self-healing necessário em
 * esquemas Node.js (ex: Next.js). Detecta o dialeto pela própria `connectionString`
 * (Regra "zero-config" — Spec 08 §2): prefixo `postgres://`/`postgresql://` usa
 * PostgreSQL via `pg`; qualquer outro valor (caminho de arquivo, `:memory:`) usa
 * SQLite via `better-sqlite3`.
 *
 * `options.schema`/`options.tablePrefix` (Spec 19) tiram o `"ui_core"` fixo do
 * caminho: consumidores com regra de schema/prefixo próprio configuram sem
 * precisar patchear `node_modules`.
 *
 * @param connectionString URL do PostgreSQL (ex: postgresql://localhost:5432/meubanco)
 *   ou caminho de arquivo/`:memory:` para SQLite (ex: `./database.sqlite`).
 */
export async function setupUIDatabase(connectionString: string, options: SetupUIDatabaseOptions = {}): Promise<void> {
    if (!connectionString) {
        console.warn('⚠️ [Sarak-UI-Core/bridge-node] URL de conexão não fornecida. Inicialização ignorada.');
        return;
    }

    if (resolveDialect(connectionString) === 'postgres') {
        await setupPostgresDatabase(connectionString, options.schema ?? DEFAULT_PG_SCHEMA);
    } else {
        setupSqliteDatabase(connectionString, options.tablePrefix ?? DEFAULT_TABLE_PREFIX);
    }
}
