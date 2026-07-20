// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mergePackageJson, parsePackageJson } from '../mergePackageJson.mjs';

describe('mergePackageJson', () => {
    it('sem package.json existente, parte de um base sensato', () => {
        const { packageJson, skipped } = mergePackageJson({
            existing: null,
            updates: { scripts: { dev: 'vite' }, dependencies: { react: '^18.0.0' }, devDependencies: {} },
        });
        expect(packageJson.name).toBeTruthy();
        expect(packageJson.type).toBe('module');
        expect(packageJson.scripts.dev).toBe('vite');
        expect(skipped).toEqual([]);
    });

    it('preserva TODO campo já existente do consumidor (ex.: um script custom)', () => {
        const existing = {
            name: 'meu-app',
            version: '2.0.0',
            scripts: { lint: 'eslint .' },
            dependencies: { zod: '^3.0.0' },
        };
        const { packageJson } = mergePackageJson({
            existing,
            updates: { scripts: { dev: 'vite' }, dependencies: { react: '^18.0.0' }, devDependencies: {} },
        });
        expect(packageJson.name).toBe('meu-app');
        expect(packageJson.version).toBe('2.0.0');
        expect(packageJson.scripts.lint).toBe('eslint .');
        expect(packageJson.scripts.dev).toBe('vite');
        expect(packageJson.dependencies.zod).toBe('^3.0.0');
        expect(packageJson.dependencies.react).toBe('^18.0.0');
    });

    it('sem --force, NUNCA sobrescreve uma chave existente com valor divergente — e relata em skipped', () => {
        const existing = { scripts: { dev: 'node server.js' } };
        const { packageJson, skipped } = mergePackageJson({
            existing,
            updates: { scripts: { dev: 'vite' }, dependencies: {}, devDependencies: {} },
        });
        expect(packageJson.scripts.dev).toBe('node server.js');
        expect(skipped).toContain('scripts.dev');
    });

    it('com --force, sobrescreve a chave divergente', () => {
        const existing = { scripts: { dev: 'node server.js' } };
        const { packageJson, skipped } = mergePackageJson({
            existing,
            updates: { scripts: { dev: 'vite' }, dependencies: {}, devDependencies: {} },
            force: true,
        });
        expect(packageJson.scripts.dev).toBe('vite');
        expect(skipped).toEqual([]);
    });

    it('chave já existente com o MESMO valor não conta como pulada', () => {
        const existing = { scripts: { dev: 'vite' } };
        const { skipped } = mergePackageJson({
            existing,
            updates: { scripts: { dev: 'vite' }, dependencies: {}, devDependencies: {} },
        });
        expect(skipped).toEqual([]);
    });
});

describe('parsePackageJson', () => {
    it('faz o parse normal quando o conteúdo não tem BOM', () => {
        expect(parsePackageJson('{"name":"meu-app"}')).toEqual({ name: 'meu-app' });
    });

    it('remove o BOM UTF-8 que `Set-Content -Encoding utf8` do PowerShell 5 grava — sem ele, JSON.parse derrubava o init no meio', () => {
        const BOM = '﻿';
        const bomContent = `${BOM}{"name":"meu-app","scripts":{"lint":"eslint ."}}`;
        expect(() => JSON.parse(bomContent)).toThrow();
        expect(parsePackageJson(bomContent)).toEqual({ name: 'meu-app', scripts: { lint: 'eslint .' } });
    });
});
