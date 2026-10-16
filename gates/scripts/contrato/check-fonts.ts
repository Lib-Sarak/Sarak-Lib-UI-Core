// Fontes embarcadas — toda família que o painel oferece (`THEME_FONTS`, menos a do sistema) tem arquivo no manifesto
// de `dist/fonts/`, crédito e texto de licença no `THIRD-PARTY-FONTS`; todo arquivo do manifesto existe em disco; o
// peso das fontes cabe no orçamento. Sem este gate, uma família nasce no painel sem arquivo (cai na fonte de reserva
// em silêncio), um woff2 some do pacote sem ninguém ver, ou a licença deixa de viajar com a fonte.
//
// Roda DEPOIS do `build:js` e do `fonts:embed` (que criam `dist/fonts/`), por isso entra no `build`, e não antes dele.
//
// Uso: `npx tsx gates/scripts/contrato/check-fonts.ts [--dir <dist/fonts>]`.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: a lista `THEME_FONTS` contra `fonts/manifest.json`, os `.woff2` em `fonts/` e o `THIRD-PARTY-FONTS`.
//    Não vê o carregador em runtime (lote seguinte), nem o `@font-face` que ele gera, nem a rede do consumidor.
// 2. Confere PRESENÇA e TAMANHO, não CONTEÚDO: que o arquivo existe, não está vazio e soma dentro do orçamento. NÃO
//    prova que o woff2 é uma fonte válida nem que é a família certa — um arquivo errado de bom tamanho passa.
// 3. A licença é conferida por FORMA: seção da família no `THIRD-PARTY-FONTS` com o crédito do manifesto e corpo de
//    pelo menos `LICENSE_MIN_CHARS` caracteres. NÃO prova que o texto é a licença certa do pacote.
// 4. Orçamento: soma dos `.woff2` que ESTÃO em disco (um arquivo órfão também pesa) e, por família, a soma dos
//    arquivos do manifesto. Sem exceção por família: se uma precisar, a exceção entra aqui, justificada, não em silêncio.
// 5. NÃO confere eixos nem pesos declarados contra o `metadata.json` do pacote (isso é do passo de cópia).
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listLoadableFamilies } from '../../../src/core/Provider/utils/googleFontsUrl';
import { MANIFEST_FILE, type FontManifest } from '../../../scripts/embed-fonts';
import { THIRD_PARTY_FILE, parseThirdPartyFonts } from '../../../scripts/fonts/thirdPartyFonts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DEFAULT_DIR = path.join(ROOT, 'dist', 'fonts');

/** Orçamento do pacote (decisão do dono, 3 MB decimais) e teto por família (ponto de partida da plan). */
export const TOTAL_BUDGET_BYTES = 3_000_000;
export const FAMILY_BUDGET_BYTES = 150_000;
export const LICENSE_MIN_CHARS = 200;

export type FontViolationCode =
    | 'manifest-missing'
    | 'family-missing'
    | 'family-extra'
    | 'file-missing'
    | 'file-empty'
    | 'file-orphan'
    | 'license-missing'
    | 'family-over-budget'
    | 'total-over-budget';

export interface FontViolation {
    code: FontViolationCode;
    family?: string;
    detail: string;
}

export interface FontsSnapshot {
    /** Famílias que o painel oferece e dependem de arquivo. */
    families: string[];
    /** `null` quando o manifesto não existe. */
    manifest: FontManifest | null;
    /** Texto do `THIRD-PARTY-FONTS`; `''` quando ausente. */
    thirdParty: string;
    /** Tamanho em bytes de cada `.woff2` em disco, por nome de arquivo. */
    diskFiles: Record<string, number>;
}

export interface FontsBudget {
    totalBytes: number;
    familyBytes: number;
}

const DEFAULT_BUDGET: FontsBudget = { totalBytes: TOTAL_BUDGET_BYTES, familyBytes: FAMILY_BUDGET_BYTES };

function checkCoverage(snapshot: FontsSnapshot, manifest: FontManifest): FontViolation[] {
    const violations: FontViolation[] = [];
    for (const family of snapshot.families) {
        if (!manifest.families[family]) {
            violations.push({ code: 'family-missing', family, detail: `${family} está em THEME_FONTS e não no manifesto` });
        }
    }
    for (const family of Object.keys(manifest.families)) {
        if (!snapshot.families.includes(family)) {
            violations.push({ code: 'family-extra', family, detail: `${family} está no manifesto e não em THEME_FONTS` });
        }
    }
    return violations;
}

