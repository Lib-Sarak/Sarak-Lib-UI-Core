/**
 * Gate de LEITOR DE TOKEN (R40): todo valor que o motor emite tem leitor.
 *
 * Um token passa por três camadas — o schema (opções, painel, catálogo), o motor
 * (`useDesignVariables`, que emite para TODO token do schema a variável `--sarak-<kebab>`,
 * as `cssVars` e o atributo `data-sx-<kebab>`) e um LEITOR (regra CSS ou componente).
 * Token oferecido sem leitor é contrato quebrado com o usuário final
 * (specs/specs/09-temas-e-presets.md §4.4.3): o painel mostra a opção, o tema a escolhe e
 * nada muda na tela. O `check-chrome-token-parity` cobra isso só no cromo; este gate cobra
 * no schema inteiro.
 *
 * Duas regras, um script, o mesmo escopo — cada token de `src/core/Design/schema/`:
 *   (i)  VARIÁVEL — ao menos uma variável do token é lida (`var(--x)` em CSS ou literal em
 *        componente) ou o próprio id do token é lido num componente. As variáveis
 *        consideradas são a automática `--sarak-<kebab>`, as `cssVars` do schema e as do
 *        manifesto: o motor emite as famílias para o mesmo valor, então um leitor de
 *        qualquer uma lê o token. Um token lido por ATRIBUTO (regra ii satisfeita em todas
 *        as opções, ou qualquer regra `[data-sx-<kebab>…]` num token que não é `select`)
 *        também está lido: a variável é só o outro canal do mesmo valor.
 *   (ii) OPÇÃO — cada token `select` de opções literais tem, para CADA opção, uma regra CSS
 *        (`[data-sx-<kebab>="valor"]`, atributo que o motor de fato emite, ou a
 *        `classPrefix` do manifesto), um leitor em componente (arquivo que acessa o
 *        id do token e contém o valor como literal) ou um leitor DECLARADO (abaixo).
 *   (iii) TESTE — o token cujo leitor é declarado (tabela ou passagem direta, onde o gate
 *        textual não vê o literal junto do id) tem de ter, para CADA opção, um arquivo de
 *        teste que cita o id e o valor: é a prova por opção que a leitura declarada pede.
 *
 * Regra (iv) — O PAINEL NÃO É LEITOR DE TOKEN QUE TEM COMPONENTE NA LIB. O painel
 * (`src/features/DesignEngine/`) lê o token para desenhar a pré-visualização; se o componente
 * real não o lê, o painel mostra uma coisa e a tela outra (foi como `btnPrimaryBg` e
 * `cardShadow` passaram: "lidos" só pelo painel, enquanto o botão e o cartão reais os
 * ignoravam). Por isso a leitura do painel não conta para (i) nem (ii). A única exceção é
 * `PANEL_OWN_TOKENS`: o token que é do próprio painel (geometria da pré-visualização, da
 * moldura de dispositivo, do painel lateral) ou que a lib ainda não tem componente para
 * consumir (declarado no schema). Cada entrada traz o MOTIVO, e o gate acusa entrada
 * obsoleta (token inexistente, já lido por componente da lib, ou que nem o painel lê).
 *
 * Leitor declarado: o arquivo que guarda a tabela (ou que entrega o valor à propriedade CSS)
 * traz, em comentário, `@sarak-token-reader <id>[, <id>…] tabela` (a tabela cita o literal de
 * cada opção) ou `… direto` (o valor da opção é o próprio valor CSS; não há tabela). Em CSS
 * a declaração vai num comentário de bloco ao lado da regra que repassa a variável.
 *
 * Uso: `node gates/scripts/contrato/check-token-reader.mjs` — toda ausência sem
 * exceção declarada é bloqueio. A exceção é `ALLOWLIST`, com motivo, e se esvazia
 * sozinha: entrada que deixou de ser achado também é bloqueio (remova-a). Hoje ela está
 * VAZIA: o mecanismo continua para a próxima ampliação de escopo.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. ESCOPO = os tokens do schema. Variável que o `useDesignVariables` escreve FORA do
 *    laço de tokens (`--sarak-vignette-color`, `--sarak-card-clip-path`, os aliases
 *    `--text-main`…) não é token e fica fora. O manifesto NÃO define escopo: ele só
 *    informa `classPrefix` e variáveis extras (o `attr` dele nunca alimentou CSS).
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
 * 6. Leitor em componente = arquivo fora de schema, catálogo, gerados, presets, testes,
 *    do próprio manifesto e do PAINEL (`/features/DesignEngine/`, regra iv): o painel só
 *    conta para os tokens de `PANEL_OWN_TOKENS`. Quem decide que um token é "do painel"
 *    é a declaração humana em `PANEL_OWN_TOKENS` — o gate não deduz "tem componente na
 *    lib"; ele confere que, declarado, o token não é lido por componente da lib (senão a
 *    entrada é obsoleta) e que, não declarado, não é lido SÓ pelo painel.
 * 7. A opção `none` é a AUSÊNCIA do efeito: não há o que ler, e o gate a isenta. Um
 *    token cujo único valor útil é `none` fica invisível aqui.
 * 8. Id lido por chave computada (`design[token]`) não é reconhecido como leitura;
 *    o leitor tem de acessar o id por nome (`design.id`).
 * 9. SÓ A DIREÇÃO "emitido → lido". Variável que o CSS lê e NENHUM token emite (o caso de
 *    `--theme-texture-color-rgb` antes de `textureColor` ganhar variantes: 24 leitores
 *    caíam todos no fallback, em silêncio) é o gate inverso, e continua sem dono — hoje o
 *    caso se prova por teste.
 * 10. LEITOR POR TABELA OU PASSAGEM DIRETA É DECLARADO, não deduzido. O gate confere que o
 *    token existe, que a tabela traz o literal de cada opção (entre aspas ou como chave de
 *    objeto sem aspas) e que há teste por opção (arquivo `__tests__`/`*.test.*` que cita o
 *    id e o literal). NÃO prova que o teste afirma o efeito, nem que a tabela é consultada em
 *    runtime: a declaração é humana e o teste é textual. Apagar a linha da tabela ou o caso do
 *    teste faz o gate acusar.
 * 11. O nome da variável é ANCORADO: `--sarak-layout` não conta como lida por
 *    `var(--sarak-layout-gap-md, …)` (o caractere seguinte não pode continuar o identificador).
 *    Continua textual: citação em comentário de CSS ou em string solta também conta (limite 4).
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const toKebabCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const escapeRe = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Achados que o gate aceita enquanto existirem, cada um com o MOTIVO. Esvazia sozinha:
 * entrada que o gate já não acusa é erro. `kind` (`var` = regra i, `option` = regra ii,
 * `test` = regra iii) e `value` são opcionais e estreitam a entrada; sem eles, ela cobre o
 * token inteiro. Está VAZIA: todo token do schema tem leitor.
 */
