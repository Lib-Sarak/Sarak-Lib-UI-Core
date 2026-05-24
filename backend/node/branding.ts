import { Client } from 'pg';

export interface BrandingApiOptions {
    connectionString: string;
    systemName?: string;
    getUserId?: (req: Request) => Promise<string | null> | string | null;
}

export function createBrandingApiHandler(options: BrandingApiOptions) {
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

                let query = `SELECT * FROM "ui_core"."system_branding" WHERE system = $1`;
                const params: any[] = [system];
                
                if (userId && userId !== "anonymous") {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                
                query += ` LIMIT 1`;

                let res = await client.query(query, params);
                
                // Fallback global
                if (res.rowCount === 0 && userId && userId !== "anonymous") {
                    res = await client.query(`SELECT * FROM "ui_core"."system_branding" WHERE system = $1 AND owner_id IS NULL LIMIT 1`, [system]);
                }

                if (res.rowCount === 0) {
                    return new Response(JSON.stringify({ branding: {} }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                const row = res.rows[0];
                return new Response(JSON.stringify({
                    branding: {
                        companyName: row.company_name,
                        loginName: row.login_name,
                        tabName: row.tab_name,
                        logoBase64: row.logo_base64
                    }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                console.error("[Sarak-UI-Core/bridge-node] Branding GET Error:", err);
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
                const updateData = body.branding || {};

                // Tratar conversão do camelCase do front para snake_case do banco
                const dbData: any = {};
                if (updateData.companyName !== undefined) dbData.company_name = updateData.companyName;
                if (updateData.loginName !== undefined) dbData.login_name = updateData.loginName;
                if (updateData.tabName !== undefined) dbData.tab_name = updateData.tabName;
                if (updateData.logoBase64 !== undefined) dbData.logo_base64 = updateData.logoBase64;

                let query = `SELECT id FROM "ui_core"."system_branding" WHERE system = $1`;
                const params: any[] = [system];
                if (userId) {
                    query += ` AND owner_id = $2`;
                    params.push(userId);
                } else {
                    query += ` AND owner_id IS NULL`;
                }
                query += ` LIMIT 1`;

                const res = await client.query(query, params);
                
                if (res.rowCount === 0) {
                    // CREATE
                    await client.query(
                        `INSERT INTO "ui_core"."system_branding" (system, owner_id, company_name, login_name, tab_name, logo_base64) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [system, userId, dbData.company_name || 'Sarak OS', dbData.login_name || 'Acesso ao Sistema', dbData.tab_name || 'Sarak OS', dbData.logo_base64 || null]
                    );
                } else {
                    // UPDATE
                    const recordId = res.rows[0].id;
                    const setClauses: string[] = [];
                    const updateParams: any[] = [];
                    let pIdx = 1;

                    for (const [col, val] of Object.entries(dbData)) {
                        setClauses.push(`${col} = $${pIdx}`);
                        updateParams.push(val);
                        pIdx++;
                    }

                    if (setClauses.length > 0) {
                        updateParams.push(recordId);
                        await client.query(`UPDATE "ui_core"."system_branding" SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${pIdx}`, updateParams);
                    }
                }

                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });

            } catch (err) {
                console.error("[Sarak-UI-Core/bridge-node] Branding POST Error:", err);
                return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
            } finally {
                await client.end();
            }
        }
    };
}
