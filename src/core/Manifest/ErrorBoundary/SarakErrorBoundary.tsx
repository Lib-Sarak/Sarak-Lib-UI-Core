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
    /** Tela de recuperação a renderizar quando a sub-árvore quebra (Regra 2). Recebe o
     * `Error` real capturado, para que o fallback possa exibir a causa em vez de um
     * texto genérico de "componente desconhecido". */
    renderFallback: (error: Error) => React.ReactNode;
    children: React.ReactNode;
}

interface SarakErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class SarakErrorBoundary extends React.Component<
    SarakErrorBoundaryProps,
    SarakErrorBoundaryState
> {
    state: SarakErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): SarakErrorBoundaryState {
        return { hasError: true, error };
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
            return this.props.renderFallback(this.state.error ?? new Error('Erro desconhecido.'));
        }
        return this.props.children;
    }
}
