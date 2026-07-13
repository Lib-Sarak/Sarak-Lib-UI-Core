// Postbuild: substitui o placeholder `__SARAK_CSS_PLACEHOLDER__` (definido em
// src/core/Provider/__sarakCss.ts) pelo CSS real já compilado (dist/sarak.css) em
// TODO arquivo `.js`/`.cjs` de `dist/`. Assim `import { SarakUIProvider } from
// '@sarak/lib-ui-core'` já injeta o stylesheet completo em runtime, sem exigir CSS
// manual do consumidor (Spec 08 §2). Varre o diretório inteiro (em vez de só
// dist/index.js|cjs) porque o build ESM faz code-splitting: o código do Provider pode
// cair num chunk com nome hash-based (ex.: dist/chunk-XXXX.js), não no entry file.
// Substituição por string literal (não por nome de identificador) porque sobrevive à
// minificação/inlining do esbuild.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const CSS_PATH = path.join(DIST_DIR, 'sarak.css');
const PLACEHOLDER = '__SARAK_CSS_PLACEHOLDER__';

if (!existsSync(CSS_PATH)) {
    console.error('[inject-css] dist/sarak.css não encontrado — rode "npm run build:css" antes.');
    process.exit(1);
}

const css = readFileSync(CSS_PATH, 'utf8');
const cssEscaped = JSON.stringify(css).slice(1, -1);
const placeholderRegex = new RegExp(`(['"])${PLACEHOLDER}\\1`, 'g');

const candidates = readdirSync(DIST_DIR).filter((f) => f.endsWith('.js') || f.endsWith('.cjs'));

let totalReplacements = 0;
for (const rel of candidates) {
    const filePath = path.join(DIST_DIR, rel);
    const original = readFileSync(filePath, 'utf8');
    const matches = original.match(placeholderRegex);
    if (!matches || matches.length === 0) continue;
    const patched = original.replace(placeholderRegex, `"${cssEscaped}"`);
    writeFileSync(filePath, patched, 'utf8');
    totalReplacements += matches.length;
    console.log(`[inject-css] CSS injetado em dist/${rel} (${(css.length / 1024).toFixed(1)} KB, ${matches.length} ocorrência(s)).`);
}

if (totalReplacements === 0) {
    console.error(`[inject-css] placeholder "${PLACEHOLDER}" não encontrado em nenhum arquivo de dist/ — injeção abortada.`);
    process.exit(1);
}
