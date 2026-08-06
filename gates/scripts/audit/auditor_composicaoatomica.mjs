// Auditor de composição atômica obrigatória (R10 — proibido `<button>`,
// `<input>` ou `<select>` cru no que o consumidor embute no produto dele).
// A fronteira é a tabela de R10 (specs/specs/00-regras-e-invariantes.md,
// decisão do dono, 2026-08-05) — este script não decide fronteira, aplica.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// 1. SÓ A METADE "HTML NATIVO CRU" DE R10. A outra metade — `switch`/`case`
//    de design ou `<style>` de roteamento dentro do JSX — **não tem
//    detector nenhum ainda**. R10 continua ⚠️ (escopo menor que a regra)
//    até essa metade nascer, e ela não é desta plan (plan-16, §3.2).
// 2. `src/features/**` está FORA por decisão do dono, não por omissão: é
//    ferramenta de autoria da própria lib (mesmo critério da allowlist do
//    `zero-brand:check`, [[006-zero-marca-soberania-host]]). Medido em
//    2026-08-05: **64 ocorrências** vivem lá, sem gate nenhum sobre elas —
//    se features/ um dia deixar de ser só autoria interna, este número
//    precisa ser revisitado.
// 3. `src/components/atomic/Buttons/` e `.../Inputs/` são a IMPLEMENTAÇÃO
//    do átomo — o elemento nativo ali é o alvo da regra (o que o átomo
//    encapsula), não a violação. Excluídos por substring de caminho.
// 4. Detecta só `JsxOpeningElement`/`JsxSelfClosingElement` cujo `tagName`
//    é um `Identifier` simples e minúsculo (`button`/`input`/`select`) —
//    é a forma como o TypeScript/React já distingue elemento nativo
//    (minúsculo) de componente (maiúsculo); não resolve alias nem
//    `React.createElement('button', …)` fora de JSX.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const SCOPE = ['src/components', 'src/core'];
const NATIVE_TAGS = new Set(['button', 'input', 'select']);
const EXCLUDE_PATH_SEGMENTS = [
  'components/atomic/Buttons',
  'components/atomic/Inputs',
  '__tests__',
  '__e2e__',
  'Mocks',
];

function isExcluded(relPath) {
  const normalized = relPath.split(path.sep).join('/');
  return EXCLUDE_PATH_SEGMENTS.some((seg) => normalized.includes(seg));
}

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(process.cwd(), full);
    if (isExcluded(rel)) continue;
    if (fs.statSync(full).isDirectory()) {
      getFiles(full, fileList);
    } else if (full.endsWith('.tsx')) {
      fileList.push(full);
    }
  }
  return fileList;
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

function checkFile(sourceFile) {
  const violations = [];

  function visit(node) {
    const isOpening = ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node);
    if (isOpening && ts.isIdentifier(node.tagName)) {
      const name = node.tagName.text;
      if (NATIVE_TAGS.has(name)) {
        violations.push(`Line ${lineOf(sourceFile, node)}: <${name}> nativo cru — use o átomo Sarak correspondente`);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

console.log('--- Auditor de Composição Atômica (R10) ---');

const files = SCOPE.flatMap((dir) => getFiles(path.resolve(dir)));
let total = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations = checkFile(sourceFile);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach((v) => console.log(`  - ${v}`));
    total += violations.length;
  }
}

if (total === 0) {
  console.log('\n[OK] Nenhum elemento nativo cru fora dos átomos.');
  process.exit(0);
} else {
  console.log(`\n[ERROR] ${total} ocorrência(s) de composição atômica violada (R10).`);
  process.exit(1);
}
