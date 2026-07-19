/**
 * API de Temas Nomeados do Design Engine (Spec 01 ↔ Spec 08 §3.1) — ORQUESTRADOR
 * sobre a porta `UIStorageAdapter` (Spec 19). O frontend (`useThemeActions`) fala
 * com TRÊS rotas:
 *   POST {base}/themes                → cria tema nomeado ({ design, name, is_active })
 *   PUT  {base}/themes/:id            → atualiza design/nome/ativação do tema
 *   PUT  {base}/themes/:id/activate   → ativa o tema (desativa os demais do escopo)
 */
import { resolveStorage, resolveUserId, type DesignApiOptions } from './options';
import { jsonResponse } from './api';
import { uiThemeToResponse } from './themeColumns';

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

/**
 * Handlers dos temas nomeados. `POST` cria; `PUT` atualiza; `ACTIVATE` ativa —
 * os dois últimos recebem o `themeId` extraído da rota pelo host (Next.js dynamic
 * route ou o middleware Express oficial).
 */
export function createThemesApiHandler(options: DesignApiOptions) {
    const system = options.systemName || 'global';
    const storage = resolveStorage(options);

    const guard = async (operation: () => Promise<Response>): Promise<Response> => {
        try {
            return await operation();
        } catch (err) {
            console.error('[Sarak-UI-Core/bridge-node] Themes Error:', err);
            return jsonResponse({ error: 'Internal Server Error' }, 500);
        }
    };

    return {
        async POST(req: Request): Promise<Response> {
            const userId = await resolveUserId(options, req);
            const body = await readBody(req);
            return guard(async () => {
                const theme = await storage.createTheme(
                    { system, userId },
                    { name: body.name || 'Tema sem nome', design: body.design ?? {}, isActive: Boolean(body.is_active) },
                );
                return jsonResponse(uiThemeToResponse(theme));
            });
        },

        async PUT(req: Request, themeId: string): Promise<Response> {
            const userId = await resolveUserId(options, req);
            const body = await readBody(req);
            return guard(async () => {
                const theme = await storage.updateTheme(
                    { system, userId },
                    themeId,
                    { name: body.name, design: body.design, isActive: body.is_active },
                );
                if (!theme) return jsonResponse({ error: 'Tema não encontrado' }, 404);
                return jsonResponse(uiThemeToResponse(theme));
            });
        },

        async ACTIVATE(req: Request, themeId: string): Promise<Response> {
            const userId = await resolveUserId(options, req);
            return guard(async () => {
                const theme = await storage.activateTheme({ system, userId }, themeId);
                if (!theme) return jsonResponse({ error: 'Tema não encontrado' }, 404);
                return jsonResponse(uiThemeToResponse(theme));
            });
        },
    };
}
