/**
 * Handler HTTP (`GET`/`POST` `{base}/branding`) — ORQUESTRADOR sobre a porta
 * `UIStorageAdapter` (Spec 19). Ver `api.ts` para a mesma lógica no design.
 */
import { resolveStorage, resolveUserId, type DesignApiOptions } from './options';
import { jsonResponse } from './api';

export type BrandingApiOptions = DesignApiOptions;

const readBrandingBody = async (req: Request): Promise<{ branding?: Record<string, unknown> }> => {
    try {
        return ((await req.json()) ?? {}) as { branding?: Record<string, unknown> };
    } catch {
        return {};
    }
};

/**
 * Retorna os Handlers (GET/POST) prontos para o App Router do Next.js.
 * `options.storage` (adapter custom) OU `options.connectionString` (adapter de
 * referência, dialeto auto-detectado — Spec 08 §2 zero-config) — nunca os dois.
 */
export function createBrandingApiHandler(options: BrandingApiOptions) {
    const system = options.systemName || 'global';
    const storage = resolveStorage(options);

    return {
        async GET(req: Request) {
            const userId = await resolveUserId(options, req);
            try {
                const branding = await storage.getBranding({ system, userId });
                return jsonResponse({ branding: branding ?? {} });
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] Branding GET Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            }
        },

        async POST(req: Request) {
            const userId = await resolveUserId(options, req);
            try {
                const body = await readBrandingBody(req);
                await storage.saveBranding({ system, userId }, body.branding || {});
                return jsonResponse({ success: true });
            } catch (err) {
                console.error('[Sarak-UI-Core/bridge-node] Branding POST Error:', err);
                return jsonResponse({ error: 'Internal Server Error' }, 500);
            }
        },
    };
}
