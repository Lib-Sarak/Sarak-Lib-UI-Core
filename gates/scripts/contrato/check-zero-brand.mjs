/**
 * Gate ZERO-MARCA (Spec 49 — L2).
 *
 * A lib NUNCA estampa a própria marca em texto que o usuário do consumidor lê. Este gate falha o build
 * se a palavra da marca aparecer em QUALQUER literal de texto de `src/` (JSX, atributo, catálogo de idiomas,
 * objeto exportado, constante, `document.title`), fora das isenções explícitas de `TECHNICAL_EXEMPTIONS`
 * (técnico e nome de tema embarcado), do diagnóstico de console e da ALLOWLIST (hoje vazia: os painéis do
 * Design Engine chegam ao importador e seguem a regra).
 *
 * Escaneia por AST (TypeScript compiler API), não por regex de arquivo inteiro, para
 * não acusar falso-positivo em comentário (ex.: notas de migração que DOCUMENTAM a
 * correção citando a string antiga) — só nós `StringLiteral`/`NoSubstitutionTemplateLiteral`/
 * `TemplateLiteral` (partes fixas) e `JsxText` contam.
 *
 * Origem: a Spec 47 fechou a identidade da PÁGINA mas os SINKS hardcoded (`SarakEmptyState`,
 * `SarakSearch`, `ChatHeader`, `SarakChat`, `SarakShell`) ficaram de fora — a Spec 49 fecha
 * os sinks e este gate impede o carimbo de voltar em silêncio.
 *
 * Uso: `node gates/scripts/contrato/check-zero-brand.mjs` (relatório) | `--check` (exit 1 se achar).
 *
 * -------------------------------------------------------------------------
 * LIMITE DECLARADO (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. ESCOPO: apenas `src/`. NÃO varre os outros artefatos que chegam ao
 *    consumidor — `sarak-ui/templates/` (o código que o `init` copia para o
 *    projeto dele), `bin/scaffold/generators/` (que gera esse código) e
 *    `docs/` (que viaja no tarball).
 * 2. Dentro de `src/`, todo literal de texto conta, em `.ts` e `.tsx`. Ficam de fora o tipo literal
 *    (`T['sarak']`), o argumento de `console.*` e `.d.ts`, `__tests__/`, `.test.` e `.spec.`
 *    (ver `isScannableFile`).
 *
 * EXPOSIÇÃO MEDIDA (plan-06, 2026-08-03): **ZERO violações reais**.
 * `sarak-ui/templates/` e `bin/` estão limpos. Os únicos acertos fora de `src/`
 * são 2 arquivos de `docs/` (`identidade-do-host.md`, `migracoes.md`), e neles a
 * marca aparece em PROSA que documenta a própria correção — exatamente o
 * falso-positivo que a varredura por AST existe para evitar dentro de `src/`.
 *
 * Por isso o limite é DECLARADO em vez de fechado: ampliar para markdown
 * exigiria distinguir prosa de texto renderizado, e o ganho medido hoje é zero.
 * O que muda a conta é template `.tsx` novo em `sarak-ui/templates/` — aí o
 * escopo passa a valer, e isso é trabalho da plan-12.
 * -------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'src');

/** A marca é procurada como trecho, sem limite de palavra: "SarakOS", "SARAKTWIN" e "Sarak_OS" também contam; todo literal de texto de `src/`. */
const BRAND_WORD_RE = /sarak/gi;

/**
 * Isenções explícitas — cada uma casa só o uso técnico real, sempre com diferença de maiúscula/minúscula
 * (a marca em texto de produto costuma vir em caixa de título ou alta):
 * - pacote (`@sarak/lib-ui-core`), prefixo de variável (`--sarak-`), de classe/atributo (`sarak-`), comando npm
 *   (`sarak:check`) e plugin (`sarak/…`), só em minúsculas, mais as duas utilitárias `transition-sarak` e `rounded-sarak`;
 * - etiqueta de diagnóstico, só nas formas exatas que existem (`DIAGNOSTIC_LABEL`);
 * - nome de componente, de função ou de constante com a marca, só quando é identificador que existe em `src/` (`identifiers`),
 *   e chave de armazenamento em minúsculas com prefixo (`TECHNICAL_KEY`);
 * - nome dos temas embarcados que levam o nome da lib, só nos arquivos do tema (`THEME_NAME_FILE`).
 */
