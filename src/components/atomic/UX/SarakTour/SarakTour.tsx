/**
 * SarakTour — tour guiado: passos com alvo, destaque, próximo, voltar e pular. Foco preso e Esc fecham pelo
 * mesmo `useFocusTrap` dos overlays; entra na pilha de camadas (`useOverlayLayer`), então fica acima de uma
 * gaveta ou modal já aberto. O cartão se posiciona dentro do contêiner do portal e cabe em tela estreita.
 * Quem lembra que o usuário já viu o tour é o consumidor (`onClose` diz como terminou).
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../../core/Provider/components/SarakPortalScope';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { useFocusTrap } from '../../Modals/hooks/useFocusTrap';
import { OVERLAY_LAYER_STEP, useOverlayLayer } from '../../Modals/hooks/useOverlayLayer';
import { placeTourCard, type TourRect } from './tourPlacement';

const HIGHLIGHT_PADDING = 6;
const CARD_MAX_WIDTH = 360;
const GAP_SM = 'var(--sarak-layout-gap-sm, 8px)';

export interface SarakTourStep {
    id: string;
    /** Seletor CSS do alvo. Sem alvo, ou alvo que não existe na tela, o cartão aparece no centro sem destaque. */
    target?: string;
    title: string;
    content: React.ReactNode;
}

export type SarakTourCloseReason = 'done' | 'skip' | 'escape';

export interface SarakTourProps {
    steps: SarakTourStep[];
    open: boolean;
    /** Chamado ao terminar (`done`), pular (`skip`) ou apertar Esc (`escape`). Quem controla `open` é o consumidor. */
    onClose: (reason: SarakTourCloseReason) => void;
    /** Passo atual, no modo controlado. */
    step?: number;
    /** Chamado a cada troca de passo. */
    onStepChange?: (step: number) => void;
    /** Nome acessível do tour. */
    label?: string;
}

const toRect = (rect: DOMRect): TourRect => ({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

/** Retângulo do alvo na tela, reacompanhado em rolagem e redimensionamento. */
function useTargetRect(selector: string | undefined, active: boolean): TourRect | null {
    const [rect, setRect] = useState<TourRect | null>(null);
    const measure = useCallback(() => {
        const node = selector ? document.querySelector(selector) : null;
        setRect(node ? toRect(node.getBoundingClientRect()) : null);
    }, [selector]);
    useLayoutEffect(() => {
        if (!active) return undefined;
        if (selector) document.querySelector(selector)?.scrollIntoView?.({ block: 'center', inline: 'center' });
        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [active, selector, measure]);
    return rect;
}

export function SarakTour({ steps, open, onClose, step, onStepChange, label }: SarakTourProps): React.ReactElement | null {
    const text = useLibraryText();
    const [internalStep, setInternalStep] = useState(0);
    const index = Math.min(Math.max(step ?? internalStep, 0), Math.max(steps.length - 1, 0));
    const current = steps[index];
    const layer = useOverlayLayer(open);
    const { containerRef, handleTrap } = useFocusTrap(open, () => onClose('escape'), layer.isTop);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const target = useTargetRect(current?.target, open);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => { if (open && step === undefined) setInternalStep(0); }, [open, step]);

    useLayoutEffect(() => {
        const card = containerRef.current;
        const root = rootRef.current;
        if (!open || !card || !root) return;
        const cardBox = card.getBoundingClientRect();
        const rootBox = root.getBoundingClientRect();
        setPosition(placeTourCard(target, { width: cardBox.width, height: cardBox.height }, { top: 0, left: 0, width: rootBox.width, height: rootBox.height }));
    }, [open, target, index, containerRef]);

    if (!open || !current) return null;

    const goTo = (next: number): void => {
        if (step === undefined) setInternalStep(next);
        onStepChange?.(next);
    };
    const last = index === steps.length - 1;
    const zIndex = `calc(var(--z-index-modal, 2000) + ${layer.depth * OVERLAY_LAYER_STEP})`;

    return createPortal(
        <SarakPortalScope>
            <div ref={rootRef} data-sarak-tour="true" style={{ position: 'fixed', inset: 0, zIndex, pointerEvents: 'none' }}>
                <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'auto' }} />
                <div
                    data-sarak-tour-highlight={target ? 'true' : undefined}
                    style={target
                        ? { position: 'fixed', top: target.top - HIGHLIGHT_PADDING, left: target.left - HIGHLIGHT_PADDING, width: target.width + HIGHLIGHT_PADDING * 2, height: target.height + HIGHLIGHT_PADDING * 2, borderRadius: 'var(--sarak-card-radius, 10px)', boxShadow: '0 0 0 100vmax var(--sarak-modal-overlay-color, rgba(2, 4, 8, 0.6))', outline: 'var(--sarak-focus-width, 2px) solid var(--sarak-primary-color, currentColor)' }
                        : { position: 'fixed', inset: 0, background: 'var(--sarak-modal-overlay-color, rgba(2, 4, 8, 0.6))' }}
                />
                <div
                    ref={containerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={label ?? current.title}
                    tabIndex={-1}
                    onKeyDown={handleTrap}
                    style={{ position: 'fixed', top: position.top, left: position.left, width: `min(${CARD_MAX_WIDTH}px, calc(100% - var(--sarak-layout-gap-md, 16px) * 2))`, pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: GAP_SM, padding: 'var(--sarak-layout-gap-md, 16px)', background: 'var(--color-theme-card, Canvas)', color: 'var(--sarak-text-main, inherit)', border: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)', borderRadius: 'var(--sarak-card-radius, 10px)', boxShadow: 'var(--dynamic-shadow, none)' }}
                >
                    <div style={{ fontSize: 'var(--sarak-type-scale-caption, 12px)', color: 'var(--sarak-text-muted, inherit)' }}>{text('tourStepOf', { current: index + 1, total: steps.length })}</div>
                    <h2 style={{ margin: 0, fontSize: 'var(--sarak-type-scale-xl, 20px)' }}>{current.title}</h2>
                    <div>{current.content}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: GAP_SM, justifyContent: 'flex-end' }}>
                        <SarakButton type="button" onClick={() => onClose('skip')}>{text('tourSkip')}</SarakButton>
                        <SarakButton type="button" disabled={index === 0} onClick={() => goTo(index - 1)}>{text('tourBack')}</SarakButton>
                        <SarakButton type="button" onClick={() => (last ? onClose('done') : goTo(index + 1))}>{last ? text('tourDone') : text('tourNext')}</SarakButton>
                    </div>
                </div>
            </div>
        </SarakPortalScope>,
        document.body,
    );
}

export default SarakTour;
