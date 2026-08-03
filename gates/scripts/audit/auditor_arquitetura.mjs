import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function getFiles(dir, extFilter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, extFilter, fileList);
    } else {
      if (extFilter.includes(path.extname(fullPath))) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function checkArchitecture(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const violations = [];
  const normalizedPath = filePath.replace(/\\/g, '/');

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text;
        
        // Rule 1: src/components (Atomic) CANNOT import from src/features
        if (normalizedPath.includes('src/components') && importPath.includes('features/')) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          violations.push(`Line ${line + 1}: Quebra de hierarquia. Componentes atômicos não podem importar features -> ${importPath}`);
        }
        
        // Rule 2: src/core CANNOT import from src/features
        if (normalizedPath.includes('src/core') && importPath.includes('features/')) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          violations.push(`Line ${line + 1}: Quebra de hierarquia. O Core não pode depender de features (Inversão de Dependência) -> ${importPath}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

const srcDir = path.resolve('src');
const allFiles = getFiles(srcDir, ['.ts', '.tsx']);

let totalViolations = 0;
console.log("--- Auditor de Arquitetura em Camadas (TS AST) ---");
for (const file of allFiles) {
  const violations = checkArchitecture(file);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach(v => console.log(`  - ${v}`));
    totalViolations += violations.length;
  }
}

if (totalViolations === 0) {
  console.log("\n[OK] Nenhuma quebra de hierarquia encontrada!");
  process.exit(0);
} else {
  console.log(`\n[ERROR] Encontradas ${totalViolations} violações de arquitetura de pastas.`);
  process.exit(1);
}
