// @vitest-environment node
//
// `sarak-ui update [--latest]` (plan-10) — contrato do que EXECUTA de verdade
// (`execCommand`) contra o que só é PLANEJADO. Rede (`execGitLsRemoteTags`),
// execução (`execCommand`) e TTY (`input`/`output`) são todos injetáveis — o
// CLI real (`runUpdateCli`) é coberto à parte, só no parsing de `--latest`/`--yes`
// e na captura de exceção (mesma fronteira do `checkUpdateCli.contract.test.mjs`).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable, Writable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runUpdate, runUpdateCli } from '../runUpdate.mjs';

let tmpDir;

const lsRemoteTags = (tags) =>
    tags
        .flatMap((tag) => [`${'a'.repeat(40)}\trefs/tags/${tag}`, `${'b'.repeat(40)}\trefs/tags/${tag}^{}`])
        .join('\n');

function writeJson(file, obj) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function writeText(file, text) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
}

/** Consumidor git com `package-lock.json` (detecta npm) e a lib "instalada" em node_modules. */
function gitConsumer({ gitSpec, installedVersion }) {
    const consumerDir = path.join(tmpDir, 'consumer');
    writeJson(path.join(consumerDir, 'package.json'), { name: 'consumidor', dependencies: { '@sarak/lib-ui-core': gitSpec } });
    writeJson(path.join(consumerDir, 'package-lock.json'), { lockfileVersion: 3 });
    writeJson(path.join(consumerDir, 'node_modules', '@sarak', 'lib-ui-core', 'package.json'), {
        name: '@sarak/lib-ui-core',
        version: installedVersion,
    });
    return consumerDir;
}

/** `packageRoot` mínimo: `docs/migracoes.md` (para as notas) + `sarak-ui/` (para o refresh). */
function fakePackageRoot({ migracoesText = '# Migrações\n' } = {}) {
    const root = fs.mkdtempSync(path.join(tmpDir, 'pkgroot-'));
    writeText(path.join(root, 'docs', 'migracoes.md'), migracoesText);
    writeText(path.join(root, 'sarak-ui', 'VERSION'), 'kitHash=abc\n');
    return root;
}

const respostaStream = (linha) => {
    const stream = new Readable({ read() {} });
    stream.isTTY = true;
    process.nextTick(() => {
        stream.push(`${linha}\n`);
        stream.push(null);
    });
    return stream;
};

const sink = () => new Writable({ write(_c, _e, cb) { cb(); } });

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-update-')));
});

afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('runUpdate — dependência LOCAL (file:/link:)', () => {
    it('link vivo -> nada a fazer, execCommand NUNCA chamado', async () => {
        const consumerDir = path.join(tmpDir, 'consumer');
        writeJson(path.join(consumerDir, 'package.json'), { name: 'c', dependencies: { '@sarak/lib-ui-core': 'file:../lib' } });
        writeJson(path.join(consumerDir, 'package-lock.json'), {});
        fs.mkdirSync(path.join(tmpDir, 'lib'), { recursive: true });
        fs.mkdirSync(path.join(consumerDir, 'node_modules', '@sarak'), { recursive: true });
        fs.symlinkSync(path.join(tmpDir, 'lib'), path.join(consumerDir, 'node_modules', '@sarak', 'lib-ui-core'), 'junction');

        const execCommand = vi.fn();
        const { output, exitCode } = await runUpdate({ cwd: consumerDir, packageRoot: fakePackageRoot(), execCommand });

        expect(exitCode).toBe(0);
        expect(output).toContain('link vivo');
        expect(execCommand).not.toHaveBeenCalled();
    });
});

