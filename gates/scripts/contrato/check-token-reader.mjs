/**
 * Gate de LEITOR DE TOKEN (R40): todo valor que o motor emite tem leitor.
 *
 * Um token passa por três camadas — o schema (opções, painel, catálogo), o motor
 * (variáveis e atributos que o `manifest.ts` declara e `useDesignVariables` emite) e um
 * LEITOR (regra CSS ou componente). Token oferecido sem leitor é contrato quebrado com
 * o usuário final (specs/specs/09-temas-e-presets.md §4.4.3): o painel mostra a opção,
 * o tema a escolhe e nada muda na tela. O `check-chrome-token-parity` cobra isso só no
 * cromo; este gate cobra no resto.
 *
 * Duas regras, um script:
 *   (i)  VARIÁVEL — cada entrada do manifesto com `vars` tem ao menos uma variável
 *        lida (`var(--x)` em CSS ou literal em componente) ou o próprio id do token
 *        lido num componente. As variáveis consideradas são as do manifesto, as
 *        `cssVars` do schema do mesmo id e a automática `--sarak-<kebab>`: o motor
 *        emite as três famílias para o mesmo valor, então um leitor de qualquer uma
 *        lê o token. Um token lido por ATRIBUTO (regra ii satisfeita em todas as
 *        opções) também está lido: a variável é só o outro canal do mesmo valor.
 *   (ii) OPÇÃO — cada entrada do manifesto com `attr`, cujo token do schema é um
 *        `select` de opções literais, tem para CADA opção uma regra CSS
 *        (`[data-sx-<kebab>="valor"]`, atributo que o motor de fato emite, ou a
 *        `classPrefix` do manifesto) ou um leitor em componente (arquivo que acessa o
 *        id do token e contém o valor como literal).
 *
 * Uso: `node gates/scripts/contrato/check-token-reader.mjs` — toda ausência sem
 * exceção declarada é bloqueio. A exceção é `ALLOWLIST`, com motivo, e se esvazia
 * sozinha: entrada que deixou de ser achado também é bloqueio (remova-a).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. ESCOPO = o que o `manifest.ts` declara (`vars` e `attr`). Token de schema que o
 *    manifesto não cita fica fora, mesmo emitindo variável e atributo pelo
 *    `useDesignVariables`. Ampliar o escopo é decisão de plan, não de correção.
 * 2. É TEXTUAL, não por AST: prova que uma referência existe (variável em `var(...)`
 *    ou literal, id acessado por `.id`/`?.id`/desestruturação), não que o consumo é
 *    correto nem que produz efeito visível. A prova de efeito é o teste do leitor e,
 *    para CSS renderizado, `cromo-css-real:check`.
 * 3. Não distingue leitor vivo de leitor morto: uma regra CSS sob seletor que nenhum
 *    elemento satisfaz, ou um componente que ninguém monta, conta como leitor.
 * 4. Não distingue consumo de citação em comentário (mesma limitação de
 *    `auditor_ghostvars.mjs`, specs/specs/01-gates-e-baseline.md §4.3.c).
 * 5. (ii) só cobre `select` com `value: '…'` literal no próprio schema (inline ou
 *    constante do mesmo arquivo); `type: 'boolean'`/`font` e opções computadas ficam
 *    fora. Um valor lido por regex ou por prefixo (`startsWith`) não é reconhecido.
 * 6. Leitor em componente = arquivo fora de schema, catálogo, gerados, presets,
 *    testes e do próprio manifesto. O painel de customização conta como leitor: ele
 *    é um consumidor legítimo (renderiza o preview), mas não prova o efeito no app.
 * 7. A opção `none` é a AUSÊNCIA do efeito: não há o que ler, e o gate a isenta. Um
 *    token cujo único valor útil é `none` fica invisível aqui.
 * 8. Id lido por chave computada (`design[token]`) não é reconhecido como leitura;
 *    o leitor tem de acessar o id por nome (`design.id`).
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const toKebabCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const escapeRe = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const OUT_OF_PLAN = 'Sem leitor medido em 2026-10-11; fora dos achados da plan que criou o gate. Cabe ao revisor decidir: dar leitor ao token ou retirá-lo do schema.';

/**
 * Achados que o gate aceita enquanto existirem, cada um com o MOTIVO. Esvazia sozinha:
 * entrada que o gate já não acusa é erro. `kind` (`var` = regra i, `option` = regra ii) e
 * `value` são opcionais e estreitam a entrada; sem eles, ela cobre o token inteiro.
 */
