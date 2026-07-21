#!/usr/bin/env node
/**
 * `npx @sarak/lib-ui-core init` (Spec 21) — scaffolder do Golden Path.
 * Node puro (nenhuma dependência nova); todo o trabalho real vive em
 * `bin/scaffold/` (funções puras, testáveis sem spawnar este processo).
 */
import { runInit } from './scaffold/runInit.mjs';

const NUMERIC_FLAGS = new Set(['backendPort', 'frontendPort']);
const BOOLEAN_FLAGS = new Set(['force', 'yes']);

function toCamelCase(kebab) {
    return kebab.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/** Parser mínimo: `--nome valor` ou `--flag` (booleana). */
function parseFlags(argv) {
    const flags = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) continue;
        const name = toCamelCase(token.slice(2));
        if (BOOLEAN_FLAGS.has(name)) {
            flags[name] = true;
            continue;
        }
        const value = argv[i + 1];
        i += 1;
        flags[name] = NUMERIC_FLAGS.has(name) ? Number(value) : value;
    }
    return flags;
}

function printSummary({ answers, written, skipped }) {
    console.log(`\n[sarak-ui init] Modo=${answers.mode} Stack=${answers.stack} Storage=${answers.storage}`);
    console.log(`[sarak-ui init] ${written.length} arquivo(s) escrito(s).`);
    if (skipped.length > 0) {
        console.log(`[sarak-ui init] ${skipped.length} pulado(s) (já existiam; use --force para sobrescrever):`);
        for (const item of skipped) console.log(`  - ${item}`);
    }
    console.log('\n[sarak-ui init] Pronto. Rode "npm install && npm run dev".');
}

/** `--help`/`-h` de verdade (Spec 29 §2.2): todas as flags + defaults + exemplos. */
const USAGE = `Uso: npx @sarak/lib-ui-core init [opções]

Gera o boilerplate do Golden Path (Vite+Express monolítico, Next.js ou frontend-only):
peerDependencies gravadas no package.json, skills de consumo copiadas e manifesto inicial.

Opções:
  --mode <app|embedded>              Modo de renderização (default: app)
  --stack <vite-express|next|frontend-only>
                                      Stack do consumidor (default: vite-express)
  --storage <sqlite|postgres|custom>
                                      Persistência de temas (default: sqlite)
  --schema <nome>                    Schema do Postgres (só com --storage postgres; default: vazio)
  --backend-port <porta>              Porta do backend (default: 3000)
  --frontend-port <porta>             Porta do frontend (default: 5173)
  --force                            Sobrescreve arquivo existente (default: nunca sobrescreve)
  --yes                              Aceita os defaults do Golden Path sem perguntar nada
  --help, -h                         Mostra esta ajuda e sai

Exemplos:
  npx @sarak/lib-ui-core init --yes
  npx @sarak/lib-ui-core init --mode app --stack vite-express --storage sqlite
  npx @sarak/lib-ui-core init --stack next --storage postgres --schema meu_schema

Sem terminal interativo (CI/agente/pipe) e sem "--yes" nem flags suficientes, o comando
falha com código de saída 1 (nunca sai em silêncio sem escrever nada).`;

async function main() {
    const argv = process.argv.slice(2);
    const wantsHelp = argv.includes('--help') || argv.includes('-h');
    const [command, ...rest] = argv;

    if (wantsHelp) {
        console.log(USAGE);
        return;
    }
    if (command !== 'init') {
        console.error(USAGE);
        process.exitCode = 1;
        return;
    }

    const flags = parseFlags(rest);
    const result = await runInit({ flags });
    printSummary(result);
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    // O `init` é idempotente (Spec 21 §2.1): se algum arquivo já foi escrito
    // antes deste erro, rodar o comando de novo não o duplica nem o corrompe —
    // ele só completa o que faltou.
    console.error('\n[sarak-ui init] Falhou no meio da execução. Arquivos já escritos (se houver) não foram corrompidos — rode o comando de novo para completar o que faltou.');
    process.exitCode = 1;
});
