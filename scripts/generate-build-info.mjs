// Identidade de build verificável (Spec 39 §2.2). Grava `dist/BUILD_INFO.json`
// (commit-base + data do build) a cada `npm run build`.
//
// O campo NÃO PODE se chamar `commit` — leria como "o commit que este build publica",
// o que é estruturalmente
// impossível: o `dist/` (incluindo este próprio arquivo) é commitado DEPOIS de
// gerado, e o hash de um commit depende do seu conteúdo. Logo o SHA lido aqui
// (`git rev-parse HEAD` no momento do `npm run build`) é sempre o commit ANTERIOR
// ao que de fato publica — daí `baseCommit`, nunca `commit`. Quem precisa saber
// "o consumidor está atualizado?" usa o `resolved` do `package-lock.json` do
// consumidor (fonte exata) ou roda `npm run sarak:check` (Spec 39 follow-up,
// `bin/scaffold/checkUpdate.mjs`) — nunca este campo.
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que o modo `--check` NÃO vê
// -------------------------------------------------------------------------
// `--check` NÃO confere `baseCommit` contra o HEAD atual: por construção, o
// `dist/` é commitado DEPOIS de gerado, então `baseCommit` é SEMPRE o commit
// anterior ao que publica este próprio arquivo — comparar com o HEAD reprovaria
// todo build legítimo. `--check` compara os arquivos gerados em `src/` com
// `dist/BUILD_INFO.json`, não com o HEAD atual. Para os bundles, a conferência é
// por substring: exige cada chave e cada valor em algum lugar de `dist/index.js`
// e `dist/index.cjs`, mas não prova que os três valores formam o objeto
// `data-sarak-build-info`. Esses são os únicos bundles abertos; o código ESM que
// escreve o atributo fica num `dist/chunk-*.js` com hash, que o checker não lê.
// `builtAt` é comparado com o valor gerado, não com o relógio atual.
// -------------------------------------------------------------------------
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEST_DIR = path.join(ROOT, 'dist');
const DEST_FILE = path.join(DEST_DIR, 'BUILD_INFO.json');
const SOURCE_FILE = path.join(ROOT, 'src', 'core', 'Provider', 'buildInfo.ts');
const PUBLIC_SOURCE_FILE = path.join(ROOT, 'src', 'buildInfo.ts');
const REQUIRED_KEYS = ['baseCommit', 'baseCommitShort', 'builtAt', 'libVersion', 'note'];
const BUILD_SEAL_KEYS = ['libVersion', 'baseCommitShort', 'builtAt'];

function readBaseCommit() {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
}

function buildInfoFor(baseCommit, version) {
    return {
        baseCommit,
        baseCommitShort: baseCommit.slice(0, 7),
        builtAt: new Date().toISOString(),
        libVersion: version,
        note: 'baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o "resolved" do package-lock.json ou rode "npm run sarak:check".',
    };
}

function readCurrentVersion() {
    return JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
}

function serializeBuildInfoSource(buildInfo) {
    return `export const SARAK_BUILD_INFO = ${JSON.stringify(buildInfo, null, 4)} as const;\n`;
}

function serializePublicBuildInfoSource(buildInfo) {
    const publicBuildInfo = {
        libVersion: buildInfo.libVersion,
        baseCommitShort: buildInfo.baseCommitShort,
        builtAt: buildInfo.builtAt,
    };
    return `export const SARAK_BUILD_INFO = ${JSON.stringify(publicBuildInfo, null, 4)} as const;\n`;
}

const BUILD_INFO_SOURCE_WRITERS = [
    { filePath: SOURCE_FILE, serialize: serializeBuildInfoSource },
    { filePath: PUBLIC_SOURCE_FILE, serialize: serializePublicBuildInfoSource },
];

export const BUILD_INFO_PREPARE_OUTPUT_PATHS = Object.freeze(
    BUILD_INFO_SOURCE_WRITERS.map(({ filePath }) => path.relative(ROOT, filePath).split(path.sep).join('/')),
);

function writeBuildInfoSource(buildInfo) {
    for (const { filePath, serialize } of BUILD_INFO_SOURCE_WRITERS) {
        writeFileSync(filePath, serialize(buildInfo));
    }
}

function readBuildInfoSource(sourceFile = SOURCE_FILE) {
    const source = readFileSync(sourceFile, 'utf8');
    const prefix = 'export const SARAK_BUILD_INFO = ';
    const suffix = ' as const;\n';
    if (!source.startsWith(prefix) || !source.endsWith(suffix)) {
        throw new Error('src/core/Provider/buildInfo.ts não tem o formato gerado esperado.');
    }

    try {
        return JSON.parse(source.slice(prefix.length, -suffix.length));
    } catch (error) {
        throw new Error('src/core/Provider/buildInfo.ts não contém JSON válido.', { cause: error });
    }
}

function writeBuildInfoArtifact(buildInfo, destFile = DEST_FILE) {
    mkdirSync(path.dirname(destFile), { recursive: true });
    writeFileSync(destFile, `${JSON.stringify(buildInfo, null, 4)}\n`);
}

