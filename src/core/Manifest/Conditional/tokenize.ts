/**
 * Tokenizer do Motor de Avaliação Condicional (Spec 26 — Regras 1, 3, 4)
 *
 * Quebra a expressão em tokens de um conjunto FECHADO de operadores. Os `{{ }}` são
 * resolvidos aqui (valor tipado) e os literais reconhecidos; identificadores que não
 * sejam `true`/`false`/`null` são PROIBIDOS — fecha a porta a globais (`window`/`document`)
 * e a chamadas de função, sem nunca tocar em `eval`.
 */

import { resolveExpression } from '../Binding/interpolate';
import type { StateRecord } from '../DataStore/resolvePath';
import type { ManifestValue } from '../types';

/** Erro restrito do avaliador — sintaxe inválida, token inesperado ou global proibido. */
export class ConditionSyntaxError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConditionSyntaxError';
    }
}

/** Operadores reconhecidos (conjunto fechado — Regra 3). */
export type OperatorToken =
    | '||' | '&&' | '===' | '!==' | '>=' | '<=' | '>' | '<' | '!' | '(' | ')';

export interface ValueToken {
    kind: 'value';
    /** Valor já resolvido (de literal ou de `{{ }}`). */
    value: unknown;
}
export interface OpToken {
    kind: 'op';
    op: OperatorToken;
}
export type Token = ValueToken | OpToken;

/** Operadores multi-caractere, testados primeiro (mais longos antes). */
const MULTI_OPS: readonly OperatorToken[] = ['||', '&&', '===', '!==', '>=', '<='];
const SINGLE_OPS: readonly OperatorToken[] = ['>', '<', '!', '(', ')'];

/** Keywords aceitos como operandos literais. */
const KEYWORDS = new Map<string, ManifestValue>([
    ['true', true],
    ['false', false],
    ['null', null],
]);

const isDigit = (ch: string): boolean => ch >= '0' && ch <= '9';
const isIdentStart = (ch: string): boolean =>
    (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
const isIdentPart = (ch: string): boolean => isIdentStart(ch) || isDigit(ch);
const isSpace = (ch: string): boolean => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';

const matchOperator = (expr: string, i: number): OperatorToken | undefined => {
    const three = expr.slice(i, i + 3);
    const two = expr.slice(i, i + 2);
    const multi =
        MULTI_OPS.find((op) => op.length === 3 && three === op) ??
        MULTI_OPS.find((op) => op.length === 2 && two === op);
    if (multi) return multi;
    return SINGLE_OPS.find((op) => op === expr[i]);
};

/**
 * Quebra a expressão em tokens. `{{ }}` são resolvidos contra o estado, virando
 * `ValueToken`. Lança `ConditionSyntaxError` em qualquer construção fora da gramática.
 */
export const tokenize = (expr: string, scope: StateRecord, global: unknown): Token[] => {
    const tokens: Token[] = [];
    let i = 0;
    const n = expr.length;

    while (i < n) {
        const ch = expr[i];

        if (isSpace(ch)) {
            i++;
            continue;
        }

        // Binding `{{ ... }}` → resolve para valor tipado.
        if (ch === '{' && expr[i + 1] === '{') {
            const end = expr.indexOf('}}', i + 2);
            if (end === -1) {
                throw new ConditionSyntaxError(`binding '{{' sem fechamento '}}' em "${expr}".`);
            }
            tokens.push({ kind: 'value', value: resolveExpression(expr.slice(i + 2, end), scope, global) });
            i = end + 2;
            continue;
        }

        // Literal de string entre aspas.
        if (ch === "'" || ch === '"') {
            const close = expr.indexOf(ch, i + 1);
            if (close === -1) {
                throw new ConditionSyntaxError(`string sem aspa de fechamento em "${expr}".`);
            }
            tokens.push({ kind: 'value', value: expr.slice(i + 1, close) });
            i = close + 1;
            continue;
        }

        // Literal numérico (inteiro ou decimal).
        if (isDigit(ch) || (ch === '.' && isDigit(expr[i + 1] ?? ''))) {
            let j = i + 1;
            while (j < n && (isDigit(expr[j]) || expr[j] === '.')) j++;
            const raw = expr.slice(i, j);
            const num = Number(raw);
            if (!Number.isFinite(num)) {
                throw new ConditionSyntaxError(`número inválido "${raw}".`);
            }
            tokens.push({ kind: 'value', value: num });
            i = j;
            continue;
        }

        // Identificador: só os keywords true/false/null (Regra 1/4 — bloqueia globais).
        if (isIdentStart(ch)) {
            let j = i + 1;
            while (j < n && isIdentPart(expr[j])) j++;
            const word = expr.slice(i, j);
            if (!KEYWORDS.has(word)) {
                throw new ConditionSyntaxError(
                    `identificador proibido "${word}" — só literais e {{ }} são permitidos.`,
                );
            }
            tokens.push({ kind: 'value', value: KEYWORDS.get(word) as ManifestValue });
            i = j;
            continue;
        }

        // Operadores.
        const op = matchOperator(expr, i);
        if (!op) {
            throw new ConditionSyntaxError(`token inesperado "${ch}" em "${expr}".`);
        }
        tokens.push({ kind: 'op', op });
        i += op.length;
    }

    return tokens;
};
