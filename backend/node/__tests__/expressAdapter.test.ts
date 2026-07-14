import { describe, it, expect, afterEach, vi } from 'vitest';
import { rmSync } from 'node:fs';
import { setupUIDatabase } from '../database';
import { createSarakUIExpressMiddleware } from '../expressAdapter';

const tmpPaths: string[] = [];
const tmpPath = (name: string): string => {
    const path = `${__dirname}/${name}`;
    tmpPaths.push(path);
    return path;
};

afterEach(() => {
    while (tmpPaths.length > 0) {
        rmSync(tmpPaths.pop() as string, { force: true });
    }
});

/** Response fake connect-style que captura status/headers/corpo. */
const makeRes = () => {
    const headers: Record<string, string> = {};
    let body = '';
    return {
        statusCode: 200,
        setHeader: (name: string, value: string): void => {
            headers[name.toLowerCase()] = value;
        },
        end: (chunk?: string): void => {
            body = chunk ?? '';
        },
        get headers() {
            return headers;
        },
        get body() {
            return body;
        },
    };
};

describe('createSarakUIExpressMiddleware (Express/connect)', () => {
    it('atende GET /api/ui/design com o contrato do Provider', async () => {
        const path = tmpPath('.tmp-express-get.sqlite');
        await setupUIDatabase(path);
        const middleware = createSarakUIExpressMiddleware({ connectionString: path });

        const res = makeRes();
        const next = vi.fn();
        await middleware({ method: 'GET', url: '/api/ui/design', headers: {} }, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual({ design: {} });
    });

    it('POST /api/ui/design persiste (body já parseado pelo express.json) e GET devolve', async () => {
        const path = tmpPath('.tmp-express-post.sqlite');
        await setupUIDatabase(path);
        const middleware = createSarakUIExpressMiddleware({ connectionString: path });

        const postRes = makeRes();
        await middleware(
            {
                method: 'POST',
                url: '/api/ui/design',
                headers: { 'content-type': 'application/json' },
                body: { design: { mode: 'light', primaryColor: '#123456' } },
            },
            postRes,
            vi.fn(),
        );
        expect(postRes.statusCode).toBe(200);

        const getRes = makeRes();
        await middleware({ method: 'GET', url: '/api/ui/design', headers: {} }, getRes, vi.fn());
        const design = JSON.parse(getRes.body).design as Record<string, unknown>;
        expect(design.mode).toBe('light');
        expect(design.primaryColor).toBe('#123456');
    });

    it('rota fora do basePath segue para o next() sem tocar no response', async () => {
        const path = tmpPath('.tmp-express-next.sqlite');
        const middleware = createSarakUIExpressMiddleware({ connectionString: path });

        const res = makeRes();
        const next = vi.fn();
        await middleware({ method: 'GET', url: '/api/v1/contratos', headers: {} }, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.body).toBe('');
    });

    it('método não suportado responde 405 com Allow', async () => {
        const path = tmpPath('.tmp-express-405.sqlite');
        const middleware = createSarakUIExpressMiddleware({ connectionString: path });

        const res = makeRes();
        await middleware({ method: 'PUT', url: '/api/ui/design', headers: {} }, res, vi.fn());

        expect(res.statusCode).toBe(405);
        expect(res.headers.allow).toBe('GET, POST');
    });

    it('atende o endpoint de branding no mesmo basePath', async () => {
        const path = tmpPath('.tmp-express-branding.sqlite');
        await setupUIDatabase(path);
        const middleware = createSarakUIExpressMiddleware({ connectionString: path });

        const res = makeRes();
        await middleware({ method: 'GET', url: '/api/ui/branding', headers: {} }, res, vi.fn());
        expect(res.statusCode).toBe(200);
    });
});
