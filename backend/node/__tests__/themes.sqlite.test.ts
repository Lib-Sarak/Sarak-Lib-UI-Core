import { describe, it, expect, afterEach, vi } from 'vitest';
import { rmSync } from 'node:fs';
import { setupUIDatabase } from '../database';
import { createThemesApiHandler } from '../themes';
import { createDesignApiHandler } from '../api';
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

const postRequest = (body: unknown): Request =>
    new Request('http://local/api/ui/themes', { method: 'POST', body: JSON.stringify(body) });

describe('createThemesApiHandler (SQLite) — contrato do useThemeActions', () => {
    it('POST cria tema nomeado e devolve { id, name, design }', async () => {
        const path = tmpPath('.tmp-themes-post.sqlite');
        await setupUIDatabase(path);
        const { POST } = createThemesApiHandler({ connectionString: path });

        const res = await POST(postRequest({ name: 'Meu Tema', design: { mode: 'light', primaryColor: '#ff0000' }, is_active: false }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.id).toBeTruthy();
        expect(body.name).toBe('Meu Tema');
        expect(body.is_active).toBe(false);
        expect(body.design.primaryColor).toBe('#ff0000');
    });

    it('POST com is_active=true desativa o tema ativo anterior do escopo', async () => {
        const path = tmpPath('.tmp-themes-active.sqlite');
        await setupUIDatabase(path);
        const { POST } = createThemesApiHandler({ connectionString: path });
        const design = createDesignApiHandler({ connectionString: path });

        // Tema ativo pré-existente (criado pelo fluxo de design).
        await design.POST(
            new Request('http://local/api/ui/design', { method: 'POST', body: JSON.stringify({ design: { mode: 'dark' } }) }),
        );

        const res = await POST(postRequest({ name: 'Novo Ativo', design: { mode: 'light' }, is_active: true }));
        const created = await res.json();
        expect(created.is_active).toBe(true);

        // O GET de design (tema ativo) devolve o NOVO tema.
        const activeRes = await design.GET(new Request('http://local/api/ui/design'));
        const active = await activeRes.json();
        expect(active.id).toBe(created.id);
    });

    it('PUT atualiza nome/design e ACTIVATE troca o ativo', async () => {
        const path = tmpPath('.tmp-themes-put.sqlite');
        await setupUIDatabase(path);
        const { POST, PUT, ACTIVATE } = createThemesApiHandler({ connectionString: path });

        const a = await (await POST(postRequest({ name: 'A', design: { mode: 'dark' }, is_active: true }))).json();
        const b = await (await POST(postRequest({ name: 'B', design: { mode: 'light' }, is_active: false }))).json();

        const updated = await (
            await PUT(
                new Request('http://local/x', { method: 'PUT', body: JSON.stringify({ name: 'B2', design: { primaryColor: '#00ff00' } }) }),
                b.id,
            )
        ).json();
        expect(updated.name).toBe('B2');
        expect(updated.design.primaryColor).toBe('#00ff00');

        const activated = await (await ACTIVATE(new Request('http://local/x', { method: 'PUT' }), b.id)).json();
        expect(activated.is_active).toBe(true);

        // A perdeu a ativação.
        const aAfter = await (
            await PUT(new Request('http://local/x', { method: 'PUT', body: JSON.stringify({}) }), a.id)
        ).json();
        expect(aAfter.is_active).toBe(false);
    });

    it('PUT/ACTIVATE de id inexistente devolvem 404', async () => {
        const path = tmpPath('.tmp-themes-404.sqlite');
        await setupUIDatabase(path);
        const { PUT, ACTIVATE } = createThemesApiHandler({ connectionString: path });

        const putRes = await PUT(new Request('http://local/x', { method: 'PUT', body: '{}' }), 'nao-existe');
        expect(putRes.status).toBe(404);
        const actRes = await ACTIVATE(new Request('http://local/x', { method: 'PUT' }), 'nao-existe');
        expect(actRes.status).toBe(404);
    });
});

describe('middleware Express — rotas de temas', () => {
    const makeRes = () => {
        let body = '';
        return {
            statusCode: 200,
            setHeader: (): void => undefined,
            end: (chunk?: string): void => {
                body = chunk ?? '';
            },
            get body() {
                return body;
            },
        };
    };

    it('POST /api/ui/themes + PUT :id/activate via middleware', async () => {
        const path = tmpPath('.tmp-themes-mw.sqlite');
        await setupUIDatabase(path);
        const middleware = createSarakUIExpressMiddleware({ connectionString: path });

        const postRes = makeRes();
        await middleware(
            { method: 'POST', url: '/api/ui/themes', headers: {}, body: { name: 'Via Middleware', design: { mode: 'light' }, is_active: false } },
            postRes,
            vi.fn(),
        );
        expect(postRes.statusCode).toBe(200);
        const created = JSON.parse(postRes.body);
        expect(created.name).toBe('Via Middleware');

        const actRes = makeRes();
        await middleware(
            { method: 'PUT', url: `/api/ui/themes/${created.id}/activate`, headers: {} },
            actRes,
            vi.fn(),
        );
        expect(actRes.statusCode).toBe(200);
        expect(JSON.parse(actRes.body).is_active).toBe(true);
    });
});
