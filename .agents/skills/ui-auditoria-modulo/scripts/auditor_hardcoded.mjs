import fs from 'fs';
import path from 'path';
import ts from 'typescript';

// ==========================================================================
// CONFIGURAÇÃO (ajuste fino em um só lugar)
// ==========================================================================

// Escopo do detector de VALOR (hex/px/rem/em): hardcode de valor CSS é proibido
// em qualquer camada (átomos OU features).
const VALUE_SCOPE = ['src/components', 'src/features'];

// Escopo do detector ESTRUTURAL (Tailwind de layout): a regra de desengessamento
// (skill ui-arquitetura-design) é específica dos átomos. Features compõem layout
// legitimamente, por isso não entram aqui. Amplie esta lista se a política mudar.
const STRUCTURAL_SCOPE = ['src/components/atomic'];

// Funções utilitárias que recebem classes Tailwind como argumento (além de className).
const CLASS_HELPERS = new Set(['cn', 'clsx', 'classnames', 'classNames', 'twMerge', 'cva', 'tw']);

// Classificação por BALDE. Toda classe estrutural é LOCALIZADA e contabilizada.
// - Baldes DUROS (reprovam): devem migrar para o Hook Controlador / tokens.
// - Baldes DEDUZIDOS (não reprovam): localizados, contados e subtraídos do total,
//   por decisão de negócio (mesma mecânica dos ícones). NUNCA ficam invisíveis.
const HARD_BUCKETS = new Set(['spacing', 'flex-direction', 'grid']);

// Ordem e rótulos dos baldes deduzidos, exibidos na reconciliação.
const DEDUCTED_BUCKETS = [
  { key: 'icon', label: 'Ícones/glifos (w-N/h-N)' },
  { key: 'dimension-full', label: 'Dimensão fluida (w-full/h-full) — o hook também usa' },
  { key: 'alignment', label: 'Alinhamento (items/justify/...) — micro-layout intrínseco' },
];

function classifyToken(rawToken) {
  // Remove variantes (md:, hover:, dark:...) e sinal negativo, isolando o núcleo.
  const core = rawToken.split(':').pop().replace(/^-/, '');

  if (/^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-[0-9]+(\.[0-9]+)?$/.test(core)) return 'spacing';
  if (/^flex-(col|row|col-reverse|row-reverse)$/.test(core)) return 'flex-direction';
  if (/^(grid-cols|grid-rows|col-span|row-span)-[0-9]+$/.test(core)) return 'grid';
  if (/^(w|h)-[0-9]+(\.[0-9]+)?$/.test(core)) return 'icon';                       // glifo
  if (/^(w|h|min-w|max-w|min-h|max-h)-(full|screen)$/.test(core)) return 'dimension-full';
  if (/^(items|justify|content|self|place-items|place-content)-[a-z-]+$/.test(core)) return 'alignment';
  return 'clean';
}

// ==========================================================================
// COLETA DE ARQUIVOS
// ==========================================================================

