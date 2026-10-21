// Tema sob demanda — a trava ESTRUTURAL do boot. O fecho de imports ESTÁTICOS do
// entry (`src/index.ts` e `dist/index.js`) não pode conter nenhum tema embarcado
// além do padrão (`SARAK_DEFAULT_THEME_ID`), nem o módulo `themes/all.ts`. Um tema
// só chega ao consumidor por `import()` (`themes/loaders.ts`).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. NÃO mede PESO — isso é `scripts/measure-consumer-boot.mjs` (teto relativo, no
//    bundler do consumidor). Este gate só prova a ESTRUTURA: quem está no fecho
//    estático. Um módulo grande que não é tema passa daqui e é pego lá.
// 2. Em `src/`, só segue `import`/`export ... from` com especificador RELATIVO e
//    resolve `.ts`/`.tsx`/`index.ts`. Alias de path, `require()` e `import()`
//    (de propósito: é a fronteira lazy) não entram no grafo.
// 3. Em `dist/`, o fecho é o de `import`/`export from "./chunk-*.js"` por regex
//    sobre o ESM minificado, e o tema é reconhecido pelo marcador
//    `id:"<id>",name:"…",description:"…",design:{` (a forma do objeto do tema,
//    distinta da entrada do catálogo leve). Se o minificador mudar a forma do
//    literal, o marcador some — por isso o gate EXIGE achar o marcador de todo
//    tema em algum arquivo de `dist/` (controle positivo) e falha, cego, se não.
// 4. NÃO enxerga o `index.cjs`: o CJS não é dividido em pedaços (um arquivo só),
//    então lá todo tema está "no fecho" por construção — o consumidor que importa
//    o CJS não ganha a divisão; o boot que a trava protege é o do ESM.
// 5. Tema novo cujo arquivo não leva o nome do id não é reconhecido em `src/`
//    (o gate lê os ids de `SARAK_THEME_PRESET_IDS`); o teste de paridade
//    `themeCatalogParity.test.ts` cobra id ↔ arquivo ↔ loader ↔ `all.ts`.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const THEMES_DIR = 'src/core/Design/presets/themes';

/** Lê `SARAK_THEME_PRESET_IDS` e `SARAK_DEFAULT_THEME_ID` do FONTE de `themes/index.ts`. */
export function readThemeIds(indexSource) {
  const source = ts.createSourceFile('index.ts', indexSource, ts.ScriptTarget.Latest, true);
  const ids = [];
  let defaultId = null;
  const unwrap = (node) => {
    let current = node;
    while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current)) current = current.expression;
    return current;
  };
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const name = node.name.getText(source);
      const init = unwrap(node.initializer);
      if (name === 'SARAK_THEME_PRESET_IDS' && ts.isArrayLiteralExpression(init)) {
        init.elements.forEach((element) => ts.isStringLiteral(element) && ids.push(element.text));
      }
      if (name === 'SARAK_DEFAULT_THEME_ID' && ts.isStringLiteral(init)) defaultId = init.text;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { ids, defaultId };
}

/** Os especificadores relativos que a fonte importa em tempo de carga (nunca `import type`, nunca `import()`). */
export function staticSpecifiers(sourceText, fileName = 'file.ts') {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
  const specs = [];
  source.statements.forEach((statement) => {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const clause = statement.importClause;
      if (clause && clause.isTypeOnly) return;
      const named = clause && clause.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : null;
      const onlyTypes = clause && !clause.name && named && named.length > 0 && named.every((element) => element.isTypeOnly);
      if (onlyTypes) return;
      specs.push(statement.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      if (statement.isTypeOnly) return;
      specs.push(statement.moduleSpecifier.text);
    }
  });
  return specs.filter((spec) => spec.startsWith('.'));
}

/**
 * O fecho estático a partir de `entry` (caminho relativo à raiz, com `/`).
 * `readFile(rel)` devolve o texto ou `null` — injetável para o teste de mutação.
 */
export function staticClosure(entry, readFile) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const current = queue.pop();
    if (seen.has(current)) continue;
    const text = readFile(current);
    if (text === null) continue;
    seen.add(current);
    const dir = path.posix.dirname(current);
    for (const spec of staticSpecifiers(text, current)) {
      const base = path.posix.normalize(path.posix.join(dir, spec));
      const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
      const hit = candidates.find((candidate) => readFile(candidate) !== null);
      if (hit) queue.push(hit);
    }
  }
  return seen;
}

