#!/usr/bin/env node
/**
 * `npx @sarak/lib-ui-core <comando>` — CLI do consumidor.
 * Node puro (nenhuma dependência nova); todo o trabalho real vive em `bin/scaffold/`
 * (funções puras, testáveis sem spawnar este processo).
 *
 * Comandos (Spec 51 — L3): `init` (Spec 21/45) · `check` (Spec 39) · `refresh` (Spec 50).
 * Antes só existia `init`, e `check`/`refresh` viviam como CAMINHO DE ARQUIVO interno
 * (`bin/scaffold/checkUpdate.mjs`) copiado para o `package.json` do importador — o
 * consumidor decorava estrutura interna nossa, que qualquer refatoração quebraria em
 * silêncio. Os caminhos antigos seguem funcionando; esta é a superfície pública.
 */
import { runInit } from './scaffold/runInit.mjs';
import { runCheckCli } from './scaffold/checkUpdate.mjs';
import { runRefreshCli } from './scaffold/refreshKit.mjs';

const NUMERIC_FLAGS = new Set(['frontendPort']);
const BOOLEAN_FLAGS = new Set(['force', 'yes', 'notify']);

const COMMANDS = ['init', 'check', 'refresh'];

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
    console.log(`\n[sarak-ui init] Modo=${answers.mode} Porta=${answers.frontendPort}`);
    console.log(`[sarak-ui init] ${written.length} arquivo(s) escrito(s).`);
    if (skipped.length > 0) {
        console.log(`[sarak-ui init] ${skipped.length} pulado(s) (já existiam; use --force para sobrescrever):`);
        for (const item of skipped) console.log(`  - ${item}`);
    }
    console.log('\n[sarak-ui init] Pronto. Rode "npm install && npm run dev".');
}

/** `--help`/`-h` de verdade (Spec 29 §2.2): todos os comandos + flags + exemplos. */
const USAGE = `Uso: npx @sarak/lib-ui-core <comando> [opções]

Comandos:
  init      Gera o starter padrão (Provider + Shell + módulo de exemplo, Vite puro,
            sem backend), grava as peerDependencies e copia o kit "sarak-ui/".
  check     Diz se a lib instalada está atualizada. Funciona em monorepo (procura o
            lockfile subindo a árvore) e em dependência local (file:/link:).
  refresh   Re-sincroniza o kit "sarak-ui/" e as cópias movidas para specs/ e
            .claude/skills/ depois de atualizar a lib.

Opções de "init":
  --mode <app|embedded>              Modo de renderização (default: app)
  --frontend-port <porta>            Porta do dev server (default: 5173)
  --force                            Sobrescreve arquivo existente (default: nunca sobrescreve)
  --yes                              Aceita os defaults do starter padrão sem perguntar nada

Opções de "check":
  --notify                           Modo aviso: imprime SÓ se houver atualização e
                                     sai sempre com 0. É o que roda no "predev".

Globais:
  --help, -h                         Mostra esta ajuda e sai

Exemplos:
  npx @sarak/lib-ui-core init --yes
  npx @sarak/lib-ui-core check
  npx @sarak/lib-ui-core refresh

Sem terminal interativo (CI/agente/pipe) e sem "--yes" nem flags suficientes, o "init"
falha com código de saída 1 (nunca sai em silêncio sem escrever nada).`;

async function runInitCommand(rest) {
    const flags = parseFlags(rest);
    const result = await runInit({ flags });
    printSummary(result);
}

async function main() {
    const argv = process.argv.slice(2);
    const [command, ...rest] = argv;

    if (argv.includes('--help') || argv.includes('-h') || !command) {
        console.log(USAGE);
        return;
    }
    if (!COMMANDS.includes(command)) {
        // D1 (Spec 51): antes despejávamos o help do `init` sem dizer o que houve — o
        // consumidor lia uma ajuda que não pediu e não entendia por quê.
        console.error(`[sarak-ui] comando desconhecido: "${command}". Comandos válidos: ${COMMANDS.join(', ')}.\n`);
        console.error(USAGE);
        process.exitCode = 1;
        return;
    }

    if (command === 'init') return runInitCommand(rest);

    const cli = command === 'check' ? runCheckCli({ argv: rest }) : runRefreshCli({ argv: rest });
    if (cli.output) console.log(cli.output);
    process.exitCode = cli.exitCode;
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    // O `init` é idempotente (Spec 21 §2.1): se algum arquivo já foi escrito
    // antes deste erro, rodar o comando de novo não o duplica nem o corrompe —
    // ele só completa o que faltou.
    console.error('\n[sarak-ui] Falhou no meio da execução. Arquivos já escritos (se houver) não foram corrompidos — rode o comando de novo para completar o que faltou.');
    process.exitCode = 1;
});
