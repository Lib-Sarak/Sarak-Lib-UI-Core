// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCheckUpdate } from '../runCheckUpdate.mjs';

let tmpDir;

function writeConsumer({ gitSpec, resolvedCommit }) {
    fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({ name: 'consumidor', dependencies: { '@sarak/lib-ui-core': gitSpec } }, null, 2),
    );
    fs.writeFileSync(
        path.join(tmpDir, 'package-lock.json'),
        JSON.stringify({
            packages: {
                'node_modules/@sarak/lib-ui-core': {
                    resolved: `git+ssh://git@github.com/Lib-Sarak/Sarak-Lib-UI-Core.git#${resolvedCommit}`,
                },
            },
        }, null, 2),
    );
}

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-check-'));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('runCheckUpdate', () => {
    it('sem package.json/lock -> falha com mensagem instrutiva, nunca lança', () => {
        const result = runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: () => 'nunca chamado' });
        expect(result.ok).toBe(false);
        expect(result.message).toContain('não encontrados');
    });

    it('instalado == HEAD remoto -> upToDate true', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: '599341cc9aefad8e55a0c18c97ccc45fc81b945f' });
        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: (url, ref) => {
                expect(url).toBe('https://github.com/Lib-Sarak/Sarak-Lib-UI-Core.git');
                expect(ref).toBe('HEAD');
                return '599341cc9aefad8e55a0c18c97ccc45fc81b945f';
            },
        });
        expect(result.ok).toBe(true);
        expect(result.upToDate).toBe(true);
        expect(result.message).toContain('Atualizado');
    });

    it('instalado != HEAD remoto -> upToDate false, indica o comando de correção', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: '7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223' });
        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => '599341cc9aefad8e55a0c18c97ccc45fc81b945f',
        });
        expect(result.ok).toBe(true);
        expect(result.upToDate).toBe(false);
        expect(result.message).toContain('Desatualizado');
        expect(result.message).toContain('npm run sarak:update');
    });

    it('spec com commit fixado no próprio texto: não compara contra HEAD remoto (nunca chama execGitLsRemote)', () => {
        writeConsumer({
            gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223',
            resolvedCommit: '7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223',
        });
        let called = false;
        const result = runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: () => { called = true; return 'x'; } });
        expect(called).toBe(false);
        expect(result.ok).toBe(true);
        expect(result.message).toContain('fixa um commit explícito');
    });

    it('git ls-remote falha (sem rede) -> mensagem legível, nunca lança', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: '599341cc9aefad8e55a0c18c97ccc45fc81b945f' });
        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('network unreachable'); },
        });
        expect(result.ok).toBe(false);
        expect(result.message).toContain('Não consegui consultar');
        expect(result.message).toContain('network unreachable');
    });
});
