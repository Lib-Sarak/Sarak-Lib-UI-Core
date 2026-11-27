// Acha prazo numérico declarado em teste de `src/` fora da porta `prazoDeTeste`.
//
// Vale para: último argumento numérico de it/test/describe/beforeAll/…, `{ timeout: N }` como
// opção deles, e `vi.setConfig({ testTimeout|hookTimeout: N })`. Constante de módulo com
// literal numérico passada como prazo também conta. `waitFor`/`findBy*` ficam de fora: o prazo
// deles é de espera, não do caso.
//
// LIMITES DECLARADOS: não segue constante importada de outro arquivo nem prazo montado por
// função que não seja a porta (`prazoDeTeste(...)` é a única forma aceita).
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const TEST_FNS = new Set(['it', 'test', 'describe', 'beforeAll', 'beforeEach', 'afterAll', 'afterEach']);
const SETCONFIG_KEYS = new Set(['testTimeout', 'hookTimeout']);

const baseName = (expr) => {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return baseName(expr.expression);
  if (ts.isCallExpression(expr)) return baseName(expr.expression);
  return null;
};

const isSetConfig = (expr) =>
  ts.isPropertyAccessExpression(expr) && expr.name.text === 'setConfig' && ts.isIdentifier(expr.expression) && expr.expression.text === 'vi';

function literalConsts(sf) {
  const map = new Map();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.initializer && ts.isNumericLiteral(d.initializer)) map.set(d.name.text, d.initializer);
    }
  }
  return map;
}

function objectTimeoutProps(obj, keys, consts) {
  return obj.properties.filter((p) => ts.isPropertyAssignment(p) && keys.has(p.name.getText()) && isLiteralNumber(p.initializer, consts));
}

function isLiteralNumber(node, consts) {
  return ts.isNumericLiteral(node) || (ts.isIdentifier(node) && consts.has(node.text)) || isLiteralArithmetic(node, consts);
}

// `MOUNT_TIMEOUT_MS + 15_000`: aritmética só de literais/constantes também é prazo fixo.
function isLiteralArithmetic(node, consts) {
  return ts.isBinaryExpression(node) && isLiteralNumber(node.left, consts) && isLiteralNumber(node.right, consts);
}

export function findOwnTimeouts(source, fileName = 'x.ts') {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const consts = literalConsts(sf);
  const found = [];
  const flag = (node) => found.push({ line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, text: node.getText().slice(0, 80) });

  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const args = node.arguments;
      if (isSetConfig(node.expression) && args[0] && ts.isObjectLiteralExpression(args[0])) {
        objectTimeoutProps(args[0], SETCONFIG_KEYS, consts).forEach(flag);
      } else if (TEST_FNS.has(baseName(node.expression) ?? '')) {
        for (const a of args.slice(1)) {
          if (isLiteralNumber(a, consts)) flag(a);
          else if (ts.isObjectLiteralExpression(a)) objectTimeoutProps(a, new Set(['timeout']), consts).forEach(flag);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.test\.tsx?$/.test(e.name) && full.split(path.sep).includes('__tests__')) yield full;
  }
}

export function findOwnTimeoutsInTree(srcDir) {
  const out = [];
  for (const file of walk(srcDir)) {
    for (const hit of findOwnTimeouts(fs.readFileSync(file, 'utf8'), file)) out.push({ file, ...hit });
  }
  return out;
}
