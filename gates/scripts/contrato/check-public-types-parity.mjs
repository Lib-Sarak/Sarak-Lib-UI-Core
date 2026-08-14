/**
 * Gate de PARIDADE DE TIPOS públicos (plan-45).
 *
 * `barrel:check` cobra que todo COMPONENTE consumidor-facing está exportado — mas tipo
 * nunca entrou na conta dele (`03-superficie-publica.md` §4). Um tipo pode aparecer na
 * assinatura de uma prop, do retorno de um hook, ou de um membro de contexto já
 * EXPORTADO, e ainda assim ser impossível de importar pelo nome — foi exatamente o que
 * um consumidor real bateu integrando persistência de tema: `import type {
 * SarakThemePayload } from '@sarak/lib-ui-core'` falhava com `TS2459`, porque o tipo
 * estava DECLARADO no `dist/index.d.ts` (usado internamente por outras assinaturas
 * públicas) mas nunca chegou ao bloco `export { … }` final.
 *
 * Este gate compara DECLARADOS × EXPORTADOS em `dist/index.d.ts` e falha se sobrar
 * algum tipo fora do bloco de export que não esteja na allowlist
 * (`gates/allowlists/publicTypeExclusions.mjs`, com motivo obrigatório — mesmo idioma
 * de `barrelExclusions.mjs`).
 *
 * Uso: `node gates/scripts/contrato/check-public-types-parity.mjs` (relatório) |
 * `--check` (exit 1 se houver problema).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. Lê `dist/index.d.ts` — DEPENDE do build estar atualizado. Rodar este gate sobre
 *    um `dist/` velho mede o passado: ou fica falso-verde (tipo novo declarado só no
 *    `src/` ainda não apareceu no `.d.ts`) ou falso-vermelho (tipo já exportado no
 *    `src/` mas o `.d.ts` não foi reconstruído). Por isso, diferente de `barrel:check`
 *    (que mede só `src/` por AST e roda no bloco de PRÉ-checagem do `npm run build`,
 *    antes de `build:js`), este gate roda DEPOIS de `build:js` — é o primeiro passo
 *    do `npm run build` que produz o `.d.ts` que ele lê.
 * 2. NÃO decide sozinho se um tipo "deveria" ser público — só aplica a classificação
 *    já registrada na allowlist. Um tipo novo que apareça declarado e não-exportado
 *    reprova o gate por padrão (fail-safe: "esquecido" até prova em contrário) — quem
 *    resolve é humano, exportando ou adicionando à allowlist com motivo.
 * 3. É TEXTUAL sobre o `.d.ts` bundlado, não usa o compilador TS — assume que o bloco
 *    de export final começa com `export {` no início de linha e termina em `};` na
 *    MESMA linha (verdade hoje: `rollup-plugin-dts` empacota tudo num só bloco final).
 *    Se o bundler passar a emitir múltiplos blocos de export, este gate para de ver
 *    os demais.
 * 4. Trata `X as Y` (alias de export, ex. `SarakKanbanImpl as SarakKanban`) pegando só
 *    o nome PÓS-`as` — é o nome que o consumidor de fato importa. Não valida se o
 *    nome PRÉ-`as` também deveria ou não estar em algum lugar.
 * 5. Só cobra `interface`/`type` de NÍVEL SUPERIOR do `.d.ts` (mesmo padrão do
 *    `grep` que a plan-45 usa para medir) — não desce a namespaces nem a tipos
 *    aninhados dentro de outra declaração.
 * -------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_TYPE_EXCLUSIONS } from '../../allowlists/publicTypeExclusions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DIST_INDEX_DTS = path.join(ROOT, 'dist', 'index.d.ts');

const DECLARED_RE = /^(?:declare )?(?:interface|type) ([A-Za-z_][A-Za-z0-9_]*)/gm;
const EXPORT_BLOCK_RE = /^export \{([\s\S]*?)\};/m;

/** Todo `interface`/`type` declarado no topo do `.d.ts` bundlado. */
export function parseDeclaredTypeNames(dtsContent) {
    const names = new Set();
    for (const match of dtsContent.matchAll(DECLARED_RE)) names.add(match[1]);
    return names;
}

/** Os nomes que o bloco `export { … }` final entrega ao consumidor. */
export function parseExportedNames(dtsContent) {
    const block = EXPORT_BLOCK_RE.exec(dtsContent);
    const names = new Set();
    if (!block) return names;

    for (const raw of block[1].split(',')) {
        const entry = raw.trim().replace(/^type\s+/, '');
        if (!entry) continue;
        const asMatch = entry.match(/\bas\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        names.add(asMatch ? asMatch[1] : entry);
    }
    return names;
}

/** A análise de paridade. Retorna listas de problemas (vazias = verde). */
export function runPublicTypesParityCheck({ distIndexDts = DIST_INDEX_DTS, exclusions = PUBLIC_TYPE_EXCLUSIONS } = {}) {
    if (!fs.existsSync(distIndexDts)) {
        return {
            missing: [],
            staleExclusions: [],
            error: `${path.relative(ROOT, distIndexDts).split(path.sep).join('/')} não existe — rode \`npm run build\` antes.`,
        };
    }

    const content = fs.readFileSync(distIndexDts, 'utf8');
    const declared = parseDeclaredTypeNames(content);
    const exported = parseExportedNames(content);

    const gap = [...declared].filter((name) => !exported.has(name));
    const missing = gap.filter((name) => !exclusions[name]);
    const staleExclusions = Object.keys(exclusions).filter((name) => !gap.includes(name));

    return { missing: missing.sort(), staleExclusions: staleExclusions.sort(), error: null };
}

function main() {
    const isCheck = process.argv.includes('--check');
    console.log('--- check-public-types-parity (plan-45) ---');
    const { missing, staleExclusions, error } = runPublicTypesParityCheck();

    if (error) {
        console.error(`[ERROR] ${error}`);
        process.exit(1);
    }

    if (missing.length > 0) {
        console.log(`[ERROR] ${missing.length} tipo(s) declarado(s) em dist/index.d.ts e NÃO exportado(s):`);
        missing.forEach((n) => console.log(`  - ${n}  (exporte em src/index.ts, ou declare em gates/allowlists/publicTypeExclusions.mjs com motivo)`));
    }

    if (staleExclusions.length > 0) {
        console.log(`[ERROR] ${staleExclusions.length} exclusão(ões) OBSOLETA(S) em publicTypeExclusions.mjs (já exportada, ou não declarada mais no .d.ts):`);
        staleExclusions.forEach((n) => console.log(`  - ${n}`));
    }

    const problems = missing.length + staleExclusions.length;
    if (problems === 0) {
        console.log('[OK] Todo tipo declarado em dist/index.d.ts está exportado, ou tem exclusão com motivo.');
    } else if (isCheck) {
        process.exit(1);
    }
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
