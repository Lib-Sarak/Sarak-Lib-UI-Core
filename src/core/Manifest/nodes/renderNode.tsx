/**
 * Maquinaria recursiva de renderização de nós (extraída do `SarakManifestRenderer`).
 * Pipeline por nó: 0 `renderIf` (26) → 1 `source` (31) → 2 `renderFor` (23) →
 * 3 `form` (32) → 4 folha (22/24/25/26/29/32/28). Cada nó é envolto num Error Boundary
 * (Spec 27, Regra 1): uma falha isola-se ao nó culpado.
 */

import React, { useMemo } from 'react';
import type { ManifestNode } from '../types';
import { SarakFallback } from '../Registry/Fallback';
import type { StateRecord } from '../DataStore/resolvePath';
import { evaluateCondition } from '../Conditional/evaluateCondition';
import { expandRenderFor, VIRTUALIZE_THRESHOLD } from '../RenderFor/expandRenderFor';
import { useDataSource } from '../DataSource/useDataSource';
import { SarakErrorBoundary } from '../ErrorBoundary';
import { createFormScope } from '../Form/formScope';
import { FormScopeContext } from '../Form/context';
import { LeafNode } from './LeafNode';
import type { NodeRenderContext, NodeRendererProps } from './context';
import { SarakDataGrid } from '../../../components/atomic/DataDisplay/SarakDataGrid';
import { SarakSkeleton } from '../../../components/atomic/Feedback/SarakSkeleton';
import { SarakDataEmpty } from '../../../components/atomic/Feedback/SarakDataEmpty';

/**
 * Renderiza a tela de recuperação de um Error Boundary (Spec 27, Regra 2): usa o
 * `fallbackErrorUI` do JSON quando houver, senão o Fallback estático. Renderiza o
 * fallback SEM `fallbackErrorUI` no contexto — assim um fallback que também quebre cai
 * no estático em vez de recursar infinitamente.
 */
const renderNodeFallback = (
    node: ManifestNode,
    path: string,
    scope: StateRecord,
    ctx: NodeRenderContext,
): React.ReactNode => {
    if (ctx.fallbackErrorUI) {
        return (
            <ManifestNodeRenderer
                node={ctx.fallbackErrorUI}
                path={`${path}.fallbackErrorUI`}
                scope={scope}
                ctx={{ ...ctx, fallbackErrorUI: undefined }}
            />
        );
    }
    return <SarakFallback type="ErroDeRenderizacao" nodeId={node.id ?? path} />;
};

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
 * Pipeline de diretivas de um nó (Specs 26/31/23/32/22). Separado do wrapper de Error
 * Boundary para que uma falha aqui seja capturada e isolada (Spec 27, Regra 1).
 */
const ManifestNodePipeline: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
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
 * Componente recursivo de um nó: ENVOLVE o pipeline num Error Boundary (Spec 27, Regra 1),
 * isolando a falha ao nó culpado — irmãos, navbar e sidebar sobrevivem. O root também é
 * protegido (esta função renderiza o nó raiz).
 */
export const ManifestNodeRenderer: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
    return (
        <SarakErrorBoundary
            nodeId={node.id ?? path}
            renderFallback={() => renderNodeFallback(node, path, scope, ctx)}
        >
            <ManifestNodePipeline node={node} path={path} scope={scope} ctx={ctx} />
        </SarakErrorBoundary>
    );
};
