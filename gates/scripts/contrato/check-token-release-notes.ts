// Gate — a entrada de uma versão em `docs/migracoes.md` cita todo token acrescentado, removido ou com tipo ou
// gramática de valor novo desde a última tag ESTÁVEL anterior (03 §5). Nasceu do retorno dos importadores: as
// entradas da 8.0.0 diziam "nenhum token acrescentado" por plan, e a 8.0.0, vista desde a 7.0.0, acrescentou
// dezenas — quem valida tema por lista de chaves rejeitou o que não estava nas notas.
//
// Roda no gancho `version` (o `package.json` já tem a versão nova e a tag ainda não existe), depois de
// `minor-no-removal:check`. A base é a maior tag estável estritamente anterior à versão que vai sair: a 8.1.0
// compara com a `v8.0.0`; a 8.0.0 (e suas prévias) compara com a `v7.0.0`.
//
// Uso:
//   npx tsx gates/scripts/contrato/check-token-release-notes.ts                     (o gate)
//   npx tsx gates/scripts/contrato/check-token-release-notes.ts --print --from v7.0.0   (escreve a seção)
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. Vê NOME, TIPO e GRAMÁTICA (opções de select, faixa e unidade de slider/número). NÃO vê mudança de valor
//    padrão, de descrição, de `cssVars` nem de comportamento do leitor — um token que só mudou o default passa.
// 2. A gramática de um token `string` sem opções (ex.: `colorPalette`) não é legível pelo schema: o gate cobra o
//    NOME na entrada, e a gramática dele é texto de quem escreve a nota.
// 3. Confere PRESENÇA do nome (palavra inteira) nas seções `## ...` cujo título cita a versão — não confere que
//    o nome está na lista certa (acrescentado × removido) nem que o texto ao redor é verdadeiro.
// 4. Sem tag estável anterior à versão, ou sem tag nenhuma, não há o que comparar: libera.
// 5. Lê só `src/core/Design` da tag; schema que importe de fora dessa pasta quebra a fotografia da tag, e o
//    gate falha em voz alta (não libera em silêncio).
// -------------------------------------------------------------------------
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
    baselineTag,
    diffSnapshots,
    extractVersionNotes,
    missingNames,
    namesOf,
    renderTokenLists,
    snapshotTokens,
    type TokenLike,
    type TokenSnapshot,
} from './helpers/token-release-notes-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const MASTER_MAP = path.join('src', 'core', 'Design', 'master-map.ts');

const git = (...args: string[]): string => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

async function snapshotOf(root: string): Promise<TokenSnapshot> {
    const loaded = (await import(pathToFileURL(path.join(root, MASTER_MAP)).href)) as {
        MASTER_DESIGN_MAP: { components: { tokens: TokenLike[] }[] };
    };
    return snapshotTokens(loaded.MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens));
}

/** Fotografa os tokens de uma tag: exporta só `src/core/Design` para uma pasta temporária e a apaga depois. */
export async function snapshotOfTag(tag: string): Promise<TokenSnapshot> {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-token-notes-'));
    try {
        const tarFile = path.join(dir, 'design.tar');
        git('archive', '--format=tar', tag, 'src/core/Design', '-o', tarFile);
        const extracted = path.join(dir, 'tree');
        fs.mkdirSync(extracted);
        // Caminho relativo e `cwd`: o `tar` do Git Bash lê "C:" de um caminho absoluto como nome de host.
        execFileSync('tar', ['-xf', path.join('..', 'design.tar')], { cwd: extracted });
        return await snapshotOf(extracted);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

const readVersion = (): string => (JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { version: string }).version;

function argValue(flag: string): string | undefined {
    const index = process.argv.indexOf(flag);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

async function printSection(): Promise<void> {
    const from = argValue('--from');
    if (!from) throw new Error('--print exige --from <tag>.');
    const before = await snapshotOfTag(from);
    const after = await snapshotOf(ROOT);
    console.log(renderTokenLists(diffSnapshots(before, after), before, after));
}

async function runGate(): Promise<number> {
    console.log('--- token-release-notes:check (a entrada da versão cita os tokens que mudaram) ---');
    const version = readVersion();
    const tag = baselineTag(git('tag', '--list', 'v*').split('\n').map((t) => t.trim()), version);
    if (tag === null) {
        console.log('[OK] nenhuma tag estável anterior a esta versão — nada para comparar.');
        return 0;
    }
    const diff = diffSnapshots(await snapshotOfTag(tag), await snapshotOf(ROOT));
    const names = namesOf(diff);
    if (names.length === 0) {
        console.log(`[OK] ${tag} → ${version} — nenhum token acrescentado, removido ou com valor novo.`);
        return 0;
    }
    const notes = extractVersionNotes(fs.readFileSync(path.join(ROOT, 'docs', 'migracoes.md'), 'utf8'), version);
    const missing = missingNames(names, notes);
    if (missing.length === 0) {
        console.log(`[OK] ${tag} → ${version} — os ${names.length} token(s) que mudaram estão na entrada da versão.`);
        return 0;
    }
    console.error(`[ERROR] ${tag} → ${version}: ${missing.length} de ${names.length} token(s) que mudaram faltam na entrada "## ${version} — ..." de docs/migracoes.md:`);
    missing.forEach((name) => console.error(`  - ${name}`));
    console.error('  Liste cada um (acrescentado, removido ou com valor novo): `npx tsx gates/scripts/contrato/check-token-release-notes.ts --print --from ' + tag + '`.');
    return 1;
}

async function main(): Promise<void> {
    if (process.argv.includes('--print')) return printSection();
    process.exit(await runGate());
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}
