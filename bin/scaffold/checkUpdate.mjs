#!/usr/bin/env node
/**
 * `sarak-ui check` (e o legado `npm run sarak:check` apontando direto para este
 * arquivo) — entrada fina sobre `runCheckUpdate`.
 *
 * Dois contratos de saída, deliberadamente diferentes (Spec 51 — L1):
 *  - **normal:** imprime o veredito e sai com 1 se a verificação falhou OU se está
 *    desatualizado (compõe com automação/CI);
 *  - **`--notify`:** imprime SÓ quando há atualização a fazer e sai **sempre com 0**.
 *    É o modo do `predev` do consumidor: um aviso jamais pode derrubar o `dev` dele.
 */
import { runCheckUpdate } from './checkUpdate/runCheckUpdate.mjs';
import { formatNotice } from './checkUpdate/formatNotice.mjs';

export function runCheckCli({ argv = [], cwd = process.cwd() } = {}) {
    const notify = argv.includes('--notify');
    let result;
    try {
        result = runCheckUpdate({ rootDir: cwd });
    } catch (err) {
        // No modo aviso, QUALQUER falha é silêncio: o consumidor está tentando rodar o
        // projeto dele, não depurar a nossa verificação.
        if (notify) return { output: null, exitCode: 0 };
        return { output: `[sarak:check] Falhou: ${err instanceof Error ? err.message : String(err)}`, exitCode: 1 };
    }

    if (notify) return { output: formatNotice(result), exitCode: 0 };
    return { output: result.message, exitCode: !result.ok || result.upToDate === false ? 1 : 0 };
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith('checkUpdate.mjs');
if (isDirectRun) {
    const { output, exitCode } = runCheckCli({ argv: process.argv.slice(2) });
    if (output) console.log(output);
    process.exitCode = exitCode;
}
