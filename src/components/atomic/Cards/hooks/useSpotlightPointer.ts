import { useEffect, useRef, type RefObject } from 'react';
import type { SarakThemePayload } from '../../../../core/Provider/types';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';

export interface CardSpotlight {
    /** Vai na raiz do cartão: é nela que as duas variáveis do ponto são gravadas. */
    ref: RefObject<HTMLDivElement>;
    /** Valor de `data-spotlight` da raiz: `'1'` com o token acima de zero (liga a regra CSS), `'0'` sem. */
    dataSpotlight: '1' | '0';
}

/**
 * O spotlight do cartão segue o cursor: grava a posição do ponteiro, relativa ao cartão, em
 * `--sarak-spot-x`/`--sarak-spot-y` na própria raiz (as que a regra `.spotlight-effect` lê; sem elas o gradiente
 * cai no centro) — num `requestAnimationFrame`, sem `setState`
 * e sem re-render. Só vale com ponteiro fino e `cardSpotlightOpacity` acima de zero: token 0,
 * movimento reduzido ou toque não registram listener nenhum, e o gradiente fica no centro.
 */
export const useSpotlightPointer = (design: SarakThemePayload | undefined): CardSpotlight => {
    const ref = useRef<HTMLDivElement>(null);
    const opacity = Number(design?.cardSpotlightOpacity);
    const hasSpotlight = opacity > 0;
    const follows = hasSpotlight && design?.reducedMotion !== true;

    useEffect(() => {
        const card = ref.current;
        if (!follows || !card || !window.matchMedia?.(FINE_POINTER).matches) return undefined;

        let frame = 0;
        let point = { x: 0, y: 0 };
        const paint = () => {
            frame = 0;
            const box = card.getBoundingClientRect();
            card.style.setProperty('--sarak-spot-x', `${point.x - box.left}px`);
            card.style.setProperty('--sarak-spot-y', `${point.y - box.top}px`);
        };
        const onMove = (event: PointerEvent) => {
            if (event.pointerType === 'touch') return;
            point = { x: event.clientX, y: event.clientY };
            if (!frame) frame = window.requestAnimationFrame(paint);
        };
        const onLeave = () => {
            if (frame) window.cancelAnimationFrame(frame);
            frame = 0;
            card.style.removeProperty('--sarak-spot-x');
            card.style.removeProperty('--sarak-spot-y');
        };

        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerleave', onLeave);
        return () => {
            card.removeEventListener('pointermove', onMove);
            card.removeEventListener('pointerleave', onLeave);
            onLeave();
        };
    }, [follows]);

    return { ref, dataSpotlight: hasSpotlight ? '1' : '0' };
};
