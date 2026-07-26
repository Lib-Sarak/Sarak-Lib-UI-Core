// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectLocalDependency, isLocalSpec } from '../localDependency.mjs';

let tmpDir;
let fonte;
let consumidor;

const write = (base, relPath, content) => {
    const full = path.join(base, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
};

/** Um "pacote da lib" mínimo: o que a assinatura olha (`dist/` + `sarak-ui/`). */
const seedPacote = (base, { builtAt = '2026-07-26T00:00:00.000Z', kitHash = 'aaaa1111', extra = null } = {}) => {
    write(base, 'package.json', JSON.stringify({ name: '@sarak/lib-ui-core', version: '3.0.0' }));
    write(base, 'dist/index.js', 'export const x = 1;');
    write(base, 'dist/BUILD_INFO.json', JSON.stringify({ builtAt, libVersion: '3.0.0' }));
    write(base, 'sarak-ui/VERSION', `libVersion=3.0.0\nkitHash=${kitHash}\n`);
    if (extra) write(base, extra, 'arquivo novo');
};

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-local-')));
    fonte = path.join(tmpDir, 'lib-fonte');
    consumidor = path.join(tmpDir, 'consumidor');
    fs.mkdirSync(consumidor, { recursive: true });
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

const inspect = (installedDir) =>
    inspectLocalDependency({ spec: 'file:../lib-fonte', packageDir: consumidor, installedDir });

describe('isLocalSpec', () => {
    it('reconhece file: e link:, e recusa spec git', () => {
        expect(isLocalSpec('file:../lib')).toBe(true);
        expect(isLocalSpec('link:../lib')).toBe(true);
        expect(isLocalSpec('github:Lib-Sarak/Sarak-Lib-UI-Core')).toBe(false);
    });
});

describe('inspectLocalDependency (Spec 51 — L1 §3.2 / D4)', () => {
    it('LINK VIVO: o realpath cai na própria fonte → sempre em dia', () => {
        seedPacote(fonte);
        const link = path.join(consumidor, 'node_modules/@sarak/lib-ui-core');
        fs.mkdirSync(path.dirname(link), { recursive: true });
        fs.symlinkSync(fonte, link, 'junction');

        expect(inspect(link).kind).toBe('live');
    });

    it('CÓPIA idêntica → fresh', () => {
        seedPacote(fonte);
        const copia = path.join(consumidor, 'node_modules/@sarak/lib-ui-core');
        fs.cpSync(fonte, copia, { recursive: true });

        expect(inspect(copia).kind).toBe('fresh');
    });

    it('CÓPIA com build mais novo na fonte → stale', () => {
        const copia = path.join(consumidor, 'node_modules/@sarak/lib-ui-core');
        seedPacote(copia, { builtAt: '2026-07-01T00:00:00.000Z', kitHash: 'velho000' });
        seedPacote(fonte, { builtAt: '2026-07-26T00:00:00.000Z', kitHash: 'novo1111' });

        const resultado = inspect(copia);

        expect(resultado.kind).toBe('stale');
        expect(resultado.installedKitHash).toBe('velho000');
        expect(resultado.sourceKitHash).toBe('novo1111');
    });

    it('ARQUIVO NOVO na fonte → stale mesmo com BUILD_INFO idêntico (o caso do hardlink do pnpm)', () => {
        const copia = path.join(consumidor, 'node_modules/@sarak/lib-ui-core');
        seedPacote(copia);
        seedPacote(fonte, { extra: 'sarak-ui/catalog.json' });

        const resultado = inspect(copia);

        // Conteúdo dos arquivos existentes é IDÊNTICO — só o inventário difere.
        expect(resultado.kind).toBe('stale');
        expect(resultado.installedInventory).not.toBe(resultado.sourceInventory);
    });

    it('pacote ausente em node_modules → indeterminado (não é erro, é "instale")', () => {
        seedPacote(fonte);

        expect(inspect(null).kind).toBe('indeterminado');
    });

    it('fonte inexistente (caminho do spec errado) → indeterminado', () => {
        const copia = path.join(consumidor, 'node_modules/@sarak/lib-ui-core');
        seedPacote(copia);

        expect(inspect(copia).kind).toBe('indeterminado');
    });

    it('lib nunca buildada (sem dist/ nem kit) → indeterminado, com dica de build', () => {
        fs.mkdirSync(fonte, { recursive: true });
        write(fonte, 'package.json', '{}');
        const copia = path.join(consumidor, 'node_modules/@sarak/lib-ui-core');
        write(copia, 'package.json', '{}');

        const resultado = inspect(copia);

        expect(resultado.kind).toBe('indeterminado');
        expect(resultado.detail).toContain('build');
    });
});
