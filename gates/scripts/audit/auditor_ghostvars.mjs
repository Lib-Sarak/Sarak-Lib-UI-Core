import fs from 'fs';
import path from 'path';

// ==========================================================================
// Auditor de Variáveis-Fantasma
// Detecta `var(--x)` consumido nos componentes/features que NÃO é emitido por
// nenhuma fonte real. Um consumo fora do registro = FANTASMA: a variável nunca
// resolve em runtime (espaçamento/cor colapsa silenciosamente).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO DE CONSUMO: apenas `src/components/` e `src/features/`.
//    `src/styles/` é lido SÓ como fonte emissora, nunca como consumidora, e
//    `src/core/` está inteiramente fora. Medido pela plan-06 (2026-08-03):
//    16 vars / 24 consumos não resolvidos em `styles/` — incluindo os 2 usos
//    do namespace PROIBIDO `--sx-*` (`_utilities.css:80,89`) — e 4 vars / 11
//    consumos em `core/`, dos quais 2 são prosa de comentário.
//    ⚠️ AMPLIAR ESTE ESCOPO É TRABALHO DA plan-12, e só DEPOIS do registro
//    abaixo existir: com o registro antigo, a mesma varredura acusava 36 vars /
//    128 consumos — ~85 acusações FALSAS.
// 2. A varredura de consumo é LINHA A LINHA POR REGEX, não por AST: um
//    `var(--x)` dentro de comentário conta como consumo. É a causa de 1 dos 3
//    fantasmas do baseline (`--token`, num JSDoc de SarakTypography.tsx:32).
// -------------------------------------------------------------------------

const SCHEMA_DIR = path.resolve('src/core/Design/schema');
const STYLES_DIR = path.resolve('src/styles');
// Emissores que NÃO são schema nem CSS: o manifesto de mapeamento token→var e o
// hook que injeta as variáveis em runtime. Ficaram fora do registro por anos, e
// é o que fazia a sonda de escopo ampliado acusar variável que EXISTE.
const MANIFEST_FILE = path.resolve('src/core/Provider/manifest.ts');
const RUNTIME_VARS_FILE = path.resolve('src/core/Design/hooks/useDesignVariables.ts');
const CONSUMER_DIRS = [path.resolve('src/components'), path.resolve('src/features')];

// Sufixos gerados dinamicamente pela engine (variantes cromáticas e responsivas).
// `-rgb` cobre a emissão por NOME COMPUTADO de `useDesignVariables.ts:121,134`
// (`variables[`${v}-rgb`] = variants.rgb`), que nenhum registro baseado em literal
// enxergaria. Só resolve para bases que já estão no registro — e é por isso que
// acrescentar o manifesto acima aumenta o alcance desta linha de graça.
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

// O MANIFESTO (`DESIGN_MANIFEST`) mapeia token → CSS var nos arrays `vars: [...]`.
// É a terceira fonte emissora, e ficou fora do registro desde sempre.
for (const file of [MANIFEST_FILE, RUNTIME_VARS_FILE]) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/['"`](--[a-z0-9-]+)['"`]/g)) registry.add(m[1]);
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
console.log(`Registro real: ${registry.size} variáveis emitidas (schemas + styles + manifesto + runtime).`);

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
