/**
 * Validação da Gramática do Nó (Spec 20 — Regras 1, 3, 4, 5)
 *
 * Determinístico, sem `any`. Responsável por:
 *  - separar `props` (visual) de diretivas (comportamento) — Regra 4;
 *  - rejeitar chave de topo desconhecida (ex.: `renderForr`) com `path`/`id` do nó
 *    culpado — Regra 3 (erro de validação, não silêncio);
 *  - validar `schemaVersion` do nó raiz — Regra 5.
 */

import type {
    ManifestNode,
    ManifestProps,
    ManifestRoot,
} from './types';
import { SUPPORTED_SCHEMA_VERSION } from './types';
import {
    isReservedDirective,
    isStructuralKey,
    type DirectiveName,
} from './directives';

/** Um erro de validação do manifesto, com localização do nó culpado. */
export interface ManifestValidationError {
    /** Caminho do nó na árvore (ex.: `root.children[2].slots.header`). */
    path: string;
    /** `id` do nó culpado, se declarado. */
    nodeId?: string;
    /** Código da falha. */
    code: 'unknown_key' | 'invalid_type' | 'unsupported_schema_version' | 'invalid_children';
    /** Mensagem legível. */
    message: string;
}

/** Resultado da validação de um nó (ou árvore). */
export interface ManifestValidationResult {
    valid: boolean;
    errors: ManifestValidationError[];
}

/** Partes de um nó separadas por responsabilidade (Regra 4). */
export interface NodeParts {
    /** Apenas dados visuais — o que chega ao átomo. */
    props: ManifestProps;
    /** Diretivas de comportamento presentes no nó (nunca vão ao DOM). */
    directives: Partial<Record<DirectiveName, unknown>>;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Separa `props` das diretivas de um nó já validado (Regra 4).
 * As chaves estruturais (type/id/children/slots/schemaVersion) não entram em nenhum lado.
 */
export const separateNodeParts = (node: ManifestNode): NodeParts => {
    const directives: Partial<Record<DirectiveName, unknown>> = {};

    for (const key of Object.keys(node)) {
        if (isReservedDirective(key)) {
            directives[key] = (node as unknown as Record<string, unknown>)[key];
        }
    }

    return {
        props: node.props ?? {},
        directives,
    };
};

const validateSingleNode = (
    node: unknown,
    path: string,
    errors: ManifestValidationError[],
): void => {
    if (!isPlainObject(node)) {
        errors.push({
            path,
            code: 'invalid_type',
            message: `Nó inválido em "${path}": esperado objeto, recebido ${node === null ? 'null' : typeof node}.`,
        });
        return;
    }

    const nodeId = typeof node.id === 'string' ? node.id : undefined;

    if (typeof node.type !== 'string' || node.type.length === 0) {
        errors.push({
            path,
            nodeId,
            code: 'invalid_type',
            message: `Nó em "${path}" não declara um "type" string válido.`,
        });
    }

    // Regra 3: toda chave de topo deve ser estrutural OU diretiva reservada conhecida.
    for (const key of Object.keys(node)) {
        if (isStructuralKey(key) || isReservedDirective(key)) continue;
        errors.push({
            path,
            nodeId,
            code: 'unknown_key',
            message: `Chave desconhecida "${key}" no nó "${path}"${nodeId ? ` (id: "${nodeId}")` : ''}. Não é estrutural nem uma diretiva reservada — verifique a grafia.`,
        });
    }

    // Recursão em children.
    if (node.children !== undefined) {
        if (!Array.isArray(node.children)) {
            errors.push({
                path,
                nodeId,
                code: 'invalid_children',
                message: `"children" em "${path}" deve ser um array de nós.`,
            });
        } else {
            node.children.forEach((child, index) => {
                validateSingleNode(child, `${path}.children[${index}]`, errors);
            });
        }
    }

    // Recursão em slots nomeados (Regra 6).
    if (node.slots !== undefined) {
        if (!isPlainObject(node.slots)) {
            errors.push({
                path,
                nodeId,
                code: 'invalid_type',
                message: `"slots" em "${path}" deve ser um mapa de nós nomeados.`,
            });
        } else {
            for (const [slotName, slotNode] of Object.entries(node.slots)) {
                validateSingleNode(slotNode, `${path}.slots.${slotName}`, errors);
            }
        }
    }
};

/**
 * Valida um nó (e toda a sub-árvore) contra a gramática da Spec 20.
 * Não lança: devolve a lista de erros para o chamador decidir o fallback.
 */
export const validateManifestNode = (
    node: unknown,
    path = 'root',
): ManifestValidationResult => {
    const errors: ManifestValidationError[] = [];
    validateSingleNode(node, path, errors);
    return { valid: errors.length === 0, errors };
};

/**
 * Valida o nó raiz: além da gramática, exige `schemaVersion` compatível (Regra 5).
 * Aciona o fallback de "Manifesto de UI Inválido" quando a versão é incompatível.
 */
export const validateManifestRoot = (
    root: unknown,
): ManifestValidationResult => {
    const result = validateManifestNode(root, 'root');
    const errors = [...result.errors];

    if (isPlainObject(root)) {
        const version = (root as Partial<ManifestRoot>).schemaVersion;
        if (version !== SUPPORTED_SCHEMA_VERSION) {
            errors.push({
                path: 'root',
                code: 'unsupported_schema_version',
                message: `schemaVersion incompatível: esperado ${SUPPORTED_SCHEMA_VERSION}, recebido ${String(version)}. Manifesto de UI Inválido.`,
            });
        }
    }

    return { valid: errors.length === 0, errors };
};
