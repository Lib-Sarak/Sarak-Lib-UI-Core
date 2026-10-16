// Resolve cada família de `THEME_FONTS` para o pacote Fontsource que a entrega e para os arquivos woff2 que a lib
// embarca. A convenção do pacote (`metadata.json`) manda; não há tabela escrita à mão família → pacote.
//
// Convenção: o `id` do pacote é o nome da família em minúsculas com hífen (`Source Sans 3` → `source-sans-3`), e
// `metadata.family` tem de repetir o nome pedido (trava contra um pacote que só se pareça). Variável antes de estática.
//
// Decisão registrada (eixos e pesos):
//  - Variável: só o arquivo `latin-wght-normal`. Os eixos `opsz`, `wdth`, `SOFT` e `WONK` (Inter, Merriweather,
//    Source Serif 4, DM Sans, Fraunces…) e o itálico ficam de fora de propósito, pelo orçamento do pacote.
//  - Estática: só os pesos que o pacote tem E que o painel/os temas usam (`PANEL_WEIGHTS`). Peso sem arquivo o
//    navegador sintetiza; o manifesto nunca declara um peso que o pacote não contém.
//  - Subconjunto: só `latin`. O campo `subsets` do manifesto fica aberto para `latin-ext` entrar depois sem MAJOR.
import fs from 'node:fs';
import path from 'node:path';

export const SUBSET = 'latin';
export const VARIABLE_PREFIX = '@fontsource-variable';
export const STATIC_PREFIX = '@fontsource';

/** Pesos que o painel oferece (H1/H2 300–900, corpo 300–500) e que os temas embarcados usam. */
export const PANEL_WEIGHTS: readonly number[] = [300, 400, 500, 600, 700, 800, 900];

/** Corta o crédito no primeiro nome de arquivo de origem (`Lato-Light.ttf:`), que o pacote repete por arquivo. */
const SOURCE_FILE_MARK = /\s\S+\.(?:ttf|otf):/;

export interface FontFileEntry {
    file: string;
    subset: string;
    style: 'normal';
    /** Peso numérico (estática) ou faixa CSS `"min max"` (variável). */
    weight: number | string;
    bytes: number;
}

export interface FontLicense {
    /** Identificador SPDX do `package.json` do pacote. */
    type: string;
    /** Crédito do titular, do `metadata.json` do pacote. */
    notice: string;
}

export interface FontEntry {
    package: string;
    version: string;
    variable: boolean;
    subsets: string[];
    /** Eixos embarcados; só `wght` nas variáveis, vazio nas estáticas. */
    axes: Record<string, { min: number; max: number }>;
    /** Pesos nativos embarcados nas estáticas; vazio nas variáveis (a faixa está em `axes.wght`). */
    weights: number[];
    files: FontFileEntry[];
    license: FontLicense;
}

export interface ResolvedFont {
    family: string;
    entry: FontEntry;
    /** Arquivos a copiar: caminho de origem absoluto + nome final em `fonts/`. */
    sources: { from: string; file: string }[];
    /** Texto integral do `LICENSE` do pacote. */
    licenseText: string;
}

interface PackageMetadata {
    family: string;
    weights: number[];
    variable: false | Record<string, { min: string; max: string }>;
    license: { attribution: string };
}

export function packageSlug(family: string): string {
    return family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function readJson<T>(file: string): T {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function readPackage(modulesDir: string, prefix: string, family: string): { dir: string; metadata: PackageMetadata } | null {
    const dir = path.join(modulesDir, prefix, packageSlug(family));
    const metadataFile = path.join(dir, 'metadata.json');
    if (!fs.existsSync(metadataFile)) return null;
    const metadata = readJson<PackageMetadata>(metadataFile);
    if (metadata.family !== family) {
        throw new Error(`[fonts] ${dir} declara a família "${metadata.family}", não "${family}".`);
    }
    return { dir, metadata };
}

function requireFile(file: string, family: string): number {
    if (!fs.existsSync(file)) throw new Error(`[fonts] ${family}: arquivo esperado não existe — ${file}`);
    return fs.statSync(file).size;
}

function buildLicense(dir: string, metadata: PackageMetadata): { license: FontLicense; text: string } {
    const pkg = readJson<{ license: string }>(path.join(dir, 'package.json'));
    const notice = metadata.license.attribution.split(SOURCE_FILE_MARK)[0].trim();
    return { license: { type: pkg.license, notice }, text: fs.readFileSync(path.join(dir, 'LICENSE'), 'utf8') };
}

function resolveVariable(family: string, found: { dir: string; metadata: PackageMetadata }): ResolvedFont {
    const { dir, metadata } = found;
    const wght = metadata.variable && metadata.variable.wght;
    if (!wght) throw new Error(`[fonts] ${family}: o pacote variável não tem o eixo wght.`);
    const slug = packageSlug(family);
    const file = `${slug}-${SUBSET}-wght-normal.woff2`;
    const from = path.join(dir, 'files', file);
    const bytes = requireFile(from, family);
    const range = { min: Number(wght.min), max: Number(wght.max) };
    const { license, text } = buildLicense(dir, metadata);
    const entry: FontEntry = {
        package: `${VARIABLE_PREFIX}/${slug}`,
        version: readJson<{ version: string }>(path.join(dir, 'package.json')).version,
        variable: true,
        subsets: [SUBSET],
        axes: { wght: range },
        weights: [],
        files: [{ file, subset: SUBSET, style: 'normal', weight: `${range.min} ${range.max}`, bytes }],
        license,
    };
    return { family, entry, sources: [{ from, file }], licenseText: text };
}

function resolveStatic(family: string, found: { dir: string; metadata: PackageMetadata }): ResolvedFont {
    const { dir, metadata } = found;
    const slug = packageSlug(family);
    const weights = metadata.weights.filter((weight) => PANEL_WEIGHTS.includes(weight)).sort((a, b) => a - b);
    if (weights.length === 0) throw new Error(`[fonts] ${family}: nenhum peso nativo entre os que o painel usa.`);
    const files: FontFileEntry[] = [];
    const sources: ResolvedFont['sources'] = [];
    for (const weight of weights) {
        const file = `${slug}-${SUBSET}-${weight}-normal.woff2`;
        const from = path.join(dir, 'files', file);
        files.push({ file, subset: SUBSET, style: 'normal', weight, bytes: requireFile(from, family) });
        sources.push({ from, file });
    }
    const { license, text } = buildLicense(dir, metadata);
    const entry: FontEntry = {
        package: `${STATIC_PREFIX}/${slug}`,
        version: readJson<{ version: string }>(path.join(dir, 'package.json')).version,
        variable: false,
        subsets: [SUBSET],
        axes: {},
        weights,
        files,
        license,
    };
    return { family, entry, sources, licenseText: text };
}

export function resolveFont(family: string, modulesDir: string): ResolvedFont {
    const variable = readPackage(modulesDir, VARIABLE_PREFIX, family);
    if (variable) return resolveVariable(family, variable);
    const statics = readPackage(modulesDir, STATIC_PREFIX, family);
    if (statics) return resolveStatic(family, statics);
    throw new Error(`[fonts] ${family}: nenhum pacote @fontsource* instalado em ${modulesDir}.`);
}
