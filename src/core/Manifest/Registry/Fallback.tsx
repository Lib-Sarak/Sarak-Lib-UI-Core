import React from 'react';

/** Props do Fallback: identifica o nó culpado sem derrubar a árvore (Spec 22, Regra 2). */
export interface SarakFallbackProps {
    /** `type` não resolvido que acionou o fallback. */
    type: string;
    /** `id`/path do nó culpado, para diagnóstico. */
    nodeId?: string;
}

/**
 * Componente de Fallback visual (Spec 22 — Regra 2 / integra Spec 27).
 * Renderizado quando um `type` não resolve no Registry: mostra um marcador
 * discreto e registra o nó culpado, mantendo o restante da árvore intacto.
 *
 * Zero Hardcode: cores via `var(--sx-*)`; espaçamento via utilitários do design system.
 */
export const SarakFallback: React.FC<SarakFallbackProps> = ({ type, nodeId }) => {
    return (
        <div
            role="alert"
            data-sarak-fallback="true"
            className="px-3 py-2 rounded text-sm"
            style={{
                color: 'var(--sx-color-error-base, var(var(--sarak-text-main,#ffffff)))',
                border: 'var(--sx-border-width-thin, thin) solid var(--sx-color-error-base, currentColor)',
                background: 'var(--sx-color-error-surface, transparent)',
            }}
        >
            {`Componente desconhecido: "${type}"`}
            {nodeId ? ` (id: "${nodeId}")` : ''}
        </div>
    );
};
