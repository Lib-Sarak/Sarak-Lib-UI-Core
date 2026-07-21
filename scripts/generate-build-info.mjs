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
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEST_DIR = path.join(ROOT, 'dist');
const DEST_FILE = path.join(DEST_DIR, 'BUILD_INFO.json');

function readBaseCommit() {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
}

function main() {
    const baseCommit = readBaseCommit();
    const { version } = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

    const buildInfo = {
        baseCommit,
        baseCommitShort: baseCommit.slice(0, 7),
        builtAt: new Date().toISOString(),
        libVersion: version,
        note: 'baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o "resolved" do package-lock.json ou rode "npm run sarak:check".',
    };

    mkdirSync(DEST_DIR, { recursive: true });
    writeFileSync(DEST_FILE, `${JSON.stringify(buildInfo, null, 4)}\n`);
    console.log(`[generate-build-info] dist/BUILD_INFO.json — baseCommit ${buildInfo.baseCommitShort}, builtAt ${buildInfo.builtAt}.`);
}

main();
