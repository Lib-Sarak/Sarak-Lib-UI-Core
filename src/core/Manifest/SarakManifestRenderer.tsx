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
import {
    SarakMissingManifestScreen,
    SarakInvalidManifestScreen,
} from './Registry/InvalidManifestScreen';
import type { SarakDataStore } from './DataStore/SarakDataStore';
import type { StateRecord } from './DataStore/resolvePath';
import type { NetworkInterceptor } from './DataSource/useDataSource';
import type { NavigateFn } from './Dispatcher';
import { ManifestNodeRenderer } from './nodes/renderNode';
import { ShellRouterNode } from './nodes/ShellRouterNode';
import { EMPTY_STATE, type ManifestLoaderFn, type NodeRenderContext } from './nodes/context';
import { SarakSkeleton } from '../../components/atomic/Feedback/SarakSkeleton';
import { useToast } from '../../components/atomic/Feedback/SarakToast';
import { useOverlay } from '../../components/atomic/Modals/SarakOverlayProvider';

/**
 * Contrato do importador (Spec 30, Regra 2). As 4 chaves cruciais: `payload`,
 * `dataStore`, `networkInterceptor`, `routerInterceptor` (+ `route` da Spec 33).
 * `manifest`/`onNavigate` permanecem como aliases retrocompatíveis.
 */
export interface SarakManifestRendererProps {
    /** Nó raiz do manifesto (deve declarar `schemaVersion`). Alias canônico: `payload`. */
    manifest?: unknown;
    /** Payload do manifesto (Spec 30, Regra 2) — string/objeto JSON. Alias de `manifest`. */
    payload?: unknown;
    /** Store reativo opcional (Spec 21), injetado pelo importador. */
    dataStore?: SarakDataStore<StateRecord>;
    /** Registry a usar; default = singleton da biblioteca. */
    registry?: ComponentRegistry;
    /** Interceptor de rede injetado (Spec 31, Regra 5) — toda E/S passa por ele. */
    networkInterceptor?: NetworkInterceptor;
    /** Ponte de navegação do host (Spec 30, Regra 2): processa os `navigate` do JSON. */
    routerInterceptor?: NavigateFn;
    /** @deprecated Use `routerInterceptor`. Mantido por compatibilidade (Spec 25). */
    onNavigate?: NavigateFn;
    /**
     * Rota ativa informada pelo host (Spec 33, Regra 3): a Sarak reage e resolve qual
     * subárvore de `routes` monta na região `content` — NUNCA controla a URL diretamente.
     * Também é exposta ao binding como `{{$route}}` (chave reservada do escopo global),
     * permitindo destacar o item ativo de navegação 100% via JSON.
     */
    route?: string;
    /**
     * Carregador de subárvores lazy (Spec 33): resolve `routes: { "/x": { lazy: "id" } }`
     * buscando o manifesto da rota sob demanda (rede/arquivo — decisão do importador).
     * Sem ele, um alvo lazy degrada para o Fallback visível (nunca silencioso).
     */
    manifestLoader?: ManifestLoaderFn;
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
    payload,
    dataStore,
    registry = defaultComponentRegistry,
    networkInterceptor,
    routerInterceptor,
    onNavigate,
    route,
    manifestLoader,
    fallbackErrorUI,
}) => {
    const snapshot = useSyncExternalStore(
        (onChange) =>
            dataStore ? dataStore.subscribe((s) => s, onChange) : () => undefined,
        () => (dataStore ? dataStore.getSnapshot() : EMPTY_STATE),
        () => (dataStore ? dataStore.getSnapshot() : EMPTY_STATE),
    );

    // `$route` é chave RESERVADA do escopo global de binding (Spec 33): reflete a rota
    // ativa do host para `{{$route}}`/`renderIf` — o valor do motor prevalece sobre
    // qualquer chave homônima gravada no DataStore.
    const globalScope = React.useMemo<Record<string, unknown>>(
        () => ({ ...(snapshot ?? EMPTY_STATE), $route: route ?? '' }),
        [snapshot, route],
    );

    // Capacidades de feedback do Dispatcher (Spec 25). Degradam a no-op fora dos
    // respectivos Providers (Spec 13) — a árvore não quebra sem eles.
    const toast = useToast();
    const overlay = useOverlay();

    // Contrato do importador (Spec 30, Regra 2): `payload`/`routerInterceptor` são os
    // nomes canônicos; `manifest`/`onNavigate` ficam como aliases retrocompatíveis.
    const source = payload ?? manifest;
    const navigate = routerInterceptor ?? onNavigate;

    // Tela DX (Spec 17, §2.2): payload AUSENTE tem mensagem própria (o dev esqueceu a
    // prop) — antes caía no fallback enganoso "Componente desconhecido: ManifestoInvalido".
    if (source === undefined || source === null) {
        console.error('[Sarak] Manifesto não fornecido: passe a prop `payload` ao <SarakManifestRenderer>.');
        return <SarakMissingManifestScreen />;
    }

    const validation = validateManifestRoot(source);
    if (!validation.valid) {
        // Tela DX (Spec 17, §2.2): payload inválido lista TODOS os erros com path.
        console.error(
            `[Sarak] Manifesto de UI inválido: ${validation.errors.length} erro(s).`,
            validation.errors,
        );
        return <SarakInvalidManifestScreen errors={validation.errors} />;
    }

    // Tela de recuperação (Spec 27, Regra 2): override do importador tem prioridade;
    // senão usa a chave `fallbackErrorUI` do próprio manifesto.
    const rootFallback = fallbackErrorUI ?? (source as ManifestRoot).fallbackErrorUI;

    const ctx: NodeRenderContext = {
        registry,
        store: dataStore,
        interceptor: networkInterceptor,
        global: globalScope,
        navigate,
        route,
        manifestLoader,
        toast,
        overlay,
        fallbackErrorUI: rootFallback,
    };

    // App-shell + roteamento como dado (Spec 33): quando o raiz declara `shell`, o
    // shell orquestra as regiões persistentes e a rota ativa; senão, árvore única.
    const root = source as ManifestRoot;

    return (
        <React.Suspense fallback={<SarakSkeleton />}>
            {root.shell ? (
                <ShellRouterNode root={root} ctx={ctx} />
            ) : (
                <ManifestNodeRenderer node={root} path="root" scope={EMPTY_STATE} ctx={ctx} />
            )}
        </React.Suspense>
    );
};

export default SarakManifestRenderer;
