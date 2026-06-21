import { describe, it, expect, vi } from 'vitest';
import {
    interpolate,
    interpolateProps,
    resolveBinding,
    resolveExpression,
} from '../Binding/interpolate';
import { registerPipe, getPipe } from '../Binding/pipes';

const EMPTY_SCOPE = {} as Record<string, unknown>;
// Intl de moeda usa espaco nao-quebravel (U+00A0/U+202F); normaliza para comparar.
const NBSP = new RegExp(`[${String.fromCharCode(0x00a0)}${String.fromCharCode(0x202f)}]`, 'g');
const norm = (s: string): string => s.replace(NBSP, ' ');

describe('Spec 24 — Interpolação segura (Regra 1)', () => {
    it('deve extrair múltiplas variáveis da mesma string', () => {
        const state = { nome: 'Ana', saldo: 10 };
        expect(interpolate('Olá {{nome}}, seu saldo é {{saldo}}', EMPTY_SCOPE, state))
            .toBe('Olá Ana, seu saldo é 10');
    });

    it('deve retornar vazio (sem quebrar) para variável inexistente', () => {
        const state = { usuario: {} };
        expect(() => interpolate('{{usuario.fantasma}}', EMPTY_SCOPE, state)).not.toThrow();
        expect(interpolate('{{usuario.fantasma}}', EMPTY_SCOPE, state)).toBe('');
    });

    it('deve aplicar o fallback `|| literal` quando o caminho é ausente', () => {
        const state = { user: {} };
        expect(interpolate("{{user.address.street || 'Não informado'}}", EMPTY_SCOPE, state))
            .toBe('Não informado');
    });

    it('deve resolver caminho aninhado com índice de array', () => {
        const state = { empresa: { filiais: [{ nome: 'Matriz' }] } };
        expect(interpolate('{{empresa.filiais.0.nome}}', EMPTY_SCOPE, state)).toBe('Matriz');
    });
});

describe('Spec 24 — Pipes de formatação (Regra 2)', () => {
    it('deve formatar moeda BRL (Total: {{balance | currency})', () => {
        const out = interpolate("Total: {{balance | currency: 'BRL'}}", EMPTY_SCOPE, { balance: 1500 });
        expect(norm(out)).toBe('Total: R$ 1.500,00');
    });

    it('deve aplicar o pipe de datas sobre um ISO date', () => {
        const out = interpolate("{{quando | date: 'DD/MM/YYYY'}}", EMPTY_SCOPE, { quando: '2026-06-21' });
        expect(out).toBe('21/06/2026');
    });

    it('deve aplicar capitalize/uppercase/lowercase', () => {
        expect(interpolate('{{v | capitalize}}', EMPTY_SCOPE, { v: 'ana' })).toBe('Ana');
        expect(interpolate('{{v | uppercase}}', EMPTY_SCOPE, { v: 'ana' })).toBe('ANA');
        expect(interpolate('{{v | lowercase}}', EMPTY_SCOPE, { v: 'ANA' })).toBe('ana');
    });

    it('deve permitir registrar um pipe customizado', () => {
        registerPipe('exclama', (value) => `${String(value)}!`);
        expect(getPipe('exclama')).toBeDefined();
        expect(interpolate('{{v | exclama}}', EMPTY_SCOPE, { v: 'oi' })).toBe('oi!');
    });
});

describe('Spec 24 — Escopo local sobre global', () => {
    it('deve resolver {{item.x}} do escopo local da iteração', () => {
        const scope = { item: { email: 'a@b.com' }, index: 0 };
        expect(interpolate('{{item.email}}', scope, { item: { email: 'global@x.com' } }))
            .toBe('a@b.com');
    });
});

describe('Spec 24 — resolveExpression / resolveBinding (valor cru)', () => {
    it('resolveExpression deve preservar o tipo do valor (número)', () => {
        expect(resolveExpression('count', EMPTY_SCOPE, { count: 42 })).toBe(42);
    });

    it('resolveBinding deve aceitar com e sem chaves e devolver o array', () => {
        const state = { users: [{ id: 1 }, { id: 2 }] };
        expect(resolveBinding('{{users}}', EMPTY_SCOPE, state)).toHaveLength(2);
        expect(resolveBinding('users', EMPTY_SCOPE, state)).toHaveLength(2);
    });
});

describe('Spec 24 — interpolateProps (recursivo, preserva tipo)', () => {
    it('deve resolver prop que é só {{expr}} para o valor cru', () => {
        const props = { count: '{{n}}', label: 'Itens: {{n}}', nested: { active: '{{flag}}' } };
        const out = interpolateProps(props, EMPTY_SCOPE, { n: 3, flag: true });
        expect(out.count).toBe(3);
        expect(out.label).toBe('Itens: 3');
        expect((out.nested as { active: boolean }).active).toBe(true);
    });

    it('deve manter props sem template inalteradas', () => {
        const props = { gap: '8px', columns: 2 };
        expect(interpolateProps(props, EMPTY_SCOPE, {})).toEqual({ gap: '8px', columns: 2 });
    });
});

describe('Spec 24 — Pipe desconhecido (degradação suave)', () => {
    it('deve avisar e repassar o valor quando o pipe não existe', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(interpolate('{{v | inexistente}}', EMPTY_SCOPE, { v: 'x' })).toBe('x');
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
