import { Client } from 'pg';
import Database from 'better-sqlite3';
import { INIT_UI_SCHEMA_SQL } from './schema';
import { INIT_UI_SCHEMA_SQLITE, SQLITE_SELF_HEALING_COLUMNS } from './schema.sqlite';
import { resolveDialect } from './dialect';

async function setupPostgresDatabase(connectionString: string): Promise<void> {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        console.log('🔄 [Sarak-UI-Core/bridge-node] Iniciando migração de UI no PostgreSQL...');
        // Executa o script importado diretamente da constante TypeScript
        await client.query(INIT_UI_SCHEMA_SQL);
        console.log('✅ [Sarak-UI-Core/bridge-node] Schema ui_core inicializado com sucesso.');

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

function setupSqliteDatabase(connectionString: string): void {
    const db = new Database(connectionString);

    try {
        console.log('🔄 [Sarak-UI-Core/bridge-node] Iniciando migração de UI no SQLite...');
        db.exec(INIT_UI_SCHEMA_SQLITE);

        // Self-healing (equivalente ao bloco `DO $$` do lado Postgres): só adiciona a
        // coluna se a tabela já existir e ainda não tiver essa coluna.
        for (const healing of SQLITE_SELF_HEALING_COLUMNS) {
            const tableExists = db
                .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?")
                .get(healing.table);
            if (!tableExists) continue;
            if (existingColumns(db, healing.table).has(healing.column)) continue;
            db.exec(`ALTER TABLE ${healing.table} ADD COLUMN ${healing.ddlFragment}`);
        }

        console.log('✅ [Sarak-UI-Core/bridge-node] Schema ui_core inicializado com sucesso (SQLite).');
    } catch (error) {
        console.error('❌ [Sarak-UI-Core/bridge-node] Falha ao inicializar banco de dados UI (SQLite):', error);
    } finally {
        db.close();
    }
}

/**
 * Conecta ao banco de dados do sistema e executa a migração nativa do Sarak UI Core.
 * Este script cria a tabela `custom_themes` e aplica o self-healing necessário
 * em esquemas Node.js (ex: Next.js). Detecta o dialeto pela própria `connectionString`
 * (Regra "zero-config" — Spec 08 §2): prefixo `postgres://`/`postgresql://` usa
 * PostgreSQL via `pg`; qualquer outro valor (caminho de arquivo, `:memory:`) usa
 * SQLite via `better-sqlite3`.
 *
 * @param connectionString URL do PostgreSQL (ex: postgresql://localhost:5432/meubanco)
 *   ou caminho de arquivo/`:memory:` para SQLite (ex: `./database.sqlite`).
 */
export async function setupUIDatabase(connectionString: string): Promise<void> {
    if (!connectionString) {
        console.warn('⚠️ [Sarak-UI-Core/bridge-node] URL de conexão não fornecida. Inicialização ignorada.');
        return;
    }

    if (resolveDialect(connectionString) === 'postgres') {
        await setupPostgresDatabase(connectionString);
    } else {
        setupSqliteDatabase(connectionString);
    }
}