/** Os módulos do fecho que são tema embarcado (≠ padrão) ou o `all.ts`. */
export function findSrcLeaks(closure, ids, defaultId) {
  const leaks = [];
  for (const file of closure) {
    if (!file.startsWith(`${THEMES_DIR}/`)) continue;
    const base = file.slice(THEMES_DIR.length + 1).replace(/\.tsx?$/, '');
    if (base === 'all') leaks.push(file);
    if (ids.includes(base) && base !== defaultId) leaks.push(file);
  }
  return leaks;
}

/** O fecho estático de `dist/index.js` (regex sobre o ESM minificado). */
export function distClosure(distDir, readFile) {
  const seen = new Set();
  const queue = ['index.js'];
  const re = /(?:from|import)\s*"(\.\/[^"]+\.js)"/g;
  while (queue.length > 0) {
    const current = queue.pop();
    if (seen.has(current)) continue;
    const text = readFile(path.posix.join(distDir, current));
    if (text === null) continue;
    seen.add(current);
    for (const match of text.matchAll(re)) {
      queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(current), match[1])));
    }
  }
  return seen;
}

const themeBodyMarker = (id) => new RegExp(`id:"${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",name:"[^"]*",description:[\\s\\S]{0,1500}?,design:\\{`);

/** Quais temas (≠ padrão) têm o corpo dentro dos arquivos `files` (texto por arquivo). */
export function findDistLeaks(files, ids, defaultId) {
  return ids.filter((id) => id !== defaultId && [...files.values()].some((text) => themeBodyMarker(id).test(text)));
}

/** Controle positivo: o marcador de CADA tema (inclusive o padrão) existe em algum arquivo de `dist/`. */
export function findBlindIds(allDistFiles, ids) {
  return ids.filter((id) => ![...allDistFiles.values()].some((text) => themeBodyMarker(id).test(text)));
}

function readSrc(root) {
  return (rel) => {
    const abs = path.join(root, rel);
    return fs.existsSync(abs) && fs.statSync(abs).isFile() ? fs.readFileSync(abs, 'utf8') : null;
  };
}

export function runChecks({ root = ROOT, mode = 'all' } = {}) {
  const problems = [];
  const { ids, defaultId } = readThemeIds(fs.readFileSync(path.join(root, THEMES_DIR, 'index.ts'), 'utf8'));
  if (ids.length === 0 || !defaultId) {
    return ['Não achei SARAK_THEME_PRESET_IDS / SARAK_DEFAULT_THEME_ID em themes/index.ts — o gate ficou cego.'];
  }

  if (mode === 'all' || mode === 'src') {
    const closure = staticClosure('src/index.ts', readSrc(root));
    findSrcLeaks(closure, ids, defaultId).forEach((leak) => {
      problems.push(`src: ${leak} está no fecho estático de src/index.ts — o tema volta ao boot de todo consumidor.`);
    });
  }

  if (mode === 'all' || mode === 'dist') {
    const distDir = path.join(root, 'dist');
    if (!fs.existsSync(path.join(distDir, 'index.js'))) {
      if (mode === 'dist') problems.push('dist/index.js não existe — rode `npm run build:js` antes.');
      return problems;
    }
    const all = new Map(fs.readdirSync(distDir).filter((f) => f.endsWith('.js')).map((f) => [f, fs.readFileSync(path.join(distDir, f), 'utf8')]));
    const boot = new Map([...distClosure('dist', (rel) => (all.has(path.posix.basename(rel)) ? all.get(path.posix.basename(rel)) : null))]
      .map((f) => [f, all.get(f)]));
    findBlindIds(all, ids).forEach((id) => problems.push(`dist: marcador do tema "${id}" não aparece em nenhum arquivo de dist/ — o gate está cego para ele.`));
    findDistLeaks(boot, ids, defaultId).forEach((id) => {
      problems.push(`dist: o corpo do tema "${id}" está no fecho estático de dist/index.js — voltou ao boot.`);
    });
  }
  return problems;
}

function main() {
  console.log('--- check-theme-boot-closure ---');
  let mode = 'all';
  if (process.argv.includes('--src')) mode = 'src';
  if (process.argv.includes('--dist')) mode = 'dist';
  const problems = runChecks({ mode });
  if (problems.length === 0) {
    console.log(`[OK] só o tema padrão está no fecho estático do entry (${mode}).`);
    process.exit(0);
  }
  console.log('[ERROR] tema fora do lugar no boot:');
  problems.forEach((problem) => console.log(`  - ${problem}`));
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
