// R27 — o consumidor nunca precisa de deep import. A superfície da lib é o
// barril (`src/index.ts`) mais o campo `exports` do `package.json`. Nenhum
// subcaminho fora da raiz e do CSS é uma porta declarada.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. Só confere o campo `exports` — a metade "o caminho não existe". A outra
//    metade da regra ("o barril cobre tudo que o consumidor precisa, então
//    ninguém PRECISA de deep import") já é coberta por R14 (`barrel:check`).
//    As duas juntas fecham R27; este gate cobra só a primeira.
// 2. Não cobre bundler tolerante a `exports` (alguns bundlers antigos
//    ignoram o campo e resolvem por caminho de arquivo mesmo assim) — isso é
//    limite do Node/bundler, não deste script.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ALLOWED_EXACT = new Set(['.']);
const ALLOWED_CSS_SUFFIX = /\.css$/;

export function checkExports(exportsField) {
  const problemas = [];
  if (!exportsField || typeof exportsField !== 'object') {
    return ['package.json não tem campo "exports" — sem ele, todo caminho de dist/ é resolvível por deep import.'];
  }

  for (const key of Object.keys(exportsField)) {
    if (ALLOWED_EXACT.has(key)) continue;
    if (ALLOWED_CSS_SUFFIX.test(key)) continue;
    problemas.push(`"exports"."${key}" não é a raiz nem um subcaminho de CSS — é uma porta de deep import não declarada no contrato (R27).`);
  }

  return problemas;
}

function main() {
  console.log('--- check-no-deep-import (R27) ---');
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  const problemas = checkExports(pkg.exports);

  if (problemas.length === 0) {
    console.log('[OK] "exports" só expõe a raiz e subcaminhos de CSS — nenhuma porta de deep import.');
    process.exit(0);
  }
  console.log('[ERROR] "exports" expõe caminho(s) fora do contrato:');
  problemas.forEach((p) => console.log(`  - ${p}`));
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
