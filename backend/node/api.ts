import { Client } from 'pg';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { resolveDialect } from './dialect';
import ThemeMappingRaw from '../../src/core/Design/catalog/theme_table_mapping.json';
const ThemeMapping: Record<string, string[]> = ThemeMappingRaw;

export interface DesignApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}

export const GRANULAR_COLUMNS = [
    'branding_config',
    'colors_and_atmosphere',
    'typography',
    'layout_and_navigation',
    'components_base',
    'cards_engine',
    'data_and_charts',
    'motion_and_animation',
    'specialized_engines'
];

const TOP_LEVEL_COLUMNS = ['mode', 'navigation_style', 'body_size'];

export interface ThemeRow {
    id: string;
    name: string;
    description: string | null;
    system: string;
    owner_id: string | null;
    is_public: boolean;
    is_active: boolean;
    [key: string]: unknown;
}

/** LÃ³gica pura (dialeto-agnÃ³stica): flatten das colunas granulares + top-level. */
export const flattenTheme = (theme: ThemeRow): Record<string, unknown> => {
    const designFlat: Record<string, unknown> = {};
    for (const col of TOP_LEVEL_COLUMNS) {
        if (theme[col] !== undefined && theme[col] !== null) designFlat[col] = theme[col];
    }
    for (const col of GRANULAR_COLUMNS) {
        const value = theme[col];
        if (value && typeof value === 'object') Object.assign(designFlat, value);
    }
    return designFlat;
};

export const buildResponseData = (theme: ThemeRow) => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    system: theme.system,
    owner_id: theme.owner_id,
    is_public: theme.is_public,
    is_active: theme.is_active,
    design: flattenTheme(theme),
});