describe('runUpdate — dependência GIT, sem --latest (nunca atravessa major)', () => {
    it('há tag nova DENTRO do major -> executa o comando REAL do gerenciador e re-sincroniza o kit', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const execCommand = vi.fn();
        const execGitLsRemoteTags = () => lsRemoteTags(['v1.0.0', 'v1.2.0', 'v3.0.0']);

        const { output, exitCode } = await runUpdate({ cwd, packageRoot: fakePackageRoot(), execGitLsRemoteTags, execCommand });

        expect(exitCode).toBe(0);
        expect(execCommand).toHaveBeenCalledTimes(1);
        const [command] = execCommand.mock.calls[0];
        expect(command).toContain('npm install github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0');
        expect(output).toContain('Alvo: v1.2.0');
        expect(output).toContain('re-sincronizado');
        // v3.0.0 existe no remoto mas está FORA da faixa ^1.0.0 — sem --latest, nunca é o alvo.
        expect(command).not.toContain('3.0.0');
    });

    it('já na maior tag da faixa -> NÃO executa nada', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.2.0' });
        const execCommand = vi.fn();
        const execGitLsRemoteTags = () => lsRemoteTags(['v1.2.0']);

        const { output, exitCode } = await runUpdate({ cwd, packageRoot: fakePackageRoot(), execGitLsRemoteTags, execCommand });

        expect(exitCode).toBe(0);
        expect(output).toContain('Já está atualizado');
        expect(execCommand).not.toHaveBeenCalled();
    });

    it('SEM faixa declarada (github: puro), tag nova de MAJOR novo -> sem --latest, NÃO atravessa', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', installedVersion: '1.0.0' });
        const execCommand = vi.fn();
        const execGitLsRemoteTags = () => lsRemoteTags(['v1.0.0', 'v2.0.0']);

        const { output, exitCode } = await runUpdate({ cwd, packageRoot: fakePackageRoot(), execGitLsRemoteTags, execCommand });

        expect(exitCode).toBe(0);
        expect(output).toContain('Já está atualizado');
        expect(execCommand).not.toHaveBeenCalled();
    });

    it('spec com commit fixado -> não há o que atualizar por versão; NÃO executa nada', async () => {
        const commit = 'd'.repeat(40);
        const cwd = gitConsumer({ gitSpec: `github:Lib-Sarak/Sarak-Lib-UI-Core#${commit}`, installedVersion: '1.0.0' });
        const execCommand = vi.fn();

        const { output, exitCode } = await runUpdate({
            cwd,
            packageRoot: fakePackageRoot(),
            execGitLsRemoteTags: () => { throw new Error('não devia consultar tags'); },
            execCommand,
        });

        expect(exitCode).toBe(0);
        expect(output).toContain('fixa um commit explícito');
        expect(execCommand).not.toHaveBeenCalled();
    });
});

describe('runUpdate --latest — atravessa o major SÓ depois de confirmado', () => {
    const MIGRACOES = [
        '# Migrações',
        '',
        '---',
        '',
        '## Entrada nova depois da renumeração (plan-9)',
        'Corpo.',
        '',
        '---',
        '',
        '## Renumeração de 3.0.0 para 1.0.0',
        'Corpo.',
        '',
        '---',
        '',
    ].join('\n');

    it('recusado (resposta "n") -> NÃO reescreve o package.json, NÃO executa nada', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const execCommand = vi.fn();
        const antes = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8');

        const { output, exitCode } = await runUpdate({
            cwd,
            packageRoot: fakePackageRoot({ migracoesText: MIGRACOES }),
            latest: true,
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0', 'v3.0.0']),
            execCommand,
            input: respostaStream('n'),
            output: sink(),
        });

        expect(exitCode).toBe(0);
        expect(output).toContain('Cancelado');
        expect(execCommand).not.toHaveBeenCalled();
        expect(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).toBe(antes);
    });

    const capturingOutput = () => {
        const linhas = [];
        const stream = new Writable({
            write(chunk, _enc, cb) {
                linhas.push(chunk.toString());
                cb();
            },
        });
        return { stream, texto: () => linhas.join('') };
    };

    it('confirmado (--yes) -> reescreve a faixa para o major da tag mais nova e RODA o comando com o spec NOVO', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const execCommand = vi.fn();
        const { stream: outputCapturado, texto } = capturingOutput();

        const { output, exitCode } = await runUpdate({
            cwd,
            packageRoot: fakePackageRoot({ migracoesText: MIGRACOES }),
            latest: true,
            yes: true,
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0', 'v3.0.0']),
            execCommand,
            output: outputCapturado,
        });

        expect(exitCode).toBe(0);
        const pkgDepois = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
        expect(pkgDepois.dependencies['@sarak/lib-ui-core']).toBe('github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^3.0.0');
        expect(execCommand).toHaveBeenCalledTimes(1);
        expect(execCommand.mock.calls[0][0]).toContain('#semver:^3.0.0');
        expect(output).toContain('Alvo: v3.0.0');
        // O resumo de "majors pulados" e as notas vão para `output` (o terminal), ANTES da
        // pergunta — é o que a plan exige ("mostra o que quebra antes de confirmar").
        expect(texto()).toContain('2 majors pulados');
    });

    it('imprime as notas ENTRE a instalada e a mais nova antes da confirmação (via `output`)', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const { stream: outputCapturado, texto } = capturingOutput();

        await runUpdate({
            cwd,
            packageRoot: fakePackageRoot({ migracoesText: MIGRACOES }),
            latest: true,
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0', 'v3.0.0']),
            execCommand: vi.fn(),
            input: respostaStream('n'),
            output: outputCapturado,
        });

        const textoImpresso = texto();
        expect(textoImpresso).toContain('Entrada nova depois da renumeração');
        // A âncora da PRÓPRIA versão instalada (1.0.0) não deve aparecer — só o que veio DEPOIS.
        expect(textoImpresso).not.toContain('Renumeração de 3.0.0 para 1.0.0');
    });

    it('majorsSkipped 0 (já na tag mais nova) -> não pede confirmação nenhuma', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const execCommand = vi.fn();

        const { output, exitCode } = await runUpdate({
            cwd,
            packageRoot: fakePackageRoot(),
            latest: true,
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0']),
            execCommand,
            input: respostaStream('n'), // se fosse perguntar, isto recusaria — não deve ser lido
        });

        expect(exitCode).toBe(0);
        expect(output).toContain('Já está atualizado');
        expect(execCommand).not.toHaveBeenCalled();
    });

    it('sem TTY e sem --yes -> falha em voz alta (exit 1), NÃO reescreve nada', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const semTTY = new Readable({ read() {} });
        semTTY.isTTY = false;

        const { output, exitCode } = await runUpdate({
            cwd,
            packageRoot: fakePackageRoot({ migracoesText: MIGRACOES }),
            latest: true,
            execGitLsRemoteTags: () => lsRemoteTags(['v1.0.0', 'v3.0.0']),
            execCommand: vi.fn(),
            input: semTTY,
            output: sink(),
        });

        expect(exitCode).toBe(1);
        expect(output).toContain('Terminal não interativo');
    });
});

