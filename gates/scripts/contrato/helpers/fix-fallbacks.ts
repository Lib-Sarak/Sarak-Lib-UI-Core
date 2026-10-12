// Ferramenta de manutenção (não é gate): reescreve, nos arquivos de `src/`, a reserva divergente de
// `var(--x, F)` para o padrão do token. Uso: `npx tsx gates/scripts/contrato/helpers/fix-fallbacks.ts [--write]`.
// Sem `--write` só lista os pares (nome, reserva → padrão).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReport } from '../check-variable-contract';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const SRC = path.join(ROOT, 'src');
const write = process.argv.includes('--write');

/** Só cor e canal `r, g, b`: dentro de classe utilitária (`bg-[var(--x,…)]`) espaço separaria a classe. */
const compact = (value: string): string => (/^(rgba?|hsla?)\(|^\d+,\s*\d+/i.test(value) ? value.replace(/,\s+/g, ',') : value);

const report = buildReport();
const pairs = new Map<string, { count: number; to: string }>();
const edits = new Map<string, Array<{ line: number; name: string; from: string; to: string }>>();

for (const finding of report.fallbacks) {
    const first = finding.expected.split(' | ')[0];
    const isCode = !finding.file.endsWith('.css');
    const to = isCode ? compact(first) : first;
    const key = `${finding.name} :: ${finding.fallback} -> ${to}`;
    pairs.set(key, { count: (pairs.get(key)?.count ?? 0) + 1, to });
    edits.set(finding.file, [...(edits.get(finding.file) ?? []), { line: finding.line, name: finding.name, from: finding.fallback, to }]);
}

[...pairs.entries()].sort().forEach(([key, value]) => console.log(`${String(value.count).padStart(4)}x ${key}`));
console.log(`\n${report.fallbacks.length} reservas em ${edits.size} arquivos`);

if (write) {
    for (const [relative, list] of edits) {
        const file = path.join(SRC, relative);
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        for (const edit of list) {
            const text = lines[edit.line - 1];
            const needle = new RegExp(`(var\\(\\s*${edit.name.replace(/[-]/g, '\\-')}\\s*,\\s*)${edit.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\))`);
            if (!needle.test(text)) {
                console.warn(`  [pulado] ${relative}:${edit.line} ${edit.name}`);
                continue;
            }
            lines[edit.line - 1] = text.replace(needle, `$1${edit.to}$2`);
        }
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
    }
}