export const ALLOWLIST = [];

/**
 * Tokens que o PAINEL lê e que não têm componente da lib para lê-los, cada um com o MOTIVO.
 * Esvazia sozinha como a `ALLOWLIST`: entrada cujo token já tem leitor na lib, que o painel
 * nem lê, ou que não existe no schema, é erro (remova). Token que ganhar componente sai
 * daqui no mesmo commit em que o componente passa a lê-lo.
 */
const PREVIEW_GEOMETRY = 'geometria da pré-visualização do painel (cartão de preset, moldura de dispositivo, painel lateral): é o desenho do próprio painel, não de componente da lib';
export const PANEL_OWN_TOKENS = {
    controlHeightToggle: 'altura do toggle exibido no "kitchen sink" do painel',
    progressBarMaxWidth: 'largura da barra de progresso exibida no "kitchen sink" do painel',
    layoutPreviewMaxH: PREVIEW_GEOMETRY,
    designEngineSidebarMinWidth: PREVIEW_GEOMETRY,
    designEngineSidebarMaxWidth: PREVIEW_GEOMETRY,
    deviceDesktopMinWidth: PREVIEW_GEOMETRY,
    deviceFrameRadius: PREVIEW_GEOMETRY,
    devicePhoneHeight: PREVIEW_GEOMETRY,
    devicePhoneNotchRadius: PREVIEW_GEOMETRY,
    deviceTabletHeight: PREVIEW_GEOMETRY,
    presetCardHoverShadowOffsetY: PREVIEW_GEOMETRY,
    presetCardShadowBlur: PREVIEW_GEOMETRY,
    presetCardShadowOffsetY: PREVIEW_GEOMETRY,
    presetCardShadowSpread: PREVIEW_GEOMETRY,
    presetGlowShadowBlur: PREVIEW_GEOMETRY,
    presetGlowShadowBlurLg: PREVIEW_GEOMETRY,
    presetGridTextureSize: PREVIEW_GEOMETRY,
    presetMatteShadowBlur1: PREVIEW_GEOMETRY,
    presetMatteShadowBlur2: PREVIEW_GEOMETRY,
    presetMatteShadowOffsetY2: PREVIEW_GEOMETRY,
    presetMatteShadowSpread1: PREVIEW_GEOMETRY,
    presetMatteShadowSpread2: PREVIEW_GEOMETRY,
    presetMiniCardHeight: PREVIEW_GEOMETRY,
    presetMiniCardMaxWidth: PREVIEW_GEOMETRY,
    presetPreviewMinHeight: PREVIEW_GEOMETRY,
    presetPreviewPaddingY: PREVIEW_GEOMETRY,
};

