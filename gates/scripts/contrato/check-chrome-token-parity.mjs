/**
 * Gate de PARIDADE TOKEN DE CROMO × CONSUMIDOR (Spec 05 §2.4.1).
 *
 * O `SarakAppChrome` consome os tokens de `src/core/Design/schema/navigation.ts`,
 * os tokens de layout de `system.ts`, os de posição de `preferences.ts` e os de navegação de qualquer schema.
 * Um token oferecido no schema e no
 * catálogo é contrato com o usuário final (specs/specs/09-temas-e-presets.md
 * §4.4.3): ou funciona no cromo, ou sai do schema. Este gate cobra a EXISTÊNCIA
 * do consumidor; outros auditores não cobrem essa relação.
 *
 * Uso: `node gates/scripts/contrato/check-chrome-token-parity.mjs` — toda ausência
 * de consumidor no SarakAppChrome é bloqueio.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. ESCOPO = o schema `navigation.ts` INTEIRO (avaliado, não lido como texto: o token montado por fábrica e o
 *    de `barPersonality.ts` entram) + a seção de layout de `schema/system.ts` até o marcador de bordas (também
 *    avaliada; o corte é no primeiro token escrito depois do marcador) + os tokens de posição de
 *    `schema/preferences.ts` + todo token cujo id contém `navigation` nos demais `schema/*.ts`. Os demais grupos
 *    de schema descrevem superfícies que não são o cromo. Ficam fora de `preferences.ts`, com o motivo em
 *    `NOT_CHROME_TOKENS`, os dois passos de tamanho de fonte: quem os lê é `overlayPreferences.ts`, do Provider.
 *    Esses recortes entram sem lista fechada de ids. `ORPHAN_TOKENS` declara somente a dívida já medida.
 * 2. É TEXTUAL, não por AST: prova que o `id` do token (palavra inteira), uma das variáveis CSS que ele declara em
 *    `cssVars`/o auto-derivado `--sarak-<kebab>`, `MAPA.chave` da chave que guarda o id dele num mapa de ids
 *    exportado pelo schema (`CHROME_WIDGET_POSITION_TOKEN_IDS.search`), ou a chamada de um leitor genérico
 *    DECLARADO em `GENERIC_READERS` (`splitChromeWidgetsByPlacement(`) aparece no arquivo. Citar o nome do mapa não
 *    aprova os outros ids dele. Não prova que o consumo está CORRETO nem que produz efeito
 *    visual — só que existe uma referência. A prova de efeito é o teste de
 *    componente e, para CSS renderizado, `cromo-css-real:check`.
 * 3. Escopo de arquivo: `src/components/Layout/**` mais os átomos usados pelo
 *    cromo para pintar navegação ou busca — `SarakMenuItem.tsx`, `SarakSearch.tsx`,
 *    `SarakShellNav.tsx` e `SarakShellUserWidget.tsx` (que lê `userAvatarStyle`). CSS global, inclusive `src/styles/_base.css`, não
 *    conta: mapear uma variável não é consumo do cromo. `__tests__/` é ignorado —
 *    um teste que referencia um token não é o cromo consumindo-o.
 * 4. Não distingue "consumo real" de "citado em comentário/JSDoc" — a mesma
 *    limitação de `auditor_ghostvars.mjs` (specs/specs/01-gates-e-baseline.md §4.3.c).
 *    Nenhum caso assim existe hoje no conjunto de arquivos do cromo.
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const toKebabCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Avalia um arquivo de schema `.ts` e devolve os `tokens` do primeiro export que os tem. A avaliação (e não a
 * leitura do texto) é o que enxerga o token montado por fábrica (`createChromeSelectToken(...)`) e o espalhado de
 * outro arquivo (`...BarPersonalitySchema.tokens`). Só segue import relativo; o resto do que o schema importa é tipo.
 * Cada token leva os símbolos exportados do arquivo que guardam o id dele (`symbols`): o mapa de ids com a chave
 * (`{ name, key }`) e a constante de id (`{ name }`), que é por onde o cromo lê o que não cita o id.
 */
