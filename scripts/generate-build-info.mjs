// Identidade de build verificável (Spec 39 §2.2): hoje é IMPOSSÍVEL o consumidor
// responder "qual build da Sarak eu tenho?" — a `version` fica em 3.0.0 por 8+
// commits e não há tag. Grava `dist/BUILD_INFO.json` (commit + data do build) a
// cada `npm run build`, para que o consumidor (ou um agente de teste) compare
// objetivamente contra `git rev-parse HEAD` do repositório da lib, antes/depois
// de rodar o `sarak:update`.
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEST_DIR = path.join(ROOT, 'dist');
const DEST_FILE = path.join(DEST_DIR, 'BUILD_INFO.json');

function readCommit() {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
}

function main() {
    const commit = readCommit();
    const { version } = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

    const buildInfo = {
        commit,
        commitShort: commit.slice(0, 7),
        builtAt: new Date().toISOString(),
        libVersion: version,
    };

    mkdirSync(DEST_DIR, { recursive: true });
    writeFileSync(DEST_FILE, `${JSON.stringify(buildInfo, null, 4)}\n`);
    console.log(`[generate-build-info] dist/BUILD_INFO.json — commit ${buildInfo.commitShort}, builtAt ${buildInfo.builtAt}.`);
}

main();
