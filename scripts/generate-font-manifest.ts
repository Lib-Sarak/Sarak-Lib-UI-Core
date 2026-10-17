// Gera `src/core/Provider/generated/font-manifest.ts` — o espelho em JS do `dist/fonts/manifest.json` que o
// carregador de fontes lê em runtime. Mesma fonte do `embed-fonts.ts` (`THEME_FONTS` → pacotes Fontsource), nenhuma
// lista à mão. `--check` compara byte a byte e roda no `build` ANTES do `build:js` (o módulo entra no bundle).
//
// Uso: `npx tsx scripts/generate-font-manifest.ts [--check] [--modules <dir>]` (padrão: `node_modules`).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listLoadableFamilies } from '../src/core/Provider/utils/googleFontsUrl';
import { buildManifest } from './embed-fonts';
import { resolveFont } from './fonts/fontPackages';
import { readUnicodeRanges, renderFontManifestModule, toRuntimeFamilies } from './fonts/runtimeManifest';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const FONT_MANIFEST_MODULE = path.join(ROOT, 'src', 'core', 'Provider', 'generated', 'font-manifest.ts');

export function buildFontManifestModule(modulesDir: string, families: string[] = listLoadableFamilies()): string {
    const { families: entries } = buildManifest(families.map((family) => resolveFont(family, modulesDir)));
    return renderFontManifestModule(toRuntimeFamilies(entries), readUnicodeRanges(entries, modulesDir));
}

function main(): void {
    const at = process.argv.indexOf('--modules');
    const modulesDir = at !== -1 && process.argv[at + 1] ? path.resolve(process.argv[at + 1]) : path.join(ROOT, 'node_modules');
    const expected = buildFontManifestModule(modulesDir);
    const relative = path.relative(ROOT, FONT_MANIFEST_MODULE);
    if (!process.argv.includes('--check')) {
        fs.writeFileSync(FONT_MANIFEST_MODULE, expected, 'utf8');
        console.log(`[font-manifest] ${relative} gerado.`);
        return;
    }
    const current = fs.existsSync(FONT_MANIFEST_MODULE) ? fs.readFileSync(FONT_MANIFEST_MODULE, 'utf8') : null;
    if (current !== expected) {
        console.error(`❌ ${relative} defasado — rode "npm run fonts:manifest".`);
        process.exit(1);
    }
    console.log(`✅ ${relative} em dia.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
