import { describe, it, expect, vi, afterEach } from 'vitest';
import { evaluateCondition } from '../Conditional/evaluateCondition';

const EMPTY_SCOPE = {} as Record<string, unknown>;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Spec 26 — Avaliação segura (Regra 1: sem eval)', () => {
    it('deve interpretar igualdade de string + comparação numérica com && (Critério 1)', () => {
        const state = { role: 'ADMIN', age: 30 };
        expect(
            evaluateCondition("{{role}} === 'ADMIN' && {{age}} > 18", EMPTY_SCOPE, state),
        ).toBe(true);
    });

    it('deve retornar false quando um lado do && falha', () => {
        const state = { role: 'USER', age: 30 };
        expect(
            evaluateCondition("{{role}} === 'ADMIN' && {{age}} > 18", EMPTY_SCOPE, state),
        ).toBe(false);
    });

    it('deve resolver a negação `!{{isLoggedIn}}` (Critério 2)', () => {
        expect(evaluateCondition('!{{isLoggedIn}}', EMPTY_SCOPE, { isLoggedIn: true })).toBe(false);
        expect(evaluateCondition('!{{isLoggedIn}}', EMPTY_SCOPE, { isLoggedIn: false })).toBe(true);
    });

    it('deve avaliar OU lógico e parênteses com precedência correta', () => {
        const state = { a: 1, b: 5, c: 10 };
        // a > 2 (false) || (b < c && c >= 10) (true) → true
        expect(
            evaluateCondition('{{a}} > 2 || ({{b}} < {{c}} && {{c}} >= 10)', EMPTY_SCOPE, state),
        ).toBe(true);
    });

    it('deve suportar !== e <=', () => {
        const state = { status: 'ok', n: 5 };
        expect(evaluateCondition("{{status}} !== 'fail'", EMPTY_SCOPE, state)).toBe(true);
        expect(evaluateCondition('{{n}} <= 5', EMPTY_SCOPE, state)).toBe(true);
    });

    it('deve tratar binding ausente como falsy (segurança por default)', () => {
        expect(evaluateCondition('{{user.flag}}', EMPTY_SCOPE, {})).toBe(false);
    });

    it('deve ler o escopo local (renderFor) antes do global', () => {
        const scope = { item: { active: true } } as Record<string, unknown>;
        expect(evaluateCondition('{{item.active}}', scope, { item: { active: false } })).toBe(true);
    });
});

describe('Spec 26 — Blindagem contra injeção (Regra 1/4, Critério 3)', () => {
    it('deve bloquear acesso a globais (window/document) retornando false', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(evaluateCondition("window.location = 'malicious'", EMPTY_SCOPE, {})).toBe(false);
        expect(evaluateCondition('document.cookie', EMPTY_SCOPE, {})).toBe(false);
        expect(warn).toHaveBeenCalled();
    });

    it('deve rejeitar chamada de função desconhecida', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(evaluateCondition('alert(1)', EMPTY_SCOPE, {})).toBe(false);
    });

    it('deve falhar de forma passiva em sintaxe inválida (`==== `) — Regra 4', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(evaluateCondition('{{user}} ==== 2', EMPTY_SCOPE, { user: 2 })).toBe(false);
        expect(warn).toHaveBeenCalled();
    });

    it('deve retornar false (não lançar) para expressão vazia', () => {
        expect(() => evaluateCondition('   ', EMPTY_SCOPE, {})).not.toThrow();
        expect(evaluateCondition('   ', EMPTY_SCOPE, {})).toBe(false);
    });
});
