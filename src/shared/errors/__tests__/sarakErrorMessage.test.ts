import { describe, expect, it } from 'vitest';
import { sarakErrorMessage } from '../sarakErrorMessage';

const UNKNOWN = 'Não foi possível concluir a operação. Tente novamente.';
const NETWORK = 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.';

describe('sarakErrorMessage', () => {
    it.each([
        ['Error', new Error('Saldo insuficiente'), 'Saldo insuficiente'],
        ['string', '  Saldo insuficiente  ', 'Saldo insuficiente'],
        ['message', { message: 'A' }, 'A'],
        ['error em texto', { error: 'B' }, 'B'],
        ['error em objeto', { error: { message: 'C' } }, 'C'],
        ['errors em lista de objetos', { errors: [{ message: 'D' }, { message: 'outro' }] }, 'D'],
        ['errors em lista de texto', { errors: ['E'] }, 'E'],
        ['detail (problem+json)', { title: 'Bad Request', detail: 'F' }, 'F'],
        ['title sem detail', { title: 'G' }, 'G'],
        ['data', { data: { message: 'H' } }, 'H'],
        ['response de cliente HTTP', { response: { data: { error: { message: 'I' } } } }, 'I'],
    ])('lê %s', (_name, error, expected) => {
        expect(sarakErrorMessage(error)).toBe(expected);
    });

    it.each([
        ['undefined', undefined],
        ['null', null],
        ['número', 500],
        ['string vazia', '   '],
        ['objeto sem texto', { code: 500 }],
        ['lista vazia', { errors: [] }],
        ['página HTML', '<!doctype html><html></html>'],
        ['texto longo demais', 'x'.repeat(301)],
        ['rastro de pilha', 'Falhou\n    at handler (server.js:10:3)'],
        ['aninhamento além do limite', { data: { data: { data: { data: { message: 'fundo' } } } } }],
    ])('%s cai no texto padrão', (_name, error) => {
        expect(sarakErrorMessage(error)).toBe(UNKNOWN);
    });

    it.each([
        ['TypeError', new TypeError("Cannot read properties of undefined (reading 'x')")],
        ['ReferenceError', new ReferenceError('y is not defined')],
        ['SyntaxError', new SyntaxError('Unexpected token < in JSON')],
    ])('defeito de código (%s) não vaza para o usuário', (_name, error) => {
        expect(sarakErrorMessage(error)).toBe(UNKNOWN);
    });

    it.each(['Failed to fetch', 'NetworkError when attempting to fetch resource.', 'Load failed'])('falha de rede "%s" vira texto de conexão', (message) => {
        expect(sarakErrorMessage(new TypeError(message))).toBe(NETWORK);
    });

    it('a mesma frase fora de TypeError não é falha de rede', () => {
        expect(sarakErrorMessage(new Error('Load failed'))).toBe('Load failed');
    });

    it('fallback substitui o texto padrão, inclusive o de rede, para seguir o idioma de quem chama', () => {
        expect(sarakErrorMessage(undefined, 'Try again')).toBe('Try again');
        expect(sarakErrorMessage(new TypeError('Failed to fetch'), 'Try again')).toBe('Try again');
        expect(sarakErrorMessage(new TypeError('x'), 'Try again')).toBe('Try again');
    });

    it('a mensagem real vence o fallback', () => {
        expect(sarakErrorMessage(new Error('Real'), 'Padrão')).toBe('Real');
    });

    it('getter que lança não derruba a leitura', () => {
        const hostile = {
            get message(): string {
                throw new Error('getter');
            },
            error: 'Seguinte',
        };

        expect(sarakErrorMessage(hostile)).toBe('Seguinte');
    });

    it('ciclo não trava: o limite de profundidade encerra', () => {
        const cyclic: Record<string, unknown> = {};
        cyclic.data = cyclic;

        expect(sarakErrorMessage(cyclic)).toBe(UNKNOWN);
    });
});
