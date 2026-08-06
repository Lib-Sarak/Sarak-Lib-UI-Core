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
// 1. ESCOPO DE CONSUMO (plan-12, vãos 2 e 3): `src/components/`,
//    `src/features/`, `src/styles/` e `src/core/` — os quatro. `src/styles/`
//    ampliado para valer também como CONSUMIDORA (antes só fonte emissora):
//    um `var(--x, var(--y))` dentro do próprio CSS onde `--y` nunca é
//    emitido em lugar nenhum é o MESMO defeito que um componente consumir
//    fantasma, só que o achado 1 (namespace `--sx-*`) já foi corrigido no
//    código antes desta ampliação — o gate mede o que sobrou.
//    ⚠️ AMPLIAR ESTE ESCOPO SEM O REGISTRO DE 4 FONTES (schema + styles +
//    manifest + runtime, ver abaixo) produz acusação falsa — medido pela
//    plan-06: com o registro antigo (2 fontes) a mesma varredura de
//    `src/styles/` acusava 36 vars / 128 consumos; com as 4 fontes, cai para
//    a exposição real medida pela plan-12 (ver baseline).
// 2. A varredura de consumo é LINHA A LINHA POR REGEX, não por AST — MAS
//    (conserto da plan-12, vão 3) o conteúdo de comentário de bloco
//    (`/* ... */`, inclusive JSDoc `/** ... */`) e de linha (`//`) é
//    REMOVIDO antes de varrer. Isso fecha a classe de falso-positivo mais
//    comum ("--x"/"--sarak-" citados como PADRÃO em prosa/JSDoc, não como
//    consumo real) — é o que os dois falsos positivos do vão 3 eram. O que
//    ISSO NÃO FECHA: um literal de exemplo dentro de uma STRING de código
//    real (não comentário) — ex.: um `console.warn` que cita
//    `var(--x, 16px)` como ilustração numa mensagem de erro. Esse caso
//    permanece contado (é código de verdade, só que o valor é texto de
//    ajuda, não CSS) — visto e aceito como exposição residual, não como
//    defeito do gate: distinguir "string que parece CSS" de "string que É
//    CSS" exige resolução de contexto que uma varredura por regex não tem.
// 3. ⚠️ FALSO NEGATIVO em `.css` (achado do veredito da plan-12, correção 1):
//    `stripComments()` corta `//.*$` LINHA A LINHA em TODOS os arquivos —
//    inclusive `.css`, onde `//` NÃO é comentário. Numa linha hipotética como
//    `background: url(https://cdn/x.png), var(--sarak-overlay-bg);`, o corte
//    apagaria o `var()` real que vem DEPOIS do `//` de `https://` — o
//    consumo deixaria de ser visto (o oposto do item 2: aqui o gate PERDE
//    um fantasma real, não ganha um falso positivo). Medido nesta correção,
//    varrendo os 4 `CONSUMER_DIRS`: **exposição ZERO hoje** — só 2 linhas em
//    todo o escopo têm `//` antes de um `var(...)`
//    (`src/core/Design/hooks/useDesignVariables.ts:57` e
//    `SarakShell.test.tsx:133`), e as duas são comentário de verdade (a
//    segunda nem chega a ser varrida — `__tests__/` é excluído por `walk()`
//    antes de chegar aqui). Exposição zero não apaga o vão: ele reaparece no
//    dia em que uma URL `https://` compartilhar linha com um `var()` real
//    num `.css` novo — daí a declaração, mesmo com o número em zero (mesmo
//    padrão dos vãos 9/10 da plan-06: "declarar já é o suficiente quando a
//    exposição é zero").
// -------------------------------------------------------------------------

const SCHEMA_DIR = path.resolve('src/core/Design/schema');
const STYLES_DIR = path.resolve('src/styles');
// Emissores que NÃO são schema nem CSS: o manifesto de mapeamento token→var e o
// hook que injeta as variáveis em runtime. Ficaram fora do registro por anos, e
// é o que fazia a sonda de escopo ampliado acusar variável que EXISTE.
const MANIFEST_FILE = path.resolve('src/core/Provider/manifest.ts');
const RUNTIME_VARS_FILE = path.resolve('src/core/Design/hooks/useDesignVariables.ts');
const CONSUMER_DIRS = [
  path.resolve('src/components'),
  path.resolve('src/features'),
  path.resolve('src/styles'),
  path.resolve('src/core'),
];

/** Remove comentário de bloco (inclusive JSDoc) e de linha antes de varrer
 * consumo — sem isso, `var(--x)` citado como PADRÃO em prosa conta como
 * consumo real (era a causa de 2 dos 3 fantasmas do baseline antigo). */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
}

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
  for (const file of walk(dir, ['.tsx', '.ts', '.css'])) {
    const semComentario = stripComments(fs.readFileSync(file, 'utf8'));
    const lines = semComentario.split('\n');
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
