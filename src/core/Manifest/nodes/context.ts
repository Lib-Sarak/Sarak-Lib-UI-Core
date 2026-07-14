/**
 * Tipos de contexto de renderização do Manifesto (compartilhados pelos nós).
 *
 * Extraídos do `SarakManifestRenderer` para que os componentes de nó (LeafNode,
 * DataSourceNode) os reusem sem inchar o arquivo do renderer.
 */

import type { ManifestNode } from '../types';
import type { ComponentRegistry } from '../Registry/ComponentRegistry';
import type { SarakDataStore } from '../DataStore/SarakDataStore';
import type { StateRecord } from '../DataStore/resolvePath';
import type { NetworkInterceptor } from '../DataSource/useDataSource';
import type { NavigateFn, OverlayController } from '../Dispatcher';
import type { ToastController } from '../../../components/atomic/Feedback/SarakToast';

/**
 * Carregador de manifesto injetado pelo importador (Spec 33, alvo lazy de rota):
 * dado o id declarado em `routes: { "/x": { lazy: "id" } }`, devolve a subárvore.
 */
export type ManifestLoaderFn = (id: string) => Promise<ManifestNode>;

/** Contexto compartilhado por toda a árvore durante uma renderização. */
export interface NodeRenderContext {
    registry: ComponentRegistry;
    store?: SarakDataStore<StateRecord>;
    interceptor?: NetworkInterceptor;
    /** Snapshot atual do estado global (para interpolação e resolução de listas). */
    global: unknown;
    // --- Capacidades do Dispatcher (Spec 25) ---
    navigate?: NavigateFn;
    toast?: ToastController;
    overlay?: OverlayController;
    /** Rota ativa informada pelo host (Spec 33, Regra 3): a Sarak reage, não controla a URL. */
    route?: string;
    /** Carregador de subárvores lazy de rota (Spec 33) — injetado pelo importador. */
    manifestLoader?: ManifestLoaderFn;
    /** Tela de recuperação global renderizada pelos Error Boundaries (Spec 27, Regra 2). */
    fallbackErrorUI?: ManifestNode;
    /**
     * Profundidade de aninhamento da recursão (Spec 40, Regra 5 — limite anti-DoS).
     * Incrementada a cada nível em `ManifestNodeRenderer`; ao exceder `MAX_NESTING_DEPTH`
     * o nó cai no Fallback em vez de estourar a pilha do navegador.
     */
    depth?: number;
}

export interface NodeRendererProps {
    node: ManifestNode;
    path: string;
    scope: StateRecord;
    ctx: NodeRenderContext;
}

export const EMPTY_STATE: StateRecord = {};