/** Valor de opção que é a ausência do efeito — não há leitor a exigir. */
const ABSENCE_VALUES = new Set(['none']);

const SCHEMA_DIR = 'src/core/Design/schema';
const MANIFEST_FILE = 'src/core/Provider/manifest.ts';
const PANEL_PATH_FRAGMENT = '/features/DesignEngine/';
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

const READER_MARKER = /@sarak-token-reader\s+([A-Za-z0-9_]+(?:\s*,\s*[A-Za-z0-9_]+)*)\s+(tabela|direto)\b/g;
const isTestFile = (file) => /\.(test|spec)\.\w+$/.test(file) || file.split(path.sep).includes('__tests__');

/** Leitores declarados: `id → { kind, texts }`, com o texto (sem comentários) de cada arquivo que declara. */
function collectMarkers(files) {
    const markers = new Map();
    for (const raw of files) {
        for (const match of raw.matchAll(READER_MARKER)) {
            for (const id of match[1].split(',').map((s) => s.trim())) {
                const entry = markers.get(id) ?? { kind: match[2], texts: [] };
                entry.texts.push(stripComments(raw));
                markers.set(id, entry);
            }
        }
    }
    return markers;
}

const isPanelFile = (file) => file.split(path.sep).join('/').includes(PANEL_PATH_FRAGMENT);

/**
 * O que o gate lê. `css`/`code`/`markers` são a LIB (fora das camadas excluídas e do painel);
 * `panelCss`/`panelCode` são o painel, que só conta para `PANEL_OWN_TOKENS`.
 */
