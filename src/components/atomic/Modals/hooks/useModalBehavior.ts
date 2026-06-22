/**
 * useModalBehavior (Spec 13 — Regra 2)
 *
 * Centraliza o comportamento imperativo do `SarakModal`: trava de scroll do body,
 * reset do wizard ao reabrir, fechamento por ESC, entrada do focus trap e o handler
 * de `Tab` que mantém o foco preso. Extrair para um hook mantém o componente enxuto
 * (sem excesso de estado) e o comportamento testável.
 */

import { useEffect, useRef, useState } from 'react';

/** Seletor dos elementos focáveis para o focus trap. */
export const FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface ModalBehavior {
    dialogRef: React.MutableRefObject<HTMLDivElement | null>;
    stepIndex: number;
    setStepIndex: React.Dispatch<React.SetStateAction<number>>;
    handleTrap: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const useModalBehavior = (isOpen: boolean, onClose: () => void): ModalBehavior => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const [stepIndex, setStepIndex] = useState(0);

    // Trava a rolagem do body e reinicia o wizard enquanto aberto.
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = '';
            return;
        }
        document.body.style.overflow = 'hidden';
        setStepIndex(0);
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Fecha no ESC e foca o primeiro elemento focável ao abrir (entrada do trap).
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);

        const node = dialogRef.current;
        const first = node?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? node)?.focus();

        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Focus trap: `Tab` nunca escapa para trás do overlay (early returns, sem else-if).
    const handleTrap = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== 'Tab' || !dialogRef.current) return;
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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

    return { dialogRef, stepIndex, setStepIndex, handleTrap };
};
