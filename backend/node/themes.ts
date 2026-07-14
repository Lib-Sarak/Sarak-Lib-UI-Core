/**
 * API de Temas Nomeados do Design Engine (Spec 01 ↔ Spec 08 §3.1).
 *
 * O frontend (`useThemeActions`) fala com TRÊS rotas que até aqui nunca tiveram
 * implementação na ponte Node (salvar tema novo no painel dava 404 silencioso):
 *   POST {base}/themes                → cria tema nomeado ({ design, name, is_active })
 *   PUT  {base}/themes/:id            → atualiza design/nome/ativação do tema
 *   PUT  {base}/themes/:id/activate   → ativa o tema (desativa os demais do escopo)
 *
 * Mesma tabela `custom_themes` do handler de design (Postgres/SQLite auto-detectado);
 * reusa os helpers oficiais de `api.ts` (merge granular + normalização + shape).
 */

import { Client } from 'pg';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { resolveDialect } from './dialect';
import {
    buildResponseData,
    jsonResponse,
    mergeUpdates,
    normalizeSqliteRow,
    resolveUserId,
    type DesignApiOptions,
    type ThemeRow,
} from './api';

interface ThemeWriteBody {
    design?: Record<string, unknown>;
    name?: string;
    is_active?: boolean;
}

const readBody = async (req: Request): Promise<ThemeWriteBody> => {
    try {
        return ((await req.json()) ?? {}) as ThemeWriteBody;
    } catch {
        return {};
    }
};

// ---------------------------------------------------------------------------
// SQLite (better-sqlite3)
// ---------------------------------------------------------------------------

const sqliteDeactivateScope = (db: Database.Database, system: string, userId: string | null): void => {
    if (userId) {
        db.prepare('UPDATE ui_core_custom_themes SET is_active = 0 WHERE system = ? AND owner_id = ?').run(system, userId);
    } else {
        db.prepare('UPDATE ui_core_custom_themes SET is_active = 0 WHERE system = ? AND owner_id IS NULL').run(system);
    }
};

const sqliteApplyDesign = (db: Database.Database, themeId: string, body: ThemeWriteBody): void => {
    const current = normalizeSqliteRow(
        db.prepare('SELECT * FROM ui_core_custom_themes WHERE id = ?').get(themeId) as Record<string, unknown>,
    );
    const updates = mergeUpdates(body.design ?? {}, current ?? {});
    if (body.name) updates.name = body.name;
    if (Object.keys(updates).length === 0) return;
    const setClauses: string[] = [];
    const params: unknown[] = [];
    for (const [col, val] of Object.entries(updates)) {
        setClauses.push(`${col} = ?`);
        params.push(typeof val === 'object' ? JSON.stringify(val) : val);
    }
    params.push(themeId);
    db.prepare(
        `UPDATE ui_core_custom_themes SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    ).run(...params);
};

const sqliteRespondTheme = (db: Database.Database, themeId: string): Response => {
    const row = db.prepare('SELECT * FROM ui_core_custom_themes WHERE id = ?').get(themeId);
    const theme = normalizeSqliteRow(row as Record<string, unknown>);
    if (!theme) return jsonResponse({ error: 'Tema não encontrado' }, 404);
    return jsonResponse(buildResponseData(theme));
};

const sqliteCreate = (options: DesignApiOptions, system: string, userId: string | null, body: ThemeWriteBody): Response => {
    const db = new Database(options.connectionString);
    try {
        const themeId = randomUUID();
        if (body.is_active) sqliteDeactivateScope(db, system, userId);
        db.prepare(
            'INSERT INTO ui_core_custom_themes (id, name, system, owner_id, is_active) VALUES (?, ?, ?, ?, ?)',
        ).run(themeId, body.name || 'Tema sem nome', system, userId, body.is_active ? 1 : 0);
        sqliteApplyDesign(db, themeId, body);
        return sqliteRespondTheme(db, themeId);
    } finally {
        db.close();
    }
};

const sqliteUpdate = (options: DesignApiOptions, system: string, userId: string | null, themeId: string, body: ThemeWriteBody): Response => {
    const db = new Database(options.connectionString);
    try {
        const exists = db.prepare('SELECT id FROM ui_core_custom_themes WHERE id = ?').get(themeId);
        if (!exists) return jsonResponse({ error: 'Tema não encontrado' }, 404);
        if (body.is_active) {
            sqliteDeactivateScope(db, system, userId);
            db.prepare('UPDATE ui_core_custom_themes SET is_active = 1 WHERE id = ?').run(themeId);
        }
        sqliteApplyDesign(db, themeId, body);
        return sqliteRespondTheme(db, themeId);
    } finally {
        db.close();
    }
};

const sqliteActivate = (options: DesignApiOptions, system: string, userId: string | null, themeId: string): Response => {
    const db = new Database(options.connectionString);
    try {
        const exists = db.prepare('SELECT id FROM ui_core_custom_themes WHERE id = ?').get(themeId);
        if (!exists) return jsonResponse({ error: 'Tema não encontrado' }, 404);
        sqliteDeactivateScope(db, system, userId);
        db.prepare('UPDATE ui_core_custom_themes SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(themeId);
        return sqliteRespondTheme(db, themeId);
    } finally {
        db.close();
    }
};

// ---------------------------------------------------------------------------
// Postgres (pg) — espelha as queries do handler de design (api.ts).
// ---------------------------------------------------------------------------

const pgDeactivateScope = async (client: Client, system: string, userId: string | null): Promise<void> => {
    if (userId) {
        await client.query(`UPDATE "ui_core"."custom_themes" SET is_active = false WHERE system = $1 AND owner_id = $2`, [system, userId]);
    } else {
        await client.query(`UPDATE "ui_core"."custom_themes" SET is_active = false WHERE system = $1 AND owner_id IS NULL`, [system]);
    }
};

const pgApplyDesign = async (client: Client, themeId: string, body: ThemeWriteBody): Promise<void> => {
    const current = await client.query(`SELECT * FROM "ui_core"."custom_themes" WHERE id = $1`, [themeId]);
    const updates = mergeUpdates(body.design ?? {}, (current.rows[0] ?? {}) as Partial<ThemeRow>);
    if (body.name) updates.name = body.name;
    if (Object.keys(updates).length === 0) return;
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    for (const [col, val] of Object.entries(updates)) {
        setClauses.push(`${col} = $${idx}`);
        params.push(typeof val === 'object' ? JSON.stringify(val) : val);
        idx++;
    }
    params.push(themeId);
    await client.query(
        `UPDATE "ui_core"."custom_themes" SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
        params,
    );
};

