import { Client } from 'pg';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { resolveDialect } from './dialect';

export interface BrandingApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}

interface BrandingRow {
    id: string;
    company_name: string;
    login_name: string;
    tab_name: string;
    logo_base64: string | null;
}

const brandingResponse = (row: BrandingRow) => ({
    branding: {
        companyName: row.company_name,
        loginName: row.login_name,
        tabName: row.tab_name,
        logoBase64: row.logo_base64,
    },
});

const jsonResponse = (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const resolveUserId = async (
    options: BrandingApiOptions,
    req: Request,
): Promise<string | null> => {
    if (!options.getUserId) return null;
    const userId = await Promise.resolve(options.getUserId(req));
    return userId === 'anonymous' ? null : userId;
};

/** Mapeia o payload camelCase do front para as colunas snake_case do banco — dialeto-agnóstico. */
const toDbFields = (updateData: Record<string, unknown>): Record<string, unknown> => {
    const dbData: Record<string, unknown> = {};
    if (updateData.companyName !== undefined) dbData.company_name = updateData.companyName;
    if (updateData.loginName !== undefined) dbData.login_name = updateData.loginName;
    if (updateData.tabName !== undefined) dbData.tab_name = updateData.tabName;
    if (updateData.logoBase64 !== undefined) dbData.logo_base64 = updateData.logoBase64;
    return dbData;
};

// ---------------------------------------------------------------------------
// SQLite (better-sqlite3)
// ---------------------------------------------------------------------------

const getSqliteBranding = (db: Database.Database, system: string, userId: string | null): BrandingRow | undefined => {
    const row = userId
        ? db.prepare('SELECT * FROM ui_core_system_branding WHERE system = ? AND owner_id = ?').get(system, userId)
        : db.prepare('SELECT * FROM ui_core_system_branding WHERE system = ? AND owner_id IS NULL').get(system);
    if (row) return row as BrandingRow;
    if (userId) {
        return db
            .prepare('SELECT * FROM ui_core_system_branding WHERE system = ? AND owner_id IS NULL')
            .get(system) as BrandingRow | undefined;
    }
    return undefined;
};

const handleSqliteGet = (options: BrandingApiOptions, system: string, userId: string | null): Response => {
    const db = new Database(options.connectionString);
    try {
        const row = getSqliteBranding(db, system, userId);
        if (!row) return jsonResponse({ branding: {} });
        return jsonResponse(brandingResponse(row));
    } finally {
        db.close();
    }
};

const handleSqlitePost = async (
    options: BrandingApiOptions,
    system: string,
    userId: string | null,
    req: Request,
): Promise<Response> => {
    const db = new Database(options.connectionString);
    try {
        const body = (await req.json()) as { branding?: Record<string, unknown> };
        const dbData = toDbFields(body.branding || {});

        const existing = userId
            ? db.prepare('SELECT id FROM ui_core_system_branding WHERE system = ? AND owner_id = ?').get(system, userId)
            : db.prepare('SELECT id FROM ui_core_system_branding WHERE system = ? AND owner_id IS NULL').get(system);

        if (!existing) {
            db.prepare(
                'INSERT INTO ui_core_system_branding (id, system, owner_id, company_name, login_name, tab_name, logo_base64) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ).run(
                randomUUID(),
                system,
                userId,
                (dbData.company_name as string) || 'Sarak OS',
                (dbData.login_name as string) || 'Acesso ao Sistema',
                (dbData.tab_name as string) || 'Sarak OS',
                (dbData.logo_base64 as string) || null,
            );
        } else {
            const recordId = (existing as { id: string }).id;
            const setClauses: string[] = [];
            const params: unknown[] = [];
            for (const [col, val] of Object.entries(dbData)) {
                setClauses.push(`${col} = ?`);
                params.push(val);
            }
            if (setClauses.length > 0) {
                params.push(recordId);
                db.prepare(
                    `UPDATE ui_core_system_branding SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                ).run(...params);
            }
        }

        return jsonResponse({ success: true });
    } finally {
        db.close();
    }
};

/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js. Detecta o
 * dialeto (Postgres/SQLite) pela `connectionString` (Spec 08 §2 — zero-config).
 */
export function createBrandingApiHandler(options: BrandingApiOptions) {
    const system = options.systemName || 'global';
    const dialect = resolveDialect(options.connectionString);

    return {
        async GET(req: Request) {
            const userId = await resolveUserId(options, req);
            if (dialect === 'sqlite') {
                try {
                    return handleSqliteGet(options, system, userId);
                } catch (err) {
                    console.error('[Sarak-UI-Core/bridge-node] Branding GET Error (SQLite):', err);
                    return jsonResponse({ error: 'Internal Server Error' }, 500);
                }
            }

            const client = new Client({ connectionString: options.connectionString });
            try {
                await client.connect();

                let query = `SELECT * FROM "ui_core"."system_branding" WHERE system = $1`;
                const params: unknown[] = [system];

                if (userId) {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                query += ` LIMIT 1`;

                let res = await client.query(query, params);

                if (res.rowCount === 0 && userId) {
                    res = await client.query(
                        `SELECT * FROM "ui_core"."system_branding" WHERE system = $1 AND owner_id IS NULL LIMIT 1`,
                        [system],
                    );
                }

                if (res.rowCount === 0) return jsonResponse({ branding: {} });

                return jsonResponse(brandingResponse(res.rows[0] as BrandingRow));
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] Branding GET Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            } finally {
                await client.end();
            }
        },

        async POST(req: Request) {
            const userId = await resolveUserId(options, req);
            if (dialect === 'sqlite') {
                try {
                    return await handleSqlitePost(options, system, userId, req);
                } catch (err) {
                    console.error('[Sarak-UI-Core/bridge-node] Branding POST Error (SQLite):', err);
                    return jsonResponse({ error: 'Internal Server Error' }, 500);
                }
            }

            const client = new Client({ connectionString: options.connectionString });
            try {
                await client.connect();

                const body = await req.json();
                const dbData = toDbFields(body.branding || {});

                let query = `SELECT id FROM "ui_core"."system_branding" WHERE system = $1`;
                const params: unknown[] = [system];
                if (userId) {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                query += ` LIMIT 1`;

                const res = await client.query(query, params);

                if (res.rowCount === 0) {
                    await client.query(
                        `INSERT INTO "ui_core"."system_branding" (system, owner_id, company_name, login_name, tab_name, logo_base64) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            system,
                            userId,
                            dbData.company_name || 'Sarak OS',
                            dbData.login_name || 'Acesso ao Sistema',
                            dbData.tab_name || 'Sarak OS',
                            dbData.logo_base64 || null,
                        ],
                    );
                } else {
                    const recordId = res.rows[0].id;
                    const setClauses: string[] = [];
                    const updateParams: unknown[] = [];
                    let pIdx = 1;

                    for (const [col, val] of Object.entries(dbData)) {
                        setClauses.push(`${col} = $${pIdx}`);
                        updateParams.push(val);
                        pIdx++;
                    }

                    if (setClauses.length > 0) {
                        updateParams.push(recordId);
                        await client.query(
                            `UPDATE "ui_core"."system_branding" SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${pIdx}`,
                            updateParams,
                        );
                    }
                }

                return jsonResponse({ success: true });
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] Branding POST Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            } finally {
                await client.end();
            }
        }
    };
}
