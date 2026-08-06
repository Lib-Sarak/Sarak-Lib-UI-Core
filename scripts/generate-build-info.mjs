// Identidade de build verificável (Spec 39 §2.2). Grava `dist/BUILD_INFO.json`
// (commit-base + data do build) a cada `npm run build`.
//
// CORREÇÃO (follow-up da Spec 39, 2026-07-21): o campo NÃO PODE se chamar `commit`
// — leria como "o commit que este build publica", o que é estruturalmente
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
// `--check` (plan-12, vão 8) NÃO confere `baseCommit` contra o HEAD atual: por
// construção, o `dist/` é commitado DEPOIS de gerado, então `baseCommit` é
// SEMPRE o commit anterior ao que publica este próprio arquivo — comparar com
// o HEAD reprovaria todo build legítimo. `--check` também não confere
// `builtAt` (timestamp muda a cada geração, por definição). O que ele CONFERE
// é o que é estável entre gerar e publicar: o arquivo existe, é JSON válido,
// tem as 5 chaves esperadas, `baseCommitShort` é o prefixo de `baseCommit`, e
// `libVersion` bate com a versão ATUAL de `package.json` (pega o caso "versão
// bumpada, dist esquecido de regenerar").
// -------------------------------------------------------------------------
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEST_DIR = path.join(ROOT, 'dist');
const DEST_FILE = path.join(DEST_DIR, 'BUILD_INFO.json');
const REQUIRED_KEYS = ['baseCommit', 'baseCommitShort', 'builtAt', 'libVersion', 'note'];

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

export function checkBuildInfo({ destFile = DEST_FILE, currentVersion } = {}) {
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

    const baseCommit = readBaseCommit();
    const buildInfo = buildInfoFor(baseCommit, readCurrentVersion());

    mkdirSync(DEST_DIR, { recursive: true });
    writeFileSync(DEST_FILE, `${JSON.stringify(buildInfo, null, 4)}\n`);
    console.log(`[generate-build-info] dist/BUILD_INFO.json — baseCommit ${buildInfo.baseCommitShort}, builtAt ${buildInfo.builtAt}.`);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