export function collectSources(root) {
    const src = path.join(root, 'src');
    const read = (f) => fs.readFileSync(f, 'utf8');
    const cssFiles = walk(src, (f) => f.endsWith('.css') && !isExcluded(f));
    const codeFiles = walk(src, (f) => /\.tsx?$/.test(f) && !/\.d\.ts$/.test(f) && !isExcluded(f));
    const libCss = cssFiles.filter((f) => !isPanelFile(f)).map(read);
    const libCode = codeFiles.filter((f) => !isPanelFile(f)).map(read);
    const tests = walk(src, (f) => /\.(tsx?|mjs)$/.test(f) && isTestFile(f)).map(read);
    return {
        css: libCss.join('\n'),
        code: libCode.map(stripComments),
        panelCss: cssFiles.filter(isPanelFile).map(read).join('\n'),
        panelCode: codeFiles.filter(isPanelFile).map(read).map(stripComments),
        markers: collectMarkers([...libCode, ...libCss]),
        tests,
    };
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

/** O id do token é ACESSADO (`x.id`, `x?.id`, `{ id } = …`) no texto, não apenas citado em string. */
function codeReadsId(text, id) {
    return new RegExp(`(?:\\.|\\?\\.)${id}\\b`).test(text)
        || new RegExp(`\\{[^{}]*\\b${id}\\b[^{}]*\\}\\s*=\\s*[\\w.]+`).test(text);
}

/** O nome da variável termina ali: o caractere seguinte não continua o identificador (`--x` ≠ `--x-gap`). */
function codeHasVar(code, cssText, name) {
    const named = new RegExp(`${escapeRe(name)}(?![\\w-])`);
    const inVar = new RegExp(`var\\(${escapeRe(name)}(?![\\w-])`);
    return inVar.test(cssText) || code.some((text) => named.test(text));
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** O valor da opção como literal: entre aspas, ou como chave de objeto sem aspas (`zoom: {…}`). */
function valueLiteral(value) {
    const quoted = `['"\`]${escapeRe(value)}['"\`]`;
    const bareKey = IDENTIFIER.test(value) ? `|(?<![\\w.$-])${escapeRe(value)}\\s*:(?!:)` : '';
    return new RegExp(`${quoted}${bareKey}`);
}

/** Leitor declarado: `direto` cobre toda opção; `tabela` exige o literal da opção na tabela. */
const declaredReadsOption = (declared, value) =>
    Boolean(declared) && (declared.kind === 'direto' || declared.texts.some((text) => valueLiteral(value).test(text)));

function optionHasReader({ token, entry, css, code, declared, value }) {
    const attrName = `data-sx-${toKebabCase(token.id)}`;
    const quoted = `["']?${escapeRe(value)}["']?`;
    if (new RegExp(`\\[${attrName}\\s*(?:[~|^$*]?=)\\s*${quoted}\\s*\\]`).test(css)) return true;
    if (entry.classPrefix && new RegExp(`\\.${escapeRe(entry.classPrefix + value)}(?![\\w-])`).test(css)) return true;
    if (declaredReadsOption(declared, value)) return true;
    const literal = valueLiteral(value);
    return code.some((text) => codeReadsId(text, token.id) && literal.test(text));
}

/** Qualquer regra sobre o atributo do token (`[data-sx-<kebab>]`, com ou sem valor). */
const cssReadsAttribute = (css, id) => new RegExp(`\\[data-sx-${escapeRe(toKebabCase(id))}(?![\\w-])`).test(css);

/** Achados de opção (regra ii) de um token `select` de opções literais. */
function optionFindings({ token, entry, css, code, declared }) {
    return token.options
        .filter((value) => !ABSENCE_VALUES.has(value))
        .filter((value) => !optionHasReader({ token, entry, css, code, declared, value }))
        .map((value) => ({ kind: 'option', tokenId: token.id, value, detail: `data-sx-${toKebabCase(token.id)}="${value}"` }));
}

/** Achados de teste (regra iii): opção de token com leitor declarado sem teste que cite o id e o valor. */
function testFindings({ token, tests }) {
    return token.options
        .filter((value) => !ABSENCE_VALUES.has(value))
        .filter((value) => !tests.some((text) => text.includes(token.id) && valueLiteral(value).test(text)))
        .map((value) => ({ kind: 'test', tokenId: token.id, value, detail: `nenhum teste cita ${token.id} com "${value}"` }));
}

/** Declaração de leitor sobre token que não existe ou que não é `select` de opções literais. */
function markerFindings({ markers, schemas }) {
    return [...markers.keys()]
        .filter((id) => !schemas.has(id) || !schemas.get(id).options)
        .map((id) => ({ kind: 'marker', tokenId: id, detail: '@sarak-token-reader em token inexistente ou sem opções literais' }));
}

const FINDING_LABEL = { var: 'variável', option: 'opção', test: 'teste da opção', marker: 'declaração', panel: 'declaração do painel' };

/** Achados de leitura (regras i e ii) de UM token sobre as fontes dadas. */
function unreadFindings({ token, entry, css, code, declared }) {
    const bySelectOptions = token.type === 'select' && Boolean(token.options);
    const options = bySelectOptions ? optionFindings({ token, entry, css, code, declared }) : [];
    const candidates = [...new Set([...entry.vars, ...token.cssVars, `--sarak-${toKebabCase(token.id)}`])];
    const readByVar = candidates.some((name) => codeHasVar(code, css, name)) || code.some((text) => codeReadsId(text, token.id));
    const readByAttr = bySelectOptions ? options.length === 0 : cssReadsAttribute(css, token.id);
    const found = [...options];
    if (!readByVar && !readByAttr) found.push({ kind: 'var', tokenId: token.id, detail: candidates.join(', ') });
    return found;
}

/** Fontes de leitura de UM token: a lib, e o painel só quando o token é declarado em `PANEL_OWN_TOKENS`. */
function sourcesFor(id, sources, panelTokens) {
    if (!Object.hasOwn(panelTokens, id)) return { css: sources.css, code: sources.code };
    return { css: `${sources.css}\n${sources.panelCss}`, code: [...sources.code, ...sources.panelCode] };
}

/** Entrada de `PANEL_OWN_TOKENS` obsoleta: token inexistente, já lido pela lib, ou que nem o painel lê. */
function panelFindings({ panelTokens, schemas, manifest, sources }) {
    const findings = [];
    for (const id of Object.keys(panelTokens)) {
        const token = schemas.get(id);
        if (!token) {
            findings.push({ kind: 'panel', tokenId: id, detail: 'PANEL_OWN_TOKENS cita token que não existe no schema' });
            continue;
        }
        const entry = manifest[id] ?? { vars: [], attr: null, classPrefix: null };
        const declared = sources.markers.get(id);
        const lib = sourcesFor(id, sources, {});
        const withPanel = sourcesFor(id, sources, panelTokens);
        if (unreadFindings({ token, entry, declared, ...lib }).length === 0) {
            findings.push({ kind: 'panel', tokenId: id, detail: 'PANEL_OWN_TOKENS obsoleta: um componente da lib já lê o token — remova a entrada' });
        } else if (unreadFindings({ token, entry, declared, ...withPanel }).length > 0) {
            findings.push({ kind: 'panel', tokenId: id, detail: 'PANEL_OWN_TOKENS obsoleta: nem o painel lê o token — remova a entrada' });
        }
    }
    return findings;
}

/** Todo valor emitido sem leitor. Cada achado: `{ kind, tokenId, value?, detail }`. */
export function checkTokenReader({ root = ROOT, allowlist = ALLOWLIST, panelTokens = PANEL_OWN_TOKENS } = {}) {
    const manifest = parseManifest(fs.readFileSync(path.join(root, MANIFEST_FILE), 'utf8'));
    const schemas = loadSchemas(root);
    const sources = collectSources(root);
    const findings = [
        ...markerFindings({ markers: sources.markers, schemas }),
        ...panelFindings({ panelTokens, schemas, manifest, sources }),
    ];

    for (const [id, token] of schemas) {
        const entry = manifest[id] ?? { vars: [], attr: null, classPrefix: null };
        const declared = sources.markers.get(id);
        const { css, code } = sourcesFor(id, sources, panelTokens);
        findings.push(...unreadFindings({ token, entry, css, code, declared }));
        if (token.type === 'select' && token.options && declared) findings.push(...testFindings({ token, tests: sources.tests }));
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
            console.log(`  - ${FINDING_LABEL[f.kind]} ${f.tokenId}${f.value !== undefined ? ` = "${f.value}"` : ''}: ${f.detail}`);
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
