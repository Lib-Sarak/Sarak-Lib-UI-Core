/**
 * SarakTooltip (Spec 13 — Regra 4)
 *
 * Balão flutuante que NÃO é cortado pelo `overflow:hidden` de containers ancestrais:
 * o conteúdo é renderizado num portal no `body` e posicionado em `position: fixed` a
 * partir do retângulo do gatilho. Inclui edge detection — se a posição preferida sair
 * da viewport, é espelhada (flip) e/ou deslocada para dentro.
 *
 * Zero Hardcode nas cores (tokens `--theme-*`).
 */

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface SarakTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    className?: string;
    /** Se true, desativa o tooltip */
    disabled?: boolean;
}

interface Coords {
    top: number;
    left: number;
    placement: TooltipPosition;
}

const GAP = 8;

/** Calcula a coordenada (fixed) com flip/clamp para manter o tooltip na viewport. */
const computeCoords = (
    trigger: DOMRect,
    tip: DOMRect,
    preferred: TooltipPosition,
): Coords => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits: Record<TooltipPosition, boolean> = {
        top: trigger.top - tip.height - GAP >= 0,
        bottom: trigger.bottom + tip.height + GAP <= vh,
        left: trigger.left - tip.width - GAP >= 0,
        right: trigger.right + tip.width + GAP <= vw,
    };
    // Espelha para o lado oposto se o preferido não couber.
    const opposite: Record<TooltipPosition, TooltipPosition> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
    };
    const placement = fits[preferred] ? preferred : opposite[preferred];

    let top = 0;
    let left = 0;
    switch (placement) {
        case 'top':
            top = trigger.top - tip.height - GAP;
            left = trigger.left + trigger.width / 2 - tip.width / 2;
            break;
        case 'bottom':
            top = trigger.bottom + GAP;
            left = trigger.left + trigger.width / 2 - tip.width / 2;
            break;
        case 'left':
            top = trigger.top + trigger.height / 2 - tip.height / 2;
            left = trigger.left - tip.width - GAP;
            break;
        case 'right':
            top = trigger.top + trigger.height / 2 - tip.height / 2;
            left = trigger.right + GAP;
            break;
    }

    // Clamp final dentro da viewport (edge detection nos dois eixos).
    left = Math.max(GAP, Math.min(left, vw - tip.width - GAP));
    top = Math.max(GAP, Math.min(top, vh - tip.height - GAP));
    return { top, left, placement };
};

export const SarakTooltip: React.FC<SarakTooltipProps> = ({
    children,
    content,
    position = 'top',
    delay = 300,
    className,
    disabled = false,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<Coords | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const tipRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback(() => {
        if (disabled) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    }, [disabled, delay]);

    const hide = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
        setCoords(null);
    }, []);

    useLayoutEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Mede gatilho + tooltip e posiciona (com edge detection) assim que fica visível.
    useLayoutEffect(() => {
        if (!isVisible || !triggerRef.current || !tipRef.current) return;
        if (typeof window === 'undefined') return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tipRect = tipRef.current.getBoundingClientRect();
        setCoords(computeCoords(triggerRect, tipRect, position));
    }, [isVisible, position, content]);

    const initial = {
        top: { opacity: 0, y: 5 },
        bottom: { opacity: 0, y: -5 },
        left: { opacity: 0, x: 5 },
        right: { opacity: 0, x: -5 },
    }[coords?.placement ?? position];

    const tooltipPortal =
        isVisible && typeof document !== 'undefined'
            ? createPortal(
                  <AnimatePresence>
                      <motion.div
                          ref={tipRef}
                          initial={initial}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          exit={initial}
                          transition={{ duration: 0.15 }}
                          role="tooltip"
                          data-sarak-tooltip="true"
                          className={twMerge(
                              'fixed z-[var(--z-index-tooltip, 9000)] px-2.5 py-1.5 text-xs font-bold whitespace-nowrap',
                              'bg-[var(--theme-surface)] text-[var(--color-theme-title,#ffffff)]',
                              'border border-[var(--theme-border)] shadow-lg rounded-md pointer-events-none',
                              className,
                          )}
                          style={{
                              // Antes da primeira medição, esconde fora da tela (sem flicker).
                              top: coords ? coords.top : -9999,
                              left: coords ? coords.left : -9999,
                              visibility: coords ? 'visible' : 'hidden',
                          }}
                      >
                          {content}
                      </motion.div>
                  </AnimatePresence>,
                  document.body,
              )
            : null;

    return (
        <div
            ref={triggerRef}
            className="relative inline-flex"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {tooltipPortal}
        </div>
    );
};
