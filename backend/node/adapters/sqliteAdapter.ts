/**
 * Implementação de REFERÊNCIA da `UIStorageAdapter` sobre SQLite (`better-sqlite3`).
 * Mesmo comportamento que os handlers tinham embutido antes da Spec 19 — só passou
 * a viver atrás da porta, com `tablePrefix` configurável em vez de fixo `ui_core_`.
 */
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { sanitizeIdentifier } from '../identifiers';
import { DEFAULT_TABLE_PREFIX } from '../schema.sqlite';
import { GRANULAR_COLUMNS, mergeUpdates, rowToUITheme, type ThemeRow } from '../themeColumns';
import { rowToUIBranding, brandingInputToDbFields, type BrandingRow } from '../brandingColumns';
import type {
    UIStorageAdapter,
    UIStorageScope,
    UITheme,
    UIThemeCreateInput,
    UIThemeUpdateInput,
    UIBranding,
} from '../storageAdapter';

export interface SqliteStorageAdapterOptions {
    connectionString: string;
    tablePrefix?: string;
}

const normalizeRow = (row: Record<string, unknown> | undefined): ThemeRow | undefined => {
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

export function createSqliteStorageAdapter(options: SqliteStorageAdapterOptions): UIStorageAdapter {
    const prefix = sanitizeIdentifier(options.tablePrefix ?? DEFAULT_TABLE_PREFIX, 'tablePrefix');
    const themesTable = `${prefix}custom_themes`;
    const brandingTable = `${prefix}system_branding`;
    const connectionString = options.connectionString;

    const withDb = <T>(fn: (db: Database.Database) => T): T => {
        const db = new Database(connectionString);
        try {
            return fn(db);
        } finally {
            db.close();
        }
    };

    const findActiveThemeRow = (db: Database.Database, system: string, userId: string | null): ThemeRow | undefined => {
        const row = userId
            ? db.prepare(`SELECT * FROM ${themesTable} WHERE system = ? AND is_active = 1 AND owner_id = ?`).get(system, userId)
            : db.prepare(`SELECT * FROM ${themesTable} WHERE system = ? AND is_active = 1 AND owner_id IS NULL`).get(system);
        if (row) return normalizeRow(row as Record<string, unknown>);
        if (userId) {
            const fallback = db
                .prepare(`SELECT * FROM ${themesTable} WHERE system = ? AND is_active = 1 AND owner_id IS NULL`)
                .get(system);
            return normalizeRow(fallback as Record<string, unknown> | undefined);
        }
        return undefined;
    };

    const deactivateScope = (db: Database.Database, system: string, userId: string | null): void => {
        if (userId) {
            db.prepare(`UPDATE ${themesTable} SET is_active = 0 WHERE system = ? AND owner_id = ?`).run(system, userId);
        } else {
            db.prepare(`UPDATE ${themesTable} SET is_active = 0 WHERE system = ? AND owner_id IS NULL`).run(system);
        }
    };

    const applyThemeUpdate = (
        db: Database.Database,
        themeId: string,
        input: { design?: Record<string, unknown>; name?: string },
    ): void => {
        const current = normalizeRow(db.prepare(`SELECT * FROM ${themesTable} WHERE id = ?`).get(themeId) as Record<string, unknown>);
        const updates = mergeUpdates(input.design ?? {}, current ?? {});
        if (input.name) updates.name = input.name;
        if (Object.keys(updates).length === 0) return;

        const setClauses: string[] = [];
        const params: unknown[] = [];
        for (const [col, val] of Object.entries(updates)) {
            setClauses.push(`${col} = ?`);
            params.push(typeof val === 'object' ? JSON.stringify(val) : val);
        }
        params.push(themeId);
        db.prepare(`UPDATE ${themesTable} SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
    };

    const readTheme = (db: Database.Database, themeId: string): UITheme | null => {
        const row = normalizeRow(db.prepare(`SELECT * FROM ${themesTable} WHERE id = ?`).get(themeId) as Record<string, unknown>);
        return row ? rowToUITheme(row) : null;
    };

    const findBrandingRow = (db: Database.Database, system: string, userId: string | null): BrandingRow | undefined => {
        const row = userId
            ? db.prepare(`SELECT * FROM ${brandingTable} WHERE system = ? AND owner_id = ?`).get(system, userId)
            : db.prepare(`SELECT * FROM ${brandingTable} WHERE system = ? AND owner_id IS NULL`).get(system);
        if (row) return row as BrandingRow;
        if (userId) {
            return db.prepare(`SELECT * FROM ${brandingTable} WHERE system = ? AND owner_id IS NULL`).get(system) as
                | BrandingRow
                | undefined;
        }
        return undefined;
    };

    return {
        async getActiveTheme(scope: UIStorageScope): Promise<UITheme | null> {
            return withDb((db) => {
                const row = findActiveThemeRow(db, scope.system, scope.userId);
                return row ? rowToUITheme(row) : null;
            });
        },

        async saveActiveDesign(scope: UIStorageScope, design: Record<string, unknown>): Promise<UITheme> {
            return withDb((db) => {
                const theme = findActiveThemeRow(db, scope.system, scope.userId);
                let themeId: string;
                if (!theme) {
                    themeId = randomUUID();
                    db.prepare(`INSERT INTO ${themesTable} (id, name, system, owner_id, is_active) VALUES (?, ?, ?, ?, 1)`).run(
                        themeId,
                        'Personalizado',
                        scope.system,
                        scope.userId,
                    );
                } else {
                    themeId = theme.id;
                }
                const updates = mergeUpdates(design, theme ?? {});
                if (Object.keys(updates).length > 0) {
                    const setClauses: string[] = [];
                    const params: unknown[] = [];
                    for (const [col, val] of Object.entries(updates)) {
                        setClauses.push(`${col} = ?`);
                        params.push(typeof val === 'object' ? JSON.stringify(val) : val);
                    }
                    params.push(themeId);
                    db.prepare(`UPDATE ${themesTable} SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
                        ...params,
                    );
                }
                return readTheme(db, themeId) as UITheme;
            });
        },

        async createTheme(scope: UIStorageScope, input: UIThemeCreateInput): Promise<UITheme> {
            return withDb((db) => {
                const themeId = randomUUID();
                if (input.isActive) deactivateScope(db, scope.system, scope.userId);
                db.prepare(`INSERT INTO ${themesTable} (id, name, system, owner_id, is_active) VALUES (?, ?, ?, ?, ?)`).run(
                    themeId,
                    input.name || 'Tema sem nome',
                    scope.system,
                    scope.userId,
                    input.isActive ? 1 : 0,
                );
                applyThemeUpdate(db, themeId, { design: input.design, name: input.name });
                return readTheme(db, themeId) as UITheme;
            });
        },

        async updateTheme(scope: UIStorageScope, themeId: string, input: UIThemeUpdateInput): Promise<UITheme | null> {
            return withDb((db) => {
                const exists = db.prepare(`SELECT id FROM ${themesTable} WHERE id = ?`).get(themeId);
                if (!exists) return null;
                if (input.isActive) {
                    deactivateScope(db, scope.system, scope.userId);
                    db.prepare(`UPDATE ${themesTable} SET is_active = 1 WHERE id = ?`).run(themeId);
                }
                applyThemeUpdate(db, themeId, { design: input.design, name: input.name });
                return readTheme(db, themeId);
            });
        },

        async activateTheme(scope: UIStorageScope, themeId: string): Promise<UITheme | null> {
            return withDb((db) => {
                const exists = db.prepare(`SELECT id FROM ${themesTable} WHERE id = ?`).get(themeId);
                if (!exists) return null;
                deactivateScope(db, scope.system, scope.userId);
                db.prepare(`UPDATE ${themesTable} SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(themeId);
                return readTheme(db, themeId);
            });
        },

        async getBranding(scope: UIStorageScope): Promise<UIBranding | null> {
            return withDb((db) => {
                const row = findBrandingRow(db, scope.system, scope.userId);
                return row ? rowToUIBranding(row) : null;
            });
        },

        async saveBranding(scope: UIStorageScope, branding: Record<string, unknown>): Promise<UIBranding> {
            return withDb((db) => {
                const dbData = brandingInputToDbFields(branding);
                const existing = scope.userId
                    ? db.prepare(`SELECT id FROM ${brandingTable} WHERE system = ? AND owner_id = ?`).get(scope.system, scope.userId)
                    : db.prepare(`SELECT id FROM ${brandingTable} WHERE system = ? AND owner_id IS NULL`).get(scope.system);

                let recordId: string;
                if (!existing) {
                    recordId = randomUUID();
                    db.prepare(
                        `INSERT INTO ${brandingTable} (id, system, owner_id, company_name, login_name, tab_name, logo_base64) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ).run(
                        recordId,
                        scope.system,
                        scope.userId,
                        (dbData.company_name as string) || 'Sarak OS',
                        (dbData.login_name as string) || 'Acesso ao Sistema',
                        (dbData.tab_name as string) || 'Sarak OS',
                        (dbData.logo_base64 as string) || null,
                    );
                } else {
                    recordId = (existing as { id: string }).id;
                    const setClauses: string[] = [];
                    const params: unknown[] = [];
                    for (const [col, val] of Object.entries(dbData)) {
                        setClauses.push(`${col} = ?`);
                        params.push(val);
                    }
                    if (setClauses.length > 0) {
                        params.push(recordId);
                        db.prepare(`UPDATE ${brandingTable} SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
                            ...params,
                        );
                    }
                }

                const row = db.prepare(`SELECT * FROM ${brandingTable} WHERE id = ?`).get(recordId) as BrandingRow;
                return rowToUIBranding(row);
            });
        },
    };
}
