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

function checkCleanCode(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const violations = [];
  const MAX_LINES = 250;
  
  const totalLines = sourceFile.getLineAndCharacterOfPosition(sourceFile.getEnd()).line + 1;
  const normalizedPath = filePath.replace(/\\/g, '/');
  const isThemeOrSchema = normalizedPath.includes('/presets/themes/') || normalizedPath.includes('/Design/schema/') || normalizedPath.includes('/Design/master-map');
  
  if (totalLines > MAX_LINES && !isThemeOrSchema) {
    violations.push(`Line 1: Arquivo gigantesco. Possui ${totalLines} linhas. Considere componentizar ou criar Custom Hooks.`);
  }

  function visit(node, depth = 0, stateCountContext = { count: 0 }) {
    if (ts.isIfStatement(node)) {
      if (depth > 2) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        violations.push(`Line ${line + 1}: Aninhamento de if muito profundo (${depth} níveis). Use Early Returns.`);
      }
      
      // Check for else if
      if (node.elseStatement && ts.isIfStatement(node.elseStatement)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.elseStatement.getStart());
        violations.push(`Line ${line + 1}: Uso de 'else if' detectado na AST. Refatore para Early Returns ou Pattern Matching.`);
      }
      
      ts.forEachChild(node, child => visit(child, depth + 1, stateCountContext));
    } else if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      // New context for state counting
      const newContext = { count: 0, nodeStart: node.getStart() };
      ts.forEachChild(node, child => visit(child, depth, newContext));
      
      if (newContext.count >= 4) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(newContext.nodeStart);
        violations.push(`Line ${line + 1}: Componente ou Hook com excesso de estado (${newContext.count} useState/useEffect). Extraia a lógica para um Custom Hook dedicado.`);
      }
    } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const callName = node.expression.text;
      if (callName === 'useState' || callName === 'useReducer' || callName === 'useEffect') {
        stateCountContext.count++;
      }
      // If it uses React.useState
      ts.forEachChild(node, child => visit(child, depth, stateCountContext));
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
       const propAccess = node.expression;
       if (ts.isIdentifier(propAccess.name)) {
         const callName = propAccess.name.text;
         if (callName === 'useState' || callName === 'useReducer' || callName === 'useEffect') {
           stateCountContext.count++;
         }
       }
       ts.forEachChild(node, child => visit(child, depth, stateCountContext));
    } else {
      // Just keep traversing with the same depth context for ifs
      ts.forEachChild(node, child => visit(child, depth, stateCountContext));
    }
  }

  visit(sourceFile);
  return violations;
}

const srcDir = path.resolve('src');
const allFiles = getFiles(srcDir, ['.ts', '.tsx']);

let totalViolations = 0;
console.log("--- Auditor de Clean Code (TS AST) ---");
for (const file of allFiles) {
  const violations = checkCleanCode(file);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach(v => console.log(`  - ${v}`));
    totalViolations += violations.length;
  }
}

if (totalViolations === 0) {
  console.log("\n[OK] Nenhum crime de Clean Code detectado!");
  process.exit(0);
} else {
  console.log(`\n[WARNING] Encontradas ${totalViolations} violações de Clean Code (Avisos de densidade e aninhamento).`);
  process.exit(1);
}
