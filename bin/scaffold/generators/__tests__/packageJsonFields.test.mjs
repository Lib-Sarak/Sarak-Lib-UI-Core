// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildDependencies, buildPackageJsonUpdates, buildUpdateScript, buildCheckScript } from '../packageJsonFields.mjs';

const ctx = {
    libVersion: '3.0.0',
    peerDependencies: { react: '>=18.0.0', 'react-dom': '>=18.0.0' },
};

describe('buildDependencies', () => {
    it('espelha a lib + TODAS as peerDependencies reais (nunca uma cópia à mão)', () => {
        const deps = buildDependencies({ ctx });
        expect(deps['@sarak/lib-ui-core']).toBe('^3.0.0');
        expect(deps.react).toBe('>=18.0.0');
        expect(deps['react-dom']).toBe('>=18.0.0');
    });
});

describe('buildPackageJsonUpdates (starter padrão — Spec 45, sem backend)', () => {
    it('nunca usa typescript ^7 (achado real de instalação com toolchains mais novas)', () => {
        const updates = buildPackageJsonUpdates({ ctx });
        expect(updates.devDependencies.typescript.startsWith('^5')).toBe(true);
    });

    it('scripts são um front Vite puro — sem express/ts-node-dev/concurrently/next', () => {
        const updates = buildPackageJsonUpdates({ ctx });
        expect(updates.scripts.dev).toBe('vite');
        expect(updates.scripts.build).toContain('vite build');
        expect(updates.devDependencies['ts-node-dev']).toBeUndefined();
        expect(updates.devDependencies.concurrently).toBeUndefined();
        expect(updates.devDependencies.next).toBeUndefined();
        expect(updates.dependencies.express).toBeUndefined();
        expect(updates.dependencies.next).toBeUndefined();
    });

    it('inclui @types/react e @types/react-dom (achado real: tsc falhava em react-dom/client sem eles — os @types não vêm via peerDependencies)', () => {
        const updates = buildPackageJsonUpdates({ ctx });
        expect(updates.devDependencies['@types/react']).toBeTruthy();
        expect(updates.devDependencies['@types/react-dom']).toBeTruthy();
    });

    it('ganha o script sarak:update (Spec 39 §2.1)', () => {
        const updates = buildPackageJsonUpdates({ ctx });
        expect(updates.scripts['sarak:update']).toContain('npm uninstall @sarak/lib-ui-core');
    });

    it('ganha o script sarak:check (Spec 39 follow-up — verificação autoritativa)', () => {
        const updates = buildPackageJsonUpdates({ ctx });
        expect(updates.scripts['sarak:check']).toBe('node node_modules/@sarak/lib-ui-core/bin/scaffold/checkUpdate.mjs');
    });
});

describe('buildCheckScript', () => {
    it('aponta para o checkUpdate.mjs shipado no pacote instalado (não é import da lib)', () => {
        expect(buildCheckScript()).toBe('node node_modules/@sarak/lib-ui-core/bin/scaffold/checkUpdate.mjs');
    });
});

describe('buildUpdateScript', () => {
    it('fura o pin do lockfile E o cache git do npm — um `npm install` sozinho não satisfaz', () => {
        const script = buildUpdateScript({ ctx });
        expect(script).toContain('npm uninstall @sarak/lib-ui-core');
        expect(script).toContain('npm cache clean --force');
        expect(script).toContain('npm install github:Lib-Sarak/Sarak-Lib-UI-Core');
    });

    it('reusa o spec git REAL do consumidor (ctx.libGitSpec) em vez do default', () => {
        const script = buildUpdateScript({ ctx: { ...ctx, libGitSpec: 'github:MeuFork/Sarak-Lib-UI-Core#minha-branch' } });
        expect(script).toContain('npm install github:MeuFork/Sarak-Lib-UI-Core#minha-branch');
        expect(script).not.toContain('Lib-Sarak');
    });
});
