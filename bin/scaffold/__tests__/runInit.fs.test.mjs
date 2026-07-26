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

const STARTER_ANSWERS = {
    mode: 'app',
    frontendPort: 5173,
};

describe('runInit (fs real, tmp dir) — starter padrão módulos-plugin (Spec 45)', () => {
    it('gera a estrutura completa do starter na 1ª execução', async () => {
        const result = await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        expect(result.skipped).toEqual([]);
        for (const relPath of [
            'index.html',
            'vite.config.ts',
            'tsconfig.json',
            'src/main.tsx',
            'src/modules/ExampleModule.tsx',
            'package.json',
        ]) {
            expect(fs.existsSync(path.join(tmpDir, relPath)), `esperava ${relPath}`).toBe(true);
        }

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts.dev).toBe('vite');
        expect(pkg.dependencies['@sarak/lib-ui-core']).toBeTruthy();
        expect(pkg.devDependencies.typescript.startsWith('^5')).toBe(true);
    });

    it('main.tsx segue o padrão módulos-plugin (Sarak-MyService): Provider+Shell+registro, sem manifesto', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const mainTsx = fs.readFileSync(path.join(tmpDir, 'src/main.tsx'), 'utf8');
        expect(mainTsx).toContain('SarakUIProvider');
        expect(mainTsx).toContain('SarakShell');
        expect(mainTsx).toContain('registerSarakModule');
        expect(mainTsx).toContain('registerLocalComponent');
        expect(mainTsx).not.toContain('SarakManifestRenderer');
        expect(mainTsx).not.toContain('app.manifest.json');
    });

    it('main.tsx define o módulo de exemplo como defaultModuleId (achado real: sem isso, o Shell abre no Design Engine por padrão — prioridade 9999)', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const mainTsx = fs.readFileSync(path.join(tmpDir, 'src/main.tsx'), 'utf8');
        expect(mainTsx).toContain("defaultModuleId: 'exemplo'");
    });

    it('não gera backend nenhum (Spec 44/45): sem server.ts, sem rotas Next, sem manifesto/Sarak-Engine', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        for (const relPath of [
            'src/server.ts',
            'tsconfig.server.json',
            'instrumentation.ts',
            'CONTRATO-BACKEND.md',
            'src/Sarak-Engine/index.ts',
            'src/manifests/app.manifest.json',
        ]) {
            expect(fs.existsSync(path.join(tmpDir, relPath)), `NÃO esperava ${relPath}`).toBe(false);
        }

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.dependencies.express).toBeUndefined();
        expect(pkg.dependencies.next).toBeUndefined();
        expect(pkg.devDependencies['ts-node-dev']).toBeUndefined();
        expect(pkg.devDependencies.concurrently).toBeUndefined();
    });

    it('2ª execução é idempotente: nada é sobrescrito e tudo aparece em skipped', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });
        fs.writeFileSync(path.join(tmpDir, 'src', 'main.tsx'), '// edição manual do usuário\n');

        const second = await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        expect(second.skipped).toContain('src/main.tsx');
        const content = fs.readFileSync(path.join(tmpDir, 'src', 'main.tsx'), 'utf8');
        expect(content).toBe('// edição manual do usuário\n');
    });

    it('--force sobrescreve o que a 2ª execução pularia', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });
        fs.writeFileSync(path.join(tmpDir, 'src', 'main.tsx'), '// edição manual do usuário\n');

        await runInit({ rootDir: tmpDir, flags: { force: true }, overrideAnswers: STARTER_ANSWERS });

        const content = fs.readFileSync(path.join(tmpDir, 'src', 'main.tsx'), 'utf8');
        expect(content).not.toContain('edição manual');
    });

    it('não copia skill nenhuma (SKILLS_TO_COPY vazio desde a Spec 46 — sem motor de manifesto)', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        for (const base of ['.agents/skills', '.claude/skills']) {
            expect(fs.existsSync(path.join(tmpDir, base))).toBe(false);
        }
    });

    it('preserva um package.json existente (merge, não sobrescrita)', async () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ name: 'meu-app-existente', version: '9.9.9', scripts: { lint: 'eslint .' } }, null, 2),
        );

        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.name).toBe('meu-app-existente');
        expect(pkg.scripts.lint).toBe('eslint .');
        expect(pkg.scripts.dev).toBe('vite');
    });

    it('preserva um package.json existente com BOM UTF-8 (achado real: `Set-Content -Encoding utf8` do PowerShell 5 grava BOM e derrubava o init no meio, com o resto dos arquivos já escritos)', async () => {
        const BOM = '﻿';
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            `${BOM}${JSON.stringify({ name: 'meu-app-bom', scripts: { lint: 'eslint .' } }, null, 2)}`,
        );

        const result = await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        expect(result.skipped.filter((s) => s.startsWith('package.json'))).toEqual([]);
        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.name).toBe('meu-app-bom');
        expect(pkg.scripts.lint).toBe('eslint .');
        expect(pkg.scripts.dev).toBe('vite');
        // O arquivo final é regravado sem BOM — não propaga o problema adiante.
        const rawFinal = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8');
        expect(rawFinal.startsWith(BOM)).toBe(false);
    });

    it('rejeita answers inválidas antes de escrever qualquer arquivo', async () => {
        await expect(
            runInit({ rootDir: tmpDir, overrideAnswers: { ...STARTER_ANSWERS, mode: 'servidor' } }),
        ).rejects.toThrow(/Modo inválido/);
        expect(fs.readdirSync(tmpDir)).toEqual([]);
    });

    it('sarak:update (Spec 39 §2.1): 1ª instalação usa o spec git oficial default', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts['sarak:update']).toContain('npm install github:Lib-Sarak/Sarak-Lib-UI-Core');
    });

    it('sarak:check usa a CLI PÚBLICA do pacote (Spec 51 — D2: caminho interno não vaza mais para o package.json do importador)', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts['sarak:check']).toBe('node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check');
    });

    it('sarak:update reusa o spec git JÁ instalado pelo consumidor (fork/mirror), nunca assume o oficial', async () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({
                name: 'consumidor-com-fork',
                dependencies: { '@sarak/lib-ui-core': 'github:MeuFork/Sarak-Lib-UI-Core#7fd0bd1' },
            }, null, 2),
        );

        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts['sarak:update']).toContain('npm install github:MeuFork/Sarak-Lib-UI-Core#7fd0bd1');
    });

    it('modo embarcado: main.tsx importa o CSS escopado e passa options.mode', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: { ...STARTER_ANSWERS, mode: 'embedded' } });

        const mainTsx = fs.readFileSync(path.join(tmpDir, 'src/main.tsx'), 'utf8');
        expect(mainTsx).toContain('sarak-scoped.css');
        expect(mainTsx).toContain("mode: 'embedded'");
    });

    it('copia o kit de uso `sarak-ui/` para a raiz (Spec 50 §7): o agente do importador acha o START-HERE sem cavar node_modules', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        for (const relPath of [
            'sarak-ui/START-HERE.md',
            'sarak-ui/GUIA-FRONTEND.md',
            'sarak-ui/catalog.json',
            'sarak-ui/VERSION',
            'sarak-ui/skill/SKILL.md',
            'sarak-ui/templates/main.tsx',
        ]) {
            expect(fs.existsSync(path.join(tmpDir, relPath)), `esperava ${relPath}`).toBe(true);
        }
    });

    it('liga o AVISO de atualização como predev (Spec 51 — L1): o importador é avisado a cada `npm run dev`', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts.predev).toBe('node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check --notify');
    });

    it('NÃO sobrescreve um predev que o consumidor já tem (o dele vence; encadear é escolha dele)', async () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ name: 'app', scripts: { predev: 'node scripts/matar-portas.mjs' } }, null, 2),
        );

        const result = await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts.predev).toBe('node scripts/matar-portas.mjs');
        expect(result.skipped).toContain('package.json:scripts.predev');
    });

    it('sarak:update segue o GERENCIADOR do consumidor (Spec 51 — L2: comando npm num workspace pnpm quebra o repositório)', async () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ name: 'app-pnpm', packageManager: 'pnpm@11.17.0' }, null, 2),
        );

        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts['sarak:update']).toContain('pnpm remove @sarak/lib-ui-core');
        expect(pkg.scripts['sarak:update']).toContain('pnpm add github:Lib-Sarak/Sarak-Lib-UI-Core');
        expect(pkg.scripts['sarak:update']).not.toContain('npm uninstall');
    });

    it('sarak:update re-sincroniza o kit no fim (senão a lib fica nova e as instruções velhas)', async () => {
        await runInit({ rootDir: tmpDir, overrideAnswers: STARTER_ANSWERS });

        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
        expect(pkg.scripts['sarak:update']).toContain('bin/sarak-ui.mjs refresh');
    });
});
