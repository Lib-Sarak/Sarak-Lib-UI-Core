// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { PassThrough } from 'node:stream';
import { assertInteractionIsPossible, collectAnswers } from '../prompts.mjs';

const GOLDEN_PATH_FLAGS = {
    mode: 'app',
    stack: 'vite-express',
    storage: 'sqlite',
    backendPort: 3000,
    frontendPort: 5173,
};

/** Stream de entrada fake que nunca emite 'line' — simula stdin não-TTY fechado/vazio. */
const fakeNonTTYInput = () => {
    const stream = new PassThrough();
    stream.isTTY = false;
    return stream;
};

describe('assertInteractionIsPossible — guard de TTY (Spec 29 §2.2)', () => {
    it('com TTY: nunca lança, mesmo sem nenhuma flag', () => {
        expect(() => assertInteractionIsPossible({ flags: {}, isTTY: true })).not.toThrow();
    });

    it('sem TTY mas com --yes: não lança (defaults resolvem tudo)', () => {
        expect(() => assertInteractionIsPossible({ flags: { yes: true }, isTTY: false })).not.toThrow();
    });

    it('sem TTY e com TODAS as flags obrigatórias: não lança', () => {
        expect(() => assertInteractionIsPossible({ flags: GOLDEN_PATH_FLAGS, isTTY: false })).not.toThrow();
    });

    it('sem TTY, sem --yes e faltando flags: lança erro alto listando as flags que faltam', () => {
        expect(() => assertInteractionIsPossible({ flags: { mode: 'app' }, isTTY: false })).toThrow(
            /--stack.*--storage.*--backend-port.*--frontend-port/s,
        );
    });

    it('mensagem de erro orienta a usar --yes ou --help', () => {
        expect(() => assertInteractionIsPossible({ flags: {}, isTTY: false })).toThrow(/--yes/);
        expect(() => assertInteractionIsPossible({ flags: {}, isTTY: false })).toThrow(/--help/);
    });
});

describe('collectAnswers — nunca sai em silêncio sem TTY (Spec 29 §2.2)', () => {
    it('sem TTY e sem --yes/flags: rejeita alto (nunca degenera em exit 0 mudo)', async () => {
        const input = fakeNonTTYInput();
        const output = new PassThrough();
        await expect(collectAnswers({ flags: {}, input, output })).rejects.toThrow(/Terminal não interativo/);
    });

    it('sem TTY e com --yes: resolve pelos defaults sem precisar de nenhuma linha em stdin', async () => {
        const input = fakeNonTTYInput();
        const output = new PassThrough();
        const answers = await collectAnswers({ flags: { yes: true }, input, output });
        expect(answers).toMatchObject({
            mode: 'app',
            stack: 'vite-express',
            storage: 'sqlite',
            backendPort: 3000,
            frontendPort: 5173,
        });
    });

    it('sem TTY e com todas as flags resolvidas individualmente: resolve sem abrir pergunta', async () => {
        const input = fakeNonTTYInput();
        const output = new PassThrough();
        const answers = await collectAnswers({ flags: GOLDEN_PATH_FLAGS, input, output });
        expect(answers).toMatchObject({
            mode: 'app',
            stack: 'vite-express',
            storage: 'sqlite',
            backendPort: 3000,
            frontendPort: 5173,
        });
    });

    it('sem TTY, faltando só 1 flag e sem --yes: rejeita apontando exatamente a que falta', async () => {
        const { frontendPort: _omit, ...missingFrontendPort } = GOLDEN_PATH_FLAGS;
        const input = fakeNonTTYInput();
        const output = new PassThrough();
        await expect(collectAnswers({ flags: missingFrontendPort, input, output })).rejects.toThrow(
            /--frontend-port/,
        );
    });
});
