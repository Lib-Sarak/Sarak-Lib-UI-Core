/**
 * Entrevista do `init` (Spec 21 §2.2) — só o que é decisão do consumidor.
 * `node:readline`, sem dependência nova. Flags de CLI (`--stack`, `--storage`,
 * `--mode`, `--backend-port`, `--frontend-port`, `--schema`, `--yes`) pulam a
 * pergunta correspondente — usado pelo smoke test e por automação não-interativa.
 */
import readline from 'node:readline';
import { DEFAULT_BACKEND_PORT, DEFAULT_FRONTEND_PORT, DEFAULT_STACK, DEFAULT_STORAGE, DEFAULT_MODE } from './constants.mjs';

/** Campos que a entrevista precisa resolver — via flag, `--yes`, ou pergunta interativa. */
const REQUIRED_ANSWER_FLAGS = ['mode', 'stack', 'storage', 'backendPort', 'frontendPort'];

const flagNameToCliFlag = (flagName) => `--${flagName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

/**
 * Guard de TTY (Spec 29 §2.2): sem terminal interativo, `rl.question` nunca recebe uma
 * linha (EOF imediato) e a Promise de `ask()` fica pendurada — o processo às vezes
 * termina em `exit 0` sem escrever nada, mudo (achado real do Selo). Falha em voz alta
 * ANTES de abrir o `readline` sempre que faltar TTY e faltar `--yes`/flag suficiente.
 */
export function assertInteractionIsPossible({ flags, isTTY }) {
    if (isTTY || flags.yes) return;
    const missing = REQUIRED_ANSWER_FLAGS.filter((flagName) => flags[flagName] === undefined);
    if (missing.length === 0) return;
    const missingCliFlags = missing.map(flagNameToCliFlag).join(', ');
    throw new Error(
        `[sarak-ui init] Terminal não interativo (sem TTY) e faltam flags: ${missingCliFlags}. ` +
        'Passe "--yes" (aceita os defaults do Golden Path) ou informe todas as flags. ' +
        'Rode "npx @sarak/lib-ui-core init --help" para ver a lista completa.',
    );
}

function ask({ rl, question, defaultValue }) {
    return new Promise((resolve) => {
        rl.question(`${question} [${defaultValue}]: `, (answer) => {
            resolve(answer.trim() || defaultValue);
        });
    });
}

async function resolveField({ rl, flags, flagName, question, defaultValue, useDefaults }) {
    if (flags[flagName] !== undefined) return flags[flagName];
    if (useDefaults) return defaultValue;
    return ask({ rl, question, defaultValue });
}

/** Pergunta modo/stack/storage/portas; flags/`--yes` pulam a pergunta correspondente. */
export async function collectAnswers({ flags = {}, input = process.stdin, output = process.stdout } = {}) {
    assertInteractionIsPossible({ flags, isTTY: Boolean(input.isTTY) });
    const rl = readline.createInterface({ input, output });
    const useDefaults = Boolean(flags.yes);

    try {
        const mode = await resolveField({
            rl,
            flags,
            flagName: 'mode',
            question: 'Modo (app | embedded)',
            defaultValue: DEFAULT_MODE,
            useDefaults,
        });
        const stack = await resolveField({
            rl,
            flags,
            flagName: 'stack',
            question: 'Stack (vite-express | next | frontend-only)',
            defaultValue: DEFAULT_STACK,
            useDefaults,
        });
        const storage = await resolveField({
            rl,
            flags,
            flagName: 'storage',
            question: 'Persistência de temas (sqlite | postgres | custom)',
            defaultValue: DEFAULT_STORAGE,
            useDefaults,
        });
        const schemaDefault = flags.schema ?? '';
        const schema =
            storage === 'postgres'
                ? await resolveField({ rl, flags, flagName: 'schema', question: 'Schema Postgres (vazio = default)', defaultValue: schemaDefault, useDefaults })
                : '';
        const backendPortRaw = await resolveField({
            rl,
            flags,
            flagName: 'backendPort',
            question: 'Porta do backend',
            defaultValue: String(DEFAULT_BACKEND_PORT),
            useDefaults,
        });
        const frontendPortRaw = await resolveField({
            rl,
            flags,
            flagName: 'frontendPort',
            question: 'Porta do frontend',
            defaultValue: String(DEFAULT_FRONTEND_PORT),
            useDefaults,
        });

        return {
            mode,
            stack,
            storage,
            schema: schema || null,
            backendPort: Number(backendPortRaw),
            frontendPort: Number(frontendPortRaw),
        };
    } finally {
        rl.close();
    }
}