function checkFiles(snapshot: FontsSnapshot, manifest: FontManifest): FontViolation[] {
    const violations: FontViolation[] = [];
    const listed = new Set<string>();
    for (const [family, entry] of Object.entries(manifest.families)) {
        for (const { file } of entry.files) {
            listed.add(file);
            const bytes = snapshot.diskFiles[file];
            if (bytes === undefined) violations.push({ code: 'file-missing', family, detail: `${file} está no manifesto e não em fonts/` });
            else if (bytes === 0) violations.push({ code: 'file-empty', family, detail: `${file} está vazio` });
        }
    }
    for (const file of Object.keys(snapshot.diskFiles)) {
        if (!listed.has(file)) violations.push({ code: 'file-orphan', detail: `${file} está em fonts/ e não no manifesto` });
    }
    return violations;
}

function checkLicenses(snapshot: FontsSnapshot, manifest: FontManifest): FontViolation[] {
    const sections = parseThirdPartyFonts(snapshot.thirdParty);
    const violations: FontViolation[] = [];
    for (const [family, entry] of Object.entries(manifest.families)) {
        const body = sections.get(family);
        if (!entry.license.type || !entry.license.notice) {
            violations.push({ code: 'license-missing', family, detail: `${family}: licença ou crédito ausente no manifesto` });
        } else if (body === undefined || body.length < LICENSE_MIN_CHARS || !body.includes(entry.license.notice)) {
            violations.push({ code: 'license-missing', family, detail: `${family}: sem crédito e texto de licença no ${THIRD_PARTY_FILE}` });
        }
    }
    return violations;
}

function checkBudget(snapshot: FontsSnapshot, manifest: FontManifest, budget: FontsBudget): FontViolation[] {
    const violations: FontViolation[] = [];
    for (const [family, entry] of Object.entries(manifest.families)) {
        const bytes = entry.files.reduce((sum, { file }) => sum + (snapshot.diskFiles[file] ?? 0), 0);
        if (bytes > budget.familyBytes) {
            violations.push({ code: 'family-over-budget', family, detail: `${family}: ${bytes} B > ${budget.familyBytes} B por família` });
        }
    }
    const total = Object.values(snapshot.diskFiles).reduce((sum, bytes) => sum + bytes, 0);
    if (total > budget.totalBytes) {
        violations.push({ code: 'total-over-budget', detail: `fontes somam ${total} B > ${budget.totalBytes} B` });
    }
    return violations;
}

export function checkFonts(snapshot: FontsSnapshot, budget: FontsBudget = DEFAULT_BUDGET): FontViolation[] {
    const { manifest } = snapshot;
    if (!manifest) return [{ code: 'manifest-missing', detail: `fonts/${MANIFEST_FILE} não existe — rode "npm run fonts:embed"` }];
    return [
        ...checkCoverage(snapshot, manifest),
        ...checkFiles(snapshot, manifest),
        ...checkLicenses(snapshot, manifest),
        ...checkBudget(snapshot, manifest, budget),
    ];
}

function readIfExists(file: string): string | null {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

export function readSnapshot(fontsDir: string = DEFAULT_DIR): FontsSnapshot {
    const manifestText = readIfExists(path.join(fontsDir, MANIFEST_FILE));
    const diskFiles: Record<string, number> = {};
    if (fs.existsSync(fontsDir)) {
        for (const name of fs.readdirSync(fontsDir)) {
            if (name.endsWith('.woff2')) diskFiles[name] = fs.statSync(path.join(fontsDir, name)).size;
        }
    }
    return {
        families: listLoadableFamilies(),
        manifest: manifestText === null ? null : (JSON.parse(manifestText) as FontManifest),
        thirdParty: readIfExists(path.join(fontsDir, THIRD_PARTY_FILE)) ?? '',
        diskFiles,
    };
}

function main(): void {
    console.log('--- fonts:check (fontes embarcadas) ---');
    const at = process.argv.indexOf('--dir');
    const fontsDir = at !== -1 && process.argv[at + 1] ? path.resolve(process.argv[at + 1]) : DEFAULT_DIR;
    const snapshot = readSnapshot(fontsDir);
    const violations = checkFonts(snapshot);
    for (const violation of violations) console.error(`❌ [${violation.code}] ${violation.detail}`);
    if (violations.length > 0) {
        console.error(`\n⛔ ${violations.length} violação(ões) nas fontes embarcadas.`);
        process.exit(1);
    }
    const total = Object.values(snapshot.diskFiles).reduce((sum, bytes) => sum + bytes, 0);
    console.log(`✅ ${snapshot.families.length} famílias com arquivo e licença; ${Object.keys(snapshot.diskFiles).length} woff2, ${total} B de ${TOTAL_BUDGET_BYTES} B.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
