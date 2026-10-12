// O motor não impõe, com `!important` em seletor amplo, propriedade visual que o componente controla
// por classe ou por token. `!important` na camada final (`sarak-lib`) vence a classe utilitária, o
// `style` inline do componente e o CSS do consumidor — e foi o que fez o raio, o fundo, a borda, o hover
// e a transição do cartão nunca chegarem à tela (bloco de `_atmosphere.css` que escrevia tudo isso em
// `.card`/`.sarak-card`/`.bg-theme-card` sob `.sarak-design-scope`, e o reset de `main`/`section`/
// `article` que apagava o fundo de qualquer componente). A ordem de camadas está em
// `arquitetura/02-design-engine.md` §9.1; o padrão que cede à classe mora em `components.sarak-elements`.
//
// Uma declaração é acusada quando TODAS valem:
//   (a) é `!important`;
//   (b) a propriedade é visual (fundo, borda, raio, sombra, filtro, opacidade, transição, recorte, cor);
//   (c) o ALVO (o último seletor composto) é amplo: um elemento (`main`, `section`, `button`, `*`…) ou uma
//       âncora de componente da lib (`.card`, `.sarak-card`, `.bg-theme-card`, `.bg-theme-body`…);
//   (d) nada ESTREITA o seletor: nem atributo com valor (`[data-sx-border-type="glow"]`), nem pseudoclasse
//       de estado (`:hover`, `:active`…), nem classe de modo (`.sarak-eco-mode`, `.is-geometric`), nem
//       outra classe que não seja uma âncora, nem `@media`/`@supports`. Atributo SEM valor
//       (`[data-sx-texture]`) e o escopo sempre ligado (`.sarak-design-scope`, `body`, `html`, `:root`)
//       não estreitam — são justamente o "vale sempre".
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. É TEXTUAL, sobre `src/styles/*.css`. Não vê CSS gerado no build (`dist/`), `<style>` montado em
//    TypeScript (`DesignInjector`, `DesignScope`) nem `style` inline com `!important`.
// 2. Só `!important`. Uma regra comum na camada final também vence a classe utilitária (a camada vem depois
//    de `utilities`), e este gate não a acusa: o que ele cobra é a ordem de camadas — padrão que cede mora em
//    `components.sarak-elements` (`_card-defaults.css`), onde não há `!important` — e isso é prova de
//    navegador (`browser-tests/`), não deste texto.
// 3. "Estreitar" é lexical: qualquer classe que não seja âncora conta, mesmo uma que o motor aplica em
//    tudo. Falso negativo possível; é o preço de não manter uma lista de classes de modo.
// 4. Classes utilitárias da lib com nome próprio (`.rounded-theme`, `.border-theme`, `.shadow-theme`,
//    `.transition-sarak`) não são âncora: são classes que o autor escolhe aplicar, e `!important` é o desenho
//    delas. Propriedade de layout (`margin`, `top`, `min-width`, `display`) não é visual e não é cobrada.
// 5. As exceções aceitas estão na constante `EXCEPTIONS`, uma a uma, com motivo — e o gate também acusa a
//    exceção que deixou de existir, para a lista não apodrecer.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const STYLES_DIR = path.join(ROOT, 'src', 'styles');

const VISUAL_PROPERTY_RE = /^(background|border|outline|box-shadow|text-shadow|backdrop-filter|filter|opacity|transition|animation|clip-path|color|fill|stroke|transform|mix-blend-mode)/;

// Âncoras de componente: classes que os componentes da lib (e o consumidor) aplicam por nome.
const COMPONENT_ANCHORS = new Set([
  'card', 'sarak-card', 'bg-theme-card', 'bg-theme-body',
  'sarak-shell-sidebar', 'sarak-shell-header', 'sarak-module-container', 'module-content', 'module-wrapper',
]);
// Escopos que existem sempre: não estreitam o seletor.
const ALWAYS_ON_CLASSES = new Set(['sarak-design-scope']);
const ALWAYS_ON_TAGS = new Set(['html', 'body']);
const STATE_PSEUDO_RE = /:(hover|active|focus|focus-visible|focus-within|disabled|checked|placeholder-shown)\b/;
const STATE_CLASS_RE = /^(is-[\w-]+|[\w-]+-mode)$/;

