// Auditor de composição atômica obrigatória (R10 — proibido `<button>`,
// `<input>` ou `<select>` cru no que o consumidor embute no produto dele).
// A fronteira é a tabela de R10 (specs/specs/00-regras-e-invariantes.md,
// decisão do dono, 2026-08-05) — este script não decide fronteira, aplica.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// 1. SÓ A METADE "HTML NATIVO CRU" DE R10. A outra metade — `switch`/`case`
//    de design ou `<style>` de roteamento dentro do JSX — **não tem
//    detector nenhum ainda**. R10 continua ⚠️ (escopo menor que a regra)
//    até essa metade nascer, e ela não é desta plan (plan-16, §3.2).
// 2. `src/features/**` está FORA por decisão do dono, não por omissão: é
//    ferramenta de autoria da própria lib (mesmo critério da allowlist do
//    `zero-brand:check`, [[006-zero-marca-soberania-host]]). Medido em
//    2026-08-05: **64 ocorrências** vivem lá, sem gate nenhum sobre elas —
//    se features/ um dia deixar de ser só autoria interna, este número
//    precisa ser revisitado.
// 3. A fronteira mudou de PASTA para PAPEL (plan-20, 2026-08-10, decisão do
//    dono — achado A da plan-19). `EXCLUDE_PATH_SEGMENTS` NÃO exclui mais
//    `components/atomic/Buttons/` nem `.../Inputs/`: um scrim não é um
//    botão, mas nasceria lá só pela fronteira antiga ser "por pasta" —
//    `SarakScrim` foi a prova viva do problema (plan-19 §2.3). Isenção
//    agora é por ARQUIVO+TAG, via o marcador `@sarak-encapsula <tag> —
//    <razão>` no JSDoc do componente exportado — ver `collectEncapsulaTags`
//    abaixo. É MAIS ESTRITO que a exclusão por pasta, não menos: a pasta
//    isentava 18 arquivos (e todo arquivo FUTURO que entrasse nela) sem
//    revisão nenhuma; o marcador isenta arquivo por arquivo, com razão
//    escrita e visível no diff. Hoje só 5 arquivos o carregam (SarakButton,
//    SarakIconButton, SarakInput, SarakScrim, SocialButton — os
//    encapsulamentos reais); os outros que viviam nas pastas excluídas são
//    COMPOSTOS (SarakDatePicker, SarakMultiSelect, SarakRichText,
//    SarakUploader e afins) e, se contiverem elemento nativo cru, passam a
//    ser acusados — dívida que a pasta escondia, medida e declarada no
//    resumo da plan-20, paga em plan própria (nunca aqui).
// 4. Detecta só `JsxOpeningElement`/`JsxSelfClosingElement` cujo `tagName`
//    é um `Identifier` simples e minúsculo (`button`/`input`/`select`) —
//    é a forma como o TypeScript/React já distingue elemento nativo
//    (minúsculo) de componente (maiúsculo); não resolve alias nem
//    `React.createElement('button', …)` fora de JSX.
// 5. R10 ESTREITADA (plan-20, 2026-08-10, redação assumida pelo executor —
//    o texto final da regra é do revisor, na síntese): um `<input>` OCULTO
//    (className contém o token `hidden`) e ACIONADO SÓ POR PROGRAMA (tem
//    `ref={x}`, e `x.current.click()`/`x.current?.click()` aparece em
//    algum lugar do MESMO arquivo) não é composição atômica — é API do
//    navegador (o usuário nunca vê nem opera o elemento; o `SarakIconButton`
//    ao lado é a peça que ELE opera). Fecha `ChatInput.tsx:117`
//    (`<input type="file" ref={fileInputRef} className="hidden" />`,
//    acionado por `fileInputRef.current?.click()`). Detecção por
//    heurística de TEXTO (`/\bhidden\b/` no `getText()` do atributo
//    `className`) — não resolve `cn()`/`clsx()`/template literal cujo
//    token `hidden` venha de uma `const` externa (a mesma classe de ponto
//    cego que `auditor_hardcoded.mjs` já declara para o detector
//    ESTRUTURAL); sub-cobertura, nunca acusação falsa: um input oculto por
//    outra via continua acusado.
// 6. O marcador `@sarak-encapsula <tag> — <razão>` (item 3, acima) é
//    reconhecido por REGEX no texto CRU do arquivo (comentário incluído),
//    não por resolução de "qual JSDoc pertence a qual export" — um
//    `@sarak-encapsula button` em QUALQUER comentário do arquivo isenta
//    `<button>` no arquivo inteiro, não só no componente logo abaixo do
//    comentário. Aceito porque o padrão de um marcador por arquivo (um
//    export principal por arquivo, convenção já vigente nesta base) torna a
//    distinção sem efeito prático hoje; um arquivo com dois exports de
//    átomos DIFERENTES, um encapsulando e outro não, escaparia — não há
//    caso assim na base.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const SCOPE = ['src/components', 'src/core'];
const NATIVE_TAGS = new Set(['button', 'input', 'select']);
const EXCLUDE_PATH_SEGMENTS = ['__tests__', '__e2e__', 'Mocks'];

