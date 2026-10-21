/**
 * Gate de NOMES PÚBLICOS no que o consumidor recebe (R23, alcance estendido).
 *
 * `dev-kit:check` confere os ponteiros da documentação do MANTENEDOR; nada conferia que
 * o que o CONSUMIDOR lê cita nomes que o barril de fato exporta. Quando 114 nomes
 * ganharam prefixo, quinze arquivos — o `README.md`, o guia e os templates do kit, a
 * skill de integração, documentos de `docs/` e o próprio gerador do `init` — seguiram
 * ensinando os nomes antigos: um projeto gerado não compilava, e o teste do gerador
 * conferia o nome velho. Este gate fecha essa classe: o que o consumidor lê não ensina
 * nome que o barril não tem.
 *
 * O que é lido: `README.md`, `docs/*.md` (menos todo arquivo chamado `migracoes.md` — o
 * de `docs/` e qualquer cópia que viaje no kit, como `sarak-ui/docs/migracoes.md` —, que
 * cita nome velho de propósito), tudo de `sarak-ui/` em `.md`/`.ts`/`.tsx` (guia, skill, templates) e o
 * `main.tsx` + o módulo de exemplo que o `sarak-ui init` gera.
 *
 * Duas formas de citação são cobradas:
 *  1. `import { A, type B } from '@sarak/lib-ui-core'` — todo nome importado existe no
 *     barril. É a forma que quebra a compilação, então vale para qualquer nome.
 *  2. Nome em crase tratado como público — só quando ele (a) tem o formato de nome
 *     público da base (`Sarak*`, `sarak*`, `useSarak*`, `SARAK_*`) E não existe em
 *     lugar nenhum de `src/` (nome fantasma: removido ou inventado), ou (b) é o NOME
 *     ANTIGO de uma renomeação registrada em `docs/migracoes.md` cujo nome novo está no
 *     barril. Quem cita `registerLocalComponent` em crase ensina o nome velho.
 *
 * Uso: `node gates/scripts/contrato/check-kit-names.mjs` — lê `dist/index.d.ts`, então
 * roda DEPOIS de `build:js` (mesmo ponto do `prefix:check`).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. PROSA SEM CRASE não é lida. "use o registerLocalComponent" escapa; só o que está
 *    entre crases ou dentro de `import { … } from '@sarak/lib-ui-core'` é conferido.
 * 2. Nome em crase que não tem formato público nem é nome antigo registrado em
 *    `docs/migracoes.md` não é cobrado: `className`, `design` ou um componente interno
 *    sem prefixo passam. Uma renomeação que ninguém registrou lá é invisível para a
 *    forma 2 (a forma 1 continua pegando o import dela). E nome com formato público
 *    que EXISTE em `src/` mas não está no barril (componente interno que a prosa
 *    descreve, como o de cartões da tabela) também passa — só o nome que não existe em
 *    lugar nenhum é acusado; "citado mas não importável" não é visto.
 * 2b. Nome de uma letra só (`X`) num `import` é lido como placeholder de exemplo e
 *    ignorado.
 * 3. Só o `import` do pacote raiz `@sarak/lib-ui-core` é lido. Subcaminhos
 *    (`@sarak/lib-ui-core/dist/…`) são arquivo, não nome, e não são conferidos.
 * 4. É TEXTUAL: um nome citado em crase como EXEMPLO de nome errado ("não use
 *    `registerLocalComponent`") é acusado igual a um uso — não há como distinguir
 *    ensinar de proibir sem ler a frase. O consumidor que quiser citar o nome velho
 *    tem `docs/migracoes.md`, que fica fora de propósito.
 * 5. Confere EXISTÊNCIA no barril, não assinatura: uma prop renomeada, um argumento
 *    novo ou um tipo alterado passam. É o `tsc` do consumidor que pega isso.
 * 6. Lê `dist/index.d.ts` (último `export { … };` agrupado, via `parsePublicExportNames`).
 *    `dist/` velho mede o passado, e bundler que passe a emitir outro formato quebra a
 *    extração — o gate então reprova com o erro de formato, nunca passa em silêncio.
 * -------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAppTsx } from '../../../bin/scaffold/generators/appTsx.mjs';
import { buildMainTsx } from '../../../bin/scaffold/generators/mainTsx.mjs';
import { parsePublicExportNames } from './check-public-prefix.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const MIGRATIONS_FILE_NAME = 'migracoes.md';
const MIGRATIONS_DOC = `docs/${MIGRATIONS_FILE_NAME}`;
const KIT_TEXT_EXTENSIONS = new Set(['.md', '.ts', '.tsx']);

const IMPORT_RE = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@sarak\/lib-ui-core['"]/g;
const CODE_SPAN_RE = /`([^`\n]+)`/g;
const LEADING_IDENTIFIER_RE = /^<?([A-Za-z_$][\w$]*)(?:\(|\s*\/?>|$)/;
const PUBLIC_SHAPE_SOURCE = '(?:Sarak[A-Z]\\w*|sarak[A-Z]\\w*|useSarak[A-Z]\\w*|SARAK_[A-Z0-9_]+)';
const PUBLIC_SHAPE_RE = new RegExp(`^${PUBLIC_SHAPE_SOURCE}$`);
const SOURCE_TOKEN_RE = new RegExp(`\\b${PUBLIC_SHAPE_SOURCE}\\b`, 'g');
const PLACEHOLDER_RE = /^[A-Z]$/;
const RENAME_ROW_RE = /^\|\s*`([A-Za-z_$][\w$]*)`\s*\|\s*`([A-Za-z_$][\w$]*)`\s*\|\s*$/;

function lineOf(text, index) {
    return text.slice(0, index).split('\n').length;
}

function readText(file) {
    return fs.readFileSync(file, 'utf8');
}

function walkFiles(dir, extensions, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkFiles(full, extensions, out);
        else if (extensions.has(path.extname(entry.name))) out.push(full);
    }
    return out;
}

function toRel(root, file) {
    return path.relative(root, file).split(path.sep).join('/');
}

/** Os textos que o consumidor recebe, como `{ file, text }` — `file` é o rótulo do relatório. */
export function collectKitSources({ root = ROOT } = {}) {
    const files = [path.join(root, 'README.md')];
    const docsDir = path.join(root, 'docs');
    if (fs.existsSync(docsDir)) {
        for (const name of fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).sort()) {
            files.push(path.join(docsDir, name));
        }
    }
    files.push(...walkFiles(path.join(root, 'sarak-ui'), KIT_TEXT_EXTENSIONS));

    return files
        .filter((file) => fs.existsSync(file))
        .map((file) => ({ file: toRel(root, file), text: readText(file) }))
        .filter(({ file }) => path.posix.basename(file) !== MIGRATIONS_FILE_NAME);
}

