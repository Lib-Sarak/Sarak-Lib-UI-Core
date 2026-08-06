import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: `src/components/`, `src/features/`, `src/core/`, `src/shared/`,
//    `src/effects/` e `src/constants/` (os três últimos, ampliados pela
//    plan-12 — vão 6 de [[01-gates-e-baseline]] §9.2). `src/styles/` não
//    entra: não há componente/hook lá, só CSS.
// 2. Arquivos `index*` são ignorados (barril, não lógica).
// 3. `.ts` só entra na cobrança se o nome começar com `use` — utilitário
//    `.ts` puro (ex.: `services/api.ts`, `types/index.ts`) não é hook e não
//    é cobrado por esta regra na letra (R8 é sobre "componente e hook").
// -------------------------------------------------------------------------

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
      // Exclude index files usually just exporting
      const baseName = path.basename(fullPath);
      // Ignorar pastas de testes
      if (fullPath.includes('__tests__') || fullPath.includes('__e2e__') || fullPath.includes('.spec.') || fullPath.includes('.test.')) {
        continue;
      }
      if (extFilter.includes(path.extname(fullPath)) && !baseName.startsWith('index')) {
        // Se for .ts, tem que ser hook (comecar com use)
        if (fullPath.endsWith('.ts')) {
          if (baseName.startsWith('use')) {
            fileList.push(fullPath);
          }
        } else {
          fileList.push(fullPath);
        }
      }
    }
  }
  return fileList;
}

function checkCoverage(filePath) {
  const parentDir = path.dirname(filePath);
  const fileName = path.parse(filePath).name;
  
  const isHook = filePath.endsWith('.ts');
  const testExt = isHook ? '.test.ts' : '.test.tsx';
  
  const testFilePath = path.join(parentDir, '__tests__', `${fileName}${testExt}`);
  const testFilePathAlt = path.join(parentDir, '__tests__', `${fileName}.test.tsx`); // as vezes hooks sao testados com tsx
  
  if (!fs.existsSync(testFilePath) && !fs.existsSync(testFilePathAlt)) {
    return { hasTest: false, expectedPath: testFilePath };
  }
  
  return { hasTest: true, expectedPath: testFilePath };
}

const SCOPE_DIRS = [
  'src/components',
  'src/features',
  'src/core',
  'src/shared',
  'src/effects',
  'src/constants',
];

const allFiles = SCOPE_DIRS.flatMap((dir) => getFiles(path.resolve(dir), ['.tsx', '.ts']));

let totalViolations = 0;
console.log("--- Auditor de Cobertura de Testes (FS Node) ---");
for (const file of allFiles) {
  const { hasTest, expectedPath } = checkCoverage(file);
  if (!hasTest) {
    console.log(`\n[FAIL] Componente sem teste: ${path.basename(file)}`);
    console.log(`  - Esperado: ${path.relative(process.cwd(), expectedPath)}`);
    totalViolations++;
  }
}

if (totalViolations === 0) {
  console.log("\n[OK] Todos os componentes possuem testes!");
  process.exit(0);
} else {
  console.log(`\n[ERROR] Encontrados ${totalViolations} componentes órfãos (sem arquivo de teste correspondente).`);
  process.exit(1);
}
