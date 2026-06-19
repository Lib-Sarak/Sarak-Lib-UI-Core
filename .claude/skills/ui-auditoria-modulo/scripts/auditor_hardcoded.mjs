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

function checkHardcoded(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const violations = [];
  const hexPattern = /#[0-9a-fA-F]{3,6}\b/;
  const pxPattern = /^[1-9]\d*px$/;

  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.text;
      
      // Sanitização: Remove completamente os blocos de variáveis CSS que contém fallbacks
      // Exemplo que será removido: var(--theme-danger, #ef4444) ou var(--theme-danger,#ef4444)
      const sanitizedText = text.replace(/var\([^,]+,\s*#[0-9a-fA-F]{3,8}\s*\)/ig, '');
      
      // Verify HEX
      if (hexPattern.test(sanitizedText)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        violations.push(`Line ${line + 1}: Hardcoded hex color found -> ${text}`);
      }
      
      // Verify PX (excluding 0px which is common and often fine)
      if (pxPattern.test(sanitizedText)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        violations.push(`Line ${line + 1}: Hardcoded px value found -> ${text}`);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

const srcDir = path.resolve('src/components');
const featuresDir = path.resolve('src/features');
const allFiles = [...getFiles(srcDir, ['.tsx']), ...getFiles(featuresDir, ['.tsx'])];

let totalViolations = 0;
console.log("--- Auditor de Hardcoded UI (TS AST) ---");
for (const file of allFiles) {
  const violations = checkHardcoded(file);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach(v => console.log(`  - ${v}`));
    totalViolations += violations.length;
  }
}

if (totalViolations === 0) {
  console.log("\n[OK] Nenhum hardcoded detectado!");
  process.exit(0);
} else {
  console.log(`\n[ERROR] Encontradas ${totalViolations} violações de valores hardcoded (Hex ou Px).`);
  process.exit(1);
}
