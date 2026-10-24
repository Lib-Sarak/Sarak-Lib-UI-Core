// Mede o BOOT do consumidor — o que um app mínimo (`SarakUIProvider` + um nó)
// carrega por `import` estático antes do primeiro quadro, empacotado como um
// consumidor empacota (esbuild: `splitting`, `minify`, ESM), e confere o teto de
// peso do tema sob demanda:
//
//   1. RELATIVO — o boot da lib como está (`src/index.ts`) cabe em: o boot da MESMA
//      lib com só o tema padrão e sem catálogo (a referência, medida NESTA execução,
//      com os loaders e o catálogo trocados por vazios) + o catálogo leve gzipado
//      + 3 KB de folga. O teto acompanha o resto da lib: nenhum número congelado.
//   2. ESTRUTURAL — nenhum módulo de tema ≠ padrão (nem `all.ts`) entre os inputs
//      dos pedaços do fecho estático, lidos do `metafile` do bundler do consumidor.
//   3. POR TEMA — cada tema, empacotado sozinho e gzipado, ≤ 15 KB.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este script NÃO vê
// -------------------------------------------------------------------------
// 1. Mede o FONTE (`src/`), não o `dist/`: o `dist/` é artefato do `npm run build`,
//    e o delta de tema nele é coberto pela trava estrutural do `dist`
//    (`check-theme-boot-closure.mjs --dist`). Com `--dist` este script só IMPRIME o
//    boot do artefato, para o revisor comparar — não o julga.
// 2. O teto relativo tem 3 KB de folga (decisão do dono): com temas de ~6 KB gzip,
//    UM tema que volte ao boot passa dessa folga. A trava estrutural continua sendo
//    a que acende primeiro.
// 3. Um bundler que não seja o esbuild (Vite/Rollup, webpack) pode dividir de outro
//    jeito; os números absolutos mudam, a ESTRUTURA (quem está no fecho) não.
// 4. Não executa o app: mede o que é carregado, não o que o navegador pinta.
// -------------------------------------------------------------------------
import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import { build } from 'esbuild';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THEMES_DIR = 'src/core/Design/presets/themes';
export const SLACK_BYTES = 3 * 1024;
// Decisão do dono: 15 KB aceita tema sob demanda, quase nunca trocado e sem custo no uso;
// conteúdo pesado fica em arquivo próprio. Nova alta exige medição e decisão; acima, enxugue.
export const PER_THEME_CEILING_BYTES = 15 * 1024;

const gzipSize = (content) => zlib.gzipSync(content, { level: 9 }).length;
const toPosix = (file) => file.split(path.sep).join('/');

const CONSUMER_ENTRY = (indexPath) => `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from ${JSON.stringify(indexPath)};
createRoot(document.getElementById('r')).render(React.createElement(SarakUIProvider, null, 'oi'));
`;

/** O fecho `import-statement` do entry no `metafile`, com raw/gzip por pedaço e os inputs. */
export function bootClosure(metafile, outputFiles, root) {
  // As chaves do `metafile` são relativas ao `absWorkingDir` (a raiz).
  const contents = new Map(outputFiles.map((file) => [toPosix(path.relative(root, file.path)), file.contents]));
  // Os pedaços de `import()` também levam `entryPoint`; o do app mínimo é o do `stdin`.
  const entryKey = Object.keys(metafile.outputs).find((key) => metafile.outputs[key].entryPoint === '<stdin>');
  const seen = new Set();
  const queue = [entryKey];
  while (queue.length > 0) {
    const key = queue.pop();
    if (seen.has(key)) continue;
    seen.add(key);
    metafile.outputs[key].imports
      .filter((imported) => imported.kind === 'import-statement' && metafile.outputs[imported.path])
      .forEach((imported) => queue.push(imported.path));
  }
  let raw = 0;
  let gzip = 0;
  const inputs = new Set();
  seen.forEach((key) => {
    const content = contents.get(key);
    if (content) { raw += content.length; gzip += gzipSize(content); }
    Object.keys(metafile.outputs[key].inputs).forEach((input) => inputs.add(input));
  });
  return { raw, gzip, inputs: [...inputs], chunks: seen.size };
}

/** Plugin que troca um módulo por um conteúdo fixo — é como a referência "só o padrão, sem catálogo" nasce. */
const stubModules = (stubs) => ({
  name: 'stub-theme-modules',
  setup(b) {
    b.onLoad({ filter: /\.ts$/ }, (args) => {
      const rel = toPosix(path.relative(ROOT, args.path));
      return rel in stubs ? { contents: stubs[rel], loader: 'ts' } : null;
    });
  },
});