const TECHNICAL_EXEMPTIONS = [
    /@sarak\/lib-ui-core/g,
    /--sarak-[\w-]*/g,
    /\bsarak-[\w-]+/g,
    /\bsarak[:/][\w-]*/g,
    /\b(?:transition|rounded)-sarak\b/g,
];
const DIAGNOSTIC_LABEL = /\[(?:Sarak(?::(?:Design|UI|Preferences|Link|Icon))?|sarak verify)\]/g;
/** Palavra contínua (identificador, chave) que contém a marca. */
const SARAK_WORD = /[\w$]*sarak[\w$]*/gi;
/** Chave de armazenamento em minúsculas com prefixo (`sarak_lang`, `__sarak_tree_root__`) e sentinela `__SARAK_X__`. */
const TECHNICAL_KEY = /^(?:_*sarak(?:_[a-z0-9]+)+_*|__SARAK_[A-Z0-9_]+__)$/;
const THEME_NAME = /\bSarak Sovereign(?: Classic)?\b/g;
/** Onde o nome do tema embarcado é dado do tema: os arquivos do tema e os gerados a partir deles. */
const THEME_NAME_FILE = /^core\/Design\/presets\/(?:themes\/[^/]+|components\/cardsThemes\.generated)\.ts$/;

/**
 * Arquivos fora da varredura. Vazia de propósito: o painel de customização e a vitrine do Design Engine
 * são exportados e chegam ao importador (o `dist/` carrega os textos deles), então a regra vale para eles.
 * Só entra aqui arquivo que NÃO entra no pacote, com o motivo escrito ao lado.
 */
const ALLOWLIST = new Set([]);

const isScannableFile = (file) =>
    /\.(?:tsx?|json)$/.test(file) &&
    !file.endsWith('.d.ts') &&
    !file.includes('.test.') &&
    !file.includes('.spec.') &&
    !file.split(path.sep).includes('__tests__') &&
    !/\.golden\.json$|\.validation\.json$/.test(file);

const walkFiles = (dir, out = []) => {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (entry === 'node_modules' || entry === '__tests__') continue;
            walkFiles(full, out);
        } else if (isScannableFile(full)) {
            out.push(full);
        }
    }
    return out;
};

/** Marca encontrada em `text`, depois de tirar o que a isenção explícita cobre. */
const literalsIn = (text, { identifiers, themeNameFile }) => {
    let rest = TECHNICAL_EXEMPTIONS.reduce((value, pattern) => value.replace(pattern, ''), text);
    rest = rest.replace(DIAGNOSTIC_LABEL, '');
    rest = rest.replace(SARAK_WORD, (word) => (identifiers.has(word) || TECHNICAL_KEY.test(word) ? '' : word));
    if (themeNameFile) rest = rest.replace(THEME_NAME, '');
    return [...rest.matchAll(BRAND_WORD_RE)].map(([match]) => match);
};

/** Diagnóstico de console: texto para quem desenvolve, nunca para o usuário final do consumidor. */
const isConsoleArgument = (node) => {
    for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isCallExpression(parent) && ts.isPropertyAccessExpression(parent.expression) && parent.expression.expression.getText() === 'console') return true;
        if (ts.isBlock(parent) || ts.isSourceFile(parent)) return false;
    }
    return false;
};

/** Tipo literal (`Pick<X, 'sarak'>`, `T['sarak']`) nomeia propriedade: não é texto que alguém lê. */
const isTypePosition = (node) => ts.isLiteralTypeNode(node.parent);

/** Caminho de módulo (`import … from './SarakButton'`, `import('./SarakX')`) é endereço de arquivo, não texto. */
const isModuleSpecifier = (node) =>
    ((ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent)) && node.parent.moduleSpecifier === node) ||
    (ts.isCallExpression(node.parent) && node.parent.expression.kind === ts.SyntaxKind.ImportKeyword) ||
    ts.isExternalModuleReference(node.parent);

