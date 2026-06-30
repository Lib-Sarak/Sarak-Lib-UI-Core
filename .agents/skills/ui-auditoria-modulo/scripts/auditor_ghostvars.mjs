import fs from 'fs';
import path from 'path';

// ==========================================================================
// Auditor de Variáveis-Fantasma
// Detecta `var(--x)` consumido nos componentes/features que NÃO é emitido por
// nenhuma fonte real (schemas da engine via cssVars / auto --sarak-<id> /
// definições em src/styles/*.css). Um consumo fora do registro = FANTASMA:
// a variável nunca resolve em runtime (espaçamento/cor colapsa silenciosamente).
// ==========================================================================

const SCHEMA_DIR = path.resolve('src/core/Design/schema');
const STYLES_DIR = path.resolve('src/styles');
const CONSUMER_DIRS = [path.resolve('src/components'), path.resolve('src/features')];

// Sufixos gerados dinamicamente pela engine (variantes cromáticas e responsivas).
const GENERATED_SUFFIXES = ['-rgb', '-bg', '-border', '-text', '-hover', '-active', '-light', '-glow',
  '-10', '-20', '-30', '-40', '-50', '-60', '-70', '-80', '-90', '-100'];

const ALLOWLIST = new Set([]);

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('__tests__') && !full.includes('Mocks')) walk(full, exts, out);
    } else if (exts.includes(path.extname(full))) {
      out.push(full);
    }
  }
  return out;
}

const kebab = (id) => id.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// --- 1. Construir o REGISTRO de variáveis REAIS -------------------------------
const registry = new Set();

for (const file of walk(SCHEMA_DIR, ['.ts'])) {
  const src = fs.readFileSync(file, 'utf8');
  // auto-var: --sarak-<kebab(id)>
  for (const m of src.matchAll(/\bid:\s*['"]([A-Za-z0-9]+)['"]/g)) {
    registry.add(`--sarak-${kebab(m[1])}`);
  }
  // cssVars: ['--x', '--y']
  for (const block of src.matchAll(/cssVars:\s*\[([^\]]*)\]/g)) {
    for (const v of block[1].matchAll(/['"](--[a-z0-9-]+)['"]/g)) registry.add(v[1]);
  }
}

// Variáveis definidas em CSS (src/styles): lado esquerdo `--x:`
for (const file of walk(STYLES_DIR, ['.css'])) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/(^|[\s;{])(--[a-z0-9-]+)\s*:/g)) registry.add(m[2]);
}

// Expandir com sufixos gerados
for (const base of [...registry]) {
  for (const sfx of GENERATED_SUFFIXES) registry.add(base + sfx);
}

// --- 2. Varrer o CONSUMO e cruzar com o registro ------------------------------
const consumed = {}; // varName -> [{file, line}]
for (const dir of CONSUMER_DIRS) {
  for (const file of walk(dir, ['.tsx', '.ts'])) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        const name = m[1];
        (consumed[name] ||= []).push({ file: path.relative(process.cwd(), file), line: i + 1 });
      }
    });
  }
}

// --- 3. Relatório -------------------------------------------------------------
console.log('--- Auditor de Variáveis-Fantasma ---');
console.log(`Registro real: ${registry.size} variáveis emitidas (schemas + styles).`);

const ghosts = Object.entries(consumed)
  .filter(([name]) => !registry.has(name) && !ALLOWLIST.has(name))
  .sort((a, b) => b[1].length - a[1].length);

const totalGhostUses = ghosts.reduce((s, [, occ]) => s + occ.length, 0);

if (ghosts.length === 0) {
  console.log('\n[OK] Nenhuma variável-fantasma consumida.');
  process.exit(0);
}

console.log(`\n[ERROR] ${ghosts.length} variáveis-fantasma distintas, ${totalGhostUses} consumos que NÃO resolvem:\n`);
for (const [name, occ] of ghosts.slice(0, 40)) {
  console.log(`  ${String(occ.length).padStart(4)}x  ${name}`);
}
if (ghosts.length > 40) console.log(`  ... (+${ghosts.length - 40} variáveis)`);

// Agrupamento por prefixo (família)
const byPrefix = {};
for (const [name, occ] of ghosts) {
  const pfx = name.split('-').slice(0, 3).join('-');
  byPrefix[pfx] = (byPrefix[pfx] || 0) + occ.length;
}
console.log('\n--- Por família (top 10) ---');
for (const [pfx, n] of Object.entries(byPrefix).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(n).padStart(4)}x  ${pfx}-*`);
}

console.log(`\n[ERROR] Total: ${totalGhostUses} consumos de variáveis-fantasma.`);
process.exit(1);
