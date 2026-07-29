/**
 * Diagnóstico da dependência LOCAL (`file:`/`link:`) — Spec 51, L1 §3.2 e L3/D4.
 *
 * É o modo em que a lib e o consumidor são desenvolvidos lado a lado, e é onde o
 * silêncio mais dói: não há commit remoto para comparar, então o `check` antigo caía
 * em "lockfile em formato inesperado" (uma mensagem de ERRO para uma situação
 * perfeitamente normal), e um rebuild da lib simplesmente não chegava ao consumidor
 * sem que nada avisasse.
 *
 * O teste certo NÃO é "o node_modules é symlink?" — todo gerenciador moderno usa
 * symlink para alguma coisa. Medido em 2026-07-26: no consumidor real (pnpm workspace,
 * fonte fora da raiz) o symlink aponta para o STORE (`node_modules/.pnpm/...`), ou seja,
 * é cópia; num projeto npm simples o symlink aponta para a FONTE, ou seja, é link vivo.
 * O que decide é o **realpath**: cai dentro da fonte declarada no spec ou não.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const LOCAL_PREFIXES = ['file:', 'link:'];

/** O que o consumidor de fato consome — o `dist/` publicado e o kit, nunca o `src/`. */
export const SIGNED_DIRS = ['dist', 'sarak-ui'];

/**
 * Hash curto de um inventário `caminho:tamanho`. Exportado porque o gate de release
 * (`scripts/check-release-tag.mjs`, ADR-008) precisa responder "o artefato publicado
 * mudou?" com **exatamente este critério** — só que lendo o inventário do git em vez do
 * disco. Duas noções concorrentes de "o que é o artefato" seria a porta para o gate
 * dizer uma coisa e o `sarak-ui check` dizer outra.
 *
 * A ordenação acontece aqui para que a origem das linhas (filesystem × `git ls-tree`)
 * não influencie o hash.
 */
export const hashInventoryLines = (lines) =>
    crypto.createHash('sha256').update([...lines].sort().join('\n')).digest('hex').slice(0, 12);

export const isLocalSpec = (spec) => LOCAL_PREFIXES.some((prefix) => spec.startsWith(prefix));

const stripPrefix = (spec) => {
    const prefix = LOCAL_PREFIXES.find((candidate) => spec.startsWith(candidate));
    return prefix ? spec.slice(prefix.length) : spec;
};

const realPathOrNull = (target) => {
    try {
        return fs.realpathSync(target);
    } catch {
        return null;
    }
};

const readTextOrNull = (file) => {
    try {
        return fs.readFileSync(file, 'utf8');
    } catch {
        return null;
    }
};

/** Inventário `caminho:tamanho` de um diretório, recursivo e ordenado. */
const inventory = (dir, base = dir, out = []) => {
    let entries;
    try {
        entries = fs.readdirSync(dir).sort();
    } catch {
        return out;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) inventory(full, base, out);
        else out.push(`${path.relative(base, full).split(path.sep).join('/')}:${stat.size}`);
    }
    return out;
};

/**
 * Assinatura do que o consumidor consome. Precisa de DUAS partes, e a segunda foi
 * aprendida na marra (2026-07-26): o pnpm **hardlinka** os arquivos para o store, então
 * reescrever um arquivo EXISTENTE propaga sozinho para a cópia instalada — comparar só
 * o conteúdo do `BUILD_INFO.json` dizia "em dia" mesmo com a instalação velha. O que
 * um hardlink NÃO propaga é arquivo **adicionado ou removido** — que foi exatamente o
 * sintoma real (`sarak-ui/` inteiro ausente na cópia instalada). Por isso o inventário.
 */
const buildSignature = (packageRoot) => {
    const buildInfo = readTextOrNull(path.join(packageRoot, 'dist', 'BUILD_INFO.json'));
    const kitVersion = readTextOrNull(path.join(packageRoot, 'sarak-ui', 'VERSION'));
    const files = SIGNED_DIRS.flatMap((dir) => inventory(path.join(packageRoot, dir)).map((line) => `${dir}/${line}`));
    return {
        buildInfo,
        kitVersion,
        inventoryHash: hashInventoryLines(files),
        present: buildInfo !== null || kitVersion !== null,
    };
};

const kitHashOf = (versionFile) => versionFile?.match(/kitHash=(\w+)/)?.[1] ?? null;
const builtAtOf = (buildInfo) => {
    try {
        return JSON.parse(buildInfo ?? '').builtAt ?? null;
    } catch {
        return null;
    }
};

/**
 * @returns {{ mode: 'local', kind: 'live'|'stale'|'fresh'|'indeterminado', sourceDir, detail }}
 *  - `live`   — o `node_modules` aponta para a própria fonte: sempre em dia, nada a fazer.
 *  - `fresh`  — é cópia, e a cópia bate com a fonte.
 *  - `stale`  — é cópia, e a fonte MUDOU desde a instalação → é o que dispara o aviso.
 *  - `indeterminado` — não deu para ler a assinatura dos dois lados (ex.: lib nunca buildada).
 */
export const inspectLocalDependency = ({ spec, packageDir, installedDir }) => {
    const sourceDir = path.resolve(packageDir, stripPrefix(spec));
    const sourceReal = realPathOrNull(sourceDir);
    const installedReal = installedDir ? realPathOrNull(installedDir) : null;

    if (!installedReal) {
        return { mode: 'local', kind: 'indeterminado', sourceDir, detail: 'pacote não encontrado em node_modules — rode a instalação.' };
    }
    if (!sourceReal) {
        return { mode: 'local', kind: 'indeterminado', sourceDir, detail: `a fonte apontada pelo spec não existe em ${sourceDir}.` };
    }
    if (installedReal === sourceReal) {
        return { mode: 'local', kind: 'live', sourceDir, detail: 'o node_modules aponta para a própria fonte — reflete o disco na hora.' };
    }

    const installed = buildSignature(installedReal);
    const source = buildSignature(sourceReal);
    if (!installed.present || !source.present) {
        return {
            mode: 'local',
            kind: 'indeterminado',
            sourceDir,
            detail: 'não achei `dist/BUILD_INFO.json` nos dois lados — rode `npm run build` na biblioteca.',
        };
    }

    const same =
        installed.buildInfo === source.buildInfo &&
        installed.kitVersion === source.kitVersion &&
        installed.inventoryHash === source.inventoryHash;
    return {
        mode: 'local',
        kind: same ? 'fresh' : 'stale',
        sourceDir,
        installedKitHash: kitHashOf(installed.kitVersion),
        sourceKitHash: kitHashOf(source.kitVersion),
        installedBuiltAt: builtAtOf(installed.buildInfo),
        sourceBuiltAt: builtAtOf(source.buildInfo),
        installedInventory: installed.inventoryHash,
        sourceInventory: source.inventoryHash,
        detail: same
            ? 'a cópia instalada bate com a biblioteca em disco.'
            : 'a biblioteca em disco mudou desde a sua última instalação.',
    };
};
