/**
 * Empacota um entry point de harness (`fixtures/harness-entry.tsx` por padrão) num
 * único bundle IIFE autocontido, para um teste de browser (`cromo-css-real.spec.ts`)
 * ou a vitrine de temas (`generate-showcase.mts`) carregarem por `file://`, sem
 * servidor e sem import map — o especificador `@sarak/lib-ui-core` resolve para o
 * `dist/index.js` já BUILDADO (o artefato que o consumidor de verdade instala; este
 * script nunca gera nem edita `dist/`, só o LÊ — se ele não existir, falha cedo com uma
 * mensagem acionável em vez de medir um harness vazio).
 *
 * A saída vai para um diretório TEMPORÁRIO (`fs.mkdtempSync`), nunca para dentro do
 * repositório — não há artefato de build deste harness para `.gitignore` nem para
 * commitar; cada execução gera e descarta o próprio bundle.
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

/**
 * Builda o harness e devolve o caminho do `index.html` gerado, pronto para
 * `file://`. `entryPath` escolhe o entry point (default: `harness-entry.tsx`, o do
 * `cromo-css-real.spec.ts`); a vitrine de temas passa `showcase-entry.tsx`.
 */
export async function buildHarness(entryPath = ENTRY) {
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
        entryPoints: [entryPath],
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
