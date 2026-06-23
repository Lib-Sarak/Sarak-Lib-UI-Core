/**
 * App-Shell + roteamento como dado (Spec 33).
 *
 * Renderiza as regiões persistentes do shell (topbar/sidebar) e monta, na região
 * `content` ("<slot-rotas>"), a subárvore da rota ativa. As regiões mantêm posição
 * estável na árvore React → NÃO remontam na troca de rota; só o conteúdo (com `key`
 * na rota) é desmontado/montado (Regra 1 + Critério E2E). A navegação é do host via
 * ação `navigate` → `routerInterceptor` (Regra 3); aqui apenas REAGIMOS à `ctx.route`.
 */

import React from 'react';
import type { ManifestNode, ManifestRoot, RouteMap, RouteTarget } from '../types';
import { ManifestNodeRenderer } from './renderNode';
import { SarakFallback } from '../Registry/Fallback';
import { EMPTY_STATE, type NodeRenderContext } from './context';

/** Alvo lazy `{ lazy: id }` vs subárvore inline. */
const isLazyTarget = (target: RouteTarget): target is { lazy: string } =>
    typeof (target as { lazy?: unknown }).lazy === 'string';

/** Resolve o alvo da rota ativa (default: primeira rota declarada). */
const resolveRoute = (
    routes: RouteMap | undefined,
    route: string | undefined,
): { node: ManifestNode } | { fallback: string } => {
    if (!routes) return { fallback: 'rotas-ausentes' };
    const path = route ?? Object.keys(routes)[0];
    const target = path !== undefined ? routes[path] : undefined;
    if (!target) return { fallback: route ?? 'rota-vazia' };
    // Alvo lazy: o carregador de manifesto liga-se ao contrato do importador
    // (Spec 30/31). Até lá, degrada para um Fallback explícito (sem silenciar).
    if (isLazyTarget(target)) return { fallback: `lazy:${target.lazy}` };
    return { node: target };
};

export const ShellRouterNode: React.FC<{ root: ManifestRoot; ctx: NodeRenderContext }> = ({ root, ctx }) => {
    const shell = root.shell;
    const resolved = resolveRoute(root.routes, ctx.route);
    const activeKey = ctx.route ?? (root.routes ? Object.keys(root.routes)[0] ?? 'root' : 'root');

    const renderRegion = (node: ManifestNode | undefined, key: string): React.ReactNode =>
        node ? (
            <ManifestNodeRenderer node={node} path={`root.shell.${key}`} scope={EMPTY_STATE} ctx={ctx} />
        ) : null;

    return (
        <div className="sarak-shell flex flex-col h-full min-h-0">
            {renderRegion(shell?.topbar, 'topbar')}
            <div className="sarak-shell-body flex flex-1 min-h-0">
                {renderRegion(shell?.sidebar, 'sidebar')}
                <main className="sarak-shell-content flex-1 min-w-0 min-h-0">
                    {'node' in resolved ? (
                        <ManifestNodeRenderer
                            key={activeKey}
                            node={resolved.node}
                            path={`root.routes[${activeKey}]`}
                            scope={EMPTY_STATE}
                            ctx={ctx}
                        />
                    ) : (
                        <SarakFallback type="RotaNaoResolvida" nodeId={resolved.fallback} />
                    )}
                </main>
            </div>
        </div>
    );
};
