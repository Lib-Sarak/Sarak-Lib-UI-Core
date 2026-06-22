/**
 * Error Boundary do Manifesto (Spec 27)
 *
 * Isola falhas de renderização de uma sub-árvore (Regra 1): um erro fatal num nó
 * (ex.: API devolve `undefined` onde se esperava array) NÃO derruba a árvore inteira
 * — só o nó culpado é substituído pela tela de recuperação. Boundary de classe porque
 * `getDerivedStateFromError`/`componentDidCatch` não têm equivalente em hooks.
 *
 * Regra 4 (log silencioso): registra a chave JSON exata (`nodeId`/`path`) que panicou,
 * acelerando o debug do importador.
 */

import React from 'react';

export interface SarakErrorBoundaryProps {
    /** `id`/path do nó protegido — usado no log de diagnóstico (Regra 4). */
    nodeId: string;
    /** Tela de recuperação a renderizar quando a sub-árvore quebra (Regra 2). */
    renderFallback: () => React.ReactNode;
    children: React.ReactNode;
}

interface SarakErrorBoundaryState {
    hasError: boolean;
}

export class SarakErrorBoundary extends React.Component<
    SarakErrorBoundaryProps,
    SarakErrorBoundaryState
> {
    state: SarakErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): SarakErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        // Regra 4: log limpo apontando o nó exato que causou a pane.
        console.warn(
            `[Sarak:ErrorBoundary] Falha ao renderizar o nó "${this.props.nodeId}": ${error.message}`,
            info.componentStack,
        );
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return this.props.renderFallback();
        }
        return this.props.children;
    }
}
