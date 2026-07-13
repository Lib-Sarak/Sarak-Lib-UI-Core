import { describe, it, expect, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import { setupUIDatabase } from '../database';
import { createDesignApiHandler } from '../api';

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

describe('createDesignApiHandler (SQLite)', () => {
    it('GET sem tema ativo devolve { design: {} }', async () => {
        const path = tmpPath('.tmp-api-get-empty.sqlite');
        await setupUIDatabase(path);
        const { GET } = createDesignApiHandler({ connectionString: path });

        const res = await GET(new Request('http://local/api/ui/design'));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({ design: {} });
    });

    it('POST cria o tema e persiste colunas granulares + top-level; GET subsequente devolve o mesmo design', async () => {
        const path = tmpPath('.tmp-api-post.sqlite');
        await setupUIDatabase(path);
        const { GET, POST } = createDesignApiHandler({ connectionString: path });

        const postRes = await POST(
            new Request('http://local/api/ui/design', {
                method: 'POST',
                body: JSON.stringify({ design: { mode: 'light', primaryColor: '#123456' } }),
            }),
        );
        const postBody = await postRes.json();

        expect(postRes.status).toBe(200);
        expect(postBody.is_active).toBe(true);
        expect(postBody.design.mode).toBe('light');
        expect(postBody.design.primaryColor).toBe('#123456');

        const getRes = await GET(new Request('http://local/api/ui/design'));
        const getBody = await getRes.json();

        expect(getBody.design.mode).toBe('light');
        expect(getBody.design.primaryColor).toBe('#123456');
    });

    it('POST duas vezes atualiza o mesmo tema (não cria um segundo)', async () => {
        const path = tmpPath('.tmp-api-post-twice.sqlite');
        await setupUIDatabase(path);
        const { POST } = createDesignApiHandler({ connectionString: path });

        const first = await POST(
            new Request('http://local/api/ui/design', { method: 'POST', body: JSON.stringify({ design: { mode: 'dark' } }) }),
        );
        const firstBody = await first.json();

        const second = await POST(
            new Request('http://local/api/ui/design', { method: 'POST', body: JSON.stringify({ design: { mode: 'light' } }) }),
        );
        const secondBody = await second.json();

        expect(secondBody.id).toBe(firstBody.id);
        expect(secondBody.design.mode).toBe('light');
    });
});
