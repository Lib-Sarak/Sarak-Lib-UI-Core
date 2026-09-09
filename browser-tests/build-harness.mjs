/**
 * Empacota o harness (`fixtures/harness-entry.tsx`) num único bundle IIFE autocontido,
 * para o teste de browser (`cromo-css-real.spec.ts`) carregar por `file://`, sem
 * servidor e sem import map — o especificador `@sarak/lib-ui-core` resolve para o
 * `dist/index.js` já BUILDADO (o artefato que o consumidor de verdade instala; este
 * script nunca gera nem edita `dist/`, só o LÊ — se ele não existir, falha cedo com uma
 * mensagem acionável em vez de medir um harness vazio).
 *
 * A saída vai para um diretório TEMPORÁRIO (`fs.mkdtempSync`), nunca para dentro do
 * repositório — não há artefato de build deste harness para `.gitignore` nem para
 * commitar; cada execução do teste gera e descarta o próprio bundle.
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST_INDEX = path.join(ROOT, 'dist', 'index.js');
const DIST_CSS = path.join(ROOT, 'dist', 'sarak.css');
const ENTRY = path.join(HERE, 'fixtures', 'harness-entry.tsx');

const HTML_TEMPLATE = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="./sarak.css" />
</head>
<body>
<div id="root"></div>
<script src="./bundle.js"></script>
</body>
</html>
`;

/** Builda o harness e devolve o caminho do `index.html` gerado, pronto para `file://`. */
export async function buildHarness() {
    for (const required of [DIST_INDEX, DIST_CSS]) {
        if (!fs.existsSync(required)) {
            throw new Error(
                `build-harness: ${path.relative(ROOT, required)} não existe — rode \`npm run build\` antes de medir o cromo.`,
            );
        }
    }

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-cromo-harness-'));
    const bundlePath = path.join(outDir, 'bundle.js');

    await build({
        entryPoints: [ENTRY],
        outfile: bundlePath,
        bundle: true,
        format: 'iife',
        platform: 'browser',
        jsx: 'automatic',
        loader: { '.tsx': 'tsx' },
        alias: { '@sarak/lib-ui-core': DIST_INDEX },
        logLevel: 'silent',
    });

    fs.copyFileSync(DIST_CSS, path.join(outDir, 'sarak.css'));
    const htmlPath = path.join(outDir, 'index.html');
    fs.writeFileSync(htmlPath, HTML_TEMPLATE, 'utf8');

    return { outDir, htmlPath };
}
