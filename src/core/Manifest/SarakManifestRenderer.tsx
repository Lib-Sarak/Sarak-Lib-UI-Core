/**
 * SarakManifestRenderer — Renderer com Motor de Dados Vivo (Onda 1)
 *
 * Evolução do harness da Onda 0: o nó deixa de ser uma função pura que descarta
 * diretivas e passa a ser um COMPONENTE (`ManifestNodeRenderer`) que processa, na
 * descida da árvore, o pipeline de diretivas desta onda:
 *
 *   1. `source` (Spec 31) — carrega dados ao montar e decide loading/empty/error;
 *   2. `renderFor` (Spec 23) — expande em N instâncias com escopo local;
 *   3. interpolação de `props` (Spec 24) — resolve `{{ }}` com escopo+estado;
 *   4. resolve `type` (Spec 22) e renderiza, recursando em `children`.
 *
 * Reatividade (Spec 24, Regra 3): a raiz assina o DataStore; qualquer `mutate_state`
 * reexecuta a árvore e re-interpola os textos. A diretiva `source` é a primeira fatia
 * da finalização do contrato do importador (Spec 30), via `networkInterceptor`.
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
import { interpolateProps } from './Binding/interpolate';
import { expandRenderFor, VIRTUALIZE_THRESHOLD } from './RenderFor/expandRenderFor';
import { useDataSource, type NetworkInterceptor } from './DataSource/useDataSource';
import { SarakDataGrid } from '../../components/atomic/DataDisplay/SarakDataGrid';
import { SarakSkeleton } from '../../components/atomic/Feedback/SarakSkeleton';
import { SarakDataEmpty } from '../../components/atomic/Feedback/SarakDataEmpty';

export interface SarakManifestRendererProps {
    /** Nó raiz do manifesto (deve declarar `schemaVersion`). */
    manifest: unknown;
    /** Store reativo opcional (Spec 21), injetado pelo importador. */
    dataStore?: SarakDataStore<StateRecord>;
    /** Registry a usar; default = singleton da biblioteca. */
    registry?: ComponentRegistry;
    /** Interceptor de rede injetado (Spec 31, Regra 5) — toda E/S passa por ele. */
    networkInterceptor?: NetworkInterceptor;
}

/** Contexto compartilhado por toda a árvore durante uma renderização. */
interface NodeRenderContext {
    registry: ComponentRegistry;
    store?: SarakDataStore<StateRecord>;
    interceptor?: NetworkInterceptor;
    /** Snapshot atual do estado global (para interpolação e resolução de listas). */
    global: unknown;
}

interface NodeRendererProps {
    node: ManifestNode;
    path: string;
    scope: StateRecord;
    ctx: NodeRenderContext;
}

const EMPTY_STATE: StateRecord = {};

/**
 * Nó com `source` (Spec 31): carrega dados e escolhe entre Skeleton / Empty /
 * Fallback / conteúdo. Em `success`, renderiza o próprio nó SEM a diretiva `source`
 * (seus filhos, com `renderFor`, iteram os dados já depositados no DataStore).
 */
const DataSourceNode: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
    const directive = node.source;
    const controller = useDataSource(
        // `directive` é garantido pelo chamador (só renderiza este nó se houver `source`).
        directive as NonNullable<ManifestNode['source']>,
        ctx.store,
        ctx.interceptor,
        scope,
        ctx.global,
    );

    const states = directive?.states;

    if (controller.state === 'loading') {
        return states?.loading
            ? <ManifestNodeRenderer node={states.loading} path={`${path}.loading`} scope={scope} ctx={ctx} />
            : <SarakSkeleton />;
    }
    if (controller.state === 'empty') {
        return states?.empty
            ? <ManifestNodeRenderer node={states.empty} path={`${path}.empty`} scope={scope} ctx={ctx} />
            : <SarakDataEmpty />;
    }
    if (controller.state === 'error') {
        return states?.error
            ? <ManifestNodeRenderer node={states.error} path={`${path}.error`} scope={scope} ctx={ctx} />
            : <SarakFallback type="FonteDeDados" nodeId={node.id ?? path} />;
    }

    // success: renderiza o nó sem `source` (evita re-disparo) — filhos iteram os dados.
    const { source: _omit, ...rest } = node;
    void _omit;
    return <ManifestNodeRenderer node={rest as ManifestNode} path={path} scope={scope} ctx={ctx} />;
};

