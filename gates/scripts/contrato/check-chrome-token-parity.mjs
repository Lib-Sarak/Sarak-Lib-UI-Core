/**
 * Gate de PARIDADE TOKEN DE CROMO × CONSUMIDOR (plan-66).
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
 * 1. ESCOPO FECHADO em `CHROME_TOKENS` — os 12 tokens que a plan-66 fechou
 *    (specs/plan/plan-66 §2), não todo o schema `navigation`. Medido: o Shell tem
 *    tokens ORFÃOS pré-existentes fora desta lista (`sidebarBlur`, `sidebarShadow`,
 *    `navActiveMarkerColor`/`Glow`, `searchDropdownGap`/`Width`,
 *    `topbarNoiseOpacity`, `sidebarNoiseOpacity`, `topbarTitleColor`) — nenhum tem
 *    consumidor nem em `src/core/Shell/`, dívida anterior a esta plan e fora do seu
 *    escopo (§3.2: `src/core/Shell/` não se toca). Ampliar a lista É reabrir essa
 *    dívida; é trabalho futuro, não desta plan.
 * 2. É TEXTUAL, não por AST: prova que o `id` do token (palavra inteira) OU uma das
 *    variáveis CSS que ele declara em `cssVars`/o auto-derivado `--sarak-<kebab>`
 *    aparece no arquivo. Não prova que o consumo está CORRETO nem que produz efeito
 *    visual — só que existe uma referência. A prova de efeito é o teste de
 *    componente (plan-66 §5 item 8) e, para CSS renderizado, `cromo-css-real:check`.
 * 3. Escopo de arquivo: `src/core/Shell/**` (Shell) e `src/components/Layout/**`
 *    (AppChrome), cada um `+` os áltomos compartilhados que o cromo daquele lado
 *    de fato usa para pintar o item de menu — `SarakMenuItem.tsx` conta para os
 *    DOIS lados (é o mesmo átomo que os dois cromos compõem), e `SarakShellNav.tsx`
 *    conta só para o AppChrome (o Shell tem sua própria navegação). `__tests__/` é
 *    ignorado dos dois lados — um teste que referencia um token não é o cromo
 *    consumindo-o.
 * 4. Não distingue "consumo real" de "citado em comentário/JSDoc" — a mesma
 *    limitação de `auditor_ghostvars.mjs` (specs/specs/01-gates-e-baseline.md §4.3.c).
 *    Nenhum caso assim existe hoje nos dois grupos de arquivo (conferido na entrega).
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const toKebabCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** Os 12 tokens que a plan-66 fechou — ver o limite 1 acima. */
export const CHROME_TOKENS = [
    { id: 'sidebarPosition', cssVars: [] },
    { id: 'navbarLayout', cssVars: [] },
    { id: 'contentAlignment', cssVars: [] },
    { id: 'isNavHidden', cssVars: ['--is-nav-hidden'] },
    { id: 'isAutoHideEnabled', cssVars: [] },
    { id: 'searchPositionSidebar', cssVars: [] },
    { id: 'searchPositionTopbar', cssVars: [] },
    { id: 'tabGap', cssVars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap'] },
    { id: 'tabSectionMargin', cssVars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding'] },
    { id: 'sidebarActiveColor', cssVars: ['--sarak-sidebar-active-color'] },
    { id: 'sidebarHoverColor', cssVars: ['--sarak-sidebar-hover-color'] },
    { id: 'topbarActiveColor', cssVars: ['--sarak-topbar-active-color'] },
];

const SHARED_MENU_ITEM = 'src/components/atomic/Navigation/SarakMenuItem.tsx';

const CONSUMER_GROUPS = {
    SarakShell: {
        dirs: ['src/core/Shell'],
        extraFiles: [SHARED_MENU_ITEM],
    },
    SarakAppChrome: {
        dirs: ['src/components/Layout'],
        extraFiles: [SHARED_MENU_ITEM, 'src/components/atomic/Navigation/SarakShellNav.tsx'],
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
export function checkChromeTokenParity({ root = ROOT, tokens = CHROME_TOKENS, groups = CONSUMER_GROUPS } = {}) {
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
    console.log('--- check-chrome-token-parity (plan-66) ---');
    const missing = checkChromeTokenParity();

    if (missing.length === 0) {
        console.log(`[OK] Os ${CHROME_TOKENS.length} tokens de cromo cobertos têm consumidor no SarakShell E no SarakAppChrome.`);
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
