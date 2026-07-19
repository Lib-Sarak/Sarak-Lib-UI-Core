/**
 * Implementação de REFERÊNCIA da `UIStorageAdapter` sobre Postgres (`pg`). Mesmo
 * comportamento que os handlers tinham embutido antes da Spec 19 — só passou a
 * viver atrás da porta, com `schema` configurável em vez de fixo `"ui_core"`.
 */
import { Client } from 'pg';
import { DEFAULT_PG_SCHEMA } from '../schema';
import { mergeUpdates, rowToUITheme, type ThemeRow } from '../themeColumns';
import { rowToUIBranding, brandingInputToDbFields, type BrandingRow } from '../brandingColumns';
import { qualifyTable } from './postgresQueries';
import type {
    UIStorageAdapter,
    UIStorageScope,
    UITheme,
    UIThemeCreateInput,
    UIThemeUpdateInput,
    UIBranding,
} from '../storageAdapter';

export interface PostgresStorageAdapterOptions {
    connectionString: string;
    schema?: string;
}

export function createPostgresStorageAdapter(options: PostgresStorageAdapterOptions): UIStorageAdapter {
    const schema = options.schema ?? DEFAULT_PG_SCHEMA;
    const themesTable = qualifyTable(schema, 'custom_themes');
    const brandingTable = qualifyTable(schema, 'system_branding');
    const connectionString = options.connectionString;

    const withClient = async <T>(fn: (client: Client) => Promise<T>): Promise<T> => {
        const client = new Client({ connectionString });
        try {
            await client.connect();
            return await fn(client);
        } finally {
            await client.end();
        }
    };

    const findActiveThemeRow = async (client: Client, system: string, userId: string | null): Promise<ThemeRow | undefined> => {
        let query = `SELECT * FROM ${themesTable} WHERE system = $1 AND is_active = true`;
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
                `SELECT * FROM ${themesTable} WHERE system = $1 AND is_active = true AND owner_id IS NULL LIMIT 1`,
                [system],
            );
        }
        return res.rowCount === 0 ? undefined : (res.rows[0] as ThemeRow);
    };

    const deactivateScope = async (client: Client, system: string, userId: string | null): Promise<void> => {
        if (userId) {
            await client.query(`UPDATE ${themesTable} SET is_active = false WHERE system = $1 AND owner_id = $2`, [system, userId]);
        } else {
            await client.query(`UPDATE ${themesTable} SET is_active = false WHERE system = $1 AND owner_id IS NULL`, [system]);
        }
    };

    const applyThemeUpdate = async (
        client: Client,
        themeId: string,
        input: { design?: Record<string, unknown>; name?: string },
    ): Promise<void> => {
        const current = await client.query(`SELECT * FROM ${themesTable} WHERE id = $1`, [themeId]);
        const updates = mergeUpdates(input.design ?? {}, (current.rows[0] ?? {}) as Partial<ThemeRow>);
        if (input.name) updates.name = input.name;
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
        await client.query(`UPDATE ${themesTable} SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, params);
    };

    const readTheme = async (client: Client, themeId: string): Promise<UITheme | null> => {
        const res = await client.query(`SELECT * FROM ${themesTable} WHERE id = $1`, [themeId]);
        return res.rowCount === 0 ? null : rowToUITheme(res.rows[0] as ThemeRow);
    };

    const findBrandingRow = async (client: Client, system: string, userId: string | null): Promise<BrandingRow | undefined> => {
        let query = `SELECT * FROM ${brandingTable} WHERE system = $1`;
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
            res = await client.query(`SELECT * FROM ${brandingTable} WHERE system = $1 AND owner_id IS NULL LIMIT 1`, [system]);
        }
        return res.rowCount === 0 ? undefined : (res.rows[0] as BrandingRow);
    };

    return {
        async getActiveTheme(scope: UIStorageScope): Promise<UITheme | null> {
            return withClient(async (client) => {
                const row = await findActiveThemeRow(client, scope.system, scope.userId);
                return row ? rowToUITheme(row) : null;
            });
        },

        async saveActiveDesign(scope: UIStorageScope, design: Record<string, unknown>): Promise<UITheme> {
            return withClient(async (client) => {
                const theme = await findActiveThemeRow(client, scope.system, scope.userId);
                let themeId: string;
                if (!theme) {
                    const inserted = await client.query(
                        `INSERT INTO ${themesTable} (name, system, owner_id, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
                        ['Personalizado', scope.system, scope.userId],
                    );
                    themeId = inserted.rows[0].id as string;
                } else {
                    themeId = theme.id;
                }

                const updates = mergeUpdates(design, theme ?? {});
                if (Object.keys(updates).length > 0) {
                    const setClauses: string[] = [];
                    const params: unknown[] = [];
                    let idx = 1;
                    for (const [col, val] of Object.entries(updates)) {
                        setClauses.push(`${col} = $${idx}`);
                        params.push(typeof val === 'object' ? JSON.stringify(val) : val);
                        idx++;
                    }
                    params.push(themeId);
                    await client.query(`UPDATE ${themesTable} SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, params);
                }

                return readTheme(client, themeId) as Promise<UITheme>;
            });
        },

        async createTheme(scope: UIStorageScope, input: UIThemeCreateInput): Promise<UITheme> {
            return withClient(async (client) => {
                if (input.isActive) await deactivateScope(client, scope.system, scope.userId);
                const inserted = await client.query(
                    `INSERT INTO ${themesTable} (name, system, owner_id, is_active) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [input.name || 'Tema sem nome', scope.system, scope.userId, Boolean(input.isActive)],
                );
                const themeId = inserted.rows[0].id as string;
                await applyThemeUpdate(client, themeId, { design: input.design, name: input.name });
                return readTheme(client, themeId) as Promise<UITheme>;
            });
        },

        async updateTheme(scope: UIStorageScope, themeId: string, input: UIThemeUpdateInput): Promise<UITheme | null> {
            return withClient(async (client) => {
                const exists = await client.query(`SELECT id FROM ${themesTable} WHERE id = $1`, [themeId]);
                if (exists.rowCount === 0) return null;
                if (input.isActive) {
                    await deactivateScope(client, scope.system, scope.userId);
                    await client.query(`UPDATE ${themesTable} SET is_active = true WHERE id = $1`, [themeId]);
                }
                await applyThemeUpdate(client, themeId, { design: input.design, name: input.name });
                return readTheme(client, themeId);
            });
        },

        async activateTheme(scope: UIStorageScope, themeId: string): Promise<UITheme | null> {
            return withClient(async (client) => {
                const exists = await client.query(`SELECT id FROM ${themesTable} WHERE id = $1`, [themeId]);
                if (exists.rowCount === 0) return null;
                await deactivateScope(client, scope.system, scope.userId);
                await client.query(`UPDATE ${themesTable} SET is_active = true, updated_at = NOW() WHERE id = $1`, [themeId]);
                return readTheme(client, themeId);
            });
        },

        async getBranding(scope: UIStorageScope): Promise<UIBranding | null> {
            return withClient(async (client) => {
                const row = await findBrandingRow(client, scope.system, scope.userId);
                return row ? rowToUIBranding(row) : null;
            });
        },

        async saveBranding(scope: UIStorageScope, branding: Record<string, unknown>): Promise<UIBranding> {
            return withClient(async (client) => {
                const dbData = brandingInputToDbFields(branding);
                let query = `SELECT id FROM ${brandingTable} WHERE system = $1`;
                const params: unknown[] = [scope.system];
                if (scope.userId) {
                    query += ` AND owner_id = $2`;
                    params.push(scope.userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                query += ` LIMIT 1`;

                const res = await client.query(query, params);
                let recordId: string;

                if (res.rowCount === 0) {
                    const inserted = await client.query(
                        `INSERT INTO ${brandingTable} (system, owner_id, company_name, login_name, tab_name, logo_base64) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                        [
                            scope.system,
                            scope.userId,
                            dbData.company_name || 'Sarak OS',
                            dbData.login_name || 'Acesso ao Sistema',
                            dbData.tab_name || 'Sarak OS',
                            dbData.logo_base64 || null,
                        ],
                    );
                    recordId = inserted.rows[0].id as string;
                } else {
                    recordId = res.rows[0].id as string;
                    const setClauses: string[] = [];
                    const updateParams: unknown[] = [];
                    let idx = 1;
                    for (const [col, val] of Object.entries(dbData)) {
                        setClauses.push(`${col} = $${idx}`);
                        updateParams.push(val);
                        idx++;
                    }
                    if (setClauses.length > 0) {
                        updateParams.push(recordId);
                        await client.query(`UPDATE ${brandingTable} SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, updateParams);
                    }
                }

                const finalRes = await client.query(`SELECT * FROM ${brandingTable} WHERE id = $1`, [recordId]);
                return rowToUIBranding(finalRes.rows[0] as BrandingRow);
            });
        },
    };
}
