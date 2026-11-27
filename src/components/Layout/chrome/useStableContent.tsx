import React from 'react';
import { createPortal } from 'react-dom';
import { SarakErrorBoundary, type SarakErrorHandler } from '../../atomic/Feedback/SarakErrorBoundary';

/**
 * O elemento do conteúdo que tinha o foco quando o nó estável saiu do lugar. Mover o nó tira o foco de quem estava dentro dele (o
 * navegador o devolve ao `body`), e o evento de saída não dispara, então o último elemento focado fica guardado aqui e o
 * `ContentAnchor` o foca de novo depois de encaixar o nó. Uma saída de foco para outro elemento é escolha do usuário e esquece; sem destino (o nó saiu do lugar), o elemento fica guardado.
 */
const focusedInside = new WeakMap<HTMLElement, HTMLElement | null>();

/** O ponto onde o modo atual do cromo quer o conteúdo: leva o nó estável para dentro de si, sem criar caixa de layout, e devolve o foco ao que o tinha. */
const ContentAnchor: React.FC<{ host: HTMLElement }> = ({ host }) => {
    const attach = React.useCallback((anchor: HTMLElement | null) => {
        if (!anchor || host.parentNode === anchor) return;
        anchor.appendChild(host);
        const remembered = focusedInside.get(host);
        if (remembered && remembered.isConnected && (!document.activeElement || document.activeElement === document.body)) remembered.focus({ preventScroll: true });
    }, [host]);
    return <div ref={attach} data-sarak-content-anchor style={{ display: 'contents' }} />;
};

const createHost = (): HTMLElement | null => {
    if (typeof document === 'undefined') return null;
    const host = document.createElement('div');
    host.setAttribute('data-sarak-content-host', '');
    host.style.display = 'contents';
    host.addEventListener('focusin', (event) => focusedInside.set(host, event.target as HTMLElement));
    host.addEventListener('focusout', (event) => { if (event.relatedTarget) focusedInside.set(host, null); });
    return host;
};

const subscribeNothing = (): (() => void) => () => undefined;
const isClientSnapshot = (): boolean => true;
const isServerSnapshot = (): boolean => false;

/**
 * Mantém o conteúdo do app montado quando o cromo troca de modo (lateral, topo, celular). Cada modo é um componente diferente, e o
 * que está dentro de um componente que muda de tipo é desmontado e montado de novo; um conteúdo com estado próprio (o rascunho do
 * painel de design, um formulário) perderia o que o usuário fez. O conteúdo é renderizado por um portal num nó que vive o mesmo tanto
 * que o cromo, e cada modo só recebe o ponto (`slot`) onde esse nó é encaixado. No servidor e na primeira renderização de uma hidratação, o conteúdo vai direto no slot (o HTML do servidor e a primeira árvore do cliente têm de bater); o portal vale a partir da renderização seguinte, e o conteúdo é montado de novo uma vez, logo depois da hidratação. Num `createRoot` comum o portal vale desde o primeiro quadro.
 */
export const useStableContent = (children: React.ReactNode, activeRoute?: string, onError?: SarakErrorHandler): { slot: React.ReactNode; portal: React.ReactNode } => {
    const host = React.useMemo(createHost, []);
    // `false` só no servidor e na hidratação: o React usa o retrato do servidor nelas e o do cliente em toda outra renderização.
    const isReady = React.useSyncExternalStore(subscribeNothing, isClientSnapshot, isServerSnapshot);
    // O limite de erro do conteúdo mora junto do conteúdo: o portal responde à árvore do cromo, não à região onde o nó foi encaixado.
    const content = <SarakErrorBoundary resetKeys={[activeRoute]} onError={onError}>{children}</SarakErrorBoundary>;
    if (!host || !isReady) return { slot: content, portal: null };
    return { slot: <ContentAnchor host={host} />, portal: createPortal(content, host) };
};
