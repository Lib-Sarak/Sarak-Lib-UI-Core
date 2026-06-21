/**
 * Motor de Interpolação / Data Binding (Spec 24 — Regras 1, 3, 4)
 *
 * Interpretador léxico que caça templates `{{ ... }}` no manifesto e os substitui
 * pelo estado correspondente em tempo de execução, aplicando pipes de formatação.
 *
 * Princípios:
 *  - Resolução SEGURA (Regra 1): reusa `resolveScopedPath` da Spec 21 — caminho
 *    ausente vira `''` (ou o fallback `|| 'literal'`), nunca lança.
 *  - Reativo (Regra 3): puro e síncrono; o Renderer reexecuta a interpolação quando
 *    o DataStore muda (via `useSyncExternalStore` na raiz).
 *  - Anti-XSS (Regra 4): produz apenas `string`/valor primitivo, nunca HTML cru.
 *
 * Zero Any: a fronteira dinâmica é `unknown` + `ManifestValue`; sem `any`.
 */

import { resolveScopedPath } from '../DataStore/resolvePath';
import type { StateRecord } from '../DataStore/resolvePath';
import type { ManifestProps, ManifestValue } from '../types';
import { getPipe } from './pipes';

/** Captura cada ocorrência `{{ expr }}` numa string. */
const TEMPLATE_RE = /\{\{([^}]+)\}\}/g;

/** Casa quando a string INTEIRA é um único `{{ expr }}` (preserva o tipo do valor). */
const SINGLE_RE = /^\s*\{\{([^}]+)\}\}\s*$/;

/** Remove aspas simples/duplas externas de um literal de fallback/argumento. */
const stripQuotes = (raw: string): string => {
    const t = raw.trim();
    if (t.length >= 2) {
        const first = t[0];
        const last = t[t.length - 1];
        if ((first === "'" || first === '"') && first === last) {
            return t.slice(1, -1);
        }
    }
    return t;
};

/** Interpreta um literal de fallback: string entre aspas, número ou booleano. */
const parseLiteral = (raw: string): ManifestValue => {
    const t = raw.trim();
    if (t.length >= 2 && ((t[0] === "'" && t.endsWith("'")) || (t[0] === '"' && t.endsWith('"')))) {
        return t.slice(1, -1);
    }
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t === 'null') return null;
    if (t !== '' && Number.isFinite(Number(t))) return Number(t);
    return t;
};

/**
 * Quebra uma expressão em segmentos pelo pipe `|`, tratando `||` (OR de fallback)
 * como parte do segmento — nunca como separador de pipe.
 */
const splitPipeSegments = (expr: string): string[] => {
    const parts: string[] = [];
    let buffer = '';
    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (ch === '|') {
            if (expr[i + 1] === '|') {
                buffer += '||';
                i++;
                continue;
            }
            parts.push(buffer);
            buffer = '';
            continue;
        }
        buffer += ch;
    }
    parts.push(buffer);
    return parts.map((p) => p.trim());
};

const applyPipeSegment = (value: unknown, segment: string): unknown => {
    const colon = segment.indexOf(':');
    const name = (colon === -1 ? segment : segment.slice(0, colon)).trim();
    if (name.length === 0) return value;

    const pipe = getPipe(name);
    if (!pipe) {
        console.warn(`[Sarak:Binding] pipe desconhecido "${name}"; valor repassado sem formatação.`);
        return value;
    }

    const argsRaw = colon === -1 ? '' : segment.slice(colon + 1);
    const args = argsRaw.trim().length === 0
        ? []
        : argsRaw.split(',').map((a) => stripQuotes(a));

    return pipe(value, ...args);
};

/**
 * Resolve UMA expressão de template (o conteúdo entre `{{ }}`): caminho + fallback
 * `|| 'literal'` opcional + pipes encadeados. Retorna o valor cru (sem `String()`),
 * para que props possam preservar o tipo (ex.: `"{{count}}"` → número).
 */
export const resolveExpression = (
    expr: string,
    scope: StateRecord,
    globalState: unknown,
): unknown => {
    const segments = splitPipeSegments(expr);
    const head = segments[0] ?? '';
    const pipeSegments = segments.slice(1);

    const orIndex = head.indexOf('||');
    const pathPart = (orIndex === -1 ? head : head.slice(0, orIndex)).trim();
    const fallbackPart = orIndex === -1 ? undefined : head.slice(orIndex + 2).trim();

    let value: unknown = resolveScopedPath(pathPart, scope, globalState);
    if ((value === undefined || value === null) && fallbackPart !== undefined && fallbackPart.length > 0) {
        value = parseLiteral(fallbackPart);
    }

    for (const segment of pipeSegments) {
        value = applyPipeSegment(value, segment);
    }
    return value;
};

/**
 * Resolve um binding solto (`"{{users}}"` ou `"users"`) ao seu valor cru.
 * Usado pelo motor de repetição (Spec 23) para obter a lista a iterar.
 */
export const resolveBinding = (
    binding: string,
    scope: StateRecord,
    globalState: unknown,
): unknown => {
    const single = binding.match(SINGLE_RE);
    const expr = single ? single[1] : binding;
    return resolveExpression(expr, scope, globalState);
};

/**
 * Substitui todos os `{{ ... }}` de uma string pelo texto resolvido. Valores
 * ausentes (`undefined`/`null`) viram `''` (Regra 1).
 */
export const interpolate = (
    template: string,
    scope: StateRecord,
    globalState: unknown,
): string =>
    template.replace(TEMPLATE_RE, (_match, expr: string) => {
        const resolved = resolveExpression(expr, scope, globalState);
        return resolved === undefined || resolved === null ? '' : String(resolved);
    });

/**
 * Interpola um único `ManifestValue` recursivamente:
 *  - string que é só `{{expr}}` → valor cru (preserva tipo);
 *  - string com texto + `{{}}` → interpolação textual;
 *  - arrays/objetos → recursão; primitivos → inalterados.
 */
const interpolateValue = (
    value: ManifestValue,
    scope: StateRecord,
    globalState: unknown,
): ManifestValue => {
    if (typeof value === 'string') {
        const single = value.match(SINGLE_RE);
        if (single) {
            const resolved = resolveExpression(single[1], scope, globalState);
            return (resolved ?? null) as ManifestValue;
        }
        if (value.includes('{{')) {
            return interpolate(value, scope, globalState);
        }
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => interpolateValue(item, scope, globalState));
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, ManifestValue> = {};
        for (const [key, item] of Object.entries(value)) {
            out[key] = interpolateValue(item, scope, globalState);
        }
        return out;
    }
    return value;
};

/**
 * Interpola todas as `props` visuais de um nó contra o escopo+estado atuais.
 * O que chega ao átomo já vem com as variáveis resolvidas (Regra 3).
 */
export const interpolateProps = (
    props: ManifestProps,
    scope: StateRecord,
    globalState: unknown,
): ManifestProps => {
    const out: ManifestProps = {};
    for (const [key, value] of Object.entries(props)) {
        out[key] = interpolateValue(value, scope, globalState);
    }
    return out;
};
