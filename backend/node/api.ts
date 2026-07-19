/**
 * Handler HTTP (`GET`/`POST` `{base}/design`) — ORQUESTRADOR sobre a porta
 * `UIStorageAdapter` (Spec 19). Não fala mais SQL diretamente: resolve o adapter
 * (custom via `storage` ou de referência pg/sqlite via `connectionString`) e traduz
 * Request/Response Web ↔ chamadas da porta. `jsonResponse`/`resolveUserId` seguem
 * exportados daqui por compatibilidade histórica (reusados por `themes.ts`).
 */
import { resolveStorage, resolveUserId, type DesignApiOptions } from './options';
import { uiThemeToResponse } from './themeColumns';

export type { DesignApiOptions } from './options';
export { resolveUserId } from './options';

export const jsonResponse = (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const readDesignBody = async (req: Request): Promise<{ design?: Record<string, unknown> }> => {
    try {
        return ((await req.json()) ?? {}) as { design?: Record<string, unknown> };
    } catch {
        return {};
    }
};

/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js.
 * `options.storage` (adapter custom) OU `options.connectionString` (adapter de
 * referência, dialeto auto-detectado — Spec 08 §2 zero-config) — nunca os dois.
 */
export function createDesignApiHandler(options: DesignApiOptions) {
    const system = options.systemName || 'global';
    const storage = resolveStorage(options);

    return {
        async GET(req: Request) {
            const userId = await resolveUserId(options, req);
            try {
                const theme = await storage.getActiveTheme({ system, userId });
                if (!theme) return jsonResponse({ design: {} });
                return jsonResponse(uiThemeToResponse(theme));
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] GET Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            }
        },

        async POST(req: Request) {
            const userId = await resolveUserId(options, req);
            try {
                const body = await readDesignBody(req);
                const theme = await storage.saveActiveDesign({ system, userId }, body.design || {});
                return jsonResponse(uiThemeToResponse(theme));
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] POST Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            }
        },
    };
}
