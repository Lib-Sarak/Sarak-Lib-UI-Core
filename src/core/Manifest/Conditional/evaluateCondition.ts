/**
 * Motor de Avaliação Condicional (Spec 26 — Regras 1–4)
 *
 * Avalia strings lógicas declaradas no manifesto (`renderIf`/`disabledIf`) SEM jamais
 * tocar em `eval`/`Function`. Um parser recursivo-descendente próprio consome os tokens
 * (ver `tokenize.ts`) sobre um conjunto FECHADO de operadores; os operandos só nascem de
 * literais ou de `{{ }}` resolvidos pela Spec 24.
 *
 * Segurança (Regra 1/4): qualquer construção fora da gramática vira erro de parse → o
 * avaliador falha de forma passiva (`console.warn`) e assume `false` (segurança por
 * default). Zero Any: a fronteira dinâmica é `unknown`.
 */

import type { StateRecord } from '../DataStore/resolvePath';
import { tokenize, ConditionSyntaxError, type Token, type OperatorToken } from './tokenize';

export { ConditionSyntaxError } from './tokenize';

const isTruthy = (value: unknown): boolean => Boolean(value);

/** Aplica um operador de comparação sobre dois operandos já resolvidos. */
const compare = (left: unknown, op: OperatorToken, right: unknown): boolean => {
    switch (op) {
        case '===':
            return left === right;
        case '!==':
            return left !== right;
        // Relacionais delegam aos operadores nativos sobre os valores (número/string).
        case '>':
            return (left as number) > (right as number);
        case '<':
            return (left as number) < (right as number);
        case '>=':
            return (left as number) >= (right as number);
        case '<=':
            return (left as number) <= (right as number);
        default:
            throw new ConditionSyntaxError(`operador de comparação inválido "${op}".`);
    }
};

/** Parser recursivo-descendente. Precedência: || < && < comparação < ! < primário. */
class Parser {
    private pos = 0;
    constructor(private readonly tokens: Token[]) {}

    parse(): unknown {
        const result = this.parseOr();
        if (this.pos < this.tokens.length) {
            throw new ConditionSyntaxError('tokens sobrando após o fim da expressão.');
        }
        return result;
    }

    private matchOp(...ops: OperatorToken[]): OperatorToken | undefined {
        const tok = this.tokens[this.pos];
        if (tok && tok.kind === 'op' && ops.includes(tok.op)) {
            this.pos++;
            return tok.op;
        }
        return undefined;
    }

    private parseOr(): unknown {
        let left = this.parseAnd();
        while (this.matchOp('||')) {
            const right = this.parseAnd();
            left = isTruthy(left) ? left : right;
        }
        return left;
    }

    private parseAnd(): unknown {
        let left = this.parseComparison();
        while (this.matchOp('&&')) {
            const right = this.parseComparison();
            left = isTruthy(left) ? right : left;
        }
        return left;
    }

    private parseComparison(): unknown {
        let left = this.parseUnary();
        let op = this.matchOp('===', '!==', '>', '<', '>=', '<=');
        while (op) {
            left = compare(left, op, this.parseUnary());
            op = this.matchOp('===', '!==', '>', '<', '>=', '<=');
        }
        return left;
    }

    private parseUnary(): unknown {
        if (this.matchOp('!')) {
            return !isTruthy(this.parseUnary());
        }
        return this.parsePrimary();
    }

    private parsePrimary(): unknown {
        if (this.matchOp('(')) {
            const inner = this.parseOr();
            if (!this.matchOp(')')) {
                throw new ConditionSyntaxError("parêntese '(' sem fechamento ')'.");
            }
            return inner;
        }
        const tok = this.tokens[this.pos];
        if (tok && tok.kind === 'value') {
            this.pos++;
            return tok.value;
        }
        throw new ConditionSyntaxError('operando esperado (literal, {{ }} ou parêntese).');
    }
}

/**
 * Avalia uma `ConditionExpression` de forma segura. Retorna sempre `boolean` (o valor
 * final é coagido por veracidade). Em QUALQUER erro de sintaxe/token (incluindo
 * tentativas de alcançar globais), loga e retorna `false` (fail-safe — Regra 4).
 */
export const evaluateCondition = (
    expression: string,
    scope: StateRecord,
    global: unknown,
): boolean => {
    try {
        const tokens = tokenize(expression, scope, global);
        if (tokens.length === 0) return false;
        return isTruthy(new Parser(tokens).parse());
    } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.warn(`[Sarak:Conditional] expressão inválida "${expression}": ${reason}. Assumindo false.`);
        return false;
    }
};