async function bundleBoot({ root, indexPath, stubs = {} }) {
  const outdir = path.join(os.tmpdir(), 'sarak-measure-boot-out');
  const result = await build({
    stdin: { contents: CONSUMER_ENTRY(indexPath), resolveDir: root, loader: 'js' },
    absWorkingDir: root,
    nodePaths: [path.join(root, 'node_modules')],
    bundle: true,
    write: false,
    outdir,
    splitting: true,
    format: 'esm',
    minify: true,
    metafile: true,
    jsx: 'automatic',
    platform: 'browser',
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [stubModules(stubs)],
  });
  return bootClosure(result.metafile, result.outputFiles, root);
}

/** Ids e tema padrão lidos do fonte (a mesma fonte do gate estrutural). */
function readIds(root) {
  const text = fs.readFileSync(path.join(root, THEMES_DIR, 'index.ts'), 'utf8');
  const ids = [...text.match(/SARAK_THEME_PRESET_IDS = \[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const defaultId = text.match(/SARAK_DEFAULT_THEME_ID = '([^']+)'/)[1];
  return { ids, defaultId };
}

/** Quais módulos de tema (≠ padrão) ou `all.ts` aparecem nos inputs do fecho. */
export function themeInputsInBoot(inputs, ids, defaultId) {
  return inputs.filter((input) => {
    const rel = toPosix(input);
    if (!rel.includes(`${THEMES_DIR}/`)) return false;
    const base = rel.slice(rel.indexOf(`${THEMES_DIR}/`) + THEMES_DIR.length + 1).replace(/\.tsx?$/, '');
    return base === 'all' || (ids.includes(base) && base !== defaultId);
  });
}

/** O teto relativo: referência + catálogo + folga. */
export const relativeCeiling = ({ referenceGzip, catalogGzip, slack = SLACK_BYTES }) => referenceGzip + catalogGzip + slack;

export async function measureThemeWeights({ root = ROOT } = {}) {
  const { ids } = readIds(root);
  const rows = [];
  for (const id of ids) {
    const result = await build({
      entryPoints: [path.join(root, THEMES_DIR, `${id}.ts`)],
      bundle: true, write: false, format: 'esm', minify: true, logLevel: 'silent', outdir: os.tmpdir(),
    });
    rows.push({ id, gzip: gzipSize(result.outputFiles[0].contents) });
  }
  return rows;
}

export async function measure({ root = ROOT } = {}) {
  const { ids, defaultId } = readIds(root);
  const catalogSource = fs.readFileSync(path.join(root, THEMES_DIR, 'catalog.generated.ts'), 'utf8');
  const catalogGzip = gzipSize(Buffer.from(catalogSource.replace(/^\/\/.*$/gm, '')));
  const src = toPosix(path.join(root, 'src/index.ts'));
  const actual = await bundleBoot({ root, indexPath: src });
  const reference = await bundleBoot({
    root, indexPath: src,
    stubs: {
      [`${THEMES_DIR}/loaders.ts`]: 'export const SARAK_THEME_LOADERS = {};',
      [`${THEMES_DIR}/catalog.generated.ts`]: 'export const SARAK_THEME_CATALOG = [];',
    },
  });
  const ceiling = relativeCeiling({ referenceGzip: reference.gzip, catalogGzip });
  return {
    actual, reference, catalogGzip, ceiling,
    leaks: themeInputsInBoot(actual.inputs, ids, defaultId),
  };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  console.log('--- measure-consumer-boot ---');
  const problems = [];
  const result = await measure();
  console.log(`boot (src, só o tema padrão + catálogo): ${kb(result.actual.gzip)} gzip / ${kb(result.actual.raw)} raw (${result.actual.chunks} pedaço(s))`);
  console.log(`referência (só o padrão, sem catálogo):  ${kb(result.reference.gzip)} gzip`);
  console.log(`catálogo leve:                           ${kb(result.catalogGzip)} gzip`);
  console.log(`teto relativo (ref + catálogo + 3 KB):   ${kb(result.ceiling)} gzip`);
  if (result.actual.gzip > result.ceiling) {
    problems.push(`boot ${kb(result.actual.gzip)} gzip acima do teto relativo ${kb(result.ceiling)} — algo pesado voltou ao boot.`);
  }
  result.leaks.forEach((leak) => problems.push(`o fecho estático do consumidor contém ${leak}.`));

  const weights = await measureThemeWeights();
  weights.forEach(({ id, gzip }) => {
    if (gzip > PER_THEME_CEILING_BYTES) problems.push(`tema "${id}" pesa ${kb(gzip)} gzip, acima de ${kb(PER_THEME_CEILING_BYTES)}.`);
  });
  const heaviest = weights.reduce((a, b) => (b.gzip > a.gzip ? b : a));
  console.log(`maior tema: ${heaviest.id} — ${kb(heaviest.gzip)} gzip (teto ${kb(PER_THEME_CEILING_BYTES)})`);

  if (problems.length === 0) {
    console.log('[OK] boot do consumidor dentro do teto; nenhum tema fora do padrão no fecho estático.');
    return 0;
  }
  console.log('[ERROR]');
  problems.forEach((problem) => console.log(`  - ${problem}`));
  return 1;
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main().then((code) => process.exit(code));
