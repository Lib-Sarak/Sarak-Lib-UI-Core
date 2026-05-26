import { Client } from 'pg';
import ThemeMappingRaw from '../../src/core/Design/catalog/theme_table_mapping.json';
const ThemeMapping: Record<string, string[]> = ThemeMappingRaw;

export interface DesignApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}

const GRANULAR_COLUMNS = [
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

/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js.
 */
export function createDesignApiHandler(options: DesignApiOptions) {
    const system = options.systemName || 'global';

    return {
        async GET(req: Request) {
            const client = new Client({ connectionString: options.connectionString });
            try {
                await client.connect();
                
                let userId: string | null = null;
                if (options.getUserId) {
                    userId = await Promise.resolve(options.getUserId(req));
                }

                // Busca o tema ativo
                let query = `SELECT * FROM "ui_core"."custom_themes" WHERE system = $1 AND is_active = true`;
                const params: any[] = [system];
                
                if (userId && userId !== "anonymous") {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                
                query += ` LIMIT 1`;

                let res = await client.query(query, params);
                
                // Fallback global se o usuário não tiver tema
                if (res.rowCount === 0 && userId && userId !== "anonymous") {
                    res = await client.query(`SELECT * FROM "ui_core"."custom_themes" WHERE system = $1 AND is_active = true AND owner_id IS NULL LIMIT 1`, [system]);
                }

                if (res.rowCount === 0) {
                    return new Response(JSON.stringify({ design: {} }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                const theme = res.rows[0];
                
                // Flattening (Merge de todas as colunas JSONB + Top-Level)
                const designFlat: any = {};
                for (const col of TOP_LEVEL_COLUMNS) {
                    if (theme[col] !== undefined && theme[col] !== null) designFlat[col] = theme[col];
                }
                for (const col of GRANULAR_COLUMNS) {
                    if (theme[col] && typeof theme[col] === 'object') {
                        Object.assign(designFlat, theme[col]);
                    }
                }

                const responseData = {
                    id: theme.id,
                    name: theme.name,
                    description: theme.description,
                    system: theme.system,
                    owner_id: theme.owner_id,
                    is_public: theme.is_public,
                    is_active: theme.is_active,
                    design: designFlat
                };

                return new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                console.error("[Sarak-UI-Core/bridge-node] GET Error:", err);
                return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
            } finally {
                await client.end();
            }
        },

        async POST(req: Request) {
            const client = new Client({ connectionString: options.connectionString });
            try {
                await client.connect();

                let userId: string | null = null;
                if (options.getUserId) {
                    userId = await Promise.resolve(options.getUserId(req));
                }
                if (userId === "anonymous") userId = null;

                const body = await req.json();
                const updateDesign = body.design || {};

                // 1. Busca o tema ativo atual
                let query = `SELECT * FROM "ui_core"."custom_themes" WHERE system = $1 AND is_active = true`;
                const params: any[] = [system];
                if (userId) {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                query += ` LIMIT 1`;

                let res = await client.query(query, params);
                
                let themeId;
                let currentTheme: any = {};
                
                if (res.rowCount === 0) {
                    // Cria um novo tema ativo
                    const insertRes = await client.query(
                        `INSERT INTO "ui_core"."custom_themes" (name, system, owner_id, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
                        ['Personalizado', system, userId]
                    );
                    themeId = insertRes.rows[0].id;
                } else {
                    themeId = res.rows[0].id;
                    currentTheme = res.rows[0];
                }

                // 2. Merge de campos novos
                const updates: Record<string, any> = {};
                
                const granularData: Record<string, any> = {};
                for (const col of GRANULAR_COLUMNS) {
                    granularData[col] = currentTheme[col] || {};
                }

                for (const [key, value] of Object.entries(updateDesign)) {
                    if (TOP_LEVEL_COLUMNS.includes(key)) {
                        updates[key] = value;
                    } else if (GRANULAR_COLUMNS.includes(key)) {
                        // Se mandaram um jsonb granular inteiro
                        updates[key] = value;
                    } else {
                        // Descobrir a qual coluna pertence usando o mapeamento
                        let foundCol = 'branding_config'; // fallback
                        for (const [col, fields] of Object.entries(ThemeMapping)) {
                            if (fields.includes(key) && GRANULAR_COLUMNS.includes(col)) {
                                foundCol = col;
                                break;
                            }
                        }
                        granularData[foundCol][key] = value;
                    }
                }
                
                // Aplicar todos os objetos granulares ao updates
                for (const col of GRANULAR_COLUMNS) {
                    updates[col] = granularData[col];
                }

                if (Object.keys(updates).length > 0) {
                    const setClauses: string[] = [];
                    const updateParams: any[] = [];
                    let pIdx = 1;

                    for (const [col, val] of Object.entries(updates)) {
                        setClauses.push(`${col} = $${pIdx}`);
                        // Se for json/objeto, usamos JSON string (o pg/postgres cuidam do parsing)
                        updateParams.push(typeof val === 'object' ? JSON.stringify(val) : val);
                        pIdx++;
                    }

                    updateParams.push(themeId);
                    const updateQuery = `UPDATE "ui_core"."custom_themes" SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${pIdx}`;
                    
                    await client.query(updateQuery, updateParams);
                }

                // 3. Retornar resposta idêntica ao GET
                const finalRes = await client.query(`SELECT * FROM "ui_core"."custom_themes" WHERE id = $1`, [themeId]);
                const finalTheme = finalRes.rows[0];
                
                const designFlat: any = {};
                for (const col of TOP_LEVEL_COLUMNS) {
                    if (finalTheme[col] !== undefined && finalTheme[col] !== null) designFlat[col] = finalTheme[col];
                }
                for (const col of GRANULAR_COLUMNS) {
                    if (finalTheme[col] && typeof finalTheme[col] === 'object') {
                        Object.assign(designFlat, finalTheme[col]);
                    }
                }

                const responseData = {
                    id: finalTheme.id,
                    name: finalTheme.name,
                    description: finalTheme.description,
                    system: finalTheme.system,
                    owner_id: finalTheme.owner_id,
                    is_public: finalTheme.is_public,
                    is_active: finalTheme.is_active,
                    design: designFlat
                };

                return new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });

            } catch (err) {
                console.error("[Sarak-UI-Core/bridge-node] POST Error:", err);
                return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
            } finally {
                await client.end();
            }
        }
    };
}
