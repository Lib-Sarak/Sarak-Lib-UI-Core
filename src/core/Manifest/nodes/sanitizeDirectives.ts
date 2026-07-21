/**
 * Resiliência leniente por diretiva (Spec 17, §2.1).
 *
 * Erro de AUTORIA no manifesto (ex.: `"actions": { "onClick": [...] }` — objeto no
 * lugar do array) NÃO é falha de runtime: não deve derrubar o container. Esta função
 * PURA valida o FORMATO de cada diretiva reservada e, quando o autor errou, IGNORA a
 * diretiva (devolve o nó sem ela) e produz um aviso estruturado com o exemplo correto.
 * O motor então renderiza o nó normalmente (degrada em vez de explodir).
 *
 * Fonte da verdade dos formatos: `directives.ts` (nomes) + `types.ts` (shapes).
 * NÃO afrouxa segurança: só reclassifica erro de autoria de diretiva — Safe Eval,
 * sanitizeHtml e limites anti-DoS seguem intactos (§2.3).
 */

import { RESERVED_DIRECTIVES, type DirectiveName } from '../directives';
import type { ManifestNode, ValidationRuleName } from '../types';
import { VALIDATION_RULE_SHAPES, VALIDATION_TYPE_NAMES } from '../Form/validationRuleShapes';

/** Aviso de uma diretiva ignorada, com chave estável de deduplicação por nó. */
export interface DirectiveWarning {
    /** Chave de dedupe: `${ref}:${directive}` (ref = id|path do nó). */
    key: string;
    /** Nome da diretiva removida. */
    directive: DirectiveName;
    /** Mensagem pronta para `console.warn`. */
    message: string;
}

/** Resultado da higienização: o nó (limpo, se preciso) e os avisos gerados. */
export interface SanitizeResult {
    node: ManifestNode;
    warnings: DirectiveWarning[];
}

const typeName = (value: unknown): string =>
    value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const hasStringField = (value: unknown, field: string): boolean =>
    isObject(value) && typeof value[field] === 'string' && (value[field] as string).length > 0;

/** Predicado de validade + descrição do esperado + exemplo correto, por diretiva. */
interface DirectiveShape {
    valid: (value: unknown) => boolean;
    expected: string;
    example: string;
}

const DIRECTIVE_SHAPES: Readonly<Record<DirectiveName, DirectiveShape>> = {
    slots: { valid: isObject, expected: 'objeto (mapa de nós nomeados)', example: '"slots": { "header": { "type": "SarakCard" } }' },
    renderFor: { valid: (v) => hasStringField(v, 'source'), expected: "objeto com 'source' string", example: '"renderFor": { "source": "{{items}}" }' },
    bindings: { valid: Array.isArray, expected: 'array de strings', example: '"bindings": ["{{a}}"]' },
    actions: { valid: Array.isArray, expected: 'array', example: '"actions": [{ "type": "navigate", "payload": { "to": "/x" } }]' },
    onError: { valid: Array.isArray, expected: 'array', example: '"onError": [{ "type": "trigger_toast", "payload": { "message": "Falha" } }]' },
    renderIf: { valid: (v) => typeof v === 'string', expected: 'string (expressão)', example: "\"renderIf\": \"{{role}} === 'ADMIN'\"" },
    disabledIf: { valid: (v) => typeof v === 'string', expected: 'string (expressão)', example: '"disabledIf": "{{loading}}"' },
    persistState: { valid: (v) => hasStringField(v, 'key'), expected: "objeto com 'key' string", example: '"persistState": { "key": "user.name" }' },
    validation: { valid: Array.isArray, expected: 'array de regras', example: '"validation": [{ "rule": "required" }]' },
    source: { valid: (v) => hasStringField(v, 'endpoint') && hasStringField(v, 'into'), expected: "objeto com 'endpoint' e 'into' string", example: '"source": { "endpoint": "/api/x", "into": "items" }' },
    model: { valid: (v) => hasStringField(v, 'path'), expected: "objeto com 'path' string", example: '"model": { "path": "user.name" }' },
    form: { valid: (v) => hasStringField(v, 'id'), expected: "objeto com 'id' string", example: '"form": { "id": "signup" }' },
    responsive: { valid: isObject, expected: 'objeto (mob/tab/desk)', example: '"responsive": { "desk": { "gap": "spacing-lg" } }' },
    shell: { valid: (v) => isObject(v) && typeof v.content === 'string', expected: "objeto com 'content' string", example: '"shell": { "content": "<slot-rotas>" }' },
    routes: { valid: isObject, expected: 'objeto (mapa de rotas)', example: '"routes": { "/": { "type": "SarakFlex" } }' },
    theme: { valid: (v) => typeof v === 'string' || isObject(v), expected: 'string (preset) ou objeto (override)', example: '"theme": "dark"' },
    aria: { valid: isObject, expected: 'objeto (mapa aria)', example: '"aria": { "label": "Fechar" }' },
};

/** True se `value` é um número finito, aceitando string numérica (mesma coerção do `validate.ts`). */
const isFiniteNumeric = (value: unknown): boolean =>
    typeof value === 'number'
        ? Number.isFinite(value)
        : typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Number(value));

