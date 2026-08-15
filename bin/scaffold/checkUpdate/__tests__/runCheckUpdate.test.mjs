// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCheckUpdate } from '../runCheckUpdate.mjs';
import { formatNotice } from '../formatNotice.mjs';

let tmpDir;

const lockContent = (resolvedCommit) =>
    JSON.stringify({
        packages: {
            'node_modules/@sarak/lib-ui-core': {
                resolved: `git+ssh://git@github.com/Lib-Sarak/Sarak-Lib-UI-Core.git#${resolvedCommit}`,
            },
        },
    }, null, 2);

function writeConsumer({ gitSpec, resolvedCommit, dir = null }) {
    const base = dir ? path.join(tmpDir, dir) : tmpDir;
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(
        path.join(base, 'package.json'),
        JSON.stringify({ name: 'consumidor', dependencies: { '@sarak/lib-ui-core': gitSpec } }, null, 2),
    );
    // O lockfile fica na RAIZ do tmpDir sempre: quando `dir` é passado, isso reproduz
    // o monorepo (pacote embaixo, lock em cima) que derrubava o check antigo.
    fs.writeFileSync(path.join(tmpDir, 'package-lock.json'), lockContent(resolvedCommit));
    return base;
}

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-check-')));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('runCheckUpdate', () => {
    it('nenhum package.json declara a dependência -> falha com mensagem instrutiva, nunca lança', () => {
        const result = runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: () => 'nunca chamado' });
        expect(result.ok).toBe(false);
        expect(result.message).toContain('que declare');
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
        // Manda o comando REAL do gerenciador detectado, não um "rode sarak:update"
        // que o consumidor pode nem ter (Spec 51 — L2).
        expect(result.message).toContain('npm uninstall @sarak/lib-ui-core');
        expect(result.command).toContain('npm install github:Lib-Sarak/Sarak-Lib-UI-Core');
    });

    it('MONOREPO: acha o lockfile ACIMA do pacote que declara a dependência (D3)', () => {
        const pacote = writeConsumer({
            gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core',
            resolvedCommit: '7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223',
            dir: 'packages/ui-kit',
        });

        const result = runCheckUpdate({
            rootDir: pacote,
            execGitLsRemote: () => '599341cc9aefad8e55a0c18c97ccc45fc81b945f',
        });

        expect(result.ok).toBe(true);
        expect(result.upToDate).toBe(false);
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

    // plan-50: o incidente real era exatamente isto — pacote em dia (upToDate true),
    // cache do bundler órfão. Os dois sinais têm de aparecer JUNTOS, com rótulos
    // DIFERENTES (`[sarak:check]` × `[sarak:check:cache]`) — nunca fundidos num só.
    it('pacote em dia MAS cache do Vite órfão -> upToDate true, bundlerCache.stale true, mensagem com os DOIS rótulos', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: 'a'.repeat(40) });
        fs.mkdirSync(path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core', 'dist'), { recursive: true });
        fs.writeFileSync(path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core', 'dist', 'SarakChatEngine-NOVOHASH.js'), '');
        fs.mkdirSync(path.join(tmpDir, 'node_modules', '.vite', 'deps'), { recursive: true });
        fs.writeFileSync(
            path.join(tmpDir, 'node_modules', '.vite', 'deps', '_metadata.json'),
            JSON.stringify({ x: 'SarakChatEngine-VELHOHASH.js' }),
        );

        const result = runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: () => 'a'.repeat(40) });

        expect(result.upToDate).toBe(true);
        expect(result.bundlerCache.stale).toBe(true);
        expect(result.message).toContain('[sarak:check]');
        expect(result.message).toContain('[sarak:check:cache]');
        expect(result.message).toContain('SarakChatEngine-VELHOHASH.js');
    });

    // plan-50, CORREÇÃO — reproduz de ponta a ponta (via `runCheckUpdate`, não
    // chamando `inspectViteDepsCache` direto) a topologia exata do achado que reprovou
    // a rodada anterior: quem DECLARA a lib (`packages/ui-kit`, onde o `predev` roda o
    // `check`) é IRMÃO de quem RODA o Vite (`modulos/propostas/web`, onde o cache
    // vive) — os dois só compartilham a raiz do workspace, onde está o lockfile.
    it('MONOREPO real: rodando de packages/ui-kit (onde o predev roda), acha o cache órfão em modulos/propostas/web (pacote IRMÃO) — a prova que a correção exige', () => {
        const uiKit = writeConsumer({
            gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core',
            resolvedCommit: 'a'.repeat(40),
            dir: 'packages/ui-kit',
        });
        fs.mkdirSync(path.join(uiKit, 'node_modules', '@sarak', 'lib-ui-core', 'dist'), { recursive: true });
        fs.writeFileSync(path.join(uiKit, 'node_modules', '@sarak', 'lib-ui-core', 'dist', 'CustomizationPanelImpl-M3L3JTTG.js'), '');
        fs.writeFileSync(path.join(uiKit, 'node_modules', '@sarak', 'lib-ui-core', 'dist', 'SarakChatEngine-HHOE6GZE.js'), '');

        // O cache vive num pacote IRMÃO — modulos/propostas/web — não dentro nem acima
        // de packages/ui-kit.
        const propostasVite = path.join(tmpDir, 'modulos', 'propostas', 'web', 'node_modules', '.vite', 'deps');
        fs.mkdirSync(propostasVite, { recursive: true });
        fs.writeFileSync(
            path.join(propostasVite, '_metadata.json'),
            JSON.stringify({ x: 'CustomizationPanelImpl-ZLQMJDZU.js e SarakChatEngine-73V474Y4.js' }),
        );

        const result = runCheckUpdate({ rootDir: uiKit, execGitLsRemote: () => 'a'.repeat(40) });

        expect(result.bundlerCache.stale).toBe(true);
        expect(result.bundlerCache.staleRefs.sort()).toEqual(
            ['CustomizationPanelImpl-ZLQMJDZU.js', 'SarakChatEngine-73V474Y4.js'].sort(),
        );
        expect(result.message).toContain('[sarak:check:cache]');
        expect(result.message).toContain('CustomizationPanelImpl-ZLQMJDZU.js');
        expect(result.message).toContain('SarakChatEngine-73V474Y4.js');
        expect(result.message).toContain(propostasVite);
    });
});