function prepareBuildInfo() {
    const buildInfo = buildInfoFor(readBaseCommit(), readCurrentVersion());
    writeBuildInfoSource(buildInfo);
    console.log(`[generate-build-info] src/core/Provider/buildInfo.ts — baseCommit ${buildInfo.baseCommitShort}, builtAt ${buildInfo.builtAt}.`);
}

function checkBuildInfoSource({ sourceFile, publicSourceFile, parsed, problemas }) {
    if (!existsSync(sourceFile)) {
        problemas.push('src/core/Provider/buildInfo.ts não existe — rode `npm run build`.');
        return;
    }

    let sourceInfo;
    try {
        sourceInfo = readBuildInfoSource(sourceFile);
    } catch (error) {
        problemas.push(error.message);
        return;
    }

    for (const key of REQUIRED_KEYS) {
        if (sourceInfo[key] !== parsed[key]) {
            problemas.push(`dist/BUILD_INFO.json não corresponde à fonte gerada (campo "${key}").`);
        }
    }

    if (!existsSync(publicSourceFile)) {
        problemas.push('src/buildInfo.ts não existe — rode `npm run build`.');
        return;
    }
    let publicInfo;
    try {
        publicInfo = readBuildInfoSource(publicSourceFile);
    } catch (error) {
        problemas.push(error.message);
        return;
    }
    for (const key of BUILD_SEAL_KEYS) {
        if (publicInfo[key] !== parsed[key]) {
            problemas.push(`src/buildInfo.ts não corresponde ao BUILD_INFO.json (campo "${key}").`);
        }
    }
}

function checkBuildInfoBundle({ bundleFile, parsed }) {
    if (!existsSync(bundleFile)) {
        return `${path.basename(bundleFile)} não existe — rode \`npm run build\`.`;
    }

    const bundle = readFileSync(bundleFile, 'utf8');
    const missingFields = BUILD_SEAL_KEYS.filter((key) => !bundle.includes(key));
    const missingValues = BUILD_SEAL_KEYS.filter((key) => !bundle.includes(String(parsed[key] ?? '')));
    if (missingFields.length === 0 && missingValues.length === 0) return null;

    const missingParts = [
        ...missingFields.map((key) => `campo ${key}`),
        ...missingValues.map((key) => `valor ${key}`),
    ];
    return `${path.basename(bundleFile)} não contém o selo de build esperado: ${missingParts.join(', ')}.`;
}

export function checkBuildInfo({
    destFile = DEST_FILE,
    sourceFile = SOURCE_FILE,
    publicSourceFile = PUBLIC_SOURCE_FILE,
    distDir = DEST_DIR,
    currentVersion,
} = {}) {
    const problemas = [];
    if (!existsSync(destFile)) {
        return ['dist/BUILD_INFO.json não existe — rode `npm run build` (ou `node scripts/generate-build-info.mjs`).'];
    }

    let parsed;
    try {
        parsed = JSON.parse(readFileSync(destFile, 'utf8'));
    } catch {
        return ['dist/BUILD_INFO.json não é JSON válido.'];
    }

    for (const key of REQUIRED_KEYS) {
        if (!(key in parsed)) problemas.push(`chave ausente: "${key}"`);
    }
    if (parsed.baseCommit && parsed.baseCommitShort !== parsed.baseCommit.slice(0, 7)) {
        problemas.push(`baseCommitShort ("${parsed.baseCommitShort}") não é o prefixo de baseCommit ("${parsed.baseCommit}")`);
    }
    const versaoAtual = currentVersion ?? readCurrentVersion();
    if (parsed.libVersion && parsed.libVersion !== versaoAtual) {
        problemas.push(`libVersion ("${parsed.libVersion}") diferente da versão atual do package.json ("${versaoAtual}") — dist/ desatualizado`);
    }

    checkBuildInfoSource({ sourceFile, publicSourceFile, parsed, problemas });
    for (const bundleName of ['index.js', 'index.cjs']) {
        const bundleProblema = checkBuildInfoBundle({ bundleFile: path.join(distDir, bundleName), parsed });
        if (bundleProblema) problemas.push(bundleProblema);
    }
    return problemas;
}

function main() {
    const modoCheck = process.argv.includes('--check');

    if (modoCheck) {
        console.log('--- generate-build-info --check ---');
        const problemas = checkBuildInfo();
        if (problemas.length === 0) {
            console.log('[OK] dist/BUILD_INFO.json íntegro (chaves presentes, libVersion em dia).');
            process.exit(0);
        }
        console.log('[ERROR] dist/BUILD_INFO.json com problema(s):');
        problemas.forEach((p) => console.log(`  - ${p}`));
        process.exit(1);
    }

    if (process.argv.includes('--prepare')) {
        prepareBuildInfo();
        return;
    }

    const buildInfo = existsSync(SOURCE_FILE)
        ? readBuildInfoSource()
        : buildInfoFor(readBaseCommit(), readCurrentVersion());
    if (!existsSync(SOURCE_FILE)) writeBuildInfoSource(buildInfo);

    writeBuildInfoArtifact(buildInfo);
    console.log(`[generate-build-info] dist/BUILD_INFO.json — baseCommit ${buildInfo.baseCommitShort}, builtAt ${buildInfo.builtAt}.`);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
