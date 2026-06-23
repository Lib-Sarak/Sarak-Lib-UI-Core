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

export interface FocusTrap {
    /** Ref do contêiner do overlay onde o foco fica preso. */
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    /** Handler de `onKeyDown` que mantém o `Tab` cíclico dentro do overlay. */
    handleTrap: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const useFocusTrap = (isOpen: boolean, onClose: () => void): FocusTrap => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // `onClose` atrás de um ref: o efeito de foco NÃO pode depender da identidade dela
    // (consumidores passam closures inline), senão re-executaria a cada render — reentrando
    // o foco e perdendo digitação. Só `isOpen` dispara entrada/saída do trap.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Entrada do trap (foca o primeiro focável), ESC e restauração do foco ao fechar.
    useEffect(() => {
        if (!isOpen) return undefined;

        previouslyFocused.current = (document.activeElement as HTMLElement | null) ?? null;
        const node = containerRef.current;
        const first = node?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? node)?.focus();

        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') onCloseRef.current();
        };
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
            // Devolve o foco ao elemento que abriu o overlay (Regra 1).
            previouslyFocused.current?.focus?.();
        };
    }, [isOpen]);

    // Focus trap: `Tab` nunca escapa para trás do overlay (early returns, sem else-if).
    const handleTrap = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== 'Tab' || !containerRef.current) return;
        const items = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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
