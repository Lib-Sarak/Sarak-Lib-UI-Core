// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { detectPackageManager, gitUpdateCommand, localRefreshCommand } from '../packageManager.mjs';

let tmpDir;

const write = (relPath, content) => {
    const full = path.join(tmpDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    return full;
};

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-pm-')));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('detectPackageManager (Spec 51 — L2)', () => {
    it('o campo `packageManager` vence — é declaração de intenção, não rastro', () => {
        write('package.json', JSON.stringify({ name: 'x', packageManager: 'pnpm@11.17.0' }));
        write('package-lock.json', '{}');

        const detected = detectPackageManager({ startDir: tmpDir });

        expect(detected.name).toBe('pnpm');
        expect(detected.source).toBe('packageManager');
    });

    it('sem o campo, cai no lockfile', () => {
        write('package.json', JSON.stringify({ name: 'x' }));
        write('yarn.lock', '');

        expect(detectPackageManager({ startDir: tmpDir })).toMatchObject({ name: 'yarn', source: 'lockfile' });
    });

    it('DOIS lockfiles: o mais recente vence E a ambiguidade é reportada (o resíduo que quebrou o consumidor real)', () => {
        write('package.json', JSON.stringify({ name: 'x' }));
        const antigo = write('package-lock.json', '{}');
        const novo = write('pnpm-lock.yaml', '');
        fs.utimesSync(antigo, new Date(1000), new Date(1000));
        fs.utimesSync(novo, new Date(9000), new Date(9000));

        const detected = detectPackageManager({ startDir: tmpDir });

        expect(detected.name).toBe('pnpm');
        expect(detected.ambiguous).toEqual(expect.arrayContaining(['pnpm-lock.yaml', 'package-lock.json']));
    });

    it('sobe a árvore: pacote de monorepo herda o gerenciador da raiz', () => {
        write('package.json', JSON.stringify({ name: 'raiz', packageManager: 'pnpm@11.17.0' }));
        write('packages/ui-kit/package.json', JSON.stringify({ name: '@erp/ui-kit' }));

        const detected = detectPackageManager({ startDir: path.join(tmpDir, 'packages/ui-kit') });

        expect(detected.name).toBe('pnpm');
        expect(detected.dir).toBe(tmpDir);
    });

    // `stopAt` é o que torna este caso HERMÉTICO: "sem nenhum sinal" só é afirmável
    // dentro de um recorte declarado. Sem a fronteira, a asserção depende de não
    // existir lockfile em NENHUM ancestral da máquina — um `package-lock.json` solto
    // no `$HOME` faz a detecção acertar (`source: 'lockfile'`) e o teste reprovar por
    // motivo ambiental. O caso seguinte prova que a fronteira não muda a produção.
    it('sem nenhum sinal DENTRO da fronteira, o default é npm', () => {
        expect(detectPackageManager({ startDir: tmpDir, stopAt: tmpDir })).toMatchObject({
            name: 'npm',
            source: 'default',
        });
    });

    it('a fronteira delimita SEM mudar a produção: o mesmo lockfile ancestral é achado sem `stopAt` e fica de fora com ele', () => {
        write('package-lock.json', '{}');
        const app = path.join(tmpDir, 'app');
        fs.mkdirSync(app, { recursive: true });

        expect(detectPackageManager({ startDir: app })).toMatchObject({
            name: 'npm',
            source: 'lockfile',
            dir: tmpDir,
        });
        expect(detectPackageManager({ startDir: app, stopAt: app })).toMatchObject({
            name: 'npm',
            source: 'default',
        });
    });

    it('package.json ilegível não derruba a detecção', () => {
        write('package.json', '{ isto não é json');
        write('pnpm-lock.yaml', '');

        expect(detectPackageManager({ startDir: tmpDir }).name).toBe('pnpm');
    });
});

describe('comandos por gerenciador — só entra o que foi EXECUTADO (regra dura da Spec 51)', () => {
    it('pnpm em workspace filtra o pacote (validado no consumidor real)', () => {
        expect(localRefreshCommand({ manager: 'pnpm', packageName: '@erp/ui-kit' })).toEqual({
            command: 'pnpm install --force --filter @erp/ui-kit',
            validated: true,
        });
    });

    it('yarn re-copia com install --force (validado em probe)', () => {
        expect(localRefreshCommand({ manager: 'yarn' })).toEqual({ command: 'yarn install --force', validated: true });
    });

    it('npm linka a fonte nas topologias medidas — a forma análoga fica marcada como NÃO validada', () => {
        expect(localRefreshCommand({ manager: 'npm' }).validated).toBe(false);
    });

    it('gerenciador desconhecido não recebe chute nenhum', () => {
        expect(localRefreshCommand({ manager: 'bun' })).toEqual({ command: null, validated: false });
        expect(gitUpdateCommand({ manager: 'bun', packageName: 'x', gitSpec: 'y' })).toEqual({ command: null, validated: false });
    });

    it('npm(git) mantém as 3 etapas — pin do lock E cache git (Spec 39)', () => {
        const { command } = gitUpdateCommand({ manager: 'npm', packageName: '@sarak/lib-ui-core', gitSpec: 'github:o/r' });

        expect(command).toContain('npm uninstall @sarak/lib-ui-core');
        expect(command).toContain('npm cache clean --force');
        expect(command).toContain('npm install github:o/r');
    });

    it('pnpm/yarn(git) usam remove+add (medidos contra o repositório real)', () => {
        expect(gitUpdateCommand({ manager: 'pnpm', packageName: 'p', gitSpec: 'github:o/r' }).command).toBe('pnpm remove p && pnpm add github:o/r');
        expect(gitUpdateCommand({ manager: 'yarn', packageName: 'p', gitSpec: 'github:o/r' }).command).toBe('yarn remove p && yarn add github:o/r');
    });
});
