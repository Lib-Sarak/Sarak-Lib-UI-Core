/**
 * Validação Declarativa de Campos (Spec 29)
 *
 * Lógica PURA e determinística (sem React, sem `any`): recebe o valor de um campo e
 * seu `ValidationSchema` e devolve os erros. As engrenagens visuais (LeafNode) e o
 * bloqueio de submit (Dispatcher) consomem este resultado — a regra de negócio vive
 * aqui, isolada e testável.
 *
 * Regra 1 (tipos): `required`, `minLength`, `maxLength`, `pattern` (regex), `type`
 * (`email`/`url`/`numero`). Regra 4: cada regra aceita `message` custom; senão usa o
 * default em pt-BR. A compilação de regex é blindada (try/catch) — regex inválida no
 * JSON nunca derruba o motor (mesma postura anti-injeção do `evaluateCondition`).
 */

import type { ValidationRule, ValidationSchema, ValidationTypeName } from '../types';

/** Erro de validação de um campo, pronto para exibição (Regra 3/4). */
export interface ValidationError {
    /** Regra que falhou. */
    rule: ValidationRule['rule'];
    /** Mensagem (custom do JSON ou default). */
    message: string;
}

/** Padrões dos tipos semânticos da regra `type` (Regra 1). */
const TYPE_PATTERNS: Readonly<Record<ValidationTypeName, RegExp>> = {
    // E-mail pragmático (não-RFC completo): algo@algo.dominio, sem espaços.
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // URL com esquema http(s) e host.
    url: /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i,
    // Número inteiro ou decimal, com sinal opcional.
    numero: /^-?\d+(\.\d+)?$/,
};

/** Mensagens default em pt-BR (Regra 4 — sobrepostas por `message` no JSON). */
const DEFAULT_MESSAGES: Readonly<Record<ValidationRule['rule'], string>> = {
    required: 'Campo obrigatório.',
    minLength: 'Valor muito curto.',
    maxLength: 'Valor muito longo.',
    pattern: 'Formato inválido.',
    type: 'Formato inválido.',
};

/** Resolve a mensagem: custom do JSON tem prioridade sobre o default da regra. */
const messageFor = (rule: ValidationRule): string =>
    rule.message ?? DEFAULT_MESSAGES[rule.rule];

/** True se o valor é "vazio" para fins de `required` (null/undefined/string em branco). */
const isEmpty = (value: unknown): boolean =>
    value == null || (typeof value === 'string' && value.trim().length === 0) || value === false;

/** Comprimento textual do valor (coerção segura para string). */
const lengthOf = (value: unknown): number =>
    value == null ? 0 : String(value).length;

/** Compila um regex do JSON sem lançar: `pattern` inválido => sem match (loga aviso). */
const compilePattern = (source: unknown): RegExp | null => {
    if (typeof source !== 'string' || source.length === 0) return null;
    try {
        return new RegExp(source);
    } catch {
        console.warn(`[Sarak:Validate] pattern inválido ignorado: "${source}".`);
        return null;
    }
};

/** Aplica uma regra isolada; retorna o erro se falhar, ou null. */
const applyRule = (value: unknown, rule: ValidationRule): ValidationError | null => {
    switch (rule.rule) {
        case 'required':
            return isEmpty(value) ? { rule: 'required', message: messageFor(rule) } : null;

        case 'minLength': {
            // Campo vazio é problema de `required`, não de comprimento.
            if (isEmpty(value)) return null;
            const min = typeof rule.value === 'number' ? rule.value : Number(rule.value);
            return Number.isFinite(min) && lengthOf(value) < min
                ? { rule: 'minLength', message: messageFor(rule) }
                : null;
        }

        case 'maxLength': {
            const max = typeof rule.value === 'number' ? rule.value : Number(rule.value);
            return Number.isFinite(max) && lengthOf(value) > max
                ? { rule: 'maxLength', message: messageFor(rule) }
                : null;
        }

        case 'pattern': {
            if (isEmpty(value)) return null;
            const re = compilePattern(rule.value);
            return re && !re.test(String(value))
                ? { rule: 'pattern', message: messageFor(rule) }
                : null;
        }

        case 'type': {
            if (isEmpty(value)) return null;
            const typeName = rule.value as ValidationTypeName | undefined;
            const re = typeName ? TYPE_PATTERNS[typeName] : undefined;
            return re && !re.test(String(value))
                ? { rule: 'type', message: messageFor(rule) }
                : null;
        }

        default:
            return null;
    }
};

/**
 * Valida um valor contra um schema, retornando TODOS os erros (na ordem das regras).
 * Determinístico: mesmo valor + schema => mesmo resultado.
 */
export const validateValue = (
    value: unknown,
    schema: ValidationSchema | undefined,
): ValidationError[] => {
    if (!schema || schema.length === 0) return [];
    const errors: ValidationError[] = [];
    for (const rule of schema) {
        const error = applyRule(value, rule);
        if (error) errors.push(error);
    }
    return errors;
};

/** Conveniência: primeira mensagem de erro de um campo (a exibida abaixo do input). */
export const firstErrorMessage = (
    value: unknown,
    schema: ValidationSchema | undefined,
): string | undefined => validateValue(value, schema)[0]?.message;
