/**
 * Gate de PARIDADE TOKEN DE CROMO × CONSUMIDOR (Spec 05 §2.4.1).
 *
 * O `SarakAppChrome` (modo ui-kit) e o `SarakShell` (modo módulos-plugin) pintam o
 * MESMO cromo com os MESMOS tokens de `src/core/Design/schema/navigation.ts` (mais
 * `isAutoHideEnabled`, de `schema/system.ts`, comportamento de cromo declarado fora
 * daquele arquivo). Um token oferecido no schema e no catálogo é contrato com o
 * usuário final (specs/specs/09-temas-e-presets.md §4.4.3): ou ele funciona nos
 * DOIS modos de consumo, ou sai do schema. Este gate cobra a metade que nenhum
 * outro auditor cobrava — não o VALOR do token, a EXISTÊNCIA do consumidor.
 *
 * Uso: `node gates/scripts/contrato/check-chrome-token-parity.mjs` — toda ausência
 * de consumidor, nos dois lados, é bloqueio.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. ESCOPO = o schema `navigation.ts` INTEIRO (lido em texto, ver `extractSchemaTokens`
 *    abaixo) + `isAutoHideEnabled` (`schema/system.ts`, sem `cssVars` — só o `id`
 *    conta). Não há mais lista fechada — todo token novo do schema já entra na
 *    varredura sem precisar editar este arquivo. `ORPHAN_TOKENS` é a dívida que
 *    SOBRA depois de ligar os tokens medidos aqui: cada um tem `arquivo:linha` de
 *    por que falta, e o gate os IGNORA de propósito — ampliar a lista de exceção
 *    é reabrir a mesma dívida, trabalho futuro e não deste gate.
 * 2. É TEXTUAL, não por AST: prova que o `id` do token (palavra inteira) OU uma das
 *    variáveis CSS que ele declara em `cssVars`/o auto-derivado `--sarak-<kebab>`
 *    aparece no arquivo. Não prova que o consumo está CORRETO nem que produz efeito
 *    visual — só que existe uma referência. A prova de efeito é o teste de
 *    componente e, para CSS renderizado, `cromo-css-real:check`.
 * 3. Escopo de arquivo: `src/core/Shell/**` (Shell) e `src/components/Layout/**`
 *    (AppChrome), cada um `+` os átomos compartilhados que o cromo daquele lado de
 *    fato usa para pintar o item de menu ou a busca — `SarakMenuItem.tsx` e
 *    `SarakSearch.tsx` contam para os DOIS lados (o mesmo átomo que os dois cromos
 *    compõem), e `SarakShellNav.tsx` conta só para o AppChrome (o Shell tem sua
 *    própria navegação). `__tests__/` é ignorado dos dois lados — um teste que
 *    referencia um token não é o cromo consumindo-o.
 * 4. Não distingue "consumo real" de "citado em comentário/JSDoc" — a mesma
 *    limitação de `auditor_ghostvars.mjs` (specs/specs/01-gates-e-baseline.md §4.3.c).
 *    Nenhum caso assim existe hoje nos dois grupos de arquivo (conferido na entrega).
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const NAVIGATION_SCHEMA = path.join(ROOT, 'src/core/Design/schema/navigation.ts');

const toKebabCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Lê `navigation.ts` como TEXTO e devolve `{ id, cssVars }` por token — sem
 * importar TS (os gates `.mjs` correm em Node puro). Separa os objetos do array
 * `tokens: [...]` por contagem de chaves (não por regex de linha inteira): um
 * token sem `cssVars` (ex. `sidebarShadow`) e um `constraints.options` aninhado
 * (ex. `sidebarPosition`) não confundem a extração.
 */
function extractSchemaTokens(schemaPath) {
    const src = fs.readFileSync(schemaPath, 'utf8');
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
        else if (body[i] === '}' && --objDepth === 0 && start >= 0) { objects.push(body.slice(start, i + 1)); start = -1; }
    }

    return objects.map((obj) => {
        const id = obj.match(/\bid:\s*'([^']+)'/)[1];
        const cssVarsBlock = obj.match(/cssVars:\s*\[([^\]]*)\]/);
        const cssVars = cssVarsBlock
            ? Array.from(cssVarsBlock[1].matchAll(/'(--[a-z0-9-]+)'/g)).map((m) => m[1])
            : [];
        return { id, cssVars };
    });
}

/** Todo o schema `navigation` + `isAutoHideEnabled` (`schema/system.ts`, sem `cssVars` própria). */
export function getChromeTokens({ root = ROOT } = {}) {
    return [
        ...extractSchemaTokens(path.join(root, 'src/core/Design/schema/navigation.ts')),
        { id: 'isAutoHideEnabled', cssVars: [] },
    ];
}

/**
 * Dívida MEDIDA e DECLARADA (limite 1 acima) — tokens fora do conjunto que o dono
 * decidiu ligar até agora. Cada um tem o motivo e o lado que falta; o gate os
 * ignora até uma entrega futura ligá-los. Vazia hoje: o schema `navigation`
 * inteiro tem consumidor nos dois lados.
 */
export const ORPHAN_TOKENS = [];

const SHARED_MENU_ITEM = 'src/components/atomic/Navigation/SarakMenuItem.tsx';
const SHARED_SEARCH = 'src/components/atomic/Inputs/SarakSearch.tsx';

const CONSUMER_GROUPS = {
    SarakShell: {
        dirs: ['src/core/Shell'],
        extraFiles: [SHARED_MENU_ITEM, SHARED_SEARCH],
    },
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
    console.log('--- check-chrome-token-parity (schema `navigation` inteiro) ---');
    const allTokens = getChromeTokens();
    const covered = allTokens.filter((t) => !ORPHAN_TOKENS.includes(t.id));
    const missing = checkChromeTokenParity({ tokens: covered });

    if (missing.length === 0) {
        console.log(`[OK] Os ${covered.length} tokens de cromo cobertos (de ${allTokens.length} no schema) têm consumidor no SarakShell E no SarakAppChrome.`);
        if (ORPHAN_TOKENS.length > 0) {
            console.log(`  Dívida declarada (R18, fora da cobertura): ${ORPHAN_TOKENS.join(', ')}.`);
        }
        return;
    }

    console.log(`[ERROR] ${missing.length} token(s) de cromo sem consumidor num dos dois modos:`);
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
