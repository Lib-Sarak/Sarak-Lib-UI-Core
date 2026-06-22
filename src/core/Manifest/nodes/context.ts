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
}

export interface NodeRendererProps {
    node: ManifestNode;
    path: string;
    scope: StateRecord;
    ctx: NodeRenderContext;
}

export const EMPTY_STATE: StateRecord = {};
