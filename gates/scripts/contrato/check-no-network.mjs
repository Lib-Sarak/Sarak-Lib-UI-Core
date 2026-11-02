// A lib não faz rede (specs/10-seguranca-e-acessibilidade.md §3.2): quem busca e envia é o host, com a
// autenticação dele. Reprova em `src/` a chamada a `fetch`, `navigator.sendBeacon`, a construção de
// `XMLHttpRequest`, `WebSocket` e `EventSource`, e todo import de `axios`.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. Lê a AST de cada arquivo, sem tipos: comentário e string não são acusados, mas o nome é tudo que ele
//    tem. O apelido (`const f = fetch; f()`) e o acesso por índice (`window['fetch']`) passam.
// 2. Uma função local chamada `fetch` é acusada (falso positivo aceito: o nome engana quem lê). O conserto é
//    renomear. `props.fetch()` e `client.fetch()` passam: não saem de um objeto global.
// 3. Só as APIs listadas e o pacote `axios`. Outro cliente HTTP chega pelo `package.json`, não por aqui.
// 4. Não vê o que o navegador busca sozinho: `<img>`, `url()` de CSS, `@font-face`, nem o worker do `pdfjs-dist`.
// 5. Só `src/`, fora de `__tests__` e `*.test.*`/`*.spec.*`. Teste pode simular rede.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** Rede legítima em `src/`: `'caminho/relativo.ts': 'motivo por extenso'`. Hoje não há nenhuma. */
export const ALLOWLIST = {};

const CALLED_APIS = new Set(['fetch']);
const CONSTRUCTED_APIS = new Set(['XMLHttpRequest', 'WebSocket', 'EventSource']);
const GLOBAL_OBJECTS = new Set(['window', 'globalThis', 'self', 'global']);
const FORBIDDEN_PACKAGE_RE = /^axios(\/|$)/;

/** O nome chamado ou construído: `fetch` e `window.fetch` dão `fetch`; `client.fetch` não dá nada. */
function globalName(expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (!ts.isPropertyAccessExpression(expression) || !ts.isIdentifier(expression.expression)) return undefined;
  return GLOBAL_OBJECTS.has(expression.expression.text) ? expression.name.text : undefined;
}

function isSendBeacon(expression) {
  return ts.isPropertyAccessExpression(expression)
    && expression.name.text === 'sendBeacon'
    && ts.isIdentifier(expression.expression)
    && expression.expression.text === 'navigator';
}

/** O pacote que o nó importa: `import`, `export … from`, `import()` e `require()`. */
function importedPackage(node) {
  if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
    return node.moduleSpecifier.text;
  }
  if (!ts.isCallExpression(node) || !ts.isStringLiteralLike(node.arguments[0] ?? node)) return undefined;
  const isLoader = node.expression.kind === ts.SyntaxKind.ImportKeyword
    || (ts.isIdentifier(node.expression) && node.expression.text === 'require');
  return isLoader ? node.arguments[0].text : undefined;
}

function networkUse(node) {
  const imported = importedPackage(node);
  if (imported !== undefined) return FORBIDDEN_PACKAGE_RE.test(imported) ? `import de ${imported}` : undefined;
  if (ts.isCallExpression(node)) {
    if (isSendBeacon(node.expression)) return 'navigator.sendBeacon';
    const name = globalName(node.expression);
    return CALLED_APIS.has(name) ? name : undefined;
  }
  if (ts.isNewExpression(node)) {
    const name = globalName(node.expression);
    return CONSTRUCTED_APIS.has(name) ? `new ${name}` : undefined;
  }
  return undefined;
}

/** Todo uso de rede num fonte: `[{ line, use }]`. */
export function findNetworkUses(content, fileName = 'arquivo.tsx') {
  const source = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const uses = [];
  const visit = (node) => {
    const use = networkUse(node);
    if (use) uses.push({ line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, use });
    ts.forEachChild(node, visit);
  };
  visit(source);
  return uses;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') walk(full, out);
    } else if (/\.tsx?$/.test(entry.name) && !/\.d\.ts$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** `{ violations: [{ file, line, use }], staleExceptions, total }` sobre `src/` de `root`. */
export function findNetworkViolations({ root = ROOT, allowlist = ALLOWLIST } = {}) {
  const files = walk(path.join(root, 'src'));
  const violations = [];
  const usedExceptions = new Set();
  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    const uses = findNetworkUses(fs.readFileSync(file, 'utf8'), file);
    if (uses.length > 0 && Object.hasOwn(allowlist, rel)) {
      usedExceptions.add(rel);
      continue;
    }
    uses.forEach((hit) => violations.push({ file: rel, ...hit }));
  }
  const staleExceptions = Object.keys(allowlist).filter((rel) => !usedExceptions.has(rel));
  return { violations, staleExceptions, total: files.length };
}

function main() {
  console.log('--- check-no-network (a lib não faz rede) ---');
  const { violations, staleExceptions, total } = findNetworkViolations();
  if (violations.length === 0 && staleExceptions.length === 0) {
    console.log(`[OK] ${total} arquivos de src/ varridos, sem rede (exceções declaradas: ${Object.keys(ALLOWLIST).length}).`);
    return;
  }
  if (violations.length > 0) {
    console.log(`[ERROR] ${violations.length} uso(s) de rede em src/:`);
    violations.forEach((v) => console.log(`  - ${v.file}:${v.line} — ${v.use}`));
    console.log('  Conserto: receba o dado pronto ou uma função do host (`load`, `onSubmit`), que chama a rede com a autenticação dele.');
  }
  if (staleExceptions.length > 0) {
    console.log(`[ERROR] ${staleExceptions.length} exceção(ões) sem ocorrência — remova de ALLOWLIST:`);
    staleExceptions.forEach((rel) => console.log(`  - ${rel}`));
  }
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
