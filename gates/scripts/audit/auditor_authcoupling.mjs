// Auditor anti-acoplamento de autenticação (R32 — a lib é indiferente ao
// sistema de autenticação). A lib desenha a tela e entrega o evento; nenhum
// componente lê/escreve credencial, sessão ou token, e nenhum embute rota,
// verbo ou payload de autenticação.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê, e por quê
// -------------------------------------------------------------------------
// 1. NÃO proíbe `fetch`/`axios` nem uso de `localStorage`/`sessionStorage` em
//    geral — só quando a CHAVE ou o texto envolvido parece credencial/sessão
//    (regex AUTH_KEY_RE). Templates de dados (SarakTable, SarakChart, …) que
//    recebem `endpoint` e são agnósticos sobre o que existe atrás dele NÃO
//    são flagrados: eles não tocam localStorage/cookie/Authorization nem
//    embutem rota de auth.
// 2. Detecção de rota embutida é por REGEX sobre o texto estático de string e
//    template literals (segmento de path `/mfa`, `/login`, `/oauth`, `/token`,
//    `/auth`, `/sso`, `/2fa`, `/session`) — não resolve concatenação dinâmica
//    fora de template literal, nem `fetch(variavel)` onde a rota vem de fora.
// 3. Varre só `src/components/` e `src/features/` — a superfície que o
//    consumidor embute. `src/core/` (infra interna) fica fora.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const SCOPE = ['src/components', 'src/features'];

const AUTH_KEY_RE = /token|session|auth|credential|jwt|refresh|bearer|password|senha/i;
const AUTH_ROUTE_RE = /(^|\/)(mfa|login|oauth2?|token|auth|sso|2fa)(\/|$)/i;
const STORAGE_OBJECTS = new Set(['localStorage', 'sessionStorage']);
const STORAGE_METHODS = new Set(['getItem', 'setItem', 'removeItem']);

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('__tests__') && !full.includes('__e2e__') && !full.includes('Mocks')) {
        getFiles(full, fileList);
      }
    } else if (/\.tsx?$/.test(full) && !/\.(test|spec)\./.test(full)) {
      fileList.push(full);
    }
  }
  return fileList;
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

function staticTextOf(node) {
  // Concatena os trechos ESTÁTICOS de uma string simples ou template literal
  // (interpolações são ignoradas — só o texto fixo é examinado).
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map((s) => s.literal.text).join('');
  }
  return '';
}

function checkFile(sourceFile) {
  const violations = [];

  function visit(node) {
    // Sink de storage: localStorage.getItem/setItem/removeItem('chave-auth')
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      STORAGE_OBJECTS.has(node.expression.expression.text) &&
      STORAGE_METHODS.has(node.expression.name.text)
    ) {
      const firstArg = node.arguments[0];
      const key = firstArg ? staticTextOf(firstArg) : '';
      if (key && AUTH_KEY_RE.test(key)) {
        violations.push(
          `Line ${lineOf(sourceFile, node)}: ${node.expression.expression.text}.${node.expression.name.text}("${key}") — sink de credencial/sessão`,
        );
      }
    }

    // document.cookie = '...token...' (ou lido em template com nome auth-ish)
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'document' &&
      node.name.text === 'cookie' &&
      ts.isBinaryExpression(node.parent) &&
      node.parent.left === node
    ) {
      const text = staticTextOf(node.parent.right);
      if (text && AUTH_KEY_RE.test(text)) {
        violations.push(`Line ${lineOf(sourceFile, node)}: document.cookie = "${text}" — sink de credencial/sessão`);
      }
    }

    // Chave/header literal 'Authorization'
    if (ts.isStringLiteralLike(node) && /^authorization$/i.test(node.text)) {
      violations.push(`Line ${lineOf(sourceFile, node)}: literal "${node.text}" — header de credencial`);
    }

    // Rota de autenticação embutida em string/template ('/mfa', '${endpoint}/login', ...).
    // Exige que o texto comece com "/" (formato de path) — sem isso, um id de
    // módulo mock ("auth"), um nome de ícone ("LogIn") ou um group Tailwind
    // ("group/token") batem na regex sem ser rota nenhuma.
    if (ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) {
      const text = staticTextOf(node).trim();
      if (text.startsWith('/') && AUTH_ROUTE_RE.test(text)) {
        violations.push(`Line ${lineOf(sourceFile, node)}: rota de autenticação embutida -> "${text}"`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

console.log('--- Auditor Anti-Acoplamento de Autenticação (R32) ---');

const files = SCOPE.flatMap((dir) => getFiles(path.resolve(dir)));
let total = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const violations = checkFile(sourceFile);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach((v) => console.log(`  - ${v}`));
    total += violations.length;
  }
}

if (total === 0) {
  console.log('\n[OK] Nenhum sink de credencial nem rota de autenticação embutida em componente/feature.');
  process.exit(0);
} else {
  console.log(`\n[ERROR] ${total} violação(ões) de R32 (acoplamento de autenticação).`);
  process.exit(1);
}