export const ALLOWLIST = [
    { tokenId: 'colorPalette', motivo: OUT_OF_PLAN },
    { tokenId: 'colorDepth', motivo: OUT_OF_PLAN },
    { tokenId: 'colorVariation', motivo: OUT_OF_PLAN },
    { tokenId: 'borderRadiusSm', motivo: OUT_OF_PLAN },
    { tokenId: 'borderRadiusMd', motivo: OUT_OF_PLAN },
    { tokenId: 'borderRadiusLg', motivo: OUT_OF_PLAN },
    { tokenId: 'contrastCurve', motivo: OUT_OF_PLAN },
    { tokenId: 'borderType', motivo: OUT_OF_PLAN },
    { tokenId: 'shadowOrientation', motivo: OUT_OF_PLAN },
    { tokenId: 'layeredShadows', motivo: OUT_OF_PLAN },
    { tokenId: 'scrollbarStyle', motivo: OUT_OF_PLAN },
];

/** Valor de opção que é a ausência do efeito — não há leitor a exigir. */
const ABSENCE_VALUES = new Set(['none']);

const SCHEMA_DIR = 'src/core/Design/schema';
const MANIFEST_FILE = 'src/core/Provider/manifest.ts';
const EXCLUDED_PATH_FRAGMENTS = [
    '/__tests__/',
    '/core/Design/schema/',
    '/core/Design/catalog/',
    '/core/Provider/generated/',
    '/core/Design/presets/',
    '/core/Provider/manifest.ts',
];

/** Remove comentários de linha e de bloco, preservando o resto — chave `{` em comentário quebraria a contagem. */
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