const textOf = (node, source) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isJsxText(node)) return node.getText(source);
    if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return node.text;
    return null;
};

const parseSource = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true);

/** Todo identificador com a marca declarado ou usado em `src/` (`SarakButton`, `sarakLoadThemePreset`, `SARAK_CSS`): só esses nomes são isentos no texto. */
const collectIdentifiers = (sources) => {
    const identifiers = new Set();
    const visit = (node) => {
        if (ts.isIdentifier(node) && /sarak/i.test(node.text) && !/^sarak$/i.test(node.text)) identifiers.add(node.text);
        ts.forEachChild(node, visit);
    };
    sources.forEach((source) => visit(source));
    return identifiers;
};

/** Todo literal de texto do arquivo conta: o destino (JSX, catálogo, `document.title`) não muda o que o usuário lê. */
const scanSource = (source, context) => {
    const hits = [];
    const visit = (node) => {
        const text = textOf(node, source);
        if (text && !isTypePosition(node) && !isModuleSpecifier(node) && !isConsoleArgument(node)) {
            for (const literal of literalsIn(text, context)) {
                const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
                hits.push({ literal, line: line + 1 });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return hits;
};

/** Valor textual de um JSON (catálogo de descrições): toda string conta, a chave não. */
const scanJson = (file, context) => {
    const raw = fs.readFileSync(file, 'utf-8');
    const hits = [];
    const visit = (value) => {
        if (typeof value === 'string') {
            for (const literal of literalsIn(value, context)) {
                const index = raw.indexOf(JSON.stringify(value).slice(1, -1));
                hits.push({ literal, line: index < 0 ? 0 : raw.slice(0, index).split('\n').length });
            }
        } else if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    visit(JSON.parse(raw));
    return hits;
};

/** Executa a varredura completa. Retorna as violações + exclusões obsoletas. */
export const runZeroBrandCheck = ({ src = SRC, allowlist = ALLOWLIST } = {}) => {
    const files = walkFiles(src);
    const violations = [];
    const seenAllowlist = new Set();
    const sources = new Map(files.filter((file) => /\.tsx?$/.test(file)).map((file) => [file, parseSource(file)]));
    const identifiers = collectIdentifiers(sources.values());

    for (const file of files) {
        const rel = path.relative(src, file).split(path.sep).join('/');
        if (allowlist.has(rel)) {
            seenAllowlist.add(rel);
            continue;
        }
        const context = { identifiers, themeNameFile: THEME_NAME_FILE.test(rel) };
        const hits = sources.has(file) ? scanSource(sources.get(file), context) : scanJson(file, context);
        for (const hit of hits) {
            violations.push({ file: rel, line: hit.line, literal: hit.literal });
        }
    }

    const staleAllowlist = [...allowlist].filter((rel) => !seenAllowlist.has(rel));

    return { violations, staleAllowlist, scannedCount: files.length };
};

const main = () => {
    const isCheck = process.argv.includes('--check');
    const { violations, staleAllowlist, scannedCount } = runZeroBrandCheck();

    if (violations.length) {
        console.error(`\n[zero-brand:check] Marca da lib renderizada como TEXTO em componente consumidor-facing:`);
        for (const v of violations) console.error(`  - ${v.file}:${v.line} — "${v.literal}"`);
    }
    if (staleAllowlist.length) {
        console.error(`\n[zero-brand:check] Entradas da ALLOWLIST obsoletas (arquivo não existe mais): ${staleAllowlist.join(', ')}`);
    }

    const problems = violations.length + staleAllowlist.length;
    if (isCheck && problems > 0) {
        console.error(`\n[zero-brand:check] FALHOU — ${problems} problema(s).\n`);
        process.exit(1);
    }
    console.log(
        `[zero-brand:check] ${scannedCount} arquivo(s) varrido(s); ` +
            `${problems === 0 ? 'zero marca da lib fora da allowlist.' : `${problems} problema(s).`}`,
    );
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-zero-brand.mjs')) {
    main();
}
