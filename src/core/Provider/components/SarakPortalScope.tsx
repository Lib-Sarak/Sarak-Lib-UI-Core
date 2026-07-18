import React from 'react';
import { useSarakScopeClass } from '../scope';

/**
 * SarakPortalScope (Spec 24 — Modo Embarcado)
 *
 * Envelope de portal. Componentes que usam `createPortal(..., document.body)` saem da
 * árvore DOM da ilha e passariam a não casar mais com o CSS escopado
 * (`.sarak-scope ...`) — um toast disparado pelo manifesto renderizaria totalmente
 * sem estilo. Este wrapper devolve a classe de escopo ao conteúdo portalizado.
 *
 * **No Modo App é um no-op estrutural:** devolve os filhos crus, sem nó extra — a
 * árvore DOM do modo default não muda em nada.
 *
 * O `<div>` não recebe estilo algum de propósito: sem `transform`/`filter`/`contain`
 * ele não cria containing block, então filhos `position: fixed` continuam ancorados
 * na viewport exatamente como antes.
 */
export const SarakPortalScope: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const scopeClass = useSarakScopeClass();
    if (!scopeClass) return <>{children}</>;
    return (
        <div className={scopeClass} data-sarak-portal-scope="true">
            {children}
        </div>
    );
};
