// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// `__tests__/` e `Mocks/` estão fora do escopo (ver exclusão em `getFiles`).
// Procura o TOKEN `any` na AST — não compila, então não pega erro de tipo
// que não passe por esse token (isso é R30/`tsc`, checagem diferente).
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function getFiles(dir, extFilter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('__tests__') && !fullPath.includes('Mocks')) {
        getFiles(fullPath, extFilter, fileList);
      }
    } else {
      if (extFilter.includes(path.extname(fullPath))) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function checkAnyUsage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const violations = [];

  function visit(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      violations.push(`Line ${line + 1}: 'any' type keyword used.`);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

const srcDir = path.resolve('src');
const allFiles = getFiles(srcDir, ['.ts', '.tsx']);

let totalViolations = 0;
console.log("--- Auditor de Typescript (Strict Any) (TS AST) ---");
for (const file of allFiles) {
  const violations = checkAnyUsage(file);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach(v => console.log(`  - ${v}`));
    totalViolations += violations.length;
  }
}

if (totalViolations === 0) {
  console.log("\n[OK] Nenhuma tipagem 'any' detectada!");
  process.exit(0);
} else {
  console.log(`\n[ERROR] Encontradas ${totalViolations} violações de uso de 'any'.`);
  process.exit(1);
}
