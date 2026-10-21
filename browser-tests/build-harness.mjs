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
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST_INDEX = path.join(ROOT, 'dist', 'index.js');
const DIST_CSS = path.join(ROOT, 'dist', 'sarak.css');
const DIST_SCOPED_CSS = path.join(ROOT, 'dist', 'sarak-scoped.css');
const ENTRY = path.join(HERE, 'fixtures', 'harness-entry.tsx');
const require = createRequire(path.join(ROOT, 'package.json'));
const THEME_CHUNK_IMPORT_PATTERN = /("neo-brutalism":\(\)=>)import\((["'])(\.\/neo-brutalism-[^"']+\.js)\2\)\.then\(([^)]*)\)/;

function gateNeoBrutalismThemeImport(source) {
    return source.replace(THEME_CHUNK_IMPORT_PATTERN, (matchedImport) => {
        const captures = THEME_CHUNK_IMPORT_PATTERN.exec(matchedImport);
        if (!captures) return matchedImport;

        const [, loaderPrefix, quote, themeChunk, selectTheme] = captures;
        const importExpression = `import(${quote}${themeChunk}${quote}).then(${selectTheme})`;
        return `${loaderPrefix}globalThis.__SARAK_TEST_THEME_IMPORT_GATE__ ? globalThis.__SARAK_TEST_THEME_IMPORT_GATE__('neo-brutalism', () => ${importExpression}) : ${importExpression}`;
    });
}

function resolveLocalFile(specifier, resolveDir) {
    const basePath = path.resolve(resolveDir, specifier);
    const candidates = [
        basePath,
        ...['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.css'].map((extension) => `${basePath}${extension}`),
        ...['index.js', 'index.jsx', 'index.mjs', 'index.cjs', 'index.ts', 'index.tsx', 'index.css'].map((fileName) => path.join(basePath, fileName)),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

const workspaceResolver = {
    name: 'workspace-file-resolution',
    setup(buildApi) {
        buildApi.onResolve({ filter: /.*/ }, (args) => {
            let resolvedPath;

            if (args.path.endsWith('.css')) {
                return { path: args.path, namespace: 'empty-css' };
            }

            if (['node:path', 'path', 'node:process', 'process', 'node:url', 'url'].includes(args.path)) {
                return { path: args.path, namespace: 'browser-node-builtin' };
            }

            if (args.path === '@emotion/is-prop-valid') {
                return { path: args.path, namespace: 'empty-optional-dependency' };
            }

            if (args.path === '@sarak/lib-ui-core') {
                resolvedPath = DIST_INDEX;
            } else if (args.path.startsWith('.')) {
                resolvedPath = resolveLocalFile(args.path, args.resolveDir || ROOT);
            } else {
                try {
                    const importerRequire = args.importer ? createRequire(args.importer) : require;
                    resolvedPath = importerRequire.resolve(args.path, { paths: [args.resolveDir || ROOT, ROOT] });
                } catch {
                    return undefined;
                }
            }

            return resolvedPath ? { path: resolvedPath, namespace: 'workspace-file' } : undefined;
        });

        buildApi.onLoad({ filter: /.*/, namespace: 'workspace-file' }, (args) => {
            const extension = path.extname(args.path).toLowerCase();
            const loader = extension === '.tsx' ? 'tsx' : extension === '.ts' ? 'ts' : extension === '.json' ? 'json' : extension === '.css' ? 'css' : 'js';

            return {
                contents: gateNeoBrutalismThemeImport(fs.readFileSync(args.path, 'utf8')),
                loader,
                resolveDir: path.dirname(args.path),
            };
        });

        buildApi.onLoad({ filter: /.*/, namespace: 'empty-css' }, () => ({ contents: '', loader: 'css' }));

        buildApi.onLoad({ filter: /.*/, namespace: 'browser-node-builtin' }, (args) => {
            if (args.path === 'node:url' || args.path === 'url') {
                return { contents: 'export const fileURLToPath = (value) => value?.href ?? String(value); export default { fileURLToPath };', loader: 'js' };
            }

            return { contents: 'export default {};', loader: 'js' };
        });

        buildApi.onLoad({ filter: /.*/, namespace: 'empty-optional-dependency' }, () => ({ contents: 'export default undefined;', loader: 'js' }));
    },
};

const HTML_TEMPLATE = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
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

    try {
        await build({
            stdin: {
                contents: fs.readFileSync(entryPath, 'utf8'),
                resolveDir: path.dirname(entryPath),
                sourcefile: entryPath,
                loader: 'tsx',
            },
            outfile: bundlePath,
            bundle: true,
            format: 'iife',
            platform: 'browser',
            jsx: 'automatic',
            plugins: [workspaceResolver],
            logLevel: 'silent',
        });

        fs.copyFileSync(DIST_CSS, path.join(outDir, 'sarak.css'));
        // A folha do Modo Embarcado (`?css=escopado` no harness): a medição do escopo precisa dela, não da global.
        if (fs.existsSync(DIST_SCOPED_CSS)) fs.copyFileSync(DIST_SCOPED_CSS, path.join(outDir, 'sarak-scoped.css'));
        const htmlPath = path.join(outDir, 'index.html');
        fs.writeFileSync(htmlPath, HTML_TEMPLATE, 'utf8');

        return { outDir, htmlPath };
    } catch (error) {
        fs.rmSync(outDir, { recursive: true, force: true });
        throw error;
    }
}
