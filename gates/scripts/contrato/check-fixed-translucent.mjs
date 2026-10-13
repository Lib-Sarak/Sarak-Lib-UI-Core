// Branco e preto fixos em componente. Num componente da lib, o branco/preto translúcido
// (`bg-white/5`, `border-black/10`, `rgba(255,255,255,0.1)`) e o texto fixo (`text-white`,
// `text-black`) só aparecem sobre um fundo escuro (ou claro) que o AUTOR presumiu: sob um tema
// claro o "branco a 5%" some e o `text-white` fica ilegível. Quem decide a cor é o tema — o
// valor vem de token, ou é derivado da cor de texto/superfície do tema por `color-mix`
// (`bg-theme-tint*`, `border-theme-tint*`, `--sarak-on-*`).
//
// Uma ocorrência é acusada quando TODAS valem:
//   (a) está em `src/components/**` ou `src/features/**` (TS/TSX) — o painel de customização e as
//       pré-visualizações mostram o tema, então seguem o MODO dele — ou num parcial de CSS de
//       componente (`PARTIALS`);
//   (b) é classe Tailwind `<utilitária>-white|black/<alfa>` (qualquer variante: `hover:`,
//       `group-hover/x:`…), a classe sólida `text-white|black` / `bg-white|black`, ou um literal
//       `rgba(255,255,255,<alfa>)` / `rgba(0,0,0,<alfa>)` com alfa < 1;
//   (c) NÃO está dentro de uma reserva `var(--x, <aqui>)` — a reserva é o padrão do token
//       (reserva = padrão) e está certa em ser, por exemplo, `rgba(255,255,255,0.1)`.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. É TEXTUAL e linha a linha: reconhece `rgba(255,255,255,…)`/`rgba(0,0,0,…)` e a classe
//    `…-white|black/…`. NÃO vê hex sólido (`#fff`, `#000`), nem `white`/`black` por palavra-chave
//    CSS, nem cinza/azul translúcido fixo (`bg-slate-900/50`), nem `hsl()`. Um branco escrito como
//    `rgb(255 255 255 / 5%)` passa.
// 2. A reserva é reconhecida contando parênteses: dentro de um `var(` ainda aberto na mesma linha.
//    Uma reserva que abre numa linha e fecha em outra não é reconhecida (falso positivo; o conserto
//    é reformatar ou declarar a exceção).
// 3. Só `src/components/**`, `src/features/**` e os parciais `_base.css`, `_utilities.css`,
//    `_elements.css`, `_card-defaults.css` e `_cards.css`. NÃO vê `_atmosphere.css` e `_surfaces.css`
//    (texturas e materiais: o branco/preto ali é desenho da textura, medido por
//    `cromo-css-real:check`), nem o CSS do consumidor. Em `src/features/` a leitura de modo é
//    do texto: que o painel de fato siga o modo do tema que mostra é do navegador
//    (`browser-tests/painel-segue-o-modo.spec.ts`), não deste gate.
// 4. Não julga se o valor derivado é legível: `color-mix` sobre a cor de texto do tema é a forma
//    aceita, e o contraste dos pares que os componentes desenham é do `verify_contrast.ts`.
// 5. As exceções são `EXCEPTIONS` (arquivo inteiro, com motivo) e o marcador de linha
//    `sarak-allow-fixed-color: <motivo>` na linha ou na anterior. O gate acusa exceção de arquivo
//    que deixou de ter ocorrência.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const PARTIALS = ['_base.css', '_utilities.css', '_elements.css', '_card-defaults.css', '_cards.css'];

/** Arquivos em que o branco/preto fixo é legítimo, com o motivo. */
export const EXCEPTIONS = {
  'src/components/atomic/Media/SarakLightbox.tsx':
    'o lightbox tem fundo PRÓPRIO escuro (`bg-black/90`): seus controles brancos sentam sobre ele, não sobre o tema',
};

const ALLOW_MARKER = 'sarak-allow-fixed-color:';

