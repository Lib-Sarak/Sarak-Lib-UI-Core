import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function extractJsonKeys(mappingPath) {
  const content = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const allKeys = [];
  for (const group in content) {
    if (Array.isArray(content[group])) {
      allKeys.push(...content[group]);
    }
  }
  return allKeys;
}

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

function extractTsProperties(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const properties = new Set();

  function visit(node) {
    // Em vez de procurar interfaces Typescript abstratas, a Sarak UI Core 
    // usa um dicionário ComponentSchema com propriedades "id".
    if (ts.isPropertyAssignment(node)) {
      if (node.name && ts.isIdentifier(node.name) && node.name.text === 'id') {
        if (node.initializer && ts.isStringLiteral(node.initializer)) {
          properties.add(node.initializer.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return properties;
}

const mappingFile = path.resolve('src/core/Design/catalog/theme_table_mapping.json');
const schemaDir = path.resolve('src/core/Design/schema');

console.log("--- Auditor de Paridade de Design Tokens (AST/JSON) ---");

if (!fs.existsSync(mappingFile) || !fs.existsSync(schemaDir)) {
  console.log("\n[WARNING] mapping.json ou pasta schema não encontrados. Pulando...");
  process.exit(0);
}

const expectedKeys = extractJsonKeys(mappingFile);
const schemaFiles = getFiles(schemaDir, ['.ts']);

const foundKeys = new Set();
for (const file of schemaFiles) {
  const props = extractTsProperties(file);
  props.forEach(p => foundKeys.add(p));
}

let totalViolations = 0;
const missingKeys = [];

for (const key of expectedKeys) {
  if (!foundKeys.has(key)) {
    missingKeys.push(key);
    totalViolations++;
  }
}

if (totalViolations === 0) {
  console.log("\n[OK] Paridade perfeita 1:1! Todas as chaves do banco de dados existem nos Schemas TS.");
  process.exit(0);
} else {
  console.log(`\n[FAIL] Faltam ${totalViolations} chaves do mapping.json nos schemas TS:`);
  missingKeys.forEach(k => console.log(`  - Chave órfã: ${k}`));
  console.log(`\n[ERROR] Paridade 1:1:1:1:1 quebrada.`);
  process.exit(1);
}
