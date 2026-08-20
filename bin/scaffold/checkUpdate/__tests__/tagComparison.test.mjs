// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { greatestTag, parseTag, parseTagRefs, parseVersion } from '../semverTags.mjs';
import { runCheckUpdate } from '../runCheckUpdate.mjs';
import { formatNotice } from '../formatNotice.mjs';
import { faixaDoConsumidor, filterTagsByFaixa, rotuloFaixa } from '../tagComparison.mjs';

let tmpDir;

/** Saída crua de `git ls-remote --tags`, incluindo o `^{}` das tags anotadas. */
const lsRemoteTags = (tags) =>
    tags
        .flatMap((tag) => [`${'a'.repeat(40)}\trefs/tags/${tag}`, `${'b'.repeat(40)}\trefs/tags/${tag}^{}`])
        .join('\n');

function writeConsumer({ gitSpec, installedVersion = null, resolvedCommit = 'c'.repeat(40) }) {
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
        }),
    );
    if (installedVersion) {
        const instalado = path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core');
        fs.mkdirSync(instalado, { recursive: true });
        fs.writeFileSync(
            path.join(instalado, 'package.json'),
            JSON.stringify({ name: '@sarak/lib-ui-core', version: installedVersion }),
        );
    }
}

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-tag-')));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('semverTags — leitura das refs (ADR-008)', () => {
    it('só `vX.Y.Z` entra: formato desconhecido é IGNORADO, não adivinhado', () => {
        expect(parseTag('v1.2.3')).toEqual([1, 2, 3]);
        expect(parseTag('1.2.3')).toBeNull();
        expect(parseTag('v1.2.3-rc.1')).toBeNull();
        expect(parseTag('release-1.2.3')).toBeNull();
        expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
    });

    it('a tag ANOTADA aparece duas vezes (`^{}`) e não vira duas versões', () => {
        expect(parseTagRefs(lsRemoteTags(['v1.0.0']))).toEqual(['v1.0.0', 'v1.0.0']);
    });

    it('a maior tag sai por VERSÃO, não por ordem alfabética (v1.10.0 > v1.9.0)', () => {
        expect(greatestTag(['v1.9.0', 'v1.10.0', 'v1.2.0']).tag).toBe('v1.10.0');
        expect(greatestTag(['nada', 'main'])).toBeNull();
    });
});

describe('faixaDoConsumidor / filterTagsByFaixa — o filtro de faixa (plan-10, achado 3.1)', () => {
    it('`~1.2.0` captura operador, major E minor — `^1.2.0` captura só o operador e o major', () => {
        expect(faixaDoConsumidor('github:x/y#semver:~1.2.0')).toEqual({ operador: '~', major: 1, minor: 2 });
        expect(faixaDoConsumidor('github:x/y#semver:^1.2.0')).toEqual({ operador: '^', major: 1, minor: 2 });
        expect(faixaDoConsumidor('github:x/y#semver:1.2.0')).toEqual({ operador: '^', major: 1, minor: 2 });
        expect(faixaDoConsumidor('github:x/y')).toBeNull();
        expect(faixaDoConsumidor('github:x/y#semver:>=1.0.0')).toBeNull();
    });

    it('`~1.2.x` filtra por MAJOR e MINOR — `v1.9.0` some da lista, `v1.2.5` fica', () => {
        const faixa = faixaDoConsumidor('github:x/y#semver:~1.2.0');
        expect(filterTagsByFaixa(['v1.2.5', 'v1.9.0', 'v2.0.0'], faixa)).toEqual(['v1.2.5']);
    });

    it('`^1.2.x` continua filtrando só por MAJOR — `v1.9.0` fica, `v2.0.0` sai', () => {
        const faixa = faixaDoConsumidor('github:x/y#semver:^1.2.0');
        expect(filterTagsByFaixa(['v1.2.5', 'v1.9.0', 'v2.0.0'], faixa)).toEqual(['v1.2.5', 'v1.9.0']);
    });

    it('rótulo imprime `(~N.M)` para quem escreveu `~`, `(^N)` para quem escreveu `^`', () => {
        expect(rotuloFaixa(faixaDoConsumidor('github:x/y#semver:~1.2.0'))).toBe('~1.2');
        expect(rotuloFaixa(faixaDoConsumidor('github:x/y#semver:^1.2.0'))).toBe('^1');
    });
});

