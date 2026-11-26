/**
 * useFocusTrap (Spec 41 — Contrato de Acessibilidade, Regra 1)
 *
 * Modelo de foco transversal dos overlays (Modal/Drawer/Popover): ao abrir, salva o
 * elemento focado e foca o primeiro focável do overlay; mantém o `Tab` preso (cíclico);
 * fecha no ESC; e — ao fechar/desmontar — **devolve o foco ao gatilho** (restauração).
 * Extraído de `useModalBehavior` para ser reusado por qualquer overlay sem duplicar a
 * armadilha de foco.
 */

import { useEffect, useRef } from 'react';

/** Seletor dos elementos focáveis dentro do overlay. */
export const FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** O elemento ocupa lugar na tela: nenhum ancestral some do fluxo (`display: none`) e ele não está oculto (`visibility`). Só estilo calculado, sem medir caixa, para valer também sem layout. */
const isDisplayed = (element: HTMLElement): boolean => {
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
        if (getComputedStyle(node).display === 'none') return false;
    }
    return true;
};

const isRendered = (element: HTMLElement): boolean =>
    getComputedStyle(element).visibility !== 'hidden' && isDisplayed(element);

/** Os focáveis do overlay que o usuário alcança: o que está oculto (um widget que o breakpoint esconde) não entra, senão o primeiro ou o último do ciclo seria um alvo que não recebe o foco. */
const reachableFocusables = (container: HTMLElement): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isRendered);

/** Candidatos ao foco inicial: só o que sai do fluxo (`display: none`) fica de fora. Uma camada que nasce com `visibility: hidden` até ser posicionada (popover) ainda tem o primeiro controle como alvo. */
const initialCandidates = (container: HTMLElement): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isDisplayed);

export interface FocusTrap {
    /** Ref do contêiner do overlay onde o foco fica preso. */
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    /** Handler de `onKeyDown` que mantém o `Tab` cíclico dentro do overlay. */
    handleTrap: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * `isTopLayer` (padrão `true`) diz se este overlay é o do topo da pilha de camadas: só ele responde a
 * Escape e ao Tab, para uma confirmação aberta sobre uma gaveta não fechar as duas de uma vez.
 */
export const useFocusTrap = (isOpen: boolean, onClose: () => void, isTopLayer = true): FocusTrap => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // `onClose` atrás de um ref: o efeito de foco NÃO pode depender da identidade dela
    // (consumidores passam closures inline), senão re-executaria a cada render — reentrando
    // o foco e perdendo digitação. Só `isOpen` dispara entrada/saída do trap.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const isTopLayerRef = useRef(isTopLayer);
    isTopLayerRef.current = isTopLayer;

    // Entrada do trap (foca o primeiro focável), ESC e restauração do foco ao fechar.
    useEffect(() => {
        if (!isOpen) return undefined;

        previouslyFocused.current = (document.activeElement as HTMLElement | null) ?? null;
        const node = containerRef.current;
        const first = node ? initialCandidates(node)[0] : undefined;
        (first ?? node)?.focus();
        // Camada que ainda está invisível recusa o foco no navegador: tenta de novo quando aparecer.
        let retry = 0;
        if (node && first && document.activeElement !== first && typeof requestAnimationFrame === 'function') {
            retry = requestAnimationFrame(() => {
                if (!node.contains(document.activeElement) || document.activeElement === node) first.focus();
            });
        }

        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape' && isTopLayerRef.current) onCloseRef.current();
        };
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
            if (retry) cancelAnimationFrame(retry);
            // Devolve o foco ao elemento que abriu o overlay (Regra 1).
            previouslyFocused.current?.focus?.();
        };
    }, [isOpen]);

    // Focus trap: `Tab` nunca escapa para trás do overlay (early returns, sem else-if).
    const handleTrap = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== 'Tab' || !containerRef.current || !isTopLayer) return;
        const items = reachableFocusables(containerRef.current);
        if (items.length === 0) {
            e.preventDefault();
            return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
            return;
        }
        if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    };

    return { containerRef, handleTrap };
};
