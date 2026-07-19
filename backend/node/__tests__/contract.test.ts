/**
 * Teste de contrato (skill `test-api-contrato`, passo 4 — "provider conforma à spec"):
 * roda os handlers de referência (SQLite) e compara as CHAVES da resposta real
 * contra `UI_STORAGE_CONTRACT` (`../contract.ts`, espelhado em `docs/ui-storage-contract.md`).
 * Divergência aqui é bug — no código ou no documento, nunca "ignorar".
 */
import { describe, it, expect, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import { setupUIDatabase } from '../database';
import { createDesignApiHandler } from '../api';
import { createBrandingApiHandler } from '../branding';
import { createThemesApiHandler } from '../themes';
import { UI_STORAGE_CONTRACT } from '../contract';

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

const contractFields = (id: string, status: number): readonly string[] => {
    const endpoint = UI_STORAGE_CONTRACT.find((e) => e.id === id);
    if (!endpoint) throw new Error(`Endpoint "${id}" não está no contrato`);
    const response = endpoint.responses.find((r) => r.status === status);
    if (!response) throw new Error(`Endpoint "${id}" não documenta status ${status}`);
    return response.fields;
};

const sameKeys = (body: Record<string, unknown>, fields: readonly string[]): void => {
    expect(Object.keys(body).sort()).toEqual([...fields].sort());
};

describe('Contrato REST (docs/ui-storage-contract.md ↔ backend/node/contract.ts ↔ handlers)', () => {
    it('design-get: {design:{}} sem tema ativo; shape completo com tema ativo', async () => {
        const path = tmpPath('.tmp-contract-design.sqlite');
        await setupUIDatabase(path);
        const { GET, POST } = createDesignApiHandler({ connectionString: path });

        // design-get documenta DOIS shapes de 200 (§3.1) — índice 0 = sem tema ativo, índice 1 = com.
        const designGetResponses = UI_STORAGE_CONTRACT.find((e) => e.id === 'design-get')!.responses;

        const empty = await (await GET(new Request('http://local/api/ui/design'))).json();
        sameKeys(empty, designGetResponses[0].fields);

        await POST(new Request('http://local/api/ui/design', { method: 'POST', body: JSON.stringify({ design: { mode: 'dark' } }) }));
        const withActive = await (await GET(new Request('http://local/api/ui/design'))).json();
        sameKeys(withActive, designGetResponses[1].fields);
    });

    it('design-post: shape completo do tema', async () => {
        const path = tmpPath('.tmp-contract-design-post.sqlite');
        await setupUIDatabase(path);
        const { POST } = createDesignApiHandler({ connectionString: path });

        const body = await (await POST(new Request('http://local/api/ui/design', { method: 'POST', body: JSON.stringify({ design: { mode: 'light' } }) }))).json();
        sameKeys(body, contractFields('design-post', 200));
    });

    it('branding-get/post: chave top-level "branding"/"success"', async () => {
        const path = tmpPath('.tmp-contract-branding.sqlite');
        await setupUIDatabase(path);
        const { GET, POST } = createBrandingApiHandler({ connectionString: path });

        const empty = await (await GET(new Request('http://local/api/ui/branding'))).json();
        sameKeys(empty, contractFields('branding-get', 200));

        const posted = await (await POST(new Request('http://local/api/ui/branding', { method: 'POST', body: JSON.stringify({ branding: { companyName: 'X' } }) }))).json();
        sameKeys(posted, contractFields('branding-post', 200));
    });

    it('themes-create/update/activate: shape completo do tema; 404 documentado', async () => {
        const path = tmpPath('.tmp-contract-themes.sqlite');
        await setupUIDatabase(path);
        const { POST, PUT, ACTIVATE } = createThemesApiHandler({ connectionString: path });

        const created = await (await POST(new Request('http://local/api/ui/themes', { method: 'POST', body: JSON.stringify({ name: 'T', design: {}, is_active: false }) }))).json();
        sameKeys(created, contractFields('themes-create', 200));

        const updated = await (await PUT(new Request('http://local/x', { method: 'PUT', body: JSON.stringify({ name: 'T2' }) }), created.id)).json();
        sameKeys(updated, contractFields('themes-update', 200));

        const notFound = await (await PUT(new Request('http://local/x', { method: 'PUT', body: '{}' }), 'nao-existe'));
        expect(notFound.status).toBe(404);
        sameKeys(await notFound.json(), contractFields('themes-update', 404));

        const activated = await (await ACTIVATE(new Request('http://local/x', { method: 'PUT' }), created.id)).json();
        sameKeys(activated, contractFields('themes-activate', 200));

        const activateNotFound = await ACTIVATE(new Request('http://local/x', { method: 'PUT' }), 'nao-existe');
        expect(activateNotFound.status).toBe(404);
        sameKeys(await activateNotFound.json(), contractFields('themes-activate', 404));
    });
});
