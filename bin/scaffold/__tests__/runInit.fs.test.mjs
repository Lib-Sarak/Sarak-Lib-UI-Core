// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runInit } from '../runInit.mjs';

let tmpDir;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-init-'));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

const GOLDEN_PATH_ANSWERS = {
    mode: 'app',
    stack: 'vite-express',
    storage: 'sqlite',
    schema: null,
    backendPort: 3000,
    frontendPort: 5173,
};

describe('runInit (fs real, tmp dir)', () => {
    it('gera a estrutura completa do Golden Path na 1ª execução', async () => {
        const result = await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });

        expect(result.skipped).toEqual([]);
        for (const relPath of [
            'index.html',
            'vite.config.ts',
            'tsconfig.json',
            'tsconfig.server.json',
            'src/main.tsx',
            'src/server.ts',
            'src/Sarak-Engine/index.ts',
            'src/manifests/app.manifest.json',
            'package.json',
        ]) {
            expect(fs.existsSync(path.join(tmpDir, relPath)), `esperava ${relPath}`).toBe(true);
        }

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts.dev).toContain('concurrently');
        expect(pkg.dependencies['@sarak/lib-ui-core']).toBeTruthy();
        expect(pkg.devDependencies.typescript.startsWith('^5')).toBe(true);
    });

    it('2ª execução é idempotente: nada é sobrescrito e tudo aparece em skipped', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });
        fs.writeFileSync(path.join(tmpDir, 'src', 'main.tsx'), '// edição manual do usuário\n');

        const second = await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });

        expect(second.skipped).toContain('src/main.tsx');
        const content = fs.readFileSync(path.join(tmpDir, 'src', 'main.tsx'), 'utf8');
        expect(content).toBe('// edição manual do usuário\n');
    });

    it('--force sobrescreve o que a 2ª execução pularia', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });
        fs.writeFileSync(path.join(tmpDir, 'src', 'main.tsx'), '// edição manual do usuário\n');

        await runInit({ rootDir: tmpDir, flags: { force: true }, overrideAnswers: GOLDEN_PATH_ANSWERS });

        const content = fs.readFileSync(path.join(tmpDir, 'src', 'main.tsx'), 'utf8');
        expect(content).not.toContain('edição manual');
    });

    it('copia as 2 skills de consumo para .agents/skills e .claude/skills', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });

        for (const base of ['.agents/skills', '.claude/skills']) {
            expect(fs.existsSync(path.join(tmpDir, base, 'ui-integra-escrever-manifesto', 'SKILL.md'))).toBe(true);
            expect(fs.existsSync(path.join(tmpDir, base, 'ui-auditoria-manifesto', 'SKILL.md'))).toBe(true);
        }
    });

    it('preserva um package.json existente (merge, não sobrescrita)', async () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ name: 'meu-app-existente', version: '9.9.9', scripts: { lint: 'eslint .' } }, null, 2),
        );

        await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.name).toBe('meu-app-existente');
        expect(pkg.scripts.lint).toBe('eslint .');
        expect(pkg.scripts.dev).toContain('concurrently');
    });

    it('preserva um package.json existente com BOM UTF-8 (achado real: `Set-Content -Encoding utf8` do PowerShell 5 grava BOM e derrubava o init no meio, com o resto dos arquivos já escritos)', async () => {
        const BOM = '﻿';
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            `${BOM}${JSON.stringify({ name: 'meu-app-bom', scripts: { lint: 'eslint .' } }, null, 2)}`,
        );

        const result = await runInit({ rootDir: tmpDir, overrideAnswers: GOLDEN_PATH_ANSWERS });

        expect(result.skipped.filter((s) => s.startsWith('package.json'))).toEqual([]);
        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.name).toBe('meu-app-bom');
        expect(pkg.scripts.lint).toBe('eslint .');
        expect(pkg.scripts.dev).toContain('concurrently');
        // O arquivo final é regravado sem BOM — não propaga o problema adiante.
        const rawFinal = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8');
        expect(rawFinal.startsWith(BOM)).toBe(false);
    });

    it('storage postgres com schema: server.ts final reflete o schema escolhido', async () => {
        await runInit({
            rootDir: tmpDir,
            overrideAnswers: { ...GOLDEN_PATH_ANSWERS, storage: 'postgres', schema: 'MeuSchema' },
        });

        const serverTs = fs.readFileSync(path.join(tmpDir, 'src', 'server.ts'), 'utf8');
        expect(serverTs).toContain("schema: 'MeuSchema'");
    });

    it('rejeita answers inválidas antes de escrever qualquer arquivo', async () => {
        await expect(
            runInit({ rootDir: tmpDir, overrideAnswers: { ...GOLDEN_PATH_ANSWERS, stack: 'sveltekit' } }),
        ).rejects.toThrow(/Stack inválido/);
        expect(fs.readdirSync(tmpDir)).toEqual([]);
    });

    it('stack next: gera instrumentation + os 3 handlers oficiais (design/branding/themes)', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: { ...GOLDEN_PATH_ANSWERS, stack: 'next', storage: 'postgres', schema: null } });

        for (const relPath of [
            'instrumentation.ts',
            'app/api/ui/design/route.ts',
            'app/api/ui/branding/route.ts',
            'app/api/ui/themes/route.ts',
            'app/api/ui/themes/[id]/route.ts',
            'app/api/ui/themes/[id]/activate/route.ts',
        ]) {
            expect(fs.existsSync(path.join(tmpDir, relPath)), `esperava ${relPath}`).toBe(true);
        }
        // Nenhum src/server.ts Express nesta stack.
        expect(fs.existsSync(path.join(tmpDir, 'src/server.ts'))).toBe(false);
    });

    it('stack frontend-only: gera front puro + stub do contrato REST, sem servidor Node', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: { ...GOLDEN_PATH_ANSWERS, stack: 'frontend-only', storage: 'custom' } });

        expect(fs.existsSync(path.join(tmpDir, 'CONTRATO-BACKEND.md'))).toBe(true);
        expect(fs.existsSync(path.join(tmpDir, 'src/main.tsx'))).toBe(true);
        expect(fs.existsSync(path.join(tmpDir, 'src/server.ts'))).toBe(false);

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.devDependencies['ts-node-dev']).toBeUndefined();
    });

    it('modo embarcado: main.tsx importa o CSS escopado e passa options.mode', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: { ...GOLDEN_PATH_ANSWERS, mode: 'embedded' } });

        const mainTsx = fs.readFileSync(path.join(tmpDir, 'src/main.tsx'), 'utf8');
        expect(mainTsx).toContain('sarak-scoped.css');
        expect(mainTsx).toContain("mode: 'embedded'");
    });
});
