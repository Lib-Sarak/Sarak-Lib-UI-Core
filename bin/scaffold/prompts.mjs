/**
 * Entrevista do `init` (Spec 21 §2.2) — só o que é decisão do consumidor.
 * `node:readline`, sem dependência nova. Flags de CLI (`--stack`, `--storage`,
 * `--mode`, `--backend-port`, `--frontend-port`, `--schema`, `--yes`) pulam a
 * pergunta correspondente — usado pelo smoke test e por automação não-interativa.
 */
import readline from 'node:readline';
import { DEFAULT_BACKEND_PORT, DEFAULT_FRONTEND_PORT, DEFAULT_STACK, DEFAULT_STORAGE, DEFAULT_MODE } from './constants.mjs';

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