export const jsonResponse = (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const resolveGranularColumn = (key: string): string => {
    for (const [col, fields] of Object.entries(ThemeMapping)) {
        if (GRANULAR_COLUMNS.includes(col) && fields.includes(key)) return col;
    }
    return 'branding_config';
};

/** Merge de updates (top-level + granular) a partir do design recebido â€” dialeto-agnÃ³stico. */
export const mergeUpdates = (
    updateDesign: Record<string, unknown>,
    currentTheme: Partial<ThemeRow>,
): Record<string, unknown> => {
    const updates: Record<string, unknown> = {};
    const granularData: Record<string, Record<string, unknown>> = {};
    for (const col of GRANULAR_COLUMNS) {
        granularData[col] = (currentTheme[col] as Record<string, unknown>) || {};
    }
    for (const [key, value] of Object.entries(updateDesign)) {
        if (TOP_LEVEL_COLUMNS.includes(key) || GRANULAR_COLUMNS.includes(key)) {
            updates[key] = value;
        } else {
            granularData[resolveGranularColumn(key)][key] = value;
        }
    }
    for (const col of GRANULAR_COLUMNS) {
        updates[col] = granularData[col];
    }
    return updates;
};

export const resolveUserId = async (
    options: DesignApiOptions,
    req: Request,
): Promise<string | null> => {
    if (!options.getUserId) return null;
    const userId = await Promise.resolve(options.getUserId(req));
    return userId === 'anonymous' ? null : userId;
};

// ---------------------------------------------------------------------------
// SQLite (better-sqlite3) â€” sÃ­ncrono, linhas normalizadas pra bater com o shape
// que o driver `pg` jÃ¡ devolve (JSONB auto-parseado, boolean nativo).
// ---------------------------------------------------------------------------

export const normalizeSqliteRow = (row: Record<string, unknown> | undefined): ThemeRow | undefined => {
    if (!row) return undefined;
    const normalized: Record<string, unknown> = { ...row };
    for (const col of GRANULAR_COLUMNS) {
        const raw = normalized[col];
        normalized[col] = typeof raw === 'string' ? JSON.parse(raw) : raw ?? {};
    }
    normalized.is_public = Boolean(normalized.is_public);
    normalized.is_active = Boolean(normalized.is_active);
    return normalized as ThemeRow;
};

const getSqliteActiveTheme = (db: Database.Database, system: string, userId: string | null): ThemeRow | undefined => {
    const row = userId
        ? db
              .prepare('SELECT * FROM ui_core_custom_themes WHERE system = ? AND is_active = 1 AND owner_id = ?')
              .get(system, userId)
        : db
              .prepare('SELECT * FROM ui_core_custom_themes WHERE system = ? AND is_active = 1 AND owner_id IS NULL')
              .get(system);
    if (row) return normalizeSqliteRow(row as Record<string, unknown>);
    if (userId) {
        const fallback = db
            .prepare('SELECT * FROM ui_core_custom_themes WHERE system = ? AND is_active = 1 AND owner_id IS NULL')
            .get(system);
        return normalizeSqliteRow(fallback as Record<string, unknown> | undefined);
    }
    return undefined;
};

const handleSqliteGet = (options: DesignApiOptions, system: string, userId: string | null): Response => {
    const db = new Database(options.connectionString);
    try {
        const theme = getSqliteActiveTheme(db, system, userId);
        if (!theme) return jsonResponse({ design: {} });
        return jsonResponse(buildResponseData(theme));
    } finally {
        db.close();
    }
};

const handleSqlitePost = async (
    options: DesignApiOptions,
    system: string,
    userId: string | null,
    req: Request,
): Promise<Response> => {
    const db = new Database(options.connectionString);
    try {
        const body = (await req.json()) as { design?: Record<string, unknown> };
        const updateDesign = body.design || {};

        let theme = getSqliteActiveTheme(db, system, userId);
        let themeId: string;

        if (!theme) {
            themeId = randomUUID();
            db.prepare(
                'INSERT INTO ui_core_custom_themes (id, name, system, owner_id, is_active) VALUES (?, ?, ?, ?, 1)',
            ).run(themeId, 'Personalizado', system, userId);
        } else {
            themeId = theme.id;
        }

        const updates = mergeUpdates(updateDesign, theme ?? {});
        if (Object.keys(updates).length > 0) {
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
        }

        const finalRow = db.prepare('SELECT * FROM ui_core_custom_themes WHERE id = ?').get(themeId);
        const finalTheme = normalizeSqliteRow(finalRow as Record<string, unknown>) as ThemeRow;
        return jsonResponse(buildResponseData(finalTheme));
    } finally {
        db.close();
    }
};

/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js. Detecta o
 * dialeto (Postgres/SQLite) pela `connectionString` (Spec 08 Â§2 â€” zero-config).
 */
export function createDesignApiHandler(options: DesignApiOptions) {
    const system = options.systemName || 'global';
    const dialect = resolveDialect(options.connectionString);

    return {
        async GET(req: Request) {
            const userId = await resolveUserId(options, req);
            if (dialect === 'sqlite') {
                try {
                    return handleSqliteGet(options, system, userId);
                } catch (err) {
                    console.error('[Sarak-UI-Core/bridge-node] GET Error (SQLite):', err);
                    return jsonResponse({ error: 'Internal Server Error' }, 500);
                }
            }

            const client = new Client({ connectionString: options.connectionString });
            try {
                await client.connect();

                let query = `SELECT * FROM "ui_core"."custom_themes" WHERE system = $1 AND is_active = true`;
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
                        `SELECT * FROM "ui_core"."custom_themes" WHERE system = $1 AND is_active = true AND owner_id IS NULL LIMIT 1`,
                        [system],
                    );
                }

                if (res.rowCount === 0) return jsonResponse({ design: {} });

                return jsonResponse(buildResponseData(res.rows[0] as ThemeRow));
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] GET Error:', err);
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
                    console.error('[Sarak-UI-Core/bridge-node] POST Error (SQLite):', err);
                    return jsonResponse({ error: 'Internal Server Error' }, 500);
                }
            }

            const client = new Client({ connectionString: options.connectionString });
            try {
                await client.connect();

                const body = await req.json();
                const updateDesign = body.design || {};

                let query = `SELECT * FROM "ui_core"."custom_themes" WHERE system = $1 AND is_active = true`;
                const params: unknown[] = [system];
                if (userId) {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                query += ` LIMIT 1`;

                const res = await client.query(query, params);

                let themeId: string;
                let currentTheme: Partial<ThemeRow> = {};

                if (res.rowCount === 0) {
                    const insertRes = await client.query(
                        `INSERT INTO "ui_core"."custom_themes" (name, system, owner_id, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
                        ['Personalizado', system, userId],
                    );
                    themeId = insertRes.rows[0].id;
                } else {
                    themeId = res.rows[0].id;
                    currentTheme = res.rows[0];
                }

                const updates = mergeUpdates(updateDesign, currentTheme);

                if (Object.keys(updates).length > 0) {
                    const setClauses: string[] = [];
                    const updateParams: unknown[] = [];
                    let pIdx = 1;

                    for (const [col, val] of Object.entries(updates)) {
                        setClauses.push(`${col} = $${pIdx}`);
                        updateParams.push(typeof val === 'object' ? JSON.stringify(val) : val);
                        pIdx++;
                    }

                    updateParams.push(themeId);
                    const updateQuery = `UPDATE "ui_core"."custom_themes" SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${pIdx}`;
                    await client.query(updateQuery, updateParams);
                }

                const finalRes = await client.query(`SELECT * FROM "ui_core"."custom_themes" WHERE id = $1`, [themeId]);
                return jsonResponse(buildResponseData(finalRes.rows[0] as ThemeRow));
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] POST Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            } finally {
                await client.end();
            }
        }
    };
}