describe('formatNotice — o contrato de RUÍDO do aviso (Spec 51 — L1)', () => {
    const remoto = (sha) => () => sha;

    it('em dia -> null (silêncio absoluto; aviso que aparece sempre é aviso ignorado)', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: 'a'.repeat(40) });

        expect(formatNotice(runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: remoto('a'.repeat(40)) }))).toBeNull();
    });

    it('sem rede -> null (uma verificação que não pôde ser feita NÃO é uma atualização)', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: 'a'.repeat(40) });
        const result = runCheckUpdate({
            rootDir: tmpDir,
            execGitLsRemote: () => { throw new Error('offline'); },
        });

        expect(formatNotice(result)).toBeNull();
    });

    it('sem contexto nenhum -> null', () => {
        expect(formatNotice(runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: remoto('x') }))).toBeNull();
    });

    it('desatualizado -> bloco com as duas versões e o COMANDO', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: 'a'.repeat(40) });
        const aviso = formatNotice(runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: remoto('b'.repeat(40)) }));

        expect(aviso).toContain('atualização disponível');
        expect(aviso).toContain('aaaaaaa');
        expect(aviso).toContain('bbbbbbb');
        expect(aviso).toContain('npm uninstall @sarak/lib-ui-core');
    });

    // plan-50: a notícia do cache NÃO é silenciada só porque o pacote está em dia —
    // é exatamente o cenário do incidente real, e o `--notify` do `predev` precisa
    // falar sobre ele mesmo sem atualização de pacote pendente.
    it('pacote EM DIA mas cache do Vite órfão -> NÃO fica em silêncio; avisa só sobre o cache', () => {
        writeConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', resolvedCommit: 'a'.repeat(40) });
        fs.mkdirSync(path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core', 'dist'), { recursive: true });
        fs.writeFileSync(path.join(tmpDir, 'node_modules', '@sarak', 'lib-ui-core', 'dist', 'SarakChatEngine-NOVOHASH.js'), '');
        fs.mkdirSync(path.join(tmpDir, 'node_modules', '.vite', 'deps'), { recursive: true });
        fs.writeFileSync(
            path.join(tmpDir, 'node_modules', '.vite', 'deps', '_metadata.json'),
            JSON.stringify({ x: 'SarakChatEngine-VELHOHASH.js' }),
        );

        const aviso = formatNotice(runCheckUpdate({ rootDir: tmpDir, execGitLsRemote: remoto('a'.repeat(40)) }));

        expect(aviso).not.toBeNull();
        expect(aviso).toContain('cache do bundler');
        expect(aviso).not.toContain('atualização disponível'); // não é o aviso de pacote — não confundir os dois
    });
});
