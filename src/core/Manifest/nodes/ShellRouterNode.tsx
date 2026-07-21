/**
 * App-Shell + roteamento como dado (Spec 33).
 *
 * Renderiza as regiões persistentes do shell (topbar/sidebar) e monta, na região
 * `content` ("<slot-rotas>"), a subárvore da rota ativa. As regiões mantêm posição
 * estável na árvore React → NÃO remontam na troca de rota; só o conteúdo (com `key`
 * na rota) é desmontado/montado (Regra 1 + Critério E2E). A navegação é do host via
 * ação `navigate` → `routerInterceptor` (Regra 3); aqui apenas REAGIMOS à `ctx.route`.
 *
 * Alvo lazy `{ lazy: id }`: resolvido pelo `manifestLoader` injetado pelo importador
 * (Spec 30/33). O resultado é cacheado por id (voltar à rota não rebaixa a UX); sem
 * loader ou em falha, degrada para um Fallback VISÍVEL — nunca silencioso.
 */

import React from 'react';
import type { ManifestNode, ManifestRoot, RouteMap, RouteTarget } from '../types';
import { ManifestNodeRenderer } from './renderNode';
import { SarakFallback } from '../Registry/Fallback';
import { SarakSkeleton } from '../../../components/atomic/Feedback/SarakSkeleton';
import { useNavigationStyle } from '../../Provider/useNavigationStyle';
import { EMPTY_STATE, type NodeRenderContext } from './context';

type SidebarRegionChrome = 'fixed-width' | 'full-width';

/**
 * Mapa estilo→chrome da região `shell.sidebar` (Spec 27 §2.2): ponto de extensão
 * explícito para `dock`/`glass` no futuro — hoje só `topbar` sai do default vertical
 * (`fixed-width`), replicando os ramos mutuamente exclusivos do Shell legado
 * (`SarakShell.tsx`, `isTopbar`/`isDock`/`isGlass`/`isSidebar`). Qualquer valor
 * ausente/desconhecido (incl. `dock`/`glass`, fora do escopo desta spec) cai no default.
 */
const SIDEBAR_REGION_CHROME: Readonly<Record<string, SidebarRegionChrome>> = {
    topbar: 'full-width',
};

const resolveSidebarRegionChrome = (navigationStyle: string | undefined): SidebarRegionChrome =>
    (navigationStyle && SIDEBAR_REGION_CHROME[navigationStyle]) || 'fixed-width';

/** Alvo lazy `{ lazy: id }` vs subárvore inline. */
const isLazyTarget = (target: RouteTarget): target is { lazy: string } =>
    typeof (target as { lazy?: unknown }).lazy === 'string';

type ResolvedRoute = { node: ManifestNode } | { lazyId: string } | { fallback: string };

/** Resolve o alvo da rota ativa (default: primeira rota declarada). */
const resolveRoute = (routes: RouteMap | undefined, route: string | undefined): ResolvedRoute => {
    if (!routes) return { fallback: 'rotas-ausentes' };
    const path = route ?? Object.keys(routes)[0];
    const target = path !== undefined ? routes[path] : undefined;
    if (!target) return { fallback: route ?? 'rota-vazia' };
    if (isLazyTarget(target)) return { lazyId: target.lazy };
    return { node: target };
};

type LazyState =
    | { status: 'loading' }
    | { status: 'ready'; node: ManifestNode }
    | { status: 'error'; reason: string };

/**
 * Materializa uma rota lazy: consulta o cache do shell, senão dispara o loader.
 * O cache vive no ShellRouterNode (sobrevive à troca de rota) — não no módulo
 * (instâncias/testes independentes não se contaminam).
 */
const LazyRouteNode: React.FC<{
    id: string;
    routeKey: string;
    cache: Map<string, ManifestNode>;
    ctx: NodeRenderContext;
}> = ({ id, routeKey, cache, ctx }) => {
    const cached = cache.get(id);
    const loader = ctx.manifestLoader;
    const [state, setState] = React.useState<LazyState>(() =>
        cached ? { status: 'ready', node: cached } : { status: 'loading' },
    );

    React.useEffect(() => {
        if (cached || !loader) return undefined;
        let alive = true;
        setState({ status: 'loading' });
        loader(id).then(
            (node) => {
                cache.set(id, node);
                if (alive) setState({ status: 'ready', node });
            },
            (err: unknown) => {
                const reason = err instanceof Error ? err.message : String(err);
                console.warn(`[Sarak:Shell] manifestLoader falhou para a rota lazy "${id}": ${reason}`);
                if (alive) setState({ status: 'error', reason });
            },
        );
        return () => {
            alive = false;
        };
    }, [id, cached, loader, cache]);

    if (!loader && !cached) {
        // Contrato do importador ausente (Spec 30, Regra 2): avisa e degrada visível.
        console.warn(`[Sarak:Shell] rota lazy "${id}" sem manifestLoader injetado (Spec 33).`);
        return <SarakFallback type="RotaLazySemLoader" nodeId={id} />;
    }
    if (state.status === 'loading') return <SarakSkeleton />;
    if (state.status === 'error') return <SarakFallback type="RotaLazyFalhou" nodeId={id} />;
    return (
        <ManifestNodeRenderer
            node={state.node}
            path={`root.routes[${routeKey}]`}
            scope={EMPTY_STATE}
            ctx={ctx}
        />
    );
};

