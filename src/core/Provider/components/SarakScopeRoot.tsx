import React, { useMemo } from 'react';
import { SARAK_SCOPE_CLASS, SarakScopeContext } from '../scope';
import type { SarakUIMode } from '../types';

interface SarakScopeRootProps {
    mode: SarakUIMode;
    children: React.ReactNode;
    /**
     * Recebe o elemento da ilha assim que ele monta. É um CALLBACK (não `useRef`)
     * porque o consumidor precisa RE-RENDERIZAR quando o container existe — refs de
     * pai só são anexadas depois dos layout effects dos filhos.
     */
    onScopeElement?: (element: HTMLElement | null) => void;
}

/**
 * SarakScopeRoot (Spec 24 — Modo Embarcado)
 *
 * Raiz da ilha Sarak.
 *
 * - **Modo App:** não existe — devolve os filhos crus, sem nenhum nó extra no DOM.
 *   O comportamento e a árvore continuam byte-a-byte os de sempre.
 * - **Modo Embarcado:** materializa o `<div class="sarak-scope">` que ancora TODO o
 *   CSS da lib (`dist/sarak-scoped.css`) e recebe os design tokens do
 *   `DesignInjector`. Fora deste nó, a lib não pinta nada.
 *
 * A classe também é publicada no `SarakScopeContext` para os PORTAIS: toast, drawer,
 * tooltip e lightbox saem da árvore da ilha e vão para o `document.body`, então
 * precisam levar o seletor de escopo junto para continuarem estilizados.
 */
export const SarakScopeRoot: React.FC<SarakScopeRootProps> = ({ mode, children, onScopeElement }) => {
    const scopeClass = mode === 'embedded' ? SARAK_SCOPE_CLASS : '';
    const contextValue = useMemo(() => scopeClass, [scopeClass]);

    if (mode !== 'embedded') {
        return <SarakScopeContext.Provider value={contextValue}>{children}</SarakScopeContext.Provider>;
    }

    return (
        <SarakScopeContext.Provider value={contextValue}>
            <div className={SARAK_SCOPE_CLASS} data-sarak-scope-root="true" ref={onScopeElement}>
                {children}
            </div>
        </SarakScopeContext.Provider>
    );
};
