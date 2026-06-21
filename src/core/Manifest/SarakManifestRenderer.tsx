/**
 * SarakManifestRenderer — versão MÍNIMA (harness da Onda 0)
 *
 * Conforme a nota da §3.1 do índice do plano, o Renderer (Spec 30) existe em versão
 * mínima já na Onda 0 para PROVAR a fundação (20/21/22) ponta-a-ponta. Esta versão:
 *  - valida o nó raiz (Spec 20, Regra 5) e cai no fallback de "Manifesto Inválido";
 *  - resolve `type` pelo Component Registry (Spec 22);
 *  - separa `props` de diretivas e repassa SOMENTE `props` ao átomo — diretivas
 *    NUNCA vazam ao DOM (Spec 20, Regra 4);
 *  - renderiza `children` recursivamente, isolando types desconhecidos no fallback.
 *
 * O processamento das diretivas (renderFor, bindings, actions, renderIf…) é das ondas
 * seguintes; aqui elas são apenas removidas do caminho visual. O `dataStore` é aceito
 * e disponibilizado para essas engines futuras, com a árvore reagindo a mudanças.
 */

import React, { useSyncExternalStore } from 'react';
import type { ManifestNode } from './types';
import { validateManifestRoot } from './validateNode';
import { separateNodeParts } from './validateNode';
import {
    defaultComponentRegistry,
    type ComponentRegistry,
} from './Registry/ComponentRegistry';
import { SarakFallback } from './Registry/Fallback';
import type { SarakDataStore } from './DataStore/SarakDataStore';
import type { StateRecord } from './DataStore/resolvePath';

export interface SarakManifestRendererProps {
    /** Nó raiz do manifesto (deve declarar `schemaVersion`). */
    manifest: unknown;
    /** Store reativo opcional (Spec 21), injetado pelo importador. */
    dataStore?: SarakDataStore<StateRecord>;
    /** Registry a usar; default = singleton da biblioteca. */
    registry?: ComponentRegistry;
}

const renderNode = (
    node: ManifestNode,
    registry: ComponentRegistry,
    path: string,
): React.ReactNode => {
    const { Component, isFallback } = registry.resolve(node.type, node.id ?? path);
    if (isFallback) {
        return <SarakFallback key={path} type={node.type} nodeId={node.id ?? path} />;
    }

    // Regra 4: apenas `props` chegam ao átomo; diretivas ficam de fora do DOM.
    const { props } = separateNodeParts(node);

    const children = node.children?.map((child, index) =>
        renderNode(child, registry, `${path}.children[${index}]`),
    );

    return (
        <Component key={path} {...props}>
            {children}
        </Component>
    );
};

/**
 * Harness que materializa um manifesto. Se o store for fornecido, a árvore re-renderiza
 * quando o estado muda (plumbing reativo pronto para as engines de binding das ondas 1+).
 */
export const SarakManifestRenderer: React.FC<SarakManifestRendererProps> = ({
    manifest,
    dataStore,
    registry = defaultComponentRegistry,
}) => {
    // Assina o store (no-op se ausente) para reagir a mudanças de estado.
    useSyncExternalStore(
        (onChange) =>
            dataStore ? dataStore.subscribe((s) => s, onChange) : () => undefined,
        () => (dataStore ? dataStore.getSnapshot() : null),
        () => (dataStore ? dataStore.getSnapshot() : null),
    );

    const validation = validateManifestRoot(manifest);
    if (!validation.valid) {
        return (
            <SarakFallback
                type="ManifestoInvalido"
                nodeId={validation.errors[0]?.message}
            />
        );
    }

    return <>{renderNode(manifest as ManifestNode, registry, 'root')}</>;
};

export default SarakManifestRenderer;