function isExcluded(relPath) {
  const normalized = relPath.split(path.sep).join('/');
  return EXCLUDE_PATH_SEGMENTS.some((seg) => normalized.includes(seg));
}

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(process.cwd(), full);
    if (isExcluded(rel)) continue;
    if (fs.statSync(full).isDirectory()) {
      getFiles(full, fileList);
    } else if (full.endsWith('.tsx')) {
      fileList.push(full);
    }
  }
  return fileList;
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

/** Nomes de ref (`x`) para os quais `x.current.click()` ou
 * `x.current?.click()` aparece em algum lugar do arquivo — sinal de
 * acionamento por PROGRAMA, não por interação direta do usuário. */
function collectRefClickNames(sourceFile) {
  const names = new Set();
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'click' &&
      ts.isPropertyAccessExpression(node.expression.expression) &&
      node.expression.expression.name.text === 'current' &&
      ts.isIdentifier(node.expression.expression.expression)
    ) {
      names.add(node.expression.expression.expression.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return names;
}

function getJsxAttribute(node, attrName) {
  if (!node.attributes) return null;
  return node.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name?.getText() === attrName) ?? null;
}

function hasHiddenClassName(node) {
  const attr = getJsxAttribute(node, 'className');
  return attr != null && /\bhidden\b/.test(attr.getText());
}

function refAttributeName(node) {
  const attr = getJsxAttribute(node, 'ref');
  const expr = attr?.initializer && ts.isJsxExpression(attr.initializer) ? attr.initializer.expression : null;
  return expr && ts.isIdentifier(expr) ? expr.text : null;
}

/** R10 estreitada (item 5 do LIMITES DECLARADOS): `<input>` oculto e
 * acionado só por programa não é composição — é API do navegador. */
function isProgrammaticHiddenInput(node, refClickNames) {
  if (!hasHiddenClassName(node)) return false;
  const refName = refAttributeName(node);
  return refName != null && refClickNames.has(refName);
}

// Marcador A1 (item 3/6 do LIMITES DECLARADOS): `@sarak-encapsula <tag> —
// <razão>` no JSDoc do componente exportado isenta `<tag>` NAQUELE arquivo.
// Tag fora de `button`/`input`/`select`, ou marcador sem razão escrita
// depois do travessão, é ERRO do gate — nunca isenção silenciosa.
const ENCAPSULA_MARKER_RE = /@sarak-encapsula\s+(\S+)([^\n]*)/g;
const REASON_RE = /—\s*\S/;

function collectEncapsulaMarkers(rawSource, relFile) {
  const tags = new Set();
  const errors = [];
  for (const m of rawSource.matchAll(ENCAPSULA_MARKER_RE)) {
    const tag = m[1];
    const resto = m[2] ?? '';
    if (!NATIVE_TAGS.has(tag)) {
      errors.push(`${relFile}: @sarak-encapsula "${tag}" não é uma tag válida (use button/input/select)`);
      continue;
    }
    if (!REASON_RE.test(resto)) {
      errors.push(`${relFile}: @sarak-encapsula ${tag} SEM razão escrita depois do travessão (—) — marcador não isenta`);
      continue;
    }
    tags.add(tag);
  }
  return { tags, errors };
}

function checkFile(sourceFile, encapsulaTags) {
  const violations = [];
  const refClickNames = collectRefClickNames(sourceFile);

  function visit(node) {
    const isOpening = ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node);
    if (isOpening && ts.isIdentifier(node.tagName)) {
      const name = node.tagName.text;
      const isEncapsulada = encapsulaTags.has(name);
      const isProgrammaticHidden = name === 'input' && isProgrammaticHiddenInput(node, refClickNames);
      if (NATIVE_TAGS.has(name) && !isEncapsulada && !isProgrammaticHidden) {
        violations.push(`Line ${lineOf(sourceFile, node)}: <${name}> nativo cru — use o átomo Sarak correspondente`);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

console.log('--- Auditor de Composição Atômica (R10) ---');

const files = SCOPE.flatMap((dir) => getFiles(path.resolve(dir)));
let total = 0;
let markerErrors = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(process.cwd(), file);
  const { tags, errors } = collectEncapsulaMarkers(content, relFile);
  markerErrors = markerErrors.concat(errors);
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations = checkFile(sourceFile, tags);
  if (violations.length > 0) {
    console.log(`\n[FAIL] ${relFile}`);
    violations.forEach((v) => console.log(`  - ${v}`));
    total += violations.length;
  }
}

if (markerErrors.length > 0) {
  console.log(`\n[ERROR] ${markerErrors.length} marcador(es) @sarak-encapsula inválido(s):`);
  markerErrors.forEach((e) => console.log(`  - ${e}`));
}

if (total === 0 && markerErrors.length === 0) {
  console.log('\n[OK] Nenhum elemento nativo cru fora dos átomos.');
  process.exit(0);
} else {
  console.log(`\n[ERROR] ${total} ocorrência(s) de composição atômica violada (R10).`);
  process.exit(1);
}