describe('runCheckUpdate — `~` não vira ruído permanente (plan-10, achado 3.1 do estado anterior)', () => {
    it('`~1.2.0` NÃO recebe aviso de `v1.9.0` — o `npm update` dele nunca entregaria isso', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:~1.2.0', installedVersion: '1.2.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => lsRemoteTags(['v1.2.0', 'v1.9.0']),
        });

        expect(result.upToDate).toBe(true);
        expect(result.message).toContain('faixa do seu package.json (~1.2)');
        expect(formatNotice(result)).toBeNull();
    });

    it('`~1.2.0` RECEBE aviso de `v1.2.5` — está dentro da própria faixa', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:~1.2.0', installedVersion: '1.2.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => lsRemoteTags(['v1.2.0', 'v1.2.5', 'v1.9.0']),
        });

        expect(result.upToDate).toBe(false);
        expect(result.remoteLabel).toBe('v1.2.5');
    });
});

describe('runCheckUpdate — comparação por TAG (ADR-008)', () => {
    it('instalado == maior tag -> atualizado, e a mensagem fala em VERSÃO', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0']),
        });

        expect(result.upToDate).toBe(true);
        expect(result.message).toContain('v1.0.0 é a maior versão publicada');
    });

    it('instalado < maior tag -> o aviso diz `v1.0.0 → v1.1.0`, não dois hashes', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0', 'v1.1.0']),
        });

        expect(result.upToDate).toBe(false);
        expect(result.installedLabel).toBe('v1.0.0');
        expect(result.remoteLabel).toBe('v1.1.0');

        const aviso = formatNotice(result);
        expect(aviso).toContain('v1.0.0');
        expect(aviso).toContain('v1.1.0');
    });

    it('MAJOR fora da faixa do consumidor NÃO vira aviso — senão o bloco nunca mais sumiria', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.2.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => lsRemoteTags(['v1.2.0', 'v2.0.0']),
        });

        expect(result.upToDate).toBe(true);
        expect(result.message).toContain('faixa do seu package.json (^1)');
        expect(formatNotice(result)).toBeNull();
    });

    it('sem faixa no spec (github: puro), o major novo CONTA — lá o update alcança', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', installedVersion: '1.2.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => lsRemoteTags(['v1.2.0', 'v2.0.0']),
        });

        expect(result.upToDate).toBe(false);
        expect(result.remoteLabel).toBe('v2.0.0');
    });

    it('remoto SEM tag nenhuma -> cai para a comparação por commit (github: puro segue suportado)', () => {
        writeConsumer({
            gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core',
            installedVersion: '1.0.0',
            resolvedCommit: 'a'.repeat(40),
        });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => 'b'.repeat(40),
            execGitLsRemoteTags: () => '',
        });

        expect(result.upToDate).toBe(false);
        expect(result.message).toContain('HEAD remoto');
    });

    it('spec `#semver:` que não pôde ser comparada NÃO vira "nenhum commit" — diz o sintoma certo', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia comparar commit'); },
            execGitLsRemoteTags: () => { throw new Error('offline'); },
        });

        expect(result.ok).toBe(false);
        expect(result.message).toContain('resolve por TAG');
        // E o contrato de ruído continua: verificação que não pôde ser feita não é aviso.
        expect(formatNotice(result)).toBeNull();
    });

    it('commit fixado no próprio spec continua vencendo a comparação por tag', () => {
        writeConsumer({
            gitSpec: `github:Lib-Sarak/Sarak-Lib-UI-Core#${'d'.repeat(40)}`,
            installedVersion: '1.0.0',
            resolvedCommit: 'd'.repeat(40),
        });
        let consultouTags = false;

        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('não devia consultar'); },
            execGitLsRemoteTags: () => { consultouTags = true; return lsRemoteTags(['v9.9.9']); },
        });

        expect(consultouTags).toBe(false);
        expect(result.message).toContain('fixa um commit explícito');
    });
});