// Exceções declaradas: arquivo + seletor + propriedade, com o motivo.
export const EXCEPTIONS = [
  {
    file: '_base.css',
    selector: 'body',
    property: 'background-color',
    reason: 'o fundo do `body` é o único `!important` de padrão de elemento, por desenho (02-design-engine §9.1: "O que ainda não cede à classe")',
  },
];

function maskComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function findClosingBrace(css, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return css.length - 1;
}

function splitOutsideParens(text, separator) {
  const parts = [];
  let depth = 0;
  let quote = '';
  let current = '';
  for (const char of text) {
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    if (char === separator && depth === 0 && !quote) {
      parts.push(current);
      current = '';
    } else current += char;
  }
  parts.push(current);
  return parts;
}

function lineOf(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

/** Percorre as regras de estilo, carregando o contexto de `@media`/`@supports`. */
export function collectRules(rawCss) {
  const css = maskComments(rawCss);
  const rules = [];
  const walk = (start, end, atContext) => {
    let cursor = start;
    while (cursor < end) {
      const open = css.indexOf('{', cursor);
      const semicolon = css.indexOf(';', cursor);
      if (open === -1 || open >= end) break;
      if (semicolon !== -1 && semicolon < open && css.slice(cursor, semicolon).trim().startsWith('@')) {
        cursor = semicolon + 1;
        continue;
      }
      const prelude = css.slice(cursor, open).trim();
      const close = findClosingBrace(css, open);
      const preludeStart = cursor + (css.slice(cursor, open).length - css.slice(cursor, open).trimStart().length);
      if (prelude.startsWith('@')) {
        const name = prelude.slice(1).split(/[\s(]/)[0];
        if (['media', 'supports', 'layer', 'container'].includes(name)) {
          walk(open + 1, close, atContext.concat(name === 'layer' ? [] : [prelude]));
        }
      } else if (prelude) {
        rules.push({ selector: prelude, body: css.slice(open + 1, close), line: lineOf(css, preludeStart), atContext });
      }
      cursor = close + 1;
    }
  };
  walk(0, css.length, []);
  return rules;
}

function importantVisualProperties(body) {
  return splitOutsideParens(body, ';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => /!important\s*$/.test(declaration))
    .map((declaration) => declaration.slice(0, declaration.indexOf(':')).trim().toLowerCase())
    .filter((property) => VISUAL_PROPERTY_RE.test(property));
}

function splitCompounds(selector) {
  const compounds = [];
  let depth = 0;
  let current = '';
  for (const char of selector) {
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    if (depth === 0 && /[\s>+~]/.test(char)) {
      if (current) compounds.push(current);
      current = '';
    } else current += char;
  }
  if (current) compounds.push(current);
  return compounds;
}

/** Remove `:not(...)` (nega, não estreita) e os pseudoelementos (o alvo é o elemento). */
function stripNegationAndPseudoElements(compound) {
  let out = compound;
  let previous;
  do {
    previous = out;
    out = out.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');
  } while (out !== previous);
  return out.replace(/::?(before|after|placeholder|selection|marker)\b/g, '');
}

function simpleSelectorsOf(compound) {
  const inner = [];
  const unwrapped = compound.replace(/:(?:is|where)\(((?:[^()]|\([^()]*\))*)\)/g, (_, list) => {
    inner.push(...splitOutsideParens(list, ',').map((item) => item.trim()));
    return '';
  });
  return { base: unwrapped, inner };
}

function describeCompound(compound) {
  const cleaned = stripNegationAndPseudoElements(compound);
  const { base, inner } = simpleSelectorsOf(cleaned);
  const texts = [base, ...inner];
  const classes = [];
  const tags = [];
  let hasValuedAttribute = false;
  let hasState = false;
  for (const text of texts) {
    classes.push(...[...text.matchAll(/\.([\w-]+)/g)].map((match) => match[1]));
    const tag = text.match(/^(\*|[a-z][a-z0-9-]*)/i);
    if (tag) tags.push(tag[1].toLowerCase());
    if (/\[[^\]=]+(?:[~|^$*]?=)[^\]]+\]/.test(text)) hasValuedAttribute = true;
    if (STATE_PSEUDO_RE.test(text)) hasState = true;
  }
  return { classes, tags, hasValuedAttribute, hasState };
}

function compoundNarrows(description, isSubject) {
  if (description.hasValuedAttribute || description.hasState) return true;
  const narrowingClass = description.classes.some((name) => {
    if (STATE_CLASS_RE.test(name)) return true;
    if (ALWAYS_ON_CLASSES.has(name)) return false;
    return isSubject ? !COMPONENT_ANCHORS.has(name) : true;
  });
  return narrowingClass;
}

/** Devolve `{ broad, narrowed }` de UM seletor (sem vírgula). */
export function classifySelector(selector, atContext = []) {
  const compounds = splitCompounds(selector.trim());
  if (compounds.length === 0) return { broad: false, narrowed: true };
  const descriptions = compounds.map(describeCompound);
  const subject = descriptions[descriptions.length - 1];
  const broad = subject.tags.length > 0 || subject.classes.some((name) => COMPONENT_ANCHORS.has(name));
  const narrowed = atContext.length > 0
    || descriptions.some((description, index) => compoundNarrows(description, index === descriptions.length - 1));
  return { broad, narrowed };
}

export function findImportantVisualViolations({ stylesDir = STYLES_DIR } = {}) {
  const violations = [];
  const seenExceptions = new Set();
  const files = fs.readdirSync(stylesDir).filter((name) => name.endsWith('.css')).sort();
  for (const file of files) {
    const css = fs.readFileSync(path.join(stylesDir, file), 'utf8');
    for (const rule of collectRules(css)) {
      const properties = importantVisualProperties(rule.body);
      if (properties.length === 0) continue;
      for (const selector of splitOutsideParens(rule.selector, ',').map((item) => item.trim()).filter(Boolean)) {
        const { broad, narrowed } = classifySelector(selector, rule.atContext);
        if (!broad || narrowed) continue;
        for (const property of properties) {
          const exception = EXCEPTIONS.find((item) => item.file === file && item.selector === selector && item.property === property);
          if (exception) {
            seenExceptions.add(exception);
            continue;
          }
          violations.push({ file: `src/styles/${file}`, line: rule.line, selector, property });
        }
      }
    }
  }
  const staleExceptions = EXCEPTIONS.filter((item) => !seenExceptions.has(item));
  return { violations, staleExceptions };
}

function main() {
  console.log('--- check-css-important-visual ---');
  const stylesDirArgument = process.argv.indexOf('--styles-dir');
  const stylesDir = stylesDirArgument > -1 ? path.resolve(process.argv[stylesDirArgument + 1]) : STYLES_DIR;
  const { violations, staleExceptions } = findImportantVisualViolations({ stylesDir });

  if (violations.length === 0 && staleExceptions.length === 0) {
    console.log('[OK] Nenhum `!important` visual em seletor amplo do motor (exceções declaradas: ' + EXCEPTIONS.length + ').');
    process.exit(0);
  }

  if (violations.length > 0) {
    console.log(`[ERROR] ${violations.length} declaração(ões) \`!important\` visual(is) em seletor amplo — vencem a classe e o estilo do componente:`);
    const grouped = new Map();
    violations.forEach((v) => {
      const key = `${v.file}:${v.line} — ${v.selector}`;
      grouped.set(key, [...(grouped.get(key) ?? []), v.property]);
    });
    grouped.forEach((properties, key) => console.log(`  - ${key} { ${properties.join(', ')} !important }`));
    console.log('  Conserto: o padrão do motor mora em `components.sarak-elements` (`_card-defaults.css`), sem `!important`; só o modo eco e o movimento reduzido (e a escolha explícita de token, por atributo com valor) usam `!important`.');
  }
  if (staleExceptions.length > 0) {
    console.log(`[ERROR] ${staleExceptions.length} exceção(ões) declarada(s) que não existe(m) mais — remova de EXCEPTIONS:`);
    staleExceptions.forEach((e) => console.log(`  - ${e.file} — ${e.selector} { ${e.property} }`));
  }
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