export const ShellRouterNode: React.FC<{ root: ManifestRoot; ctx: NodeRenderContext }> = ({ root, ctx }) => {
    const shell = root.shell;
    const resolved = resolveRoute(root.routes, ctx.route);
    const activeKey = ctx.route ?? (root.routes ? Object.keys(root.routes)[0] ?? 'root' : 'root');
    // Cache de subárvores lazy carregadas (id → nó), estável entre trocas de rota.
    const lazyCache = React.useRef<Map<string, ManifestNode>>(new Map());

    // Realocação de região por navigationStyle (Spec 27): mesma fonte de leitura do
    // SarakShellNav — evita drift entre quem decide a ORIENTAÇÃO do menu e quem decide
    // o CHROME da região que o hospeda.
    const navigationStyle = useNavigationStyle();
    const sidebarChrome = resolveSidebarRegionChrome(navigationStyle);
    const isFullWidthSidebar = sidebarChrome === 'full-width';

    const renderRegion = (node: ManifestNode | undefined, key: string): React.ReactNode =>
        node ? (
            <ManifestNodeRenderer node={node} path={`root.shell.${key}`} scope={EMPTY_STATE} ctx={ctx} />
        ) : null;

    const renderContent = (): React.ReactNode => {
        if ('node' in resolved) {
            return (
                <ManifestNodeRenderer
                    key={activeKey}
                    node={resolved.node}
                    path={`root.routes[${activeKey}]`}
                    scope={EMPTY_STATE}
                    ctx={ctx}
                />
            );
        }
        if ('lazyId' in resolved) {
            return (
                <LazyRouteNode
                    key={activeKey}
                    id={resolved.lazyId}
                    routeKey={activeKey}
                    cache={lazyCache.current}
                    ctx={ctx}
                />
            );
        }
        return <SarakFallback type="RotaNaoResolvida" nodeId={resolved.fallback} />;
    };

    return (
        <div className="sarak-shell flex flex-col h-full min-h-0 w-full">
            {shell?.topbar ? (
                // Chrome de tokens da topbar (Spec 18): consome as vars que o Design
                // Engine já emite (`--sarak-topbar-height`/`--sarak-topbar-bg`), fechando
                // a paridade com o `TopbarNav` do shell legado — personalizar a topbar no
                // painel reflete AO VIVO. O conteúdo declarado no manifesto vai DENTRO.
                <header
                    className="sarak-shell-topbar flex items-center shrink-0 w-full"
                    style={{
                        minHeight: 'var(--sarak-topbar-height, 64px)',
                        background: 'var(--sarak-topbar-bg, transparent)',
                        borderBottom: 'var(--sarak-border-width, thin) solid var(--sarak-card-border-color, transparent)',
                    }}
                >
                    {renderRegion(shell.topbar, 'topbar')}
                </header>
            ) : null}
            <div
                className={`sarak-shell-body flex ${isFullWidthSidebar ? 'flex-col' : 'flex-row'} flex-1 min-h-0 w-full`}
            >
                {shell?.sidebar ? (
                    isFullWidthSidebar ? (
                        // navigationStyle horizontal (Spec 27): a região NÃO vira coluna
                        // fixa — replica o `<TopbarNav>` do Shell legado como faixa de
                        // largura cheia, empilhada acima do corpo (`flex-shrink: 0` trava
                        // a ALTURA própria do conteúdo em vez da largura de 240px).
                        <div
                            className="sarak-shell-sidebar sarak-shell-sidebar--full-width shrink-0 w-full overflow-x-auto"
                            style={{
                                background: 'var(--sarak-sidebar-bg, transparent)',
                            }}
                        >
                            {renderRegion(shell.sidebar, 'sidebar')}
                        </div>
                    ) : (
                        // Região persistente com largura própria (reusa os tokens reais do
                        // Design Engine — Spec 04): impede que um filho `w-full` (ex.: um
                        // `SarakFlex` usado como sidebar) tome 100% da LINHA e zere o espaço
                        // do conteúdo — `flex-shrink: 0` trava a largura mesmo se o conteúdo
                        // interno tentar esticar.
                        <aside
                            className="sarak-shell-sidebar shrink-0 overflow-y-auto"
                            style={{
                                width: 'var(--sarak-sidebar-width, 240px)',
                                minWidth: 'var(--sarak-sidebar-min-width, 200px)',
                                maxWidth: 'var(--sarak-sidebar-max-width, 450px)',
                                // Chrome de tokens da sidebar (Spec 18): consome `--sarak-sidebar-bg`.
                                background: 'var(--sarak-sidebar-bg, transparent)',
                            }}
                        >
                            {renderRegion(shell.sidebar, 'sidebar')}
                        </aside>
                    )
                ) : null}
                <main className="sarak-shell-content flex-1 min-w-0 min-h-0">{renderContent()}</main>
            </div>
        </div>
    );
};
