/**
 * Adaptador Express/Connect da persistência de UI (Spec 08 §3.1 — Instalação Completa).
 *
 * Os handlers oficiais (`createDesignApiHandler`/`createBrandingApiHandler`) falam o
 * padrão Web (`Request`/`Response`, formato App Router do Next.js). Consumidores
 * Express/Fastify/Node puro usam ESTE adaptador — uma linha:
 *
 *   app.use(createSarakUIExpressMiddleware({ connectionString: './database.sqlite' }));
 *
 * Ele atende `GET/POST <basePath>/design` e `GET/POST <basePath>/branding`
 * (default `/api/ui` — o mesmo `DEFAULT_UI_BASE_URL` que o SarakUIProvider chama),
 * sem depender do pacote `express` (assinatura connect-style estrutural).
 */

import { createDesignApiHandler, type DesignApiOptions } from './api';
import { createBrandingApiHandler } from './branding';
import { createThemesApiHandler } from './themes';

/** Forma mínima do request Node/Express (estrutural — sem dependência de tipos). */
interface NodeRequestLike {
    method?: string;
    url?: string;
    originalUrl?: string;
    headers: Record<string, string | string[] | undefined>;
    /** Corpo já parseado por `express.json()`; ausente em GET. */
    body?: unknown;
}

/** Forma mínima do response Node/Express. */
interface NodeResponseLike {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(chunk?: string): void;
}

export interface SarakUIMiddlewareOptions extends DesignApiOptions {
    /** Prefixo dos endpoints de UI (default: `/api/ui` — o que o Provider chama). */
    basePath?: string;
}

const DEFAULT_BASE_PATH = '/api/ui';

const toWebHeaders = (headers: NodeRequestLike['headers']): Headers => {
    const out = new Headers();
    for (const [name, value] of Object.entries(headers)) {
        if (value === undefined) continue;
        out.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
    return out;
};

/** Sintetiza o `Request` Web que os handlers oficiais esperam. */
const toWebRequest = (req: NodeRequestLike, path: string, method: string): Request =>
    new Request(`http://sarak.internal${path}`, {
        method,
        headers: toWebHeaders(req.headers),
        // GET/HEAD não aceitam corpo; nos demais, o body já veio parseado do express.json().
        body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {}),
    });

/**
 * Middleware connect-style com os endpoints de persistência do Design Engine.
 * Rotas fora do `basePath` seguem para o próximo handler (`next()`).
 */
/** Rota de temas: `/themes` (POST), `/themes/:id` (PUT), `/themes/:id/activate` (PUT). */
const THEME_ROUTE_RE = /^\/themes(?:\/([^/]+)(\/activate)?)?$/;

export function createSarakUIExpressMiddleware(options: SarakUIMiddlewareOptions) {
    const basePath = options.basePath ?? DEFAULT_BASE_PATH;
    const design = createDesignApiHandler(options);
    const branding = createBrandingApiHandler(options);
    const themes = createThemesApiHandler(options);

    const resolveThemesHandler = (
        subPath: string,
        method: string,
    ): ((webReq: Request) => Promise<Response>) | null => {
        const match = subPath.match(THEME_ROUTE_RE);
        if (!match) return null;
        const [, themeId, isActivate] = match;
        if (!themeId) return method === 'POST' ? (webReq) => themes.POST(webReq) : null;
        if (method !== 'PUT') return null;
        return isActivate
            ? (webReq) => themes.ACTIVATE(webReq, themeId)
            : (webReq) => themes.PUT(webReq, themeId);
    };

    return async (req: NodeRequestLike, res: NodeResponseLike, next: () => void): Promise<void> => {
        const path = (req.originalUrl ?? req.url ?? '').split('?')[0];
        if (!path.startsWith(basePath)) return next();

        const subPath = path.slice(basePath.length) || '/';
        const method = (req.method ?? 'GET').toUpperCase();

        let handler: ((webReq: Request) => Promise<Response>) | null = null;
        const pair = subPath === '/design' ? design : subPath === '/branding' ? branding : null;
        if (pair) {
            const selected = method === 'GET' ? pair.GET : method === 'POST' ? pair.POST : null;
            if (!selected) {
                res.statusCode = 405;
                res.setHeader('Allow', 'GET, POST');
                res.end();
                return;
            }
            handler = (webReq) => selected(webReq);
        } else {
            handler = resolveThemesHandler(subPath, method);
        }
        if (!handler) return next();

        const webResponse = await handler(toWebRequest(req, path, method));
        res.statusCode = webResponse.status;
        webResponse.headers.forEach((value, name) => res.setHeader(name, value));
        res.end(await webResponse.text());
    };
}
