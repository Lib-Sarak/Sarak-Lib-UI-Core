import fs from 'node:fs';
import path from 'node:path';
import { RULE_CATALOG } from './ruleCatalog';
import { scanProject, type RuleSetting } from './scan';
import type { Finding, Severity } from './types';

/**
 * `sarak-ui verify` — a porta de comando do kit. Liga as regras que o ESLint do importador não lê
 * (`.css`, `package.json`, o carimbo do kit) e roda fora do ESLint, na CI ou num gate próprio.
 * Sem regra ligada ele não faz nada além de dizer quais existem: nenhuma regra nasce ligada.
 */
export interface VerifyCliResult {
    output: string;
    exitCode: number;
}

interface ParsedArgs {
    root: string;
    configFile?: string;
    rules: string[];
    format: 'text' | 'json';
    list: boolean;
    help: boolean;
}

const DEFAULT_CONFIG_FILE = 'sarak-verify.json';
const USAGE = `Uso: npx sarak-ui verify [--rule <regra>[=error|warn]]… [--config <arquivo>] [--root <pasta>] [--format text|json] [--list]

Liga, uma a uma, as regras que o plugin de ESLint não lê (.css, package.json, carimbo do kit).
Sem "--rule" nem arquivo "${DEFAULT_CONFIG_FILE}" na raiz, nenhuma regra roda: use "--list" para ver as que existem.
Saída 1 quando há achado de severidade "error"; 2 em uso inválido.

${DEFAULT_CONFIG_FILE}: { "rules": { "known-css-var": "error", "pinned-install": ["warn", { "allow": ["tools/**"] }] }, "exclude": ["**/vendor/**"] }`;

/** Flags com valor: cada uma grava no `parsed` o argumento seguinte. */
const VALUE_FLAGS: Record<string, (parsed: ParsedArgs, value: string | undefined) => void> = {
    '--root': (parsed, value) => { parsed.root = value ?? '.'; },
    '--config': (parsed, value) => { parsed.configFile = value; },
    '--rule': (parsed, value) => { parsed.rules.push(value ?? ''); },
    '--format': (parsed, value) => { parsed.format = value === 'json' ? 'json' : 'text'; },
};

const parseArgs = (argv: string[]): ParsedArgs => {
    const parsed: ParsedArgs = { root: '.', rules: [], format: 'text', list: false, help: false };
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        parsed.list ||= token === '--list';
        parsed.help ||= token === '--help' || token === '-h';
        const setter = VALUE_FLAGS[token];
        if (setter) setter(parsed, argv[++index]);
    }
    return parsed;
};

const toSetting = (value: unknown, fallback: Severity): RuleSetting | 'off' => {
    const [level, options] = Array.isArray(value) ? value : [value, {}];
    if (level === 'off') return 'off';
    const severity: Severity = level === 'error' || level === 'warn' ? level : fallback;
    return { severity, options: (options ?? {}) as Record<string, unknown> };
};

interface ConfigFile {
    rules?: Record<string, unknown>;
    exclude?: string[];
}

const readConfig = (root: string, configFile: string | undefined): ConfigFile => {
    const file = path.resolve(root, configFile ?? DEFAULT_CONFIG_FILE);
    if (!fs.existsSync(file)) {
        if (configFile) throw new Error(`arquivo de configuração não encontrado: ${file}`);
        return {};
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as ConfigFile;
};

const buildSettings = (args: ParsedArgs, config: ConfigFile): Map<string, RuleSetting> => {
    const requested = new Map<string, unknown>(Object.entries(config.rules ?? {}));
    for (const flag of args.rules) {
        const [id, severity] = flag.split('=');
        requested.set(id, severity ?? 'default');
    }
    const settings = new Map<string, RuleSetting>();
    for (const [id, value] of requested) {
        const info = RULE_CATALOG[id];
        if (!info) throw new Error(`regra desconhecida: "${id}". Veja "sarak-ui verify --list".`);
        if (info.port === 'plugin') throw new Error(`a regra "${id}" roda só no plugin de ESLint (\`@sarak/lib-ui-core/eslint\`), não neste comando.`);
        const setting = toSetting(value, info.severity);
        if (setting !== 'off') settings.set(id, setting);
    }
    return settings;
};

const renderList = (): string =>
    Object.entries(RULE_CATALOG)
        .map(([id, info]) => `${id.padEnd(28)} ${info.port.padEnd(8)} ${info.severity.padEnd(6)} ${info.summary}`)
        .join('\n');

const renderText = (findings: Finding[]): string => {
    if (findings.length === 0) return '[sarak-ui verify] nenhum achado.';
    const lines = findings.map((finding) => `${finding.file}:${finding.line}  ${finding.severity}  ${finding.ruleId}\n    ${finding.message}`);
    const errors = findings.filter((finding) => finding.severity === 'error').length;
    return `${lines.join('\n')}\n\n[sarak-ui verify] ${findings.length} achado(s), ${errors} com severidade "error".`;
};

export const runVerifyCli = ({ argv, cwd = process.cwd() }: { argv: string[]; cwd?: string }): VerifyCliResult => {
    const args = parseArgs(argv);
    if (args.help) return { output: USAGE, exitCode: 0 };
    if (args.list) return { output: `regra                        porta    padrão resumo\n${renderList()}`, exitCode: 0 };
    try {
        const root = path.resolve(cwd, args.root);
        const config = readConfig(root, args.configFile);
        const settings = buildSettings(args, config);
        if (settings.size === 0) {
            return { output: `[sarak-ui verify] nenhuma regra ligada: nenhuma nasce ligada. Passe "--rule <regra>" ou crie "${DEFAULT_CONFIG_FILE}". Veja "--list".`, exitCode: 2 };
        }
        const findings = scanProject({ root, settings, exclude: config.exclude ?? [] });
        const output = args.format === 'json' ? JSON.stringify(findings, null, 2) : renderText(findings);
        return { output, exitCode: findings.some((finding) => finding.severity === 'error') ? 1 : 0 };
    } catch (error) {
        return { output: `[sarak-ui verify] ${error instanceof Error ? error.message : String(error)}`, exitCode: 2 };
    }
};