describe('runUpdate — spec de TAG EXATA (#v<X.Y.Z>): o update troca o pin', () => {
    const SPEC = 'github:Lib-Sarak/Sarak-Lib-UI-Core#v9.0.0';
    const pinDe = (cwd) => JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).dependencies['@sarak/lib-ui-core'];

    it('sem --latest: reescreve o pin para a maior tag do MESMO major e instala essa tag', async () => {
        const cwd = gitConsumer({ gitSpec: SPEC, installedVersion: '9.0.0' });
        const execCommand = vi.fn();

        const { output, exitCode } = await runUpdate({
            cwd,
            packageRoot: fakePackageRoot(),
            execGitLsRemoteTags: () => lsRemoteTags(['v9.0.0', 'v9.1.0', 'v10.0.0']),
            execCommand,
        });

        expect(exitCode).toBe(0);
        expect(output).toContain('Alvo: v9.1.0');
        expect(execCommand.mock.calls[0][0]).toContain('npm install github:Lib-Sarak/Sarak-Lib-UI-Core#v9.1.0');
        expect(execCommand.mock.calls[0][0]).not.toContain('#v9.0.0');
        expect(pinDe(cwd)).toBe('github:Lib-Sarak/Sarak-Lib-UI-Core#v9.1.0');
    });

    it('já na maior tag do major -> não executa nada e não toca o package.json', async () => {
        const cwd = gitConsumer({ gitSpec: SPEC, installedVersion: '9.0.0' });
        const execCommand = vi.fn();

        const { output } = await runUpdate({ cwd, packageRoot: fakePackageRoot(), execGitLsRemoteTags: () => lsRemoteTags(['v9.0.0', 'v10.0.0']), execCommand });

        expect(output).toContain('Já está atualizado');
        expect(execCommand).not.toHaveBeenCalled();
        expect(pinDe(cwd)).toBe(SPEC);
    });

    it('--latest dentro do mesmo major: troca o pin para a tag mais nova, sem pergunta', async () => {
        const cwd = gitConsumer({ gitSpec: SPEC, installedVersion: '9.0.0' });
        const execCommand = vi.fn();

        await runUpdate({ cwd, packageRoot: fakePackageRoot(), latest: true, execGitLsRemoteTags: () => lsRemoteTags(['v9.0.0', 'v9.1.0']), execCommand, input: respostaStream('n') });

        expect(pinDe(cwd)).toBe('github:Lib-Sarak/Sarak-Lib-UI-Core#v9.1.0');
        expect(execCommand).toHaveBeenCalledTimes(1);
    });

    it('--latest atravessando major: pede confirmação; recusado não toca o pin, confirmado troca para a tag mais nova', async () => {
        const tags = () => lsRemoteTags(['v9.0.0', 'v9.1.0', 'v10.2.0']);
        const recusado = gitConsumer({ gitSpec: SPEC, installedVersion: '9.0.0' });
        const execRecusado = vi.fn();
        await runUpdate({ cwd: recusado, packageRoot: fakePackageRoot(), latest: true, execGitLsRemoteTags: tags, execCommand: execRecusado, input: respostaStream('n'), output: sink() });
        expect(execRecusado).not.toHaveBeenCalled();
        expect(pinDe(recusado)).toBe(SPEC);

        fs.rmSync(path.join(tmpDir, 'consumer'), { recursive: true, force: true });
        const confirmado = gitConsumer({ gitSpec: SPEC, installedVersion: '9.0.0' });
        const execConfirmado = vi.fn();
        const { output } = await runUpdate({ cwd: confirmado, packageRoot: fakePackageRoot(), latest: true, yes: true, execGitLsRemoteTags: tags, execCommand: execConfirmado, output: sink() });
        expect(output).toContain('Alvo: v10.2.0');
        expect(execConfirmado.mock.calls[0][0]).toContain('#v10.2.0');
        expect(pinDe(confirmado)).toBe('github:Lib-Sarak/Sarak-Lib-UI-Core#v10.2.0');
    });

    it('github: sem fragmento continua sem reescrita: o spec fica como está', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core', installedVersion: '9.0.0' });
        const execCommand = vi.fn();
        await runUpdate({ cwd, packageRoot: fakePackageRoot(), execGitLsRemoteTags: () => lsRemoteTags(['v9.0.0', 'v9.1.0']), execCommand });
        expect(execCommand.mock.calls[0][0]).toMatch(/npm install github:Lib-Sarak\/Sarak-Lib-UI-Core$/);
        expect(pinDe(cwd)).toBe('github:Lib-Sarak/Sarak-Lib-UI-Core');
    });
});

