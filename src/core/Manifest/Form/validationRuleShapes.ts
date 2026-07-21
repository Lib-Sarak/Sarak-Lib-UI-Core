/**
 * Shape canônico de cada regra de `validation` (Spec 28 §2.3/2.4) — fonte ÚNICA
 * consumida por `sanitizeDirectives` (warn de item malformado, sem derrubar o motor)
 * e pelo gerador do catálogo (`scripts/generate-manifest-catalog.mjs`, seção "Regras
 * de validation"). Nunca duplique este mapa em outro lugar.
 */
import type { ValidationRuleName, ValidationTypeName } from '../types';

/** Descrição documental + exemplo copiável de uma regra de `validation`. */
export interface ValidationRuleShape {
    /** Se a regra exige o campo `value` (todas menos `required`). */
    requiresValue: boolean;
    /** Descrição do que `value` espera — usada na doc gerada e na mensagem de warn. */
    valueHint: string;
    /** Exemplo de item de `validation` pronto para copiar. */
    example: string;
}

export const VALIDATION_RULE_SHAPES: Readonly<Record<ValidationRuleName, ValidationRuleShape>> = {
    required: {
        requiresValue: false,
        valueHint: 'nenhum (dispensa `value`)',
        example: '{ "rule": "required" }',
    },
    minLength: {
        requiresValue: true,
        valueHint: 'número — comprimento mínimo',
        example: '{ "rule": "minLength", "value": 3 }',
    },
    maxLength: {
        requiresValue: true,
        valueHint: 'número — comprimento máximo',
        example: '{ "rule": "maxLength", "value": 120 }',
    },
    pattern: {
        requiresValue: true,
        valueHint: 'string — fonte de um regex',
        example: '{ "rule": "pattern", "value": "^[0-9]{5}(-[0-9]{4})?$" }',
    },
    type: {
        requiresValue: true,
        valueHint: '"email" | "url" | "numero"',
        example: '{ "rule": "type", "value": "email" }',
    },
};

export const VALIDATION_TYPE_NAMES: readonly ValidationTypeName[] = ['email', 'url', 'numero'];
