#!/usr/bin/env node
/**
 * Última etapa do `npm run sarak:update` (Spec 50 §7) — entrada fina sobre
 * `runRefreshKit`. Re-sincroniza o kit `sarak-ui/` e as cópias que o importador
 * moveu para `specs/` e `.claude/skills/`.
 *
 * NUNCA falha o comando de atualização: se o pacote instalado não tiver o kit
 * (versão anterior à Spec 50), avisa e sai com 0 — a lib já foi atualizada com
 * sucesso, e derrubar o `sarak:update` por causa disso seria pior.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRefreshKit } from './refreshKit/runRefreshKit.mjs';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const result = runRefreshKit({ rootDir: process.cwd(), packageRoot: PACKAGE_ROOT });

if (result.status === 'sem-kit') {
    console.log('[sarak] a versão instalada da lib não traz o kit `sarak-ui/` — nada a re-sincronizar.');
} else if (result.wasUpToDate) {
    console.log(`[sarak] kit já estava em dia; re-sincronizado assim mesmo: ${result.refreshed.join(', ')}`);
} else {
    console.log(`[sarak] kit ATUALIZADO: ${result.refreshed.join(', ')}`);
    console.log('[sarak] releia `sarak-ui/START-HERE.md` — o catálogo desta versão mudou.');
}