function evaluateSchemaTokens(schemaPath, cache = new Map()) {
    const load = (file) => {
        if (cache.has(file)) return cache.get(file).exports;
        const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        }).outputText;
        const module = { exports: {} };
        cache.set(file, module);
        const nodeRequire = createRequire(file);
        const localRequire = (specifier) => {
            if (!specifier.startsWith('.')) return nodeRequire(specifier);
            const base = path.resolve(path.dirname(file), specifier);
            return load([`${base}.ts`, path.join(base, 'index.ts')].find((candidate) => fs.existsSync(candidate)));
        };
        new Function('exports', 'require', 'module', code)(module.exports, localRequire, module);
        return module.exports;
    };
    const exported = load(schemaPath);
    const schema = Object.values(exported).find((value) => Array.isArray(value?.tokens));
    const isIdMap = (value) => value && typeof value === 'object' && !Array.isArray(value)
        && Object.values(value).length > 0 && Object.values(value).every((entry) => typeof entry === 'string');
    const symbolsOf = (id) => Object.entries(exported).flatMap(([name, value]) => {
        if (value === id) return [{ name }];
        if (!isIdMap(value)) return [];
        return Object.entries(value).filter(([, entry]) => entry === id).map(([key]) => ({ name, key }));
    });
    return (schema?.tokens ?? []).map(({ id, cssVars }) => ({ id, cssVars: cssVars ?? [], symbols: symbolsOf(id) }));
}

/** Tokens de `preferences.ts` que NÃO são do cromo, cada um com o motivo. */
export const NOT_CHROME_TOKENS = {
    preferenceFontSizeReduction: 'lido por overlayPreferences.ts, do Provider: é o passo do tamanho de fonte, não da barra',
    preferenceFontSizeIncrease: 'lido por overlayPreferences.ts, do Provider: é o passo do tamanho de fonte, não da barra',
};

/**
 * Tokens de cromo: o `navigation.ts` inteiro (o que nasce de fábrica e o de `barPersonality.ts` incluídos), a seção
 * de layout de `system.ts` até o marcador de bordas (avaliada como os outros; o marcador é um comentário, então o
 * corte é no primeiro token que vem depois dele), os tokens de posição de `preferences.ts` (menos `NOT_CHROME_TOKENS`)
 * e todo token cujo id contém `navigation` em qualquer outro `schema/*.ts` (como `mobileNavigationStyle`, em `global.ts`).
 */
export function getChromeTokens({ root = ROOT } = {}) {
    const schemaDir = path.join(root, 'src/core/Design/schema');
    const schemaFiles = fs.readdirSync(schemaDir)
        .filter((file) => file.endsWith('.ts'))
        .sort();
    const navigationTokens = evaluateSchemaTokens(path.join(schemaDir, 'navigation.ts'));
    const systemTokens = layoutSectionOf(path.join(schemaDir, 'system.ts'), '// --- ARQUITETURA DE BORDAS ---');
    const preferenceTokens = fs.existsSync(path.join(schemaDir, 'preferences.ts'))
        ? evaluateSchemaTokens(path.join(schemaDir, 'preferences.ts')).filter((token) => !(token.id in NOT_CHROME_TOKENS))
        : [];
    const otherNavigationTokens = schemaFiles
        .filter((file) => !['navigation.ts', 'system.ts', 'preferences.ts'].includes(file))
        .flatMap((file) => evaluateSchemaTokens(path.join(schemaDir, file)))
        .filter((token) => /navigation/i.test(token.id));
    return [
        ...navigationTokens,
        ...systemTokens,
        ...preferenceTokens,
        ...otherNavigationTokens,
    ];
}

/** A seção de layout: os tokens avaliados que vêm antes do primeiro `id` escrito depois do marcador. */
function layoutSectionOf(schemaPath, sectionEndMarker) {
    const tokens = evaluateSchemaTokens(schemaPath);
    const source = fs.readFileSync(schemaPath, 'utf8');
    const markerAt = source.indexOf(sectionEndMarker);
    const firstAfter = markerAt < 0 ? null : source.slice(markerAt).match(/\bid:\s*'([^']+)'/)?.[1];
    const cut = firstAfter ? tokens.findIndex((token) => token.id === firstAfter) : -1;
    return cut < 0 ? tokens : tokens.slice(0, cut);
}

export const ORPHAN_TOKENS = [];

const SHARED_MENU_ITEM = 'src/components/atomic/Navigation/SarakMenuItem.tsx';
const SHARED_SEARCH = 'src/components/atomic/Inputs/SarakSearch.tsx';

export const CONSUMER_GROUPS = {
    SarakAppChrome: {
        dirs: ['src/components/Layout'],
        extraFiles: [
            SHARED_MENU_ITEM,
            SHARED_SEARCH,
            'src/components/atomic/Navigation/SarakShellNav.tsx',
            'src/components/atomic/Navigation/SarakShellUserWidget.tsx',
        ],
    },
};