/** Valida o `value` de uma regra CONHECIDA contra o shape esperado (Spec 28 §2.3). */
const isValidRuleValue = (ruleName: ValidationRuleName, value: unknown): boolean => {
    switch (ruleName) {
        case 'minLength':
        case 'maxLength':
            return isFiniteNumeric(value);
        case 'pattern':
            return typeof value === 'string' && value.length > 0;
        case 'type':
            return typeof value === 'string' && (VALIDATION_TYPE_NAMES as readonly string[]).includes(value);
        case 'required':
        default:
            return true;
    }
};

/**
 * Sanitiza os ITENS de `validation` (Spec 28 §2.3): diferente das demais diretivas, um
 * item malformado NÃO descarta o array inteiro — só a regra culpada é removida (as
 * demais regras do mesmo campo continuam validando normalmente). Chamada só quando o
 * `validation` já passou pelo shape genérico (é um array) — nunca antes.
 */
const sanitizeValidationRules = (
    rules: unknown[],
    ref: string,
): { rules: unknown[]; warnings: DirectiveWarning[] } => {
    const warnings: DirectiveWarning[] = [];
    const kept: unknown[] = [];

    rules.forEach((rule, index) => {
        const ruleName = isObject(rule) ? rule.rule : undefined;
        if (typeof ruleName !== 'string' || !(ruleName in VALIDATION_RULE_SHAPES)) {
            warnings.push({
                key: `${ref}:validation[${index}]`,
                directive: 'validation',
                message:
                    `[Sarak:Manifest] nó "${ref}": item ${index} de "validation" tem "rule" desconhecida/ausente ` +
                    `(recebido ${JSON.stringify(ruleName)}). Regras aceitas: required, minLength, maxLength, ` +
                    `pattern, type. Ex.: ${VALIDATION_RULE_SHAPES.required.example}`,
            });
            return;
        }

        const shape = VALIDATION_RULE_SHAPES[ruleName as ValidationRuleName];
        const value = (rule as Record<string, unknown>).value;
        if (shape.requiresValue && !isValidRuleValue(ruleName as ValidationRuleName, value)) {
            warnings.push({
                key: `${ref}:validation[${index}]`,
                directive: 'validation',
                message:
                    `[Sarak:Manifest] nó "${ref}": item ${index} de "validation" (rule "${ruleName}") tem ` +
                    `"value" ausente/inválido (esperado ${shape.valueHint}). Ex.: ${shape.example}`,
            });
            return;
        }

        kept.push(rule);
    });

    return { rules: kept, warnings };
};

/**
 * Devolve o nó com toda diretiva MAL FORMATADA removida + os avisos correspondentes.
 * Diretivas válidas (e nós sem diretivas) passam intactos — o nó original é reusado
 * sem cópia quando nada precisa ser removido (barato no caminho feliz).
 * `ref` é o identificador do nó (id, senão path) usado na mensagem e no dedupe.
 */
export const sanitizeDirectives = (node: ManifestNode, ref: string): SanitizeResult => {
    let cleaned: ManifestNode | null = null;
    const warnings: DirectiveWarning[] = [];

    for (const directive of RESERVED_DIRECTIVES) {
        const value = (node as unknown as Record<string, unknown>)[directive];
        if (value === undefined) continue;
        if (DIRECTIVE_SHAPES[directive].valid(value)) continue;

        if (!cleaned) cleaned = { ...node };
        delete (cleaned as unknown as Record<string, unknown>)[directive];

        const shape = DIRECTIVE_SHAPES[directive];
        warnings.push({
            key: `${ref}:${directive}`,
            directive,
            message:
                `[Sarak:Manifest] nó "${ref}": diretiva "${directive}" inválida ` +
                `(esperado ${shape.expected}, recebido ${typeName(value)}). ` +
                `Diretiva ignorada. Ex. correto: ${shape.example}`,
        });
    }

    // Validação de ITEM dentro de `validation` (Spec 28 §2.3): só roda se o array em si
    // já é válido (senão o laço acima já removeu a diretiva inteira e avisou sobre isso).
    const rawValidation = (node as unknown as Record<string, unknown>).validation;
    if (Array.isArray(rawValidation)) {
        const { rules, warnings: ruleWarnings } = sanitizeValidationRules(rawValidation, ref);
        if (ruleWarnings.length > 0) {
            if (!cleaned) cleaned = { ...node };
            (cleaned as unknown as Record<string, unknown>).validation = rules;
            warnings.push(...ruleWarnings);
        }
    }

    return { node: cleaned ?? node, warnings };
};

/** Cache de avisos já emitidos (por nó+diretiva) — não spammar a cada re-render. */
const warnedKeys = new Set<string>();

/** Reseta o cache de avisos de diretiva (uso em testes). */
export const resetDirectiveWarnings = (): void => warnedKeys.clear();

/** Emite cada aviso no console UMA vez (deduplicado pela `key` estável do nó). */
export const emitDirectiveWarnings = (warnings: DirectiveWarning[]): void => {
    for (const warning of warnings) {
        if (warnedKeys.has(warning.key)) continue;
        warnedKeys.add(warning.key);
        console.warn(warning.message);
    }
};
