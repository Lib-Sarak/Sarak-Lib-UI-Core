// Gate de empacotamento (Spec 29 §2.1/2.4, Spec 40 §2.4): roda `npm pack --dry-run
// --json` sobre o pacote já buildado e confere a allowlist do campo `files`. Falha se
// o tarball trouxer código-fonte/config de teste (achado 4 do Selo) OU se faltar algo
// que o `init` (`bin/scaffold/context.mjs`) precisa ler do pacote instalado. `src/` é
// proibido SEM EXCEÇÃO (Spec 40 §2.4 fechou o M9 PARCIAL do re-Selo — o export
// "./sarak-base.css" agora resolve para `dist/styles/`).
import { execSync } from 'node:child_process';

const FORBIDDEN_PREFIXES = [
    'src/',
    'specs/',
    'playwright/',
    '__snapshots__/',
    'Template-Ts/',
];

const FORBIDDEN_EXACT_OR_SUFFIX = [
    'vitest.config.ts',
    '.test.mjs',
    '.test.ts',
    '.test.tsx',
];

const REQUIRED_PATHS = [
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/sarak.css',
    'dist/styles/sarak-base.css',
    // Identidade de build verificável (Spec 39 §2.2) — gerado por scripts/generate-build-info.mjs.
    'dist/BUILD_INFO.json',
    'bin/sarak-ui.mjs',
    'bin/scaffold/context.mjs',
    'bin/scaffold/runInit.mjs',
    // `npm run sarak:check` (Spec 39 follow-up) — o consumidor invoca este arquivo
    // diretamente via script no package.json (não é import da lib, é `node <caminho>`).
    'bin/scaffold/checkUpdate.mjs',
    'bin/scaffold/checkUpdate/runCheckUpdate.mjs',
    'docs/component-catalog.md',
    'docs/component-catalog.json',
];

function isForbidden(filePath) {
    if (FORBIDDEN_PREFIXES.some((prefix) => filePath.startsWith(prefix))) return true;
    return FORBIDDEN_EXACT_OR_SUFFIX.some((suffix) => filePath.endsWith(suffix));
}

function main() {
    // Comando fixo (sem input externo) — `execSync` via shell resolve o shim `npm.cmd`
    // do Windows sem o aviso de depreciação de `execFileSync(..., { shell: true })`.
    const raw = execSync('npm pack --dry-run --json', { encoding: 'utf8' });
    const [{ files }] = JSON.parse(raw);
    const paths = files.map((f) => f.path);
    const pathSet = new Set(paths);

    const forbiddenFound = paths.filter(isForbidden);
    const missingRequired = REQUIRED_PATHS.filter((p) => !pathSet.has(p));

    if (forbiddenFound.length > 0) {
        console.error(`[check-package-contents] ${forbiddenFound.length} arquivo(s) proibido(s) no tarball:`);
        for (const p of forbiddenFound) console.error(`  - ${p}`);
    }
    if (missingRequired.length > 0) {
        console.error(`[check-package-contents] ${missingRequired.length} arquivo(s) obrigatório(s) AUSENTE(S) do tarball:`);
        for (const p of missingRequired) console.error(`  - ${p}`);
    }

    if (forbiddenFound.length > 0 || missingRequired.length > 0) {
        process.exitCode = 1;
        return;
    }

    console.log(`[check-package-contents] OK — ${paths.length} arquivos no tarball, allowlist respeitada.`);
}

main();
