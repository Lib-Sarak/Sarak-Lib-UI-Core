/**
 * useModalBehavior (Spec 13 — Regra 2)
 *
 * Centraliza o comportamento imperativo do `SarakModal`: trava de scroll do body e reset
 * do wizard ao reabrir. O modelo de foco (entrada do trap, ESC, `Tab` cíclico e
 * restauração do foco ao fechar) é delegado ao `useFocusTrap` (Spec 41), reusado por
 * todos os overlays. Extrair para hooks mantém o componente enxuto e testável.
 */

import { useEffect, useState } from 'react';
import { useFocusTrap, FOCUSABLE } from './useFocusTrap';

export { FOCUSABLE };

export interface ModalBehavior {
    dialogRef: React.MutableRefObject<HTMLDivElement | null>;
    stepIndex: number;
    setStepIndex: React.Dispatch<React.SetStateAction<number>>;
    handleTrap: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const useModalBehavior = (isOpen: boolean, onClose: () => void): ModalBehavior => {
    const { containerRef, handleTrap } = useFocusTrap(isOpen, onClose);
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

    return { dialogRef: containerRef, stepIndex, setStepIndex, handleTrap };
};
