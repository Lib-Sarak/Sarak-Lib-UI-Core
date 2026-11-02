// @vitest-environment node
// Teste do PRÓPRIO GATE `network:check`: casos PLANTADOS que ele pega, passantes que ele deixa passar,
// a allowlist e o repositório real.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ALLOWLIST, findNetworkUses, findNetworkViolations } from '../check-no-network.mjs';

const roots = [];

function fixture(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-no-network-'));
    roots.push(root);
    for (const [relative, content] of Object.entries(files)) {
        const full = path.join(root, relative);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

afterEach(() => {
    while (roots.length) fs.rmSync(roots.pop(), { recursive: true, force: true });
});

describe('findNetworkUses — o que é rede', () => {
    it.each([
        ["await fetch('/api')", 'fetch'],
        ["window.fetch('/api')", 'fetch'],
        ["globalThis.fetch('/api')", 'fetch'],
        ['const x = new XMLHttpRequest();', 'new XMLHttpRequest'],
        ["new WebSocket('wss://a')", 'new WebSocket'],
        ["new window.WebSocket('wss://a')", 'new WebSocket'],
        ["new EventSource('/s')", 'new EventSource'],
        ["navigator.sendBeacon('/t')", 'navigator.sendBeacon'],
        ["import axios from 'axios';", 'import de axios'],
        ["import { create } from 'axios/dist/axios';", 'import de axios/dist/axios'],
        ["export { default } from 'axios';", 'import de axios'],
        ["const a = await import('axios');", 'import de axios'],
        ["const a = require('axios');", 'import de axios'],
    ])('PLANTADO: %s é acusado', (code, use) => {
        expect(findNetworkUses(code).map((hit) => hit.use)).toEqual([use]);
    });

    it.each([
        ['// fetch(url) é do host'],
        ['/** new WebSocket() nunca aqui */ const a = 1;'],
        ["const texto = 'fetch(url) e axios';"],
        ['const a = <p>fetch(url)</p>;'],
        ['props.fetch();'],
        ['client.fetch();'],
        ['new client.WebSocket();'],
        ['fetchData();'],
        ['const fetch2 = load();'],
        ["import { x } from 'axios-mock-adapter';"],
        ["import { y } from './axios';"],
        ['type T = typeof fetch;'],
    ])('PASSANTE: %s não é acusado', (code) => {
        expect(findNetworkUses(code)).toEqual([]);
    });

    it('aponta a linha da ocorrência', () => {
        expect(findNetworkUses("const a = 1;\n\nfetch('/x');\n")).toEqual([{ line: 3, use: 'fetch' }]);
    });
});

describe('findNetworkViolations — a fixture', () => {
    it('MUTAÇÃO: um fetch plantado em src/ reprova, com arquivo e linha', () => {
        const root = fixture({ 'src/components/A.tsx': "export const a = () => fetch('/api');\n" });

        expect(findNetworkViolations({ root, allowlist: {} }).violations).toEqual([
            { file: 'src/components/A.tsx', line: 1, use: 'fetch' },
        ]);
    });

    it('CONTRAPROVA: teste, `.test` e `.d.ts` não são varridos', () => {
        const root = fixture({
            'src/components/__tests__/A.test.tsx': "fetch('/api');\n",
            'src/core/b.test.ts': "fetch('/api');\n",
            'src/core/c.d.ts': "declare const c: typeof fetch;\nfetch('/api');\n",
        });

        expect(findNetworkViolations({ root, allowlist: {} })).toMatchObject({ violations: [], total: 0 });
    });

    it('a allowlist vale, e acusa-se a entrada que deixou de ter ocorrência', () => {
        const root = fixture({
            'src/core/Network.ts': "fetch('/api');\n",
            'src/core/Clean.ts': 'export const a = 1;\n',
        });

        const { violations, staleExceptions } = findNetworkViolations({
            root,
            allowlist: { 'src/core/Network.ts': 'motivo escrito', 'src/core/Clean.ts': 'não tem mais rede' },
        });

        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual(['src/core/Clean.ts']);
    });
});

describe('o repositório', () => {
    it('não faz rede em src/, e a allowlist não tem entrada obsoleta', () => {
        const { violations, staleExceptions, total } = findNetworkViolations();

        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual([]);
        expect(total).toBeGreaterThan(100);
    }, 60_000);

    it('toda exceção traz motivo', () => {
        for (const [file, motive] of Object.entries(ALLOWLIST)) {
            expect(motive.length, file).toBeGreaterThan(20);
        }
    });
});