/** Devolve o texto balanceado que começa em `openIndex` (um `{` ou `[`) e o índice após o fechamento. */
function takeBalanced(src, openIndex) {
    const open = src[openIndex];
    const close = open === '{' ? '}' : ']';
    let depth = 0;
    let quote = null;
    for (let i = openIndex; i < src.length; i++) {
        const ch = src[i];
        if (quote) {
            if (ch === '\\') i++;
            else if (ch === quote) quote = null;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') quote = ch;
        else if (ch === open) depth++;
        else if (ch === close && --depth === 0) return { text: src.slice(openIndex, i + 1), end: i + 1 };
    }
    return { text: src.slice(openIndex), end: src.length };
}

/** Lê o manifesto como TEXTO: `{ [id]: { vars, attr, classPrefix } }`. */
export function parseManifest(source) {
    const src = stripComments(source);
    const marker = src.indexOf('> = {');
    const bodyStart = src.indexOf('{', marker);
    const { text: body } = takeBalanced(src, bodyStart);
    const inner = body.slice(1, -1);
    const entries = {};
    const keyRe = /(?:^|,|\n)\s*([A-Za-z_]\w*)\s*:\s*\{/g;
    let cursor = 0;
    let match;
    while ((match = keyRe.exec(inner.slice(cursor))) !== null) {
        const openAt = cursor + match.index + match[0].length - 1;
        const { text, end } = takeBalanced(inner, openAt);
        const varsBlock = text.match(/\bvars:\s*\[([^\]]*)\]/);
        entries[match[1]] = {
            vars: varsBlock ? Array.from(varsBlock[1].matchAll(/'(--[\w-]+)'/g)).map((m) => m[1]) : [],
            attr: (text.match(/\battr:\s*'([^']+)'/) || [])[1] ?? null,
            classPrefix: (text.match(/\bclassPrefix:\s*'([^']+)'/) || [])[1] ?? null,
        };
        cursor = end;
        keyRe.lastIndex = 0;
    }
    return entries;
}

/** Valores `value: '…'` de um bloco de opções. */
function optionValues(block) {
    return Array.from(block.matchAll(/\bvalue:\s*'([^']*)'/g)).map((m) => m[1]);
}

/** Lê um schema como TEXTO: `{ id, type, cssVars, options|null }` por token. */
export function parseSchemaTokens(source) {
    const src = stripComments(source);
    const constants = {};
    for (const m of src.matchAll(/\bconst\s+([A-Z][A-Z0-9_]*)\s*=\s*\[/g)) {
        const { text } = takeBalanced(src, m.index + m[0].length - 1);
        constants[m[1]] = optionValues(text);
    }
    const tokensAt = src.indexOf('tokens:');
    if (tokensAt < 0) return [];
    const { text: array } = takeBalanced(src, src.indexOf('[', tokensAt));
    const body = array.slice(1, -1);
    const tokens = [];
    let i = 0;
    while (i < body.length) {
        if (body[i] !== '{') { i++; continue; }
        const { text, end } = takeBalanced(body, i);
        i = end;
        const id = (text.match(/\bid:\s*'([^']+)'/) || [])[1];
        if (!id) continue;
        const cssBlock = text.match(/cssVars:\s*\[([^\]]*)\]/);
        const ref = text.match(/\boptions:\s*([A-Z][A-Z0-9_]*)\b/);
        const inline = text.match(/\boptions:\s*\[/);
        let options = null;
        if (ref && constants[ref[1]]) options = constants[ref[1]];
        else if (inline) options = optionValues(takeBalanced(text, text.indexOf('[', inline.index)).text);
        tokens.push({
            id,
            type: (text.match(/\btype:\s*'([^']+)'/) || [])[1] ?? null,
            cssVars: cssBlock ? Array.from(cssBlock[1].matchAll(/'(--[\w-]+)'/g)).map((m) => m[1]) : [],
            options,
        });
    }
    return tokens;
}

function walk(dir, predicate, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, predicate, out);
        else if (predicate(full)) out.push(full);
    }
    return out;
}

const isExcluded = (file) => {
    const normalized = file.split(path.sep).join('/');
    return EXCLUDED_PATH_FRAGMENTS.some((fragment) => normalized.includes(fragment)) || /\.(test|spec)\.\w+$/.test(normalized);
};

