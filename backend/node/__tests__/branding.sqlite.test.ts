import { describe, it, expect, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import { setupUIDatabase } from '../database';
import { createBrandingApiHandler } from '../branding';

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

describe('createBrandingApiHandler (SQLite)', () => {
    it('GET sem branding cadastrado devolve { branding: {} }', async () => {
        const path = tmpPath('.tmp-branding-get-empty.sqlite');
        await setupUIDatabase(path);
        const { GET } = createBrandingApiHandler({ connectionString: path });

        const res = await GET(new Request('http://local/api/ui/branding'));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({ branding: {} });
    });

    it('POST cria o branding; GET subsequente devolve os campos persistidos', async () => {
        const path = tmpPath('.tmp-branding-post.sqlite');
        await setupUIDatabase(path);
        const { GET, POST } = createBrandingApiHandler({ connectionString: path });

        const postRes = await POST(
            new Request('http://local/api/ui/branding', {
                method: 'POST',
                body: JSON.stringify({ branding: { companyName: 'Automacao Ltda', tabName: 'Automacao' } }),
            }),
        );
        expect((await postRes.json()).success).toBe(true);

        const getRes = await GET(new Request('http://local/api/ui/branding'));
        const getBody = await getRes.json();

        expect(getBody.branding.companyName).toBe('Automacao Ltda');
        expect(getBody.branding.tabName).toBe('Automacao');
    });

    it('POST duas vezes atualiza o mesmo registro', async () => {
        const path = tmpPath('.tmp-branding-post-twice.sqlite');
        await setupUIDatabase(path);
        const { GET, POST } = createBrandingApiHandler({ connectionString: path });

        await POST(
            new Request('http://local/api/ui/branding', { method: 'POST', body: JSON.stringify({ branding: { companyName: 'A' } }) }),
        );
        await POST(
            new Request('http://local/api/ui/branding', { method: 'POST', body: JSON.stringify({ branding: { companyName: 'B' } }) }),
        );

        const getRes = await GET(new Request('http://local/api/ui/branding'));
        const getBody = await getRes.json();
        expect(getBody.branding.companyName).toBe('B');
    });
});
