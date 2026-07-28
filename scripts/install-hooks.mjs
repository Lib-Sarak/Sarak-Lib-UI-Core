/**
 * Instalação IDEMPOTENTE do enforcement por commit
 * (spec `specs/specs/02-enforcement-por-commit.md`).
 *
 * O repositório usa `core.hooksPath` apontando para `.githooks/` VERSIONADO — não usa
 * husky nem lint-staged. Vantagem: o hook viaja no próprio repositório, é auditável no
 * diff, e não coloca `node_modules` no caminho crítico do commit. Preço: quem clona
 * precisa rodar isto uma vez (o git não configura `core.hooksPath` sozinho).
 *
 * Seguro de rodar quantas vezes quiser: só escreve quando o valor está diferente.
 *
 * Uso: `npm run hooks:install`
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOOKS_DIR = '.githooks';
const HOOK_FILES = ['pre-commit'];

const git = (...args) => spawnSync('git', args, { encoding: 'utf8', cwd: ROOT });

const configurarHooksPath = () => {
    const atual = git('config', '--local', 'core.hooksPath').stdout.trim();
    if (atual === HOOKS_DIR) {
        console.log(`[hooks:install] core.hooksPath já é "${HOOKS_DIR}".`);
        return;
    }
    const resultado = git('config', '--local', 'core.hooksPath', HOOKS_DIR);
    if (resultado.status !== 0) {
        console.error(`[hooks:install] FALHOU ao configurar core.hooksPath: ${resultado.stderr.trim()}`);
        process.exit(1);
    }
    const antes = atual ? `"${atual}"` : '(não configurado)';
    console.log(`[hooks:install] core.hooksPath: ${antes} -> "${HOOKS_DIR}"`);
};

/**
 * Garante o bit de execução. No Windows o modo de arquivo não existe de verdade, mas o
 * git guarda o bit no índice — sem ele, o hook é ignorado em máquinas POSIX.
 *
 * `update-index --chmod=+x` ESCREVE NO ÍNDICE. Por isso só é chamado quando o modo
 * registrado ainda não é 100755: caso contrário, rodar o instalador antes de um commit
 * qualquer plantaria uma mudança de modo no staged sem ninguém pedir.
 */
const garantirExecutavel = () => {
    for (const nome of HOOK_FILES) {
        const caminho = `${HOOKS_DIR}/${nome}`;
        const arquivo = path.join(ROOT, HOOKS_DIR, nome);
        if (!fs.existsSync(arquivo)) {
            console.error(`[hooks:install] FALHOU — ${caminho} não existe.`);
            process.exit(1);
        }
        fs.chmodSync(arquivo, 0o755);

        const modo = git('ls-files', '-s', caminho).stdout.trim().split(' ')[0];
        if (modo === '100755') {
            console.log(`[hooks:install] ${caminho} já é executável no índice.`);
            continue;
        }
        git('update-index', '--chmod=+x', caminho);
        console.log(`[hooks:install] ${caminho} marcado como executável — ATENÇÃO: isto foi para o STAGED.`);
        console.log('               Commite a mudança de modo (ou rode `git reset` se não era a hora).');
    }
};

configurarHooksPath();
garantirExecutavel();
console.log('[hooks:install] pronto. O gate de segredos + os Anéis 1 e 2 rodam no próximo commit.');
