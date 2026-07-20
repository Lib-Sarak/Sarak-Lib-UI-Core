// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildDependencies, buildPackageJsonUpdates } from '../packageJsonFields.mjs';

const ctx = {
    libVersion: '3.0.0',
    peerDependencies: { react: '>=18.0.0', pg: '^8.21.0' },
};

describe('buildDependencies', () => {
    it('espelha a lib + TODAS as peerDependencies reais (nunca uma cópia à mão)', () => {
        const deps = buildDependencies({ ctx });
        expect(deps['@sarak/lib-ui-core']).toBe('^3.0.0');
        expect(deps.react).toBe('>=18.0.0');
        expect(deps.pg).toBe('^8.21.0');
    });
});

describe('buildPackageJsonUpdates', () => {
    it('vite-express: nunca usa typescript ^7 (incompatível com ts-node-dev)', () => {
        const updates = buildPackageJsonUpdates({ answers: { stack: 'vite-express' }, ctx });
        expect(updates.devDependencies.typescript.startsWith('^5')).toBe(true);
        expect(updates.devDependencies['ts-node-dev']).toBeTruthy();
        expect(updates.scripts.dev).toContain('concurrently');
    });

    it('vite-express: declara express (runtime) e @types/express (dev) — o server.ts importa express', () => {
        const updates = buildPackageJsonUpdates({ answers: { stack: 'vite-express' }, ctx });
        expect(updates.dependencies.express).toBeTruthy();
        expect(updates.devDependencies['@types/express']).toBeTruthy();
    });

    it('next: não inclui ts-node-dev/concurrently (não fazem sentido nessa stack)', () => {
        const updates = buildPackageJsonUpdates({ answers: { stack: 'next' }, ctx });
        expect(updates.devDependencies['ts-node-dev']).toBeUndefined();
        expect(updates.dependencies.next).toBeTruthy();
    });

    it('frontend-only: sem concurrently/ts-node-dev, mas com vite', () => {
        const updates = buildPackageJsonUpdates({ answers: { stack: 'frontend-only' }, ctx });
        expect(updates.devDependencies['ts-node-dev']).toBeUndefined();
        expect(updates.devDependencies.vite).toBeTruthy();
    });
});
