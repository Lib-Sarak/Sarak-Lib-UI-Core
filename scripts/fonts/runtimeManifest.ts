// O espelho em JS do `fonts/manifest.json` que o carregador de runtime lê (o navegador não busca o manifesto).
// Uma função só deriva a forma de runtime a partir das entradas do manifesto: o gerador do módulo e o `fonts:check`
// a usam, então o módulo e o `dist/fonts/manifest.json` não têm como divergir sem o gate ver.
//
// Cada face ganha um `new URL('./fonts/<arquivo>', import.meta.url)` LITERAL: o Vite (dev e build) e o webpack só
// reescrevem o padrão quando o caminho é uma string estática; um template com variável vira `undefined` no
// pré-bundle do Vite em dev.
import fs from 'node:fs';
import path from 'node:path';
import type { FontEntry } from './fontPackages';

export interface RuntimeFace {
    file: string;
    /** Peso numérico (estática) ou faixa `"min max"` (variável), como o `font-weight` do `@font-face`. */
    weight: string;
    subset: string;
}

export interface RuntimeFamily {
    variable: boolean;
    faces: RuntimeFace[];
}

export function toRuntimeFamilies(families: Record<string, FontEntry>): Record<string, RuntimeFamily> {
    const runtime: Record<string, RuntimeFamily> = {};
    for (const [family, entry] of Object.entries(families)) {
        runtime[family] = {
            variable: entry.variable,
            faces: entry.files.map(({ file, weight, subset }) => ({ file, weight: String(weight), subset })),
        };
    }
    return runtime;
}

/** Faixa `unicode-range` de cada subconjunto embarcado, lida do `unicode.json` de cada pacote; pacotes que divergem derrubam. */
export function readUnicodeRanges(families: Record<string, FontEntry>, modulesDir: string): Record<string, string> {
    const ranges: Record<string, string> = {};
    for (const [family, entry] of Object.entries(families)) {
        const table = JSON.parse(fs.readFileSync(path.join(modulesDir, entry.package, 'unicode.json'), 'utf8')) as Record<string, string>;
        for (const subset of entry.subsets) {
            const range = table[subset];
            if (!range) throw new Error(`[fonts] ${family}: o pacote não declara o unicode-range de "${subset}".`);
            if (ranges[subset] && ranges[subset] !== range) {
                throw new Error(`[fonts] ${family}: unicode-range de "${subset}" diverge dos outros pacotes.`);
            }
            ranges[subset] = range;
        }
    }
    return ranges;
}

const HEADER = `// GERADO por \`scripts/generate-font-manifest.ts\` (\`npm run fonts:manifest\`) — não edite à mão.
// Espelho em JS de \`dist/fonts/manifest.json\` (família → faces), lido pelo carregador de fontes em runtime. Cada
// \`url\` é um \`new URL\` literal relativo ao módulo publicado em \`dist/\`, para o bundler do importador enxergá-lo.

export interface BundledFontFace {
    file: string;
    /** Peso numérico (estática) ou faixa \`"min max"\` (variável). */
    weight: string;
    subset: string;
    url: () => URL;
}

export interface BundledFontFamily {
    variable: boolean;
    faces: BundledFontFace[];
}
`;

function renderFace(face: RuntimeFace): string {
    const fields = `file: ${JSON.stringify(face.file)}, weight: ${JSON.stringify(face.weight)}, subset: ${JSON.stringify(face.subset)}`;
    return `{ ${fields}, url: () => new URL(${JSON.stringify(`./fonts/${face.file}`)}, import.meta.url) }`;
}

/** Uma linha por família, com todas as faces dela: o módulo fica abaixo do teto de linhas do auditor (250). */
function renderFamily(family: string, entry: RuntimeFamily): string {
    return `    ${JSON.stringify(family)}: { variable: ${entry.variable}, faces: [${entry.faces.map(renderFace).join(', ')}] },`;
}

export function renderFontManifestModule(families: Record<string, RuntimeFamily>, ranges: Record<string, string>): string {
    const rangeLines = Object.entries(ranges).map(([subset, range]) => `    ${JSON.stringify(subset)}: ${JSON.stringify(range)},`);
    const familyBlocks = Object.entries(families).map(([family, entry]) => renderFamily(family, entry));
    return [
        HEADER,
        'export const BUNDLED_FONT_UNICODE_RANGES: Record<string, string> = {',
        ...rangeLines,
        '};',
        '',
        'export const BUNDLED_FONTS: Record<string, BundledFontFamily> = {',
        ...familyBlocks,
        '};',
        '',
    ].join('\n');
}
