// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { Readable, Writable } from 'node:stream';
import { assertConfirmationIsPossible, confirm } from '../confirmPrompt.mjs';

function fakeInput(line) {
    const stream = new Readable({ read() {} });
    stream.isTTY = true;
    process.nextTick(() => {
        stream.push(`${line}\n`);
        stream.push(null);
    });
    return stream;
}

const sink = () => new Writable({ write(_chunk, _enc, cb) { cb(); } });

describe('assertConfirmationIsPossible — guard de TTY (mesma classe do `init`)', () => {
    it('sem TTY e sem --yes -> lança em voz alta', () => {
        expect(() => assertConfirmationIsPossible({ isTTY: false, yes: false })).toThrow(/Terminal não interativo/);
    });

    it('sem TTY mas com --yes -> não lança (automação já confirmou fora daqui)', () => {
        expect(() => assertConfirmationIsPossible({ isTTY: false, yes: true })).not.toThrow();
    });

    it('com TTY -> não lança', () => {
        expect(() => assertConfirmationIsPossible({ isTTY: true, yes: false })).not.toThrow();
    });
});

describe('confirm — o sim/não do --latest', () => {
    it('"s" -> true', async () => {
        await expect(confirm({ question: 'Confirmar?', input: fakeInput('s'), output: sink() })).resolves.toBe(true);
    });

    it('"sim" -> true', async () => {
        await expect(confirm({ question: 'Confirmar?', input: fakeInput('sim'), output: sink() })).resolves.toBe(true);
    });

    it('linha vazia (Enter) -> false — o default é NÃO atravessar o major', async () => {
        await expect(confirm({ question: 'Confirmar?', input: fakeInput(''), output: sink() })).resolves.toBe(false);
    });

    it('qualquer outra coisa -> false', async () => {
        await expect(confirm({ question: 'Confirmar?', input: fakeInput('n'), output: sink() })).resolves.toBe(false);
    });

    it('yes:true -> resolve sem ler o stream (nem precisa de TTY)', async () => {
        const stream = new Readable({ read() {} });
        stream.isTTY = false;
        await expect(confirm({ question: 'Confirmar?', input: stream, output: sink(), yes: true })).resolves.toBe(true);
    });
});
