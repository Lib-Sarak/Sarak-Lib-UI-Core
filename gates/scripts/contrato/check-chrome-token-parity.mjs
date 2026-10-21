/**
 * Gate de PARIDADE TOKEN DE CROMO × CONSUMIDOR (Spec 05 §2.4.1).
 *
 * O `SarakAppChrome` consome os tokens de `src/core/Design/schema/navigation.ts`
 * e os tokens de sistema que governam o cromo. Um token oferecido no schema e no
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
 * 1. ESCOPO = o schema `navigation.ts` INTEIRO (lido em texto, ver `extractSchemaTokens`
 *    abaixo) + a seção de layout de `schema/system.ts`, até a seção de bordas. Ambos
 *    entram sem lista fechada: token novo no recorte entra sem editar este arquivo.
 *    `ORPHAN_TOKENS` declara somente a dívida já medida fora desta entrega; ampliar
 *    a exceção não é correção.
 * 2. É TEXTUAL, não por AST: prova que o `id` do token (palavra inteira) OU uma das
 *    variáveis CSS que ele declara em `cssVars`/o auto-derivado `--sarak-<kebab>`
 *    aparece no arquivo. Não prova que o consumo está CORRETO nem que produz efeito
 *    visual — só que existe uma referência. A prova de efeito é o teste de
 *    componente e, para CSS renderizado, `cromo-css-real:check`.
 * 3. Escopo de arquivo: `src/components/Layout/**` mais os átomos usados pelo
 *    cromo para pintar navegação ou busca — `SarakMenuItem.tsx`, `SarakSearch.tsx`
 *    e `SarakShellNav.tsx`. CSS global, inclusive `src/styles/_base.css`, não
 *    conta: mapear uma variável não é consumo do cromo. `__tests__/` é ignorado —
 *    um teste que referencia um token não é o cromo consumindo-o.
 * 4. Não distingue "consumo real" de "citado em comentário/JSDoc" — a mesma
 *    limitação de `auditor_ghostvars.mjs` (specs/specs/01-gates-e-baseline.md §4.3.c).
 *    Nenhum caso assim existe hoje no conjunto de arquivos do cromo.
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const toKebabCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Lê `navigation.ts` como TEXTO e devolve `{ id, cssVars }` por token — sem
 * importar TS (os gates `.mjs` correm em Node puro). Separa os objetos do array
 * `tokens: [...]` por contagem de chaves (não por regex de linha inteira): um
 * token sem `cssVars` (ex. `sidebarShadow`) e um `constraints.options` aninhado
 * (ex. `sidebarPosition`) não confundem a extração.
 */
function extractSchemaTokens(schemaPath, sectionEndMarker) {
    const src = fs.readFileSync(schemaPath, 'utf8');
    const sectionEnd = sectionEndMarker ? src.indexOf(sectionEndMarker) : -1;
    const arrayStart = src.indexOf('[', src.indexOf('tokens:'));
    let depth = 0;
    let arrayEnd = arrayStart;
    for (let i = arrayStart; i < src.length; i++) {
        if (src[i] === '[') depth++;
        else if (src[i] === ']' && --depth === 0) { arrayEnd = i; break; }
    }
    const body = src.slice(arrayStart + 1, arrayEnd);

    const objects = [];
    let objDepth = 0;
    let start = -1;
    for (let i = 0; i < body.length; i++) {
        if (body[i] === '{') { if (objDepth === 0) start = i; objDepth++; }
        else if (body[i] === '}' && --objDepth === 0 && start >= 0) {
            objects.push({ source: body.slice(start, i + 1), offset: arrayStart + 1 + start });
            start = -1;
        }
    }

    return objects
        .filter(({ offset }) => sectionEnd < 0 || offset < sectionEnd)
        .map(({ source: obj }) => {
        const id = obj.match(/\bid:\s*'([^']+)'/)[1];
        const cssVarsBlock = obj.match(/cssVars:\s*\[([^\]]*)\]/);
        const cssVars = cssVarsBlock
            ? Array.from(cssVarsBlock[1].matchAll(/'(--[a-z0-9-]+)'/g)).map((m) => m[1])
            : [];
        return { id, cssVars };
        });
}

/** Todo o schema `navigation` + a seção de layout do schema de sistema. */
export function getChromeTokens({ root = ROOT } = {}) {
    const systemTokens = extractSchemaTokens(path.join(root, 'src/core/Design/schema/system.ts'), '// --- ARQUITETURA DE BORDAS ---');
    return [
        ...extractSchemaTokens(path.join(root, 'src/core/Design/schema/navigation.ts')),
        ...systemTokens,
    ];
}

export const ORPHAN_TOKENS = [];

const SHARED_MENU_ITEM = 'src/components/atomic/Navigation/SarakMenuItem.tsx';
const SHARED_SEARCH = 'src/components/atomic/Inputs/SarakSearch.tsx';

export const CONSUMER_GROUPS = {
    SarakAppChrome: {
        dirs: ['src/components/Layout'],
        extraFiles: [SHARED_MENU_ITEM, SHARED_SEARCH, 'src/components/atomic/Navigation/SarakShellNav.tsx'],
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

/** O token tem consumidor no conteúdo: o `id` (palavra inteira) ou alguma `cssVar`/o auto-derivado. */
export function tokenHasConsumer(token, content) {
    const idRe = new RegExp(`\\b${token.id}\\b`);
    if (idRe.test(content)) return true;
    const autoVar = `--sarak-${toKebabCase(token.id)}`;
    const candidates = [autoVar, ...token.cssVars];
    return candidates.some((cssVar) => content.includes(cssVar));
}

/** Para cada token, quais grupos consumidores NÃO o referenciam. */
export function checkChromeTokenParity({ root = ROOT, tokens = getChromeTokens({ root }), groups = CONSUMER_GROUPS } = {}) {
    const groupContent = Object.fromEntries(
        Object.entries(groups).map(([name, group]) => [name, readGroupContent(group, root)]),
    );
    const missing = [];
    for (const token of tokens) {
        const semConsumidor = Object.keys(groups).filter((name) => !tokenHasConsumer(token, groupContent[name]));
        if (semConsumidor.length > 0) {
            missing.push({ id: token.id, semConsumidor });
        }
    }
    return missing;
}

function main() {
    console.log('--- check-chrome-token-parity (schema `navigation` + sistema de cromo) ---');
    const allTokens = getChromeTokens();
    const covered = allTokens.filter((t) => !ORPHAN_TOKENS.includes(t.id));
    const missing = checkChromeTokenParity({ tokens: covered });

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
