import { describe, it, expect, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import Database from 'better-sqlite3';
import { setupUIDatabase } from '../database';

const listTables = (db: Database.Database): string[] =>
    (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>).map(
        (row) => row.name,
    );

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

describe('setupUIDatabase (SQLite)', () => {
    it('cria as 4 tabelas do schema ui_core num arquivo', async () => {
        const path = tmpPath('.tmp-setup-test.sqlite');
        await setupUIDatabase(path);

        const db = new Database(path);
        const tables = listTables(db);
        db.close();

        expect(tables).toContain('ui_core_custom_themes');
        expect(tables).toContain('ui_core_system_branding');
        expect(tables).toContain('ui_core_design_agent_conversations');
        expect(tables).toContain('ui_core_design_agent_artifacts');
    });

    it('self-healing roda duas vezes seguidas sem quebrar', async () => {
        const path = tmpPath('.tmp-setup-test-2.sqlite');
        await setupUIDatabase(path);
        await setupUIDatabase(path); // idempotente — não deve lançar

        const db = new Database(path);
        const columns = (db.prepare('PRAGMA table_info(ui_core_custom_themes)').all() as Array<{ name: string }>).map(
            (c) => c.name,
        );
        db.close();

        expect(columns).toContain('system');
        expect(columns).toContain('is_active');
    });

    it('ignora silenciosamente quando connectionString está vazia', async () => {
        await expect(setupUIDatabase('')).resolves.toBeUndefined();
    });
});
