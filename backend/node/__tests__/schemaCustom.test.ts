/**
 * Critérios de aceite (Spec 19 §3/§4):
 * - `schema`/`tablePrefix` custom são aplicados sem patch em `node_modules`.
 * - Identificador inválido (`"a";DROP...`) é rejeitado ANTES de qualquer I/O.
 * - Sem Postgres real disponível no ambiente de CI, as queries PG são conferidas
 *   por asserção de string (schema custom aparece corretamente qualificado).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import Database from 'better-sqlite3';
import { setupUIDatabase } from '../database';
import { createDesignApiHandler } from '../api';
import { createThemesApiHandler } from '../themes';
import { buildInitUiSchemaSql } from '../schema';
import { buildInitUiSchemaSqlite } from '../schema.sqlite';
import { qualifyTable } from '../adapters/postgresQueries';
import { createPostgresStorageAdapter } from '../adapters/postgresAdapter';
import { createSqliteStorageAdapter } from '../adapters/sqliteAdapter';
import { resolveStorage } from '../options';

const tmpPaths: string[] = [];
const tmpPath = (name: string): string => {
    const path = `${__dirname}/${name}`;
    tmpPaths.push(path);
    return path;
};

afterEach(() => {
    while (tmpPaths.length > 0) {
        rmSync(tmpPaths.pop() as string, { force: true });
    }
});

describe('schema/tablePrefix — sanitização', () => {
    it('buildInitUiSchemaSqlite rejeita tablePrefix com tentativa de injection', () => {
        expect(() => buildInitUiSchemaSqlite('"a";DROP TABLE users;--')).toThrow(/tablePrefix/);
    });

    it('createSqliteStorageAdapter rejeita tablePrefix inválido na construção (antes de qualquer I/O)', () => {
        expect(() => createSqliteStorageAdapter({ connectionString: ':memory:', tablePrefix: '"a";DROP TABLE users;--' })).toThrow();
    });

    it('createPostgresStorageAdapter rejeita schema inválido na construção (antes de qualquer conexão)', () => {
        expect(() => createPostgresStorageAdapter({ connectionString: 'postgres://x/y', schema: '"a";DROP TABLE users;--' })).toThrow();
    });

    it('resolveStorage propaga o schema inválido do mesmo jeito (sem storage custom)', () => {
        expect(() =>
            resolveStorage({ connectionString: 'postgres://x/y', schema: 'a b' }),
        ).toThrow();
    });
});

describe('SQLite — tablePrefix custom', () => {
    it('cria tabelas prefixadas e o fluxo criar→ativar→get ativo funciona', async () => {
        const path = tmpPath('.tmp-schema-custom-prefix.sqlite');
        await setupUIDatabase(path, { tablePrefix: 'meu_app_' });

        const db = new Database(path);
        const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>).map(
            (row) => row.name,
        );
        db.close();
        expect(tables).toContain('meu_app_custom_themes');
        expect(tables).toContain('meu_app_system_branding');
        expect(tables).not.toContain('ui_core_custom_themes');

        const design = createDesignApiHandler({ connectionString: path, tablePrefix: 'meu_app_' });
        const themes = createThemesApiHandler({ connectionString: path, tablePrefix: 'meu_app_' });

        const created = await (
            await themes.POST(new Request('http://local/x', { method: 'POST', body: JSON.stringify({ name: 'Custom', design: { mode: 'dark' }, is_active: true }) }))
        ).json();
        expect(created.is_active).toBe(true);

        const active = await (await design.GET(new Request('http://local/api/ui/design'))).json();
        expect(active.id).toBe(created.id);
        expect(active.design.mode).toBe('dark');
    });
});

describe('Postgres — schema custom (asserção de query, sem Postgres real disponível)', () => {
    it('buildInitUiSchemaSql qualifica todas as tabelas com o schema informado', () => {
        const sql = buildInitUiSchemaSql('MeuSchema');
        expect(sql).toContain('CREATE SCHEMA IF NOT EXISTS "MeuSchema"');
        expect(sql).toContain('"MeuSchema"."custom_themes"');
        expect(sql).toContain('"MeuSchema"."system_branding"');
        expect(sql).not.toContain('"ui_core"');
    });

    it('qualifyTable produz o identificador schema-qualificado usado pelo adapter PG', () => {
        expect(qualifyTable('MeuSchema', 'custom_themes')).toBe('"MeuSchema"."custom_themes"');
        expect(qualifyTable('ui_core', 'system_branding')).toBe('"ui_core"."system_branding"');
    });
});
