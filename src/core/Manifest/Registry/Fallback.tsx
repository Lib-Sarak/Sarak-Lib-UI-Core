import React from 'react';

/** Estilo compartilhado das duas variantes de fallback (Spec 08 §5: só `--sarak-*`/
 * `--theme-*` — o namespace `--sx-*` é proibido, variável-fantasma não emitida pela
 * engine). Fallback explícito garante legibilidade mesmo sem `sarak.css` carregado. */
const fallbackBoxStyle: React.CSSProperties = {
    color: 'var(--sarak-color-error-base, var(--theme-text, #ffffff))',
    border: 'var(--sarak-border-width-thin, thin) solid var(--sarak-color-error-base, currentColor)',
    background: 'var(--sarak-color-error-surface, transparent)',
};

/** Props do Fallback: identifica o nó culpado sem derrubar a árvore (Spec 22, Regra 2). */
export interface SarakFallbackProps {
    /** `type` não resolvido que acionou o fallback. */
    type: string;
    /** `id`/path do nó culpado, para diagnóstico. */
    nodeId?: string;
}

/**
 * Componente de Fallback visual (Spec 22 — Regra 2).
 * Renderizado quando um `type` NÃO resolve no Registry (tipo inexistente/typo no
 * manifesto): mostra um marcador discreto e registra o nó culpado, mantendo o
 * restante da árvore intacto. Distinto de `SarakErrorFallback` — aqui não houve
 * exceção, o tipo simplesmente não está cadastrado.
 */
export const SarakFallback: React.FC<SarakFallbackProps> = ({ type, nodeId }) => {
    return (
        <div role="alert" data-sarak-fallback="true" className="px-3 py-2 rounded text-sm" style={fallbackBoxStyle}>
            {`Componente desconhecido: "${type}"`}
            {nodeId ? ` (id: "${nodeId}")` : ''}
        </div>
    );
};

/** Props do fallback de erro real de render (Spec 27). */
export interface SarakErrorFallbackProps {
    /** Exceção capturada pelo `SarakErrorBoundary` durante o render do nó. */
    error: Error;
    /** `id`/path do nó culpado, para diagnóstico. */
    nodeId?: string;
}

/**
 * Componente de Fallback de ERRO (Spec 27, Regra 2 / integra Spec 22).
 * Renderizado quando o `SarakErrorBoundary` captura uma exceção real durante o
 * render de um nó (ex.: prop inesperada, dado `undefined` onde se esperava array).
 * Mostra a mensagem real do erro — nunca reaproveita o texto de "componente
 * desconhecido", que confundiria uma falha de runtime com um typo de manifesto.
 * Stack técnico só em desenvolvimento (produção mostra apenas a mensagem).
 */
export const SarakErrorFallback: React.FC<SarakErrorFallbackProps> = ({ error, nodeId }) => {
    const isDev = process.env.NODE_ENV !== 'production';
    return (
        <div role="alert" data-sarak-error-fallback="true" className="px-3 py-2 rounded text-sm" style={fallbackBoxStyle}>
            {`Erro ao renderizar este nó: ${error.message}`}
            {nodeId ? ` (id: "${nodeId}")` : ''}
            {isDev && error.stack ? (
                <details className="mt-1">
                    <summary>Stack técnico (dev)</summary>
                    <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                </details>
            ) : null}
        </div>
    );
};