function walkTsFiles(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '__tests__') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkTsFiles(full, out);
        } else if (/\.tsx?$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

/** Concatena o conteúdo de todos os arquivos de um grupo consumidor (raiz(es) + extras). */
function readGroupContent(group, root) {
    const files = group.dirs.flatMap((dir) => walkTsFiles(path.join(root, dir)));
    for (const extra of group.extraFiles) {
        const full = path.join(root, extra);
        if (fs.existsSync(full)) files.push(full);
    }
    return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

/**
 * Leitores genéricos DECLARADOS: função que lê todo token que um símbolo exportado do schema (mapa de ids ou
 * constante de id) guarda, sem citar nenhum id. O cromo que a CHAMA lê esses tokens. Declarar é obrigatório: citar o
 * nome do mapa não prova nada além do que a chave citada (`MAPA.chave`) — por isso um id novo no mapa continua
 * reprovado até alguém ler a chave dele ou chamar um leitor daqui. `staleReaders` acusa declaração sem função.
 */
export const GENERIC_READERS = [
    { name: 'splitChromeWidgetsByPlacement', reads: 'CHROME_WIDGET_POSITION_TOKEN_IDS' },
    { name: 'getNavCollapsePositionTopbar', reads: 'NAV_COLLAPSE_TOPBAR_POSITION_TOKEN_ID' },
];

/** Leitor declarado cuja função não existe mais em `src/`. */
export function staleReaders({ root = ROOT, readers = GENERIC_READERS } = {}) {
    const all = walkTsFiles(path.join(root, 'src')).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
    return readers.filter(({ name }) => !new RegExp(`export (?:const|function) ${name}\\b`).test(all));
}

/** O token tem consumidor no conteúdo: o `id`, uma `cssVar`/o auto-derivado, `MAPA.chave` da chave dele ou um leitor declarado chamado. */
export function tokenHasConsumer(token, content, readers = GENERIC_READERS) {
    const idRe = new RegExp(`\\b${token.id}\\b`);
    if (idRe.test(content)) return true;
    const autoVar = `--sarak-${toKebabCase(token.id)}`;
    const candidates = [autoVar, ...token.cssVars];
    if (candidates.some((cssVar) => content.includes(cssVar))) return true;
    const symbols = token.symbols ?? [];
    const readsKey = symbols.some(({ name, key }) => key !== undefined
        && new RegExp(`\\b${name}(?:\\.${key}\\b|\\[\\s*['"]${key}['"]\\s*\\])`).test(content));
    if (readsKey) return true;
    return readers.some(({ name, reads }) => symbols.some((symbol) => symbol.name === reads)
        && new RegExp(`\\b${name}\\(`).test(content));
}

/** Para cada token, quais grupos consumidores NÃO o referenciam. */
export function checkChromeTokenParity({ root = ROOT, tokens = getChromeTokens({ root }), groups = CONSUMER_GROUPS, readers = GENERIC_READERS } = {}) {
    const groupContent = Object.fromEntries(
        Object.entries(groups).map(([name, group]) => [name, readGroupContent(group, root)]),
    );
    const missing = [];
    for (const token of tokens) {
        const semConsumidor = Object.keys(groups).filter((name) => !tokenHasConsumer(token, groupContent[name], readers));
        if (semConsumidor.length > 0) {
            missing.push({ id: token.id, semConsumidor });
        }
    }
    return missing;
}

function main() {
    console.log('--- check-chrome-token-parity (tokens de cromo nos schemas) ---');
    const allTokens = getChromeTokens();
    const covered = allTokens.filter((t) => !ORPHAN_TOKENS.includes(t.id));
    const missing = checkChromeTokenParity({ tokens: covered });
    const stale = staleReaders();

    if (stale.length > 0) {
        console.log(`[ERROR] Leitor genérico declarado sem função em src/: ${stale.map(({ name }) => name).join(', ')}.`);
        process.exit(1);
    }

    if (missing.length === 0) {
        console.log(`[OK] Os ${covered.length} tokens cobertos (de ${allTokens.length} nos schemas) têm consumidor no SarakAppChrome.`);
        if (ORPHAN_TOKENS.length > 0) {
            console.log(`  Dívida declarada (R18, fora da cobertura): ${ORPHAN_TOKENS.join(', ')}.`);
        }
        return;
    }

    console.log(`[ERROR] ${missing.length} token(s) de cromo sem consumidor:`);
    for (const { id, semConsumidor } of missing) {
        console.log(`  - ${id}: falta em ${semConsumidor.join(' e ')}`);
    }
    console.log('  Regra: specs/specs/09-temas-e-presets.md §4.4.3 — valor oferecido no schema é contrato com o usuário final.');
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
