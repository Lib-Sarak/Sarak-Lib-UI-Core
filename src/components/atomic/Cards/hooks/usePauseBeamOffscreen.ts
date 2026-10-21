import { useEffect, type RefObject } from 'react';

const PAUSED_ATTRIBUTE = 'data-border-beam-paused';

/**
 * Pausa o giro do traço luminoso (`.border-beam-effect`) enquanto o cartão está fora da tela: marca a raiz com
 * `data-border-beam-paused="1"` (a regra CSS põe a animação em pausa) e a desmarca ao voltar. Com o traço apagado
 * ou sem `IntersectionObserver` não observa nada. Sem `setState`: o atributo é gravado direto na raiz.
 */
export const usePauseBeamOffscreen = (ref: RefObject<HTMLElement | null>, beamOn: boolean): void => {
    useEffect(() => {
        const card = ref.current;
        if (!beamOn || !card || typeof IntersectionObserver === 'undefined') return undefined;

        const observer = new IntersectionObserver((entries) => {
            const visible = entries[entries.length - 1]?.isIntersecting ?? true;
            if (visible) card.removeAttribute(PAUSED_ATTRIBUTE);
            else card.setAttribute(PAUSED_ATTRIBUTE, '1');
        });
        observer.observe(card);
        return () => {
            observer.disconnect();
            card.removeAttribute(PAUSED_ATTRIBUTE);
        };
    }, [ref, beamOn]);
};
