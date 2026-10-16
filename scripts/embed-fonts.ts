// Passo de build das fontes embarcadas: copia os woff2 de cada família de `THEME_FONTS` (fonte única — nenhuma lista
// paralela) para `<out>/fonts/` e gera ali o manifesto e o `THIRD-PARTY-FONTS`. Roda DEPOIS do `build:js`, que
// apaga `dist/` (`tsup --clean`). Eixos, pesos e subconjuntos embarcados: ver `scripts/fonts/fontPackages.ts`.
//
// Uso: `npx tsx scripts/embed-fonts.ts [--out <dir>] [--modules <dir>]` (padrão: `dist` e `node_modules`).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listLoadableFamilies } from '../src/core/Provider/utils/googleFontsUrl';
import { resolveFont, type FontEntry, type ResolvedFont } from './fonts/fontPackages';
import { THIRD_PARTY_FILE, buildThirdPartyFonts } from './fonts/thirdPartyFonts';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const FONTS_DIRNAME = 'fonts';
export const MANIFEST_FILE = 'manifest.json';
const MANIFEST_VERSION = 1;

export interface FontManifest {
    version: number;
    families: Record<string, FontEntry>;
}

export interface EmbedOptions {
    outDir: string;
    modulesDir: string;
    families?: string[];
}

export interface EmbedResult {
    fontsDir: string;
    families: number;
    files: number;
    bytes: number;
}

function readFlag(argv: string[], name: string, fallback: string): string {
    const at = argv.indexOf(name);
    return at !== -1 && argv[at + 1] ? path.resolve(argv[at + 1]) : fallback;
}

function copySources(fonts: ResolvedFont[], fontsDir: string): void {
    for (const font of fonts) {
        for (const source of font.sources) fs.copyFileSync(source.from, path.join(fontsDir, source.file));
    }
}

export function buildManifest(fonts: ResolvedFont[]): FontManifest {
    const families: Record<string, FontEntry> = {};
    for (const font of fonts) families[font.family] = font.entry;
    return { version: MANIFEST_VERSION, families };
}

export function embedFonts({ outDir, modulesDir, families = listLoadableFamilies() }: EmbedOptions): EmbedResult {
    const fonts = families.map((family) => resolveFont(family, modulesDir));
    const fontsDir = path.join(outDir, FONTS_DIRNAME);
    fs.rmSync(fontsDir, { recursive: true, force: true });
    fs.mkdirSync(fontsDir, { recursive: true });
    copySources(fonts, fontsDir);
    fs.writeFileSync(path.join(fontsDir, MANIFEST_FILE), `${JSON.stringify(buildManifest(fonts), null, 2)}\n`, 'utf8');
    fs.writeFileSync(path.join(fontsDir, THIRD_PARTY_FILE), buildThirdPartyFonts(fonts), 'utf8');
    const entries = fonts.flatMap((font) => font.entry.files);
    return { fontsDir, families: fonts.length, files: entries.length, bytes: entries.reduce((sum, file) => sum + file.bytes, 0) };
}

function main(): void {
    const outDir = readFlag(process.argv, '--out', path.join(ROOT, 'dist'));
    const modulesDir = readFlag(process.argv, '--modules', path.join(ROOT, 'node_modules'));
    const result = embedFonts({ outDir, modulesDir });
    console.log(`[embed-fonts] ${result.families} famílias, ${result.files} arquivos, ${result.bytes} bytes → ${result.fontsDir}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