const pgRespondTheme = async (client: Client, themeId: string): Promise<Response> => {
    const res = await client.query(`SELECT * FROM "ui_core"."custom_themes" WHERE id = $1`, [themeId]);
    if (res.rowCount === 0) return jsonResponse({ error: 'Tema não encontrado' }, 404);
    return jsonResponse(buildResponseData(res.rows[0] as ThemeRow));
};

type PgOperation = (client: Client) => Promise<Response>;

const withPgClient = async (options: DesignApiOptions, operation: PgOperation): Promise<Response> => {
    const client = new Client({ connectionString: options.connectionString });
    try {
        await client.connect();
        return await operation(client);
    } catch (err) {
        console.error('[Sarak-UI-Core/bridge-node] Themes Error (Postgres):', err);
        return jsonResponse({ error: 'Internal Server Error' }, 500);
    } finally {
        await client.end();
    }
};

// ---------------------------------------------------------------------------
// Handler público
// ---------------------------------------------------------------------------

/**
 * Handlers dos temas nomeados. `POST` cria; `PUT` atualiza; `ACTIVATE` ativa —
 * os dois últimos recebem o `themeId` extraído da rota pelo host (Next.js dynamic
 * route ou o middleware Express oficial).
 */
export function createThemesApiHandler(options: DesignApiOptions) {
    const system = options.systemName || 'global';
    const dialect = resolveDialect(options.connectionString);

    const guardSqlite = (operation: () => Response): Response => {
        try {
            return operation();
        } catch (err) {
            console.error('[Sarak-UI-Core/bridge-node] Themes Error (SQLite):', err);
            return jsonResponse({ error: 'Internal Server Error' }, 500);
        }
    };

    return {
        async POST(req: Request): Promise<Response> {
            const userId = await resolveUserId(options, req);
            const body = await readBody(req);
            if (dialect === 'sqlite') return guardSqlite(() => sqliteCreate(options, system, userId, body));
            return withPgClient(options, async (client) => {
                if (body.is_active) await pgDeactivateScope(client, system, userId);
                const inserted = await client.query(
                    `INSERT INTO "ui_core"."custom_themes" (name, system, owner_id, is_active) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [body.name || 'Tema sem nome', system, userId, Boolean(body.is_active)],
                );
                const themeId = inserted.rows[0].id as string;
                await pgApplyDesign(client, themeId, body);
                return pgRespondTheme(client, themeId);
            });
        },

        async PUT(req: Request, themeId: string): Promise<Response> {
            const userId = await resolveUserId(options, req);
            const body = await readBody(req);
            if (dialect === 'sqlite') return guardSqlite(() => sqliteUpdate(options, system, userId, themeId, body));
            return withPgClient(options, async (client) => {
                if (body.is_active) {
                    await pgDeactivateScope(client, system, userId);
                    await client.query(`UPDATE "ui_core"."custom_themes" SET is_active = true WHERE id = $1`, [themeId]);
                }
                await pgApplyDesign(client, themeId, body);
                return pgRespondTheme(client, themeId);
            });
        },

        async ACTIVATE(req: Request, themeId: string): Promise<Response> {
            const userId = await resolveUserId(options, req);
            if (dialect === 'sqlite') return guardSqlite(() => sqliteActivate(options, system, userId, themeId));
            return withPgClient(options, async (client) => {
                await pgDeactivateScope(client, system, userId);
                await client.query(
                    `UPDATE "ui_core"."custom_themes" SET is_active = true, updated_at = NOW() WHERE id = $1`,
                    [themeId],
                );
                return pgRespondTheme(client, themeId);
            });
        },
    };
}