/**
 * Componente recursivo de um nó do manifesto. Como `source` usa hooks, cada nó é um
 * componente (hooks por-nó são legais). Processa o pipeline de diretivas da Onda 1.
 */
const ManifestNodeRenderer: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
    // 1. Fonte de dados declarativa (Spec 31).
    if (node.source) {
        return <DataSourceNode node={node} path={path} scope={scope} ctx={ctx} />;
    }

    // 2. Motor de repetição (Spec 23).
    if (node.renderFor) {
        const result = expandRenderFor(node, scope, ctx.global);
        if (!result.ok) {
            return <SarakFallback type="renderForInvalido" nodeId={result.error} />;
        }

        const renderInstance = (index: number): React.ReactNode => {
            const instance = result.items[index];
            return (
                <ManifestNodeRenderer
                    node={instance.node}
                    path={`${path}[${index}]`}
                    scope={instance.scope}
                    ctx={ctx}
                />
            );
        };

        // Regra 4: listas grandes delegam à virtualização (Spec 12), carregada lazy.
        if (result.items.length > VIRTUALIZE_THRESHOLD) {
            return (
                <React.Suspense fallback={<SarakSkeleton />}>
                    <SarakDataGrid
                        count={result.items.length}
                        renderRow={renderInstance}
                    />
                </React.Suspense>
            );
        }

        return (
            <>
                {result.items.map((instance, index) => (
                    <React.Fragment key={instance.key}>{renderInstance(index)}</React.Fragment>
                ))}
            </>
        );
    }

    // 3. Resolução do componente + interpolação das props (Spec 22 + Spec 24).
    const { Component, isFallback } = ctx.registry.resolve(node.type, node.id ?? path);
    if (isFallback) {
        return <SarakFallback type={node.type} nodeId={node.id ?? path} />;
    }

    const { props } = separateNodeParts(node);
    const interpolated = interpolateProps(props, scope, ctx.global);

    const children = node.children?.map((child, index) => (
        <ManifestNodeRenderer
            key={`${path}.children[${index}]`}
            node={child}
            path={`${path}.children[${index}]`}
            scope={scope}
            ctx={ctx}
        />
    ));

    return <Component {...interpolated}>{children}</Component>;
};

/**
 * Materializa um manifesto. Assina o DataStore (se fornecido) para reagir a mudanças
 * de estado e re-interpolar a árvore. Toda a saída fica sob `<Suspense>` para acomodar
 * componentes pesados carregados via `React.lazy` (ex.: virtualização do DataGrid).
 */
export const SarakManifestRenderer: React.FC<SarakManifestRendererProps> = ({
    manifest,
    dataStore,
    registry = defaultComponentRegistry,
    networkInterceptor,
}) => {
    const snapshot = useSyncExternalStore(
        (onChange) =>
            dataStore ? dataStore.subscribe((s) => s, onChange) : () => undefined,
        () => (dataStore ? dataStore.getSnapshot() : EMPTY_STATE),
        () => (dataStore ? dataStore.getSnapshot() : EMPTY_STATE),
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

    const ctx: NodeRenderContext = {
        registry,
        store: dataStore,
        interceptor: networkInterceptor,
        global: snapshot ?? EMPTY_STATE,
    };

    return (
        <React.Suspense fallback={<SarakSkeleton />}>
            <ManifestNodeRenderer
                node={manifest as ManifestNode}
                path="root"
                scope={EMPTY_STATE}
                ctx={ctx}
            />
        </React.Suspense>
    );
};

export default SarakManifestRenderer;