const CLASS_RE = /(?<![\w-])((?:[\w/[\]-]+:)*)(bg|text|border|ring|shadow|from|via|to|outline|divide|fill|stroke|decoration|accent|caret|placeholder)-(white|black)(\/(?:\[[0-9.]+\]|\d+))?(?![\w-])/g;
const RGBA_RE = /rgba\(\s*(?:255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0)\s*,\s*([0-9.]+)\s*\)/g;

/** O trecho `index` está dentro de um `var(` ainda aberto, contando parênteses desde o início da linha. */
export function insideVarFallback(line, index) {
  const stack = [];
  for (let i = 0; i < index; i += 1) {
    if (line[i] === '(') stack.push(/var$/.test(line.slice(Math.max(0, i - 3), i)));
    else if (line[i] === ')') stack.pop();
  }
  return stack.some(Boolean);
}

/** Ocorrências de branco/preto fixo numa linha: `[{ kind, text, index }]`. */
export function findInLine(line) {
  const found = [];
  for (const match of line.matchAll(CLASS_RE)) {
    const [text, , utility, , alpha] = match;
    const solid = !alpha && (utility === 'text' || utility === 'bg');
    if (alpha || solid) found.push({ kind: 'classe', text, index: match.index });
  }
  for (const match of line.matchAll(RGBA_RE)) {
    if (Number(match[1]) < 1) found.push({ kind: 'rgba', text: match[0], index: match.index });
  }
  return found.filter((hit) => !insideVarFallback(line, hit.index));
}

const isAllowed = (lines, i) => lines[i].includes(ALLOW_MARKER) || (i > 0 && lines[i - 1].includes(ALLOW_MARKER));

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

const isCommentLine = (line) => {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
};

/** Todo branco/preto fixo em componente. `{ violations: [{file,line,kind,text}], staleExceptions }`. */
export function findFixedTranslucent({ root = ROOT, exceptions = EXCEPTIONS } = {}) {
  const files = [
    ...walk(path.join(root, 'src', 'components')),
    ...walk(path.join(root, 'src', 'features')),
    ...PARTIALS.map((name) => path.join(root, 'src', 'styles', name)).filter((file) => fs.existsSync(file)),
  ];
  const violations = [];
  const usedExceptions = new Set();
  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (isCommentLine(line)) return;
      const hits = findInLine(line);
      if (hits.length === 0 || isAllowed(lines, i)) return;
      if (Object.hasOwn(exceptions, rel)) {
        usedExceptions.add(rel);
        return;
      }
      hits.forEach((hit) => violations.push({ file: rel, line: i + 1, kind: hit.kind, text: hit.text }));
    });
  }
  const staleExceptions = Object.keys(exceptions).filter((rel) => !usedExceptions.has(rel));
  return { violations, staleExceptions };
}

function main() {
  console.log('--- check-fixed-translucent (branco/preto fixo em componente e no painel) ---');
  const { violations, staleExceptions } = findFixedTranslucent();
  if (violations.length === 0 && staleExceptions.length === 0) {
    console.log(`[OK] Nenhum branco/preto fixo em componente (exceções declaradas: ${Object.keys(EXCEPTIONS).length}).`);
    return;
  }
  if (violations.length > 0) {
    console.log(`[ERROR] ${violations.length} branco(s)/preto(s) fixo(s) em componente — somem (ou ficam ilegíveis) sob tema claro:`);
    violations.forEach((v) => console.log(`  - ${v.file}:${v.line} — ${v.kind} \`${v.text}\``));
    console.log('  Conserto: o valor vem de token do tema, ou deriva da cor de texto/superfície por `color-mix` — `bg-theme-tint*`,');
    console.log('  `border-theme-tint*`, `text-[var(--text-main,…)]`, `--sarak-on-*` (texto sobre cor sólida).');
  }
  if (staleExceptions.length > 0) {
    console.log(`[ERROR] ${staleExceptions.length} exceção(ões) de arquivo sem ocorrência — remova de EXCEPTIONS:`);
    staleExceptions.forEach((rel) => console.log(`  - ${rel}`));
  }
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