/** O que o gate lê: o CSS inteiro de `src/` e os componentes/hooks (TS) fora das camadas excluídas. */
export function collectSources(root) {
    const src = path.join(root, 'src');
    const css = walk(src, (f) => f.endsWith('.css') && !isExcluded(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const code = walk(src, (f) => /\.tsx?$/.test(f) && !/\.d\.ts$/.test(f) && !isExcluded(f))
        .map((f) => stripComments(fs.readFileSync(f, 'utf8')));
    return { css, code };
}

function loadSchemas(root) {
    const dir = path.join(root, SCHEMA_DIR);
    const byId = new Map();
    for (const file of walk(dir, (f) => f.endsWith('.ts') && !f.includes('__tests__'))) {
        for (const token of parseSchemaTokens(fs.readFileSync(file, 'utf8'))) {
            if (!byId.has(token.id)) byId.set(token.id, token);
        }
    }
    return byId;
}

/** O id do token é ACESSADO (`x.id`, `x?.id`, `{ id } = …`), não apenas citado em string. */
function codeReadsId(code, id) {
    const access = new RegExp(`(?:\\.|\\?\\.)${id}\\b`);
    const destructure = new RegExp(`\\{[^{}]*\\b${id}\\b[^{}]*\\}\\s*=\\s*[\\w.]+`);
    return code.some((text) => access.test(text) || destructure.test(text));
}

function codeHasVar(code, cssText, name) {
    return cssText.includes(`var(${name}`) || code.some((text) => text.includes(name));
}

function optionHasReader({ token, entry, css, code, value }) {
    const attrName = `data-sx-${toKebabCase(token.id)}`;
    const quoted = `["']?${escapeRe(value)}["']?`;
    if (new RegExp(`\\[${attrName}\\s*(?:[~|^$*]?=)\\s*${quoted}\\s*\\]`).test(css)) return true;
    if (entry.classPrefix && new RegExp(`\\.${escapeRe(entry.classPrefix + value)}(?![\\w-])`).test(css)) return true;
    const literal = new RegExp(`['"\`]${escapeRe(value)}['"\`]`);
    return code.some((text) => codeReadsIdIn(text, token.id) && literal.test(text));
}

function codeReadsIdIn(text, id) {
    return new RegExp(`(?:\\.|\\?\\.)${id}\\b`).test(text)
        || new RegExp(`\\{[^{}]*\\b${id}\\b[^{}]*\\}\\s*=\\s*[\\w.]+`).test(text);
}

/** Todo valor emitido sem leitor. Cada achado: `{ kind, token, value?, detail }`. */
export function checkTokenReader({ root = ROOT, allowlist = ALLOWLIST } = {}) {
    const manifest = parseManifest(fs.readFileSync(path.join(root, MANIFEST_FILE), 'utf8'));
    const schemas = loadSchemas(root);
    const { css, code } = collectSources(root);
    const findings = [];

    for (const [id, entry] of Object.entries(manifest)) {
        const token = schemas.get(id) ?? { id, type: null, cssVars: [], options: null };
        const optionFindings = [];
        const readByAttribute = Boolean(entry.attr) && token.type === 'select' && Boolean(token.options);
        if (readByAttribute) {
            for (const value of token.options.filter((v) => !ABSENCE_VALUES.has(v))) {
                if (!optionHasReader({ token, entry, css, code, value })) {
                    optionFindings.push({ kind: 'option', tokenId: id, value, detail: `data-sx-${toKebabCase(id)}="${value}"` });
                }
            }
        }
        findings.push(...optionFindings);
        if (entry.vars.length === 0) continue;
        const candidates = [...new Set([...entry.vars, ...token.cssVars, `--sarak-${toKebabCase(id)}`])];
        const readByVar = candidates.some((name) => codeHasVar(code, css, name)) || codeReadsId(code, id);
        const readByAttr = readByAttribute && optionFindings.length === 0;
        if (!readByVar && !readByAttr) findings.push({ kind: 'var', tokenId: id, detail: entry.vars.join(', ') });
    }

    const covers = (a, f) => a.tokenId === f.tokenId && (a.kind === undefined || a.kind === f.kind)
        && (a.value === undefined || a.value === f.value);
    const open = findings.filter((f) => !allowlist.some((a) => covers(a, f)));
    const stale = allowlist.filter((a) => !findings.some((f) => covers(a, f)));
    return { findings, open, stale };
}

function main() {
    console.log('--- check-token-reader (todo valor emitido pelo motor tem leitor) ---');
    const { findings, open, stale } = checkTokenReader();
    const allowed = findings.length - open.length;

    if (open.length === 0 && stale.length === 0) {
        console.log(`[OK] Todo valor emitido tem leitor.${allowed > 0 ? ` Exceções declaradas (ALLOWLIST): ${allowed}.` : ''}`);
        return;
    }
    if (open.length > 0) {
        console.log(`[ERROR] ${open.length} valor(es) emitido(s) sem leitor:`);
        for (const f of open) {
            console.log(`  - ${f.kind === 'var' ? 'variável' : 'opção'} ${f.tokenId}${f.value !== undefined ? ` = "${f.value}"` : ''}: ${f.detail}`);
        }
    }
    if (stale.length > 0) {
        console.log(`[ERROR] ${stale.length} exceção(ões) da ALLOWLIST já não é(são) achado — remova:`);
        for (const a of stale) console.log(`  - ${a.tokenId}${a.kind ? ` (${a.kind})` : ''}${a.value !== undefined ? ` = "${a.value}"` : ''}`);
    }
    console.log('  Regra: R40 — valor oferecido pelo schema e emitido pelo motor é contrato com o usuário final (09 §4.4.3).');
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