/** O que o `sarak-ui init` escreve no projeto do consumidor e importa da lib. */
export function collectGeneratedSources() {
    return [
        { file: 'init → src/main.tsx (modo app)', text: buildMainTsx({ answers: { mode: 'app' } }) },
        { file: 'init → src/main.tsx (modo embarcado)', text: buildMainTsx({ answers: { mode: 'embedded' } }) },
        { file: 'init → src/App.tsx', text: buildAppTsx() },
    ];
}

/** Nomes antigos de renomeações registradas em `docs/migracoes.md` cujo nome novo está no barril. */
export function collectRenamedOldNames({ root = ROOT, exported }) {
    const doc = path.join(root, MIGRATIONS_DOC);
    if (!fs.existsSync(doc)) return new Set();
    const oldNames = new Set();
    for (const line of readText(doc).split('\n')) {
        const row = RENAME_ROW_RE.exec(line.trim());
        if (row && exported.has(row[2]) && !exported.has(row[1])) oldNames.add(row[1]);
    }
    return oldNames;
}

/** Todo nome de formato público que aparece em algum arquivo de `src/` — existir aqui é "não é fantasma". */
export function collectSourceNames({ root = ROOT } = {}) {
    const names = new Set();
    const srcFiles = walkFiles(path.join(root, 'src'), new Set(['.ts', '.tsx']));
    for (const file of srcFiles) {
        for (const match of readText(file).matchAll(SOURCE_TOKEN_RE)) names.add(match[0]);
    }
    return names;
}

function citedImports(text) {
    const cited = [];
    for (const match of text.matchAll(IMPORT_RE)) {
        const names = match[1]
            .split(',')
            .map((entry) => entry.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
            .filter((name) => name && !PLACEHOLDER_RE.test(name));
        const baseLine = lineOf(text, match.index);
        names.forEach((name) => cited.push({ name, line: baseLine, via: 'import' }));
    }
    return cited;
}

function citedCodeSpans(text, { oldNames, sourceNames }) {
    const cited = [];
    for (const match of text.matchAll(CODE_SPAN_RE)) {
        const name = LEADING_IDENTIFIER_RE.exec(match[1])?.[1];
        if (!name) continue;
        const ghostOfPublicShape = PUBLIC_SHAPE_RE.test(name) && !sourceNames.has(name);
        if (ghostOfPublicShape || oldNames.has(name)) {
            cited.push({ name, line: lineOf(text, match.index), via: 'crase' });
        }
    }
    return cited;
}

/**
 * @param {{root?: string, barrelTypes?: string, generated?: Array<{file: string, text: string}>}} opcoes
 *   `barrelTypes`: o TEXTO do `index.d.ts` do barril (padrão: `dist/index.d.ts` sob `root`).
 *   `generated`: textos gerados pelo `init` (padrão: os do gerador real).
 * @returns {{violations: Array<{file: string, line: number, name: string, via: string}>, error: string|null}}
 */
export function checkKitNames({ root = ROOT, barrelTypes, generated = collectGeneratedSources() } = {}) {
    const dts = barrelTypes ?? readBarrelTypes(root);
    if (dts === null) {
        return { violations: [], error: 'dist/index.d.ts não existe — rode `npm run build` antes.' };
    }
    const parsed = parsePublicExportNames(dts);
    if (parsed.error) return { violations: [], error: parsed.error };

    const exported = new Set(parsed.names);
    const spans = { oldNames: collectRenamedOldNames({ root, exported }), sourceNames: collectSourceNames({ root }) };
    const violations = [];
    for (const { file, text } of [...collectKitSources({ root }), ...generated]) {
        for (const cited of [...citedImports(text), ...citedCodeSpans(text, spans)]) {
            if (!exported.has(cited.name)) violations.push({ file, ...cited });
        }
    }
    return { violations, error: null };
}

function readBarrelTypes(root) {
    const dts = path.join(root, 'dist', 'index.d.ts');
    return fs.existsSync(dts) ? readText(dts) : null;
}

function main() {
    console.log('--- check-kit-names (R23: o kit cita só nomes que o barril exporta) ---');
    const { violations, error } = checkKitNames();

    if (error) {
        console.error(`[ERROR] ${error}`);
        process.exit(1);
    }
    if (violations.length > 0) {
        console.error(`[ERROR] ${violations.length} nome(s) citado(s) ao consumidor que o barril não exporta:`);
        violations.forEach(({ file, line, name, via }) => console.error(`  - ${file}:${line} ${name} (${via})`));
        console.error('\n   Conserto: troque pelo nome que `dist/index.d.ts` exporta (renomeações em docs/migracoes.md).');
        process.exit(1);
    }
    console.log('[OK] Todo nome público citado pelo que o consumidor recebe existe no barril.');
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
