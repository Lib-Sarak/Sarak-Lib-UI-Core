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

import React, { useMemo, useSyncExternalStore } from 'react';
import type { ManifestNode } from './types';
import { validateManifestRoot } from './validateNode';
import {
    defaultComponentRegistry,
    type ComponentRegistry,
} from './Registry/ComponentRegistry';
import { SarakFallback } from './Registry/Fallback';
import type { SarakDataStore } from './DataStore/SarakDataStore';
import type { StateRecord } from './DataStore/resolvePath';
import { evaluateCondition } from './Conditional/evaluateCondition';
import { expandRenderFor, VIRTUALIZE_THRESHOLD } from './RenderFor/expandRenderFor';
import { useDataSource, type NetworkInterceptor } from './DataSource/useDataSource';
import type { NavigateFn } from './Dispatcher';
import { LeafNode } from './nodes/LeafNode';
import { createFormScope } from './Form/formScope';
import { FormScopeContext } from './Form/context';
import { EMPTY_STATE, type NodeRenderContext, type NodeRendererProps } from './nodes/context';
import { SarakDataGrid } from '../../components/atomic/DataDisplay/SarakDataGrid';
import { SarakSkeleton } from '../../components/atomic/Feedback/SarakSkeleton';
import { SarakDataEmpty } from '../../components/atomic/Feedback/SarakDataEmpty';
import { useToast } from '../../components/atomic/Feedback/SarakToast';
import { useOverlay } from '../../components/atomic/Modals/SarakOverlayProvider';

export interface SarakManifestRendererProps {
    /** Nó raiz do manifesto (deve declarar `schemaVersion`). */
    manifest: unknown;
    /** Store reativo opcional (Spec 21), injetado pelo importador. */
    dataStore?: SarakDataStore<StateRecord>;
    /** Registry a usar; default = singleton da biblioteca. */
    registry?: ComponentRegistry;
    /** Interceptor de rede injetado (Spec 31, Regra 5) — toda E/S passa por ele. */
    networkInterceptor?: NetworkInterceptor;
    /** Callback de navegação do importador (Spec 25, ação `navigate`). */
    onNavigate?: NavigateFn;
}

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
 * Nó com `form` (Spec 32): cria um escopo de formulário (valores no DataStore; meta-estado
 * dirty/touched/erros isolado) e o provê à sub-árvore. Os campos descendentes com `model`
 * se registram nele; o botão de submit consulta sua validade via Dispatcher.
 */
const FormNode: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
    const formId = node.form?.id ?? path;
    const formScope = useMemo(() => createFormScope(formId, ctx.store), [formId, ctx.store]);
    return (
        <FormScopeContext.Provider value={formScope}>
            <LeafNode node={node} path={path} scope={scope} ctx={ctx} />
        </FormScopeContext.Provider>
    );
};

/**
 * Componente recursivo de um nó do manifesto. Como `source` usa hooks, cada nó é um
 * componente (hooks por-nó são legais). Processa o pipeline de diretivas (Specs 26/31/23)
 * e delega a folha ao `LeafNode` (Specs 22/24/25/26).
 */
export const ManifestNodeRenderer: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
    // 0. Avaliação condicional (Spec 26, Regra 2): `renderIf` falso suprime o nó
    // ANTES de qualquer trabalho (fonte/loop/render) — o nó sequer monta no DOM.
    if (node.renderIf !== undefined && !evaluateCondition(node.renderIf, scope, ctx.global)) {
        return null;
    }

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

    // 3. Escopo de formulário (Spec 32): envolve a sub-árvore num FormScope antes da folha.
    if (node.form) {
        return <FormNode node={node} path={path} scope={scope} ctx={ctx} />;
    }

    // 4. Folha: resolve o componente, interpola props, aplica disabledIf, fia o two-way
    // `model` + Validação e os eventos do Dispatcher. Isolado porque usa hooks.
    return <LeafNode node={node} path={path} scope={scope} ctx={ctx} />;
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
    onNavigate,
}) => {
    const snapshot = useSyncExternalStore(
        (onChange) =>
            dataStore ? dataStore.subscribe((s) => s, onChange) : () => undefined,
        () => (dataStore ? dataStore.getSnapshot() : EMPTY_STATE),
        () => (dataStore ? dataStore.getSnapshot() : EMPTY_STATE),
    );

    // Capacidades de feedback do Dispatcher (Spec 25). Degradam a no-op fora dos
    // respectivos Providers (Spec 13) — a árvore não quebra sem eles.
    const toast = useToast();
    const overlay = useOverlay();

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
        navigate: onNavigate,
        toast,
        overlay,
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
