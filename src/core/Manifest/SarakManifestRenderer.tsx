/**
 * SarakManifestRenderer — Componente público do Motor de Dados Vivo
 *
 * Materializa um manifesto JSON numa árvore React. Assina o DataStore (Spec 21) para
 * reagir a mudanças de estado e re-interpolar a árvore; injeta as capacidades do
 * Dispatcher (Spec 25), o interceptor de rede (Spec 31) e a tela de recuperação global
 * (Spec 27). A maquinaria recursiva de nós vive em `nodes/renderNode` (pipeline de
 * diretivas + Error Boundary por nó).
 */

import React, { useSyncExternalStore } from 'react';
import type { ManifestNode, ManifestRoot } from './types';
import { validateManifestRoot } from './validateNode';
import {
    defaultComponentRegistry,
    type ComponentRegistry,
} from './Registry/ComponentRegistry';
import { SarakFallback } from './Registry/Fallback';
import type { SarakDataStore } from './DataStore/SarakDataStore';
import type { StateRecord } from './DataStore/resolvePath';
import type { NetworkInterceptor } from './DataSource/useDataSource';
import type { NavigateFn } from './Dispatcher';
import { ManifestNodeRenderer } from './nodes/renderNode';
import { EMPTY_STATE, type NodeRenderContext } from './nodes/context';
import { SarakSkeleton } from '../../components/atomic/Feedback/SarakSkeleton';
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
    /**
     * Tela de recuperação global (Spec 27, Regra 2). Override do importador; se ausente,
     * usa a chave `fallbackErrorUI` do próprio manifesto.
     */
    fallbackErrorUI?: ManifestNode;
}

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
    fallbackErrorUI,
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

    // Tela de recuperação (Spec 27, Regra 2): override do importador tem prioridade;
    // senão usa a chave `fallbackErrorUI` do próprio manifesto.
    const rootFallback = fallbackErrorUI ?? (manifest as ManifestRoot).fallbackErrorUI;

    const ctx: NodeRenderContext = {
        registry,
        store: dataStore,
        interceptor: networkInterceptor,
        global: snapshot ?? EMPTY_STATE,
        navigate: onNavigate,
        toast,
        overlay,
        fallbackErrorUI: rootFallback,
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
