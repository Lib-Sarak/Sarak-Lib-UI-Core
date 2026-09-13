// @vitest-environment node
// Self-test do gate de citação do rastro de execução (R36). Cada caso monta um
// repositório git TEMPORÁRIO e isolado — nunca o repositório real — porque o
// gate lê `git diff`/`git ls-files` de verdade, não uma lista de arquivos.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkTrailCitation, checkTrailCitationExclusions } from '../check-trail-citation.mjs';

const reposCriados = [];

function git(cwd, args) {
    const resultado = spawnSync('git', args, { cwd, encoding: 'utf8' });
    if (resultado.status !== 0) {
        throw new Error(`git ${args.join(' ')} falhou: ${resultado.stderr || resultado.stdout}`);
    }
    return resultado.stdout;
}

function criarRepoVazio() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-trail-citation-'));
    reposCriados.push(dir);
    git(dir, ['init', '--quiet']);
    git(dir, ['config', 'user.email', 'fixture@example.com']);
    git(dir, ['config', 'user.name', 'Fixture']);
    return dir;
}

function escrever(dir, relPath, conteudo) {
    const full = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, conteudo, 'utf8');
}

function commitarTudo(dir, mensagem) {
    git(dir, ['add', '-A']);
    git(dir, ['commit', '--quiet', '-m', mensagem]);
}

afterEach(() => {
    while (reposCriados.length > 0) {
        fs.rmSync(reposCriados.pop(), { recursive: true, force: true });
    }
});

describe('checkTrailCitation — casos pegos', () => {
    it('pega linha adicionada com "// ver plan-12"', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// ver plan-12\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([{ arquivo: 'src/foo.ts', linha: 2, conteudo: '// ver plan-12', padrao: 'plan-N' }]);
    });

    it('pega linha adicionada com "veredito de 2026-09-10"', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// veredito de 2026-09-10: ok\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toHaveLength(1);
        expect(violacoes[0].padrao).toBe('veredito de');
    });

    it('pega linha adicionada com "(achado 3)"', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// corrigido (achado 3)\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toHaveLength(1);
        expect(violacoes[0].padrao).toBe('achado N');
    });

    it('pega arquivo NÃO rastreado com "plan-7" no modo sem flag', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/base.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/novo.ts', '// nasceu na plan-7\n');

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: false });
        expect(violacoes).toEqual([{ arquivo: 'src/novo.ts', linha: 1, conteudo: '// nasceu na plan-7', padrao: 'plan-N' }]);
    });

    it('pega linha adicionada com "achado nº 3" (dígito a 4 caracteres do rótulo)', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// corrigido (achado nº 3)\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toHaveLength(1);
        expect(violacoes[0].padrao).toBe('achado N');
    });

    it('pega linha adicionada em caminho com acento, no modo --staged', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/Relatório.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/Relatório.ts', 'const a = 1;\n// ver plan-12\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([{ arquivo: 'src/Relatório.ts', linha: 2, conteudo: '// ver plan-12', padrao: 'plan-N' }]);
    });

    it('pega arquivo NÃO rastreado com acento, no modo sem flag', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/base.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/Relatório.ts', '// nasceu na plan-7\n');

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: false });
        expect(violacoes).toEqual([{ arquivo: 'src/Relatório.ts', linha: 1, conteudo: '// nasceu na plan-7', padrao: 'plan-N' }]);
    });
});

describe('checkTrailCitation — casos liberados', () => {
    it('libera "(achado 34, 15-divida-conhecida)" — ponteiro resolvível', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// ver 15-divida-conhecida (achado 34, 15-divida-conhecida)\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([]);
    });

    it('libera "generate-plan-index" — sem dígito depois de "plan-"', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// veja generate-plan-index\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([]);
    });

    it('libera linha REMOVIDA com "plan-12"', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', 'const a = 1;\n// ver plan-12\nconst b = 2;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', 'const a = 1;\nconst b = 2;\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([]);
    });

    it('libera arquivo já commitado com "plan-12" sem mudança nessa linha', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'src/foo.ts', '// ver plan-12\nconst a = 1;\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'src/foo.ts', '// ver plan-12\nconst a = 1;\nconst b = 2;\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([]);
    });

    it('libera arquivo ISENTO com "plan-12"', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'gates/scripts/contrato/check-trail-citation.mjs', '// gate\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'gates/scripts/contrato/check-trail-citation.mjs', '// gate\n// exemplo: plan-12\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([]);
    });

    it('libera arquivo FORA de src/gates/scripts/bin (docs/x.md)', () => {
        const dir = criarRepoVazio();
        escrever(dir, 'docs/x.md', '# doc\n');
        commitarTudo(dir, 'base');
        escrever(dir, 'docs/x.md', '# doc\ncitando plan-12 em prosa\n');
        git(dir, ['add', '-A']);

        const { violacoes } = checkTrailCitation({ cwd: dir, staged: true });
        expect(violacoes).toEqual([]);
    });
});

describe('checkTrailCitationExclusions — integridade da allowlist', () => {
    it('pega entrada com motivo vazio', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-trail-citation-excl-'));
        reposCriados.push(dir);
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');

        const { invalidas } = checkTrailCitationExclusions({ exclusions: { 'src/foo.ts': '' }, root: dir });
        expect(invalidas).toEqual([{ arquivo: 'src/foo.ts', problema: 'motivo vazio' }]);
    });

    it('pega entrada de arquivo que não existe (exclusão obsoleta)', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-trail-citation-excl-'));
        reposCriados.push(dir);

        const { invalidas } = checkTrailCitationExclusions({
            exclusions: { 'src/nao-existe.ts': 'motivo qualquer' },
            root: dir,
        });
        expect(invalidas).toEqual([{ arquivo: 'src/nao-existe.ts', problema: 'arquivo não existe (exclusão obsoleta)' }]);
    });

    it('libera entrada com motivo e arquivo existentes', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-trail-citation-excl-'));
        reposCriados.push(dir);
        escrever(dir, 'src/foo.ts', 'const a = 1;\n');

        const { invalidas } = checkTrailCitationExclusions({ exclusions: { 'src/foo.ts': 'motivo real' }, root: dir });
        expect(invalidas).toEqual([]);
    });

    it('a allowlist REAL do repositório passa', () => {
        const { invalidas } = checkTrailCitationExclusions();
        expect(invalidas).toEqual([]);
    });
});
