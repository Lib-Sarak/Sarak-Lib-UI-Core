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
// Em `src/components/**` e `src/features/**` valem também (f) a DURAÇÃO e o ATRASO fixos — a classe `duration-300`,
// `duration: 0.3` e `delay: 0.2` de um objeto de transição, `[animation-delay:0.2s]` — que vêm de `motionDuration*`
// e `motionStaggerDelay`; e (g) a sombra `rgba(var(--x, #hex), a)`, inválida (`var()` com cor não é canal) e, por
// isso, sumida. E (d): classe da PALETA do Tailwind
// (`text-slate-400`, `bg-emerald-500/10`, `hover:text-red-400`) — a cor de status e a neutra vêm do tema,
// nunca de um tom fixo. E só em `src/features/**` (os mocks do painel mostram o tema), (e): hex e
// `rgb()`/`rgba()` quase preto ou quase branco (todos os canais ≤ 32 ou ≥ 223) com qualquer alfa, a
// palavra `white`/`black` em `fill`/`stroke`/`color`/`background` e como parada de gradiente.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. É TEXTUAL e linha a linha: reconhece `rgba(255,255,255,…)`/`rgba(0,0,0,…)` e a classe
//    `…-white|black/…`. NÃO vê `hsl()` nem `rgb(255 255 255 / 5%)` (sintaxe de espaço). Hex e quase
//    preto/branco só em `src/features/`: em `src/components/` o hex sólido (`#fff`) não é acusado (a
//    reserva de token é hex). A paleta é lida por classe literal — nome montado por template
//    (`bg-${cor}-500`) e a cor de um `style` com tom de paleta escrito em hex ficam fora.
// 2. A reserva é reconhecida contando parênteses: dentro de um `var(` ainda aberto na mesma linha.
//    Uma reserva que abre numa linha e fecha em outra não é reconhecida (falso positivo; o conserto
//    é reformatar ou declarar a exceção).
// 3. Só `src/components/**`, `src/features/**` e os parciais `_base.css`, `_utilities.css`,
//    `_elements.css`, `_card-defaults.css` e `_cards.css`. NÃO vê `_atmosphere.css`, `_surfaces.css` e
//    `_card-materials.css` (texturas e materiais: o branco/preto ali é desenho da textura, medido por
//    `cromo-css-real:check`), nem o CSS do consumidor. Em `src/features/` a leitura de modo é
//    do texto: que o painel de fato siga o modo do tema que mostra é do navegador
//    (`browser-tests/painel-segue-o-modo.spec.ts`), não deste gate.
// 4. Não julga se o valor derivado é legível: `color-mix` sobre a cor de texto do tema é a forma
//    aceita, e o contraste dos pares que os componentes desenham é do `verify_contrast.ts`.
// 5. As exceções são `EXCEPTIONS` (arquivo inteiro, com motivo) e o marcador de linha
//    `sarak-allow-fixed-color: <motivo>` na linha ou na anterior. O gate acusa exceção de arquivo
//    que deixou de ter ocorrência.
// 6. A duração é lida pelo NOME (`duration:`/`delay:` com número literal, `duration-<n>`, `animation-delay:<n>s`):
//    um `delay: 300` de debounce (milissegundos, nada a ver com movimento) também é acusado — o conserto é o
//    marcador de linha com o motivo. Não vê duração em `transition-duration:` por classe arbitrária de outra
//    forma, nem em `setTimeout(…, 200)`, nem em `style={{ transitionDuration: '0.3s' }}`.
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

