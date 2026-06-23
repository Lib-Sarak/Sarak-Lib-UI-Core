/**
 * Motor de Repetição (Spec 23 — Regras 1, 2, 3, 4)
 *
 * Coração dinâmico do Renderer: intercepta a diretiva `renderFor` de um nó, resolve
 * a lista-fonte no estado (via Spec 24) e multiplica o nó N vezes, injetando um
 * ESCOPO LOCAL por iteração (`item`/`index`) que se sobrepõe ao global (Spec 21).
 *
 * Esta camada é PURA (sem React): devolve a descrição das instâncias a renderizar.
 * O Renderer materializa cada instância e decide (Regra 4) entre map direto e a
 * virtualização da Spec 12 quando a lista passa do limiar.
 *
 * Zero Any: fronteiras em `unknown`/`StateRecord`; nenhuma `any`.
 */

import type { StateRecord } from '../DataStore/resolvePath';
import { getByPath } from '../DataStore/resolvePath';
import { resolveBinding } from '../Binding/interpolate';
import type { ManifestNode } from '../types';

/** Uma instância expandida do nó: o nó-base (sem `renderFor`) + escopo + chave. */
export interface ExpandedNode {
    /** Nó a renderizar — o original sem a diretiva `renderFor` (evita re-expansão). */
    node: ManifestNode;
    /** Escopo local da iteração (pai + `{ [as]: item, [indexAs]: index }`). */
    scope: StateRecord;
    /** Chave estável de reconciliação (Regra 3). */
    key: string;
}

/** Resultado da expansão. `ok=false` quando a fonte não é um Array (Regra 2). */
export interface RenderForResult {
    ok: boolean;
    items: ExpandedNode[];
    /** Mensagem de erro capturável quando `ok=false`. */
    error?: string;
}

/** Limiar de itens a partir do qual o Renderer delega à virtualização (Regra 4). */
export const VIRTUALIZE_THRESHOLD = 100;

/**
 * Teto duro de itens (Spec 40, Regra 5 — limite anti-DoS): mesmo virtualizando, um
 * manifesto hostil com uma lista gigantesca não deve materializar instâncias sem fim.
 * Acima disto a lista é truncada (com aviso), mantendo o navegador estável.
 */
export const MAX_RENDERFOR_ITEMS = 10_000;

const extractKey = (
    item: unknown,
    index: number,
    keyBy: string | undefined,
    nodeId: string | undefined,
): string => {
    if (keyBy) {
        const byPath = getByPath(item, keyBy);
        if (byPath !== undefined && byPath !== null) return String(byPath);
    }
    if (item !== null && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        if (record.id !== undefined && record.id !== null) return String(record.id);
        if (record.uuid !== undefined && record.uuid !== null) return String(record.uuid);
    }
    // Regra 3: chave ausente — fallback para índice, com aviso (reconciliação menos estável).
    console.warn(
        `[Sarak:renderFor] item sem id/uuid${nodeId ? ` no nó "${nodeId}"` : ''}; ` +
        `usando índice ${index} como key.`,
    );
    return String(index);
};

/**
 * Expande um nó que carrega `renderFor`. Retorna a lista de instâncias a renderizar
 * (cada uma com seu escopo local) ou um erro capturável se a fonte não for um Array.
 */
export const expandRenderFor = (
    node: ManifestNode,
    scope: StateRecord,
    globalState: unknown,
): RenderForResult => {
    const directive = node.renderFor;
    if (!directive) {
        return { ok: true, items: [] };
    }

    const source = resolveBinding(directive.source, scope, globalState);
    if (!Array.isArray(source)) {
        return {
            ok: false,
            items: [],
            error:
                `renderFor: a fonte "${directive.source}" não resolveu para um Array ` +
                `(recebido ${source === null ? 'null' : typeof source}).`,
        };
    }

    const asName = directive.as ?? 'item';
    const indexName = directive.indexAs ?? 'index';

    // Nó-base sem a diretiva `renderFor` (impede expansão recursiva infinita).
    const { renderFor: _omit, ...rest } = node;
    void _omit;
    const baseNode = rest as ManifestNode;

    // Teto anti-DoS (Spec 40, Regra 5): trunca listas hostis, mantendo a UI estável.
    const bounded = source.length > MAX_RENDERFOR_ITEMS ? source.slice(0, MAX_RENDERFOR_ITEMS) : source;
    if (bounded.length < source.length) {
        console.warn(
            `[Sarak:renderFor] lista com ${source.length} itens excede o teto ` +
            `(${MAX_RENDERFOR_ITEMS}); truncada${node.id ? ` no nó "${node.id}"` : ''}.`,
        );
    }

    const items: ExpandedNode[] = bounded.map((item, index) => ({
        node: baseNode,
        scope: { ...scope, [asName]: item, [indexName]: index },
        key: extractKey(item, index, directive.keyBy, node.id),
    }));

    return { ok: true, items };
};
