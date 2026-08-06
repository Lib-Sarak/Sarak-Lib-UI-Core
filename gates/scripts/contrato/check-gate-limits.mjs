// R18 — todo gate declara, no próprio código, qual é o seu escopo e o que
// ele NÃO vê. Este gate confere que TODO script em `gates/scripts/` (exceto
// libs/helpers/testes) tem um bloco reconhecível de limite declarado.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: só `gates/scripts/**/*.{mjs,ts,py}`, excluindo `__tests__/`,
//    `helpers/` e `allowlists/`. Os geradores de `scripts/` (que também
//    ganharam modo `--check` nesta plan — `generate-build-info.mjs`,
//    `generate-token-types.ts`) NÃO entram nesta varredura: o inventário
//    "17 scripts" que esta regra herda é o de `gates/scripts/`
//    especificamente (ver `gates/README.md`). Ampliar para `scripts/` é
//    extensão futura, não coberta aqui.
// 2. NÃO valida que o texto declarado seja VERDADEIRO ou completo — só que
//    existe um marcador reconhecível. Um bloco vago ("isto tem limites")
//    passaria; só a leitura humana pega isso.
// 3. Reconhece DOIS marcadores, de propósito: a frase canônica desta plan
//    ("LIMITES DECLARADOS") e a convenção informal pré-existente ("ponto
//    cego conhecido", usada em `auditor_hardcoded.mjs` antes de R18
//    existir) — não force a reescrita do que já cumpria o espírito da regra.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const GATES_SCRIPTS_DIR = path.join(ROOT, 'gates', 'scripts');
const EXCLUDED_DIR_SEGMENTS = new Set(['__tests__', 'helpers', 'allowlists']);
const MARKER_RE = /(LIMITES? DECLARADOS?|ponto cego conhecido)/i;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (!EXCLUDED_DIR_SEGMENTS.has(entry)) walk(full, out);
    } else if (/\.(mjs|ts|py)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

export function checkGateLimits({ root = ROOT } = {}) {
  const files = walk(path.join(root, 'gates', 'scripts'));
  const semLimite = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (!MARKER_RE.test(content)) {
      semLimite.push(path.relative(root, file).split(path.sep).join('/'));
    }
  }
  return { semLimite, total: files.length };
}

function main() {
  console.log('--- check-gate-limits (R18) ---');
  const { semLimite, total } = checkGateLimits();

  if (semLimite.length === 0) {
    console.log(`\n[OK] Os ${total} scripts de gates/scripts/ declaram o que não veem.`);
    process.exit(0);
  }

  console.log(`\n[ERROR] ${semLimite.length} de ${total} scripts SEM bloco de limite declarado:`);
  semLimite.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
