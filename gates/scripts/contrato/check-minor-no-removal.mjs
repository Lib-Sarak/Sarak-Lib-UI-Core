/**
 * Gate (b) — MINOR/PATCH não pode remover nome do barril público.
 *
 * A ASSIMETRIA que decide este gate:
 * - **MAJOR sem remoção é LEGÍTIMO e não se cobra.** A `4.0.0` é a prova viva
 *   (03 §3.1, decisão D): zero export removido, e ainda assim toda cor de
 *   todo tema podia mudar na tela — quebra COMPORTAMENTAL, superfície
 *   intacta. Um gate que exigisse remoção para "justificar" um major teria
 *   REPROVADO a `4.0.0`, que estava certa. Por isso este gate não olha
 *   major nenhum.
 * - **MINOR/PATCH com remoção é SEMPRE errado**, e é o erro COM VÍTIMA: quem
 *   está preso numa faixa `^N` recebe a quebra DENTRO da faixa que
 *   declarou, sem escolher (`#semver:^N` nunca atravessa major sozinho —
 *   ADR-008 §7). Só esta direção é DECIDÍVEL, e é a única que este gate
 *   cobra.
 *
 * Compara os NOMES exportados por `dist/index.d.ts` (o barril já resolvido
 * — `export *` incluso) entre a última tag `vX.Y.Z` e a árvore atual. Roda
 * dentro do script `version`, depois do `preversion` (que já rodou
 * `npm run build` como parte de `gates:full`) — o `dist/index.d.ts` em disco
 * já reflete o código que está prestes a virar a nova tag.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só vê REMOÇÃO DE NOME (um identificador que saiu do bloco
 *    `export { ... }` de `dist/index.d.ts`). NÃO vê mudança de
 *    COMPORTAMENTO — a `4.0.0` é a prova de uma quebra que este gate jamais
 *    pegaria, e continua sem pegar: ele NÃO teria barrado a `4.0.0`.
 * 2. Não vê mudança de TIPO/assinatura de um nome que CONTINUA exportado
 *    (ex.: uma prop opcional virando obrigatória) — só presença/ausência do
 *    identificador. Isso é o mesmo limite que `public-types:check` (Spec 45)
 *    também não fecha.
 * 3. Assume o formato de UM BLOCO `export { ... };` só, produzido pelo
 *    dts-bundler do `tsup` — outro formato de saída de bundler não é
 *    reconhecido (`parseExportedNames` devolve conjunto vazio em silêncio).
 * 4. Repositório sem nenhuma tag `v*` não tem o que comparar — libera.
 * -------------------------------------------------------------------------
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_INDEX_DTS = path.resolve('dist/index.d.ts');

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/** Maior tag `vX.Y.Z` do repositório, por ordenação de versão (não alfabética). */
export const ultimaTag = () => {
    const saida = git('for-each-ref', '--sort=-v:refname', '--format=%(refname:short)', 'refs/tags/v*');
    return saida === '' ? null : saida.split('\n')[0].trim();
};

/**
 * Extrai os identificadores do bloco `export { ... };` do `dist/index.d.ts`
 * bundlado pelo tsup — um `type X` vira `X`, um `X as Y` vira `Y` (o nome
 * público, que é o que o consumidor de fato importa).
 */
export function parseExportedNames(dtsText) {
    const match = dtsText.match(/export\s*\{([\s\S]*?)\};?\s*$/);
    if (!match) return new Set();
    const names = new Set();
    for (const raw of match[1].split(',')) {
        const item = raw.trim().replace(/^type\s+/, '');
        if (!item) continue;
        const asMatch = item.match(/^\S+\s+as\s+(\S+)$/);
        names.add(asMatch ? asMatch[1] : item);
    }
    return names;
}

const bumpEhMajor = (anterior, atual) => {
    const majorAnterior = Number(anterior.split('.')[0]);
    const majorAtual = Number(atual.split('.')[0]);
    return majorAtual > majorAnterior;
};

/**
 * @returns {{ok:true, skipped:true, reason:string}
 *         | {ok:true, skipped:false}
 *         | {ok:false, removed:string[], previousVersion:string, currentVersion:string}}
 */
export function checkNoRemovalOutsideMajor({ previousVersion, currentVersion, previousDts, currentDts }) {
    if (bumpEhMajor(previousVersion, currentVersion)) {
        return {
            ok: true,
            skipped: true,
            reason: `${previousVersion} → ${currentVersion} é MAJOR — remoção é legítima sem gate (a 4.0.0 é a prova de que major sem remoção também é legítimo).`,
        };
    }
    const antes = parseExportedNames(previousDts);
    const depois = parseExportedNames(currentDts);
    const removidos = [...antes].filter((nome) => !depois.has(nome)).sort();
    if (removidos.length === 0) return { ok: true, skipped: false };
    return { ok: false, removed: removidos, previousVersion, currentVersion };
}

function main() {
    console.log('--- check-minor-no-removal (minor/patch não remove nome do barril público) ---');
    const tag = ultimaTag();
    if (tag === null) {
        console.log('[OK] nenhuma tag "v*" ainda — nada para comparar.');
        process.exit(0);
    }
    if (!fs.existsSync(DIST_INDEX_DTS)) {
        console.log('[OK] dist/index.d.ts ainda não existe nesta árvore — nada para comparar ainda.');
        process.exit(0);
    }

    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    const previousVersion = tag.replace(/^v/, '');
    const currentVersion = pkg.version;

    let previousDts;
    try {
        previousDts = git('show', `${tag}:dist/index.d.ts`);
    } catch {
        console.log(`[OK] ${tag} não tem dist/index.d.ts commitado — nada para comparar.`);
        process.exit(0);
    }
    const currentDts = fs.readFileSync(DIST_INDEX_DTS, 'utf8');

    const result = checkNoRemovalOutsideMajor({ previousVersion, currentVersion, previousDts, currentDts });

    if (result.skipped) {
        console.log(`[OK] ${result.reason}`);
        process.exit(0);
    }
    if (result.ok) {
        console.log(`[OK] ${previousVersion} → ${currentVersion} — nenhum nome removido do barril público.`);
        process.exit(0);
    }
    console.log(
        `[ERROR] ${result.previousVersion} → ${result.currentVersion} é minor/patch e REMOVEU ${result.removed.length} nome(s) do barril público:`,
    );
    result.removed.forEach((nome) => console.log(`  - ${nome}`));
    console.log('  Remoção de nome exportado é sempre MAJOR (03 §3). Emita major, ou não remova.');
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