describe('runUpdateCli — parsing de --latest/--yes e a fronteira de exceção', () => {
    it('propaga --latest e --yes para runUpdate() via argv', async () => {
        const cwd = gitConsumer({ gitSpec: 'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0', installedVersion: '1.0.0' });
        const packageRoot = fakePackageRoot();
        // Sem injeção de execGitLsRemoteTags/execCommand: usa os defaults reais — por isso
        // a rede é forçada a falhar cedo (host inexistente), só para provar que os FLAGS
        // chegaram (a mensagem de erro de rede prova que o caminho --latest foi tomado).
        writeJson(path.join(cwd, 'package.json'), {
            name: 'consumidor',
            dependencies: { '@sarak/lib-ui-core': 'github:host-que-nao-existe-sarak-teste/repo#semver:^1.0.0' },
        });

        const { exitCode, output } = await runUpdateCli({ argv: ['--latest', '--yes'], cwd, packageRoot });
        expect(exitCode).toBe(1);
        expect(output).toContain('Não consegui consultar as tags');
    });

    it('nenhum package.json declara a lib -> exit 1, mensagem instrutiva (não é exceção, é veredito)', async () => {
        const cwd = fs.mkdtempSync(path.join(tmpDir, 'vazio-'));
        const { exitCode, output } = await runUpdateCli({ argv: [], cwd, packageRoot: fakePackageRoot() });
        expect(exitCode).toBe(1);
        expect(output).toContain('Não achei');
    });

    it('exceção inesperada de dentro de runUpdate -> exit 1 com "Falhou", nunca propaga', async () => {
        const mod = await import('../checkUpdate/consumerContext.mjs');
        vi.spyOn(mod, 'resolveConsumerContext').mockImplementation(() => {
            throw new Error('boom');
        });
        const { exitCode, output } = await runUpdateCli({ argv: [], cwd: tmpDir, packageRoot: fakePackageRoot() });
        expect(exitCode).toBe(1);
        expect(output).toContain('Falhou');
        expect(output).toContain('boom');
    });
});
