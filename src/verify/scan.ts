import fs from 'node:fs';
import path from 'node:path';
import { declaredSarakVars, findSarakVarReferences } from './detect/cssVars';
import { literalKindOf, scanCssDeclarations } from './detect/literals';
import { findLibDeclarations, isPinnedToTag, readKitHash } from './detect/manifest';
import { findInternalClassSelectors } from './detect/selectors';
import { loadVerificationData } from './data';
import { matchesAny, relativeTo, toPosix } from './glob';
import { internalSelectorMessage, literalMessage, unknownCssVarMessage } from './messages';
import type { Finding, Severity, VerificationData } from './types';

/**
 * A porta de COMANDO do kit: o que o ESLint do importador não lê (`.css`, `package.json`, o carimbo do
 * kit). Os detectores são os mesmos do plugin — só muda de onde o texto vem.
 */
export interface RuleSetting {
    severity: Severity;
    options: Record<string, unknown>;
}

export interface ScanInput {
    root: string;
    settings: ReadonlyMap<string, RuleSetting>;
    exclude: string[];
}

const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo', '.vite', '.pnpm-store']);
const DEFAULT_KIT_COPY = 'sarak-ui/VERSION';
const INSTALLED_KIT = 'node_modules/@sarak/lib-ui-core/sarak-ui/VERSION';

const listOption = (setting: RuleSetting, key: string): string[] =>
    Array.isArray(setting.options[key]) ? (setting.options[key] as string[]) : [];

const collectFiles = (root: string, exclude: string[]): string[] => {
    const found: string[] = [];
    const visit = (directory: string): void => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const full = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                if (!SKIPPED_DIRECTORIES.has(entry.name)) visit(full);
                continue;
            }
            if (entry.isFile() && (entry.name.endsWith('.css') || entry.name === 'package.json')) found.push(full);
        }
    };
    visit(root);
    return found.map((file) => relativeTo(root, file)).filter((file) => !matchesAny(exclude, file)).sort();
};

type Report = (ruleId: string, line: number, message: string) => void;

const cssFindings = (text: string, file: string, input: ScanInput, data: VerificationData, report: Report): void => {
    const { settings } = input;
    const vars = settings.get('known-css-var');
    if (vars) {
        const declared = declaredSarakVars(text);
        for (const reference of findSarakVarReferences(text)) {
            const known = data.cssVars.has(reference.name) || declared.has(reference.name) || listOption(vars, 'ignore').includes(reference.name);
            if (!known) report('known-css-var', reference.line, unknownCssVarMessage(reference.name, data));
        }
    }
    const literals = settings.get('no-literal-color-font');
    if (literals && !matchesAny(listOption(literals, 'allow'), file)) {
        for (const declaration of scanCssDeclarations(text)) {
            const kind = literalKindOf(declaration.property, declaration.value);
            if (kind) report('no-literal-color-font', declaration.line, literalMessage(kind, declaration.property));
        }
    }
    if (settings.has('no-internal-class-selector')) {
        for (const hit of findInternalClassSelectors(text)) report('no-internal-class-selector', hit.line, internalSelectorMessage(hit.selector));
    }
};

const manifestFindings = (text: string, file: string, input: ScanInput, data: VerificationData, report: Report): void => {
    const entry = input.settings.get('single-entrypoint');
    const pinned = input.settings.get('pinned-install');
    for (const declaration of findLibDeclarations(text, data.libName)) {
        const allow = entry ? listOption(entry, 'allow') : [];
        if (entry && allow.length > 0 && !matchesAny(allow, file)) {
            report('single-entrypoint', declaration.line, `Este \`package.json\` declara \`${data.libName}\` em \`${declaration.section}\`, fora da porta única (${allow.map((glob) => `\`${glob}\``).join(', ')}): declare a lib só lá.`);
        }
        if (pinned && !matchesAny(listOption(pinned, 'allow'), file) && !isPinnedToTag(declaration.spec)) {
            report('pinned-install', declaration.line, `\`${declaration.spec}\` não fixa a tag exata: instale por \`github:<org>/<repo>#vX.Y.Z\` (\`file:\` só serve para iterar localmente).`);
        }
    }
};

const readIfExists = (file: string): string | undefined => (fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : undefined);

/** Sobe a partir da raiz procurando o kit do pacote instalado (monorepo: o `node_modules` pode estar acima). */
const findInstalledKit = (root: string, relative: string): string | undefined => {
    let current = path.resolve(root);
    for (;;) {
        const candidate = path.join(current, relative);
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(current);
        if (parent === current) return undefined;
        current = parent;
    }
};

const kitSyncFindings = (input: ScanInput): Finding[] => {
    const setting = input.settings.get('kit-in-sync');
    if (!setting) return [];
    const copyRelative = typeof setting.options.copy === 'string' ? setting.options.copy : DEFAULT_KIT_COPY;
    const copy = readIfExists(path.join(input.root, copyRelative));
    if (copy === undefined) return [];
    const installedRelative = typeof setting.options.installed === 'string' ? setting.options.installed : INSTALLED_KIT;
    const installedFile = findInstalledKit(input.root, installedRelative);
    const where = toPosix(copyRelative);
    const finding = (message: string): Finding[] => [{ ruleId: 'kit-in-sync', severity: setting.severity, file: where, line: 1, message }];
    if (!installedFile) {
        return finding(`Não achei o kit do pacote instalado (\`${installedRelative}\`) para conferir \`${where}\`: informe o caminho na opção \`installed\`.`);
    }
    if (readKitHash(copy) === readKitHash(fs.readFileSync(installedFile, 'utf-8'))) return [];
    return finding(`A cópia do kit (\`${where}\`) está velha em relação ao pacote instalado: rode \`npx sarak-ui refresh\`.`);
};

/** Roda as regras do comando sobre a árvore do importador. Os achados voltam ordenados por arquivo e linha. */
export const scanProject = (input: ScanInput): Finding[] => {
    const data = loadVerificationData();
    const findings: Finding[] = [];
    for (const file of collectFiles(input.root, input.exclude)) {
        const text = fs.readFileSync(path.join(input.root, file), 'utf-8');
        const report: Report = (ruleId, line, message) =>
            findings.push({ ruleId, severity: input.settings.get(ruleId)?.severity ?? 'warn', file, line, message });
        if (file.endsWith('.css')) cssFindings(text, file, input, data, report);
        else manifestFindings(text, file, input, data, report);
    }
    findings.push(...kitSyncFindings(input));
    return findings.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line);
};