/** Tom de paleta do Tailwind: `text-slate-400`, `bg-emerald-500/10`, `hover:text-red-400`, `to-indigo-500`. */
const PALETTE_RE = /(?<![\w-])((?:[\w/[\]-]+:)*)(bg|text|border|ring|shadow|from|via|to|outline|divide|fill|stroke|decoration|accent|caret|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(\/(?:\[[0-9.]+\]|\d+))?(?![\w-])/g;
/** Duração e atraso numéricos: classe `duration-300`, `duration: 0.3`, `delay: 0.2` e `[animation-delay:0.2s]`. `0` fica (reduz o movimento). */
const DURATION_CLASS_RE = /(?<![\w-])((?:[\w/[\]-]+:)*)duration-\d+(?![\w-])/g;
const DURATION_LITERAL_RE = /(?<![\w$])(?:duration|delay)\s*:\s*(?!0(?:\.0+)?\s*[,}])[0-9]*\.?[0-9]+\s*(?=[,}])/g;
const ANIMATION_DELAY_RE = /animation-delay:\s*[0-9.]+m?s/g;
/** `rgba(var(--x, #00f2ff), 0.5)`: o `var()` devolve uma COR, e `rgba()` pede os três canais. */
const RGBA_VAR_COLOR_RE = /rgba?\(\s*var\(\s*--[\w-]+\s*,\s*(?:#[0-9a-fA-F]{3,8}|rgba?\()/g;
const HEX_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F\w-])/g;
const RGB_ANY_RE = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[0-9.]+\s*)?\)/g;
const KEYWORD_RE = /(?:fill|stroke|color|background(?:Color)?|stopColor)\s*[:=]\s*\{?\s*['"](?:white|black)['"]/g;
const GRADIENT_STOP_RE = /,\s*(?:white|black)\s+[\d.]+(?:px|%)/g;

/** Quase preto ou quase branco: todos os canais ≤ 32 ou todos ≥ 223. */
const NEAR_EXTREME = 32;
const isNearExtreme = (channels) => channels.every((c) => c <= NEAR_EXTREME) || channels.every((c) => c >= 255 - NEAR_EXTREME);

const hexChannels = (digits) => {
  const full = digits.length <= 4 ? [...digits].map((c) => c + c).join('') : digits;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

/** Os achados que só valem no painel (`src/features/`): hex, `rgb()` e palavra quase preta/branca. */
function findStrict(line, taken) {
  const found = [];
  for (const match of line.matchAll(HEX_RE)) {
    if (isNearExtreme(hexChannels(match[1]))) found.push({ kind: 'hex', text: match[0], index: match.index });
  }
  for (const match of line.matchAll(RGB_ANY_RE)) {
    if (taken.has(match.index)) continue;
    if (isNearExtreme([match[1], match[2], match[3]].map(Number))) found.push({ kind: 'rgba', text: match[0], index: match.index });
  }
  for (const match of line.matchAll(KEYWORD_RE)) found.push({ kind: 'palavra', text: match[0], index: match.index });
  for (const match of line.matchAll(GRADIENT_STOP_RE)) found.push({ kind: 'palavra', text: match[0].replace(/^,\s*/, ''), index: match.index });
  return found;
}

/**
 * Ocorrências de cor fixa numa linha: `[{ kind, text, index }]`. Com `strict` (o painel, `src/features/`) entram
 * também hex, `rgb()` e palavra quase preta/branca.
 */
export function findInLine(line, { strict = false } = {}) {
  const found = [];
  for (const match of line.matchAll(CLASS_RE)) {
    const [text, , utility, , alpha] = match;
    const solid = !alpha && (utility === 'text' || utility === 'bg');
    if (alpha || solid) found.push({ kind: 'classe', text, index: match.index });
  }
  for (const match of line.matchAll(RGBA_RE)) {
    if (Number(match[1]) < 1) found.push({ kind: 'rgba', text: match[0], index: match.index });
  }
  for (const match of line.matchAll(PALETTE_RE)) found.push({ kind: 'paleta', text: match[0], index: match.index });
  for (const match of line.matchAll(DURATION_CLASS_RE)) found.push({ kind: 'duração', text: match[0], index: match.index });
  for (const match of line.matchAll(DURATION_LITERAL_RE)) found.push({ kind: 'duração', text: match[0].trim(), index: match.index });
  for (const match of line.matchAll(ANIMATION_DELAY_RE)) found.push({ kind: 'duração', text: match[0], index: match.index });
  for (const match of line.matchAll(RGBA_VAR_COLOR_RE)) found.push({ kind: 'sombra-inválida', text: match[0], index: match.index });
  if (strict) found.push(...findStrict(line, new Set(found.map((hit) => hit.index))));
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
      const hits = findInLine(line, { strict: rel.startsWith('src/features/') });
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
  console.log('--- check-fixed-translucent (cor fixa — branco/preto e paleta — em componente e no painel) ---');
  const { violations, staleExceptions } = findFixedTranslucent();
  if (violations.length === 0 && staleExceptions.length === 0) {
    console.log(`[OK] Nenhuma cor fixa em componente nem no painel (exceções declaradas: ${Object.keys(EXCEPTIONS).length}).`);
    return;
  }
  if (violations.length > 0) {
    console.log(`[ERROR] ${violations.length} cor(es) fixa(s) em componente ou no painel — somem (ou ficam ilegíveis) sob tema claro, ou ignoram o tema:`);
    violations.forEach((v) => console.log(`  - ${v.file}:${v.line} — ${v.kind} \`${v.text}\``));
    console.log('  Conserto: o valor vem de token do tema, ou deriva da cor de texto/superfície por `color-mix` — `bg-theme-tint*`,');
    console.log('  `border-theme-tint*`, `text-[var(--text-main,…)]`, `--sarak-on-*` (texto sobre cor sólida); tom de paleta (`text-slate-400`,');
    console.log('  `bg-emerald-500/10`) vira a cor de status do tema (`--sarak-status-*-color`) ou o texto/borda do tema (`--text-muted`, `--border-color`).');
  }
  if (staleExceptions.length > 0) {
    console.log(`[ERROR] ${staleExceptions.length} exceção(ões) de arquivo sem ocorrência — remova de EXCEPTIONS:`);
    staleExceptions.forEach((rel) => console.log(`  - ${rel}`));
  }
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
