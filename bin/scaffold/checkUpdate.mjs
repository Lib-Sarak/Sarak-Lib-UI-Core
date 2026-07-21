#!/usr/bin/env node
/**
 * `npm run sarak:check` (Spec 39 follow-up) — entrada fina sobre `runCheckUpdate`
 * (Node puro, sem dependência nova). Sai com `exit 1` se a verificação falhou OU
 * se o consumidor estiver desatualizado, para compor com automação/CI.
 */
import { runCheckUpdate } from './checkUpdate/runCheckUpdate.mjs';

const result = runCheckUpdate({});
console.log(result.message);

if (!result.ok || result.upToDate === false) {
    process.exitCode = 1;
}