function getFiles(dir, extFilter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('__tests__') && !fullPath.includes('Mocks')) {
        getFiles(fullPath, extFilter, fileList);
      }
    } else if (extFilter.includes(path.extname(fullPath))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function collectFiles(scopes) {
  const set = new Set();
  for (const scope of scopes) {
    for (const f of getFiles(path.resolve(scope), ['.tsx'])) set.add(f);
  }
  return [...set];
}

function parse(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

// ==========================================================================
// DETECTOR DE VALOR (Hex / Px / Rem / Em) — proibido em qualquer literal
// ==========================================================================

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
const UNIT_RE = /\b([1-9][0-9]*(?:\.[0-9]+)?|0\.[0-9]+)(px|rem|em)\b/; // ignora 0px

function sanitizeFallbacks(text) {
  // Remove fallbacks documentados dentro de var(): var(--x, #fff) / var(--x, 12px)
  return text
    .replace(/var\([^,]+,\s*#[0-9a-fA-F]{3,8}\s*\)/gi, '')
    .replace(/var\([^,]+,\s*[0-9.]+(?:px|rem|em)\s*\)/gi, '');
}

function checkValueHardcoded(sourceFile) {
  const violations = [];
  function visit(node) {
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      const text = sanitizeFallbacks(node.text || '');
      if (HEX_RE.test(text)) {
        violations.push(`Line ${lineOf(sourceFile, node)}: Cor hex hardcoded -> ${node.text}`);
      }
      if (UNIT_RE.test(text)) {
        violations.push(`Line ${lineOf(sourceFile, node)}: Unidade fixa (px/rem/em) hardcoded -> ${node.text}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violations;
}

// ==========================================================================
// DETECTOR ESTRUTURAL (Tailwind de layout dentro de className / helpers)
// ==========================================================================

function gatherClassText(node, seen, sink) {
  // Reúne todos os fragmentos estáticos de classe dentro de uma subárvore
  // (string literal, template sem substituição e os trechos de template literal).
  // `seen` deduplica por posição: um mesmo literal pode ser alcançado tanto pelo
  // atributo className quanto pela chamada cn()/clsx() aninhada nele.
  if (!node) return;
  if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
    const key = node.getStart();
    if (node.text && !seen.has(key)) {
      seen.add(key);
      sink.push({ text: node.text, node });
    }
    return; // tokens literais não têm filhos que carreguem classes
  }
  ts.forEachChild(node, (child) => gatherClassText(child, seen, sink));
}

function isClassHelperCall(node) {
  if (!ts.isCallExpression(node)) return false;
  const expr = node.expression;
  const name = ts.isIdentifier(expr) ? expr.text
    : (ts.isPropertyAccessExpression(expr) ? expr.name.text : '');
  return CLASS_HELPERS.has(name);
}

function checkStructural(sourceFile) {
  const fragments = [];
  const seen = new Set();
  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name && ['className', 'class'].includes(node.name.getText())) {
      gatherClassText(node.initializer, seen, fragments);
    } else if (isClassHelperCall(node)) {
      node.arguments.forEach((arg) => gatherClassText(arg, seen, fragments));
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  const violations = [];            // só baldes DUROS (reprovam, listados por linha)
  const deducted = {};              // contagem por balde deduzido (localizado, não reprova)
  for (const { text, node } of fragments) {
    for (const token of text.split(/\s+/).filter(Boolean)) {
      const bucket = classifyToken(token);
      if (bucket === 'clean') continue;
      if (HARD_BUCKETS.has(bucket)) {
        violations.push(`Line ${lineOf(sourceFile, node)}: Tailwind estrutural chumbado (${bucket}) -> ${token}`);
      } else {
        deducted[bucket] = (deducted[bucket] || 0) + 1;
      }
    }
  }
  return { violations, deducted };
}

// ==========================================================================
// EXECUÇÃO
// ==========================================================================

console.log('--- Auditor de Hardcoded UI (TS AST) ---');

const valueFiles = collectFiles(VALUE_SCOPE);
const structuralFiles = collectFiles(STRUCTURAL_SCOPE);

let valueTotal = 0;
console.log('\n### VALOR (hex / px / rem / em) — todas as camadas');
for (const file of valueFiles) {
  const sf = parse(file);
  const violations = checkValueHardcoded(sf);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach((v) => console.log(`  - ${v}`));
    valueTotal += violations.length;
  }
}

let structuralTotal = 0;
const deductedTotals = {};
console.log('\n### ESTRUTURAL (Tailwind de layout) — apenas átomos');
for (const file of structuralFiles) {
  const sf = parse(file);
  const { violations, deducted } = checkStructural(sf);
  for (const [bucket, count] of Object.entries(deducted)) {
    deductedTotals[bucket] = (deductedTotals[bucket] || 0) + count;
  }
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${path.relative(process.cwd(), file)}`);
    violations.forEach((v) => console.log(`  - ${v}`));
    structuralTotal += violations.length;
  }
}

// Reconciliação: cada balde deduzido é LOCALIZADO, contado e subtraído do bruto.
const deductedSum = Object.values(deductedTotals).reduce((a, b) => a + b, 0);
const structuralBruto = structuralTotal + deductedSum;
console.log('\n--- Reconciliação Estrutural ---');
console.log(`  Estrutural bruto encontrado : ${structuralBruto}`);
for (const { key, label } of DEDUCTED_BUCKETS) {
  console.log(`  ( - ) ${label.padEnd(56)} : ${deductedTotals[key] || 0}`);
}
console.log(`  ${'-'.repeat(64)}`);
console.log(`  Violações líquidas (duras)  : ${structuralTotal}`);

const netTotal = valueTotal + structuralTotal;
console.log('\n--- Resumo ---');
console.log(`  Valor (hex/px/rem/em) : ${valueTotal}`);
console.log(`  Estrutural (líquido)  : ${structuralTotal}`);

if (netTotal === 0) {
  console.log('\n[OK] Nenhum hardcoded detectado!');
  process.exit(0);
} else {
  console.log(`\n[ERROR] Encontradas ${netTotal} violações de hardcode (Valor + Estrutural líquido).`);
  process.exit(1);
}
