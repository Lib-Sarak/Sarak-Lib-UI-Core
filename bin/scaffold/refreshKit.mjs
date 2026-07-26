#!/usr/bin/env node
/**
 * `sarak-ui refresh` (e o legado `node .../bin/scaffold/refreshKit.mjs`, que os
 * `sarak:update` já gerados invocam por caminho) — entrada fina sobre `runRefreshKit`.
 *
 * Re-sincroniza o kit `sarak-ui/` e as cópias que o importador moveu para `specs/` e
 * `.claude/skills/`. NUNCA falha o comando de atualização: se o pacote instalado não
 * tiver o kit (versão anterior à Spec 50), avisa e sai com 0 — a lib já foi atualizada
 * com sucesso, e derrubar o `sarak:update` por causa disso seria pior.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRefreshKit } from './refreshKit/runRefreshKit.mjs';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function runRefreshCli({ cwd = process.cwd(), packageRoot = PACKAGE_ROOT } = {}) {
    const result = runRefreshKit({ rootDir: cwd, packageRoot });

    if (result.status === 'sem-kit') {
        return { output: '[sarak] a versão instalada da lib não traz o kit `sarak-ui/` — nada a re-sincronizar.', exitCode: 0 };
    }
    if (result.wasUpToDate) {
        return { output: `[sarak] kit já estava em dia; re-sincronizado assim mesmo: ${result.refreshed.join(', ')}`, exitCode: 0 };
    }
    return {
        output:
            `[sarak] kit ATUALIZADO: ${result.refreshed.join(', ')}\n` +
            '[sarak] releia `sarak-ui/START-HERE.md` — o catálogo desta versão mudou.',
        exitCode: 0,
    };
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith('refreshKit.mjs');
if (isDirectRun) {
    const { output, exitCode } = runRefreshCli({});
    if (output) console.log(output);
    process.exitCode = exitCode;
}
